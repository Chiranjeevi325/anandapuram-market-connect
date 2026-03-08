import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Flower2, Carrot } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { products as staticProducts } from '@/data/products';

interface Suggestion {
  id: string;
  name: string;
  nameLocal: string;
  category: string;
  image: string;
  price: number;
  unit: string;
}

interface SearchSuggestionsProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  /** Additional DB products to include in suggestions */
  extraProducts?: { id: string; name: string; nameLocal: string; category: string; image: string; wholesalePrice: { min: number; unit: string } }[];
  /** Navigate to product on click instead of just filtering */
  navigateOnSelect?: boolean;
}

const SearchSuggestions = ({
  value,
  onChange,
  placeholder = 'Search flowers, vegetables...',
  className = '',
  extraProducts = [],
  navigateOnSelect = false,
}: SearchSuggestionsProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const allSuggestions: Suggestion[] = useMemo(() => {
    const seen = new Set<string>();
    const result: Suggestion[] = [];

    // DB products first
    for (const p of extraProducts) {
      if (!seen.has(p.name.toLowerCase())) {
        seen.add(p.name.toLowerCase());
        result.push({
          id: p.id,
          name: p.name,
          nameLocal: p.nameLocal,
          category: p.category,
          image: p.image,
          price: p.wholesalePrice.min,
          unit: p.wholesalePrice.unit,
        });
      }
    }

    // Static products
    for (const p of staticProducts) {
      if (!seen.has(p.name.toLowerCase())) {
        seen.add(p.name.toLowerCase());
        result.push({
          id: p.id,
          name: p.name,
          nameLocal: p.nameLocal,
          category: p.category,
          image: p.image,
          price: p.wholesalePrice.min,
          unit: p.wholesalePrice.unit,
        });
      }
    }

    return result;
  }, [extraProducts]);

  const filtered = useMemo(() => {
    if (!value.trim()) return [];
    const q = value.toLowerCase();
    return allSuggestions
      .filter(
        s =>
          s.name.toLowerCase().includes(q) ||
          s.nameLocal.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [value, allSuggestions]);

  const showDropdown = isFocused && value.trim().length > 0;

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Reset active index when filtered changes
  useEffect(() => {
    setActiveIndex(-1);
  }, [filtered]);

  const handleSelect = (suggestion: Suggestion) => {
    if (navigateOnSelect) {
      navigate(`/product/${suggestion.id}`);
      onChange('');
    } else {
      onChange(suggestion.name);
    }
    setIsFocused(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || filtered.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev < filtered.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev > 0 ? prev - 1 : filtered.length - 1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(filtered[activeIndex]);
    } else if (e.key === 'Escape') {
      setIsFocused(false);
    }
  };

  const CategoryIcon = ({ cat }: { cat: string }) =>
    cat === 'flowers' ? (
      <Flower2 className="h-3.5 w-3.5 text-primary" />
    ) : (
      <Carrot className="h-3.5 w-3.5 text-accent-foreground" />
    );

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
      <Input
        ref={inputRef}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onKeyDown={handleKeyDown}
        className="pl-10"
        autoComplete="off"
        role="combobox"
        aria-expanded={showDropdown}
        aria-autocomplete="list"
      />

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-card border rounded-xl shadow-[var(--shadow-elevated)] overflow-hidden z-50 animate-in fade-in-0 zoom-in-95 duration-150">
          {filtered.length > 0 ? (
            <ul role="listbox" className="py-1">
              {filtered.map((s, i) => (
                <li
                  key={s.id}
                  role="option"
                  aria-selected={i === activeIndex}
                  onMouseDown={() => handleSelect(s)}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors duration-100
                    ${i === activeIndex ? 'bg-muted' : 'hover:bg-muted/50'}`}
                >
                  <img
                    src={s.image}
                    alt={s.name}
                    className="h-10 w-10 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-display font-semibold text-sm text-foreground truncate">
                        {s.name}
                      </span>
                      <CategoryIcon cat={s.category} />
                    </div>
                    <span className="text-xs text-muted-foreground truncate block">
                      {s.nameLocal} • ₹{s.price}/{s.unit}
                    </span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-muted-foreground">
                No products found for "<span className="font-medium text-foreground">{value}</span>"
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchSuggestions;
