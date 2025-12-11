import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SupplierOverview } from '@/components/dashboard/SupplierOverview';

const Suppliers = () => {
  return (
    <DashboardLayout title="Suppliers" subtitle="Vendor management & performance">
      <SupplierOverview />
    </DashboardLayout>
  );
};

export default Suppliers;
