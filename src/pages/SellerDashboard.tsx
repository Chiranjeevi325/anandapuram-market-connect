import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import PriceTicker from '@/components/PriceTicker';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Package, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  name_local: string | null;
  category: string;
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
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [nameLocal, setNameLocal] = useState('');
  const [category, setCategory] = useState('flowers');
  const [wpMin, setWpMin] = useState('');
  const [wpMax, setWpMax] = useState('');
  const [wUnit, setWUnit] = useState('per KG');
  const [rpMin, setRpMin] = useState('');
  const [rpMax, setRpMax] = useState('');
  const [rUnit, setRUnit] = useState('per piece');
  const [qty, setQty] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || profile?.role !== 'seller')) {
      navigate('/auth');
    }
  }, [authLoading, user, profile, navigate]);

  useEffect(() => {
    if (user) fetchProducts();
  }, [user]);

  const fetchProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('seller_id', user!.id)
      .order('created_at', { ascending: false });
    setProducts(data || []);
    setLoading(false);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('products').insert({
      seller_id: user!.id,
      name,
      name_local: nameLocal || null,
      category,
      wholesale_price_min: Number(wpMin),
      wholesale_price_max: Number(wpMax),
      wholesale_unit: wUnit,
      retail_price_min: Number(rpMin),
      retail_price_max: Number(rpMax),
      retail_unit: rUnit,
      quantity_available: Number(qty),
      tags: ['Daily Fresh'],
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Product added!');
      setShowForm(false);
      resetForm();
      fetchProducts();
    }
  };

  const resetForm = () => {
    setName(''); setNameLocal(''); setCategory('flowers');
    setWpMin(''); setWpMax(''); setRpMin(''); setRpMax(''); setQty('');
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('products').update({ is_active: !current }).eq('id', id);
    fetchProducts();
  };

  const deleteProduct = async (id: string) => {
    await supabase.from('products').delete().eq('id', id);
    toast.success('Product removed');
    fetchProducts();
  };

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <PriceTicker />
      <Navbar />

      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Seller Dashboard</h1>
            <p className="text-muted-foreground">{profile?.farm_name || 'My Shop'} • {profile?.village || ''}</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2">
            <Plus className="h-4 w-4" /> Add Product
          </Button>
        </div>

        {showForm && (
          <form onSubmit={handleAddProduct} className="bg-card rounded-xl p-6 shadow-[var(--shadow-card)] mb-8 grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Product Name</Label>
              <Input value={name} onChange={e => setName(e.target.value)} required placeholder="e.g., Marigold" />
            </div>
            <div>
              <Label>Local Name</Label>
              <Input value={nameLocal} onChange={e => setNameLocal(e.target.value)} placeholder="e.g., Banti Puvvu" />
            </div>
            <div>
              <Label>Category</Label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                <option value="flowers">Flowers</option>
                <option value="vegetables">Vegetables</option>
              </select>
            </div>
            <div>
              <Label>Quantity Available</Label>
              <Input type="number" value={qty} onChange={e => setQty(e.target.value)} required placeholder="e.g., 50" />
            </div>
            <div>
              <Label>Wholesale Min (₹)</Label>
              <Input type="number" value={wpMin} onChange={e => setWpMin(e.target.value)} required />
            </div>
            <div>
              <Label>Wholesale Max (₹)</Label>
              <Input type="number" value={wpMax} onChange={e => setWpMax(e.target.value)} required />
            </div>
            <div>
              <Label>Retail Min (₹)</Label>
              <Input type="number" value={rpMin} onChange={e => setRpMin(e.target.value)} required />
            </div>
            <div>
              <Label>Retail Max (₹)</Label>
              <Input type="number" value={rpMax} onChange={e => setRpMax(e.target.value)} required />
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <Button type="submit">Save Product</Button>
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>Cancel</Button>
            </div>
          </form>
        )}

        {products.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-xl shadow-[var(--shadow-card)]">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">No products listed yet</p>
            <p className="text-sm text-muted-foreground">Click "Add Product" to start selling</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {products.map(p => (
              <div key={p.id} className="bg-card rounded-xl p-5 shadow-[var(--shadow-card)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-display font-bold text-foreground">{p.name}</h3>
                    {p.name_local && <span className="text-xs text-muted-foreground">({p.name_local})</span>}
                    <Badge variant={p.is_active ? 'default' : 'secondary'} className="text-[10px]">
                      {p.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Wholesale: ₹{p.wholesale_price_min}–₹{p.wholesale_price_max} / {p.wholesale_unit} •
                    Retail: ₹{p.retail_price_min}–₹{p.retail_price_max} / {p.retail_unit} •
                    Stock: {p.quantity_available}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => toggleActive(p.id, p.is_active)}>
                    {p.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteProduct(p.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default SellerDashboard;
