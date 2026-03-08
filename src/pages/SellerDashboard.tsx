import { useState, useEffect, useRef } from 'react';
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
import { Plus, Package, Trash2, Upload, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

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
  const [showForm, setShowForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile || !user) return null;
    const ext = imageFile.name.split('.').pop();
    const path = `${user.id}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from('product-images')
      .upload(path, imageFile, { contentType: imageFile.type });

    if (error) {
      toast.error('Image upload failed: ' + error.message);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(path);

    return publicUrl;
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    let imageUrl: string | null = null;
    if (imageFile) {
      imageUrl = await uploadImage();
    }

    const { error } = await supabase.from('products').insert({
      seller_id: user!.id,
      name,
      name_local: nameLocal || null,
      category,
      image_url: imageUrl,
      wholesale_price_min: Number(wpMin),
      wholesale_price_max: Number(wpMax),
      wholesale_unit: wUnit,
      retail_price_min: Number(rpMin),
      retail_price_max: Number(rpMax),
      retail_unit: rUnit,
      quantity_available: Number(qty),
      tags: ['Daily Fresh'],
    });

    setUploading(false);

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
    clearImage();
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
            {/* Image upload - full width */}
            <div className="sm:col-span-2">
              <Label>Product Photo</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              {imagePreview ? (
                <div className="relative mt-2 inline-block">
                  <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-xl border" />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 shadow-md hover:bg-destructive/90"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 flex items-center gap-3 px-5 py-4 border-2 border-dashed border-border rounded-xl text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
                >
                  <Upload className="h-5 w-5" />
                  <span className="text-sm font-medium">Upload photo (max 5MB)</span>
                </button>
              )}
            </div>

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
              <Button type="submit" disabled={uploading}>
                {uploading ? 'Uploading...' : 'Save Product'}
              </Button>
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
                <div className="flex gap-4 flex-1 min-w-0">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="min-w-0">
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
