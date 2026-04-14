import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, Truck, ShieldCheck } from 'lucide-react';
import Navbar from '@/components/Navbar';
import PriceTicker from '@/components/PriceTicker';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const isStaticProduct = (id: string) => !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

const Checkout = () => {
  const { items, totalAmount, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('pickup');
  const [isPreorder, setIsPreorder] = useState(false);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // Filter out static/demo products — they can't be ordered
  const orderableItems = items.filter(i => !isStaticProduct(i.productId) && i.sellerId !== 'static-seller');

  if (orderableItems.length === 0) {
    navigate('/cart');
    return null;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-surface">
        <PriceTicker />
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <ShieldCheck className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h1 className="text-2xl font-display font-bold mb-2">Sign in to checkout</h1>
          <p className="text-muted-foreground mb-6 font-body">You need an account to place orders</p>
          <Link to="/auth">
            <Button className="btn-gradient rounded-full px-8 font-semibold">Sign In / Sign Up</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Group orderable items by seller
  const sellerGroups = orderableItems.reduce<Record<string, typeof orderableItems>>((acc, item) => {
    if (!acc[item.sellerId]) acc[item.sellerId] = [];
    acc[item.sellerId].push(item);
    return acc;
  }, {});

  const orderableTotal = orderableItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const handlePlaceOrder = async () => {
    setLoading(true);

    try {
      for (const [sellerId, sellerItems] of Object.entries(sellerGroups)) {
        const orderTotal = sellerItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert({
            buyer_id: user.id,
            seller_id: sellerId,
            status: 'pending',
            delivery_type: deliveryType,
            is_preorder: isPreorder,
            total_amount: orderTotal,
            notes: notes || null,
          })
          .select('id')
          .single();

        if (orderError) throw orderError;

        const orderItems = sellerItems.map(item => ({
          order_id: order.id,
          product_id: item.productId,
          quantity: item.quantity,
          price_per_unit: item.price,
          unit: item.unit,
          subtotal: item.price * item.quantity,
        }));

        const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
        if (itemsError) throw itemsError;
      }

      clearCart();
      toast.success('Order placed successfully! 🎉');
      navigate('/orders');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const currentHour = new Date().getHours();
  const canPreorder = currentHour >= 18 || currentHour < 4;

  return (
    <div className="min-h-screen bg-surface">
      <PriceTicker />
      <Navbar />

      <div className="container mx-auto px-4 py-10">
        <Link to="/cart" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 font-body">
          <ArrowLeft className="h-4 w-4" /> Back to cart
        </Link>

        <p className="text-sm font-semibold text-secondary uppercase tracking-wider mb-1">Almost there</p>
        <h1 className="text-3xl font-display font-bold text-foreground mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Options */}
            <div className="tonal-card p-6">
              <h2 className="font-display font-bold text-foreground text-lg mb-4">Delivery Option</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <button
                  onClick={() => setDeliveryType('pickup')}
                  className={`p-5 rounded-2xl text-left transition-all duration-200 ${deliveryType === 'pickup'
                    ? 'bg-secondary-container/20 shadow-card'
                    : 'bg-surface-container-low hover:bg-surface-container-high'
                    }`}
                >
                  <MapPin className={`h-5 w-5 mb-2 ${deliveryType === 'pickup' ? 'text-secondary' : 'text-primary'}`} />
                  <p className="font-semibold text-foreground">Market Pickup</p>
                  <p className="text-xs text-muted-foreground mt-1 font-body">Pick up at Anandapuram Market, AH45 Junction</p>
                </button>
                <button
                  onClick={() => setDeliveryType('delivery')}
                  className={`p-5 rounded-2xl text-left transition-all duration-200 ${deliveryType === 'delivery'
                    ? 'bg-secondary-container/20 shadow-card'
                    : 'bg-surface-container-low hover:bg-surface-container-high'
                    }`}
                >
                  <Truck className={`h-5 w-5 mb-2 ${deliveryType === 'delivery' ? 'text-secondary' : 'text-primary'}`} />
                  <p className="font-semibold text-foreground">Home Delivery</p>
                  <p className="text-xs text-muted-foreground mt-1 font-body">Delivery within Visakhapatnam city</p>
                </button>
              </div>
            </div>

            {/* Pre-order */}
            <div className="tonal-card p-6">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="h-5 w-5 text-secondary" />
                <h2 className="font-display font-bold text-foreground text-lg">Early Bird Pre-Order</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-4 font-body">
                Order tonight for 5:00 AM pickup. Available between 6 PM – 4 AM.
              </p>
              <button
                onClick={() => setIsPreorder(!isPreorder)}
                disabled={!canPreorder}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${isPreorder
                  ? 'bg-secondary-container text-secondary-container-fg shadow-card'
                  : 'bg-surface-container-low text-muted-foreground'
                  } ${!canPreorder ? 'opacity-50 cursor-not-allowed' : 'hover:bg-surface-container-high'}`}
              >
                {isPreorder ? '✅ Pre-order enabled' : canPreorder ? 'Enable Pre-Order' : 'Available 6 PM – 4 AM'}
              </button>
            </div>

            {/* Notes */}
            <div className="tonal-card p-6">
              <h2 className="font-display font-bold text-foreground text-lg mb-3">Order Notes</h2>
              <Label htmlFor="notes" className="text-sm text-muted-foreground font-body">Special instructions for the seller</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g., Need extra fresh marigold garlands for temple pooja"
                className="mt-2 rounded-xl bg-surface-container-low border-0 focus:bg-surface-container-highest focus:ring-1 focus:ring-primary/20"
                maxLength={500}
              />
            </div>
          </div>

          {/* Summary */}
          <div className="tonal-card p-6 h-fit sticky top-24">
            <h2 className="font-display font-bold text-foreground text-lg mb-4">Order Summary</h2>
            <div className="space-y-3 mb-6">
              {orderableItems.map(item => (
                <div key={item.productId} className="flex justify-between text-sm">
                  <span className="text-muted-foreground truncate mr-2 font-body">{item.name} × {item.quantity}</span>
                  <span className="font-medium text-foreground">₹{(item.price * item.quantity).toFixed(0)}</span>
                </div>
              ))}
              <div className="h-px bg-outline-variant/20 my-2" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span className="font-body">Delivery</span>
                <span className="capitalize font-body">{deliveryType}</span>
              </div>
              {isPreorder && (
                <div className="flex justify-between text-sm text-secondary">
                  <span className="font-body">Pre-order</span>
                  <span className="font-body">5:00 AM pickup</span>
                </div>
              )}
              <div className="h-px bg-outline-variant/20 my-2" />
              <div className="flex justify-between">
                <span className="font-semibold text-foreground">Total</span>
                <span className="font-bold text-secondary text-lg">₹{orderableTotal.toFixed(0)}</span>
              </div>
            </div>
            <Button className="w-full btn-gradient rounded-full font-semibold" size="lg" onClick={handlePlaceOrder} disabled={loading}>
              {loading ? 'Placing Order...' : `Place Order • ₹${orderableTotal.toFixed(0)}`}
            </Button>
            <p className="text-[11px] text-muted-foreground text-center mt-3 font-body">
              {Object.keys(sellerGroups).length > 1
                ? `This will create ${Object.keys(sellerGroups).length} separate orders (one per seller)`
                : 'Your order will be sent directly to the seller'}
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Checkout;
