import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, Flower2, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const { totalItems } = useCart();

  return (
    <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <Flower2 className="h-7 w-7 text-primary" />
            <div>
              <span className="font-display text-lg font-bold text-foreground leading-none block">Anandapuram</span>
              <span className="text-[10px] font-body text-muted-foreground uppercase tracking-widest">Market</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Home</Link>
            <Link to="/products" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Browse</Link>
            <Link to="/products?cat=flowers" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Flowers</Link>
            <Link to="/products?cat=vegetables" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Vegetables</Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Button>
            </Link>
            {user ? (
              <>
                <Link to="/orders"><Button variant="ghost" size="sm">Orders</Button></Link>
                {profile?.role === 'seller' && (
                  <Link to="/seller"><Button variant="outline" size="sm">Dashboard</Button></Link>
                )}
                <span className="text-sm text-muted-foreground">{profile?.full_name || user.email}</span>
                <Button variant="ghost" size="icon" onClick={signOut}><LogOut className="h-5 w-5" /></Button>
              </>
            ) : (
              <Link to="/auth">
                <Button variant="default" size="sm" className="gap-2"><User className="h-4 w-4" /> Sign In</Button>
              </Link>
            )}
          </div>

          <div className="flex md:hidden items-center gap-2">
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Button>
            </Link>
            <button onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link to="/" className="block py-2 text-sm font-medium" onClick={() => setIsOpen(false)}>Home</Link>
            <Link to="/products" className="block py-2 text-sm text-muted-foreground" onClick={() => setIsOpen(false)}>Browse All</Link>
            <Link to="/products?cat=flowers" className="block py-2 text-sm text-muted-foreground" onClick={() => setIsOpen(false)}>Flowers</Link>
            <Link to="/products?cat=vegetables" className="block py-2 text-sm text-muted-foreground" onClick={() => setIsOpen(false)}>Vegetables</Link>
            <div className="pt-2">
              {user ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{profile?.full_name || user.email}</p>
                  {profile?.role === 'seller' && (
                    <Link to="/seller" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full">Seller Dashboard</Button>
                    </Link>
                  )}
                  <Button variant="ghost" size="sm" className="w-full" onClick={() => { signOut(); setIsOpen(false); }}>Sign Out</Button>
                </div>
              ) : (
                <Link to="/auth" onClick={() => setIsOpen(false)}>
                  <Button variant="default" size="sm" className="gap-2 w-full"><User className="h-4 w-4" /> Sign In</Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
