import { Truck, Package, MapPin, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useEffect, useState } from 'react';

interface Shipment {
  id: string;
  orderId: string;
  destination: string;
  status: 'in-transit' | 'delivered' | 'delayed' | 'pending';
  eta: string;
  progress: number;
  carrier: string;
  quantity: number;
}

export const LogisticsTracker = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [newShipment, setNewShipment] = useState<any>({ orderId:'', destination:'', status:'pending', eta:'', progress:0, carrier:'', quantity:0 });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRow, setEditRow] = useState<Shipment | null>(null);
  useEffect(() => {
    let mounted = true;
    fetch('/api/shipments')
      .then(r => r.json())
      .then(d => { if (!mounted) return; setShipments(Array.isArray(d.shipments) ? d.shipments : []); })
      .catch(() => { if (!mounted) return; setShipments([]); });
    return () => { mounted = false; };
  }, []);
  const reload = () => {
    fetch('/api/shipments')
      .then(r => r.json())
      .then(d => { setShipments(Array.isArray(d.shipments) ? d.shipments : []); })
      .catch(() => { setShipments([]); });
  };

const statusConfig = {
  'in-transit': { icon: Truck, color: 'text-primary', bgColor: 'bg-primary/10', label: 'In Transit' },
  'delivered': { icon: CheckCircle2, color: 'text-success', bgColor: 'bg-success/10', label: 'Delivered' },
  'delayed': { icon: AlertCircle, color: 'text-destructive', bgColor: 'bg-destructive/10', label: 'Delayed' },
  'pending': { icon: Clock, color: 'text-warning', bgColor: 'bg-warning/10', label: 'Pending' },
};

  const inTransit = shipments.filter(s => s.status === 'in-transit').length;
  const delivered = shipments.filter(s => s.status === 'delivered').length;
  const delayed = shipments.filter(s => s.status === 'delayed').length;

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Logistics Tracker</h2>
          <p className="text-sm text-muted-foreground">Active shipments & deliveries</p>
        </div>
        <div className="flex gap-4">
          <div className="text-center">
            <p className="text-xl font-bold text-primary font-mono">{inTransit}</p>
            <p className="text-xs text-muted-foreground">In Transit</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-success font-mono">{delivered}</p>
            <p className="text-xs text-muted-foreground">Delivered</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-destructive font-mono">{delayed}</p>
            <p className="text-xs text-muted-foreground">Delayed</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-6 gap-2 mb-4">
        <input className="border px-2 py-1 rounded" placeholder="Order ID" value={newShipment.orderId} onChange={(e)=>setNewShipment((s:any)=>({...s, orderId:e.target.value }))} />
        <input className="border px-2 py-1 rounded" placeholder="Destination" value={newShipment.destination} onChange={(e)=>setNewShipment((s:any)=>({...s, destination:e.target.value }))} />
        <select className="border px-2 py-1 rounded" value={newShipment.status} onChange={(e)=>setNewShipment((s:any)=>({...s, status:e.target.value }))}>
          <option value="pending">pending</option>
          <option value="in-transit">in-transit</option>
          <option value="delivered">delivered</option>
          <option value="delayed">delayed</option>
        </select>
        <input className="border px-2 py-1 rounded" placeholder="ETA" value={newShipment.eta} onChange={(e)=>setNewShipment((s:any)=>({...s, eta:e.target.value }))} />
        <input className="border px-2 py-1 rounded" type="number" placeholder="Progress %" value={newShipment.progress} onChange={(e)=>setNewShipment((s:any)=>({...s, progress: parseInt(e.target.value||'0',10) }))} />
        <input className="border px-2 py-1 rounded" placeholder="Carrier" value={newShipment.carrier} onChange={(e)=>setNewShipment((s:any)=>({...s, carrier:e.target.value }))} />
        <input className="border px-2 py-1 rounded" type="number" placeholder="Quantity" value={newShipment.quantity} onChange={(e)=>setNewShipment((s:any)=>({...s, quantity: parseInt(e.target.value||'0',10) }))} />
        <button className="px-3 py-1 rounded bg-primary text-primary-foreground" onClick={async()=>{
          await fetch('/api/shipments', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ ...newShipment, id: String(Date.now()) }) });
          setNewShipment({ orderId:'', destination:'', status:'pending', eta:'', progress:0, carrier:'', quantity:0 });
          reload();
        }}>Yeni shipment</button>
      </div>

      <div className="space-y-4">
        {shipments.map((shipment) => {
          const config = statusConfig[shipment.status];
          const Icon = config.icon;
          
          return (
            <div 
              key={shipment.id}
              className="p-4 rounded-lg bg-secondary/30 border border-border/50 hover:border-primary/30 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", config.bgColor)}>
                    <Icon className={cn("w-5 h-5", config.color)} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {editingId === shipment.id ? (
                        <input className="border px-2 py-1 rounded" value={editRow?.orderId || ''} onChange={(e)=>setEditRow((r:any)=>({...(r||{}), orderId:e.target.value}))} />
                      ) : shipment.orderId}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      {editingId === shipment.id ? (
                        <input className="border px-2 py-1 rounded" value={editRow?.destination || ''} onChange={(e)=>setEditRow((r:any)=>({...(r||{}), destination:e.target.value}))} />
                      ) : shipment.destination}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={cn("badge-status", config.bgColor, config.color)}>
                    {config.label}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">
                    {editingId === shipment.id ? (
                      <input className="border px-2 py-1 rounded" value={editRow?.eta || ''} onChange={(e)=>setEditRow((r:any)=>({...(r||{}), eta:e.target.value}))} />
                    ) : shipment.eta}
                  </p>
                </div>
              </div>

              <div className="mb-2">
                <div className="progress-bar">
                  <div 
                    className={cn(
                      "progress-bar-fill",
                      shipment.status === 'delivered' ? 'bg_success' :
                      shipment.status === 'delayed' ? 'bg-destructive' :
                      shipment.status === 'in-transit' ? 'bg-primary' : 'bg-warning'
                    )}
                    style={{ width: `${editingId === shipment.id ? (editRow?.progress ?? 0) : shipment.progress}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Package className="w-3 h-3" />
                  {editingId === shipment.id ? (
                    <input className="border px-2 py-1 rounded w-24" type="number" value={editRow?.quantity ?? 0} onChange={(e)=>setEditRow((r:any)=>({...(r||{}), quantity: parseInt(e.target.value||'0',10)}))} />
                  ) : `${shipment.quantity.toLocaleString()} units`}
                </div>
                <span>Carrier: {editingId === shipment.id ? (
                  <input className="border px-2 py-1 rounded" value={editRow?.carrier || ''} onChange={(e)=>setEditRow((r:any)=>({...(r||{}), carrier: e.target.value}))} />
                ) : shipment.carrier}</span>
              </div>
              <div className="mt-3 flex gap-2">
                {editingId === shipment.id ? (
                  <>
                    <select className="border px-2 py-1 rounded" value={editRow?.status || 'pending'} onChange={(e)=>setEditRow((r:any)=>({...(r||{}), status: e.target.value}))}>
                      <option value="pending">pending</option>
                      <option value="in-transit">in-transit</option>
                      <option value="delivered">delivered</option>
                      <option value="delayed">delayed</option>
                    </select>
                    <button className="px-2 py-1 rounded bg-primary text-primary-foreground" onClick={async()=>{
                      const payload = { orderId: editRow?.orderId, destination: editRow?.destination, status: editRow?.status, eta: editRow?.eta, progress: editRow?.progress, carrier: editRow?.carrier, quantity: editRow?.quantity };
                      await fetch(`/api/shipments/${encodeURIComponent(String(shipment.id))}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
                      setEditingId(null); setEditRow(null); reload();
                    }}>Yadda saxla</button>
                    <button className="px-2 py-1 border rounded" onClick={()=>{ setEditingId(null); setEditRow(null); }}>İmtina</button>
                  </>
                ) : (
                  <>
                    <button className="px-2 py-1 border rounded" onClick={()=>{ setEditingId(shipment.id); setEditRow(shipment); }}>Düzəliş et</button>
                    <button className="px-2 py-1 border rounded text-destructive" onClick={async()=>{
                      await fetch(`/api/shipments/${encodeURIComponent(String(shipment.id))}`, { method:'DELETE' });
                      reload();
                    }}>Sil</button>
                  </>
                )}
              </div>
            </div>
          );
        })}
        {!shipments.length && (
          <div className="text-center py-8 text-sm text-muted-foreground">No shipments</div>
        )}
      </div>
    </div>
  );
};
