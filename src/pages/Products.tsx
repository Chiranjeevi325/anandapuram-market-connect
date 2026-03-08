import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, SlidersHorizontal, Star, ShoppingCart, Check } from 'lucide-react';
import Navbar from '@/components/Navbar';
import PriceTicker from '@/components/PriceTicker';
import Footer from '@/components/Footer';
import { products as staticProducts } from '@/data/products';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/contexts/CartContext';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

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
  const [dbProducts, setDbProducts] = useState<NormalizedProduct[]>([]);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const { addItem } = useCart();

  useEffect(() => {
    const load = async () => {
      const { data: productsData } = await supabase
        .from('products')
        .select('*, profiles!products_seller_id_fkey(full_name, village)')
        .eq('is_active', true);

      if (!productsData) return;

      // Fetch all reviews to compute avg ratings per seller
      const sellerIds = [...new Set(productsData.map((p: any) => p.seller_id))];
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('seller_id, rating')
        .in('seller_id', sellerIds);

      const ratingMap = new Map<string, { sum: number; count: number }>();
      reviewsData?.forEach((r: any) => {
        const entry = ratingMap.get(r.seller_id) || { sum: 0, count: 0 };
        entry.sum += r.rating;
        entry.count += 1;
        ratingMap.set(r.seller_id, entry);
      });

      setDbProducts(productsData.map((p: any) => {
        const entry = ratingMap.get(p.seller_id);
        const avg = entry ? entry.sum / entry.count : 0;
        return {
          id: p.id,
          name: p.name,
          nameLocal: p.name_local || '',
          category: p.category,
          image: p.image_url || 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400&h=400&fit=crop',
          wholesalePrice: { min: p.wholesale_price_min, max: p.wholesale_price_max, unit: p.wholesale_unit },
          retailPrice: { min: p.retail_price_min, max: p.retail_price_max, unit: p.retail_unit },
          vendor: p.profiles?.full_name || 'Local Vendor',
          vendorLocation: p.profiles?.village || 'Anandapuram',
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
    if (priceSort === 'asc') result = [...result].sort((a, b) => a.wholesalePrice.min - b.wholesalePrice.min);
    if (priceSort === 'desc') result = [...result].sort((a, b) => b.wholesalePrice.min - a.wholesalePrice.min);
    return result;
  }, [search, category, priceSort, allProducts]);

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
    <div className="min-h-screen bg-background">
      <PriceTicker />
      <Navbar />

      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-2">Browse Products</h1>
        <p className="text-muted-foreground mb-8">Fresh flowers and produce from Anandapuram vendors</p>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search flowers, vegetables..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['all', 'flowers', 'vegetables'].map(cat => (
              <Button key={cat} variant={category === cat ? 'default' : 'outline'} size="sm" onClick={() => setCategory(cat)} className="capitalize">
                {cat === 'all' ? 'All' : cat}
              </Button>
            ))}
            <Button variant="ghost" size="sm" onClick={() => setPriceSort(prev => prev === 'asc' ? 'desc' : prev === 'desc' ? '' : 'asc')} className="gap-1">
              <SlidersHorizontal className="h-4 w-4" />
              Price {priceSort === 'asc' ? '↑' : priceSort === 'desc' ? '↓' : ''}
            </Button>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map(product => {
            const justAdded = addedIds.has(product.id);
            return (
              <div key={product.id} className="bg-card rounded-xl overflow-hidden shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] transition-all duration-300 group">
                <div className="relative aspect-square overflow-hidden">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    {product.tags.map(tag => (
                      <Badge key={tag} className="bg-secondary text-secondary-foreground text-[10px] font-semibold">{tag}</Badge>
                    ))}
                  </div>
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
                  <p className="text-xs text-muted-foreground mb-3">
                    {product.nameLocal} •{' '}
                    {product.sellerId !== 'static-seller' ? (
                      <Link to={`/seller/${product.sellerId}`} className="text-primary hover:underline">{product.vendor}</Link>
                    ) : (
                      <span>{product.vendor}</span>
                    )}
                    , {product.vendorLocation}
                  </p>
                  <div className="space-y-1 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Wholesale</span>
                      <span className="font-semibold text-primary">₹{product.wholesalePrice.min} – ₹{product.wholesalePrice.max} <span className="text-xs text-muted-foreground font-normal">/ {product.wholesalePrice.unit}</span></span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Retail</span>
                      <span className="font-semibold text-foreground">₹{product.retailPrice.min} – ₹{product.retailPrice.max} <span className="text-xs text-muted-foreground font-normal">/ {product.retailPrice.unit}</span></span>
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

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No products found matching your search.</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Products;
