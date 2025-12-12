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
        return True
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
    return bool(_rest("pipeline_products", "POST", params={"on_conflict": "id"}, body=payload))

def _product_delete(pid: str):
    return bool(_rest("pipeline_products", "DELETE", params={"id": f"eq.{quote(str(pid))}"}))

def _results_fetch() -> list:
    return list(_rest("pipeline_results", "GET") or [])

def _result_insert(payload: dict):
    return bool(_rest("pipeline_results", "POST", body=payload))

def _suppliers_fetch() -> list:
    return list(_rest("suppliers", "GET") or [])

def _supplier_insert(name: str):
    if not name:
        return False
    return bool(_rest("suppliers", "POST", params={"on_conflict": "name"}, body={"name": name}))

def _supplier_get_or_create(name: str):
    rows = _rest("suppliers", "GET", params={"name": f"eq.{quote(name)}"}) or []
    if rows:
        return rows[0]
    _supplier_insert(name)
    rows = _rest("suppliers", "GET", params={"name": f"eq.{quote(name)}"}) or []
    return rows[0] if rows else None

def _admin_confirmations_fetch() -> list:
    return list(_rest("confirmations", "GET") or [])

def _hash_pw(pw: str) -> str:
    return hashlib.sha256((pw or "").encode("utf-8")).hexdigest()

def _user_register(email: str, password: str, role: str):
    if not email or not password:
        return None
    payload = {"email": email, "password_hash": _hash_pw(password), "role": role or "supplier"}
    res = _rest("users", "POST", params={"on_conflict": "email"}, body=payload)
    return res[0] if isinstance(res, list) and res else payload

def _user_login(email: str, password: str):
    if not email or not password:
        return None
    rows = _rest("users", "GET", params={"email": f"eq.{quote(email)}", "select": "email,password_hash,role"}) or []
    if not rows:
        return None
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

