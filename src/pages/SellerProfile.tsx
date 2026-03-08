import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import PriceTicker from '@/components/PriceTicker';
import Footer from '@/components/Footer';
import StarRating from '@/components/StarRating';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, ShoppingCart, Check, Star, Package, MessageSquare } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
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

  useEffect(() => {
    if (!sellerId) return;
    Promise.all([fetchSeller(), fetchProducts(), fetchReviews()]).then(() => setLoading(false));
  }, [sellerId]);

  const fetchSeller = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, farm_name, village, primary_product, avatar_url, user_id')
      .eq('user_id', sellerId!)
      .single();
    if (data) setSeller(data);
  };

  const fetchProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('id, name, name_local, category, image_url, wholesale_price_min, wholesale_price_max, wholesale_unit, retail_price_min, retail_price_max, retail_unit, tags, quantity_available')
      .eq('seller_id', sellerId!)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    if (data) setProducts(data);
  };

  const fetchReviews = async () => {
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
  };

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
      <div className="min-h-screen bg-background">
        <PriceTicker />
        <Navbar />
        <div className="container mx-auto px-4 py-10 space-y-6">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen bg-background">
        <PriceTicker />
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground text-lg">Seller not found.</p>
          <Link to="/products"><Button variant="outline" className="mt-4">Browse Products</Button></Link>
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
        {/* Seller header */}
        <Card className="mb-8">
          <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row items-start gap-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-display text-2xl font-bold">
              {seller.full_name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
                {seller.farm_name || seller.full_name}
              </h1>
              {seller.farm_name && (
                <p className="text-muted-foreground text-sm">{seller.full_name}</p>
              )}
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                {seller.village && (
                  <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{seller.village}</span>
                )}
                {seller.primary_product && (
                  <Badge variant="secondary">{seller.primary_product}</Badge>
                )}
              </div>
              <div className="flex items-center gap-3 mt-4">
                <StarRating value={Math.round(avgRating)} readonly size="md" />
                <span className="text-sm font-medium text-foreground">{avgRating.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Package className="h-4 w-4" />{products.length} product{products.length !== 1 ? 's' : ''}</span>
            </div>
          </CardContent>
        </Card>

        {/* Products */}
        <h2 className="text-xl font-display font-bold text-foreground mb-4">Products</h2>
        {products.length === 0 ? (
          <p className="text-muted-foreground mb-8">No products listed yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
            {products.map(p => {
              const justAdded = addedIds.has(p.id);
              return (
                <div key={p.id} className="bg-card rounded-xl overflow-hidden shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] transition-all duration-300 group">
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={p.image_url || 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400&h=400&fit=crop'}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    {p.tags && p.tags.length > 0 && (
                      <div className="absolute top-3 left-3 flex gap-1.5">
                        {p.tags.map(tag => (
                          <Badge key={tag} className="bg-secondary text-secondary-foreground text-[10px] font-semibold">{tag}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-display font-bold text-foreground mb-1">{p.name}</h3>
                    {p.name_local && <p className="text-xs text-muted-foreground mb-2">{p.name_local}</p>}
                    <div className="space-y-1 mb-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Wholesale</span>
                        <span className="font-semibold text-primary">₹{p.wholesale_price_min}–₹{p.wholesale_price_max}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Retail</span>
                        <span className="font-semibold text-foreground">₹{p.retail_price_min}–₹{p.retail_price_max}</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="w-full gap-2"
                      variant={justAdded ? 'secondary' : 'default'}
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
        <h2 className="text-xl font-display font-bold text-foreground mb-4 flex items-center gap-2">
          <MessageSquare className="h-5 w-5" /> Reviews
        </h2>
        {reviews.length === 0 ? (
          <Card><CardContent className="p-6 text-center text-muted-foreground">No reviews yet.</CardContent></Card>
        ) : (
          <div className="space-y-4">
            {reviews.map(r => (
              <Card key={r.id}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-foreground text-sm">{r.buyer_name}</span>
                      <StarRating value={r.rating} readonly size="sm" />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default SellerProfile;
