"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Eye, EyeOff, Building2, User2 } from "lucide-react";

function emailValid(e: string) {
  if (!e || !e.includes("@")) return false;
  const parts = e.split("@");
  if (parts.length !== 2) return false;
  return parts[0].length > 0 && parts[1].includes(".");
}

function AuthLogin({ onLogged }:{ onLogged:(r:string)=>void }){
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [role,setRoleState]=useState<'supplier'|'admin'>('supplier');
  const [company,setCompany]=useState("");
  const [showPw,setShowPw]=useState(false);
  const [info,setInfo]=useState("");
  return (
    <div className="flex flex-col gap-3">
      <div>
        <Label className="mb-1 flex items-center gap-2 text-muted-foreground"><Mail className="w-4 h-4" /> Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="pl-10" placeholder="supplier@pipeflow.com" value={email} onChange={e=>setEmail(e.target.value)} />
        </div>
      </div>
      <div>
        <Label className="mb-1 flex items-center gap-2 text-muted-foreground"><Lock className="w-4 h-4" /> Şifrə</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="pl-10 pr-10" type={showPw?"text":"password"} placeholder="••••••" value={password} onChange={e=>setPassword(e.target.value)} />
          <Button type="button" variant="ghost" size="icon" className="absolute right-1.5 top-1/2 -translate-y-1/2" onClick={()=>setShowPw(v=>!v)}>
            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
        </div>
      </div>
      <div>
        <Label className="mb-1 flex items-center gap-2 text-muted-foreground"><User2 className="w-4 h-4" /> Rol</Label>
        <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={role} onChange={e=>setRoleState(e.target.value as any)}>
          <option value="supplier">Təchizatçı</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      {role!=='admin' && (
        <div>
          <Label className="mb-1 flex items-center gap-2 text-muted-foreground"><Building2 className="w-4 h-4" /> Şirkət adı</Label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-10" placeholder="PipeFlow LTD" value={company} onChange={e=>setCompany(e.target.value)} />
          </div>
        </div>
      )}
      <Button className="w-full" onClick={async()=>{
        if(!emailValid(email)){setInfo('Email formatı yanlışdır');return}
        if(!password||password.length<6){setInfo('Şifrə ən az 6 simvol');return}
        if(role==='supplier'&&!company){setInfo('Şirkət adı tələb olunur');return}
        const r=await fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password,role,company_name:company})});
        const d=await r.json();
        if(!d.ok){setInfo('Giriş alınmadı');return}
        setInfo('');
        onLogged(role);
      }}>Daxil ol</Button>
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
  const { toast } = useToast();
  return (
    <div className="flex flex-col gap-3">
      <div>
        <Label className="mb-1 flex items-center gap-2 text-muted-foreground"><Mail className="w-4 h-4" /> Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="pl-10" placeholder="supplier@pipeflow.com" value={email} onChange={e=>setEmail(e.target.value)} />
        </div>
      </div>
      <div>
        <Label className="mb-1 flex items-center gap-2 text-muted-foreground"><Lock className="w-4 h-4" /> Şifrə</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="pl-10 pr-10" type={showPw?"text":"password"} placeholder="••••••" value={password} onChange={e=>setPassword(e.target.value)} />
          <Button type="button" variant="ghost" size="icon" className="absolute right-1.5 top-1/2 -translate-y-1/2" onClick={()=>setShowPw(v=>!v)}>
            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
        </div>
      </div>
      <div>
        <Label className="mb-1 flex items-center gap-2 text-muted-foreground"><User2 className="w-4 h-4" /> Rol</Label>
        <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={role} onChange={e=>setRoleState(e.target.value as any)}>
          <option value="supplier">Təchizatçı</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      {role!=='admin' && (
        <div>
          <Label className="mb-1 flex items-center gap-2 text-muted-foreground"><Building2 className="w-4 h-4" /> Şirkət adı</Label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-10" placeholder="PipeFlow LTD" value={company} onChange={e=>setCompany(e.target.value)} />
          </div>
        </div>
      )}
      <Button className="w-full" onClick={async()=>{
        if(!emailValid(email)){setInfo('Email formatı yanlışdır');return}
        if(!password||password.length<6){setInfo('Şifrə ən az 6 simvol');return}
        if(role==='supplier'&&!company){setInfo('Şirkət adı tələb olunur');return}
        const r=await fetch('/api/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password,role,company_name:company})});
        const d=await r.json();
        if(!d.ok){setInfo('Qeydiyyat alınmadı');return}
        setInfo('Qeydiyyat uğurlu, indi daxil olun');
        toast({ title: "Qeydiyyat uğurlu", description: "İndi daxil olun" });
        onRegistered();
      }}>Yarat</Button>
      {info && <div className="text-amber-700">{info}</div>}
    </div>
  );
}

export default function AuthPage(){
  const router = useRouter();
  const { toast } = useToast();
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem('role') : null;
    if (stored) {
      const sv = stored === 'admin' ? 'admin' : 'supplier';
      router.replace(`/?view=${sv}`);
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-foreground">PipeFlow</h1>
          <p className="text-sm text-muted-foreground">Real-time manufacturing operations overview</p>
        </div>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>{showRegister ? "Qeydiyyat" : "Giriş"}</CardTitle>
          </CardHeader>
          <CardContent>
            {showRegister ? (
              <AuthRegister onRegistered={() => setShowRegister(false)} />
            ) : (
              <AuthLogin onLogged={(r)=>{
                window.localStorage.setItem('role', r);
                toast({ title: "Xoş gəldiniz", description: r });
                const sv = r === 'admin' ? 'admin' : 'supplier';
                router.replace(`/?view=${sv}`);
              }} />
            )}
            <div className="mt-4 text-sm text-muted-foreground flex items-center justify-between">
              {showRegister ? (
                <button className="underline" onClick={() => setShowRegister(false)}>Hesabınız var? Daxil olun</button>
              ) : (
                <button className="underline" onClick={() => setShowRegister(true)}>Hesabınız yoxdur? Hesab yaradın</button>
              )}
              <span className="text-xs">Live status</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

