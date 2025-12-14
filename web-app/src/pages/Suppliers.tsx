import { DashboardLayout } from '@/src/components/layout/DashboardLayout';
import { SupplierOverview } from '@/src/components/dashboard/SupplierOverview';

const Suppliers = () => {
  return (
    <DashboardLayout title="Təchizatçılar" subtitle="Satıcı idarəetməsi və performans">
      <SupplierOverview />
    </DashboardLayout>
  );
};

export default Suppliers;
