"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
// standalone supplier layout without admin components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { CalendarDays, FileUp, Truck, FileText, Plus, Eye, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";

export default function SupplierByIdPage() {
  const params = useParams();
  const id = String(params?.id || "");
  const [supplier, setSupplier] = useState<any | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [viewAllOpen, setViewAllOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [shipOpen, setShipOpen] = useState(false);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [quoteForm, setQuoteForm] = useState({ product: '', qty: 0, due: '' });
  const [shipmentForm, setShipmentForm] = useState({ tracking: '', status: 'in_transit' });
  const [invoiceForm, setInvoiceForm] = useState({ amount: 0 });
  const { toast } = useToast();

  const loadData = useCallback(async () => {
    try {
      const s = await fetch("/api/suppliers").then(r => r.json());
      const arr = Array.isArray(s) ? s : Array.isArray(s?.suppliers) ? s.suppliers : [];
      setSupplier(arr.find((x: any) => String(x.id) === id) || null);
    } catch {
      setSupplier(null);
    }
  }, [id]);

  useEffect(() => { loadData(); }, [loadData]);

  const statusBadge = (status:string) => {
    if(status==='in_progress') return { label:'In Progress', color:'bg-warning/20 text-warning border-warning/30' };
    if(status==='pending') return { label:'Pending', color:'bg-muted text-muted-foreground border-border' };
    if(status==='shipped') return { label:'Shipped', color:'bg-success/20 text-success border-success/30' };
    return { label: status, color:'bg-muted text-muted-foreground border-border' };
  };

  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const formatDate = (d:string) => {
    const dt = new Date(d);
    return dt.toLocaleDateString();
  };

  const daysLeft = (d:string) => {
    const diff = (new Date(d).getTime() - Date.now())/(1000*60*60*24);
    return Math.ceil(diff);
  };

  const nextDeliveryDate = (list:any[]) => {
    const sorted = [...list].sort((a,b)=>new Date(a.due).getTime()-new Date(b.due).getTime());
    const next = sorted[0];
    return next ? new Date(next.due).toLocaleDateString(undefined,{ month:'short', day:'2-digit' }) : '—';
  };

  const updateOrderStatus = (orderId:string, status:string) => {
    setOrders(prev => prev.map(o => o.id===orderId ? { ...o, status } : o));
  };

  const documentUpload = () => {
    const input = document.createElement('input');
    input.type='file';
    input.onchange=()=>{};
    input.click();
  };

  return (
    <div className="min-h-screen p-6">
      <div className="mb-4">
        <div className="text-lg font-semibold text-foreground">Supplier Portal</div>
        <div className="text-sm text-muted-foreground">Here’s an overview of your orders and performance</div>
      </div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="text-sm text-muted-foreground">{supplier?.name || 'Supplier User'} • ID: {id}</div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Toggle theme" onClick={()=>setTheme(isDark ? 'light' : 'dark')}>
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
          <Button onClick={() => setQuoteOpen(true)} className="gap-2"><Plus className="w-4 h-4" />New Quote Request</Button>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <StatTile label="Active Orders" value={orders.length} />
        <StatTile alert label="Urgent (<3 days)" value={orders.filter(o=>daysLeft(o.due)<=3).length} />
        <StatTile label="This Month" value={`$${orders.reduce((a,b)=>a+b.amount,0).toLocaleString()}`} trend />
        <StatTile label="Next Delivery" value={nextDeliveryDate(orders)} icon="calendar" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="glass-card lg:col-span-2">
          <CardHeader className="flex items-center justify-between"><CardTitle>Current Orders</CardTitle><Button variant="outline" size="sm" onClick={()=>setViewAllOpen(true)} className="gap-2"><Eye className="w-4 h-4" />View All</Button></CardHeader>
          <CardContent className="space-y-3">
            {orders.slice(0,4).map((o)=>{
              const s = statusBadge(o.status);
              return (
                <div key={o.id} className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                  <div>
                    <div className="font-medium text-foreground">{o.name}</div>
                    <div className="text-sm text-muted-foreground">{o.id} • {o.qty} units</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Due Date</div>
                    <div className="text-lg font-semibold text-foreground">{formatDate(o.due)}</div>
                  </div>
                  <Badge variant="outline" className={s.color}>{s.label}</Badge>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={()=>updateOrderStatus(o.id,'in_progress')}>Start</Button>
                    <Button size="sm" onClick={()=>updateOrderStatus(o.id,'shipped')}>Mark Shipped</Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader><CardTitle>Your Performance</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <PerfBar label="On-Time Delivery" value={0} target={0} />
            <PerfBar label="Quality Score" value={0} target={0} highlight />
            <PerfBar label="Order Fulfillment" value={0} target={0} />
            <PerfBar label="Response Time" value={0} targetLabel="Target: —" valueLabel="—" />
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-6">
        <ActionTile icon={<FileUp className="w-5 h-5" />} title="Upload Documents" subtitle="Certificates, invoices, specs" onClick={()=>documentUpload()} />
        <ActionTile icon={<Truck className="w-5 h-5" />} title="Update Shipment" subtitle="Track & update delivery status" onClick={()=>setShipOpen(true)} />
        <ActionTile icon={<FileText className="w-5 h-5" />} title="Submit Invoice" subtitle="For completed deliveries" onClick={()=>setInvoiceOpen(true)} />
      </div>

      <Sheet open={quoteOpen} onOpenChange={setQuoteOpen}>
        <SheetContent>
          <SheetHeader><SheetTitle>New Quote Request</SheetTitle></SheetHeader>
          <div className="space-y-3 mt-4">
            <Input placeholder="Product" value={quoteForm.product} onChange={e=>setQuoteForm({...quoteForm,product:e.target.value})} />
            <Input type="number" placeholder="Quantity" value={quoteForm.qty} onChange={e=>setQuoteForm({...quoteForm,qty:parseInt(e.target.value||'0',10)})} />
            <Input placeholder="Due Date (YYYY-MM-DD)" value={quoteForm.due} onChange={e=>setQuoteForm({...quoteForm,due:e.target.value})} />
            <Button className="w-full" onClick={async()=>{await fetch('/api/confirmations',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({supplier:id,requested_pipe_id:quoteForm.product,quantity:quoteForm.qty,due_date:quoteForm.due})}); toast({title:'Quote submitted',description:'We will review and respond'}); setQuoteOpen(false);}}>Submit</Button>
          </div>
          <SheetFooter />
        </SheetContent>
      </Sheet>

      <Sheet open={viewAllOpen} onOpenChange={setViewAllOpen}>
        <SheetContent>
          <SheetHeader><SheetTitle>All Orders</SheetTitle></SheetHeader>
          <div className="space-y-3 mt-4">
            {orders.map((o)=>{
              const s = statusBadge(o.status);
              return (
                <div key={o.id} className="flex items-center justify-between p-3 rounded bg-secondary/30">
                  <div className="font-medium">{o.name}</div>
                  <div className="text-sm text-muted-foreground">{o.id}</div>
                  <div className="text-sm">{formatDate(o.due)}</div>
                  <Badge variant="outline" className={s.color}>{s.label}</Badge>
                  <Button size="sm" onClick={()=>updateOrderStatus(o.id,'shipped')}>Mark Shipped</Button>
                </div>
              );
            })}
          </div>
          <SheetFooter />
        </SheetContent>
      </Sheet>

      <Sheet open={shipOpen} onOpenChange={setShipOpen}>
        <SheetContent>
          <SheetHeader><SheetTitle>Update Shipment</SheetTitle></SheetHeader>
          <div className="space-y-3 mt-4">
            <Input placeholder="Tracking Number" value={shipmentForm.tracking} onChange={e=>setShipmentForm({...shipmentForm,tracking:e.target.value})} />
            <select className="border px-2 py-2 rounded" value={shipmentForm.status} onChange={e=>setShipmentForm({...shipmentForm,status:e.target.value})}>
              <option value="in_transit">In Transit</option>
              <option value="delivered">Delivered</option>
            </select>
            <Button className="w-full" onClick={async()=>{toast({title:'Shipment updated',description:`${shipmentForm.tracking}`}); setShipOpen(false);}}>Save</Button>
          </div>
          <SheetFooter />
        </SheetContent>
      </Sheet>

      <Sheet open={invoiceOpen} onOpenChange={setInvoiceOpen}>
        <SheetContent>
          <SheetHeader><SheetTitle>Submit Invoice</SheetTitle></SheetHeader>
          <div className="space-y-3 mt-4">
            <Input type="number" placeholder="Amount" value={invoiceForm.amount} onChange={e=>setInvoiceForm({amount:parseFloat(e.target.value||'0')})} />
            <Input type="file" onChange={()=>setUploading(true)} />
            <Button className="w-full" disabled={uploading} onClick={async()=>{await fetch('/api/confirmations',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({supplier:id,invoice_amount:invoiceForm.amount})}); setUploading(false); toast({title:'Invoice submitted',description:'Processing'}); setInvoiceOpen(false);}}>Submit</Button>
          </div>
          <SheetFooter />
        </SheetContent>
      </Sheet>
    </div>
  );
}

 

function StatTile({ label, value, alert, icon }: { label: string; value: any; alert?: boolean; icon?: "calendar" }){
  return (
    <Card className="glass-card">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className={`text-3xl font-bold ${alert ? 'text-warning' : 'text-foreground'}`}>{value}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-secondary/40 flex items-center justify-center">
            {icon === 'calendar' ? <CalendarDays className="w-6 h-6 text-muted-foreground" /> : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PerfBar({ label, value, target, highlight, valueLabel, targetLabel }:{ label:string; value:number; target?:number; highlight?:boolean; valueLabel?:string; targetLabel?:string }){
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className={`text-sm ${highlight ? 'text-success' : 'text-foreground'}`}>{valueLabel || `${value}%`}</span>
      </div>
      <Progress value={value} />
      <div className="text-xs text-muted-foreground mt-1">{targetLabel || `Target: ${target}%`}</div>
    </div>
  );
}

function ActionTile({ icon, title, subtitle, onClick }:{ icon: React.ReactNode; title:string; subtitle:string; onClick:()=>void }){
  return (
    <div className="p-5 rounded-xl bg-secondary/30 border border-border/40">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center">{icon}</div>
        <div>
          <div className="font-medium text-foreground">{title}</div>
          <div className="text-sm text-muted-foreground">{subtitle}</div>
        </div>
        <div className="ml-auto">
          <Button variant="outline" onClick={onClick}>Open</Button>
        </div>
      </div>
    </div>
  );
}

 
