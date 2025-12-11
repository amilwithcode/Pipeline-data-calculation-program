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
  Settings,
  LogOut,
  Factory,
  Search,
  Filter,
  MoreVertical,
  UserPlus,
  Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'supplier' | 'viewer';
  status: 'active' | 'pending' | 'suspended';
  company?: string;
  lastActive: string;
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

const mockUsers: User[] = [
  { id: '1', name: 'John Smith', email: 'john@steelworks.com', role: 'supplier', status: 'active', company: 'SteelWorks Inc.', lastActive: '2 hours ago' },
  { id: '2', name: 'Sarah Connor', email: 'sarah@pipeflow.com', role: 'admin', status: 'active', lastActive: '5 minutes ago' },
  { id: '3', name: 'Mike Johnson', email: 'mike@valveco.com', role: 'supplier', status: 'pending', company: 'ValveCo', lastActive: 'Never' },
  { id: '4', name: 'Emily Davis', email: 'emily@fittings.com', role: 'supplier', status: 'active', company: 'Premium Fittings', lastActive: '1 day ago' },
  { id: '5', name: 'Robert Chen', email: 'robert@pipeflow.com', role: 'viewer', status: 'active', lastActive: '3 hours ago' },
];

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

  const handleLogout = () => {
    localStorage.removeItem('user');
    toast({ title: 'Logged out', description: 'See you next time!' });
    navigate('/auth');
  };

  const handleApprove = (id: string, type: 'user' | 'supplier') => {
    toast({ title: 'Approved', description: `${type === 'user' ? 'User' : 'Supplier'} has been approved` });
  };

  const filteredUsers = mockUsers.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSuppliers = mockSuppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingApprovals = mockUsers.filter(u => u.status === 'pending').length + 
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
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">{user?.name}</p>
              <p className="text-xs text-muted-foreground">Administrator</p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-5 h-5" />
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
                  <p className="text-3xl font-bold text-foreground">{mockUsers.length}</p>
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
              <Button className="gap-2">
                <UserPlus className="w-4 h-4" />
                Invite User
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="users" className="space-y-4">
              <TabsList>
                <TabsTrigger value="users">Users ({mockUsers.length})</TabsTrigger>
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
                      const roleStyle = roleConfig[user.role];
                      const statusStyle = statusConfig[user.status];
                      const StatusIcon = statusStyle.icon;
                      return (
                        <TableRow key={user.id} className="table-row-hover">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                                {user.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div>
                                <p className="font-medium text-foreground">{user.name}</p>
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
                          <TableCell className="text-muted-foreground">{user.lastActive}</TableCell>
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
                                <DropdownMenuItem>View Details</DropdownMenuItem>
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
              </TabsContent>

              <TabsContent value="pending">
                <div className="space-y-4">
                  {[...mockUsers.filter(u => u.status === 'pending'), ...mockSuppliers.filter(s => s.status === 'pending')].map((item) => (
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