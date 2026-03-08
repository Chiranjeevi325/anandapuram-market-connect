import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, Star } from 'lucide-react';
import Navbar from '@/components/Navbar';
import PriceTicker from '@/components/PriceTicker';
import Footer from '@/components/Footer';
import { products, type Product } from '@/data/products';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const Products = () => {
  const [searchParams] = useSearchParams();
  const initialCat = searchParams.get('cat') as Product['category'] | null;

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>(initialCat || 'all');
  const [priceSort, setPriceSort] = useState<'asc' | 'desc' | ''>('');

  const filtered = useMemo(() => {
    let result = products;
    if (category !== 'all') result = result.filter(p => p.category === category);
    if (search) result = result.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.nameLocal.toLowerCase().includes(search.toLowerCase())
    );
    if (priceSort === 'asc') result = [...result].sort((a, b) => a.wholesalePrice.min - b.wholesalePrice.min);
    if (priceSort === 'desc') result = [...result].sort((a, b) => b.wholesalePrice.min - a.wholesalePrice.min);
    return result;
  }, [search, category, priceSort]);

  return (
    <div className="min-h-screen bg-background">
      <PriceTicker />
      <Navbar />

      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-2">
          Browse Products
        </h1>
        <p className="text-muted-foreground mb-8">Fresh flowers and produce from Anandapuram vendors</p>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search flowers, vegetables..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['all', 'flowers', 'vegetables'].map(cat => (
              <Button
                key={cat}
                variant={category === cat ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCategory(cat)}
                className="capitalize"
              >
                {cat === 'all' ? 'All' : cat}
              </Button>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPriceSort(prev => prev === 'asc' ? 'desc' : prev === 'desc' ? '' : 'asc')}
              className="gap-1"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Price {priceSort === 'asc' ? '↑' : priceSort === 'desc' ? '↓' : ''}
            </Button>
          </div>
        </div>

        {/* Product grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map(product => (
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
                  <div className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-secondary text-secondary" />
                    <span className="text-xs font-medium text-muted-foreground">{product.rating}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{product.nameLocal} • {product.vendor}, {product.vendorLocation}</p>
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
                <Button size="sm" className="w-full">Add to Cart</Button>
              </div>
            </div>
          ))}
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
