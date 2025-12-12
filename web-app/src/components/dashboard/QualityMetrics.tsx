import { useEffect, useState } from 'react';
import { cn } from '@/src/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';

interface QualityTest {
  id: string;
  name: string;
  passRate: number;
  totalTests: number;
  passed: number;
  failed: number;
}


export const QualityMetrics = () => {
  const [tests, setTests] = useState<QualityTest[]>([]);
  const [totals, setTotals] = useState<{ total: number; passed: number; failed: number } | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch('/api/quality')
      .then(r => r.json())
      .then(d => {
        if (!mounted) return;
        setTests(Array.isArray(d.tests) ? d.tests : []);
        setTotals(d.totals ?? null);
      })
      .catch(() => {
        if (!mounted) return;
        setTests([]);
        setTotals({ total: 0, passed: 0, failed: 0 });
      });
    return () => { mounted = false; };
  }, []);

  const list = tests;
  const overallPassRate = list.length
    ? (list.reduce((acc, test) => acc + test.passRate, 0) / list.length).toFixed(1)
    : '0.0';

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Quality Metrics</h2>
          <p className="text-sm text-muted-foreground">Test results & pass rates</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-success">{overallPassRate}%</p>
          <p className="text-xs text-muted-foreground">Overall Pass Rate</p>
        </div>
      </div>

      <div className="space-y-4">
        {list.map((test) => (
          <div key={test.id} className="group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">{test.name}</span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">
                  {test.passed}/{test.totalTests} passed
                </span>
                <span className={cn(
                  "text-sm font-semibold font-mono",
                  test.passRate >= 98 ? "text-success" : 
                  test.passRate >= 95 ? "text-warning" : "text-destructive"
                )}>
                  {test.passRate}%
                </span>
              </div>
            </div>
            <div className="progress-bar">
              <div 
                className={cn(
                  "progress-bar-fill",
                  test.passRate >= 98 ? "bg-success" : 
                  test.passRate >= 95 ? "bg-warning" : "bg-destructive"
                )}
                style={{ width: `${test.passRate}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-border grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold text-foreground font-mono">{totals?.total ?? list.reduce((a, t) => a + t.totalTests, 0)}</p>
          <p className="text-xs text-muted-foreground">Total Tests</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-success font-mono">{totals?.passed ?? list.reduce((a, t) => a + t.passed, 0)}</p>
          <p className="text-xs text-muted-foreground">Passed</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-destructive font-mono">{totals?.failed ?? list.reduce((a, t) => a + t.failed, 0)}</p>
          <p className="text-xs text-muted-foreground">Failed</p>
        </div>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Quality Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary">
                <tr>
                  <th className="p-2 text-left">Test</th>
                  <th className="p-2 text-left">Pass Rate</th>
                  <th className="p-2 text-left">Total</th>
                  <th className="p-2 text-left">Passed</th>
                  <th className="p-2 text-left">Failed</th>
                </tr>
              </thead>
              <tbody>
                {list.map((t) => (
                  <tr key={t.id} className="border-t border-border">
                    <td className="p-2">{t.name}</td>
                    <td className={cn("p-2 font-mono", t.passRate >= 98 ? "text-success" : t.passRate >= 95 ? "text-warning" : "text-destructive")}>{t.passRate}%</td>
                    <td className="p-2">{t.totalTests}</td>
                    <td className="p-2">{t.passed}</td>
                    <td className="p-2">{t.failed}</td>
                  </tr>
                ))}
                {!list.length && (
                  <tr className="border-t border-border"><td className="p-2" colSpan={5}>No results</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
