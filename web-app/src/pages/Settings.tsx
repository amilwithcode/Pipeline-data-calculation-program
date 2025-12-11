import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const Settings = () => {
  return (
    <DashboardLayout title="Settings" subtitle="System configuration & preferences">
      <div className="max-w-2xl">
        <div className="glass-card p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Notifications</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Alerts</Label>
                  <p className="text-sm text-muted-foreground">Receive critical alerts via email</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">Get SMS for urgent issues</p>
                </div>
                <Switch />
              </div>
            </div>
          </div>
          
          <div className="border-t border-border pt-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Thresholds</h3>
            <div className="grid gap-4">
              <div>
                <Label>Low Stock Alert (kg)</Label>
                <Input type="number" defaultValue="1000" className="mt-2" />
              </div>
              <div>
                <Label>Quality Pass Rate Target (%)</Label>
                <Input type="number" defaultValue="95" className="mt-2" />
              </div>
            </div>
          </div>

          <Button className="w-full">Save Settings</Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
