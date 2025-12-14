"use client";
import { Suspense } from "react";
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
import { Progress } from "@/components/ui/progress";


type DashboardData = {
  alerts: { level: string; message: string }[];
  risks: { supply_chain: number; quality: number; delivery: number; production: number };
  inventory: { total_products: number; low_stock: number };
  products: { id: string; name: string; stock: number }[];
  suppliers_count?: number;
  results_count?: number;
};

function HomeContent() {
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
  const [productsSearch, setProductsSearch] = useState<string>('');
  const [productsSortBy, setProductsSortBy] = useState<'id'|'name'|'stock'>('id');
  const [productsSortDir, setProductsSortDir] = useState<'asc'|'desc'>('asc');
  const [productsPage, setProductsPage] = useState<number>(1);
  const [productsPageSize, setProductsPageSize] = useState<number>(10);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [productsExportPageOnly, setProductsExportPageOnly] = useState<boolean>(false);
  const [ordersSearch, setOrdersSearch] = useState<string>('');
  const [ordersStatus, setOrdersStatus] = useState<string>('all');
  const [ordersFromDate, setOrdersFromDate] = useState<string>('');
  const [ordersToDate, setOrdersToDate] = useState<string>('');
  const [suppliersSearch, setSuppliersSearch] = useState<string>('');
  const [suppliersSortBy, setSuppliersSortBy] = useState<'name'|'company'|'rating'|'delivery'|'quality'|'on_time'|'fulfillment'>('name');
  const [suppliersSortDir, setSuppliersSortDir] = useState<'asc'|'desc'>('asc');
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [confirmations, setConfirmations] = useState<any[]>([]);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editingProductName, setEditingProductName] = useState<string>('');
  const [editingProductStock, setEditingProductStock] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePassword, setInvitePassword] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin"|"supplier"|"viewer">("supplier");
  const [inviteCompany, setInviteCompany] = useState("");
  const [inviting, setInviting] = useState(false);
  const [supplierProfileOpen, setSupplierProfileOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<any | null>(null);
  const [supplierEditOpen, setSupplierEditOpen] = useState(false);
  const [editSupplier, setEditSupplier] = useState<any | null>(null);
  const [userEditOpen, setUserEditOpen] = useState(false);
  const [editUser, setEditUser] = useState<any | null>(null);
  
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
    let t: any = null;
    try {
      const es = new EventSource('http://127.0.0.1:8000/api/events');
      es.onmessage = (ev) => {
        try {
          const d = JSON.parse(ev.data);
          setDash(d);
          setProducts(Array.isArray(d?.products) ? d.products : []);
        } catch {}
      };
      es.onerror = () => {
        try { es.close(); } catch {}
        t = setInterval(loadDashboard, 15000);
      };
      return () => { try { es.close(); } catch {}; if (t) clearInterval(t); };
    } catch {
      t = setInterval(loadDashboard, 15000);
      return () => { if (t) clearInterval(t); };
    }
  }, [searchParams, router, loadDashboard]);

  useEffect(() => {
    if (view === "materials" || view === "admin") loadSupplier();
    if (view === "admin") loadAdmin();
  }, [view, loadSupplier, loadAdmin]);

  useEffect(() => {
    let mounted = true;
    if (!supplierProfileOpen || !selectedSupplier) return;
    const sid = selectedSupplier.id ? String(selectedSupplier.id) : undefined;
    const sname = selectedSupplier.company || selectedSupplier.name;
    const qs = sid ? `supplier_id=${encodeURIComponent(sid)}` : `supplier=${encodeURIComponent(sname)}`;
    fetch(`/api/orders?${qs}`)
      .then(r => r.json())
      .then(d => { if (!mounted) return; setSelectedSupplier((prev: any) => ({ ...(prev||{}), orders: Array.isArray(d?.orders)? d.orders : [] })); })
      .catch(() => { if (!mounted) return; setSelectedSupplier((prev: any) => ({ ...(prev||{}), orders: [] })); });
    return () => { mounted = false; };
  }, [supplierProfileOpen, selectedSupplier]);

  if (!mounted) {
    return <div className="min-h-screen p-4" suppressHydrationWarning>Yüklənir...</div>;
  }
  const title = view === "dashboard" ? "Panel" : view === "production" ? "İstehsal" : view === "materials" ? "Xammal" : view === "quality" ? "Keyfiyyət Nəzarəti" : view === "logistics" ? "Logistika" : view === "suppliers" ? "Təchizatçılar" : view === "alerts" ? "Bildirişlər" : view === "performance" ? "Performans" : view === "settings" ? "Ayarlar" : view === "inventory" ? "Anbar" : view === "admin" ? "Admin" : view === "not_found" ? "Səhifə tapılmadı" : "Giriş / Qeydiyyat";
  const subtitle = view === "dashboard" ? "Boru kəməri icmalı və KPI-lar" : view === "production" ? "İstehsal mərhələləri və çıxışın izlənməsi" : view === "materials" ? "Anbar və təchizat izlənməsi" : view === "quality" ? "Test nəticələri və uyğunluğun izlənməsi" : view === "logistics" ? "Göndəriş izlənməsi və çatdırılma idarəetməsi" : view === "suppliers" ? "Satıcı idarəetməsi və performans" : view === "alerts" ? "Sistem bildirişləri və xəbərdarlıqlar" : view === "performance" ? "KPI-lar və risk qiymətləndirilməsi" : view === "settings" ? "Sistem konfiqurasiyası və seçimlər" : view === "inventory" ? "Stok səviyyələri və məhsullar" : view === "admin" ? "İdarəetmə və təsdiqlər" : view === "not_found" ? "Düzgün URL və ya view parametri tələb olunur" : "Giriş / Qeydiyyat";

  

  const roleConfig: any = {
    admin: { label: 'Admin', color: 'bg-destructive/20 text-destructive border-destructive/30' },
    supplier: { label: 'Təchizatçı', color: 'bg-primary/20 text-primary border-primary/30' },
    viewer: { label: 'İzləyici', color: 'bg-muted text-muted-foreground border-border' },
  };

  const statusConfig: any = {
    active: { label: 'Aktiv', icon: CheckCircle2, color: 'bg-success/20 text-success border-success/30' },
    pending: { label: 'Gözləyir', icon: Clock, color: 'bg-warning/20 text-warning border-warning/30' },
    suspended: { label: 'Dayandırılıb', icon: XCircle, color: 'bg-destructive/20 text-destructive border-destructive/30' },
    inactive: { label: 'Qeyri-aktiv', icon: XCircle, color: 'bg-muted text-muted-foreground border-border' },
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
              title="Günlük istehsal"
              value={(dash?.products || []).reduce((a: number, p: any) => a + (p.stock ?? 0), 0)}
              icon={Factory}
              trend={{ value: 0, isPositive: true }}
              subtitle="istehsal edilən vahidlər"
              variant="primary"
            />
            <StatCard
              title="Xammal"
              value={dash?.inventory.total_products ?? 0}
              icon={Package}
              trend={{ value: 0, isPositive: false }}
              subtitle="anbarda"
              variant="warning"
            />
            <StatCard
              title="Aktiv göndərişlər"
              value={(dash?.products || []).filter((p: any) => (p.stock ?? 0) > 0).length}
              icon={Truck}
              trend={{ value: 0, isPositive: true }}
              subtitle="yolda"
              variant="success"
            />
            <StatCard
              title="Aktiv bildirişlər"
              value={dash?.alerts.length ?? 0}
              icon={AlertTriangle}
              trend={{ value: 0, isPositive: false }}
              subtitle="diqqət tələb edir"
              variant="danger"
            />
            <StatCard
              title="Keyfiyyət keçmə faizi"
              value={`${Math.max(0, 100 - (dash?.risks.quality ?? 0)).toFixed(1)}%`}
              icon={CheckCircle2}
              trend={{ value: 0, isPositive: true }}
              subtitle="bu həftə"
              variant="success"
            />
            <StatCard
              title="Orta çatdırılma müddəti"
              value={`${(((dash?.risks.delivery ?? 0) / 10) || 4.2).toFixed(1)}d`}
              icon={Timer}
              trend={{ value: 0, isPositive: true }}
              subtitle="sifarişdən çatdırılmaya"
              variant="default"
            />
            <StatCard
              title="Yaradılmış nəticələr"
              value={dash?.results_count ?? 0}
              icon={Users}
              trend={{ value: 0, isPositive: true }}
              subtitle="cəmi"
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
            <Button variant="outline" onClick={() => router.push('/?view=dashboard')}>Panel</Button>
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
            <StatCard title="Polad rulonlar" value={`${(products||[]).reduce((a,p)=>a + (p.stock ?? 0),0)} kg`} icon={Package} variant="primary" subtitle="Yüksək karbonlu polad" />
            <StatCard title="Alaşıq ehtiyatı" value={`0 kg`} icon={Package} variant="success" subtitle="A sinfi alaşıqlar" />
            <StatCard title="Gözlənilən çatdırılma" value={`0 kg`} icon={Truck} variant="warning" subtitle="Gözlənilən vaxt: —" />
            <StatCard title="Aşağı stok xəbərdarlıqları" value={`${0}`} icon={AlertTriangle} variant="danger" subtitle="Həddən aşağı olanlar" />
          </div>
          <Card className="glass-card mt-6">
            <CardHeader><CardTitle>Material inventarı</CardTitle></CardHeader>
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
              <h3 className="text-lg font-semibold text-foreground mb-4">Bildirişlər</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email xəbərdarlıqları</Label>
                    <p className="text-sm text-muted-foreground">Kritik xəbərdarlıqları email ilə qəbul et</p>
                  </div>
                  <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>SMS bildirişləri</Label>
                    <p className="text-sm text-muted-foreground">Təcili hallar üçün SMS al</p>
                  </div>
                  <Switch checked={smsAlerts} onCheckedChange={setSmsAlerts} />
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Hədlər</h3>
              <div className="grid gap-4">
                <div>
                  <Label>Aşağı stok xəbərdarlığı (kg)</Label>
                  <Input type="number" value={lowStockThreshold} onChange={(e)=>setLowStockThreshold(Number(e.target.value))} className="mt-2" />
                </div>
                <div>
                  <Label>Keyfiyyət keçmə hədəfi (%)</Label>
                  <Input type="number" value={qualityTarget} onChange={(e)=>setQualityTarget(Number(e.target.value))} className="mt-2" />
                </div>
              </div>
            </div>

            <Button className="w-full" onClick={() => {
              const payload = { emailAlerts, smsAlerts, lowStockThreshold, qualityTarget };
              if (typeof window !== 'undefined') window.localStorage.setItem('pf_settings', JSON.stringify(payload));
            }}>Ayarları yadda saxla</Button>
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
                    <p className="text-sm text-muted-foreground">Ümumi istifadəçi sayı</p>
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
                    <p className="text-sm text-muted-foreground">Aktiv təchizatçılar</p>
                    <p className="text-3xl font-bold text-foreground">{dash?.suppliers_count ?? suppliers.length}</p>
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
                    <p className="text-sm text-muted-foreground">Gözləyən təsdiqlər</p>
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
                    <p className="text-sm text-muted-foreground">Orta reytinq</p>
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
              <CardTitle>İdarəetmə</CardTitle>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Axtarış..."
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
                  İstifadəçi dəvət et
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
                        <SelectItem value="supplier">Təchizatçı</SelectItem>
                        <SelectItem value="viewer">İzləyici</SelectItem>
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
                  <TabsTrigger value="users">İstifadəçilər ({users.length})</TabsTrigger>
                  <TabsTrigger value="suppliers">Təchizatçılar ({suppliers.length})</TabsTrigger>
                  <TabsTrigger value="pending">Gözləyənlər ({pendingApprovals})</TabsTrigger>
                  <TabsTrigger value="products">Məhsullar ({products.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="users">
                  <div className="flex items-center gap-2 mb-3">
                    <Input placeholder="Axtarış (supplier/company)" value={suppliersSearch} onChange={(e)=>setSuppliersSearch(e.target.value)} />
                    <Select value={suppliersSortBy} onValueChange={(v)=>setSuppliersSortBy(v as any)}>
                      <SelectTrigger className="w-44"><SelectValue placeholder="Sıralama meyarı" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Təchizatçı</SelectItem>
                        <SelectItem value="company">Şirkət</SelectItem>
                        <SelectItem value="rating">Reytinq</SelectItem>
                        <SelectItem value="delivery">Çatdırılma göstəricisi</SelectItem>
                        <SelectItem value="quality">Keyfiyyət göstəricisi</SelectItem>
                        <SelectItem value="on_time">Vaxtında çatdırılma</SelectItem>
                        <SelectItem value="fulfillment">İcra</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={suppliersSortDir} onValueChange={(v)=>setSuppliersSortDir(v as any)}>
                      <SelectTrigger className="w-28"><SelectValue placeholder="Sıralama istiqaməti" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asc">Artan</SelectItem>
                        <SelectItem value="desc">Azalan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>İstifadəçi</TableHead>
                        <TableHead>Rol</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Şirkət</TableHead>
                        <TableHead>Son aktivlik</TableHead>
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
                                  <DropdownMenuItem>Profili göstər</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => { setEditUser(user); setUserEditOpen(true); }}>İstifadəçini redaktə et</DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Mail className="w-4 h-4 mr-2" />
                                    Email göndər
                                  </DropdownMenuItem>
                                  {user.status === 'pending' && (
                                    <DropdownMenuItem onClick={() => toast({ title: 'Təsdiq edildi', description: 'İstifadəçi təsdiqləndi' })}>
                                      <CheckCircle2 className="w-4 h-4 mr-2 text-success" />
                                      Təsdiq et
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem className="text-destructive" onClick={async()=>{
                                    try{
                                      await fetch(`/api/users/${encodeURIComponent(String(user.id))}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'suspended' }) });
                                      const u = await fetch('/api/users').then(r=>r.json());
                                      const list = Array.isArray(u) ? u.map((x:any)=>({ id:String(x.id ?? x.email ?? Math.random()), name:String(x.name ?? x.full_name ?? '').trim() || undefined, email:String(x.email ?? ''), role:String(x.role ?? 'viewer'), status:String(x.status ?? 'active'), company:x.company ?? x.company_name ?? undefined, lastActive:x.last_active ?? x.lastActive ?? undefined })) : [];
                                      setUsers(list);
                                      toast({ title:'Dayandırıldı', description:'İstifadəçi statusu yeniləndi' });
                                    }catch{}
                                  }}>İstifadəçini dayandır</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TabsContent>
                <Dialog open={userEditOpen} onOpenChange={(o)=>{ setUserEditOpen(o); if(!o) setEditUser(null); }}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>İstifadəçi məlumatları</DialogTitle>
                      <DialogDescription>Ad, email, rol və statusu yenilə</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                      <Input placeholder="Ad" value={String(editUser?.name ?? '')} onChange={(e)=>setEditUser((s:any)=>({...(s||{}), name: e.target.value}))} />
                      <Input placeholder="Email" value={String(editUser?.email ?? '')} onChange={(e)=>setEditUser((s:any)=>({...(s||{}), email: e.target.value}))} />
                      <Select value={String(editUser?.role ?? 'viewer')} onValueChange={(v)=>setEditUser((s:any)=>({...(s||{}), role: v}))}>
                        <SelectTrigger><SelectValue placeholder="Rol" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">admin</SelectItem>
                          <SelectItem value="supplier">təchizatçı</SelectItem>
                          <SelectItem value="viewer">izləyici</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={String(editUser?.status ?? 'active')} onValueChange={(v)=>setEditUser((s:any)=>({...(s||{}), status: v}))}>
                        <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">aktiv</SelectItem>
                          <SelectItem value="pending">gözləyir</SelectItem>
                          <SelectItem value="suspended">dayandırılıb</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={()=>setUserEditOpen(false)}>Bağla</Button>
                      <Button onClick={async()=>{
                        if(!editUser?.id) return;
                        await fetch(`/api/users/${encodeURIComponent(String(editUser.id))}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: editUser.name, email: editUser.email, role: editUser.role, status: editUser.status }) });
                        setUserEditOpen(false);
                        const u = await fetch('/api/users').then(r=>r.json());
                        const list = Array.isArray(u) ? u.map((x:any)=>({ id:String(x.id ?? x.email ?? Math.random()), name:String(x.name ?? x.full_name ?? '').trim() || undefined, email:String(x.email ?? ''), role:String(x.role ?? 'viewer'), status:String(x.status ?? 'active'), company:x.company ?? x.company_name ?? undefined, lastActive:x.last_active ?? x.lastActive ?? undefined })) : [];
                        setUsers(list);
                      }}>Yadda saxla</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <TabsContent value="suppliers">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Təchizatçı</TableHead>
                        <TableHead>Şirkət</TableHead>
                        <TableHead>Vaxtında çatdırılma</TableHead>
                        <TableHead>Sifariş icrası</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSuppliers
                        .filter((s: any) => (String(s.name||'').toLowerCase().includes(suppliersSearch.toLowerCase())) || (String(s.company||'').toLowerCase().includes(suppliersSearch.toLowerCase())))
                        .slice()
                        .sort((a:any,b:any)=>{
                          const pick = (x:any) => suppliersSortBy==='name' ? String(x.name||'') :
                                              suppliersSortBy==='company' ? String(x.company||'') :
                                              suppliersSortBy==='rating' ? Number(x.rating||0) :
                                              suppliersSortBy==='delivery' ? Number(x.delivery_score ?? x.deliveryScore ?? 0) :
                                              suppliersSortBy==='quality' ? Number(x.quality_score ?? x.qualityScore ?? 0) :
                                              suppliersSortBy==='on_time' ? Number(x.on_time_delivery ?? 0) :
                                              Number(x.order_fulfillment ?? 0);
                          const av = pick(a), bv = pick(b);
                          if (typeof av === 'number' && typeof bv === 'number') return suppliersSortDir==='asc' ? av-bv : bv-av;
                          return suppliersSortDir==='asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
                        })
                        .map((supplier: any) => (
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
                          <TableCell className="text-muted-foreground">{typeof supplier.on_time_delivery !== 'undefined' ? `${supplier.on_time_delivery}%` : '—'}</TableCell>
                          <TableCell className="text-muted-foreground">{typeof supplier.order_fulfillment !== 'undefined' ? `${supplier.order_fulfillment}%` : '—'}</TableCell>
                          <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setSelectedSupplier(supplier); setSupplierProfileOpen(true); }}>
                            Profili göstər
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setEditSupplier(supplier); setSupplierEditOpen(true); }}>
                            Təchizatçını redaktə et
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={async () => {
                            try {
                              await fetch(`/api/suppliers/${encodeURIComponent(String(supplier.id))}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'active' }) });
                              await loadAdmin();
                              toast({ title: 'Təsdiq edildi', description: 'Təchizatçı statusu yeniləndi' });
                            } catch {}
                          }}>
                            <CheckCircle2 className="w-4 h-4 mr-2 text-success" />Təsdiq et
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={async () => {
                            try {
                              await fetch(`/api/suppliers/${encodeURIComponent(String(supplier.id))}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'inactive' }) });
                              await loadAdmin();
                              toast({ title: 'Deaktiv edildi', description: 'Təchizatçı statusu yeniləndi' });
                            } catch {}
                          }}>Deaktiv et</DropdownMenuItem>
                          {String(supplier.status)==='inactive' && (
                            <DropdownMenuItem onClick={async () => {
                              try {
                                await fetch(`/api/suppliers/${encodeURIComponent(String(supplier.id))}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'active' }) });
                                await loadAdmin();
                                toast({ title: 'Bərpa edildi', description: 'Təchizatçı aktivdir' });
                              } catch {}
                            }}>Təchizatçını bərpa et</DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="text-destructive" onClick={async () => {
                            try {
                              await fetch(`/api/suppliers/${encodeURIComponent(String(supplier.id))}`, { method: 'DELETE' });
                              await loadAdmin();
                              toast({ title: 'Silindi', description: 'Təchizatçı silindi' });
                            } catch {}
                          }}>Təchizatçını sil</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                            </TableCell>
                          </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
                <Dialog open={supplierEditOpen} onOpenChange={(o)=>{ setSupplierEditOpen(o); if(!o) setEditSupplier(null); }}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Təchizatçı məlumatları</DialogTitle>
                      <DialogDescription>Şirkət, ad, email və statusu yenilə</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                      <Input placeholder="Şirkət" value={String(editSupplier?.company ?? '')} onChange={(e)=>setEditSupplier((s:any)=>({...(s||{}), company: e.target.value}))} />
                      <Input placeholder="Ad" value={String(editSupplier?.name ?? '')} onChange={(e)=>setEditSupplier((s:any)=>({...(s||{}), name: e.target.value}))} />
                      <Input placeholder="Email" value={String(editSupplier?.email ?? '')} onChange={(e)=>setEditSupplier((s:any)=>({...(s||{}), email: e.target.value}))} />
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <Input placeholder="Reytinq" type="number" value={String(editSupplier?.rating ?? '')} onChange={(e)=>setEditSupplier((s:any)=>({...(s||{}), rating: Number(e.target.value||0)}))} />
                        <Input placeholder="Çatdırılma göstəricisi" type="number" value={String(editSupplier?.delivery_score ?? editSupplier?.deliveryScore ?? '')} onChange={(e)=>setEditSupplier((s:any)=>({...(s||{}), delivery_score: Number(e.target.value||0)}))} />
                        <Input placeholder="Keyfiyyət göstəricisi" type="number" value={String(editSupplier?.quality_score ?? editSupplier?.qualityScore ?? '')} onChange={(e)=>setEditSupplier((s:any)=>({...(s||{}), quality_score: Number(e.target.value||0)}))} />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <Input placeholder="Vaxtında çatdırılma (%)" type="number" value={String(editSupplier?.on_time_delivery ?? '')} onChange={(e)=>setEditSupplier((s:any)=>({...(s||{}), on_time_delivery: Number(e.target.value||0)}))} />
                        <Input placeholder="Sifariş icrası (%)" type="number" value={String(editSupplier?.order_fulfillment ?? '')} onChange={(e)=>setEditSupplier((s:any)=>({...(s||{}), order_fulfillment: Number(e.target.value||0)}))} />
                      </div>
                      <Select value={String(editSupplier?.status ?? 'active')} onValueChange={(v)=>setEditSupplier((s:any)=>({...(s||{}), status: v}))}>
                        <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">aktiv</SelectItem>
                          <SelectItem value="pending">gözləyir</SelectItem>
                          <SelectItem value="inactive">qeyri-aktiv</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={()=>setSupplierEditOpen(false)}>Bağla</Button>
                      <Button onClick={async()=>{
                        if(!editSupplier?.id) return;
                        await fetch(`/api/suppliers/${encodeURIComponent(String(editSupplier.id))}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ company: editSupplier.company, name: editSupplier.name, email: editSupplier.email, status: editSupplier.status, rating: editSupplier.rating, delivery_score: editSupplier.delivery_score, quality_score: editSupplier.quality_score, on_time_delivery: editSupplier.on_time_delivery, order_fulfillment: editSupplier.order_fulfillment }) });
                        setSupplierEditOpen(false);
                        await loadAdmin();
                      }}>Yadda saxla</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

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
                            <p className="text-sm text-muted-foreground">Boru: {item.requested_pipe_id}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" className="text-destructive">
                            <XCircle className="w-4 h-4 mr-1" />Rədd et
                          </Button>
                          <Button size="sm" onClick={() => toast({ title: 'Təsdiq edildi', description: 'Təsdiq qeyd edildi' })}>
                            <CheckCircle2 className="w-4 h-4 mr-1" />Təsdiq et
                          </Button>
                        </div>
                      </div>
                    ))}
                    {!confirmations.length && (
                      <div className="text-center py-12 text-muted-foreground">
                        <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-success" />
                        <p>Gözləyən təsdiq yoxdur</p>
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
                        <div className="flex gap-2 mb-3">
                          <Input placeholder="Axtarış (ID və ya ad)" value={productsSearch} onChange={(e)=>setProductsSearch(e.target.value)} />
                          <Select value={productsSortBy} onValueChange={(v)=>setProductsSortBy(v as any)}>
                            <SelectTrigger className="w-40"><SelectValue placeholder="Sıralama meyarı" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="id">ID</SelectItem>
                              <SelectItem value="name">Ad</SelectItem>
                              <SelectItem value="stock">Stok</SelectItem>
                            </SelectContent>
                          </Select>
                          <Select value={productsSortDir} onValueChange={(v)=>setProductsSortDir(v as any)}>
                            <SelectTrigger className="w-28"><SelectValue placeholder="Sıralama istiqaməti" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="asc">Artan</SelectItem>
                              <SelectItem value="desc">Azalan</SelectItem>
                            </SelectContent>
                          </Select>
                          <Select value={String(productsPageSize)} onValueChange={(v)=>{ setProductsPageSize(Number(v)); setProductsPage(1); }}>
                            <SelectTrigger className="w-28"><SelectValue placeholder="Səhifə ölçüsü" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="5">5</SelectItem>
                              <SelectItem value="10">10</SelectItem>
                              <SelectItem value="20">20</SelectItem>
                            </SelectContent>
                          </Select>
                          <div className="flex items-center gap-1">
                            <input id="exportPageOnly" type="checkbox" checked={productsExportPageOnly} onChange={(e)=>setProductsExportPageOnly(e.currentTarget.checked)} />
                            <label htmlFor="exportPageOnly" className="text-sm">Yalnız bu səhifəni export et</label>
                          </div>
                          <Button variant="outline" onClick={async ()=>{
                            let view = products
                              .filter((x:any)=>{
                                const id = String(x.id||'');
                                const name = String(x.pipeline_name ?? x.name ?? '');
                                const q = productsSearch.toLowerCase();
                                return !q || id.toLowerCase().includes(q) || name.toLowerCase().includes(q);
                              })
                              .sort((a:any,b:any)=>{
                                const av = productsSortBy==='id' ? String(a.id||'') : productsSortBy==='name' ? String(a.pipeline_name ?? a.name ?? '') : Number(a.pipeline_stock ?? a.stock ?? 0);
                                const bv = productsSortBy==='id' ? String(b.id||'') : productsSortBy==='name' ? String(b.pipeline_name ?? b.name ?? '') : Number(b.pipeline_stock ?? b.stock ?? 0);
                                if (typeof av === 'number' && typeof bv === 'number') return productsSortDir==='asc' ? av-bv : bv-av;
                                return productsSortDir==='asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
                              });
                            if (productsExportPageOnly) {
                              view = view.slice((productsPage-1)*productsPageSize, (productsPage-1)*productsPageSize + productsPageSize);
                            }
                            const rows = view.map((x:any)=>({ id: x.id, name: x.pipeline_name ?? x.name ?? '', stock: Number(x.pipeline_stock ?? x.stock ?? 0) }));
                            const csv = ['id,name,stock', ...rows.map(r=>`${r.id},${String(r.name).replace(/,/g,';')},${r.stock}`)].join('\n');
                            if (typeof window !== 'undefined') {
                              const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = 'products_export.csv';
                              a.click();
                              URL.revokeObjectURL(url);
                            }
                          }}>CSV eksportu</Button>
                          <Button variant="destructive" onClick={async ()=>{
                            if (!selectedProducts.size) return;
                            await Promise.all(Array.from(selectedProducts).map(id => fetch(`/api/products/${encodeURIComponent(id)}`, { method: 'DELETE' })));
                            setSelectedProducts(new Set());
                            await loadSupplier();
                          }} disabled={!selectedProducts.size}>Seçilənləri sil</Button>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-secondary"><tr><th className="p-2 text-left"><input type="checkbox" onChange={(e)=>{
                              const checked = e.currentTarget.checked;
                              const pageItems = products
                                .filter((x:any)=>{
                                  const id = String(x.id||'');
                                  const name = String(x.pipeline_name ?? x.name ?? '');
                                  const q = productsSearch.toLowerCase();
                                  return !q || id.toLowerCase().includes(q) || name.toLowerCase().includes(q);
                                })
                                .sort((a:any,b:any)=>{
                                  const av = productsSortBy==='id' ? String(a.id||'') : productsSortBy==='name' ? String(a.pipeline_name ?? a.name ?? '') : Number(a.pipeline_stock ?? a.stock ?? 0);
                                  const bv = productsSortBy==='id' ? String(b.id||'') : productsSortBy==='name' ? String(b.pipeline_name ?? b.name ?? '') : Number(b.pipeline_stock ?? b.stock ?? 0);
                                  if (typeof av === 'number' && typeof bv === 'number') return productsSortDir==='asc' ? av-bv : bv-av;
                                  return productsSortDir==='asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
                                })
                                .slice((productsPage-1)*productsPageSize, (productsPage-1)*productsPageSize + productsPageSize)
                                .map((x:any)=>String(x.id));
                              const s = new Set<string>(selectedProducts);
                              if (checked) pageItems.forEach(id=>s.add(String(id))); else pageItems.forEach(id=>s.delete(String(id)));
                              setSelectedProducts(s);
                            }} /></th><th className="p-2 text-left">ID</th><th className="p-2 text-left">Ad</th><th className="p-2 text-left">Stok</th><th className="p-2 text-left">Əməliyyat</th></tr></thead>
                            <tbody>
                              {products
                                .filter((x:any)=>{
                                  const id = String(x.id||'');
                                  const name = String(x.pipeline_name ?? x.name ?? '');
                                  const q = productsSearch.toLowerCase();
                                  return !q || id.toLowerCase().includes(q) || name.toLowerCase().includes(q);
                                })
                                .sort((a:any,b:any)=>{
                                  const av = productsSortBy==='id' ? String(a.id||'') : productsSortBy==='name' ? String(a.pipeline_name ?? a.name ?? '') : Number(a.pipeline_stock ?? a.stock ?? 0);
                                  const bv = productsSortBy==='id' ? String(b.id||'') : productsSortBy==='name' ? String(b.pipeline_name ?? b.name ?? '') : Number(b.pipeline_stock ?? b.stock ?? 0);
                                  if (typeof av === 'number' && typeof bv === 'number') return productsSortDir==='asc' ? av-bv : bv-av;
                                  return productsSortDir==='asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
                                })
                                .slice((productsPage-1)*productsPageSize, (productsPage-1)*productsPageSize + productsPageSize)
                                .map((x: any) => (
                                <tr key={x.id} className="border-t border-border">
                                  <td className="p-2"><input type="checkbox" checked={selectedProducts.has(String(x.id))} onChange={(e)=>{
                                    const s = new Set<string>(selectedProducts);
                                    const id = String(x.id);
                                    if (e.currentTarget.checked) s.add(id); else s.delete(id);
                                    setSelectedProducts(s);
                                  }} /></td>
                                  <td className="p-2">{x.id}</td>
                                  <td className="p-2">
                                    {editingProductId === String(x.id) ? (
                                      <input className="border px-2 py-1 rounded w-full" value={editingProductName} onChange={(e)=>setEditingProductName(e.target.value)} />
                                    ) : (x.pipeline_name ?? x.name)}
                                  </td>
                                  <td className="p-2">
                                    {editingProductId === String(x.id) ? (
                                      <input className="border px-2 py-1 rounded w-full" type="number" value={editingProductStock} onChange={(e)=>setEditingProductStock(Number(e.target.value||0))} />
                                    ) : (x.pipeline_stock ?? x.stock)}
                                  </td>
                                  <td className="p-2">
                                    {editingProductId === String(x.id) ? (
                                      <div className="flex gap-2">
                                        <button className="px-2 py-1 rounded bg-primary text-primary-foreground" onClick={async()=>{
                                          await fetch(`/api/products/${x.id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:editingProductName,stock:editingProductStock})});
                                          setEditingProductId(null);
                                          await loadSupplier();
                                        }}>Yadda saxla</button>
                                        <button className="px-2 py-1 border rounded" onClick={()=>setEditingProductId(null)}>İmtina</button>
                                      </div>
                                    ) : (
                                      <div className="flex gap-2">
                                        <button className="px-2 py-1 border rounded" onClick={()=>{ setEditingProductId(String(x.id)); setEditingProductName(String(x.pipeline_name ?? x.name ?? '')); setEditingProductStock(Number(x.pipeline_stock ?? x.stock ?? 0)); }}>Düzəliş et</button>
                                        <button className="px-2 py-1 border rounded" onClick={async()=>{await fetch(`/api/products/${x.id}`,{method:"DELETE"}); loadSupplier();}}>Sil</button>
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              ))}
                              {!products.length && (
                                <tr className="border-t border-border"><td className="p-2" colSpan={4}>Məhsul yoxdur</td></tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                        <div className="flex items-center justify-between mt-3 text-sm">
                          <span>Səhifə {productsPage}</span>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={()=>setProductsPage(p=>Math.max(1,p-1))} disabled={productsPage===1}>Əvvəl</Button>
                            <Button variant="outline" size="sm" onClick={()=>setProductsPage(p=>p+1)} disabled={products.length <= productsPage*productsPageSize}>Sonra</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
              <Dialog open={supplierProfileOpen} onOpenChange={(o) => { setSupplierProfileOpen(o); if (!o) setSelectedSupplier(null); }}>
                <DialogContent className="max-w-5xl w-full">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Factory className="w-5 h-5 text-primary" />
                      </div>
                      <span>{selectedSupplier?.company || selectedSupplier?.name || 'Təchizatçı Profili'}</span>
                      {selectedSupplier?.status && (
                        <Badge variant="outline" className="ml-2">{String(selectedSupplier.status)}</Badge>
                      )}
                    </DialogTitle>
                    <DialogDescription>
                      {selectedSupplier?.email || '—'} {selectedSupplier?.phone ? ` · ${selectedSupplier.phone}` : ''}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid md:grid-cols-3 gap-6">
                    <Card className="md:col-span-3">
                      <CardContent className="p-4 flex flex-wrap items-center gap-4 justify-between">
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Reytinq</p>
                          <p className="text-xl font-semibold">{selectedSupplier?.rating ?? '—'}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Çatdırılma göstəricisi</p>
                          <p className="text-xl font-semibold">{selectedSupplier?.delivery_score ?? '—'}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Keyfiyyət göstəricisi</p>
                          <p className="text-xl font-semibold">{selectedSupplier?.quality_score ?? '—'}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Aktiv sifarişlər</p>
                          <p className="text-xl font-semibold">{selectedSupplier?.active_orders ?? 0}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Ümumi sifarişlər</p>
                          <p className="text-xl font-semibold">{selectedSupplier?.total_orders ?? 0}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Ümumi dəyər</p>
                          <p className="text-xl font-semibold">{selectedSupplier?.total_value ? `$${selectedSupplier.total_value}` : '—'}</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader><CardTitle>Performans metrikləri</CardTitle></CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <div className="flex justify_between text-xs mb-1"><span>Vaxtında çatdırılma</span><span>{selectedSupplier?.on_time_delivery ?? 0}%</span></div>
                          <Progress value={selectedSupplier?.on_time_delivery ?? 0} />
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1"><span>Keyfiyyət göstəricisi</span><span>{selectedSupplier?.quality_score ?? 0}%</span></div>
                          <Progress value={selectedSupplier?.quality_score ?? 0} />
                        </div>
                        <div>
                          <div className="flex justify_between text-xs mb-1"><span>Sifariş icrası</span><span>{selectedSupplier?.order_fulfillment ?? 0}%</span></div>
                          <Progress value={selectedSupplier?.order_fulfillment ?? 0} />
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1"><span>Cavab faizi</span><span>{selectedSupplier?.response_rate ?? 0}%</span></div>
                          <Progress value={selectedSupplier?.response_rate ?? 0} />
                        </div>
                        <div className="text-xs text-muted-foreground">Orta cavab vaxtı {selectedSupplier?.avg_response_time ?? '< 2 saat>'}</div>
                      </CardContent>
                    </Card>

                    <Card className="md:col-span-2">
                      <CardHeader><CardTitle>Son sifarişlər</CardTitle></CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-4">
                          <Input placeholder="Material" onChange={(e)=>setSelectedSupplier((s:any)=>({...(s||{}), _newMaterial: e.target.value}))} />
                          <Input placeholder="Miqdar" type="number" onChange={(e)=>setSelectedSupplier((s:any)=>({...(s||{}), _newQty: Number(e.target.value||0)}))} />
                          <Input placeholder="Dəyər" type="number" onChange={(e)=>setSelectedSupplier((s:any)=>({...(s||{}), _newVal: Number(e.target.value||0)}))} />
                          <Select defaultValue="pending" onValueChange={(v)=>setSelectedSupplier((s:any)=>({...(s||{}), _newStatus: v}))}>
                            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">gözləyir</SelectItem>
                              <SelectItem value="approved">təsdiqlənib</SelectItem>
                              <SelectItem value="in_transit">yolda</SelectItem>
                              <SelectItem value="delivered">çatdırılıb</SelectItem>
                              <SelectItem value="cancelled">ləğv edilib</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button onClick={async()=>{
                            const sid = selectedSupplier?.id ? String(selectedSupplier.id) : undefined;
                            const sname = selectedSupplier?.company || selectedSupplier?.name;
                            const payload: any = { material: selectedSupplier?._newMaterial, quantity: selectedSupplier?._newQty, value: selectedSupplier?._newVal, status: selectedSupplier?._newStatus || 'pending' };
                            if (sid) payload.supplier_id = sid; else payload.supplier_name = sname;
                            await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                            const qs = sid ? `supplier_id=${encodeURIComponent(sid)}` : `supplier=${encodeURIComponent(sname || '')}`;
                            const d = await fetch(`/api/orders?${qs}`).then(r=>r.json());
                            setSelectedSupplier((prev:any)=>({...(prev||{}), orders: Array.isArray(d?.orders)? d.orders : [] , _newMaterial:'', _newQty:0, _newVal:0, _newStatus:'pending'}));
                          }}>Yeni sifariş</Button>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          <Input placeholder="Axtarış (material)" value={ordersSearch} onChange={(e)=>setOrdersSearch(e.target.value)} />
                          <Select value={ordersStatus} onValueChange={(v)=>setOrdersStatus(v)}>
                            <SelectTrigger className="w-40"><SelectValue placeholder="Status filtri" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">hamısı</SelectItem>
                              <SelectItem value="pending">gözləyir</SelectItem>
                              <SelectItem value="approved">təsdiqlənib</SelectItem>
                              <SelectItem value="in_transit">yolda</SelectItem>
                              <SelectItem value="delivered">çatdırılıb</SelectItem>
                              <SelectItem value="cancelled">ləğv edilib</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input type="date" value={ordersFromDate} onChange={(e)=>setOrdersFromDate(e.target.value)} />
                          <Input type="date" value={ordersToDate} onChange={(e)=>setOrdersToDate(e.target.value)} />
                          <span className="ml-auto text-sm">
                            {(() => {
                              const filtered = (selectedSupplier?.orders || [])
                                .filter((o:any)=>{
                                  const m = String(o.material || '').toLowerCase();
                                  const q = ordersSearch.toLowerCase();
                                  const st = String(o.status || '');
                                  const dt = (o.created_at || o.date || o.ordered_at) ? new Date(o.created_at || o.date || o.ordered_at) : null;
                                  const okDate = (!ordersFromDate && !ordersToDate) || (!!dt && (!ordersFromDate || dt >= new Date(ordersFromDate)) && (!ordersToDate || dt <= new Date(ordersToDate)));
                                  return (!q || m.includes(q)) && (ordersStatus==='all' || st===ordersStatus) && okDate;
                                });
                              const total = filtered.reduce((a:number,o:any)=>a + Number(o.value || 0), 0);
                              return `Toplam dəyər: $${total.toFixed(2)}`;
                            })()}
                          </span>
                          <Button variant="outline" onClick={()=>{
                            const filtered = (selectedSupplier?.orders || [])
                              .filter((o:any)=>{
                                const m = String(o.material || '').toLowerCase();
                                const q = ordersSearch.toLowerCase();
                                const st = String(o.status || '');
                                const dt = (o.created_at || o.date || o.ordered_at) ? new Date(o.created_at || o.date || o.ordered_at) : null;
                                const okDate = (!ordersFromDate && !ordersToDate) || (!!dt && (!ordersFromDate || dt >= new Date(ordersFromDate)) && (!ordersToDate || dt <= new Date(ordersToDate)));
                                return (!q || m.includes(q)) && (ordersStatus==='all' || st===ordersStatus) && okDate;
                              })
                              .map((o:any)=>({ id:o.id, material:o.material, quantity:o.quantity, status:o.status, value:o.value, date:(o.created_at || o.date || o.ordered_at || '') }));
                            const header = 'id,material,quantity,status,value,date';
                            const rows = filtered.map((r:any)=>`${r.id},${String(r.material||'').replace(/,/g,';')},${r.quantity||0},${r.status||''},${r.value||0},${r.date}`);
                            const csv = [header, ...rows].join('\n');
                            const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url; a.download = 'orders_export.csv'; a.click();
                            URL.revokeObjectURL(url);
                          }}>CSV eksportu</Button>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-secondary">
                              <tr>
                                <th className="p-2 text-left">Sifariş</th>
                                <th className="p-2 text-left">Material</th>
                                <th className="p-2 text-left">Miqdar</th>
                                <th className="p-2 text-left">Status</th>
                                <th className="p-2 text-left">Dəyər</th>
                                <th className="p-2 text-left">Əməliyyat</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(selectedSupplier?.orders || [])
                                .filter((o:any)=>{
                                  const m = String(o.material || '').toLowerCase();
                                  const q = ordersSearch.toLowerCase();
                                  const st = String(o.status || '');
                                  const dt = (o.created_at || o.date || o.ordered_at) ? new Date(o.created_at || o.date || o.ordered_at) : null;
                                  const okDate = (!ordersFromDate && !ordersToDate) || (!!dt && (!ordersFromDate || dt >= new Date(ordersFromDate)) && (!ordersToDate || dt <= new Date(ordersToDate)));
                                  return (!q || m.includes(q)) && (ordersStatus==='all' || st===ordersStatus) && okDate;
                                })
                                .map((o: any, idx: number) => (
                                <tr key={idx} className="border-t border-border">
                                  <td className="p-2">{o.code || o.id}</td>
                                  <td className="p-2">{o.material || '—'}</td>
                                  <td className="p-2">{o.quantity ? `${o.quantity} vahid` : '—'}</td>
                                  <td className="p-2">
                                    <select className="border px-2 py-1 rounded" defaultValue={String(o.status || '')} onChange={(e)=>{ o._nextStatus = e.target.value; }}>
                                      <option value="pending">gözləyir</option>
                                      <option value="approved">təsdiqlənib</option>
                                      <option value="in_transit">yolda</option>
                                      <option value="delivered">çatdırılıb</option>
                                      <option value="cancelled">ləğv edilib</option>
                                    </select>
                                  </td>
                                  <td className="p-2">{o.value ? `$${o.value}` : '—'}</td>
                                  <td className="p-2">
                                    <div className="flex gap-2">
                                      <button className="px-2 py-1 border rounded" onClick={async()=>{
                                        const next = o._nextStatus || o.status;
                                        if (!o.id) return;
                                        await fetch(`/api/orders/${encodeURIComponent(String(o.id))}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: next }) });
                                        const sid = selectedSupplier?.id ? String(selectedSupplier.id) : undefined;
                                        const sname = selectedSupplier?.company || selectedSupplier?.name;
                                        const qs = sid ? `supplier_id=${encodeURIComponent(sid)}` : `supplier=${encodeURIComponent(sname || '')}`;
                                        const d = await fetch(`/api/orders?${qs}`).then(r=>r.json());
                                        setSelectedSupplier((prev: any) => ({ ...(prev||{}), orders: Array.isArray(d?.orders)? d.orders : [] }));
                                      }}>Yadda saxla</button>
                                      <button className="px-2 py-1 border rounded text-destructive" onClick={async()=>{
                                        if (!o.id) return;
                                        await fetch(`/api/orders/${encodeURIComponent(String(o.id))}`, { method: 'DELETE' });
                                        const sid = selectedSupplier?.id ? String(selectedSupplier.id) : undefined;
                                        const sname = selectedSupplier?.company || selectedSupplier?.name;
                                        const qs = sid ? `supplier_id=${encodeURIComponent(sid)}` : `supplier=${encodeURIComponent(sname || '')}`;
                                        const d = await fetch(`/api/orders?${qs}`).then(r=>r.json());
                                        setSelectedSupplier((prev: any) => ({ ...(prev||{}), orders: Array.isArray(d?.orders)? d.orders : [] }));
                                      }}>Sil</button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                              {!(selectedSupplier?.orders || []).length && (
                                <tr className="border-t border-border"><td className="p-2" colSpan={6}>Sifariş yoxdur</td></tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </DialogContent>
              </Dialog>
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

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen p-4">Yüklənir...</div>}>
      <HomeContent />
    </Suspense>
  );
}

function SupplierAdd({ onAdded }: { onAdded: () => void }) {
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [stock, setStock] = useState<number>(0);
  return (
    <div className="flex flex-col gap-3">
      <input className="border px-2 py-2 rounded" placeholder="ID" value={id} onChange={(e)=>setId(e.target.value)} />
      <input className="border px-2 py-2 rounded" placeholder="Ad" value={name} onChange={(e)=>setName(e.target.value)} />
      <input className="border px-2 py-2 rounded" type="number" placeholder="Stok" value={Number.isFinite(stock)?stock:0} onChange={(e)=>setStock(Number(e.target.value||0))} />
      <div className="pt-2">
        <button className="px-4 py-2 rounded bg-primary text-primary-foreground disabled:opacity-50" disabled={!id || !name} onClick={async()=>{
          await fetch("/api/products",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,pipeline_name:name,pipeline_stock:stock})});
          onAdded();
        }}>Məhsulları yadda saxla</button>
      </div>
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
 
 
 
