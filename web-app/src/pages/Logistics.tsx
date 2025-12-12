import { DashboardLayout } from '@/src/components/layout/DashboardLayout';
import { LogisticsTracker } from '@/src/components/dashboard/LogisticsTracker';

const Logistics = () => {
  return (
    <DashboardLayout title="Logistics" subtitle="Shipment tracking & delivery management">
      <LogisticsTracker />
    </DashboardLayout>
  );
};

export default Logistics;
