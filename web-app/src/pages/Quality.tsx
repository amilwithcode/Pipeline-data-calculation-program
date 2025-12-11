import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { QualityMetrics } from '@/components/dashboard/QualityMetrics';

const Quality = () => {
  return (
    <DashboardLayout title="Quality Control" subtitle="Test results & compliance tracking">
      <QualityMetrics />
    </DashboardLayout>
  );
};

export default Quality;
