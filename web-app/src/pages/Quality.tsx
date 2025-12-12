import { DashboardLayout } from '@/src/components/layout/DashboardLayout';
import { QualityMetrics } from '@/src/components/quality/QualityMetrics';

const Quality = () => {
  return (
    <DashboardLayout title="Quality Control" subtitle="Test results & compliance tracking">
      <QualityMetrics />
    </DashboardLayout>
  );
};

export default Quality;
