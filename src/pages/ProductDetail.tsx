import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, Heart, ShoppingCart, Check, MapPin, User, ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import PriceTicker from '@/components/PriceTicker';
import Footer from '@/components/Footer';
import { products as staticProducts } from '@/data/products';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/hooks/useWishlist';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import StarRating from '@/components/StarRating';
import { toast } from 'sonner';

interface ProductDetail {
  id: string;
  name: string;
  nameLocal: string;
  category: string;
  image: string;
  additionalImages: string[];
  description: string;
  wholesalePrice: { min: number; max: number; unit: string };
  retailPrice: { min: number; max: number; unit: string };
  vendor: string;
  vendorLocation: string;
  rating: number;
  tags: string[];
  inStock: boolean;
  sellerId: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  buyer_name: string;
}

const ProductDetailPage = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [priceType, setPriceType] = useState<'wholesale' | 'retail'>('wholesale');
  const { addItem } = useCart();
  const { toggle: toggleWishlist, isWishlisted } = useWishlist();

  useEffect(() => {
    const load = async () => {
      if (!productId) return;
      setLoading(true);

      // Try DB first
      const { data: dbProduct } = await supabase
        .from('products')
        .select('*, profiles!products_seller_id_fkey(full_name, village, farm_name, phone)')
        .eq('id', productId)
        .maybeSingle();

      if (dbProduct) {
        // Fetch reviews for this seller
        const { data: reviewsData } = await supabase
          .from('reviews')
          .select('id, rating, comment, created_at, buyer_id')
          .eq('seller_id', (dbProduct as any).seller_id)
          .order('created_at', { ascending: false })
          .limit(10);

        // Get buyer names
        const buyerIds = reviewsData?.map((r: any) => r.buyer_id) || [];
        const { data: buyerProfiles } = buyerIds.length > 0
          ? await supabase.from('profiles').select('user_id, full_name').in('user_id', buyerIds)
          : { data: [] };

        const buyerMap = new Map((buyerProfiles || []).map((p: any) => [p.user_id, p.full_name]));

        setReviews((reviewsData || []).map((r: any) => ({
          id: r.id,
          rating: r.rating,
          comment: r.comment,
          created_at: r.created_at,
          buyer_name: buyerMap.get(r.buyer_id) || 'Anonymous',
        })));

        const p = dbProduct as any;
        const avgRating = reviewsData && reviewsData.length > 0
          ? Math.round((reviewsData.reduce((sum: number, r: any) => sum + r.rating, 0) / reviewsData.length) * 10) / 10
          : 0;

        setProduct({
          id: p.id,
          name: p.name,
          nameLocal: p.name_local || '',
          category: p.category,
          image: p.image_url || 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400&h=400&fit=crop',
          additionalImages: p.additional_images || [],
          description: p.description || 'Fresh produce from Anandapuram Market. Sourced directly from local farmers for guaranteed quality and freshness.',
          wholesalePrice: { min: p.wholesale_price_min, max: p.wholesale_price_max, unit: p.wholesale_unit },
          retailPrice: { min: p.retail_price_min, max: p.retail_price_max, unit: p.retail_unit },
          vendor: p.profiles?.full_name || 'Local Vendor',
          vendorLocation: p.profiles?.village || 'Anandapuram',
          rating: avgRating,
          tags: p.tags || [],
          inStock: true,
          sellerId: p.seller_id,
        });
      } else {
        // Fall back to static
        const sp = staticProducts.find(p => p.id === productId);
        if (sp) {
          setProduct({
            ...sp,
            additionalImages: sp.additionalImages || [],
            description: sp.description || 'Fresh produce from Anandapuram Market.',
            sellerId: 'static-seller',
          });
        }
      }

      setLoading(false);
    };
    load();
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) return;
    const price = priceType === 'wholesale' ? product.wholesalePrice : product.retailPrice;
    addItem({
      productId: product.id,
      name: product.name,
      nameLocal: product.nameLocal,
      image: product.image,
      price: price.min,
      unit: price.unit,
      sellerId: product.sellerId,
      sellerName: product.vendor,
      priceType,
    });
    setAddedToCart(true);
    toast.success(`${product.name} added to cart`);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const allImages = product ? [product.image, ...product.additionalImages] : [];

  const nextImage = () => setSelectedImage(prev => (prev + 1) % allImages.length);
  const prevImage = () => setSelectedImage(prev => (prev - 1 + allImages.length) % allImages.length);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <PriceTicker />
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="animate-pulse space-y-4 max-w-4xl mx-auto">
            <div className="h-96 bg-muted rounded-xl" />
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-4 bg-muted rounded w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <PriceTicker />
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-display font-bold text-foreground mb-4">Product Not Found</h1>
          <Link to="/products"><Button variant="outline" className="gap-2"><ArrowLeft className="h-4 w-4" /> Back to Products</Button></Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PriceTicker />
      <Navbar />

      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6 animate-fade-in-up">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-primary transition-colors">Products</Link>
          <span>/</span>
          <Link to={`/products?cat=${product.category}`} className="hover:text-primary transition-colors capitalize">{product.category}</Link>
          <span>/</span>
          <span className="text-foreground font-medium">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-10 mb-16">
          {/* Image Gallery */}
          <div className="space-y-4 animate-fade-in-up">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted shadow-[var(--shadow-elevated)] group">
              <img
                src={allImages[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-all opacity-0 group-hover:opacity-100"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-all opacity-0 group-hover:opacity-100"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
              <button
                onClick={() => toggleWishlist(product.id)}
                className="absolute top-4 right-4 h-10 w-10 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-all hover:scale-110"
              >
                <Heart className={`h-5 w-5 transition-colors duration-200 ${isWishlisted(product.id) ? 'fill-destructive text-destructive' : 'text-muted-foreground'}`} />
              </button>
              <div className="absolute top-4 left-4 flex gap-2">
                {product.tags.map(tag => (
                  <Badge key={tag} className="bg-secondary text-secondary-foreground text-xs font-semibold">{tag}</Badge>
                ))}
              </div>
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex gap-3">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative w-20 h-20 rounded-lg overflow-hidden transition-all duration-200 ${
                      selectedImage === i ? 'ring-2 ring-primary ring-offset-2' : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
            <div>
              <p className="text-sm text-secondary font-medium uppercase tracking-wider mb-1">{product.nameLocal}</p>
              <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-2">{product.name}</h1>
              <div className="flex items-center gap-3">
                {product.rating > 0 && (
                  <div className="flex items-center gap-1.5">
                    <StarRating value={product.rating} readonly size="sm" />
                    <span className="text-sm font-medium text-muted-foreground">{product.rating}</span>
                    {reviews.length > 0 && (
                      <span className="text-sm text-muted-foreground">({reviews.length} reviews)</span>
                    )}
                  </div>
                )}
                <Badge variant={product.inStock ? 'default' : 'destructive'} className="text-xs">
                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                </Badge>
              </div>
            </div>

            {/* Price Section */}
            <div className="bg-card rounded-xl p-5 shadow-[var(--shadow-card)] space-y-4">
              <div className="flex gap-2">
                <Button
                  variant={priceType === 'wholesale' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPriceType('wholesale')}
                >
                  Wholesale
                </Button>
                <Button
                  variant={priceType === 'retail' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPriceType('retail')}
                >
                  Retail
                </Button>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-primary">
                    ₹{priceType === 'wholesale' ? product.wholesalePrice.min : product.retailPrice.min}
                  </span>
                  <span className="text-lg text-muted-foreground">
                    – ₹{priceType === 'wholesale' ? product.wholesalePrice.max : product.retailPrice.max}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    / {priceType === 'wholesale' ? product.wholesalePrice.unit : product.retailPrice.unit}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Prices vary based on season and availability</p>
              </div>
              <Button
                size="lg"
                className="w-full gap-2 text-base"
                variant={addedToCart ? 'secondary' : 'default'}
                onClick={handleAddToCart}
              >
                {addedToCart ? <><Check className="h-5 w-5" /> Added to Cart</> : <><ShoppingCart className="h-5 w-5" /> Add to Cart</>}
              </Button>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-lg font-display font-bold text-foreground mb-2">About this product</h2>
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            </div>

            {/* Seller Info */}
            <div className="bg-card rounded-xl p-5 shadow-[var(--shadow-card)]">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Seller Information</h3>
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {product.sellerId !== 'static-seller' ? (
                      <Link to={`/seller/${product.sellerId}`} className="font-display font-bold text-foreground hover:text-primary transition-colors">
                        {product.vendor}
                      </Link>
                    ) : (
                      <span className="font-display font-bold text-foreground">{product.vendor}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {product.vendorLocation}
                  </div>
                  {product.sellerId !== 'static-seller' && (
                    <Link to={`/seller/${product.sellerId}`}>
                      <Button variant="outline" size="sm" className="mt-3">View Seller Profile</Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <div className="max-w-3xl mb-16">
            <h2 className="text-2xl font-display font-bold text-foreground mb-6">Customer Reviews</h2>
            <div className="space-y-4">
              {reviews.map(review => (
                <div key={review.id} className="bg-card rounded-xl p-5 shadow-[var(--shadow-card)]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <span className="font-medium text-foreground text-sm">{review.buyer_name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <StarRating value={review.rating} readonly size="sm" />
                  {review.comment && (
                    <p className="text-sm text-muted-foreground mt-2">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetailPage;
