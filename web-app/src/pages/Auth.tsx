import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Factory, Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { useToast } from '@/src/hooks/use-toast';

type AuthMode = 'login' | 'register';

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Mock authentication - replace with Supabase when database is ready
    setTimeout(() => {
      if (mode === 'login') {
        // Mock login - check for demo credentials
        if (email === 'admin@pipeflow.com' && password === 'admin123') {
          localStorage.setItem('user', JSON.stringify({ email, role: 'admin', name: 'Admin User' }));
          toast({ title: 'Welcome back!', description: 'Logged in as Admin' });
          navigate('/admin');
        } else if (email === 'supplier@pipeflow.com' && password === 'supplier123') {
          localStorage.setItem('user', JSON.stringify({ email, role: 'supplier', name: 'Supplier User' }));
          toast({ title: 'Welcome back!', description: 'Logged in as Supplier' });
          navigate('/supplier-portal');
        } else {
          toast({ title: 'Invalid credentials', description: 'Please check your email and password', variant: 'destructive' });
        }
      } else {
        // Mock registration
        localStorage.setItem('user', JSON.stringify({ email, role: 'supplier', name }));
        toast({ title: 'Account created!', description: 'Welcome to PipeFlow' });
        navigate('/supplier-portal');
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/10" />
        <div className="absolute inset-0" style={{ background: 'var(--gradient-steel)', opacity: 0.5 }} />
        
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-effect">
              <Factory className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-foreground text-2xl tracking-tight">PipeFlow</h1>
              <p className="text-sm text-muted-foreground">Pipeline Management System</p>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-foreground leading-tight">
              Streamline Your
              <span className="block gradient-text">Supply Chain</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-md">
              Monitor production, track deliveries, and manage supplier relationships all in one powerful platform.
            </p>
            
            <div className="grid grid-cols-2 gap-4 pt-6">
              {[
                { label: 'Active Suppliers', value: '48' },
                { label: 'On-Time Delivery', value: '94%' },
                { label: 'Quality Score', value: '98.5%' },
                { label: 'Units Produced', value: '2.4M' },
              ].map((stat) => (
                <div key={stat.label} className="glass-card p-4">
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            © 2024 PipeFlow Industries. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Factory className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="font-bold text-foreground text-xl">PipeFlow</h1>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-foreground">
              {mode === 'login' ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {mode === 'login' 
                ? 'Enter your credentials to access your account' 
                : 'Join PipeFlow to manage your supply chain'}
            </p>
          </div>

          {/* Demo Credentials Info */}
          <div className="glass-card p-4 border-primary/30">
            <p className="text-sm font-medium text-primary mb-2">Demo Credentials</p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p><span className="text-foreground">Admin:</span> admin@pipeflow.com / admin123</p>
              <p><span className="text-foreground">Supplier:</span> supplier@pipeflow.com / supplier123</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'register' && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 h-12 bg-card border-border"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 bg-card border-border"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-12 bg-card border-border"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </>
              )}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-muted-foreground">
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
              <button
                type="button"
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="ml-2 text-primary hover:text-primary/80 font-medium transition-colors"
              >
                {mode === 'login' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}