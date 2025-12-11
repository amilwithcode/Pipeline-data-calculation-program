import { cn } from '@/lib/utils';

interface QualityTest {
  id: string;
  name: string;
  passRate: number;
  totalTests: number;
  passed: number;
  failed: number;
}

const qualityTests: QualityTest[] = [
  { id: '1', name: 'Tensile Strength', passRate: 98.5, totalTests: 420, passed: 414, failed: 6 },
  { id: '2', name: 'Hydrostatic Pressure', passRate: 99.2, totalTests: 380, passed: 377, failed: 3 },
  { id: '3', name: 'Dimensional Accuracy', passRate: 97.8, totalTests: 450, passed: 440, failed: 10 },
  { id: '4', name: 'Surface Finish', passRate: 96.4, totalTests: 390, passed: 376, failed: 14 },
  { id: '5', name: 'Chemical Composition', passRate: 99.7, totalTests: 310, passed: 309, failed: 1 },
];

export const QualityMetrics = () => {
  const overallPassRate = (
    qualityTests.reduce((acc, test) => acc + test.passRate, 0) / qualityTests.length
  ).toFixed(1);

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
        {qualityTests.map((test) => (
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
          <p className="text-2xl font-bold text-foreground font-mono">1,950</p>
          <p className="text-xs text-muted-foreground">Total Tests</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-success font-mono">1,916</p>
          <p className="text-xs text-muted-foreground">Passed</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-destructive font-mono">34</p>
          <p className="text-xs text-muted-foreground">Failed</p>
        </div>
      </div>
    </div>
  );
};
