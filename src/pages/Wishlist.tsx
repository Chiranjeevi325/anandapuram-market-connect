import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Check, Star, ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import PriceTicker from '@/components/PriceTicker';
import Footer from '@/components/Footer';
import { products as staticProducts } from '@/data/products';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
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

      // Load DB products
      const { data: dbData } = await supabase
        .from('products')
        .select('*, profiles!products_seller_id_fkey(full_name)')
        .in('id', ids);

      const dbProducts: WishlistProduct[] = (dbData || []).map((p: any) => ({
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

      // Also check static products
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
      <div className="min-h-screen bg-background">
        <PriceTicker />
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <Heart className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h1 className="text-3xl font-display font-bold text-foreground mb-3">Your Wishlist</h1>
          <p className="text-muted-foreground mb-6">Sign in to save your favorite products</p>
          <Link to="/auth">
            <Button className="gap-2">Sign In <ArrowRight className="h-4 w-4" /></Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PriceTicker />
      <Navbar />
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-2">Your Wishlist</h1>
        <p className="text-muted-foreground mb-8">{products.length} saved {products.length === 1 ? 'item' : 'items'}</p>

        {products.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground text-lg mb-4">Your wishlist is empty</p>
            <Link to="/products">
              <Button variant="outline" className="gap-2">Browse Products <ArrowRight className="h-4 w-4" /></Button>
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product, i) => {
              const justAdded = addedIds.has(product.id);
              return (
                <div
                  key={product.id}
                  className="bg-card rounded-xl overflow-hidden shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] hover:-translate-y-1 transition-all duration-500 group animate-fade-in-up"
                  style={{ animationDelay: `${Math.min(i, 7) * 60}ms`, animationFillMode: 'both' }}
                >
                  <div className="relative aspect-square overflow-hidden">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      {product.tags.map(tag => (
                        <Badge key={tag} className="bg-secondary text-secondary-foreground text-[10px] font-semibold">{tag}</Badge>
                      ))}
                    </div>
                    <button
                      onClick={() => toggle(product.id)}
                      className="absolute top-3 right-3 h-8 w-8 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-all duration-200 hover:scale-110"
                    >
                      <Heart className={`h-4 w-4 transition-colors duration-200 ${isWishlisted(product.id) ? 'fill-destructive text-destructive' : 'text-muted-foreground'}`} />
                    </button>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-display font-bold text-foreground">{product.name}</h3>
                      {product.rating > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-secondary text-secondary" />
                          <span className="text-xs font-medium text-muted-foreground">{product.rating}</span>
                        </div>
                      )}
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
