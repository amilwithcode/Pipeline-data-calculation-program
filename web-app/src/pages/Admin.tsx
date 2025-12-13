import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Package, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  LogOut,
  Factory,
  Search,
  Filter,
  MoreVertical,
  UserPlus,
  Mail
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Input } from '@/src/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/src/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu';
import { useToast } from '@/src/hooks/use-toast';
import { Progress } from '@/src/components/ui/progress';

interface User {
  id: string;
  name?: string;
  email: string;
  role?: 'admin' | 'supplier' | 'viewer';
  status?: 'active' | 'pending' | 'suspended';
  company?: string;
  lastActive?: string;
}

interface Supplier {
  id: string;
  name: string;
  company: string;
  email: string;
  rating: number;
  deliveryScore: number;
  qualityScore: number;
  activeOrders: number;
  status: 'active' | 'pending' | 'inactive';
}


const mockSuppliers: Supplier[] = [
  { id: '1', name: 'John Smith', company: 'SteelWorks Inc.', email: 'john@steelworks.com', rating: 4.8, deliveryScore: 96, qualityScore: 98, activeOrders: 5, status: 'active' },
  { id: '2', name: 'Emily Davis', company: 'Premium Fittings', email: 'emily@fittings.com', rating: 4.5, deliveryScore: 92, qualityScore: 95, activeOrders: 3, status: 'active' },
  { id: '3', name: 'Mike Johnson', company: 'ValveCo', email: 'mike@valveco.com', rating: 0, deliveryScore: 0, qualityScore: 0, activeOrders: 0, status: 'pending' },
  { id: '4', name: 'Lisa Wang', company: 'Industrial Gaskets', email: 'lisa@gaskets.com', rating: 4.2, deliveryScore: 88, qualityScore: 91, activeOrders: 2, status: 'active' },
];

const roleConfig = {
  admin: { label: 'Admin', color: 'bg-destructive/20 text-destructive border-destructive/30' },
  supplier: { label: 'Supplier', color: 'bg-primary/20 text-primary border-primary/30' },
  viewer: { label: 'Viewer', color: 'bg-muted text-muted-foreground border-border' },
};

const statusConfig = {
  active: { label: 'Active', icon: CheckCircle2, color: 'bg-success/20 text-success border-success/30' },
  pending: { label: 'Pending', icon: Clock, color: 'bg-warning/20 text-warning border-warning/30' },
  suspended: { label: 'Suspended', icon: XCircle, color: 'bg-destructive/20 text-destructive border-destructive/30' },
  inactive: { label: 'Inactive', icon: XCircle, color: 'bg-muted text-muted-foreground border-border' },
};

export default function Admin() {
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePassword, setInvitePassword] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin'|'supplier'|'viewer'>('supplier');
  const [inviteCompany, setInviteCompany] = useState('');
  const [inviting, setInviting] = useState(false);
  const [supplierProfileOpen, setSupplierProfileOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [supplierOrders, setSupplierOrders] = useState<any[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/auth');
      return;
    }
    const parsed = JSON.parse(storedUser);
    if (parsed.role !== 'admin') {
      toast({ title: 'Access Denied', description: 'Admin access required', variant: 'destructive' });
      navigate('/');
      return;
    }
    setUser(parsed);
  }, [navigate, toast]);

  useEffect(() => {
    let mounted = true;
    fetch('/api/users')
      .then((r) => r.json())
      .then((arr) => {
        if (!mounted) return;
        const list: User[] = Array.isArray(arr) ? arr.map((u: any) => ({
          id: String(u.id ?? u.email ?? Math.random()),
          name: String(u.name ?? u.full_name ?? '').trim() || undefined,
          email: String(u.email ?? ''),
          role: (u.role ?? 'viewer'),
          status: (u.status ?? 'active'),
          company: u.company ?? u.company_name ?? undefined,
          lastActive: u.last_active ?? u.lastActive ?? undefined,
        })) : [];
        setUsers(list);
      })
      .catch(() => { if (!mounted) return; setUsers([]); });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    if (!supplierProfileOpen || !selectedSupplier) { setSupplierOrders([]); return; }
    const sid = selectedSupplier.id ? String(selectedSupplier.id) : undefined;
    const sname = selectedSupplier.company || selectedSupplier.name;
    const qs = sid ? `supplier_id=${encodeURIComponent(sid)}` : `supplier=${encodeURIComponent(sname)}`;
    fetch(`/api/orders?${qs}`)
      .then(r => r.json())
      .then(d => { if (!mounted) return; setSupplierOrders(Array.isArray(d.orders) ? d.orders : []); })
      .catch(() => { if (!mounted) return; setSupplierOrders([]); });
    return () => { mounted = false; };
  }, [supplierProfileOpen, selectedSupplier]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    toast({ title: 'Logged out', description: 'See you next time!' });
    navigate('/auth');
  };

  const handleApprove = (id: string, type: 'user' | 'supplier') => {
    toast({ title: 'Approved', description: `${type === 'user' ? 'User' : 'Supplier'} has been approved` });
  };

  const filteredUsers = users.filter(u => 
    (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSuppliers = mockSuppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingApprovals = users.filter(u => u.status === 'pending').length + 
                          mockSuppliers.filter(s => s.status === 'pending').length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-destructive to-destructive/70 flex items-center justify-center">
              <Shield className="w-5 h-5 text-destructive-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-foreground text-lg">Admin Panel</h1>
              <p className="text-xs text-muted-foreground">PipeFlow Industries</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => navigate('/')}>
              <Factory className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <Button size="sm" className="gap-2" onClick={() => navigate('/auth')}>
              <Shield className="w-4 h-4" />
              Admin
            </Button>
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">{user?.name}</p>
              <p className="text-xs text-muted-foreground">Administrator</p>
            </div>
            <Button variant="outline" className="gap-2" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Quick Stats */}
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
                  <p className="text-3xl font-bold text-foreground">{mockSuppliers.filter(s => s.status === 'active').length}</p>
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
                  <p className="text-3xl font-bold text-foreground">4.5</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Management</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
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
                  <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as any)}>
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
                        fetch('/api/users').then(rr => rr.json()).then(arr => {
                          const list: User[] = Array.isArray(arr) ? arr.map((u: any) => ({
                            id: String(u.id ?? u.email ?? Math.random()),
                            name: String(u.name ?? u.full_name ?? '').trim() || undefined,
                            email: String(u.email ?? ''),
                            role: (u.role ?? 'viewer'),
                            status: (u.status ?? 'active'),
                            company: u.company ?? u.company_name ?? undefined,
                            lastActive: u.last_active ?? u.lastActive ?? undefined,
                          })) : [];
                          setUsers(list);
                        }).catch(() => {});
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
                <TabsTrigger value="suppliers">Suppliers ({mockSuppliers.length})</TabsTrigger>
                <TabsTrigger value="pending">Pending ({pendingApprovals})</TabsTrigger>
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
                    {filteredUsers.map((user) => {
                      const roleStyle = roleConfig[(user.role ?? 'viewer') as keyof typeof roleConfig];
                      const statusStyle = statusConfig[(user.status ?? 'active') as keyof typeof statusConfig];
                      const StatusIcon = statusStyle.icon;
                      return (
                        <TableRow key={user.id} className="table-row-hover">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                                {(user.name || user.email || '').split(' ').map(n => n[0]).join('')}
                              </div>
                              <div>
                                <p className="font-medium text-foreground">{user.name || '—'}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={roleStyle.color}>
                              {roleStyle.label}
                            </Badge>
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
                                  <DropdownMenuItem onClick={() => handleApprove(user.id, 'user')}>
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
                      <TableHead>Rating</TableHead>
                      <TableHead>Delivery</TableHead>
                      <TableHead>Quality</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSuppliers.map((supplier) => {
                      const statusStyle = statusConfig[supplier.status];
                      const StatusIcon = statusStyle.icon;
                      return (
                        <TableRow key={supplier.id} className="table-row-hover">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center text-sm font-semibold text-accent">
                                {supplier.company.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </div>
                              <div>
                                <p className="font-medium text-foreground">{supplier.company}</p>
                                <p className="text-sm text-muted-foreground">{supplier.name}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold text-foreground">
                              {supplier.rating > 0 ? `${supplier.rating.toFixed(1)} ⭐` : '—'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className={supplier.deliveryScore >= 90 ? 'text-success' : supplier.deliveryScore >= 80 ? 'text-warning' : 'text-muted-foreground'}>
                              {supplier.deliveryScore > 0 ? `${supplier.deliveryScore}%` : '—'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className={supplier.qualityScore >= 95 ? 'text-success' : supplier.qualityScore >= 85 ? 'text-warning' : 'text-muted-foreground'}>
                              {supplier.qualityScore > 0 ? `${supplier.qualityScore}%` : '—'}
                            </span>
                          </TableCell>
                          <TableCell className="text-foreground">{supplier.activeOrders}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={statusStyle.color}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusStyle.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onSelect={() => { setSelectedSupplier(supplier); setSupplierProfileOpen(true); }}>View Profile</DropdownMenuItem>
                                <DropdownMenuItem>View Orders</DropdownMenuItem>
                                {supplier.status === 'pending' && (
                                  <DropdownMenuItem onClick={() => handleApprove(supplier.id, 'supplier')}>
                                    <CheckCircle2 className="w-4 h-4 mr-2 text-success" />
                                    Approve
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem className="text-destructive">Deactivate</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                
                <Dialog open={supplierProfileOpen} onOpenChange={(o) => { setSupplierProfileOpen(o); if (!o) setSelectedSupplier(null); }}>
                  <DialogContent className="max-w-5xl w-full">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Factory className="w-5 h-5 text-primary" />
                        </div>
                        <span>{selectedSupplier?.company || selectedSupplier?.name || 'Supplier Profile'}</span>
                        {selectedSupplier?.status && (
                          <Badge variant="outline" className="ml-2">{String(selectedSupplier.status)}</Badge>
                        )}
                      </DialogTitle>
                      <DialogDescription>
                        {selectedSupplier?.email || '—'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid md:grid-cols-3 gap-6">
                      <Card className="md:col-span-3">
                        <CardContent className="p-4 flex flex-wrap items-center gap-4 justify-between">
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">Rating</p>
                            <p className="text-xl font-semibold">{selectedSupplier?.rating ?? '—'}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">Delivery Score</p>
                            <p className="text-xl font-semibold">{selectedSupplier?.deliveryScore ?? '—'}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">Quality Score</p>
                            <p className="text-xl font-semibold">{selectedSupplier?.qualityScore ?? '—'}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">Active Orders</p>
                            <p className="text-xl font-semibold">{selectedSupplier?.activeOrders ?? 0}</p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader><CardTitle>Performance Metrics</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <div className="flex justify-between text-xs mb-1"><span>On-Time Delivery</span><span>{selectedSupplier?.deliveryScore ?? 0}%</span></div>
                            <Progress value={selectedSupplier?.deliveryScore ?? 0} />
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1"><span>Quality Score</span><span>{selectedSupplier?.qualityScore ?? 0}%</span></div>
                            <Progress value={selectedSupplier?.qualityScore ?? 0} />
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="md:col-span-2">
                        <CardHeader><CardTitle>Recent Orders</CardTitle></CardHeader>
                        <CardContent>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead className="bg-secondary">
                                <tr>
                                  <th className="p-2 text-left">Order</th>
                                  <th className="p-2 text-left">Material</th>
                                  <th className="p-2 text-left">Quantity</th>
                                  <th className="p-2 text-left">Status</th>
                                  <th className="p-2 text-left">Value</th>
                                </tr>
                              </thead>
                              <tbody>
                                {supplierOrders.map((o: any, idx: number) => (
                                  <tr key={idx} className="border-t border-border">
                                    <td className="p-2">{o.code || o.id}</td>
                                    <td className="p-2">{o.material || '—'}</td>
                                    <td className="p-2">{o.quantity ? `${o.quantity} units` : '—'}</td>
                                    <td className="p-2">{o.status || '—'}</td>
                                    <td className="p-2">{o.value ? `$${o.value}` : '—'}</td>
                                  </tr>
                                ))}
                                {!supplierOrders.length && (
                                  <tr className="border-t border-border"><td className="p-2" colSpan={5}>Sifariş yoxdur</td></tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </DialogContent>
                </Dialog>
              </TabsContent>

              <TabsContent value="pending">
                <div className="space-y-4">
                  {[...users.filter(u => u.status === 'pending'), ...mockSuppliers.filter(s => s.status === 'pending')].map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
                          <Clock className="w-5 h-5 text-warning" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{item.name}</p>
                          <p className="text-sm text-muted-foreground">{item.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="text-destructive">
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                        <Button size="sm" onClick={() => handleApprove(item.id, 'company' in item ? 'supplier' : 'user')}>
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                      </div>
                    </div>
                  ))}
                  {pendingApprovals === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-success" />
                      <p>No pending approvals</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
