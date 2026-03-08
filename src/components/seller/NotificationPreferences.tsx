import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Bell, Mail, Package, ShoppingCart, TruckIcon } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  userId: string;
}

interface Preferences {
  notify_low_stock: boolean;
  notify_new_order: boolean;
  notify_order_status: boolean;
  notify_email: boolean;
  notify_in_app: boolean;
}

const defaults: Preferences = {
  notify_low_stock: true,
  notify_new_order: true,
  notify_order_status: true,
  notify_email: true,
  notify_in_app: true,
};

const NotificationPreferences = ({ userId }: Props) => {
  const [prefs, setPrefs] = useState<Preferences>(defaults);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('seller_settings')
        .select('notify_low_stock, notify_new_order, notify_order_status, notify_email, notify_in_app')
        .eq('user_id', userId)
        .maybeSingle();
      if (data) setPrefs(data as Preferences);
      setLoading(false);
    };
    load();
  }, [userId]);

  const toggle = async (key: keyof Preferences) => {
    const newVal = !prefs[key];
    setPrefs(prev => ({ ...prev, [key]: newVal }));

    const { error } = await supabase.from('seller_settings').upsert(
      { user_id: userId, [key]: newVal },
      { onConflict: 'user_id' }
    );

    if (error) {
      setPrefs(prev => ({ ...prev, [key]: !newVal }));
      toast.error('Failed to update preference');
    }
  };

  if (loading) return <div className="text-center py-8 text-muted-foreground text-sm">Loading preferences…</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Bell className="h-5 w-5" /> Notification Preferences
        </CardTitle>
        <CardDescription>Choose which alerts you want to receive and how</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Delivery channels */}
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3">Delivery Channels</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary"><Bell className="h-4 w-4" /></div>
                <div>
                  <Label className="text-sm font-medium">In-App Notifications</Label>
                  <p className="text-xs text-muted-foreground">Show alerts in the notification bell</p>
                </div>
              </div>
              <Switch checked={prefs.notify_in_app} onCheckedChange={() => toggle('notify_in_app')} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary"><Mail className="h-4 w-4" /></div>
                <div>
                  <Label className="text-sm font-medium">Email Notifications</Label>
                  <p className="text-xs text-muted-foreground">Send alerts to your email address</p>
                </div>
              </div>
              <Switch checked={prefs.notify_email} onCheckedChange={() => toggle('notify_email')} />
            </div>
          </div>
        </div>

        <Separator />

        {/* Alert types */}
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3">Alert Types</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-destructive/10 text-destructive"><Package className="h-4 w-4" /></div>
                <div>
                  <Label className="text-sm font-medium">Low Stock Alerts</Label>
                  <p className="text-xs text-muted-foreground">When product stock drops below threshold</p>
                </div>
              </div>
              <Switch checked={prefs.notify_low_stock} onCheckedChange={() => toggle('notify_low_stock')} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent text-accent-foreground"><ShoppingCart className="h-4 w-4" /></div>
                <div>
                  <Label className="text-sm font-medium">New Order Alerts</Label>
                  <p className="text-xs text-muted-foreground">When a buyer places a new order</p>
                </div>
              </div>
              <Switch checked={prefs.notify_new_order} onCheckedChange={() => toggle('notify_new_order')} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted text-muted-foreground"><TruckIcon className="h-4 w-4" /></div>
                <div>
                  <Label className="text-sm font-medium">Order Status Updates</Label>
                  <p className="text-xs text-muted-foreground">When order status changes (confirmed, shipped, etc.)</p>
                </div>
              </div>
              <Switch checked={prefs.notify_order_status} onCheckedChange={() => toggle('notify_order_status')} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationPreferences;
