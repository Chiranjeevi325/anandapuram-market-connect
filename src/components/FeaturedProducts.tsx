import { Link } from 'react-router-dom';
import { Star, ArrowRight, ShoppingCart, Check, Heart } from 'lucide-react';
import { useState } from 'react';
import { products } from '@/data/products';
import { useCart } from '@/contexts/CartContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const FeaturedProducts = () => {
  const featured = products.filter(p => p.category === 'flowers').slice(0, 4);
  const { addItem } = useCart();
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();
  const { ref: gridRef, isVisible: gridVisible } = useScrollAnimation(0.1);

  const handleAdd = (product: typeof featured[0]) => {
    addItem({
      productId: product.id,
      name: product.name,
      nameLocal: product.nameLocal,
      image: product.image,
      price: product.wholesalePrice.min,
      unit: product.wholesalePrice.unit,
      sellerId: 'static-seller',
      sellerName: product.vendor,
      priceType: 'wholesale',
    });
    setAddedIds(prev => new Set(prev).add(product.id));
    toast.success(`${product.name} added to cart`);
    setTimeout(() => setAddedIds(prev => { const n = new Set(prev); n.delete(product.id); return n; }), 1500);
  };

  return (
    <section className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div
          ref={headerRef}
          className={`flex items-end justify-between mb-10 transition-all duration-700 ${headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <div>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground">Today's Fresh Picks</h2>
            <p className="text-muted-foreground mt-2">Hand-picked flowers from local farms</p>
          </div>
          <Link to="/products" className="hidden sm:flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all">
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div ref={gridRef} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((product, i) => {
            const justAdded = addedIds.has(product.id);
            return (
              <div
                key={product.id}
                className={`bg-card rounded-xl overflow-hidden shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] hover:-translate-y-1 transition-all duration-500 group ${gridVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                style={{ transitionDelay: gridVisible ? `${i * 100}ms` : '0ms' }}
              >
                <div className="relative aspect-square overflow-hidden">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    {product.tags.map(tag => (
                      <Badge key={tag} className="bg-secondary text-secondary-foreground text-[10px] font-semibold">{tag}</Badge>
                    ))}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-display font-bold text-foreground">{product.name}</h3>
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-secondary text-secondary" />
                      <span className="text-xs font-medium text-muted-foreground">{product.rating}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{product.nameLocal} • {product.vendor}</p>
                  <div className="flex items-baseline justify-between mb-3">
                    <div>
                      <span className="text-lg font-bold text-primary">₹{product.wholesalePrice.min}</span>
                      <span className="text-xs text-muted-foreground ml-1">– ₹{product.wholesalePrice.max} / {product.wholesalePrice.unit}</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="w-full gap-2"
                    variant={justAdded ? 'secondary' : 'default'}
                    onClick={() => handleAdd(product)}
                  >
                    {justAdded ? <><Check className="h-4 w-4" /> Added</> : <><ShoppingCart className="h-4 w-4" /> Add to Cart</>}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="sm:hidden mt-8 text-center">
          <Link to="/products"><Button variant="outline" className="gap-2">View All Products <ArrowRight className="h-4 w-4" /></Button></Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
