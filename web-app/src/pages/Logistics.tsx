import { DashboardLayout } from '@/src/components/layout/DashboardLayout';
import { LogisticsTracker } from '@/src/components/dashboard/LogisticsTracker';

const Logistics = () => {
  return (
    <DashboardLayout title="Logistika" subtitle="Göndəriş izlənməsi və çatdırılma idarəetməsi">
      <LogisticsTracker />
    </DashboardLayout>
  );
};

export default Logistics;
