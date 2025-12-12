import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/src/components/layout/DashboardLayout';
import { StatCard } from '@/src/components/dashboard/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Package, Truck, AlertTriangle } from 'lucide-react';

type Product = { id: string; name: string; stock: number };

const Materials = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    let mounted = true;
    fetch('/api/products')
      .then(r => r.json())
      .then(d => { if (mounted) setProducts(Array.isArray(d) ? d : []); })
      .catch(() => { if (mounted) setProducts([]); });
    return () => { mounted = false; };
  }, []);

  return (
    <DashboardLayout title="Raw Materials" subtitle="Inventory & supply tracking">
      <div className="data-grid">
        <StatCard
          title="Steel Coils"
          value="12,450 kg"
          icon={Package}
          variant="primary"
          subtitle="High carbon steel"
        />
        <StatCard
          title="Alloy Stock"
          value="5,200 kg"
          icon={Package}
          variant="success"
          subtitle="Grade A alloys"
        />
        <StatCard
          title="Pending Delivery"
          value="8,000 kg"
          icon={Truck}
          variant="warning"
          subtitle="ETA: 48 hours"
        />
        <StatCard
          title="Low Stock Alerts"
          value="2"
          icon={AlertTriangle}
          variant="danger"
          subtitle="Items below threshold"
        />
      </div>

      <Card className="glass-card mt-6">
        <CardHeader>
          <CardTitle>Material Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary">
                <tr>
                  <th className="p-2 text-left">ID</th>
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-left">Stock</th>
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
                  <tr className="border-t border-border">
                    <td className="p-2" colSpan={3}>No materials</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Materials;
