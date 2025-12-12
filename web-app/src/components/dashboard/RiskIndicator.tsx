import { useEffect, useState } from 'react';
import { Shield, AlertTriangle, TrendingDown, Activity } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface RiskMetric {
  id: string;
  name: string;
  score: number;
  trend: 'improving' | 'worsening' | 'stable';
  factors: string[];
}

const fallbackMetrics: RiskMetric[] = [
  {
    id: '1',
    name: 'Supply Chain Risk',
    score: 28,
    trend: 'improving',
    factors: ['Supplier diversity', 'Lead time variability']
  },
  {
    id: '2',
    name: 'Quality Risk',
    score: 15,
    trend: 'stable',
    factors: ['Defect rate', 'Process capability']
  },
  {
    id: '3',
    name: 'Delivery Risk',
    score: 42,
    trend: 'worsening',
    factors: ['Transit delays', 'Capacity constraints']
  },
  {
    id: '4',
    name: 'Production Risk',
    score: 22,
    trend: 'improving',
    factors: ['Equipment reliability', 'Workforce availability']
  },
];

const getRiskLevel = (score: number) => {
  if (score <= 25) return { label: 'Low', color: 'text-success', bgColor: 'bg-success', gradient: 'from-success to-success/50' };
  if (score <= 50) return { label: 'Medium', color: 'text-warning', bgColor: 'bg-warning', gradient: 'from-warning to-warning/50' };
  return { label: 'High', color: 'text-destructive', bgColor: 'bg-destructive', gradient: 'from-destructive to-destructive/50' };
};

export const RiskIndicator = () => {
  const [metrics, setMetrics] = useState<RiskMetric[]>([]);
  const [overallScore, setOverallScore] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch('/api/risk')
      .then((r) => r.json())
      .then((d) => {
        if (!mounted) return;
        setMetrics((d.metrics ?? []) as RiskMetric[]);
        setOverallScore(typeof d.overallScore === 'number' ? d.overallScore : null);
      })
      .catch(() => {
        if (!mounted) return;
        setMetrics(fallbackMetrics);
        setOverallScore(
          Math.round(fallbackMetrics.reduce((a, m) => a + m.score, 0) / fallbackMetrics.length)
        );
      });
    return () => {
      mounted = false;
    };
  }, []);

  const score =
    typeof overallScore === 'number'
      ? overallScore
      : Math.round((metrics.length ? metrics : fallbackMetrics).reduce((a, m) => a + m.score, 0) /
          (metrics.length ? metrics.length : fallbackMetrics.length));
  const overallRisk = getRiskLevel(score);

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Risk Assessment</h2>
          <p className="text-sm text-muted-foreground">Operational risk indicators</p>
        </div>
        <div className="flex items-center gap-2">
          <Shield className={cn("w-5 h-5", overallRisk.color)} />
          <span className={cn("text-sm font-medium", overallRisk.color)}>
            {overallRisk.label} Risk
          </span>
        </div>
      </div>

      {/* Overall Risk Gauge */}
      <div className="relative mb-8">
        <div className="flex items-center justify-center">
          <div className="relative w-40 h-20 overflow-hidden">
            {/* Gauge Background */}
            <div className="absolute bottom-0 left-0 right-0 h-40 rounded-t-full border-8 border-secondary" />
            
            {/* Gauge Fill */}
            <div 
              className={cn(
                "absolute bottom-0 left-0 right-0 h-40 rounded-t-full border-8 origin-bottom transition-transform duration-1000",
                `border-${overallRisk.bgColor.replace('bg-', '')}`
              )}
              style={{ 
                clipPath: `polygon(0 100%, 0 0, ${score}% 0, ${score}% 100%)`,
              }}
            />
            
            {/* Center Value */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
              <p className={cn("text-3xl font-bold font-mono", overallRisk.color)}>
                {score}
              </p>
              <p className="text-xs text-muted-foreground">Overall Score</p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between text-xs text-muted-foreground mt-2 px-4">
          <span>0 - Low</span>
          <span>50 - Medium</span>
          <span>100 - High</span>
        </div>
      </div>

      {/* Individual Risk Metrics */}
      <div className="space-y-4">
        {(metrics.length ? metrics : fallbackMetrics).map((metric) => {
          const risk = getRiskLevel(metric.score);
          
          return (
            <div key={metric.id} className="group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{metric.name}</span>
                  {metric.trend === 'worsening' && (
                    <AlertTriangle className="w-3 h-3 text-destructive" />
                  )}
                  {metric.trend === 'improving' && (
                    <TrendingDown className="w-3 h-3 text-success" />
                  )}
                  {metric.trend === 'stable' && (
                    <Activity className="w-3 h-3 text-muted-foreground" />
                  )}
                </div>
                <span className={cn("text-sm font-mono font-semibold", risk.color)}>
                  {metric.score}
                </span>
              </div>
              <div className="progress-bar">
                <div 
                  className={cn("progress-bar-fill bg-gradient-to-r", risk.gradient)}
                  style={{ width: `${metric.score}%` }}
                />
              </div>
              <div className="flex gap-2 mt-2">
                {metric.factors.map((factor, idx) => (
                  <span key={idx} className="text-xs text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded">
                    {factor}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
