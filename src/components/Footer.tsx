import { Link } from 'react-router-dom';
import { Flower2 } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const Footer = () => {
  const { ref, isVisible } = useScrollAnimation(0.1);

  return (
    <footer className="bg-foreground py-12">
      <div
        ref={ref}
        className={`container mx-auto px-4 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        <div className="flex flex-col md:flex-row items-start justify-between gap-8">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-3">
              <Flower2 className="h-6 w-6 text-secondary" />
              <span className="font-display text-lg font-bold text-primary-foreground">Anandapuram Market</span>
            </Link>
            <p className="text-sm text-primary-foreground/50 max-w-xs">
              Visakhapatnam's premier flower and produce marketplace — connecting local farmers with buyers since generations.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-12">
            <nav aria-label="Market categories">
              <h4 className="font-display font-semibold text-primary-foreground mb-3">Market</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/products?cat=flowers" className="text-primary-foreground/50 hover:text-primary-foreground/80 transition-colors duration-200">Flowers</Link></li>
                <li><Link to="/products?cat=vegetables" className="text-primary-foreground/50 hover:text-primary-foreground/80 transition-colors duration-200">Vegetables</Link></li>
                <li><Link to="/products" className="text-primary-foreground/50 hover:text-primary-foreground/80 transition-colors duration-200">Wholesale</Link></li>
                <li><Link to="/products" className="text-primary-foreground/50 hover:text-primary-foreground/80 transition-colors duration-200">Pre-Orders</Link></li>
              </ul>
            </nav>
            <nav aria-label="Information">
              <h4 className="font-display font-semibold text-primary-foreground mb-3">Info</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/#market-info" className="text-primary-foreground/50 hover:text-primary-foreground/80 transition-colors duration-200">Market Timings</Link></li>
                <li><Link to="/auth" className="text-primary-foreground/50 hover:text-primary-foreground/80 transition-colors duration-200">Seller Registration</Link></li>
                <li><a href="https://maps.google.com/?q=Anandapuram+Market+Visakhapatnam" target="_blank" rel="noopener noreferrer" className="text-primary-foreground/50 hover:text-primary-foreground/80 transition-colors duration-200">Location</a></li>
                <li><a href="tel:+91891XXXXXXX" className="text-primary-foreground/50 hover:text-primary-foreground/80 transition-colors duration-200">Contact</a></li>
              </ul>
            </nav>
          </div>
        </div>
        <div className="border-t border-primary-foreground/10 mt-10 pt-6 text-center text-xs text-primary-foreground/30">
          © {new Date().getFullYear()} Anandapuram Market, Visakhapatnam. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
