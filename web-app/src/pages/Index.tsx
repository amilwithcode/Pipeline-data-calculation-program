import { DashboardLayout } from '@/src/components/layout/DashboardLayout';
import { StatCard } from '@/src/components/dashboard/StatCard';
import { ProductionPipeline } from '@/src/components/dashboard/ProductionPipeline';
import { QualityMetrics } from '@/src/components/dashboard/QualityMetrics';
import { AlertsPanel } from '@/src/components/dashboard/AlertsPanel';
import { SupplierOverview } from '@/src/components/dashboard/SupplierOverview';
import { RiskIndicator } from '@/src/components/dashboard/RiskIndicator';
import { ProductionChart } from '@/src/components/dashboard/ProductionChart';
import { LogisticsTracker } from '@/src/components/dashboard/LogisticsTracker';
import { Factory, Package, Truck, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

const Index = () => {
  return (
    <DashboardLayout 
      title="Boru kəməri paneli" 
      subtitle="Real-time istehsal əməliyyatlarının icmalı"
    >
      {/* KPI Stats Row */}
      <div className="data-grid mb-6">
        <StatCard
          title="Günlük istehsal"
          value="4,892"
          icon={Factory}
          trend={{ value: 12.5, isPositive: true }}
          variant="primary"
          subtitle="istehsal edilən vahidlər"
        />
        <StatCard
          title="Xammal"
          value="18,420"
          icon={Package}
          trend={{ value: 3.2, isPositive: false }}
          variant="warning"
          subtitle="anbarda (kg)"
        />
        <StatCard
          title="Aktiv göndərişlər"
          value="24"
          icon={Truck}
          trend={{ value: 8.7, isPositive: true }}
          variant="success"
          subtitle="yolda"
        />
        <StatCard
          title="Aktiv bildirişlər"
          value="3"
          icon={AlertTriangle}
          variant="danger"
          subtitle="diqqət tələb edir"
        />
        <StatCard
          title="Keyfiyyət keçmə faizi"
          value="98.2%"
          icon={CheckCircle2}
          trend={{ value: 0.5, isPositive: true }}
          variant="success"
          subtitle="bu həftə"
        />
        <StatCard
          title="Orta çatdırılma müddəti"
          value="4.2d"
          icon={Clock}
          trend={{ value: 5.3, isPositive: true }}
          subtitle="sifarişdən çatdırılmaya"
        />
      </div>

      {/* Production Pipeline */}
      <div className="mb-6">
        <ProductionPipeline />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ProductionChart />
        <QualityMetrics />
      </div>

      {/* Alerts and Risk */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <AlertsPanel />
        <RiskIndicator />
      </div>

      {/* Logistics and Suppliers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <LogisticsTracker />
        <SupplierOverview />
      </div>
    </DashboardLayout>
  );
};

export default Index;
