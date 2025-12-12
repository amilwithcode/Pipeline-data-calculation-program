import { DashboardLayout } from '@/src/components/layout/DashboardLayout';
import { SupplierOverview } from '@/src/components/dashboard/SupplierOverview';

const Suppliers = () => {
  return (
    <DashboardLayout title="Suppliers" subtitle="Vendor management & performance">
      <SupplierOverview />
    </DashboardLayout>
  );
};

export default Suppliers;
