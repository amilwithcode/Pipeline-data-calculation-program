"use client";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

type DashboardData = {
  alerts: { level: string; message: string }[];
  risks: { supply_chain: number; quality: number; delivery: number; production: number };
  inventory: { total_products: number; low_stock: number };
  products: { id: string; name: string; stock: number }[];
};

export default function Home() {
  const [view, setView] = useState<"dashboard" | "alerts" | "inventory" | "supplier" | "admin" | "auth">("auth");
  const [mounted, setMounted] = useState(false);
  const [dash, setDash] = useState<DashboardData | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [confirmations, setConfirmations] = useState<any[]>([]);
  const [role, setRole] = useState<string | null>(null);
  const { toast } = useToast();

  function emailValid(e:string){
    if(!e||!e.includes("@"))return false;const parts=e.split("@");if(parts.length!==2)return false;return parts[0].length>0&&parts[1].includes(".");
  }

  async function loadDashboard() {
    try {
      const r = await fetch("/api/dashboard");
      const d = (await r.json()) as DashboardData;
      setDash(d);
    } catch (e) {
      toast({ title: "Backend əlçatan deyil", description: "http://127.0.0.1:8000" });
      setDash({
        alerts: [{ level: "critical", message: "Backend əlçatan deyil" }],
        risks: { supply_chain: 0, quality: 0, delivery: 0, production: 0 },
        inventory: { total_products: 0, low_stock: 0 },
        products: [],
      });
    }
  }

  async function loadSupplier() {
    try {
      const pr = await fetch("/api/products").then((r) => r.json());
      setProducts(pr);
    } catch {
      toast({ title: "Backend əlçatan deyil", description: "Məhsullar yüklənmədi" });
      setProducts([]);
    }
    try {
      const rr = await fetch("/api/results").then((r) => r.json());
      setResults(rr);
    } catch {
      toast({ title: "Backend əlçatan deyil", description: "Nəticələr yüklənmədi" });
      setResults([]);
    }
  }

  async function loadAdmin() {
    try {
      const s = await fetch("/api/suppliers").then((r) => r.json());
      setSuppliers(s);
    } catch {
      toast({ title: "Backend əlçatan deyil", description: "Təchizatçılar yüklənmədi" });
      setSuppliers([]);
    }
    try {
      const c = await fetch("/api/confirmations").then((r) => r.json());
      setConfirmations(c);
    } catch {
      toast({ title: "Backend əlçatan deyil", description: "Təsdiqlər yüklənmədi" });
      setConfirmations([]);
    }
  }

  useEffect(() => {
    setMounted(true);
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem('role') : null;
    if (stored) {
      setRole(stored);
      setView(stored === 'admin' ? 'admin' : 'supplier');
    } else {
      setView('auth');
    }
    loadDashboard();
    const t = setInterval(loadDashboard, 15000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (view === "supplier") loadSupplier();
    if (view === "admin") loadAdmin();
  }, [view]);

  if (!mounted) {
    return <div className="min-h-screen p-4" suppressHydrationWarning>Yüklənir...</div>;
  }
  return (
    <div className="min-h-screen p-4" suppressHydrationWarning>
      <header className="flex gap-2 mb-4">
        <button className="px-3 py-2 border rounded" onClick={() => setView("dashboard")}>Panel</button>
        <button className="px-3 py-2 border rounded" onClick={() => setView("alerts")}>Alertlər</button>
        <button className="px-3 py-2 border rounded" onClick={() => setView("inventory")}>Inventar</button>
        {role !== 'admin' && <button className="px-3 py-2 border rounded" onClick={() => setView("supplier")}>Təchizatçı</button>}
        {role === 'admin' && <button className="px-3 py-2 border rounded" onClick={() => setView("admin")}>Admin</button>}
        {!role && <button className="px-3 py-2 border rounded" onClick={() => setView("auth")}>Giriş/Qeydiyyat</button>}
      </header>

      {view === "dashboard" && (
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="border rounded p-3">
            <h3 className="font-semibold mb-2">Alertlər</h3>
            <ul>
              {dash?.alerts.map((a, i) => (
                <li key={i} className={
                  a.level === "critical" ? "text-red-700" : a.level === "warning" ? "text-amber-700" : "text-sky-600"
                }>{a.message}</li>
              ))}
            </ul>
          </div>
          <div className="border rounded p-3">
            <h3 className="font-semibold mb-2">Risklər</h3>
            <div className="mb-1">Təchizat zənciri<div className="h-2 bg-zinc-200 rounded"><div className="h-2 bg-blue-600 rounded" style={{width: (dash?.risks.supply_chain||0)+"%"}}/></div></div>
            <div className="mb-1">Keyfiyyət<div className="h-2 bg-zinc-200 rounded"><div className="h-2 bg-blue-600 rounded" style={{width: (dash?.risks.quality||0)+"%"}}/></div></div>
            <div className="mb-1">Çatdırılma<div className="h-2 bg-zinc-200 rounded"><div className="h-2 bg-blue-600 rounded" style={{width: (dash?.risks.delivery||0)+"%"}}/></div></div>
            <div className="mb-1">İstehsal<div className="h-2 bg-zinc-200 rounded"><div className="h-2 bg-blue-600 rounded" style={{width: (dash?.risks.production||0)+"%"}}/></div></div>
          </div>
          <div className="border rounded p-3 sm:col-span-2">
            <h3 className="font-semibold mb-2">Inventar</h3>
            <div className="mb-2">Məhsullar: {dash?.inventory.total_products ?? 0} • Aşağı stok: {dash?.inventory.low_stock ?? 0}</div>
            <table className="w-full border">
              <thead>
                <tr className="bg-zinc-100"><th className="p-2">ID</th><th className="p-2">Ad</th><th className="p-2">Stok</th></tr>
              </thead>
              <tbody>
                {dash?.products.map(p => (
                  <tr key={p.id}><td className="p-2 border-t">{p.id}</td><td className="p-2 border-t">{p.name}</td><td className="p-2 border-t">{p.stock}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {view === "alerts" && (
        <div className="border rounded p-3">
          <h3 className="font-semibold mb-2">Alertlər</h3>
          <ul>
            {dash?.alerts.map((a, i) => (
              <li key={i} className={
                a.level === "critical" ? "text-red-700" : a.level === "warning" ? "text-amber-700" : "text-sky-600"
              }>{a.message}</li>
            ))}
          </ul>
        </div>
      )}

      {view === "inventory" && (
        <div className="border rounded p-3">
          <h3 className="font-semibold mb-2">Inventar</h3>
          <div className="mb-2">Toplam: {dash?.inventory.total_products ?? 0} • Aşağı stok: {dash?.inventory.low_stock ?? 0}</div>
          <table className="w-full border">
            <thead>
              <tr className="bg-zinc-100"><th className="p-2">ID</th><th className="p-2">Ad</th><th className="p-2">Stok</th></tr>
            </thead>
            <tbody>
              {dash?.products.map(p => (
                <tr key={p.id}><td className="p-2 border-t">{p.id}</td><td className="p-2 border-t">{p.name}</td><td className="p-2 border-t">{p.stock}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {view === "supplier" && (
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="border rounded p-3">
            <h3 className="font-semibold mb-2">Məhsul əlavə et</h3>
            <SupplierAdd onAdded={loadSupplier} />
            <h4 className="font-semibold mt-4 mb-2">Mövcud məhsullar</h4>
            <table className="w-full border">
              <thead>
                <tr className="bg-zinc-100"><th className="p-2">ID</th><th className="p-2">Ad</th><th className="p-2">Stok</th><th className="p-2">Əməliyyat</th></tr>
              </thead>
              <tbody>
                {products.map((x: any) => (
                  <tr key={x.id}>
                    <td className="p-2 border-t">{x.id}</td>
                    <td className="p-2 border-t">{x.pipeline_name}</td>
                    <td className="p-2 border-t">{x.pipeline_stock}</td>
                    <td className="p-2 border-t"><button className="px-2 py-1 border rounded" onClick={async()=>{await fetch("/api/products/"+x.id,{method:"DELETE"}); loadSupplier();}}>Sil</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border rounded p-3">
            <h3 className="font-semibold mb-2">Hesablama</h3>
            <SupplierCalc onCalculated={loadSupplier} />
            <h4 className="font-semibold mt-4 mb-2">Nəticələr</h4>
            <table className="w-full border">
              <thead>
                <tr className="bg-zinc-100"><th className="p-2">Diametr</th><th className="p-2">Qalınlıq</th><th className="p-2">Uzunluq</th><th className="p-2">Cəmi Çəki</th></tr>
              </thead>
              <tbody>
                {results.map((x: any, i: number) => (
                  <tr key={i}><td className="p-2 border-t">{x.diameter}</td><td className="p-2 border-t">{x.thickness}</td><td className="p-2 border-t">{x.project_length}</td><td className="p-2 border-t">{x.total_weight}</td></tr>
                ))}
              </tbody>
            </table>
            <div className="mt-3"><button className="px-3 py-2 border rounded" onClick={async()=>{await fetch("/api/queue/sync",{method:"POST"}); loadSupplier();}}>Queue sync</button></div>
          </div>
        </div>
      )}

      {view === "admin" && (
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="border rounded p-3">
            <h3 className="font-semibold mb-2">Təchizatçılar</h3>
            <table className="w-full border">
              <thead>
                <tr className="bg-zinc-100"><th className="p-2">ID</th><th className="p-2">Ad</th></tr>
              </thead>
              <tbody>
                {suppliers.map((x: any) => (
                  <tr key={x.id}><td className="p-2 border-t">{x.id}</td><td className="p-2 border-t">{x.name}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border rounded p-3">
            <h3 className="font-semibold mb-2">Təsdiqlər</h3>
            <table className="w-full border">
              <thead>
                <tr className="bg-zinc-100"><th className="p-2">Təchizatçı</th><th className="p-2">Boru ID</th><th className="p-2">Diametr</th></tr>
              </thead>
              <tbody>
                {confirmations.map((x: any, i: number) => (
                  <tr key={i}><td className="p-2 border-t">{x.supplier}</td><td className="p-2 border-t">{x.requested_pipe_id}</td><td className="p-2 border-t">{x.diameter ?? ""}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {view === "auth" && (
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="border rounded p-3">
            <h3 className="font-semibold mb-2">Giriş</h3>
            <AuthLogin onLogged={(r) => {
              setRole(r);
              window.localStorage.setItem('role', r);
              toast({ title: "Xoş gəldiniz", description: r });
              setView(r === 'admin' ? 'admin' : 'supplier');
            }} />
          </div>
          <div className="border rounded p-3">
            <h3 className="font-semibold mb-2">Qeydiyyat</h3>
            <AuthRegister onRegistered={() => setMsg('Qeydiyyat uğurlu, indi daxil olun')} />
          </div>
        </div>
      )}
    </div>
  );
}

function SupplierAdd({ onAdded }: { onAdded: () => void }) {
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [stock, setStock] = useState<number>(0);
  return (
    <div className="flex gap-2">
      <input className="border px-2 py-1" placeholder="ID" value={id} onChange={(e)=>setId(e.target.value)} />
      <input className="border px-2 py-1" placeholder="Ad" value={name} onChange={(e)=>setName(e.target.value)} />
      <input className="border px-2 py-1" type="number" placeholder="Stok" value={stock} onChange={(e)=>setStock(parseInt(e.target.value||"0",10))} />
      <button className="px-3 py-2 border rounded" onClick={async()=>{await fetch("/api/products",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,pipeline_name:name,pipeline_stock:stock})}); onAdded();}}>Əlavə et</button>
    </div>
  );
}

function SupplierCalc({ onCalculated }: { onCalculated: () => void }) {
  const [diameter, setDiameter] = useState<number>(0);
  const [thickness, setThickness] = useState<number>(0);
  const [projectLength, setProjectLength] = useState<number>(0);
  const [coilWeight, setCoilWeight] = useState<number>(0);
  const [coilWidth, setCoilWidth] = useState<number>(0);
  const [pipePurpose, setPipePurpose] = useState<string>("transport");
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 flex-wrap">
        <input className="border px-2 py-1" type="number" placeholder="Diametr" value={diameter} onChange={(e)=>setDiameter(parseFloat(e.target.value||"0"))} />
        <input className="border px-2 py-1" type="number" placeholder="Qalınlıq" value={thickness} onChange={(e)=>setThickness(parseFloat(e.target.value||"0"))} />
        <input className="border px-2 py-1" type="number" placeholder="Layihə uzunluğu" value={projectLength} onChange={(e)=>setProjectLength(parseFloat(e.target.value||"0"))} />
        <input className="border px-2 py-1" type="number" placeholder="Bobin çəkisi" value={coilWeight} onChange={(e)=>setCoilWeight(parseFloat(e.target.value||"0"))} />
        <input className="border px-2 py-1" type="number" placeholder="Bobin eni" value={coilWidth} onChange={(e)=>setCoilWidth(parseFloat(e.target.value||"0"))} />
        <select className="border px-2 py-1" value={pipePurpose} onChange={(e)=>setPipePurpose(e.target.value)}>
          <option value="transport">Transport</option>
          <option value="production">Production</option>
        </select>
      </div>
      <div>
        <button className="px-3 py-2 border rounded" onClick={async()=>{
          await fetch("/api/results",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({diameter,thickness,project_length:projectLength,coil_weight:coilWeight,coil_width:coilWidth,pipe_purpose:pipePurpose})});
          onCalculated();
        }}>Hesabla</button>
      </div>
    </div>
  );
}

function AuthLogin({ onLogged }:{ onLogged:(role:string)=>void }){
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [role,setRoleState]=useState<'supplier'|'admin'>('supplier');
  const [company,setCompany]=useState("");
  const [showPw,setShowPw]=useState(false);
  const [info,setInfo]=useState("");
  return (
    <div className="flex flex-col gap-2">
      <input className="border px-2 py-1" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <div className="flex gap-2 items-center">
        <input className="border px-2 py-1" type={showPw?"text":"password"} placeholder="Şifrə" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="px-2 py-1 border rounded" onClick={()=>setShowPw(v=>!v)}>Göz</button>
      </div>
      <select className="border px-2 py-1" value={role} onChange={e=>setRoleState(e.target.value as any)}>
        <option value="supplier">Təchizatçı</option>
        <option value="admin">Admin</option>
      </select>
      {role!=='admin' && (
        <input className="border px-2 py-1" placeholder="Şirkət adı" value={company} onChange={e=>setCompany(e.target.value)} />
      )}
      <button className="px-3 py-2 border rounded" onClick={async()=>{
        if(!email||!email.includes("@")||!email.split("@")[1]?.includes(".")){setInfo('Email formatı yanlışdır');return}
        if(!password||password.length<6){setInfo('Şifrə ən az 6 simvol');return}
        if(role==='supplier'&&!company){setInfo('Şirkət adı tələb olunur');return}
        const r=await fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password,role,company_name:company})});
        const d=await r.json();
        if(!d.ok){setInfo('Giriş alınmadı');return}
        setInfo('');
        onLogged(role);
      }}>Daxil ol</button>
      {info && <div className="text-amber-700">{info}</div>}
    </div>
  );
}

function AuthRegister({ onRegistered }:{ onRegistered:()=>void }){
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [role,setRoleState]=useState<'supplier'|'admin'>('supplier');
  const [company,setCompany]=useState("");
  const [showPw,setShowPw]=useState(false);
  const [info,setInfo]=useState("");
  return (
    <div className="flex flex-col gap-2">
      <input className="border px-2 py-1" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <div className="flex gap-2 items-center">
        <input className="border px-2 py-1" type={showPw?"text":"password"} placeholder="Şifrə" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="px-2 py-1 border rounded" onClick={()=>setShowPw(v=>!v)}>Göz</button>
      </div>
      <select className="border px-2 py-1" value={role} onChange={e=>setRoleState(e.target.value as any)}>
        <option value="supplier">Təchizatçı</option>
        <option value="admin">Admin</option>
      </select>
      {role!=='admin' && (
        <input className="border px-2 py-1" placeholder="Şirkət adı" value={company} onChange={e=>setCompany(e.target.value)} />
      )}
      <button className="px-3 py-2 border rounded" onClick={async()=>{
        if(!emailValid(email)){setInfo('Email formatı yanlışdır');return}
        if(!password||password.length<6){setInfo('Şifrə ən az 6 simvol');return}
        if(role==='supplier'&&!company){setInfo('Şirkət adı tələb olunur');return}
        const r=await fetch('/api/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password,role,company_name:company})});
        const d=await r.json();
        if(!d.ok){setInfo('Qeydiyyat alınmadı');return}
        setInfo('Qeydiyyat uğurlu, indi daxil olun');
        onRegistered();
      }}>Yarat</button>
      {info && <div className="text-amber-700">{info}</div>}
    </div>
  );
}
 
