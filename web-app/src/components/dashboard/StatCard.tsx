import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  subtitle?: string;
}

const variantStyles = {
  default: 'from-steel/20 to-transparent',
  primary: 'from-primary/20 to-transparent',
  success: 'from-success/20 to-transparent',
  warning: 'from-warning/20 to-transparent',
  danger: 'from-destructive/20 to-transparent',
};

const iconStyles = {
  default: 'bg-steel/20 text-steel-light',
  primary: 'bg-primary/20 text-primary',
  success: 'bg-success/20 text-success',
  warning: 'bg-warning/20 text-warning',
  danger: 'bg-destructive/20 text-destructive',
};

export const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  variant = 'default',
  subtitle 
}: StatCardProps) => {
  return (
    <div className="stat-card group hover:border-primary/30 transition-all duration-300">
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-50 rounded-xl transition-opacity group-hover:opacity-70",
        variantStyles[variant]
      )} />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            iconStyles[variant]
          )}>
            <Icon className="w-6 h-6" />
          </div>
          
          {trend && (
            <div className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
              trend.isPositive 
                ? "bg-success/10 text-success" 
                : "bg-destructive/10 text-destructive"
            )}>
              {trend.isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {Math.abs(trend.value)}%
            </div>
          )}
        </div>

        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="kpi-value text-foreground">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
};
