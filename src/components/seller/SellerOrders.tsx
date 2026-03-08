import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Clock, Truck, MapPin, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

interface OrderItem {
  id: string;
  quantity: number;
  price_per_unit: number;
  unit: string;
  subtotal: number;
  products: { name: string; name_local: string | null; image_url: string | null } | null;
}

interface Order {
  id: string;
  status: string;
  delivery_type: string;
  is_preorder: boolean;
  total_amount: number;
  notes: string | null;
  created_at: string;
  buyer_id: string;
  buyer_profile: { full_name: string; phone: string | null } | null;
  order_items: OrderItem[];
}

const statusConfig: Record<string, { label: string; color: string; next?: string; nextLabel?: string }> = {
  pending: { label: 'Pending', color: 'bg-secondary text-secondary-foreground', next: 'confirmed', nextLabel: 'Confirm' },
  confirmed: { label: 'Confirmed', color: 'bg-primary text-primary-foreground', next: 'ready', nextLabel: 'Mark Ready' },
  ready: { label: 'Ready', color: 'bg-accent text-accent-foreground', next: 'picked_up', nextLabel: 'Picked Up' },
  picked_up: { label: 'Picked Up', color: 'bg-primary text-primary-foreground', next: 'delivered', nextLabel: 'Delivered' },
  delivered: { label: 'Delivered', color: 'bg-primary/80 text-primary-foreground' },
  cancelled: { label: 'Cancelled', color: 'bg-destructive text-destructive-foreground' },
};

interface Props {
  userId: string;
}

const SellerOrders = ({ userId }: Props) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'all' | 'pending' | 'active' | 'completed'>('all');

  useEffect(() => { fetchOrders(); }, [userId]);

  const fetchOrders = async () => {
    const { data: ordersData } = await supabase
      .from('orders')
      .select('*, order_items(*, products(name, name_local, image_url))')
      .eq('seller_id', userId)
      .order('created_at', { ascending: false });

    if (!ordersData) { setOrders([]); setLoading(false); return; }

    const buyerIds = [...new Set(ordersData.map((o: any) => o.buyer_id))];
    const { data: profiles } = await supabase.from('profiles').select('user_id, full_name, phone').in('user_id', buyerIds);
    const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

    setOrders(ordersData.map((o: any) => ({ ...o, buyer_profile: profileMap.get(o.buyer_id) || null })));
    setLoading(false);
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    if (error) toast.error(error.message);
    else { toast.success(`Order ${statusConfig[newStatus]?.label}`); fetchOrders(); }
  };

  const filtered = orders.filter(o => {
    if (tab === 'pending') return o.status === 'pending';
    if (tab === 'active') return ['confirmed', 'ready', 'picked_up'].includes(o.status);
    if (tab === 'completed') return ['delivered', 'cancelled'].includes(o.status);
    return true;
  });

  if (loading) return <div className="text-center py-10 text-muted-foreground">Loading orders...</div>;

  return (
    <div>
      <div className="flex gap-2 mb-6 flex-wrap">
        {(['all', 'pending', 'active', 'completed'] as const).map(t => (
          <Button key={t} variant={tab === t ? 'default' : 'outline'} size="sm" onClick={() => setTab(t)} className="capitalize">
            {t} ({orders.filter(o => {
              if (t === 'all') return true;
              if (t === 'pending') return o.status === 'pending';
              if (t === 'active') return ['confirmed', 'ready', 'picked_up'].includes(o.status);
              return ['delivered', 'cancelled'].includes(o.status);
            }).length})
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-xl shadow-[var(--shadow-card)]">
          <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">No orders found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(order => {
            const config = statusConfig[order.status] || { label: order.status, color: 'bg-muted text-muted-foreground' };
            const date = new Date(order.created_at);
            return (
              <div key={order.id} className="bg-card rounded-xl shadow-[var(--shadow-card)] overflow-hidden">
                <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <Badge className={config.color}>{config.label}</Badge>
                      {order.is_preorder && (
                        <Badge variant="secondary" className="text-[10px]"><Clock className="h-3 w-3 mr-1" /> Pre-order</Badge>
                      )}
                      <span className="text-xs text-muted-foreground">#{order.id.slice(0, 8)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Buyer: <span className="font-medium text-foreground">{order.buyer_profile?.full_name || 'Unknown'}</span>
                      {order.buyer_profile?.phone && <span className="ml-2">• {order.buyer_profile.phone}</span>}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-3">
                      <span>{date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                      <span className="flex items-center gap-1">
                        {order.delivery_type === 'pickup' ? <MapPin className="h-3 w-3" /> : <Truck className="h-3 w-3" />}
                        <span className="capitalize">{order.delivery_type}</span>
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">₹{order.total_amount}</p>
                    <p className="text-xs text-muted-foreground">{order.order_items.length} item{order.order_items.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>

                <div className="px-5 py-3 space-y-2">
                  {order.order_items.map(item => (
                    <div key={item.id} className="flex items-center gap-3">
                      {item.products?.image_url ? (
                        <img src={item.products.image_url} alt={item.products?.name} className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                          <Package className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{item.products?.name || 'Product'}</p>
                        <p className="text-xs text-muted-foreground">{item.quantity} × ₹{item.price_per_unit}/{item.unit}</p>
                      </div>
                      <p className="text-sm font-semibold text-foreground">₹{item.subtotal}</p>
                    </div>
                  ))}
                </div>

                {order.notes && (
                  <div className="px-5 py-2 border-t border-border bg-muted/30">
                    <p className="text-xs text-muted-foreground"><span className="font-medium">Note:</span> {order.notes}</p>
                  </div>
                )}

                {order.status !== 'delivered' && order.status !== 'cancelled' && (
                  <div className="px-5 py-3 border-t border-border flex gap-2 justify-end">
                    {config.next && (
                      <Button size="sm" onClick={() => updateStatus(order.id, config.next!)}>
                        {config.nextLabel}
                      </Button>
                    )}
                    {order.status === 'pending' && (
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => updateStatus(order.id, 'cancelled')}>
                        Cancel
                      </Button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SellerOrders;
