import { DashboardLayout } from '@/src/components/layout/DashboardLayout';
import { ProductionPipeline } from '@/src/components/dashboard/ProductionPipeline';
import { ProductionChart } from '@/src/components/dashboard/ProductionChart';

const Production = () => {
  return (
    <DashboardLayout title="İstehsal" subtitle="İstehsal mərhələləri və çıxışın izlənməsi">
      <div className="space-y-6">
        <ProductionPipeline />
        <ProductionChart />
      </div>
    </DashboardLayout>
  );
};

export default Production;
