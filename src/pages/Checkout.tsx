import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, Truck } from 'lucide-react';
import Navbar from '@/components/Navbar';
import PriceTicker from '@/components/PriceTicker';
import Footer from '@/components/Footer';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const Checkout = () => {
  const { items, totalAmount, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('pickup');
  const [isPreorder, setIsPreorder] = useState(false);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <PriceTicker />
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-display font-bold mb-2">Sign in to checkout</h1>
          <p className="text-muted-foreground mb-6">You need an account to place orders</p>
          <Link to="/auth">
            <Button>Sign In / Sign Up</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Group items by seller
  const sellerGroups = items.reduce<Record<string, typeof items>>((acc, item) => {
    if (!acc[item.sellerId]) acc[item.sellerId] = [];
    acc[item.sellerId].push(item);
    return acc;
  }, {});

  const handlePlaceOrder = async () => {
    setLoading(true);

    try {
      // Create one order per seller
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
      navigate('/');
    } catch (err: any) {
      toast.error(err.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const currentHour = new Date().getHours();
  const canPreorder = currentHour >= 18 || currentHour < 4; // 6 PM to 4 AM

  return (
    <div className="min-h-screen bg-background">
      <PriceTicker />
      <Navbar />

      <div className="container mx-auto px-4 py-10">
        <Link to="/cart" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to cart
        </Link>

        <h1 className="text-3xl font-display font-bold text-foreground mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Options */}
            <div className="bg-card rounded-xl p-6 shadow-[var(--shadow-card)]">
              <h2 className="font-display font-bold text-foreground text-lg mb-4">Delivery Option</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <button
                  onClick={() => setDeliveryType('pickup')}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    deliveryType === 'pickup'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/30'
                  }`}
                >
                  <MapPin className="h-5 w-5 text-primary mb-2" />
                  <p className="font-semibold text-foreground">Market Pickup</p>
                  <p className="text-xs text-muted-foreground mt-1">Pick up at Anandapuram Market, AH45 Junction</p>
                </button>
                <button
                  onClick={() => setDeliveryType('delivery')}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    deliveryType === 'delivery'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/30'
                  }`}
                >
                  <Truck className="h-5 w-5 text-primary mb-2" />
                  <p className="font-semibold text-foreground">Home Delivery</p>
                  <p className="text-xs text-muted-foreground mt-1">Delivery within Visakhapatnam city</p>
                </button>
              </div>
            </div>

            {/* Pre-order */}
            <div className="bg-card rounded-xl p-6 shadow-[var(--shadow-card)]">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="h-5 w-5 text-secondary" />
                <h2 className="font-display font-bold text-foreground text-lg">Early Bird Pre-Order</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Order tonight for 5:00 AM pickup. Available between 6 PM – 4 AM.
              </p>
              <button
                onClick={() => setIsPreorder(!isPreorder)}
                disabled={!canPreorder}
                className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                  isPreorder
                    ? 'border-secondary bg-secondary/10 text-secondary-foreground'
                    : 'border-border text-muted-foreground'
                } ${!canPreorder ? 'opacity-50 cursor-not-allowed' : 'hover:border-secondary/50'}`}
              >
                {isPreorder ? '✅ Pre-order enabled' : canPreorder ? 'Enable Pre-Order' : 'Available 6 PM – 4 AM'}
              </button>
            </div>

            {/* Notes */}
            <div className="bg-card rounded-xl p-6 shadow-[var(--shadow-card)]">
              <h2 className="font-display font-bold text-foreground text-lg mb-3">Order Notes</h2>
              <Label htmlFor="notes" className="text-sm text-muted-foreground">Special instructions for the seller</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g., Need extra fresh marigold garlands for temple pooja"
                className="mt-2"
                maxLength={500}
              />
            </div>
          </div>

          {/* Summary */}
          <div className="bg-card rounded-xl p-6 shadow-[var(--shadow-card)] h-fit sticky top-24">
            <h2 className="font-display font-bold text-foreground text-lg mb-4">Order Summary</h2>
            <div className="space-y-3 mb-6">
              {items.map(item => (
                <div key={item.productId} className="flex justify-between text-sm">
                  <span className="text-muted-foreground truncate mr-2">{item.name} × {item.quantity}</span>
                  <span className="font-medium text-foreground">₹{(item.price * item.quantity).toFixed(0)}</span>
                </div>
              ))}
              <div className="border-t pt-3">
                <div className="flex justify-between text-sm text-muted-foreground mb-1">
                  <span>Delivery</span>
                  <span className="capitalize">{deliveryType}</span>
                </div>
                {isPreorder && (
                  <div className="flex justify-between text-sm text-secondary mb-1">
                    <span>Pre-order</span>
                    <span>5:00 AM pickup</span>
                  </div>
                )}
                <div className="flex justify-between mt-2 pt-2 border-t">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="font-bold text-primary text-lg">₹{totalAmount.toFixed(0)}</span>
                </div>
              </div>
            </div>
            <Button className="w-full" size="lg" onClick={handlePlaceOrder} disabled={loading}>
              {loading ? 'Placing Order...' : `Place Order • ₹${totalAmount.toFixed(0)}`}
            </Button>
            <p className="text-[11px] text-muted-foreground text-center mt-3">
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
