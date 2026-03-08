import { Link } from 'react-router-dom';
import { MapPin, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import heroImage from '@/assets/hero-market.jpg';

const HeroSection = () => {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img src={heroImage} alt="Anandapuram Flower Market" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/60 to-foreground/20" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-4 opacity-0 animate-fade-in-up">
            <MapPin className="h-4 w-4 text-secondary" />
            <span className="text-sm font-body text-secondary font-medium">
              AH45 Highway Junction, Visakhapatnam
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-primary-foreground leading-tight mb-6 opacity-0 animate-fade-in-up animation-delay-100">
            Fresh from the
            <span className="block text-secondary"> Anandapuram Market</span>
          </h1>

          <p className="text-lg text-primary-foreground/80 font-body mb-8 max-w-lg opacity-0 animate-fade-in-up animation-delay-200">
            Visakhapatnam's vibrant flower & produce market. Buy directly from local farmers — wholesale or retail, delivered fresh daily.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-10 opacity-0 animate-fade-in-up animation-delay-300">
            <Link to="/products">
              <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 gap-2 text-base font-semibold px-8">
                Browse Market
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/products">
              <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 text-base px-8">
                Pre-Order for 5 AM
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-6 opacity-0 animate-fade-in-up animation-delay-400">
            <div className="flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm rounded-lg px-4 py-2.5">
              <Clock className="h-4 w-4 text-secondary" />
              <div>
                <p className="text-xs text-primary-foreground/60">Market Opens</p>
                <p className="text-sm font-bold text-primary-foreground">4:00 AM Daily</p>
              </div>
            </div>
            <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-lg px-4 py-2.5">
              <p className="text-xs text-primary-foreground/60">Peak Hours</p>
              <p className="text-sm font-bold text-primary-foreground">4 AM – 9 AM</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
