import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const categories = [
  {
    title: 'Flowers',
    titleLocal: 'Puvvulu',
    subtitle: 'The Atelier',
    description: 'Marigold, Jasmine, Rose, Lily & more — fresh garlands and loose flowers.',
    image: 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=600&h=400&fit=crop',
    link: '/products?cat=flowers',
    count: 5,
  },
  {
    title: 'Vegetables',
    titleLocal: 'Kooragayalu',
    subtitle: 'The Harvest',
    description: 'Farm-fresh tomatoes, brinjal, chillies and seasonal produce.',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&h=400&fit=crop',
    link: '/products?cat=vegetables',
    count: 3,
  },
];

const CategoryShowcase = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();
  const { ref: gridRef, isVisible: gridVisible } = useScrollAnimation(0.1);

  return (
    <section className="section-gap bg-surface">
      <div className="container mx-auto px-4">
        <div
          ref={headerRef}
          className={`text-center mb-14 transition-all duration-700 ${headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <p className="text-sm font-semibold text-secondary uppercase tracking-wider mb-2">Curated Selections</p>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-3">
            Shop by Category
          </h2>
          <p className="text-muted-foreground font-body max-w-md mx-auto">
            Browse wholesale and retail products from trusted local vendors
          </p>
        </div>

        <div ref={gridRef} className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {categories.map((cat, i) => (
            <Link
              key={cat.title}
              to={cat.link}
              className={`group relative overflow-hidden rounded-3xl aspect-[4/3] shadow-card hover:shadow-elevated transition-all duration-500 ${gridVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
              style={{ transitionDelay: gridVisible ? `${i * 150}ms` : '0ms' }}
            >
              <img src={cat.image} alt={cat.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }} />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F2113]/85 via-[#0F2113]/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <span className="text-xs text-secondary-container font-medium uppercase tracking-wider">{cat.titleLocal}</span>
                <p className="text-xs text-secondary-container font-semibold uppercase tracking-[0.2em] mb-1">{cat.subtitle}</p>
                <h3 className="text-3xl font-display font-bold text-white mb-1.5">{cat.title}</h3>
                <p className="text-sm text-white/65 mb-4 font-body">{cat.description}</p>
                <div className="flex items-center gap-2 text-secondary-container text-sm font-semibold group-hover:gap-3 transition-all duration-300">
                  Browse {cat.count} items <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryShowcase;
