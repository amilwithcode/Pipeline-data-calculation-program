import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProductionPipeline } from '@/components/dashboard/ProductionPipeline';
import { ProductionChart } from '@/components/dashboard/ProductionChart';

const Production = () => {
  return (
    <DashboardLayout title="Production" subtitle="Manufacturing stages & output monitoring">
      <div className="space-y-6">
        <ProductionPipeline />
        <ProductionChart />
      </div>
    </DashboardLayout>
  );
};

export default Production;
