import { DashboardLayout } from '@/src/components/layout/DashboardLayout';
import { RiskIndicator } from '@/src/components/dashboard/RiskIndicator';
import { ProductionChart } from '@/src/components/dashboard/ProductionChart';

const Performance = () => {
  return (
    <DashboardLayout title="Performans" subtitle="KPI-lar və risk qiymətləndirilməsi">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProductionChart />
        <RiskIndicator />
      </div>
    </DashboardLayout>
  );
};

export default Performance;
