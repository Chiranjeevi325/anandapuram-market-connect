import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import PriceTicker from '@/components/PriceTicker';
import Footer from '@/components/Footer';
import StarRating from '@/components/StarRating';
import { Button } from '@/components/ui/button';
import { MapPin, ShoppingCart, Check, Star, Package, MessageSquare, User } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';

interface SellerData {
  full_name: string;
  farm_name: string | null;
  village: string | null;
  primary_product: string | null;
  avatar_url: string | null;
  user_id: string;
}

interface ProductData {
  id: string;
  name: string;
  name_local: string | null;
  category: string;
  image_url: string | null;
  wholesale_price_min: number;
  wholesale_price_max: number;
  wholesale_unit: string;
  retail_price_min: number;
  retail_price_max: number;
  retail_unit: string;
  tags: string[] | null;
  quantity_available: number;
}

interface ReviewData {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  buyer_name: string;
}

const SellerProfile = () => {
  const { sellerId } = useParams<{ sellerId: string }>();
  const { addItem } = useCart();
  const [seller, setSeller] = useState<SellerData | null>(null);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const fetchSeller = useCallback(async () => {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, farm_name, village, primary_product, avatar_url, user_id')
      .eq('user_id', sellerId!)
      .single();
    if (data) setSeller(data);
  }, [sellerId]);

  const fetchProducts = useCallback(async () => {
    const { data } = await supabase
      .from('products')
      .select('id, name, name_local, category, image_url, wholesale_price_min, wholesale_price_max, wholesale_unit, retail_price_min, retail_price_max, retail_unit, tags, quantity_available')
      .eq('seller_id', sellerId!)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    if (data) setProducts(data);
  }, [sellerId]);

  const fetchReviews = useCallback(async () => {
    const { data } = await supabase
      .from('reviews')
      .select('id, rating, comment, created_at, buyer_id')
      .eq('seller_id', sellerId!)
      .order('created_at', { ascending: false });
    if (!data || data.length === 0) return;

    const buyerIds = [...new Set(data.map(r => r.buyer_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, full_name')
      .in('user_id', buyerIds);

    const nameMap = new Map(profiles?.map(p => [p.user_id, p.full_name]) || []);
    setReviews(data.map(r => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      created_at: r.created_at,
      buyer_name: nameMap.get(r.buyer_id) || 'Buyer',
    })));
  }, [sellerId]);

  useEffect(() => {
    if (!sellerId) return;
    Promise.all([fetchSeller(), fetchProducts(), fetchReviews()]).then(() => setLoading(false));
  }, [sellerId, fetchSeller, fetchProducts, fetchReviews]);

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const handleAddToCart = (p: ProductData) => {
    addItem({
      productId: p.id,
      name: p.name,
      nameLocal: p.name_local || '',
      image: p.image_url || 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400&h=400&fit=crop',
      price: p.wholesale_price_min,
      unit: p.wholesale_unit,
      sellerId: sellerId!,
      sellerName: seller?.full_name || 'Vendor',
      priceType: 'wholesale',
    });
    setAddedIds(prev => new Set(prev).add(p.id));
    toast.success(`${p.name} added to cart`);
    setTimeout(() => setAddedIds(prev => { const n = new Set(prev); n.delete(p.id); return n; }), 1500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface">
        <PriceTicker />
        <Navbar />
        <div className="container mx-auto px-4 py-10 space-y-6">
          <div className="h-32 w-full rounded-2xl bg-surface-container-low animate-shimmer" />
          <div className="h-64 w-full rounded-2xl bg-surface-container-low animate-shimmer" />
        </div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen bg-surface">
        <PriceTicker />
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground text-lg font-body">Seller not found.</p>
          <Link to="/products"><Button className="mt-4 btn-gradient rounded-full px-8 font-semibold">Browse Products</Button></Link>
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
        {/* Seller header */}
        <div className="tonal-card p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-surface-container-low flex items-center justify-center flex-shrink-0 text-primary font-display text-2xl font-bold">
              {seller.avatar_url ? (
                <img src={seller.avatar_url} alt={seller.full_name} className="w-full h-full rounded-2xl object-cover" />
              ) : (
                seller.full_name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
                {seller.farm_name || seller.full_name}
              </h1>
              {seller.farm_name && (
                <p className="text-muted-foreground text-sm font-body">{seller.full_name}</p>
              )}
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                {seller.village && (
                  <span className="flex items-center gap-1 font-body"><MapPin className="h-4 w-4" />{seller.village}</span>
                )}
                {seller.primary_product && (
                  <span className="freshness-badge">{seller.primary_product}</span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-4">
                <StarRating value={Math.round(avgRating)} readonly size="md" />
                <span className="text-sm font-medium text-foreground">{avgRating.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground font-body">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 text-sm text-muted-foreground font-body">
              <span className="flex items-center gap-1"><Package className="h-4 w-4" />{products.length} product{products.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        {/* Products */}
        <p className="text-sm font-semibold text-secondary uppercase tracking-wider mb-2">Catalog</p>
        <h2 className="text-xl font-display font-bold text-foreground mb-4">Products</h2>
        {products.length === 0 ? (
          <p className="text-muted-foreground mb-8 font-body">No products listed yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
            {products.map(p => {
              const justAdded = addedIds.has(p.id);
              return (
                <div key={p.id} className="tonal-card overflow-hidden group">
                  <Link to={`/product/${p.id}`} className="relative aspect-[4/5] overflow-hidden block">
                    <img
                      src={p.image_url || 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400&h=400&fit=crop'}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    {p.tags && p.tags.length > 0 && (
                      <div className="absolute top-3 left-3 flex gap-1.5">
                        {p.tags.map(tag => (
                          <span key={tag} className="freshness-badge text-[10px]">{tag}</span>
                        ))}
                      </div>
                    )}
                  </Link>
                  <div className="p-5">
                    <h3 className="font-display font-bold text-foreground mb-1">{p.name}</h3>
                    {p.name_local && <p className="text-xs text-muted-foreground mb-2 font-body">{p.name_local}</p>}
                    <div className="space-y-1.5 mb-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground font-body">Wholesale</span>
                        <span className="font-semibold text-secondary">₹{p.wholesale_price_min}–₹{p.wholesale_price_max}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground font-body">Retail</span>
                        <span className="font-semibold text-foreground">₹{p.retail_price_min}–₹{p.retail_price_max}</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className={`w-full gap-2 rounded-full font-semibold transition-all duration-300 ${justAdded ? 'bg-tertiary-fixed text-tertiary-fixed-fg' : 'btn-gradient'}`}
                      onClick={() => handleAddToCart(p)}
                    >
                      {justAdded ? <><Check className="h-4 w-4" /> Added</> : <><ShoppingCart className="h-4 w-4" /> Add to Cart</>}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Reviews */}
        <p className="text-sm font-semibold text-secondary uppercase tracking-wider mb-2">Feedback</p>
        <h2 className="text-xl font-display font-bold text-foreground mb-4 flex items-center gap-2">
          <MessageSquare className="h-5 w-5" /> Reviews
        </h2>
        {reviews.length === 0 ? (
          <div className="tonal-card p-6 text-center text-muted-foreground font-body">No reviews yet.</div>
        ) : (
          <div className="space-y-4">
            {reviews.map(r => (
              <div key={r.id} className="tonal-card p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-surface-container-high flex items-center justify-center">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="font-medium text-foreground text-sm">{r.buyer_name}</span>
                    <StarRating value={r.rating} readonly size="sm" />
                  </div>
                  <span className="text-xs text-muted-foreground font-body">
                    {new Date(r.created_at).toLocaleDateString()}
                  </span>
                </div>
                {r.comment && <p className="text-sm text-muted-foreground font-body">{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default SellerProfile;
