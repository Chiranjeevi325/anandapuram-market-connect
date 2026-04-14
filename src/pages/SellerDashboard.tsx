import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import PriceTicker from '@/components/PriceTicker';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, ShoppingCart, BarChart3, UserCog } from 'lucide-react';
import SellerProducts from '@/components/seller/SellerProducts';
import SellerOrders from '@/components/seller/SellerOrders';
import SellerAnalytics from '@/components/seller/SellerAnalytics';
import SellerProfileEdit from '@/components/seller/SellerProfileEdit';
import NotificationPreferences from '@/components/seller/NotificationPreferences';

interface Product {
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
  quantity_available: number;
  tags: string[];
  is_active: boolean;
  created_at: string;
}

const SellerDashboard = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setProducts((data as any) || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!authLoading && (!user || profile?.role !== 'seller')) {
      navigate('/auth');
    }
  }, [authLoading, user, profile, navigate]);

  useEffect(() => {
    if (user && profile?.role === 'seller') fetchProducts();
  }, [user, profile, fetchProducts]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-center">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-muted-foreground font-body">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <PriceTicker />
      <Navbar />

      <div className="container mx-auto px-4 py-10">
        <div className="mb-8">
          <p className="text-sm font-semibold text-secondary uppercase tracking-wider mb-2">Seller Portal</p>
          <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground font-body">{profile?.farm_name || 'My Shop'} • {profile?.village || ''}</p>
        </div>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="bg-surface-container-low rounded-2xl p-1.5">
            <TabsTrigger value="products" className="gap-2 rounded-xl data-[state=active]:bg-secondary-container data-[state=active]:text-secondary-container-fg"><Package className="h-4 w-4" /> Products</TabsTrigger>
            <TabsTrigger value="orders" className="gap-2 rounded-xl data-[state=active]:bg-secondary-container data-[state=active]:text-secondary-container-fg"><ShoppingCart className="h-4 w-4" /> Orders</TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2 rounded-xl data-[state=active]:bg-secondary-container data-[state=active]:text-secondary-container-fg"><BarChart3 className="h-4 w-4" /> Analytics</TabsTrigger>
            <TabsTrigger value="profile" className="gap-2 rounded-xl data-[state=active]:bg-secondary-container data-[state=active]:text-secondary-container-fg"><UserCog className="h-4 w-4" /> Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <SellerProducts products={products} userId={user!.id} onRefresh={fetchProducts} />
          </TabsContent>

          <TabsContent value="orders">
            <SellerOrders userId={user!.id} />
          </TabsContent>

          <TabsContent value="analytics">
            <SellerAnalytics userId={user!.id} productCount={products.filter(p => p.is_active).length} />
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            {profile && (
              <SellerProfileEdit
                userId={user!.id}
                initialProfile={{
                  full_name: profile.full_name,
                  phone: profile.phone || null,
                  farm_name: profile.farm_name || null,
                  village: profile.village || null,
                  primary_product: profile.primary_product || null,
                  avatar_url: profile.avatar_url || null,
                }}
                onUpdated={() => window.location.reload()}
              />
            )}
            <NotificationPreferences userId={user!.id} />
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default SellerDashboard;
