import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import PriceTicker from '@/components/PriceTicker';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Package, Clock, ArrowRight, Truck, MapPin, ShoppingBag, Star } from 'lucide-react';
import { toast } from 'sonner';
import StarRating from '@/components/StarRating';
import ReviewForm from '@/components/ReviewForm';

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
  updated_at: string;
  buyer_id: string;
  seller_id: string;
  buyer_profile: { full_name: string; phone: string | null } | null;
  seller_profile: { full_name: string; farm_name: string | null; phone: string | null } | null;
  order_items: OrderItem[];
  review: { rating: number; comment: string | null } | null;
}

const statusConfig: Record<string, { label: string; color: string; next?: string; nextLabel?: string }> = {
  pending: { label: 'Pending', color: 'bg-secondary-container text-secondary-container-fg', next: 'confirmed', nextLabel: 'Confirm' },
  confirmed: { label: 'Confirmed', color: 'bg-primary text-primary-foreground', next: 'ready', nextLabel: 'Mark Ready' },
  ready: { label: 'Ready', color: 'bg-tertiary-fixed text-tertiary-fixed-fg', next: 'picked_up', nextLabel: 'Picked Up' },
  picked_up: { label: 'Picked Up', color: 'bg-primary text-primary-foreground', next: 'delivered', nextLabel: 'Delivered' },
  delivered: { label: 'Delivered', color: 'bg-primary text-primary-foreground' },
  cancelled: { label: 'Cancelled', color: 'bg-destructive text-destructive-foreground' },
};

const Orders = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'all' | 'pending' | 'active' | 'completed'>('all');
  const [reviewingOrderId, setReviewingOrderId] = useState<string | null>(null);

  const isSeller = profile?.role === 'seller';

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (user) fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchOrders = async () => {
    const { data: ordersData, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(name, name_local, image_url))')
      .order('created_at', { ascending: false });

    if (error || !ordersData) {
      setOrders([]);
      setLoading(false);
      return;
    }

    const userIds = new Set<string>();
    ordersData.forEach(o => {
      userIds.add(o.buyer_id);
      userIds.add(o.seller_id);
    });

    const orderIds = ordersData.map(o => o.id);

    const [{ data: profiles }, { data: reviews }] = await Promise.all([
      supabase.from('profiles').select('user_id, full_name, farm_name, phone').in('user_id', Array.from(userIds)),
      supabase.from('reviews').select('order_id, rating, comment').in('order_id', orderIds),
    ]);

    const profileMap = new Map<string, { user_id: string; full_name: string; farm_name: string | null; phone: string | null }>();
    profiles?.forEach(p => profileMap.set(p.user_id, p));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const reviewMap = new Map<string, any>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (reviews as any[])?.forEach((r: any) => reviewMap.set(r.order_id, r));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const enriched: Order[] = (ordersData as any[]).map(o => ({
      ...o,
      buyer_profile: profileMap.get(o.buyer_id) || null,
      seller_profile: profileMap.get(o.seller_id) || null,
      review: reviewMap.get(o.id) || null,
    }));

    setOrders(enriched);
    setLoading(false);
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`Order ${statusConfig[newStatus]?.label || newStatus}`);
      fetchOrders();
    }
  };

  const cancelOrder = async (orderId: string) => {
    await updateStatus(orderId, 'cancelled');
  };

  const filteredOrders = orders.filter(o => {
    if (tab === 'pending') return o.status === 'pending';
    if (tab === 'active') return ['confirmed', 'ready', 'picked_up'].includes(o.status);
    if (tab === 'completed') return ['delivered', 'cancelled'].includes(o.status);
    return true;
  });

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-center">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-muted-foreground font-body">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <PriceTicker />
      <Navbar />

      <div className="container mx-auto px-4 py-10">
        <p className="text-sm font-semibold text-secondary uppercase tracking-wider mb-1">
          {isSeller ? 'Manage' : 'Track'}
        </p>
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">
          {isSeller ? 'Incoming Orders' : 'My Orders'}
        </h1>
        <p className="text-muted-foreground mb-8 font-body">
          {isSeller ? 'Manage orders from your buyers' : 'Track your purchases from Anandapuram Market'}
        </p>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {(['all', 'pending', 'active', 'completed'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-full text-sm font-semibold capitalize transition-all duration-200 ${
                tab === t
                  ? 'bg-secondary-container text-secondary-container-fg shadow-card'
                  : 'bg-surface-container-low text-muted-foreground hover:bg-surface-container-high'
              }`}
            >
              {t} {t !== 'all' && `(${orders.filter(o => {
                if (t === 'pending') return o.status === 'pending';
                if (t === 'active') return ['confirmed', 'ready', 'picked_up'].includes(o.status);
                if (t === 'completed') return ['delivered', 'cancelled'].includes(o.status);
                return false;
              }).length})`}
            </button>
          ))}
        </div>

        {filteredOrders.length === 0 ? (
          <div className="text-center py-20 tonal-card">
            <ShoppingBag className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground text-lg font-body">No orders found</p>
            {!isSeller && (
              <Link to="/products">
                <Button className="mt-4 gap-2 btn-gradient rounded-full font-semibold">Browse Products <ArrowRight className="h-4 w-4" /></Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map(order => {
              const config = statusConfig[order.status] || { label: order.status, color: 'bg-muted text-muted-foreground' };
              const counterparty = isSeller ? order.buyer_profile : order.seller_profile;
              const date = new Date(order.created_at);

              return (
                <div key={order.id} className="tonal-card overflow-hidden">
                  {/* Header */}
                  <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${config.color}`}>{config.label}</span>
                        {order.is_preorder && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-secondary-container/20 text-secondary">
                            <Clock className="h-3 w-3" /> Pre-order
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground font-body">
                          #{order.id.slice(0, 8)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground font-body">
                        {isSeller ? 'From' : 'Seller'}: <span className="font-medium text-foreground">{counterparty?.full_name || 'Unknown'}</span>
                        {counterparty?.phone && <span className="ml-2">• {counterparty.phone}</span>}
                        {!isSeller && order.seller_profile?.farm_name && <span className="ml-2">• {order.seller_profile.farm_name}</span>}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-3 font-body">
                        <span>{date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} at {date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="flex items-center gap-1">
                          {order.delivery_type === 'pickup' ? <MapPin className="h-3 w-3" /> : <Truck className="h-3 w-3" />}
                          <span className="capitalize">{order.delivery_type}</span>
                        </span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-secondary">₹{order.total_amount}</p>
                      <p className="text-xs text-muted-foreground font-body">{order.order_items.length} item{order.order_items.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="px-5 py-3 space-y-2 bg-surface-container-low/50">
                    {order.order_items.map(item => (
                      <div key={item.id} className="flex items-center gap-3">
                        {item.products?.image_url ? (
                          <img src={item.products.image_url} alt={item.products?.name} className="w-10 h-10 rounded-xl object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center">
                            <Package className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {item.products?.name || 'Product'}
                            {item.products?.name_local && <span className="text-muted-foreground font-normal"> ({item.products.name_local})</span>}
                          </p>
                          <p className="text-xs text-muted-foreground font-body">{item.quantity} × ₹{item.price_per_unit} / {item.unit}</p>
                        </div>
                        <p className="text-sm font-semibold text-foreground">₹{item.subtotal}</p>
                      </div>
                    ))}
                  </div>

                  {/* Notes */}
                  {order.notes && (
                    <div className="px-5 py-2 bg-surface-container-low/30">
                      <p className="text-xs text-muted-foreground font-body"><span className="font-medium">Note:</span> {order.notes}</p>
                    </div>
                  )}

                  {/* Actions */}
                  {order.status !== 'delivered' && order.status !== 'cancelled' && (
                    <div className="px-5 py-3 flex gap-2 justify-end">
                      {isSeller && config.next && (
                        <Button size="sm" className="btn-gradient rounded-full font-semibold" onClick={() => updateStatus(order.id, config.next!)}>
                          {config.nextLabel}
                        </Button>
                      )}
                      {order.status === 'pending' && (
                        <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10 rounded-xl" onClick={() => cancelOrder(order.id)}>
                          Cancel
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Review Section */}
                  {order.status === 'delivered' && (
                    <div className="px-5 py-3 bg-surface-container-low/30">
                      {order.review ? (
                        <div className="flex items-start gap-3">
                          <Star className="h-4 w-4 text-secondary fill-secondary mt-0.5 shrink-0" />
                          <div>
                            <div className="flex items-center gap-2">
                              <StarRating value={order.review.rating} readonly size="sm" />
                              <span className="text-xs text-muted-foreground font-body">{order.review.rating}/5</span>
                            </div>
                            {order.review.comment && (
                              <p className="text-sm text-muted-foreground mt-1 font-body">"{order.review.comment}"</p>
                            )}
                          </div>
                        </div>
                      ) : !isSeller ? (
                        reviewingOrderId === order.id ? (
                          <ReviewForm
                            orderId={order.id}
                            sellerId={order.seller_id}
                            onSubmitted={() => { setReviewingOrderId(null); fetchOrders(); }}
                            onCancel={() => setReviewingOrderId(null)}
                          />
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="gap-2 rounded-xl hover:bg-surface-container-high"
                            onClick={() => setReviewingOrderId(order.id)}
                          >
                            <Star className="h-4 w-4" /> Rate Seller
                          </Button>
                        )
                      ) : null}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Orders;
