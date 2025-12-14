import json
import os
from http.server import HTTPServer, SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs
from io import BytesIO
import app_backend as app

ROOT = os.path.dirname(os.path.abspath(__file__))
WEB_DIR = os.path.join(ROOT, "web")
ALLOWED_ORIGIN = os.environ.get("FRONTEND_ORIGIN", "http://localhost:3000")

class Handler(SimpleHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        origin = self.headers.get("Origin") or ALLOWED_ORIGIN
        allow = ALLOWED_ORIGIN if origin == ALLOWED_ORIGIN else ALLOWED_ORIGIN
        self.send_header("Access-Control-Allow-Origin", allow)
        self.send_header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        if self.path == "/":
            return self._html("""
                <!doctype html>
                <html lang='az'>
                <head><meta charset='utf-8'><title>API Server</title></head>
                <body>
                <h3>Python API server running</h3>
                <p>Frontend: <a href='http://localhost:3000/'>http://localhost:3000/</a></p>
                <p>Health: <a href='/api/alerts'>/api/alerts</a></p>
                </body>
                </html>
            """)
        if self.path.startswith("/@vite/client") or self.path.startswith("/__vite_ping"):
            return self._js("/* vite dev client noop */")
        if self.path == "/favicon.ico":
            return self._js("")
        if self.path.startswith("/api/dashboard"):
            supabase_ok = bool(app.sb)
            products = app._products_fetch()
            prod_list = []
            low_stock = 0
            for k,v in products.items():
                stock = int(v.get("pipeline_stock", 0) or 0)
                prod_list.append({"id": k, "name": v.get("pipeline_name"), "stock": stock})
                if stock < 5:
                    low_stock += 1
            results = app._results_fetch()
            suppliers = app._suppliers_fetch()
            queue = app._queue_load()
            alerts = []
            if not supabase_ok:
                alerts.append({"level": "critical", "message": "Supabase konfiqurasiya olunmayıb"})
            if low_stock > 0:
                alerts.append({"level": "warning", "message": f"Aşağı stok: {low_stock} məhsul"})
            if len(queue.get("requested_pipes", [])) > 0:
                alerts.append({"level": "info", "message": "Queue-də göndərilmə gözləyən nəticələr var"})
            risks = {
                "supply_chain": 28,
                "quality": 15,
                "delivery": 42,
                "production": 22
            }
            payload = {
                "supabase": supabase_ok,
                "alerts": alerts,
                "risks": risks,
                "inventory": {
                    "total_products": len(prod_list),
                    "low_stock": low_stock
                },
                "suppliers_count": len(suppliers),
                "results_count": len(results),
                "products": prod_list
            }
            return self._json(payload)
        if self.path.startswith("/api/products"):
            items = app._products_fetch()
            data = []
            for k,v in items.items():
                data.append({
                    "id": k,
                    "pipeline_name": v.get("pipeline_name"),
                    "pipeline_stock": v.get("pipeline_stock"),
                    "name": v.get("pipeline_name"),
                    "stock": int(v.get("pipeline_stock", 0) or 0),
                })
            self._json(data)
            return
        if self.path.startswith("/api/alerts"):
            supabase_ok = bool(app.sb)
            products = app._products_fetch()
            low_stock = sum(1 for v in products.values() if int(v.get("pipeline_stock", 0) or 0) < 5)
            queue = app._queue_load()
            alerts = []
            if not supabase_ok:
                alerts.append({"level": "critical", "message": "Supabase konfiqurasiya olunmayıb"})
            if low_stock > 0:
                alerts.append({"level": "warning", "message": f"Aşağı stok: {low_stock} məhsul"})
            if len(queue.get("requested_pipes", [])) > 0:
                alerts.append({"level": "info", "message": "Queue-də göndərilmə gözləyir"})
            self._json(alerts)
            return
        if self.path.startswith("/api/risks"):
            self._json({"supply_chain": 28, "quality": 15, "delivery": 42, "production": 22})
            return
        if self.path.startswith("/api/inventory"):
            products = app._products_fetch()
            data = [{"id": k, "name": v.get("pipeline_name"), "stock": int(v.get("pipeline_stock", 0) or 0)} for k,v in products.items()]
            self._json({"total": len(data), "low_stock": sum(1 for x in data if x["stock"] < 5), "items": data})
            return
        if self.path.startswith("/api/results"):
            self._json(app._results_fetch())
            return
        if self.path.startswith("/api/suppliers"):
            self._json(app._suppliers_fetch())
            return
        if self.path.startswith("/api/users"):
            rows = app._users_fetch()
            if not rows:
                data = app._read_json(app.USERS_LOCAL)
                rows = data.get("users", [])
            self._json(rows)
            return
        if self.path.startswith("/api/confirmations"):
            self._json(app._admin_confirmations_fetch())
            return
        if self.path.startswith("/api/pipeline"):
            self._json({"stages": app._pipeline_fetch()})
            return
        if self.path.startswith("/api/shipments"):
            self._json({"shipments": app._shipments_fetch()})
            return
        if self.path.startswith("/api/quality"):
            self._json(app._quality_fetch())
            return
        if self.path.startswith("/api/production"):
            self._json(app._production_fetch())
            return
        if self.path.startswith("/api/risk"):
            self._json(app._risk_fetch())
            return
        if self.path.startswith("/api/orders"):
            q = parse_qs(urlparse(self.path).query)
            sid = (q.get("supplier_id") or [None])[0]
            sname = (q.get("supplier") or [None])[0]
            self._json({"orders": app._orders_fetch(sid, sname)})
            return
        if self.path.startswith("/web/"):
            return SimpleHTTPRequestHandler.do_GET(self)
        return SimpleHTTPRequestHandler.do_GET(self)

    def do_POST(self):
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length) if length > 0 else b"{}"
        try:
            payload = json.loads(body.decode("utf-8"))
        except Exception:
            payload = {}
        if self.path.startswith("/api/login"):
            role = payload.get("role")
            email = payload.get("email")
            password = payload.get("password")
            company = payload.get("company_name")
            if role == "admin":
                u = app._user_login_admin(email, password)
            else:
                u = app._user_login(email, password)
                if u and company:
                    app._supplier_get_or_create(company)
            if not u:
                data = app._read_json(app.USERS_LOCAL)
                arr = list(data.get("users") or [])
                cand = next((x for x in arr if str(x.get("email")) == str(email)), None)
                if cand and cand.get("password_hash") == app._hash_pw(password):
                    u = cand
            ok = bool(u)
            self._json({"ok": ok, "user": u or {}})
            return
        if self.path.startswith("/api/register"):
            role = payload.get("role")
            email = payload.get("email")
            password = payload.get("password")
            company = payload.get("company_name")
            u = app._user_register(email, password, role)
            if not u and email and password:
                data = app._read_json(app.USERS_LOCAL)
                arr = list(data.get("users") or [])
                exists = next((x for x in arr if str(x.get("email")) == str(email)), None)
                if not exists:
                    arr.append({"id": (arr[-1]["id"] + 1) if arr else 1, "email": email, "password_hash": app._hash_pw(password), "role": role})
                    app._write_json(app.USERS_LOCAL, {"users": arr})
                    u = arr[-1]
            if role == "supplier" and u and company:
                app._supplier_get_or_create(company)
            self._json({"ok": bool(u), "user": u or {}})
            return
        if self.path.startswith("/api/products"):
            app._product_upsert(payload.get("id"), payload.get("pipeline_name"), int(payload.get("pipeline_stock", 0)))
            self._json({"ok": True})
            return
        if self.path.startswith("/api/pipeline"):
            self._json({"ok": bool(app._pipeline_upsert(payload))})
            return
        if self.path.startswith("/api/shipments"):
            self._json({"ok": bool(app._shipment_insert(payload))})
            return
        if self.path.startswith("/api/quality"):
            self._json({"ok": bool(app._quality_upsert(payload))})
            return
        if self.path.startswith("/api/production"):
            self._json({"ok": bool(app._production_insert(payload))})
            return
        if self.path.startswith("/api/orders"):
            self._json({"ok": bool(app._order_insert(payload))})
            return
        if self.path.startswith("/api/results"):
            app._result_insert(payload)
            self._json({"ok": True})
            return
        if self.path.startswith("/api/suppliers"):
            name = payload.get("name")
            app._supplier_insert(name)
            self._json({"ok": True})
            return
        if self.path.startswith("/api/queue/sync"):
            self._json({"ok": app._queue_sync()})
            return
        if self.path.startswith("/api/json/migrate"):
            self._json({"ok": app._migrate_json_to_supabase()})
            return
        self._json({"ok": False})

    def do_DELETE(self):
        if self.path.startswith("/api/products/"):
            pid = self.path.split("/")[-1]
            app._product_delete(pid)
            self._json({"ok": True})
            return
        if self.path.startswith("/api/suppliers/"):
            sid = int(self.path.split("/")[-1])
            app._supplier_delete_by_id(sid)
            self._json({"ok": True})
            return
        self._json({"ok": False})

    def _json(self, obj):
        data = json.dumps(obj).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        origin = self.headers.get("Origin") or ALLOWED_ORIGIN
        allow = ALLOWED_ORIGIN if origin == ALLOWED_ORIGIN else ALLOWED_ORIGIN
        self.send_header("Access-Control-Allow-Origin", allow)
        self.send_header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(data)

    def _js(self, code:str):
        data = code.encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "text/javascript")
        self.send_header("Content-Length", str(len(data)))
        origin = self.headers.get("Origin") or ALLOWED_ORIGIN
        allow = ALLOWED_ORIGIN if origin == ALLOWED_ORIGIN else ALLOWED_ORIGIN
        self.send_header("Access-Control-Allow-Origin", allow)
        self.send_header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(data)

    def _html(self, code:str):
        data = code.encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        origin = self.headers.get("Origin") or ALLOWED_ORIGIN
        allow = ALLOWED_ORIGIN if origin == ALLOWED_ORIGIN else ALLOWED_ORIGIN
        self.send_header("Access-Control-Allow-Origin", allow)
        self.send_header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(data)

    def translate_path(self, path):
        if path == "/":
            return os.path.join(WEB_DIR, "index.html")
        if path.startswith("/web/"):
            return os.path.join(ROOT, path[1:])
        if path.startswith("/"):
            p = path[1:]
            candidate = os.path.join(WEB_DIR, p)
            if os.path.exists(candidate):
                return candidate
        return SimpleHTTPRequestHandler.translate_path(self, path)

def run():
    os.chdir(ROOT)
    srv = ThreadingHTTPServer(("127.0.0.1", 8000), Handler)
    try:
        import webbrowser
        webbrowser.open("http://127.0.0.1:8000/")
    except Exception:
        pass
    srv.serve_forever()

if __name__ == "__main__":
    run()
