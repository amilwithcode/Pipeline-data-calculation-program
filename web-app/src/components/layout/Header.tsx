"use client";
import { Bell, Search, RefreshCw, Sun, Moon, Shield, LogOut } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { useEffect, useState } from 'react';
import { cn } from '@/src/lib/utils';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { Popover, PopoverContent, PopoverTrigger } from '@/src/components/ui/popover';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export const Header = ({ title, subtitle }: HeaderProps) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const router = useRouter();
  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  useEffect(() => {
    if (!notifOpen) return;
    let mounted = true;
    setNotifLoading(true);
    fetch('/api/confirmations')
      .then((r) => r.json())
      .then((d) => {
        if (!mounted) return;
        const arr = Array.isArray(d) ? d : Array.isArray(d?.confirmations) ? d.confirmations : [];
        setNotifications(arr);
      })
      .catch(() => {
        if (!mounted) return;
        setNotifications([]);
      })
      .finally(() => {
        if (!mounted) return;
        setNotifLoading(false);
      });
    return () => { mounted = false; };
  }, [notifOpen]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  
  const goAdminAuth = () => {
    router.push('/?view=auth');
  };
  const logout = () => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('user');
      }
    } catch {}
    router.push('/auth');
  };

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Axtarış..." 
            className="w-64 pl-10 bg-secondary/50 border-border focus:bg-secondary"
          />
        </div>

        {/* Refresh */}
        <Button 
          variant="ghost" 
          size="icon"
          onClick={handleRefresh}
          className="text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className={cn("w-5 h-5", isRefreshing && "animate-spin")} />
        </Button>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle theme"
          className="text-muted-foreground hover:text-foreground"
          onClick={toggleTheme}
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>

        {/* Notifications */}
        <Popover open={notifOpen} onOpenChange={setNotifOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-medium">
                  {notifications.length}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="p-4 border-b border-border">
              <p className="text-sm font-semibold text-foreground">Bildirişlər</p>
              <p className="text-xs text-muted-foreground">Admin üçün sistem fəaliyyətləri</p>
            </div>
            <div className="max-h-80 overflow-auto p-2">
              {notifLoading && (
                <div className="py-6 text-center text-sm text-muted-foreground">Yüklənir...</div>
              )}
              {!notifLoading && notifications.length === 0 && (
                <div className="py-6 text-center text-sm text-muted-foreground">Bildiriş yoxdur</div>
              )}
              {!notifLoading && notifications.length > 0 && (
                <div className="space-y-2">
                  {notifications.map((n, idx) => {
                    const supplier = String(n?.supplier || n?.company || n?.company_name || n?.name || "Təchizatçı");
                    const action = String(n?.action || n?.event || n?.description || n?.record || n?.item || "əlavə edildi");
                    const target = String(n?.target || n?.entity || n?.table || n?.module || "");
                    const time = String(n?.created_at || n?.timestamp || "");
                    return (
                      <div key={idx} className="p-3 rounded-md bg-secondary/30 border border-border/50">
                        <p className="text-sm text-foreground">
                          {supplier}: {action}{target ? ` (${target})` : ''}
                        </p>
                        {time && <p className="text-xs text-muted-foreground mt-1">{time}</p>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Live Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/30">
          <span className="w-2 h-2 rounded-full bg-success pulse-dot" />
          <span className="text-xs font-medium text-success">Canlı</span>
        </div>

        <div className="flex items-center gap-2">
          <Button className="gap-2" onClick={goAdminAuth}>
            <Shield className="w-4 h-4" />
            Admin
          </Button>
          <Button variant="outline" className="gap-2" onClick={logout}>
            <LogOut className="w-4 h-4" />
            Çıxış
          </Button>
        </div>
      </div>
    </header>
  );
};
