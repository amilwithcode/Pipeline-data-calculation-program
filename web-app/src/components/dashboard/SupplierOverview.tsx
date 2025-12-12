import { useEffect, useState } from 'react';
import { Building2, TrendingUp, TrendingDown, Star, Truck } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface Supplier {
  id: string;
  name: string;
  rating: number;
  deliveryScore: number;
  qualityScore: number;
  activeOrders: number;
  trend: 'up' | 'down' | 'stable';
  status: 'active' | 'pending' | 'issue';
}


const statusConfig = {
  active: { label: 'Active', color: 'bg-success/10 text-success border-success/30' },
  pending: { label: 'Pending', color: 'bg-warning/10 text-warning border-warning/30' },
  issue: { label: 'Issue', color: 'bg-destructive/10 text-destructive border-destructive/30' }
};

export const SupplierOverview = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  useEffect(() => {
    let mounted = true;
    fetch('/api/suppliers')
      .then(r => r.json())
      .then(d => { if (!mounted) return; setSuppliers(Array.isArray(d.suppliers) ? d.suppliers : []); })
      .catch(() => { if (!mounted) return; setSuppliers([]); });
    return () => { mounted = false; };
  }, []);
  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Supplier Overview</h2>
          <p className="text-sm text-muted-foreground">Performance & order status</p>
        </div>
        <span className="text-sm text-muted-foreground">{suppliers.length} Active Suppliers</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Supplier</th>
              <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Rating</th>
              <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Delivery</th>
              <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Quality</th>
              <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Orders</th>
              <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {suppliers.map((supplier) => (
              <tr key={supplier.id} className="table-row-hover">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{supplier.name}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        {supplier.trend === 'up' && <TrendingUp className="w-3 h-3 text-success" />}
                        {supplier.trend === 'down' && <TrendingDown className="w-3 h-3 text-destructive" />}
                        <span className="text-xs text-muted-foreground">
                          {supplier.trend === 'up' ? 'Improving' : supplier.trend === 'down' ? 'Declining' : 'Stable'}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Star className="w-4 h-4 text-warning fill-warning" />
                    <span className="text-sm font-medium text-foreground">{supplier.rating}</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className={cn(
                    "text-sm font-mono font-medium",
                    supplier.deliveryScore >= 95 ? "text-success" : 
                    supplier.deliveryScore >= 90 ? "text-warning" : "text-destructive"
                  )}>
                    {supplier.deliveryScore}%
                  </span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className={cn(
                    "text-sm font-mono font-medium",
                    supplier.qualityScore >= 95 ? "text-success" : 
                    supplier.qualityScore >= 90 ? "text-warning" : "text-destructive"
                  )}>
                    {supplier.qualityScore}%
                  </span>
                </td>
                <td className="py-4 px-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Truck className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">{supplier.activeOrders}</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className={cn(
                    "badge-status border",
                    statusConfig[supplier.status].color
                  )}>
                    {statusConfig[supplier.status].label}
                  </span>
                </td>
              </tr>
            ))}
            {!suppliers.length && (
              <tr className="table-row-hover">
                <td className="py-6 px-4 text-center text-sm text-muted-foreground" colSpan={6}>No suppliers</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
