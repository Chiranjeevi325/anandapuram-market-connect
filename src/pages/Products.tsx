import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { SlidersHorizontal, Star, ShoppingCart, Check, Heart } from 'lucide-react';
import Navbar from '@/components/Navbar';
import PriceTicker from '@/components/PriceTicker';
import Footer from '@/components/Footer';
import { products as staticProducts } from '@/data/products';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/hooks/useCart';
import { Input } from '@/components/ui/input';
import SearchSuggestions from '@/components/SearchSuggestions';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useWishlist } from '@/hooks/useWishlist';

interface NormalizedProduct {
  id: string;
  name: string;
  nameLocal: string;
  category: 'flowers' | 'vegetables';
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

const Products = () => {
  const [searchParams] = useSearchParams();
  const initialCat = searchParams.get('cat') || 'all';

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(initialCat);
  const [priceSort, setPriceSort] = useState<'asc' | 'desc' | ''>('');
  const [minRating, setMinRating] = useState(0);
  const [ratingSort, setRatingSort] = useState(false);
  const [dbProducts, setDbProducts] = useState<NormalizedProduct[]>([]);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const { addItem } = useCart();
  const { toggle: toggleWishlist, isWishlisted } = useWishlist();

  useEffect(() => {
    const load = async () => {
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true);

      if (!productsData) return;

      // Fetch seller profiles
      const sellerIds = [...new Set(productsData.map((p: any) => p.seller_id))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, full_name, village')
        .in('user_id', sellerIds);

      const profileMap = new Map<string, { full_name: string; village: string | null }>();
      profilesData?.forEach((pr: any) => profileMap.set(pr.user_id, pr));

      // Fetch all reviews to compute avg ratings per seller
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('seller_id, rating')
        .in('seller_id', sellerIds);

      const ratingMap = new Map<string, { sum: number; count: number }>();
      reviewsData?.forEach(r => {
        const entry = ratingMap.get(r.seller_id) || { sum: 0, count: 0 };
        entry.sum += r.rating;
        entry.count += 1;
        ratingMap.set(r.seller_id, entry);
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setDbProducts((productsData as any[]).map(p => {
        const entry = ratingMap.get(p.seller_id);
        const avg = entry ? entry.sum / entry.count : 0;
        const sellerProfile = profileMap.get(p.seller_id);
        return {
          id: p.id,
          name: p.name,
          nameLocal: p.name_local || '',
          category: p.category,
          image: p.image_url || 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400&h=400&fit=crop',
          wholesalePrice: { min: p.wholesale_price_min, max: p.wholesale_price_max, unit: p.wholesale_unit },
          retailPrice: { min: p.retail_price_min, max: p.retail_price_max, unit: p.retail_unit },
          vendor: sellerProfile?.full_name || 'Local Vendor',
          vendorLocation: sellerProfile?.village || 'Anandapuram',
          rating: Math.round(avg * 10) / 10,
          tags: p.tags || [],
          inStock: true,
          sellerId: p.seller_id,
        };
      }));
    };
    load();
  }, []);

  const allProducts: NormalizedProduct[] = useMemo(() => {
    const dbNames = new Set(dbProducts.map(p => p.name.toLowerCase()));
    const staticNormalized: NormalizedProduct[] = staticProducts
      .filter(p => !dbNames.has(p.name.toLowerCase()))
      .map(p => ({ ...p, sellerId: 'static-seller' }));
    return [...dbProducts, ...staticNormalized];
  }, [dbProducts]);

  const filtered = useMemo(() => {
    let result = allProducts;
    if (category !== 'all') result = result.filter(p => p.category === category);
    if (search) result = result.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.nameLocal.toLowerCase().includes(search.toLowerCase())
    );
    if (minRating > 0) result = result.filter(p => p.rating >= minRating);
    if (priceSort === 'asc') result = [...result].sort((a, b) => a.wholesalePrice.min - b.wholesalePrice.min);
    if (priceSort === 'desc') result = [...result].sort((a, b) => b.wholesalePrice.min - a.wholesalePrice.min);
    if (ratingSort) result = [...result].sort((a, b) => b.rating - a.rating);
    return result;
  }, [search, category, priceSort, minRating, ratingSort, allProducts]);

  const handleAddToCart = (product: NormalizedProduct) => {
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

  return (
    <div className="min-h-screen bg-surface">
      <PriceTicker />
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        {/* Page header */}
        <div className="mb-10">
          <p className="text-sm font-semibold text-secondary uppercase tracking-wider mb-2">Browse Collection</p>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-2">Browse Products</h1>
          <p className="text-muted-foreground font-body">Fresh flowers and produce from Anandapuram vendors</p>
        </div>

        {/* Filters — surface-container-low background */}
        <div className="bg-surface-container-low rounded-2xl p-5 mb-10">
          <div className="flex flex-col sm:flex-row gap-4">
            <SearchSuggestions
              value={search}
              onChange={setSearch}
              extraProducts={dbProducts}
              className="flex-1 max-w-md"
            />
            <div className="flex gap-2 flex-wrap">
              {['all', 'flowers', 'vegetables'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold capitalize transition-all duration-200 ${
                    category === cat
                      ? 'bg-secondary-container text-secondary-container-fg shadow-card'
                      : 'bg-surface-container-highest text-muted-foreground hover:bg-surface-container-high'
                  }`}
                >
                  {cat === 'all' ? 'All' : cat}
                </button>
              ))}
              <button
                onClick={() => setPriceSort(prev => prev === 'asc' ? 'desc' : prev === 'desc' ? '' : 'asc')}
                className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-1.5 transition-all duration-200 ${
                  priceSort ? 'bg-surface-container-highest text-foreground' : 'bg-surface-container-highest text-muted-foreground hover:bg-surface-container-high'
                }`}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Price {priceSort === 'asc' ? '↑' : priceSort === 'desc' ? '↓' : ''}
              </button>
              <button
                onClick={() => setMinRating(prev => prev >= 4 ? 0 : prev + 1)}
                className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-1.5 transition-all duration-200 ${
                  minRating > 0 ? 'bg-secondary-container text-secondary-container-fg' : 'bg-surface-container-highest text-muted-foreground hover:bg-surface-container-high'
                }`}
              >
                <Star className="h-3.5 w-3.5" />
                {minRating > 0 ? `${minRating}+ Stars` : 'Min Rating'}
              </button>
              <button
                onClick={() => setRatingSort(prev => !prev)}
                className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-1.5 transition-all duration-200 ${
                  ratingSort ? 'bg-secondary-container text-secondary-container-fg' : 'bg-surface-container-highest text-muted-foreground hover:bg-surface-container-high'
                }`}
              >
                <Star className="h-3.5 w-3.5" />
                Top Rated {ratingSort ? '↓' : ''}
              </button>
            </div>
          </div>
        </div>

        {/* Product grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((product, i) => {
            const justAdded = addedIds.has(product.id);
            return (
              <div
                key={product.id}
                className="tonal-card overflow-hidden transition-all duration-500 group animate-fade-in-up"
                style={{ animationDelay: `${Math.min(i, 7) * 60}ms`, animationFillMode: 'both' }}
              >
                <Link to={`/product/${product.id}`} className="relative aspect-[4/5] overflow-hidden block bg-muted">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
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
                    <h3 className="font-display font-bold text-foreground">{product.name}</h3>
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
                    , {product.vendorLocation}
                  </p>
                  <div className="space-y-1.5 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground font-body">Wholesale</span>
                      <span className="font-semibold text-secondary">₹{product.wholesalePrice.min} – ₹{product.wholesalePrice.max} <span className="text-xs text-muted-foreground font-normal">/ {product.wholesalePrice.unit}</span></span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground font-body">Retail</span>
                      <span className="font-semibold text-foreground">₹{product.retailPrice.min} – ₹{product.retailPrice.max} <span className="text-xs text-muted-foreground font-normal">/ {product.retailPrice.unit}</span></span>
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

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg font-body">No products found matching your search.</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Products;
