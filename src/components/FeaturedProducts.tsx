import { Link } from 'react-router-dom';
import { Star, ArrowRight, ShoppingCart, Check, Heart } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { products as staticProducts } from '@/data/products';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/hooks/useCart';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { useWishlist } from '@/hooks/useWishlist';

interface FeaturedProduct {
  id: string;
  name: string;
  nameLocal: string;
  category: string;
  image: string;
  wholesalePrice: { min: number; max: number; unit: string };
  retailPrice: { min: number; max: number; unit: string };
  vendor: string;
  vendorLocation: string;
  rating: number;
  tags: string[];
  inStock: boolean;
  sellerId: string;
}

const FeaturedProducts = () => {
  const [dbProducts, setDbProducts] = useState<FeaturedProduct[]>([]);
  const { addItem } = useCart();
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();
  const { ref: gridRef, isVisible: gridVisible } = useScrollAnimation(0.1);
  const { toggle: toggleWishlist, isWishlisted } = useWishlist();

  // Fetch products from Supabase DB
  useEffect(() => {
    const load = async () => {
      const { data: productsData } = await supabase
        .from('products')
        .select('*, profiles!products_seller_id_fkey(full_name, village)')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(8);

      if (!productsData) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setDbProducts((productsData as any[]).map(p => ({
        id: p.id,
        name: p.name,
        nameLocal: p.name_local || '',
        category: p.category,
        image: p.image_url || 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400&h=400&fit=crop',
        wholesalePrice: { min: p.wholesale_price_min, max: p.wholesale_price_max, unit: p.wholesale_unit },
        retailPrice: { min: p.retail_price_min, max: p.retail_price_max, unit: p.retail_unit },
        vendor: p.profiles?.full_name || 'Local Vendor',
        vendorLocation: p.profiles?.village || 'Anandapuram',
        rating: 0,
        tags: p.tags || [],
        inStock: true,
        sellerId: p.seller_id,
      })));
    };
    load();
  }, []);

  // Merge DB products with static, DB products take priority
  const featured = useMemo(() => {
    const dbNames = new Set(dbProducts.map(p => p.name.toLowerCase()));
    const staticNormalized: FeaturedProduct[] = staticProducts
      .filter(p => !dbNames.has(p.name.toLowerCase()))
      .map(p => ({ ...p, sellerId: 'static-seller' }));
    return [...dbProducts, ...staticNormalized].slice(0, 8);
  }, [dbProducts]);

  const handleAdd = (product: FeaturedProduct) => {
    addItem({
      productId: product.id,
      name: product.name,
      nameLocal: product.nameLocal,
      image: product.image,
      price: product.wholesalePrice.min,
      unit: product.wholesalePrice.unit,
      sellerId: product.sellerId,
      sellerName: product.vendor,
      priceType: 'wholesale',
    });
    setAddedIds(prev => new Set(prev).add(product.id));
    toast.success(`${product.name} added to cart`);
    setTimeout(() => setAddedIds(prev => { const n = new Set(prev); n.delete(product.id); return n; }), 1500);
  };

  return (
    <section className="section-gap bg-surface-container-low">
      <div className="container mx-auto px-4">
        <div
          ref={headerRef}
          className={`flex items-end justify-between mb-12 transition-all duration-700 ${headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <div>
            <p className="text-sm font-semibold text-secondary uppercase tracking-wider mb-2">Fresh Today</p>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground">Today's Fresh Picks</h2>
            <p className="text-muted-foreground mt-2 font-body">Fresh products from local farms and sellers</p>
          </div>
          <Link to="/products" className="hidden sm:flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all group">
            View All <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div ref={gridRef} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((product, i) => {
            const justAdded = addedIds.has(product.id);
            return (
              <div
                key={product.id}
                className={`tonal-card overflow-hidden transition-all duration-500 group ${gridVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                style={{ transitionDelay: gridVisible ? `${i * 100}ms` : '0ms' }}
              >
                <Link to={`/product/${product.id}`} className="relative aspect-[4/5] overflow-hidden block bg-muted">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                  />
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    {product.tags.map(tag => (
                      <span key={tag} className="freshness-badge text-[10px]">{tag}</span>
                    ))}
                  </div>
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product.id); }}
                    className="absolute top-3 right-3 h-9 w-9 rounded-full glass-card flex items-center justify-center hover:scale-110 transition-all duration-200"
                  >
                    <Heart className={`h-4 w-4 transition-colors duration-200 ${isWishlisted(product.id) ? 'fill-destructive text-destructive' : 'text-muted-foreground'}`} />
                  </button>
                </Link>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-display font-bold text-foreground text-base">{product.name}</h3>
                    {product.rating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-secondary-container text-secondary-container" />
                        <span className="text-xs font-semibold text-muted-foreground">{product.rating}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-3 font-body">
                    {product.nameLocal} •{' '}
                    {product.sellerId !== 'static-seller' ? (
                      <Link to={`/seller/${product.sellerId}`} className="text-primary hover:underline">{product.vendor}</Link>
                    ) : (
                      <span>{product.vendor}</span>
                    )}
                  </p>
                  <div className="flex items-baseline justify-between mb-4">
                    <div>
                      <span className="text-lg font-bold text-secondary">₹{product.wholesalePrice.min}</span>
                      <span className="text-xs text-muted-foreground ml-1">– ₹{product.wholesalePrice.max} / {product.wholesalePrice.unit}</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className={`w-full gap-2 rounded-full font-semibold transition-all duration-300 ${justAdded ? 'bg-tertiary-fixed text-tertiary-fixed-fg' : 'btn-gradient'}`}
                    onClick={() => handleAdd(product)}
                  >
                    {justAdded ? <><Check className="h-4 w-4" /> Added</> : <><ShoppingCart className="h-4 w-4" /> Add to Cart</>}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="sm:hidden mt-10 text-center">
          <Link to="/products"><Button className="gap-2 btn-gradient rounded-full px-8 font-semibold">View All Products <ArrowRight className="h-4 w-4" /></Button></Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
