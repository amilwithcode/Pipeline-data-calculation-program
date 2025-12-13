import os
import json
import hashlib
from urllib.request import Request, urlopen
from urllib.parse import urlencode, quote

def _load_env():
    here = os.path.dirname(os.path.abspath(__file__))
    root = os.path.dirname(here)
    candidates = [
        os.path.join(root, ".env"),
        os.path.join(root, ".env.local"),
        os.path.join(root, ".env.development"),
        os.path.join(root, "web-app", ".env"),
        os.path.join(root, "web-app", ".env.local"),
        os.path.join(here, ".env"),
    ]
    for p in candidates:
        if os.path.exists(p):
            try:
                with open(p, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if not line or line.startswith("#"):
                            continue
                        if "=" in line:
                            k, v = line.split("=", 1)
                            k = k.strip()
                            v = v.strip().strip('"').strip("'")
                            os.environ.setdefault(k, v)
            except Exception:
                pass

_load_env()

SUPABASE_URL = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL") or ""
SUPABASE_KEY = os.environ.get("SUPABASE_KEY") or os.environ.get("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY") or ""

sb = {"url": SUPABASE_URL, "key": SUPABASE_KEY} if SUPABASE_URL and SUPABASE_KEY else None
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
USERS_LOCAL = os.path.join(BASE_DIR, "users_local.json")
ORDERS_LOCAL = os.path.join(BASE_DIR, "orders_local.json")
QUEUE_FILE = os.path.join(BASE_DIR, "offline_queue.json")

def _headers():
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

def _rest(table: str, method: str = "GET", params: dict | None = None, body: dict | None = None):
    if not sb:
        if method == "GET":
            return []
        return False
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    q = params or {}
    if method == "GET":
        q.setdefault("select", "*")
    if q:
        url = f"{url}?{urlencode(q, doseq=True)}"
    data = None
    if body is not None:
        data = json.dumps(body).encode("utf-8")
    req = Request(url, data=data, method=method)
    for k,v in _headers().items():
        req.add_header(k, v)
    if method in ("POST","PATCH"):
        req.add_header("Prefer", "return=representation")
    try:
        with urlopen(req, timeout=10) as res:
            out = res.read().decode("utf-8")
            try:
                return json.loads(out)
            except Exception:
                return out
    except Exception:
        if method == "GET":
            return []
        return False

def _read_json(path: str) -> dict:
    try:
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
    except Exception:
        pass
    return {}

def _write_json(path: str, data: dict) -> bool:
    try:
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        return True
    except Exception:
        return False

def _queue_append(key: str, row: dict) -> bool:
    q = _read_json(QUEUE_FILE) or {}
    arr = list(q.get(key) or [])
    arr.append(row)
    q[key] = arr
    return _write_json(QUEUE_FILE, q)

def _products_fetch() -> dict:
    items = _rest("pipeline_products", "GET") or []
    out = {}
    for row in items:
        pid = str(row.get("id") or row.get("pid") or "")
        if not pid:
            continue
        out[pid] = {
            "pipeline_name": row.get("pipeline_name"),
            "pipeline_stock": row.get("pipeline_stock"),
        }
    return out

def _product_upsert(pid: str, name: str, stock: int):
    payload = {"id": pid, "pipeline_name": name, "pipeline_stock": stock}
    ok = bool(_rest("pipeline_products", "POST", params={"on_conflict": "id"}, body=payload))
    if not ok:
        _queue_append("products", payload)
    return True if ok else _queue_append("products", payload)

def _product_delete(pid: str):
    ok = bool(_rest("pipeline_products", "DELETE", params={"id": f"eq.{quote(str(pid))}"}))
    if not ok:
        _queue_append("products_delete", {"id": pid})
    return True if ok else _queue_append("products_delete", {"id": pid})

def _results_fetch() -> list:
    return list(_rest("pipeline_results", "GET") or [])

def _result_insert(payload: dict):
    return bool(_rest("pipeline_results", "POST", body=payload))

def _suppliers_fetch() -> list:
    rows = list(_rest("suppliers", "GET") or [])
    if rows:
        return rows
    q = _read_json(QUEUE_FILE)
    return q.get("suppliers", [])

def _supplier_insert(name: str):
    if not name:
        return False
    ok = bool(_rest("suppliers", "POST", params={"on_conflict": "name"}, body={"name": name}))
    if not ok:
        q = _read_json(QUEUE_FILE)
        arr = list(q.get("suppliers") or [])
        arr.append({"name": name})
        q["suppliers"] = arr
        _write_json(QUEUE_FILE, q)
    return True

def _supplier_get_or_create(name: str):
    rows = _rest("suppliers", "GET", params={"name": f"eq.{quote(name)}"}) or []
    if rows:
        return rows[0]
    _supplier_insert(name)
    rows = _rest("suppliers", "GET", params={"name": f"eq.{quote(name)}"}) or []
    return rows[0] if rows else None

# Dashboard & Admin data fetch helpers
def _pipeline_fetch() -> list:
    return list(_rest("pipeline_stages", "GET") or [])

def _pipeline_upsert(stage: dict):
    return bool(_rest("pipeline_stages", "POST", params={"on_conflict": "id"}, body=stage))

def _shipments_fetch() -> list:
    return list(_rest("shipments", "GET") or [])

def _shipment_insert(payload: dict):
    return bool(_rest("shipments", "POST", body=payload))

def _quality_fetch() -> dict:
    tests = list(_rest("quality_tests", "GET") or [])
    totals = {
        "total": sum(int(t.get("totalTests") or 0) for t in tests),
        "passed": sum(int(t.get("passed") or 0) for t in tests),
        "failed": sum(int(t.get("failed") or 0) for t in tests),
    }
    return {"tests": tests, "totals": totals}

def _quality_upsert(test: dict):
    return bool(_rest("quality_tests", "POST", params={"on_conflict": "id"}, body=test))

def _production_fetch() -> dict:
    items = list(_rest("production_stats", "GET") or [])
    return {"items": items}

def _production_insert(row: dict):
    return bool(_rest("production_stats", "POST", body=row))

def _risk_fetch() -> dict:
    metrics = list(_rest("risk_metrics", "GET") or [])
    if not metrics:
        metrics = [
            {"id": "supply", "name": "Supply Risk", "score": 0},
            {"id": "quality", "name": "Quality Risk", "score": 0},
            {"id": "delivery", "name": "Delivery Risk", "score": 0},
        ]
    overall = 0
    if metrics:
        overall = sum(float(m.get("score") or 0) for m in metrics) / len(metrics)
    return {"overallScore": round(overall, 2), "metrics": metrics}

def _orders_fetch(supplier_id: str | None = None, supplier_name: str | None = None) -> list:
    params = {}
    if supplier_id:
        params["supplier_id"] = f"eq.{quote(str(supplier_id))}"
    elif supplier_name:
        params["supplier_name"] = f"eq.{quote(supplier_name)}"
    rows = list(_rest("orders", "GET", params=params) or [])
    if rows:
        return rows
    data = _read_json(ORDERS_LOCAL)
    arr = list(data.get("orders") or [])
    if supplier_id:
        arr = [o for o in arr if str(o.get("supplier_id")) == str(supplier_id)]
    elif supplier_name:
        arr = [o for o in arr if str(o.get("supplier_name")) == str(supplier_name)]
    return arr

def _order_insert(payload: dict):
    ok = bool(_rest("orders", "POST", body=payload))
    if not ok:
        data = _read_json(ORDERS_LOCAL)
        arr = list(data.get("orders") or [])
        payload.setdefault("id", (arr[-1]["id"] + 1) if arr else 1)
        arr.append(payload)
        _write_json(ORDERS_LOCAL, {"orders": arr})
    return True

def _admin_confirmations_fetch() -> list:
    return list(_rest("confirmations", "GET") or [])

def _users_fetch() -> list:
    rows = list(_rest("users", "GET") or [])
    if rows:
        return rows
    data = _read_json(USERS_LOCAL)
    return data.get("users", [])

def _hash_pw(pw: str) -> str:
    return hashlib.sha256((pw or "").encode("utf-8")).hexdigest()

def _user_register(email: str, password: str, role: str):
    if not email or not password:
        return None
    payload = {"email": email, "password_hash": _hash_pw(password), "role": role or "supplier"}
    res = _rest("users", "POST", params={"on_conflict": "email"}, body=payload)
    if isinstance(res, list) and res:
        return res[0]
    # Fallback to local file
    data = _read_json(USERS_LOCAL)
    arr = list(data.get("users") or [])
    exists = next((u for u in arr if str(u.get("email")) == email), None)
    if exists:
        return exists
    newu = {"id": (arr[-1]["id"] + 1) if arr else 1, **payload}
    arr.append(newu)
    _write_json(USERS_LOCAL, {"users": arr})
    return newu

def _user_login(email: str, password: str):
    if not email or not password:
        return None
    rows = _rest("users", "GET", params={"email": f"eq.{quote(email)}", "select": "email,password_hash,role,full_name"}) or []
    if not rows:
        data = _read_json(USERS_LOCAL)
        arr = list(data.get("users") or [])
        cand = next((u for u in arr if str(u.get("email")) == email), None)
        if not cand:
            return None
        return cand if cand.get("password_hash") == _hash_pw(password) else None
    ok = rows[0].get("password_hash") == _hash_pw(password)
    return rows[0] if ok else None

def _user_login_admin(email: str, password: str):
    u = _user_login(email, password)
    if u and (u.get("role") == "admin"):
        return u
    return None

def _queue_load() -> dict:
    return {"requested_pipes": []}

def _queue_sync() -> bool:
    return True

def _migrate_json_to_supabase() -> bool:
    ok = True
    try:
        with open(os.path.join(os.path.dirname(__file__), "pipeline_data.json"), "r", encoding="utf-8") as f:
            data = json.load(f)
        for pid, v in (data.get("pipeline_products", {}).get("ID", {}) or {}).items():
            ok = _product_upsert(pid, v.get("pipeline_name"), int(v.get("pipeline_stock", 0) or 0)) and ok
    except Exception:
        pass
    try:
        with open(os.path.join(os.path.dirname(__file__), "pipeline_data_result.json"), "r", encoding="utf-8") as f:
            r = json.load(f)
        for row in r.get("results", []) or []:
            ok = _result_insert(row) and ok
    except Exception:
        pass
    return ok

