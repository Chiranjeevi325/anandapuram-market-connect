import { Link } from 'react-router-dom';
import { Flower2, Leaf, ArrowRight } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const Footer = () => {
  const { ref, isVisible } = useScrollAnimation(0.1);

  return (
    <footer className="bg-[#0F2113] py-16">
      <div
        ref={ref}
        className={`container mx-auto px-4 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        {/* Newsletter section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16 pb-12 border-b border-white/10">
          <div className="max-w-sm">
            <div className="flex items-center gap-2 mb-3">
              <Leaf className="h-5 w-5 text-secondary-container" />
              <p className="text-sm text-secondary-container font-semibold uppercase tracking-wider">Journal</p>
            </div>
            <h3 className="text-2xl font-display font-bold text-white mb-2">Join Our Farm Journal</h3>
            <p className="text-white/50 text-sm font-body">Seasonal tips, exclusive farm releases, and market updates delivered weekly.</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="bg-white/8 border border-white/10 rounded-full px-5 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-secondary-container/50 flex-1 md:w-72 font-body"
            />
            <button className="btn-gradient rounded-full px-6 py-3 text-sm font-semibold text-white flex items-center gap-2 hover:opacity-90 transition-opacity">
              Subscribe <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Main footer */}
        <div className="flex flex-col md:flex-row items-start justify-between gap-10">
          <div className="max-w-xs">
            <Link to="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                <Flower2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <span className="font-display text-lg font-bold text-white block leading-none">Anandapuram</span>
                <span className="text-[10px] text-white/40 uppercase tracking-[0.2em]">Market</span>
              </div>
            </Link>
            <p className="text-sm text-white/40 font-body leading-relaxed">
              Connecting people with the artisan growers who feed the soul as much as the body. Visakhapatnam's premier flower and produce marketplace.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-16">
            <nav aria-label="Market categories">
              <h4 className="font-display font-semibold text-white mb-4 text-sm uppercase tracking-wider">Market</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/products?cat=flowers" className="text-white/40 hover:text-secondary-container transition-colors duration-200 font-body">Flowers</Link></li>
                <li><Link to="/products?cat=vegetables" className="text-white/40 hover:text-secondary-container transition-colors duration-200 font-body">Vegetables</Link></li>
                <li><Link to="/products" className="text-white/40 hover:text-secondary-container transition-colors duration-200 font-body">Wholesale</Link></li>
                <li><Link to="/products" className="text-white/40 hover:text-secondary-container transition-colors duration-200 font-body">Pre-Orders</Link></li>
              </ul>
            </nav>
            <nav aria-label="Information">
              <h4 className="font-display font-semibold text-white mb-4 text-sm uppercase tracking-wider">Info</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/#market-info" className="text-white/40 hover:text-secondary-container transition-colors duration-200 font-body">Market Timings</Link></li>
                <li><Link to="/auth" className="text-white/40 hover:text-secondary-container transition-colors duration-200 font-body">Seller Registration</Link></li>
                <li><a href="https://maps.google.com/?q=Anandapuram+Market+Visakhapatnam" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-secondary-container transition-colors duration-200 font-body">Location</a></li>
                <li><a href="tel:+91891XXXXXXX" className="text-white/40 hover:text-secondary-container transition-colors duration-200 font-body">Contact</a></li>
              </ul>
            </nav>
          </div>
        </div>

        <div className="border-t border-white/8 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/25 font-body">
            © {new Date().getFullYear()} Anandapuram Market, Visakhapatnam. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs text-white/25 hover:text-white/50 transition-colors font-body">Privacy</a>
            <a href="#" className="text-xs text-white/25 hover:text-white/50 transition-colors font-body">Terms</a>
            <a href="#" className="text-xs text-white/25 hover:text-white/50 transition-colors font-body">Sustainability</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
