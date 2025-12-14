import { DashboardLayout } from '@/src/components/layout/DashboardLayout';
import { AlertsPanel } from '@/src/components/dashboard/AlertsPanel';

const Alerts = () => {
  return (
    <DashboardLayout title="Bildirişlər" subtitle="Sistem bildirişləri və xəbərdarlıqlar">
      <AlertsPanel />
    </DashboardLayout>
  );
};

export default Alerts;
