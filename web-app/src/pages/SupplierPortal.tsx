import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  Truck, 
  FileText, 
  TrendingUp, 
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Upload,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

interface Order {
  id: string;
  material: string;
  quantity: number;
  unit: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'shipped' | 'delivered';
}

interface PerformanceMetric {
  label: string;
  value: number;
  target: number;
  unit: string;
}

const mockOrders: Order[] = [
  { id: 'PO-2024-001', material: 'Steel Pipes (4")', quantity: 500, unit: 'units', dueDate: '2024-12-15', status: 'in_progress' },
  { id: 'PO-2024-002', material: 'Valves (Gate)', quantity: 200, unit: 'units', dueDate: '2024-12-18', status: 'pending' },
  { id: 'PO-2024-003', material: 'Fittings Kit', quantity: 1000, unit: 'sets', dueDate: '2024-12-12', status: 'shipped' },
  { id: 'PO-2024-004', material: 'Gaskets (Industrial)', quantity: 2500, unit: 'units', dueDate: '2024-12-20', status: 'pending' },
];

const mockMetrics: PerformanceMetric[] = [
  { label: 'On-Time Delivery', value: 94, target: 95, unit: '%' },
  { label: 'Quality Score', value: 98, target: 95, unit: '%' },
  { label: 'Order Fulfillment', value: 87, target: 90, unit: '%' },
  { label: 'Response Time', value: 2.4, target: 4, unit: 'hrs' },
];

const statusConfig = {
  pending: { label: 'Pending', icon: Clock, color: 'bg-warning/20 text-warning border-warning/30' },
  in_progress: { label: 'In Progress', icon: Package, color: 'bg-info/20 text-info border-info/30' },
  shipped: { label: 'Shipped', icon: Truck, color: 'bg-primary/20 text-primary border-primary/30' },
  delivered: { label: 'Delivered', icon: CheckCircle2, color: 'bg-success/20 text-success border-success/30' },
};

export default function SupplierPortal() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/auth');
      return;
    }
    setUser(JSON.parse(storedUser));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    toast({ title: 'Logged out', description: 'See you next time!' });
    navigate('/auth');
  };

  const activeOrders = mockOrders.filter(o => o.status !== 'delivered').length;
  const urgentOrders = mockOrders.filter(o => {
    const dueDate = new Date(o.dueDate);
    const today = new Date();
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && o.status !== 'delivered';
  }).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Package className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-foreground text-lg">Supplier Portal</h1>
              <p className="text-xs text-muted-foreground">PipeFlow Industries</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">{user?.name || 'Supplier'}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Welcome back, {user?.name?.split(' ')[0] || 'Supplier'}</h2>
            <p className="text-muted-foreground">Here's an overview of your orders and performance</p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            New Quote Request
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass-card">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Orders</p>
                  <p className="text-3xl font-bold text-foreground">{activeOrders}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Urgent (≤3 days)</p>
                  <p className="text-3xl font-bold text-warning">{urgentOrders}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">This Month</p>
                  <p className="text-3xl font-bold text-foreground">$47.2K</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Next Delivery</p>
                  <p className="text-3xl font-bold text-foreground">Dec 12</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Orders List */}
          <Card className="glass-card lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">Current Orders</CardTitle>
              <Button variant="outline" size="sm">View All</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockOrders.map((order) => {
                  const config = statusConfig[order.status];
                  const StatusIcon = config.icon;
                  return (
                    <div 
                      key={order.id} 
                      className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Package className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{order.material}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.id} • {order.quantity.toLocaleString()} {order.unit}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Due Date</p>
                          <p className="font-medium text-foreground">{new Date(order.dueDate).toLocaleDateString()}</p>
                        </div>
                        <Badge variant="outline" className={config.color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {config.label}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Your Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {mockMetrics.map((metric) => {
                const percentage = metric.unit === '%' ? metric.value : (metric.value / metric.target) * 100;
                const isGood = metric.unit === 'hrs' ? metric.value <= metric.target : metric.value >= metric.target;
                return (
                  <div key={metric.label} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{metric.label}</span>
                      <span className={`text-sm font-semibold ${isGood ? 'text-success' : 'text-warning'}`}>
                        {metric.value}{metric.unit}
                      </span>
                    </div>
                    <Progress 
                      value={Math.min(percentage, 100)} 
                      className="h-2"
                    />
                    <p className="text-xs text-muted-foreground">Target: {metric.target}{metric.unit}</p>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="glass-card hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Upload Documents</p>
                <p className="text-sm text-muted-foreground">Certificates, invoices, specs</p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <Truck className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Update Shipment</p>
                <p className="text-sm text-muted-foreground">Track & update delivery status</p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Submit Invoice</p>
                <p className="text-sm text-muted-foreground">For completed deliveries</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}