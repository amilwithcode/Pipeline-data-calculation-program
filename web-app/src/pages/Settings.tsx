import { DashboardLayout } from '@/src/components/layout/DashboardLayout';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Switch } from '@/src/components/ui/switch';

const Settings = () => {
  return (
    <DashboardLayout title="Ayarlar" subtitle="Sistem konfiqurasiyası və seçimlər">
      <div className="max-w-2xl">
        <div className="glass-card p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Bildirişlər</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email bildirişləri</Label>
                  <p className="text-sm text-muted-foreground">Kritik bildirişləri email ilə qəbul edin</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>SMS bildirişləri</Label>
                  <p className="text-sm text-muted-foreground">Təcili hallar üçün SMS alın</p>
                </div>
                <Switch />
              </div>
            </div>
          </div>
          
          <div className="border-t border-border pt-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Hədlər</h3>
            <div className="grid gap-4">
              <div>
                <Label>Aşağı stok xəbərdarlığı (kg)</Label>
                <Input type="number" defaultValue="1000" className="mt-2" />
              </div>
              <div>
                <Label>Keyfiyyət keçmə faizi hədəfi (%)</Label>
                <Input type="number" defaultValue="95" className="mt-2" />
              </div>
            </div>
          </div>

          <Button className="w-full">Ayarları yadda saxla</Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
