 "use client";
import { useEffect, useState } from 'react';
import { AlertTriangle, AlertCircle, Info, X, Clock } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { cn } from '@/src/lib/utils';
import { useRouter } from 'next/navigation';

type Alert = {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  time: string;
  source: string;
};

const alertConfig = {
  critical: {
    icon: AlertCircle,
    bgColor: 'bg-destructive/10',
    borderColor: 'border-destructive/30',
    iconColor: 'text-destructive',
    dotColor: 'bg-destructive'
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-warning/10',
    borderColor: 'border-warning/30',
    iconColor: 'text-warning',
    dotColor: 'bg-warning'
  },
  info: {
    icon: Info,
    bgColor: 'bg-info/10',
    borderColor: 'border-info/30',
    iconColor: 'text-info',
    dotColor: 'bg-info'
  }
};

export const AlertsPanel = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem('dismissed_alerts') : null;
    if (stored) {
      try { setDismissed(JSON.parse(stored)); } catch {}
    }
    let t: any = null;
    try {
      const es = new EventSource('http://127.0.0.1:8000/api/events');
      es.onmessage = (ev) => {
        if (!mounted) return;
        try {
          const d = JSON.parse(ev.data);
          const arr = Array.isArray(d?.alerts) ? d.alerts : [];
          setAlerts(arr.map((a: any, idx: number) => ({ id: String(idx), type: String(a.level || 'info') as any, title: String(a.message || ''), message: String(a.message || ''), time: new Date().toLocaleString(), source: 'system' })));
        } catch {}
      };
      es.onerror = () => {
        try { es.close(); } catch {}
        t = setInterval(() => {
          fetch('/api/alerts').then(r=>r.json()).then((arr)=>{
            if (!mounted) return;
            const list = Array.isArray(arr) ? arr : (Array.isArray(arr?.alerts) ? arr.alerts : []);
            setAlerts(list.map((a:any, idx:number)=>({ id:String(idx), type:String(a.level||'info') as any, title:String(a.message||''), message:String(a.message||''), time:new Date().toLocaleString(), source:'system' })));
          }).catch(()=>{});
        }, 15000);
      };
      return () => { mounted = false; try { es.close(); } catch {}; if (t) clearInterval(t); };
    } catch {
      t = setInterval(() => {
        fetch('/api/alerts').then(r=>r.json()).then((arr)=>{
          if (!mounted) return;
          const list = Array.isArray(arr) ? arr : (Array.isArray(arr?.alerts) ? arr.alerts : []);
          setAlerts(list.map((a:any, idx:number)=>({ id:String(idx), type:String(a.level||'info') as any, title:String(a.message||''), message:String(a.message||''), time:new Date().toLocaleString(), source:'system' })));
        }).catch(()=>{});
      }, 15000);
      return () => { mounted = false; if (t) clearInterval(t); };
    }
  }, []);

  function handleDismiss(id: string) {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    setDismissed((prev) => {
      const next = [...prev, id];
      if (typeof window !== 'undefined') window.localStorage.setItem('dismissed_alerts', JSON.stringify(next));
      return next;
    });
  }

  function handleViewAll() {
    router.push('/?view=alerts');
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Aktiv bildirişlər</h2>
          <p className="text-sm text-muted-foreground">Sistem bildirişləri və xəbərdarlıqlar</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge-status bg-destructive/10 text-destructive">
            <span className="w-2 h-2 rounded-full bg-destructive pulse-dot" />
            {(() => {
              const visible = alerts.filter(a => !dismissed.includes(a.id));
              const crt = visible.filter(a => a.type === 'critical').length;
              return `${crt} Critical`;
            })()}
          </span>
          <span className="badge-status bg-warning/10 text-warning">{(() => {
            const visible = alerts.filter(a => !dismissed.includes(a.id));
            const wrn = visible.filter(a => a.type === 'warning').length;
            return `${wrn} Warnings`;
          })()}</span>
        </div>
      </div>

      <div className="space-y-3">
        {alerts.filter(a => !dismissed.includes(a.id)).map((alert) => {
          const config = alertConfig[alert.type];
          const Icon = config.icon;
          
          return (
            <div 
              key={alert.id}
              className={cn(
                "p-4 rounded-lg border transition-all duration-200 hover:scale-[1.01]",
                config.bgColor,
                config.borderColor
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                  config.bgColor
                )}>
                  <Icon className={cn("w-4 h-4", config.iconColor)} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-foreground">{alert.title}</h4>
                    <span className={cn("w-2 h-2 rounded-full flex-shrink-0", config.dotColor)} />
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {alert.time}
                    </span>
                    <span>{alert.source}</span>
                  </div>
                </div>

                <Button onClick={() => handleDismiss(alert.id)} variant="ghost" size="icon" className="flex-shrink-0 h-6 w-6 text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <Button onClick={handleViewAll} variant="ghost" className="w-full mt-4 text-muted-foreground hover:text-foreground">
        Bütün bildirişlərə bax
      </Button>
    </div>
  );
};
