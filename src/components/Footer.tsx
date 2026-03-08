import { Flower2 } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-foreground py-12">
      <div className="container mx-auto px-4">
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
                <li>Flowers</li>
                <li>Vegetables</li>
                <li>Wholesale</li>
                <li>Pre-Orders</li>
              </ul>
            </div>
            <div>
              <h4 className="font-display font-semibold text-primary-foreground mb-3">Info</h4>
              <ul className="space-y-2 text-sm text-primary-foreground/50">
                <li>Market Timings</li>
                <li>Seller Registration</li>
                <li>Location</li>
                <li>Contact</li>
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
