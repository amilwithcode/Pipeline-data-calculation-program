import { AlertTriangle, AlertCircle, Info, X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  time: string;
  source: string;
}

const alerts: Alert[] = [
  {
    id: '1',
    type: 'critical',
    title: 'Temperature Anomaly Detected',
    message: 'Heat treatment furnace #3 exceeding safe temperature limits',
    time: '2 min ago',
    source: 'Production Line B'
  },
  {
    id: '2',
    type: 'warning',
    title: 'Material Shortage Predicted',
    message: 'Steel coil inventory projected to deplete in 48 hours',
    time: '15 min ago',
    source: 'Inventory System'
  },
  {
    id: '3',
    type: 'warning',
    title: 'Supplier Delivery Delay',
    message: 'Shipment from MetalCo delayed by 6 hours',
    time: '1 hour ago',
    source: 'Logistics'
  },
  {
    id: '4',
    type: 'info',
    title: 'Maintenance Scheduled',
    message: 'Routine maintenance for Pipe Former #2 at 18:00',
    time: '2 hours ago',
    source: 'Maintenance'
  }
];

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
  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Active Alerts</h2>
          <p className="text-sm text-muted-foreground">System notifications & warnings</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge-status bg-destructive/10 text-destructive">
            <span className="w-2 h-2 rounded-full bg-destructive pulse-dot" />
            1 Critical
          </span>
          <span className="badge-status bg-warning/10 text-warning">
            2 Warnings
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => {
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

                <Button variant="ghost" size="icon" className="flex-shrink-0 h-6 w-6 text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <Button variant="ghost" className="w-full mt-4 text-muted-foreground hover:text-foreground">
        View All Alerts
      </Button>
    </div>
  );
};
