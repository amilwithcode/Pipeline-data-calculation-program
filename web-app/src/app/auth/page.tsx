"use client";
import { useState } from "react";
// import { Card} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Mail, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AuthPage(){
  const sp = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const mode = sp?.get('mode') === 'signup' ? 'signup' : 'login';
  return (
    <div className="min-h-screen grid md:grid-cols-2 gap-6 p-6">
      <LeftHero />
      {mode==='login' ? <RightLogin /> : <RightSignup />}
    </div>
  );
}

function LeftHero(){
  return (
    <div className="p-8 rounded-xl bg-card/40 border border-border/50">
      <div className="space-y-3 mb-8">
        <h2 className="text-2xl font-bold text-foreground">Təchizat zəncirinizi</h2>
        <h2 className="text-2xl font-bold text-primary">sadələşdirin</h2>
        <p className="text-muted-foreground">İstehsalı izləyin, çatdırılmaları idarə edin və təchizatçı münasibətlərini bir platformada yönəldin.</p>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Stat label="Active Suppliers" value="48" />
        <Stat label="On-Time Delivery" value="94%" />
        <Stat label="Quality Score" value="98.5%" />
        <Stat label="Units Produced" value="2.4M" />
      </div>
      <p className="text-xs text-muted-foreground">© 2024 PipeFlow Industries. Bütün hüquqlar qorunur.</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }){
  return (
    <div className="rounded-lg bg-secondary/30 border border-border/40 p-4">
      <div className="text-foreground text-xl font-bold">{value}</div>
      <div className="text-muted-foreground text-xs">{label}</div>
    </div>
  );
}

function RightLogin(){
  const router = useRouter();
  const [email,setEmail]=useState("admin@pipeflow.com");
  const [password,setPassword]=useState("admin123");
  const [showPw,setShowPw]=useState(false);
  const [info,setInfo]=useState("");

  const onSubmit = async () => {
    if(!email||!email.includes("@")||!email.split("@")[1]?.includes(".")){setInfo('Email formatı yanlışdır');return}
    if(!password||password.length<6){setInfo('Şifrə ən az 6 simvol');return}
    const role = email.toLowerCase().startsWith('admin') ? 'admin' : 'supplier';
    const r=await fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password,role,company_name:'DemoCo'})});
    const d=await r.json();
    if(!d.ok){setInfo('Giriş alınmadı');return}
    window.localStorage.setItem('role', role);
    if (role==='admin') {
      router.push('/?view=admin');
    } else {
      const sid = String(d?.id || '').trim();
      router.push(`/supplier/${sid || 'unknown'}`);
    }
  };

  return (
    <div className="p-8 rounded-xl bg-card/40 border border-border/50">
      <h3 className="text-xl font-bold text-foreground mb-1">Yenidən xoş gəldiniz</h3>
      <p className="text-sm text-muted-foreground mb-4">Hesabınıza daxil olmaq üçün məlumatlarınızı daxil edin</p>

      <div className="rounded-lg bg-secondary/30 border border-border/40 p-4 mb-6 text-sm">
        <div className="text-muted-foreground">Demo Məlumatları</div>
        <div className="mt-2 space-y-1">
          <div>Admin: <span className="text-foreground">admin@pipeflow.com / admin123</span></div>
          <div>Supplier: <span className="text-foreground">supplier@pipeflow.com / supplier123</span></div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Email</Label>
          <div className="relative mt-2">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={email} onChange={e=>setEmail(e.target.value)} className="pl-9" placeholder="you@company.com" />
          </div>
        </div>
        <div>
          <Label>Password</Label>
          <div className="relative mt-2">
            <Input value={password} onChange={e=>setPassword(e.target.value)} type={showPw?"text":"password"} className="pr-9" placeholder="••••••••" />
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={()=>setShowPw(v=>!v)} aria-label="Toggle password">
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        {info && <div className="text-amber-700">{info}</div>}
        <Button className="w-full gap-2" onClick={onSubmit}>Sign in <ArrowRight className="w-4 h-4" /></Button>
        <div className="text-sm text-muted-foreground text-center">
          Hesabınız yoxdur? <a className="text-primary hover:underline" href="/auth?mode=signup">Qeydiyyat</a>
        </div>
      </div>
    </div>
  );
}

function RightSignup(){
  const router = useRouter();
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [company,setCompany]=useState("");
  const [showPw,setShowPw]=useState(false);
  const [info,setInfo]=useState("");
  return (
    <div className="p-8 rounded-xl bg-card/40 border border-border/50">
      <h3 className="text-xl font-bold text-foreground mb-1">Hesab yaradın</h3>
      <p className="text-sm text-muted-foreground mb-4">Qeydiyyat üçün məlumatları doldurun</p>
      <div className="space-y-4">
        <div>
          <Label>Email</Label>
          <Input className="mt-2" placeholder="you@company.com" value={email} onChange={e=>setEmail(e.target.value)} />
        </div>
        <div>
          <Label>Password</Label>
          <div className="relative mt-2">
            <Input value={password} onChange={e=>setPassword(e.target.value)} type={showPw?"text":"password"} className="pr-9" placeholder="••••••••" />
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={()=>setShowPw(v=>!v)} aria-label="Toggle password">
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div>
          <Label>Company</Label>
          <Input className="mt-2" placeholder="Company name" value={company} onChange={e=>setCompany(e.target.value)} />
        </div>
        <Button className="w-full" onClick={async()=>{
          if(!email||!email.includes("@")||!email.split("@")[1]?.includes(".")){setInfo('Email formatı yanlışdır');return}
          if(!password||password.length<6){setInfo('Şifrə ən az 6 simvol');return}
          if(!company){setInfo('Şirkət adı tələb olunur');return}
          const r=await fetch('/api/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password,role:'supplier',company_name:company})});
          const d=await r.json();
          if(!d.ok){setInfo('Qeydiyyat alınmadı');return}
          setInfo('Qeydiyyat uğurlu');
          if (d?.id) {
            window.localStorage.setItem('role','supplier');
            window.localStorage.setItem('supplier_id', String(d.id));
            router.push(`/supplier/${String(d.id)}`);
          }
        }}>Sign up</Button>
        {info && <div className="text-amber-700">{info}</div>}
        <div className="text-sm text-muted-foreground text-center">
          Artıq hesabınız var? <a className="text-primary hover:underline" href="/auth">Daxil ol</a>
        </div>
      </div>
    </div>
  );
}

//
