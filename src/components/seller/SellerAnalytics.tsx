import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { IndianRupee, ShoppingCart, Package, Star, TrendingUp, Users } from 'lucide-react';

interface Props {
  userId: string;
  productCount: number;
}

interface OrderData {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
  buyer_id: string;
}

const COLORS = ['hsl(142, 54%, 30%)', 'hsl(40, 80%, 55%)', 'hsl(16, 80%, 55%)', 'hsl(38, 92%, 55%)'];

const SellerAnalytics = ({ userId, productCount }: Props) => {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [avgRating, setAvgRating] = useState<number>(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [{ data: ordersData }, { data: reviewsData }] = await Promise.all([
        supabase.from('orders').select('id, status, total_amount, created_at, buyer_id').eq('seller_id', userId),
        supabase.from('reviews').select('rating').eq('seller_id', userId),
      ]);
      setOrders(ordersData || []);
      const ratings = (reviewsData || []).map((r: { rating: number }) => r.rating);
      setReviewCount(ratings.length);
      setAvgRating(ratings.length ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length : 0);
      setLoading(false);
    };
    load();
  }, [userId]);

  if (loading) return <div className="text-center py-10 text-muted-foreground">Loading analytics...</div>;

  const totalRevenue = orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + o.total_amount, 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const uniqueBuyers = new Set(orders.map(o => o.buyer_id)).size;

  // Revenue by month (last 6 months)
  const monthlyRevenue: Record<string, number> = {};
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
    monthlyRevenue[key] = 0;
  }
  orders.filter(o => o.status === 'delivered').forEach(o => {
    const d = new Date(o.created_at);
    const key = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
    if (key in monthlyRevenue) monthlyRevenue[key] += o.total_amount;
  });
  const revenueChart = Object.entries(monthlyRevenue).map(([month, revenue]) => ({ month, revenue }));

  // Order status breakdown
  const statusCounts: Record<string, number> = {};
  orders.forEach(o => { statusCounts[o.status] = (statusCounts[o.status] || 0) + 1; });
  const statusChart = Object.entries(statusCounts).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));

  const statCards = [
    { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: IndianRupee, accent: 'text-primary' },
    { label: 'Total Orders', value: totalOrders, icon: ShoppingCart, accent: 'text-secondary' },
    { label: 'Active Products', value: productCount, icon: Package, accent: 'text-accent' },
    { label: 'Avg Rating', value: avgRating ? `${avgRating.toFixed(1)} ★` : 'N/A', icon: Star, accent: 'text-secondary' },
    { label: 'Pending Orders', value: pendingOrders, icon: TrendingUp, accent: 'text-destructive' },
    { label: 'Unique Buyers', value: uniqueBuyers, icon: Users, accent: 'text-primary' },
  ];

  return (
    <div className="space-y-8">
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map(s => (
          <Card key={s.label}>
            <CardContent className="p-4 flex flex-col items-center text-center">
              <s.icon className={`h-6 w-6 mb-2 ${s.accent}`} />
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Revenue chart */}
        <Card>
          <CardHeader><CardTitle className="text-base">Monthly Revenue</CardTitle></CardHeader>
          <CardContent>
            {totalRevenue === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-10">No delivered orders yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={revenueChart}>
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip formatter={(v: number) => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Order status pie */}
        <Card>
          <CardHeader><CardTitle className="text-base">Order Status</CardTitle></CardHeader>
          <CardContent>
            {totalOrders === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-10">No orders yet</p>
            ) : (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="60%" height={200}>
                  <PieChart>
                    <Pie data={statusChart} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40}>
                      {statusChart.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {statusChart.map((s, i) => (
                    <div key={s.name} className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-muted-foreground">{s.name}: {s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Reviews summary */}
      <Card>
        <CardContent className="p-6 flex items-center gap-4">
          <Star className="h-8 w-8 text-secondary" />
          <div>
            <p className="text-lg font-bold text-foreground">{reviewCount} Review{reviewCount !== 1 ? 's' : ''}</p>
            <p className="text-sm text-muted-foreground">
              {avgRating ? `Average rating: ${avgRating.toFixed(1)} out of 5 stars` : 'No reviews yet — deliver orders to start collecting feedback'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SellerAnalytics;
