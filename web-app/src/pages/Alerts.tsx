import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AlertsPanel } from '@/components/dashboard/AlertsPanel';

const Alerts = () => {
  return (
    <DashboardLayout title="Alerts" subtitle="System notifications & warnings">
      <AlertsPanel />
    </DashboardLayout>
  );
};

export default Alerts;
