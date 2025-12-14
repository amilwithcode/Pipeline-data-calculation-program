import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/src/components/layout/DashboardLayout';
import { StatCard } from '@/src/components/dashboard/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Package, Truck, AlertTriangle } from 'lucide-react';
import { Input } from '@/src/components/ui/input';
import { Button } from '@/src/components/ui/button';

type Product = { id: string; name: string; stock: number };

const Materials = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [newId, setNewId] = useState('');
  const [newName, setNewName] = useState('');
  const [newStock, setNewStock] = useState<number>(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingStock, setEditingStock] = useState<number>(0);

  const reload = () => {
    fetch('/api/products')
      .then(r => r.json())
      .then((arr: any[]) => setProducts(arr.map((p: any) => ({ id: String(p.id), name: p.name ?? p.pipeline_name ?? '', stock: Number(p.stock ?? p.pipeline_stock ?? 0) }))))
      .catch(() => setProducts([]));
  };

  useEffect(() => {
    let mounted = true;
    fetch('/api/products')
      .then(r => r.json())
      .then(d => {
        if (!mounted) return;
        const arr = Array.isArray(d) ? d : [];
        const mapped = arr.map((p: any) => ({ id: String(p.id), name: p.name ?? p.pipeline_name ?? '', stock: Number(p.stock ?? p.pipeline_stock ?? 0) }));
        setProducts(mapped);
      })
      .catch(() => { if (mounted) setProducts([]); });
    let t: any = null;
    try {
      const es = new EventSource('http://127.0.0.1:8000/api/events');
      es.onmessage = (ev) => {
        if (!mounted) return;
        try {
          const d = JSON.parse(ev.data);
          const arr = Array.isArray(d?.products) ? d.products : [];
          const mapped = arr.map((p: any) => ({ id: String(p.id), name: p.name ?? p.pipeline_name ?? '', stock: Number(p.stock ?? p.pipeline_stock ?? 0) }));
          setProducts(mapped);
        } catch {}
      };
      es.onerror = () => {
        try { es.close(); } catch {}
        t = setInterval(reload, 15000);
      };
      return () => { mounted = false; try { es.close(); } catch {}; if (t) clearInterval(t); };
    } catch {
      t = setInterval(reload, 15000);
      return () => { mounted = false; if (t) clearInterval(t); };
    }
  }, []);

  

  const handleCreate = async () => {
    if (!newId || !newName) return;
    await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: newId, pipeline_name: newName, pipeline_stock: newStock }),
    });
    setNewId(''); setNewName(''); setNewStock(0);
    reload();
  };

  const handleEdit = (p: Product) => {
    setEditingId(p.id); setEditingName(p.name); setEditingStock(p.stock);
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    await fetch(`/api/products/${encodeURIComponent(editingId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editingName, stock: editingStock }),
    });
    setEditingId(null);
    reload();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/products/${encodeURIComponent(id)}`, { method: 'DELETE' });
    reload();
  };

  return (
    <DashboardLayout title="Xammal" subtitle="Anbar və təchizat izlənməsi">
      <Card className="glass-card mb-6">
        <CardHeader>
          <CardTitle>Məhsul əlavə et</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Input placeholder="ID" value={newId} onChange={(e)=>setNewId(e.target.value)} />
            <Input placeholder="Ad" value={newName} onChange={(e)=>setNewName(e.target.value)} />
            <Input type="number" placeholder="Stok" value={newStock} onChange={(e)=>setNewStock(Number(e.target.value||0))} />
            <Button onClick={handleCreate} disabled={!newId || !newName}>Məhsulları yadda saxla</Button>
          </div>
        </CardContent>
      </Card>
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
          <CardTitle>Material anbarı</CardTitle>
          </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary">
                <tr>
                  <th className="p-2 text-left">ID</th>
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-left">Stock</th>
                  <th className="p-2 text-left">Əməliyyat</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} className="border-t border-border">
                    <td className="p-2">{p.id}</td>
                    <td className="p-2">
                      {editingId === p.id ? (
                        <Input value={editingName} onChange={(e)=>setEditingName(e.target.value)} />
                      ) : p.name}
                    </td>
                    <td className="p-2">
                      {editingId === p.id ? (
                        <Input type="number" value={editingStock} onChange={(e)=>setEditingStock(Number(e.target.value||0))} />
                      ) : p.stock}
                    </td>
                    <td className="p-2">
                      {editingId === p.id ? (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleUpdate}>Yadda saxla</Button>
                          <Button size="sm" variant="ghost" onClick={()=>setEditingId(null)}>İmtina</Button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={()=>handleEdit(p)}>Düzəliş et</Button>
                          <Button size="sm" variant="destructive" onClick={()=>handleDelete(p.id)}>Sil</Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {!products.length && (
                  <tr className="border-t border-border">
                    <td className="p-2" colSpan={4}>Material yoxdur</td>
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
