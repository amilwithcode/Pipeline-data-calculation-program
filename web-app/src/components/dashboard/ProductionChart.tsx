import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useEffect, useState } from 'react';
import { cn } from '@/src/lib/utils';

type Point = { date: string; production: number; target: number; defects: number };

export const ProductionChart = () => {
  const [activeChart, setActiveChart] = useState<'production' | 'defects'>('production');
  const [data, setData] = useState<Point[]>([]);

  useEffect(() => {
    let mounted = true;
    fetch('/api/production')
      .then(r => r.json())
      .then(d => { if (!mounted) return; setData(Array.isArray(d.items) ? d.items : []); })
      .catch(() => { if (!mounted) return; setData([]); });
    return () => { mounted = false; };
  }, []);

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Production Analytics</h2>
          <p className="text-sm text-muted-foreground">Weekly output & quality trends</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveChart('production')}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-all",
              activeChart === 'production' 
                ? "bg-primary text-primary-foreground" 
                : "bg-secondary text-muted-foreground hover:text-foreground"
            )}
          >
            Production
          </button>
          <button
            onClick={() => setActiveChart('defects')}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-all",
              activeChart === 'defects' 
                ? "bg-primary text-primary-foreground" 
                : "bg-secondary text-muted-foreground hover:text-foreground"
            )}
          >
            Defects
          </button>
        </div>
      </div>

      <div className="h-72">
        {!data.length ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No production data</div>
        ) : (
        <ResponsiveContainer width="100%" height="100%">
          {activeChart === 'production' ? (
            <AreaChart data={data}>
              <defs>
                <linearGradient id="productionGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(210 70% 50%)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(210 70% 50%)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="targetGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(142 72% 42%)" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="hsl(142 72% 42%)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 22%)" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="hsl(215 15% 55%)" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="hsl(215 15% 55%)" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${(value / 1000).toFixed(1)}k`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(220 18% 12%)', 
                  border: '1px solid hsl(220 15% 22%)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.3)'
                }}
                labelStyle={{ color: 'hsl(210 20% 95%)' }}
              />
              <Area 
                type="monotone" 
                dataKey="target" 
                stroke="hsl(142 72% 42%)" 
                strokeWidth={2}
                strokeDasharray="5 5"
                fill="url(#targetGradient)" 
                name="Target"
              />
              <Area 
                type="monotone" 
                dataKey="production" 
                stroke="hsl(210 70% 50%)" 
                strokeWidth={2}
                fill="url(#productionGradient)" 
                name="Production"
              />
            </AreaChart>
          ) : (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 22%)" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="hsl(215 15% 55%)" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="hsl(215 15% 55%)" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(220 18% 12%)', 
                  border: '1px solid hsl(220 15% 22%)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.3)'
                }}
                labelStyle={{ color: 'hsl(210 20% 95%)' }}
              />
              <Bar 
                dataKey="defects" 
                fill="hsl(0 72% 51%)" 
                radius={[4, 4, 0, 0]}
                name="Defects"
              />
            </BarChart>
          )}
        </ResponsiveContainer>
        )}
      </div>

      <div className="flex items-center justify-center gap-8 mt-4 pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-sm text-muted-foreground">Production Output</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-success" />
          <span className="text-sm text-muted-foreground">Target</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-destructive" />
          <span className="text-sm text-muted-foreground">Defects</span>
        </div>
      </div>
    </div>
  );
};
