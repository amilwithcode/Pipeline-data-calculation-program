import { CheckCircle2, Circle, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface PipelineStage {
  id: string;
  name: string;
  status: 'completed' | 'in-progress' | 'pending' | 'issue';
  progress?: number;
  quantity?: number;
  eta?: string;
}

const stages: PipelineStage[] = [
  { id: '1', name: 'Raw Material Intake', status: 'completed', quantity: 5200 },
  { id: '2', name: 'Material Processing', status: 'completed', quantity: 4800 },
  { id: '3', name: 'Pipe Formation', status: 'in-progress', progress: 67, quantity: 3200 },
  { id: '4', name: 'Heat Treatment', status: 'pending', eta: '2h 30m' },
  { id: '5', name: 'Quality Testing', status: 'pending', eta: '4h 15m' },
  { id: '6', name: 'Coating & Finishing', status: 'pending', eta: '6h 45m' },
  { id: '7', name: 'Final Inspection', status: 'pending', eta: '8h 20m' },
  { id: '8', name: 'Packaging', status: 'pending', eta: '10h' },
];

const statusConfig = {
  completed: {
    icon: CheckCircle2,
    color: 'text-success',
    bgColor: 'bg-success',
    borderColor: 'border-success',
    label: 'Completed'
  },
  'in-progress': {
    icon: Clock,
    color: 'text-primary',
    bgColor: 'bg-primary',
    borderColor: 'border-primary',
    label: 'In Progress'
  },
  pending: {
    icon: Circle,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
    borderColor: 'border-muted',
    label: 'Pending'
  },
  issue: {
    icon: AlertCircle,
    color: 'text-destructive',
    bgColor: 'bg-destructive',
    borderColor: 'border-destructive',
    label: 'Issue'
  }
};

export const ProductionPipeline = () => {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Production Pipeline</h2>
          <p className="text-sm text-muted-foreground">Real-time stage tracking</p>
        </div>
        <div className="flex items-center gap-4">
          {Object.entries(statusConfig).slice(0, 3).map(([key, config]) => (
            <div key={key} className="flex items-center gap-2">
              <span className={cn("w-2 h-2 rounded-full", config.bgColor)} />
              <span className="text-xs text-muted-foreground">{config.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative">
        {/* Pipeline Track */}
        <div className="absolute top-6 left-6 right-6 h-1 bg-secondary rounded-full" />
        <div 
          className="absolute top-6 left-6 h-1 bg-gradient-to-r from-success via-primary to-primary rounded-full transition-all duration-1000"
          style={{ width: '35%' }}
        />

        {/* Stages */}
        <div className="relative grid grid-cols-4 gap-4 lg:grid-cols-8">
          {stages.map((stage, index) => {
            const config = statusConfig[stage.status];
            const StageIcon = config.icon;
            
            return (
              <div 
                key={stage.id} 
                className={cn(
                  "flex flex-col items-center animate-fade-in",
                  `stagger-${(index % 5) + 1}`
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-full border-2 flex items-center justify-center bg-card z-10 transition-all duration-300",
                  config.borderColor,
                  stage.status === 'in-progress' && "animate-pulse-glow"
                )}>
                  <StageIcon className={cn("w-5 h-5", config.color)} />
                </div>
                
                <div className="mt-4 text-center">
                  <p className="text-xs font-medium text-foreground leading-tight mb-1">
                    {stage.name}
                  </p>
                  {stage.quantity && (
                    <p className="text-xs text-muted-foreground font-mono">
                      {stage.quantity.toLocaleString()} units
                    </p>
                  )}
                  {stage.progress !== undefined && (
                    <div className="mt-2">
                      <div className="progress-bar w-16 mx-auto">
                        <div 
                          className="progress-bar-fill bg-primary"
                          style={{ width: `${stage.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-primary font-mono mt-1">{stage.progress}%</p>
                    </div>
                  )}
                  {stage.eta && (
                    <p className="text-xs text-muted-foreground mt-1">ETA: {stage.eta}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
