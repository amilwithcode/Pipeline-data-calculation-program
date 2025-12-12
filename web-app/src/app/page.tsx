"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AlertTriangle, Info, CheckCircle2, Package, Factory, Truck, Timer, Users, Search as SearchIcon, Filter, MoreVertical, Mail, XCircle, Clock, Shield, UserPlus } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { ProductionPipeline } from "@/components/dashboard/ProductionPipeline";
import { ProductionChart } from "@/components/dashboard/ProductionChart";
import { QualityMetrics } from "@/components/dashboard/QualityMetrics";
import { AlertsPanel } from "@/components/dashboard/AlertsPanel";
import { RiskIndicator } from "@/components/dashboard/RiskIndicator";
import { LogisticsTracker } from "@/components/dashboard/LogisticsTracker";
import { SupplierOverview } from "@/components/dashboard/SupplierOverview";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


type DashboardData = {
  alerts: { level: string; message: string }[];
  risks: { supply_chain: number; quality: number; delivery: number; production: number };
  inventory: { total_products: number; low_stock: number };
  products: { id: string; name: string; stock: number }[];
};

export default function Home() {
  const [view, setView] = useState<
    | "dashboard"
    | "alerts"
    | "inventory"
    | "admin"
    | "auth"
    | "production"
    | "materials"
    | "quality"
    | "logistics"
    | "suppliers"
    | "settings"
    | "performance"
    | "not_found"
  >("auth");
  const [mounted, setMounted] = useState(false);
  const [dash, setDash] = useState<DashboardData | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [confirmations, setConfirmations] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePassword, setInvitePassword] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin"|"supplier"|"viewer">("supplier");
  const [inviteCompany, setInviteCompany] = useState("");
  const [inviting, setInviting] = useState(false);
  
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [emailAlerts, setEmailAlerts] = useState<boolean>(true);
  const [smsAlerts, setSmsAlerts] = useState<boolean>(false);
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(1000);
  const [qualityTarget, setQualityTarget] = useState<number>(95);
 

  const loadDashboard = useCallback(async () => {
    try {
      const r = await fetch("/api/dashboard");
      const d = (await r.json()) as DashboardData;
      setDash(d);
    } catch {
      toast({ title: "Backend əlçatan deyil", description: "http://127.0.0.1:8000" });
      setDash({
        alerts: [{ level: "critical", message: "Backend əlçatan deyil" }],
        risks: { supply_chain: 0, quality: 0, delivery: 0, production: 0 },
        inventory: { total_products: 0, low_stock: 0 },
        products: [],
      });
    }
  }, [toast]);

  const loadSupplier = useCallback(async () => {
    try {
      const pr = await fetch("/api/products").then((r) => r.json());
      setProducts(pr);
    } catch {
      toast({ title: "Backend əlçatan deyil", description: "Məhsullar yüklənmədi" });
      setProducts([]);
    }
    
  }, [toast]);

  const loadAdmin = useCallback(async () => {
    try {
      const s = await fetch("/api/suppliers").then((r) => r.json());
      const arr = Array.isArray(s) ? s : Array.isArray(s?.suppliers) ? s.suppliers : [];
      setSuppliers(arr);
    } catch {
      toast({ title: "Backend əlçatan deyil", description: "Təchizatçılar yüklənmədi" });
      setSuppliers([]);
    }
    try {
      const u = await fetch("/api/users").then((r) => r.json());
      const list = Array.isArray(u)
        ? u.map((x: any) => ({
            id: String(x.id ?? x.email ?? Math.random()),
            name: String(x.name ?? x.full_name ?? "").trim() || undefined,
            email: String(x.email ?? ""),
            role: String(x.role ?? "viewer"),
            status: String(x.status ?? "active"),
            company: x.company ?? x.company_name ?? undefined,
            lastActive: x.last_active ?? x.lastActive ?? undefined,
          }))
        : [];
      setUsers(list);
    } catch {
      setUsers([]);
    }
    try {
      const c = await fetch("/api/confirmations").then((r) => r.json());
      const arr = Array.isArray(c) ? c : Array.isArray(c?.confirmations) ? c.confirmations : [];
      setConfirmations(arr);
    } catch {
      toast({ title: "Backend əlçatan deyil", description: "Təsdiqlər yüklənmədi" });
      setConfirmations([]);
    }
  }, [toast]);

  useEffect(() => {
    setMounted(true);
    const v = searchParams ? searchParams.get('view') : null;
    const allowed = ['dashboard','production','materials','quality','logistics','suppliers','alerts','performance','settings','inventory','admin','auth'];
    if (v && allowed.includes(v)) {
      setView(v as any);
    } else if (!v) {
      router.replace('/auth');
      return;
    } else {
      setView('not_found');
    }
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem('pf_settings') : null;
      if (raw) {
        const s = JSON.parse(raw);
        setEmailAlerts(!!s.emailAlerts);
        setSmsAlerts(!!s.smsAlerts);
        setLowStockThreshold(Number(s.lowStockThreshold ?? 1000));
        setQualityTarget(Number(s.qualityTarget ?? 95));
      }
    } catch {}
    loadDashboard();
    const t = setInterval(loadDashboard, 15000);
    return () => clearInterval(t);
  }, [searchParams, router, loadDashboard]);

  useEffect(() => {
    if (view === "materials") loadSupplier();
    if (view === "admin") loadAdmin();
  }, [view, loadSupplier, loadAdmin]);

  if (!mounted) {
    return <div className="min-h-screen p-4" suppressHydrationWarning>Yüklənir...</div>;
  }
  const title = view === "dashboard" ? "Dashboard" : view === "production" ? "Production" : view === "materials" ? "Raw Materials" : view === "quality" ? "Quality Control" : view === "logistics" ? "Logistics" : view === "suppliers" ? "Suppliers" : view === "alerts" ? "Alerts" : view === "performance" ? "Performance" : view === "settings" ? "Settings" : view === "inventory" ? "Inventory" : view === "admin" ? "Admin" : view === "not_found" ? "Səhifə tapılmadı" : "Authentication";
  const subtitle = view === "dashboard" ? "Pipeline overview & KPIs" : view === "production" ? "Manufacturing stages & output monitoring" : view === "materials" ? "Inventory & supply tracking" : view === "quality" ? "Test results & compliance tracking" : view === "logistics" ? "Shipment tracking & delivery management" : view === "suppliers" ? "Vendor management & performance" : view === "alerts" ? "System notifications & warnings" : view === "performance" ? "KPIs & risk assessment" : view === "settings" ? "System configuration & preferences" : view === "inventory" ? "Stock levels & products" : view === "admin" ? "Management & approvals" : view === "not_found" ? "Düzgün URL və ya view parametri tələb olunur" : "Login / Register";

  

  const roleConfig: any = {
    admin: { label: 'Admin', color: 'bg-destructive/20 text-destructive border-destructive/30' },
    supplier: { label: 'Supplier', color: 'bg-primary/20 text-primary border-primary/30' },
    viewer: { label: 'Viewer', color: 'bg-muted text-muted-foreground border-border' },
  };

  const statusConfig: any = {
    active: { label: 'Active', icon: CheckCircle2, color: 'bg-success/20 text-success border-success/30' },
    pending: { label: 'Pending', icon: Clock, color: 'bg-warning/20 text-warning border-warning/30' },
    suspended: { label: 'Suspended', icon: XCircle, color: 'bg-destructive/20 text-destructive border-destructive/30' },
    inactive: { label: 'Inactive', icon: XCircle, color: 'bg-muted text-muted-foreground border-border' },
  };

  const filteredUsers = users.filter((u: any) =>
    (String(u.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(u.email || "").toLowerCase().includes(searchTerm.toLowerCase()))
  );
  const filteredSuppliers = (Array.isArray(suppliers) ? suppliers : []).filter((s: any) =>
    (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.company || '').toLowerCase().includes(searchTerm.toLowerCase())
  );
  const pendingApprovals = confirmations.length;

  return (
    <DashboardLayout title={title} subtitle={subtitle}>
      {view === "dashboard" && (
        <div className="grid grid-cols-1 gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <StatCard
              title="Daily Production"
              value={(dash?.products || []).reduce((a: number, p: any) => a + (p.stock ?? 0), 0)}
              icon={Factory}
              trend={{ value: 0, isPositive: true }}
              subtitle="units manufactured"
              variant="primary"
            />
            <StatCard
              title="Raw Materials"
              value={dash?.inventory.total_products ?? 0}
              icon={Package}
              trend={{ value: 0, isPositive: false }}
              subtitle="in inventory"
              variant="warning"
            />
            <StatCard
              title="Active Shipments"
              value={(dash?.products || []).filter((p: any) => (p.stock ?? 0) > 0).length}
              icon={Truck}
              trend={{ value: 0, isPositive: true }}
              subtitle="in transit"
              variant="success"
            />
            <StatCard
              title="Active Alerts"
              value={dash?.alerts.length ?? 0}
              icon={AlertTriangle}
              trend={{ value: 0, isPositive: false }}
              subtitle="requiring attention"
              variant="danger"
            />
            <StatCard
              title="Quality Pass Rate"
              value={`${Math.max(0, 100 - (dash?.risks.quality ?? 0)).toFixed(1)}%`}
              icon={CheckCircle2}
              trend={{ value: 0, isPositive: true }}
              subtitle="this week"
              variant="success"
            />
            <StatCard
              title="Avg. Lead Time"
              value={`${(((dash?.risks.delivery ?? 0) / 10) || 4.2).toFixed(1)}d`}
              icon={Timer}
              trend={{ value: 0, isPositive: true }}
              subtitle="order to delivery"
              variant="default"
            />
          </div>

          <ProductionPipeline />

          <div className="grid lg:grid-cols-2 gap-6">
            <ProductionChart />
            <QualityMetrics />
          </div>
        </div>
      )}
      {view === "not_found" && (
        <div className="text-center py-16">
          <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <span className="text-destructive text-2xl">404</span>
          </div>
          <p className="text-lg font-semibold text-foreground mb-2">Səhifə tapılmadı</p>
          <p className="text-muted-foreground mb-6">Düzgün URL və ya '?view=' parametri əlavə edin</p>
          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" onClick={() => router.push('/?view=dashboard')}>Dashboard</Button>
            <Button onClick={() => router.push('/?view=admin')}>Admin</Button>
          </div>
        </div>
      )}

      {view === "alerts" && (
        <div className="space-y-6">
          <AlertsPanel />
        </div>
      )}

      {view === "production" && (
        <div className="space-y-6">
          <ProductionPipeline />
          <ProductionChart />
        </div>
      )}

      {view === "materials" && (
        <>
          <div className="data-grid">
            <StatCard title="Steel Coils" value={`${(products||[]).reduce((a,p)=>a + (p.stock ?? 0),0)} kg`} icon={Package} variant="primary" subtitle="High carbon steel" />
            <StatCard title="Alloy Stock" value={`0 kg`} icon={Package} variant="success" subtitle="Grade A alloys" />
            <StatCard title="Pending Delivery" value={`0 kg`} icon={Truck} variant="warning" subtitle="ETA: —" />
            <StatCard title="Low Stock Alerts" value={`${0}`} icon={AlertTriangle} variant="danger" subtitle="Items below threshold" />
          </div>
          <Card className="glass-card mt-6">
            <CardHeader><CardTitle>Material Inventory</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-secondary">
                    <tr>
                      <th className="p-2 text-left">ID</th>
                      <th className="p-2 text-left">Ad</th>
                      <th className="p-2 text-left">Stok</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id} className="border-t border-border">
                        <td className="p-2">{p.id}</td>
                        <td className="p-2">{p.name}</td>
                        <td className="p-2">{p.stock}</td>
                      </tr>
                    ))}
                    {!products.length && (
                      <tr className="border-t border-border"><td className="p-2" colSpan={3}>Material yoxdur</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {view === "quality" && (
        <div className="space-y-6">
          <QualityMetrics />
        </div>
      )}

      {view === "logistics" && (
        <div className="space-y-6">
          <LogisticsTracker />
        </div>
      )}

      {view === "suppliers" && (
        <div className="space-y-6">
          <SupplierOverview />
        </div>
      )}

      {view === "settings" && (
        <div className="max-w-2xl">
          <div className="glass-card p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Notifications</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Alerts</Label>
                    <p className="text-sm text-muted-foreground">Receive critical alerts via email</p>
                  </div>
                  <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">Get SMS for urgent issues</p>
                  </div>
                  <Switch checked={smsAlerts} onCheckedChange={setSmsAlerts} />
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Thresholds</h3>
              <div className="grid gap-4">
                <div>
                  <Label>Low Stock Alert (kg)</Label>
                  <Input type="number" value={lowStockThreshold} onChange={(e)=>setLowStockThreshold(Number(e.target.value))} className="mt-2" />
                </div>
                <div>
                  <Label>Quality Pass Rate Target (%)</Label>
                  <Input type="number" value={qualityTarget} onChange={(e)=>setQualityTarget(Number(e.target.value))} className="mt-2" />
                </div>
              </div>
            </div>

            <Button className="w-full" onClick={() => {
              const payload = { emailAlerts, smsAlerts, lowStockThreshold, qualityTarget };
              if (typeof window !== 'undefined') window.localStorage.setItem('pf_settings', JSON.stringify(payload));
            }}>Save Settings</Button>
          </div>
        </div>
      )}

      

      {view === "performance" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProductionChart />
          <RiskIndicator />
        </div>
      )}

      {view === "dashboard" && (
        <div className="grid gap-6">
          <Card className="glass-card">
            <CardHeader><CardTitle>Alertlər</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dash?.alerts.map((a, i) => (
                  <div key={i} className="flex items-start gap-2">
                    {a.level === "critical" && <AlertTriangle className="w-4 h-4 text-destructive" />}
                    {a.level === "warning" && <AlertTriangle className="w-4 h-4 text-warning" />}
                    {a.level !== "critical" && a.level !== "warning" && <Info className="w-4 h-4 text-info" />}
                    <span className="text-sm">{a.message}</span>
                  </div>
                ))}
                {!dash?.alerts?.length && <div className="text-sm text-muted-foreground">Alert yoxdur</div>}
              </div>
          </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-6">
            <AlertsPanel />
            <RiskIndicator />
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            <LogisticsTracker />
            <SupplierOverview />
          </div>
        </div>
      )}

      {view === "inventory" && (
        <Card className="glass-card">
          <CardHeader><CardTitle>Inventar</CardTitle></CardHeader>
          <CardContent>
            <div className="mb-2 text-sm">Toplam: {dash?.inventory.total_products ?? 0} • Aşağı stok: {dash?.inventory.low_stock ?? 0}</div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary">
                  <tr><th className="p-2 text-left">ID</th><th className="p-2 text-left">Ad</th><th className="p-2 text-left">Stok</th></tr>
                </thead>
                <tbody>
                  {dash?.products.map(p => (
                    <tr key={p.id} className="border-t border-border"><td className="p-2">{p.id}</td><td className="p-2">{p.name}</td><td className="p-2">{p.stock}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      

      {view === "admin" && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="glass-card">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                    <p className="text-3xl font-bold text-foreground">{users.length}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Suppliers</p>
                    <p className="text-3xl font-bold text-foreground">{suppliers.length}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                    <Package className="w-6 h-6 text-success" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Approvals</p>
                    <p className="text-3xl font-bold text-warning">{pendingApprovals}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-warning" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. Rating</p>
                    <p className="text-3xl font-bold text-foreground">{
                      suppliers.length
                        ? (Math.round((suppliers.reduce((a:number,s:any)=>a + Number(s.rating ?? 0),0) / suppliers.length) * 10) / 10)
                        : 0
                    }</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Management</CardTitle>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 w-64 bg-secondary/50"
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="w-4 h-4" />
                </Button>
                <Button className="gap-2" onClick={() => setInviteOpen(true)}>
                  <UserPlus className="w-4 h-4" />
                  Invite User
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Yeni istifadəçi əlavə et</DialogTitle>
                    <DialogDescription>Email, rol və şifrə daxil edin</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3">
                    <Input placeholder="Email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
                    <Input placeholder="Şifrə" type="password" value={invitePassword} onChange={(e) => setInvitePassword(e.target.value)} />
                    <Select value={inviteRole} onValueChange={(v: 'admin'|'supplier'|'viewer') => setInviteRole(v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Rol" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="supplier">Supplier</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                    {inviteRole === 'supplier' && (
                      <Input placeholder="Şirkət adı" value={inviteCompany} onChange={(e) => setInviteCompany(e.target.value)} />
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setInviteOpen(false)}>Bağla</Button>
                    <Button disabled={inviting || !inviteEmail || !invitePassword} onClick={async () => {
                      try {
                        setInviting(true);
                        const payload: any = { role: inviteRole, email: inviteEmail, password: invitePassword };
                        if (inviteRole === 'supplier' && inviteCompany) payload.company_name = inviteCompany;
                        const r = await fetch('/api/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                        const d = await r.json();
                        if (d?.ok) {
                          setInviteOpen(false);
                          setInviteEmail('');
                          setInvitePassword('');
                          setInviteCompany('');
                          try {
                            const u = await fetch('/api/users').then(rr => rr.json());
                            const list = Array.isArray(u)
                              ? u.map((x: any) => ({
                                  id: String(x.id ?? x.email ?? Math.random()),
                                  name: String(x.name ?? x.full_name ?? '').trim() || undefined,
                                  email: String(x.email ?? ''),
                                  role: String(x.role ?? 'viewer'),
                                  status: String(x.status ?? 'active'),
                                  company: x.company ?? x.company_name ?? undefined,
                                  lastActive: x.last_active ?? x.lastActive ?? undefined,
                                }))
                              : [];
                            setUsers(list);
                          } catch {}
                        }
                      } finally {
                        setInviting(false);
                      }
                    }}>Əlavə et</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Tabs defaultValue="users" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
                  <TabsTrigger value="suppliers">Suppliers ({suppliers.length})</TabsTrigger>
                  <TabsTrigger value="pending">Pending ({pendingApprovals})</TabsTrigger>
                  <TabsTrigger value="products">Products ({products.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="users">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Last Active</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user: any) => {
                        const roleStyle = roleConfig[(user.role ?? 'viewer')];
                        const statusStyle = statusConfig[(user.status ?? 'active')];
                        const StatusIcon = statusStyle.icon;
                        return (
                          <TableRow key={user.id} className="table-row-hover">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                                  {(String(user.name || user.email || '')).split(' ').map((n: string) => n[0]).join('')}
                                </div>
                                <div>
                                  <p className="font-medium text-foreground">{user.name || '—'}</p>
                                  <p className="text-sm text-muted-foreground">{user.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={roleStyle.color}>{roleStyle.label}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={statusStyle.color}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {statusStyle.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{user.company || '—'}</TableCell>
                            <TableCell className="text-muted-foreground">{user.lastActive || '—'}</TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>View Profile</DropdownMenuItem>
                                  <DropdownMenuItem>Edit User</DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Mail className="w-4 h-4 mr-2" />
                                    Send Email
                                  </DropdownMenuItem>
                                  {user.status === 'pending' && (
                                    <DropdownMenuItem onClick={() => toast({ title: 'Approved', description: 'User has been approved' })}>
                                      <CheckCircle2 className="w-4 h-4 mr-2 text-success" />
                                      Approve
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem className="text-destructive">Suspend User</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TabsContent>

                <TabsContent value="suppliers">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Supplier</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSuppliers.map((supplier: any) => (
                        <TableRow key={supplier.id} className="table-row-hover">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center text-sm font-semibold text-accent">
                                {(supplier.company || supplier.name || '').split(' ').map((n: string) => n[0]).join('').slice(0,2)}
                              </div>
                              <div>
                                <p className="font-medium text-foreground">{supplier.company || '—'}</p>
                                <p className="text-sm text-muted-foreground">{supplier.name}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{supplier.company || '—'}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => toast({ title: 'Approved', description: 'Supplier has been approved' })}>
                                  <CheckCircle2 className="w-4 h-4 mr-2 text-success" />Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">Deactivate</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>

                <TabsContent value="pending">
                  <div className="space-y-4">
                    {confirmations.map((item: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-warning" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{item.supplier}</p>
                            <p className="text-sm text-muted-foreground">Pipe: {item.requested_pipe_id}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" className="text-destructive">
                            <XCircle className="w-4 h-4 mr-1" />Reject
                          </Button>
                          <Button size="sm" onClick={() => toast({ title: 'Approved', description: 'Approval recorded' })}>
                            <CheckCircle2 className="w-4 h-4 mr-1" />Approve
                          </Button>
                        </div>
                      </div>
                    ))}
                    {!confirmations.length && (
                      <div className="text-center py-12 text-muted-foreground">
                        <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-success" />
                        <p>No pending approvals</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="products">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <Card className="glass-card">
                      <CardHeader><CardTitle>Məhsul əlavə et</CardTitle></CardHeader>
                      <CardContent>
                        <SupplierAdd onAdded={loadSupplier} />
                      </CardContent>
                    </Card>
                    <Card className="glass-card">
                      <CardHeader><CardTitle>Mövcud məhsullar</CardTitle></CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-secondary"><tr><th className="p-2 text-left">ID</th><th className="p-2 text-left">Ad</th><th className="p-2 text-left">Stok</th><th className="p-2 text-left">Əməliyyat</th></tr></thead>
                            <tbody>
                              {products.map((x: any) => (
                                <tr key={x.id} className="border-t border-border"><td className="p-2">{x.id}</td><td className="p-2">{x.pipeline_name ?? x.name}</td><td className="p-2">{x.pipeline_stock ?? x.stock}</td><td className="p-2"><button className="px-2 py-1 border rounded" onClick={async()=>{await fetch(`/api/products/${x.id}`,{method:"DELETE"}); loadSupplier();}}>Sil</button></td></tr>
                              ))}
                              {!products.length && (
                                <tr className="border-t border-border"><td className="p-2" colSpan={4}>Məhsul yoxdur</td></tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
      {view === "auth" && (
        <div className="max-w-xl">
          <Card className="glass-card">
            <CardHeader><CardTitle>Admin hesabı</CardTitle></CardHeader>
            <CardContent>
              <AdminAccount />
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
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


function AdminAccount(){
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [info,setInfo]=useState("");
  const { toast } = useToast();
  useEffect(()=>{
    try{
      const e = typeof window!=="undefined" ? window.localStorage.getItem('admin_email') : null;
      const p = typeof window!=="undefined" ? window.localStorage.getItem('admin_password') : null;
      if(e) setEmail(e);
      if(p) setPassword(p);
    }catch{}
  },[]);
  return (
    <div className="flex flex-col gap-3">
      <input className="border px-2 py-1" placeholder="Admin email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input className="border px-2 py-1" type="password" placeholder="Yeni şifrə" value={password} onChange={e=>setPassword(e.target.value)} />
      <div className="flex gap-2">
        <Button onClick={()=>{
          if(!email||!email.includes('@')||!email.split('@')[1]?.includes('.')){setInfo('Email formatı yanlışdır');return}
          if(!password||password.length<6){setInfo('Şifrə ən az 6 simvol');return}
          try{
            window.localStorage.setItem('admin_email',email);
            window.localStorage.setItem('admin_password',password);
            window.localStorage.setItem('role','admin');
            setInfo('Dəyişikliklər yadda saxlandı');
            toast({ title: 'Admin yeniləndi', description: 'Məlumatlar saxlandı' });
          }catch{
            setInfo('Saxlama alınmadı');
          }
        }}>Yenilə</Button>
        <Button variant="outline" onClick={()=>{ setEmail(''); setPassword(''); }}>Təmizlə</Button>
      </div>
      {info && <div className="text-amber-700">{info}</div>}
    </div>
  );
}
 
 
