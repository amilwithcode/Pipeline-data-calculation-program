import { Truck, Package, MapPin, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface Shipment {
  id: string;
  orderId: string;
  destination: string;
  status: 'in-transit' | 'delivered' | 'delayed' | 'pending';
  eta: string;
  progress: number;
  carrier: string;
  quantity: number;
}

const shipments: Shipment[] = [
  { id: '1', orderId: 'ORD-2024-001', destination: 'Dubai, UAE', status: 'in-transit', eta: '4h 30m', progress: 65, carrier: 'FastFreight', quantity: 2500 },
  { id: '2', orderId: 'ORD-2024-002', destination: 'Mumbai, India', status: 'delivered', eta: 'Delivered', progress: 100, carrier: 'SeaLine', quantity: 5000 },
  { id: '3', orderId: 'ORD-2024-003', destination: 'Singapore', status: 'delayed', eta: '+6h delay', progress: 45, carrier: 'OceanCargo', quantity: 3200 },
  { id: '4', orderId: 'ORD-2024-004', destination: 'Jakarta, Indonesia', status: 'pending', eta: 'Awaiting', progress: 0, carrier: 'GlobalShip', quantity: 1800 },
];

const statusConfig = {
  'in-transit': { icon: Truck, color: 'text-primary', bgColor: 'bg-primary/10', label: 'In Transit' },
  'delivered': { icon: CheckCircle2, color: 'text-success', bgColor: 'bg-success/10', label: 'Delivered' },
  'delayed': { icon: AlertCircle, color: 'text-destructive', bgColor: 'bg-destructive/10', label: 'Delayed' },
  'pending': { icon: Clock, color: 'text-warning', bgColor: 'bg-warning/10', label: 'Pending' },
};

export const LogisticsTracker = () => {
  const inTransit = shipments.filter(s => s.status === 'in-transit').length;
  const delivered = shipments.filter(s => s.status === 'delivered').length;
  const delayed = shipments.filter(s => s.status === 'delayed').length;

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Logistics Tracker</h2>
          <p className="text-sm text-muted-foreground">Active shipments & deliveries</p>
        </div>
        <div className="flex gap-4">
          <div className="text-center">
            <p className="text-xl font-bold text-primary font-mono">{inTransit}</p>
            <p className="text-xs text-muted-foreground">In Transit</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-success font-mono">{delivered}</p>
            <p className="text-xs text-muted-foreground">Delivered</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-destructive font-mono">{delayed}</p>
            <p className="text-xs text-muted-foreground">Delayed</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {shipments.map((shipment) => {
          const config = statusConfig[shipment.status];
          const Icon = config.icon;
          
          return (
            <div 
              key={shipment.id}
              className="p-4 rounded-lg bg-secondary/30 border border-border/50 hover:border-primary/30 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", config.bgColor)}>
                    <Icon className={cn("w-5 h-5", config.color)} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{shipment.orderId}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      {shipment.destination}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={cn("badge-status", config.bgColor, config.color)}>
                    {config.label}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">{shipment.eta}</p>
                </div>
              </div>

              <div className="mb-2">
                <div className="progress-bar">
                  <div 
                    className={cn(
                      "progress-bar-fill",
                      shipment.status === 'delivered' ? 'bg-success' :
                      shipment.status === 'delayed' ? 'bg-destructive' :
                      shipment.status === 'in-transit' ? 'bg-primary' : 'bg-warning'
                    )}
                    style={{ width: `${shipment.progress}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Package className="w-3 h-3" />
                  {shipment.quantity.toLocaleString()} units
                </div>
                <span>Carrier: {shipment.carrier}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
