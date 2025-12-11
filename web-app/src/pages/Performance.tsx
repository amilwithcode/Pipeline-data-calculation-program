import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { RiskIndicator } from '@/components/dashboard/RiskIndicator';
import { ProductionChart } from '@/components/dashboard/ProductionChart';

const Performance = () => {
  return (
    <DashboardLayout title="Performance" subtitle="KPIs & risk assessment">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProductionChart />
        <RiskIndicator />
      </div>
    </DashboardLayout>
  );
};

export default Performance;
