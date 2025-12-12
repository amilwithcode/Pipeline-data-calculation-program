import { DashboardLayout } from '@/src/components/layout/DashboardLayout';
import { AlertsPanel } from '@/src/components/dashboard/AlertsPanel';

const Alerts = () => {
  return (
    <DashboardLayout title="Alerts" subtitle="System notifications & warnings">
      <AlertsPanel />
    </DashboardLayout>
  );
};

export default Alerts;
