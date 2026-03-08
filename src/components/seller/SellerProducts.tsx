import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Upload, X, Image as ImageIcon, Edit2, AlertTriangle, Settings2, ListChecks, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';

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

interface Props {
  products: Product[];
  userId: string;
  onRefresh: () => void;
}

const SellerProducts = ({ products, userId, onRefresh }: Props) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkUpdates, setBulkUpdates] = useState<Record<string, string>>({});
  const [savingBulk, setSavingBulk] = useState(false);
  const [lowStockThreshold, setLowStockThreshold] = useState(() => {
    const saved = localStorage.getItem('lowStockThreshold');
    return saved ? Number(saved) : 10;
  });
  const [showThresholdSetting, setShowThresholdSetting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const lowStockProducts = products.filter(p => p.is_active && p.quantity_available <= lowStockThreshold);

  const startBulkMode = () => {
    const initial: Record<string, string> = {};
    products.forEach(p => { initial[p.id] = String(p.quantity_available); });
    setBulkUpdates(initial);
    setBulkMode(true);
  };

  const cancelBulkMode = () => {
    setBulkMode(false);
    setBulkUpdates({});
  };

  const saveBulkUpdates = async () => {
    setSavingBulk(true);
    const updates = Object.entries(bulkUpdates).filter(
      ([id, val]) => {
        const product = products.find(p => p.id === id);
        return product && Number(val) !== product.quantity_available;
      }
    );
    if (updates.length === 0) { toast.info('No changes to save'); setSavingBulk(false); return; }
    let failed = 0;
    for (const [id, val] of updates) {
      const { error } = await supabase.from('products').update({ quantity_available: Number(val) }).eq('id', id);
      if (error) failed++;
    }
    setSavingBulk(false);
    setBulkMode(false);
    setBulkUpdates({});
    if (failed) toast.error(`${failed} update(s) failed`);
    else toast.success(`${updates.length} product(s) updated`);
    onRefresh();
  };

  const updateThreshold = (val: number) => {
    setLowStockThreshold(val);
    localStorage.setItem('lowStockThreshold', String(val));
  };

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const resetForm = () => {
    setName(''); setNameLocal(''); setCategory('flowers');
    setWpMin(''); setWpMax(''); setRpMin(''); setRpMax(''); setQty('');
    clearImage();
    setEditingId(null);
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;
    const ext = imageFile.name.split('.').pop();
    const path = `${userId}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('product-images').upload(path, imageFile, { contentType: imageFile.type });
    if (error) { toast.error('Image upload failed: ' + error.message); return null; }
    const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(path);
    return publicUrl;
  };

  const startEdit = (p: Product) => {
    setEditingId(p.id);
    setName(p.name);
    setNameLocal(p.name_local || '');
    setCategory(p.category);
    setWpMin(String(p.wholesale_price_min));
    setWpMax(String(p.wholesale_price_max));
    setWUnit(p.wholesale_unit);
    setRpMin(String(p.retail_price_min));
    setRpMax(String(p.retail_price_max));
    setRUnit(p.retail_unit);
    setQty(String(p.quantity_available));
    if (p.image_url) setImagePreview(p.image_url);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    let imageUrl: string | null = null;
    if (imageFile) imageUrl = await uploadImage();

    const payload = {
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
      ...(imageUrl && { image_url: imageUrl }),
    };

    let error;
    if (editingId) {
      ({ error } = await supabase.from('products').update(payload).eq('id', editingId));
    } else {
      ({ error } = await supabase.from('products').insert({ ...payload, seller_id: userId, tags: ['Daily Fresh'] }));
    }

    setUploading(false);
    if (error) { toast.error(error.message); return; }

    toast.success(editingId ? 'Product updated!' : 'Product added!');
    setShowForm(false);
    resetForm();
    onRefresh();
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('products').update({ is_active: !current }).eq('id', id);
    onRefresh();
  };

  const deleteProduct = async (id: string) => {
    await supabase.from('products').delete().eq('id', id);
    toast.success('Product removed');
    onRefresh();
  };

  return (
    <div>
      {/* Low-stock alert banner */}
      {lowStockProducts.length > 0 && (
        <Card className="mb-6 border-destructive/30 bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-foreground text-sm">Low Stock Alert</h3>
                <p className="text-xs text-muted-foreground mb-2">
                  {lowStockProducts.length} product{lowStockProducts.length > 1 ? 's' : ''} below {lowStockThreshold} units
                </p>
                <div className="flex flex-wrap gap-2">
                  {lowStockProducts.map(p => (
                    <Badge key={p.id} variant="destructive" className="text-[11px] gap-1">
                      {p.name}: {p.quantity_available} left
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-display font-bold text-foreground">Products</h2>
          <p className="text-sm text-muted-foreground">{products.length} listed</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => setShowThresholdSetting(!showThresholdSetting)} className="gap-1.5">
            <Settings2 className="h-4 w-4" /> Stock Alert: {lowStockThreshold}
          </Button>
          {products.length > 0 && !bulkMode && (
            <Button variant="outline" size="sm" onClick={startBulkMode} className="gap-1.5">
              <ListChecks className="h-4 w-4" /> Bulk Update Stock
            </Button>
          )}
          {bulkMode && (
            <>
              <Button size="sm" onClick={saveBulkUpdates} disabled={savingBulk} className="gap-1.5">
                <Save className="h-4 w-4" /> {savingBulk ? 'Saving...' : 'Save All'}
              </Button>
              <Button variant="outline" size="sm" onClick={cancelBulkMode}>Cancel</Button>
            </>
          )}
          <Button onClick={() => { resetForm(); setShowForm(!showForm); }} className="gap-2">
            <Plus className="h-4 w-4" /> Add Product
          </Button>
        </div>
      </div>

      {showThresholdSetting && (
        <div className="bg-card rounded-xl p-4 shadow-[var(--shadow-card)] mb-6 flex items-center gap-4">
          <Label className="text-sm whitespace-nowrap">Low stock threshold:</Label>
          <Input
            type="number"
            min={1}
            value={lowStockThreshold}
            onChange={e => updateThreshold(Math.max(1, Number(e.target.value)))}
            className="w-24"
          />
          <span className="text-sm text-muted-foreground">units</span>
          <Button variant="ghost" size="sm" onClick={() => setShowThresholdSetting(false)}>Done</Button>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card rounded-xl p-6 shadow-[var(--shadow-card)] mb-8 grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Label>Product Photo</Label>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
            {imagePreview ? (
              <div className="relative mt-2 inline-block">
                <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-xl border" />
                <button type="button" onClick={clearImage} className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 shadow-md hover:bg-destructive/90">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-2 flex items-center gap-3 px-5 py-4 border-2 border-dashed border-border rounded-xl text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors">
                <Upload className="h-5 w-5" />
                <span className="text-sm font-medium">Upload photo (max 5MB)</span>
              </button>
            )}
          </div>
          <div><Label>Product Name</Label><Input value={name} onChange={e => setName(e.target.value)} required placeholder="e.g., Marigold" /></div>
          <div><Label>Local Name</Label><Input value={nameLocal} onChange={e => setNameLocal(e.target.value)} placeholder="e.g., Banti Puvvu" /></div>
          <div>
            <Label>Category</Label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value="flowers">Flowers</option>
              <option value="vegetables">Vegetables</option>
            </select>
          </div>
          <div><Label>Quantity Available</Label><Input type="number" value={qty} onChange={e => setQty(e.target.value)} required placeholder="e.g., 50" /></div>
          <div><Label>Wholesale Min (₹)</Label><Input type="number" value={wpMin} onChange={e => setWpMin(e.target.value)} required /></div>
          <div><Label>Wholesale Max (₹)</Label><Input type="number" value={wpMax} onChange={e => setWpMax(e.target.value)} required /></div>
          <div><Label>Retail Min (₹)</Label><Input type="number" value={rpMin} onChange={e => setRpMin(e.target.value)} required /></div>
          <div><Label>Retail Max (₹)</Label><Input type="number" value={rpMax} onChange={e => setRpMax(e.target.value)} required /></div>
          <div className="sm:col-span-2 flex gap-3">
            <Button type="submit" disabled={uploading}>{uploading ? 'Saving...' : editingId ? 'Update Product' : 'Save Product'}</Button>
            <Button type="button" variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>Cancel</Button>
          </div>
        </form>
      )}

      {products.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-xl shadow-[var(--shadow-card)]">
          <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
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
                    W: ₹{p.wholesale_price_min}–₹{p.wholesale_price_max}/{p.wholesale_unit} •
                    R: ₹{p.retail_price_min}–₹{p.retail_price_max}/{p.retail_unit} •
                    {bulkMode ? (
                      <span className="inline-flex items-center gap-1.5 ml-1">
                        Stock: <Input
                          type="number"
                          min={0}
                          value={bulkUpdates[p.id] ?? String(p.quantity_available)}
                          onChange={e => setBulkUpdates(prev => ({ ...prev, [p.id]: e.target.value }))}
                          className="w-20 h-7 text-xs inline-block"
                        />
                      </span>
                    ) : (
                      <>
                        Stock: <span className={p.is_active && p.quantity_available <= lowStockThreshold ? 'text-destructive font-semibold' : ''}>
                          {p.quantity_available}{p.is_active && p.quantity_available <= lowStockThreshold ? ' ⚠' : ''}
                        </span>
                      </>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => startEdit(p)}>
                  <Edit2 className="h-4 w-4 mr-1" /> Edit
                </Button>
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
  );
};

export default SellerProducts;
