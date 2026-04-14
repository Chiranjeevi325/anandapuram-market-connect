import { Link } from 'react-router-dom';
import { MapPin, Clock, ArrowRight, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import heroImage from '@/assets/hero-market.jpg';

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background image with editorial bleed */}
      <div className="absolute inset-0">
        <img src={heroImage} alt="Anandapuram Flower Market" className="w-full h-full object-cover scale-105" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F2113]/90 via-[#0F2113]/65 to-[#0F2113]/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F2113]/40 via-transparent to-transparent" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl">
          {/* Freshness badge */}
          <div className="flex items-center gap-2 mb-6 opacity-0 animate-fade-in-up">
            <div className="freshness-badge flex items-center gap-1.5">
              <Leaf className="h-3.5 w-3.5" />
              <span>Farm Fresh Daily</span>
            </div>
          </div>

          {/* Editorial headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-[4rem] font-display font-bold text-white leading-[1.1] mb-6 opacity-0 animate-fade-in-up animation-delay-100">
            Beyond the market stall lies an
            <span className="block text-secondary-container mt-1">atelier of earth.</span>
          </h1>

          <p className="text-lg text-white/70 font-body leading-relaxed mb-10 max-w-lg opacity-0 animate-fade-in-up animation-delay-200">
            Visakhapatnam's vibrant flower & produce market. Buy directly from local farmers — wholesale or retail, delivered fresh daily.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12 opacity-0 animate-fade-in-up animation-delay-300">
            <Link to="/products">
              <Button size="lg" className="btn-gradient gap-2.5 text-base font-semibold px-8 rounded-full shadow-elevated hover:shadow-card transition-shadow duration-300">
                Browse Market
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/products">
              <Button size="lg" className="btn-gold text-base px-8 font-semibold rounded-full shadow-elevated hover:shadow-card transition-shadow duration-300">
                Pre-Order for 5 AM
              </Button>
            </Link>
          </div>

          {/* Info cards with glassmorphism */}
          <div className="flex items-center gap-4 opacity-0 animate-fade-in-up animation-delay-400">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xl rounded-2xl px-5 py-3.5 ghost-border">
              <div className="h-10 w-10 rounded-xl bg-secondary-container/20 flex items-center justify-center">
                <Clock className="h-5 w-5 text-secondary-container" />
              </div>
              <div>
                <p className="text-[11px] text-white/50 uppercase tracking-wider font-semibold">Market Opens</p>
                <p className="text-sm font-bold text-white">4:00 AM Daily</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xl rounded-2xl px-5 py-3.5 ghost-border">
              <div className="h-10 w-10 rounded-xl bg-secondary-container/20 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-secondary-container" />
              </div>
              <div>
                <p className="text-[11px] text-white/50 uppercase tracking-wider font-semibold">Location</p>
                <p className="text-sm font-bold text-white">AH45. Visakhapatnam</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
