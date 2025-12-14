import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { QualityMetrics } from '@/components/dashboard/QualityMetrics';

const Quality = () => {
  return (
    <DashboardLayout title="Keyfiyyət Nəzarəti" subtitle="Test nəticələri və uyğunluğun izlənməsi">
      <QualityMetrics />
    </DashboardLayout>
  );
};

export default Quality;
