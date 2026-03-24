import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, Flower2, LogOut, Heart } from 'lucide-react';
import NotificationBell from '@/components/NotificationBell';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/hooks/useWishlist';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const { totalItems } = useCart();
  const { totalWishlist } = useWishlist();

  return (
    <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <Flower2 className="h-7 w-7 text-primary group-hover:rotate-12 transition-transform duration-300" />
            <div>
              <span className="font-display text-lg font-bold text-foreground leading-none block">Anandapuram</span>
              <span className="text-[10px] font-body text-muted-foreground uppercase tracking-widest">Market</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {[
              { to: '/', label: 'Home' },
              { to: '/products', label: 'Browse' },
              { to: '/products?cat=flowers', label: 'Flowers' },
              { to: '/products?cat=vegetables', label: 'Vegetables' },
            ].map(link => (
              <Link
                key={link.label}
                to={link.to}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-left"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/wishlist">
              <Button variant="ghost" size="icon" className="relative hover:scale-105 transition-transform duration-200">
                <Heart className="h-5 w-5" />
                {totalWishlist > 0 && (
                  <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center animate-[scale-in_0.3s_ease-out]">
                    {totalWishlist}
                  </span>
                )}
              </Button>
            </Link>
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative hover:scale-105 transition-transform duration-200">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center animate-[scale-in_0.3s_ease-out]">
                    {totalItems}
                  </span>
                )}
              </Button>
            </Link>
            {user ? (
              <>
                <NotificationBell />
                <Link to="/orders"><Button variant="ghost" size="sm">Orders</Button></Link>
                {profile?.role === 'seller' && (
                  <Link to="/seller"><Button variant="outline" size="sm">Dashboard</Button></Link>
                )}
                {profile?.role === 'admin' && (
                  <Link to="/admin"><Button variant="outline" size="sm" className="gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10">🛡️ Admin</Button></Link>
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

          <div className="flex md:hidden items-center gap-1">
            {user && <NotificationBell />}
            <Link to="/wishlist">
              <Button variant="ghost" size="icon" className="relative">
                <Heart className="h-5 w-5" />
                {totalWishlist > 0 && (
                  <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center">
                    {totalWishlist}
                  </span>
                )}
              </Button>
            </Link>
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
            <button onClick={() => setIsOpen(!isOpen)} className="p-1">
              <div className={`transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`}>
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </div>
            </button>
          </div>
        </div>

        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100 pb-4' : 'max-h-0 opacity-0'}`}>
          <div className="space-y-2">
            <Link to="/" className="block py-2 text-sm font-medium hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>Home</Link>
            <Link to="/products" className="block py-2 text-sm text-muted-foreground hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>Browse All</Link>
            <Link to="/products?cat=flowers" className="block py-2 text-sm text-muted-foreground hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>Flowers</Link>
            <Link to="/products?cat=vegetables" className="block py-2 text-sm text-muted-foreground hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>Vegetables</Link>
            <div className="pt-2">
              {user ? (
                <div className="space-y-2">
                  <Link to="/orders" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" size="sm" className="w-full justify-start">My Orders</Button>
                  </Link>
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
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
