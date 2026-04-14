import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, AlertTriangle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import PriceTicker from '@/components/PriceTicker';
import Footer from '@/components/Footer';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';

const isStaticProduct = (id: string) => !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

const Cart = () => {
  const { items, removeItem, updateQuantity, totalAmount, clearCart } = useCart();

  const hasStaticItems = items.some(i => isStaticProduct(i.productId) || i.sellerId === 'static-seller');
  const orderableItems = items.filter(i => !isStaticProduct(i.productId) && i.sellerId !== 'static-seller');
  const orderableTotal = orderableItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-surface">
        <PriceTicker />
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h1 className="text-2xl font-display font-bold text-foreground mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6 font-body">Browse the market and add fresh flowers & produce</p>
          <Link to="/products">
            <Button className="gap-2 btn-gradient rounded-full px-8 font-semibold">Browse Products <ArrowRight className="h-4 w-4" /></Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <PriceTicker />
      <Navbar />

      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-sm font-semibold text-secondary uppercase tracking-wider mb-1">Your Selection</p>
            <h1 className="text-3xl font-display font-bold text-foreground">Shopping Cart</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={clearCart} className="text-destructive hover:bg-destructive/10 rounded-xl">
            Clear All
          </Button>
        </div>

        {hasStaticItems && (
          <div className="bg-secondary-container/20 rounded-2xl p-4 mb-6 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-foreground">Some items are demo products</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Items from demo vendors can't be ordered. Only products from real sellers will be included in your order.
              </p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => {
              const isDemo = isStaticProduct(item.productId) || item.sellerId === 'static-seller';
              return (
                <div key={item.productId} className={`tonal-card p-4 flex gap-4 ${isDemo ? 'opacity-60' : ''}`}>
                  <img src={item.image} alt={item.name} className="w-20 h-20 rounded-xl object-cover flex-shrink-0 bg-surface-container-high" onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-display font-bold text-foreground">{item.name}</h3>
                        <p className="text-xs text-muted-foreground font-body">{item.nameLocal} • {item.sellerName}</p>
                        <p className="text-xs text-muted-foreground font-body capitalize">{item.priceType} • {item.unit}</p>
                        {isDemo && <span className="text-[10px] text-secondary font-semibold uppercase">Demo product</span>}
                      </div>
                      <button onClick={() => removeItem(item.productId)} className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded-lg hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1 bg-surface-container-low rounded-xl">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="p-2 hover:text-primary transition-colors rounded-l-xl hover:bg-surface-container-high"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="text-sm font-semibold w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="p-2 hover:text-primary transition-colors rounded-r-xl hover:bg-surface-container-high"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="font-bold text-secondary">₹{(item.price * item.quantity).toFixed(0)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order summary */}
          <div className="tonal-card p-6 h-fit sticky top-24">
            <h2 className="font-display font-bold text-foreground text-lg mb-4">Order Summary</h2>
            <div className="space-y-3 mb-6">
              {items.map(item => {
                const isDemo = isStaticProduct(item.productId) || item.sellerId === 'static-seller';
                return (
                  <div key={item.productId} className={`flex justify-between text-sm ${isDemo ? 'line-through opacity-50' : ''}`}>
                    <span className="text-muted-foreground truncate mr-2 font-body">{item.name} × {item.quantity}</span>
                    <span className="font-medium text-foreground">₹{(item.price * item.quantity).toFixed(0)}</span>
                  </div>
                );
              })}
              <div className="h-px bg-outline-variant/15 my-2" />
              {hasStaticItems && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span className="font-body">Orderable total</span>
                  <span className="font-semibold text-foreground">₹{orderableTotal.toFixed(0)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="font-semibold text-foreground">Total</span>
                <span className="font-bold text-secondary text-lg">₹{totalAmount.toFixed(0)}</span>
              </div>
            </div>
            <Link to="/checkout">
              <Button
                className="w-full gap-2 btn-gradient rounded-full font-semibold"
                size="lg"
                disabled={orderableItems.length === 0}
              >
                Proceed to Checkout <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            {orderableItems.length === 0 && items.length > 0 && (
              <p className="text-xs text-destructive text-center mt-2 font-body">
                Your cart only has demo products. Add real seller products to checkout.
              </p>
            )}
            <Link to="/products">
              <Button variant="ghost" className="w-full mt-3 rounded-xl hover:bg-surface-container-high font-body" size="sm">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Cart;
