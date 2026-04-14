import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, Heart, ShoppingCart, Check, MapPin, User, ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import PriceTicker from '@/components/PriceTicker';
import Footer from '@/components/Footer';
import { products as staticProducts } from '@/data/products';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
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

      const { data: dbProduct } = await supabase
        .from('products')
        .select('*, profiles!products_seller_id_fkey(full_name, village, farm_name, phone)')
        .eq('id', productId)
        .maybeSingle();

      if (dbProduct) {
        const { data: reviewsData } = await supabase
          .from('reviews')
          .select('id, rating, comment, created_at, buyer_id')
          .eq('seller_id', dbProduct.seller_id)
          .order('created_at', { ascending: false })
          .limit(10);

        const buyerIds = reviewsData?.map(r => r.buyer_id) || [];
        const { data: buyerProfiles } = buyerIds.length > 0
          ? await supabase.from('profiles').select('user_id, full_name').in('user_id', buyerIds)
          : { data: [] };

        const buyerMap = new Map((buyerProfiles || []).map(p => [p.user_id, p.full_name]));

        setReviews((reviewsData || []).map(r => ({
          id: r.id,
          rating: r.rating,
          comment: r.comment,
          created_at: r.created_at,
          buyer_name: buyerMap.get(r.buyer_id) || 'Anonymous',
        })));

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const p = dbProduct as any;
        const avgRating = reviewsData && reviewsData.length > 0
          ? Math.round((reviewsData.reduce((sum: number, r) => sum + r.rating, 0) / reviewsData.length) * 10) / 10
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
      <div className="min-h-screen bg-surface">
        <PriceTicker />
        <Navbar />
        <div className="container mx-auto px-4 py-20">
          <div className="animate-shimmer space-y-4 max-w-4xl mx-auto">
            <div className="h-96 rounded-2xl bg-surface-container-low" />
            <div className="h-8 rounded-xl bg-surface-container-low w-1/3" />
            <div className="h-4 rounded-xl bg-surface-container-low w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-surface">
        <PriceTicker />
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-display font-bold text-foreground mb-4">Product Not Found</h1>
          <Link to="/products"><Button className="gap-2 btn-gradient rounded-full px-8 font-semibold"><ArrowLeft className="h-4 w-4" /> Back to Products</Button></Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <PriceTicker />
      <Navbar />

      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6 animate-fade-in-up font-body">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="text-outline-variant">/</span>
          <Link to="/products" className="hover:text-primary transition-colors">Products</Link>
          <span className="text-outline-variant">/</span>
          <Link to={`/products?cat=${product.category}`} className="hover:text-primary transition-colors capitalize">{product.category}</Link>
          <span className="text-outline-variant">/</span>
          <span className="text-foreground font-medium">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-10 mb-16">
          {/* Image Gallery */}
          <div className="space-y-4 animate-fade-in-up">
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-surface-container-low shadow-elevated group">
              <img
                src={allImages[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
              />
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full glass-card flex items-center justify-center hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full glass-card flex items-center justify-center hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
              <button
                onClick={() => toggleWishlist(product.id)}
                className="absolute top-4 right-4 h-10 w-10 rounded-full glass-card flex items-center justify-center hover:scale-110 transition-all"
              >
                <Heart className={`h-5 w-5 transition-colors duration-200 ${isWishlisted(product.id) ? 'fill-destructive text-destructive' : 'text-muted-foreground'}`} />
              </button>
              <div className="absolute top-4 left-4 flex gap-2">
                {product.tags.map(tag => (
                  <span key={tag} className="freshness-badge">{tag}</span>
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
                    className={`relative w-20 h-20 rounded-xl overflow-hidden transition-all duration-200 ${selectedImage === i ? 'ring-2 ring-primary ring-offset-2' : 'opacity-60 hover:opacity-100'
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
              <p className="text-sm text-secondary font-semibold uppercase tracking-wider mb-1">{product.nameLocal}</p>
              <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-2">{product.name}</h1>
              <div className="flex items-center gap-3">
                {product.rating > 0 && (
                  <div className="flex items-center gap-1.5">
                    <StarRating value={product.rating} readonly size="sm" />
                    <span className="text-sm font-medium text-muted-foreground">{product.rating}</span>
                    {reviews.length > 0 && (
                      <span className="text-sm text-muted-foreground font-body">({reviews.length} reviews)</span>
                    )}
                  </div>
                )}
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${product.inStock ? 'bg-tertiary-fixed text-tertiary-fixed-fg' : 'bg-destructive text-destructive-foreground'}`}>
                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
            </div>

            {/* Price Section */}
            <div className="tonal-card p-5 space-y-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setPriceType('wholesale')}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${priceType === 'wholesale' ? 'bg-secondary-container text-secondary-container-fg shadow-card' : 'bg-surface-container-low text-muted-foreground hover:bg-surface-container-high'}`}
                >
                  Wholesale
                </button>
                <button
                  onClick={() => setPriceType('retail')}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${priceType === 'retail' ? 'bg-secondary-container text-secondary-container-fg shadow-card' : 'bg-surface-container-low text-muted-foreground hover:bg-surface-container-high'}`}
                >
                  Retail
                </button>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-secondary">
                    ₹{priceType === 'wholesale' ? product.wholesalePrice.min : product.retailPrice.min}
                  </span>
                  <span className="text-lg text-muted-foreground">
                    – ₹{priceType === 'wholesale' ? product.wholesalePrice.max : product.retailPrice.max}
                  </span>
                  <span className="text-sm text-muted-foreground font-body">
                    / {priceType === 'wholesale' ? product.wholesalePrice.unit : product.retailPrice.unit}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 font-body">Prices vary based on season and availability</p>
              </div>
              <Button
                size="lg"
                className={`w-full gap-2 text-base rounded-full font-semibold transition-all duration-300 ${addedToCart ? 'bg-tertiary-fixed text-tertiary-fixed-fg' : 'btn-gradient'}`}
                onClick={handleAddToCart}
              >
                {addedToCart ? <><Check className="h-5 w-5" /> Added to Cart</> : <><ShoppingCart className="h-5 w-5" /> Add to Cart</>}
              </Button>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-lg font-display font-bold text-foreground mb-2">About this product</h2>
              <p className="text-muted-foreground leading-relaxed font-body">{product.description}</p>
            </div>

            {/* Seller Info */}
            <div className="tonal-card p-5">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Seller Information</h3>
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-2xl bg-surface-container-low flex items-center justify-center flex-shrink-0">
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
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5 font-body">
                    <MapPin className="h-3.5 w-3.5" />
                    {product.vendorLocation}
                  </div>
                  {product.sellerId !== 'static-seller' && (
                    <Link to={`/seller/${product.sellerId}`}>
                      <Button variant="ghost" size="sm" className="mt-3 rounded-xl hover:bg-surface-container-high font-body">View Seller Profile</Button>
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
                <div key={review.id} className="tonal-card p-5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-surface-container-high flex items-center justify-center">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <span className="font-medium text-foreground text-sm">{review.buyer_name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground font-body">
                      {new Date(review.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <StarRating value={review.rating} readonly size="sm" />
                  {review.comment && (
                    <p className="text-sm text-muted-foreground mt-2 font-body">{review.comment}</p>
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
