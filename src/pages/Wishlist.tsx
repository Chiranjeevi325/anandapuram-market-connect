import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Check, Star, ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import PriceTicker from '@/components/PriceTicker';
import Footer from '@/components/Footer';
import { products as staticProducts } from '@/data/products';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface WishlistProduct {
  id: string;
  name: string;
  nameLocal: string;
  category: string;
  image: string;
  wholesalePrice: { min: number; max: number; unit: string };
  retailPrice: { min: number; max: number; unit: string };
  vendor: string;
  rating: number;
  tags: string[];
  sellerId: string;
}

const Wishlist = () => {
  const { user } = useAuth();
  const { wishlistIds, toggle, isWishlisted } = useWishlist();
  const { addItem } = useCart();
  const [products, setProducts] = useState<WishlistProduct[]>([]);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const load = async () => {
      if (wishlistIds.size === 0) {
        setProducts([]);
        return;
      }

      const ids = Array.from(wishlistIds);

      const { data: dbData } = await supabase
        .from('products')
        .select('*, profiles!products_seller_id_fkey(full_name)')
        .in('id', ids);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dbProducts: WishlistProduct[] = (dbData as any[] || []).map(p => ({
        id: p.id,
        name: p.name,
        nameLocal: p.name_local || '',
        category: p.category,
        image: p.image_url || 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400&h=400&fit=crop',
        wholesalePrice: { min: p.wholesale_price_min, max: p.wholesale_price_max, unit: p.wholesale_unit },
        retailPrice: { min: p.retail_price_min, max: p.retail_price_max, unit: p.retail_unit },
        vendor: p.profiles?.full_name || 'Local Vendor',
        rating: 0,
        tags: p.tags || [],
        sellerId: p.seller_id,
      }));

      const dbIdSet = new Set(dbProducts.map(p => p.id));
      const staticMatches: WishlistProduct[] = staticProducts
        .filter(p => ids.includes(p.id) && !dbIdSet.has(p.id))
        .map(p => ({
          id: p.id,
          name: p.name,
          nameLocal: p.nameLocal,
          category: p.category,
          image: p.image,
          wholesalePrice: p.wholesalePrice,
          retailPrice: p.retailPrice,
          vendor: p.vendor,
          rating: p.rating,
          tags: p.tags,
          sellerId: 'static-seller',
        }));

      setProducts([...dbProducts, ...staticMatches]);
    };
    load();
  }, [wishlistIds]);

  const handleAddToCart = (product: WishlistProduct) => {
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
    setTimeout(() => setAddedIds(prev => {
      const next = new Set(prev);
      next.delete(product.id);
      return next;
    }), 1500);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-surface">
        <PriceTicker />
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <Heart className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
          <h1 className="text-3xl font-display font-bold text-foreground mb-3">Your Wishlist</h1>
          <p className="text-muted-foreground mb-6 font-body">Sign in to save your favorite products</p>
          <Link to="/auth">
            <Button className="gap-2 btn-gradient rounded-full px-8 font-semibold">Sign In <ArrowRight className="h-4 w-4" /></Button>
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
        <p className="text-sm font-semibold text-secondary uppercase tracking-wider mb-1">Saved Items</p>
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-2">Your Wishlist</h1>
        <p className="text-muted-foreground mb-8 font-body">{products.length} saved {products.length === 1 ? 'item' : 'items'}</p>

        {products.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-muted-foreground text-lg mb-4 font-body">Your wishlist is empty</p>
            <Link to="/products">
              <Button className="gap-2 btn-gradient rounded-full px-8 font-semibold">Browse Products <ArrowRight className="h-4 w-4" /></Button>
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product, i) => {
              const justAdded = addedIds.has(product.id);
              return (
                <div
                  key={product.id}
                  className="tonal-card overflow-hidden group animate-fade-in-up"
                  style={{ animationDelay: `${Math.min(i, 7) * 60}ms`, animationFillMode: 'both' }}
                >
                  <Link to={`/product/${product.id}`} className="relative aspect-[4/5] overflow-hidden block bg-muted">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }} />
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      {product.tags.map(tag => (
                        <span key={tag} className="freshness-badge text-[10px]">{tag}</span>
                      ))}
                    </div>
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(product.id); }}
                      className="absolute top-3 right-3 h-9 w-9 rounded-full glass-card flex items-center justify-center hover:scale-110 transition-all duration-200"
                    >
                      <Heart className={`h-4 w-4 transition-colors duration-200 ${isWishlisted(product.id) ? 'fill-destructive text-destructive' : 'text-muted-foreground'}`} />
                    </button>
                  </Link>
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-display font-bold text-foreground">{product.name}</h3>
                      {product.rating > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-secondary-container text-secondary-container" />
                          <span className="text-xs font-semibold text-muted-foreground">{product.rating}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-3 font-body">{product.nameLocal} • {product.vendor}</p>
                    <div className="flex items-baseline justify-between mb-4">
                      <div>
                        <span className="text-lg font-bold text-secondary">₹{product.wholesalePrice.min}</span>
                        <span className="text-xs text-muted-foreground ml-1">– ₹{product.wholesalePrice.max} / {product.wholesalePrice.unit}</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className={`w-full gap-2 rounded-full font-semibold transition-all duration-300 ${justAdded ? 'bg-tertiary-fixed text-tertiary-fixed-fg' : 'btn-gradient'}`}
                      onClick={() => handleAddToCart(product)}
                    >
                      {justAdded ? <><Check className="h-4 w-4" /> Added</> : <><ShoppingCart className="h-4 w-4" /> Add to Cart</>}
                    </Button>
                  </div>
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

export default Wishlist;
