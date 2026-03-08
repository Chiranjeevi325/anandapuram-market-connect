import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, Flower2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <Flower2 className="h-7 w-7 text-primary" />
            <div>
              <span className="font-display text-lg font-bold text-foreground leading-none block">
                Anandapuram
              </span>
              <span className="text-[10px] font-body text-muted-foreground uppercase tracking-widest">
                Market
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Home</Link>
            <Link to="/products" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Browse</Link>
            <Link to="/products?cat=flowers" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Flowers</Link>
            <Link to="/products?cat=vegetables" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Vegetables</Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5" />
            </Button>
            <Button variant="default" size="sm" className="gap-2">
              <User className="h-4 w-4" />
              Sign In
            </Button>
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link to="/" className="block py-2 text-sm font-medium" onClick={() => setIsOpen(false)}>Home</Link>
            <Link to="/products" className="block py-2 text-sm text-muted-foreground" onClick={() => setIsOpen(false)}>Browse All</Link>
            <Link to="/products?cat=flowers" className="block py-2 text-sm text-muted-foreground" onClick={() => setIsOpen(false)}>Flowers</Link>
            <Link to="/products?cat=vegetables" className="block py-2 text-sm text-muted-foreground" onClick={() => setIsOpen(false)}>Vegetables</Link>
            <div className="pt-2 flex gap-2">
              <Button variant="default" size="sm" className="gap-2 w-full">
                <User className="h-4 w-4" /> Sign In
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
