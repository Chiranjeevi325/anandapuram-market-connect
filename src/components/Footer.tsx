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
            <div className="flex items-center gap-2 mb-3">
              <Flower2 className="h-6 w-6 text-secondary" />
              <span className="font-display text-lg font-bold text-primary-foreground">Anandapuram Market</span>
            </div>
            <p className="text-sm text-primary-foreground/50 max-w-xs">
              Visakhapatnam's premier flower and produce marketplace — connecting local farmers with buyers since generations.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-12">
            <div>
              <h4 className="font-display font-semibold text-primary-foreground mb-3">Market</h4>
              <ul className="space-y-2 text-sm text-primary-foreground/50">
                <li className="hover:text-primary-foreground/80 transition-colors duration-200 cursor-pointer">Flowers</li>
                <li className="hover:text-primary-foreground/80 transition-colors duration-200 cursor-pointer">Vegetables</li>
                <li className="hover:text-primary-foreground/80 transition-colors duration-200 cursor-pointer">Wholesale</li>
                <li className="hover:text-primary-foreground/80 transition-colors duration-200 cursor-pointer">Pre-Orders</li>
              </ul>
            </div>
            <div>
              <h4 className="font-display font-semibold text-primary-foreground mb-3">Info</h4>
              <ul className="space-y-2 text-sm text-primary-foreground/50">
                <li className="hover:text-primary-foreground/80 transition-colors duration-200 cursor-pointer">Market Timings</li>
                <li className="hover:text-primary-foreground/80 transition-colors duration-200 cursor-pointer">Seller Registration</li>
                <li className="hover:text-primary-foreground/80 transition-colors duration-200 cursor-pointer">Location</li>
                <li className="hover:text-primary-foreground/80 transition-colors duration-200 cursor-pointer">Contact</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-primary-foreground/10 mt-10 pt-6 text-center text-xs text-primary-foreground/30">
          © 2026 Anandapuram Market, Visakhapatnam. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
