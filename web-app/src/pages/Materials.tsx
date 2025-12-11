import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { Package, Truck, AlertTriangle, CheckCircle2 } from 'lucide-react';

const Materials = () => {
  return (
    <DashboardLayout title="Raw Materials" subtitle="Inventory & supply tracking">
      <div className="data-grid">
        <StatCard
          title="Steel Coils"
          value="12,450 kg"
          icon={Package}
          variant="primary"
          subtitle="High carbon steel"
        />
        <StatCard
          title="Alloy Stock"
          value="5,200 kg"
          icon={Package}
          variant="success"
          subtitle="Grade A alloys"
        />
        <StatCard
          title="Pending Delivery"
          value="8,000 kg"
          icon={Truck}
          variant="warning"
          subtitle="ETA: 48 hours"
        />
        <StatCard
          title="Low Stock Alerts"
          value="2"
          icon={AlertTriangle}
          variant="danger"
          subtitle="Items below threshold"
        />
      </div>
    </DashboardLayout>
  );
};

export default Materials;
