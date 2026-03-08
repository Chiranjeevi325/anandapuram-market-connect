import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const categories = [
  {
    title: 'Flowers',
    titleLocal: 'Puvvulu',
    description: 'Marigold, Jasmine, Rose, Lily & more — fresh garlands and loose flowers.',
    image: 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=600&h=400&fit=crop',
    link: '/products?cat=flowers',
    count: 5,
  },
  {
    title: 'Vegetables',
    titleLocal: 'Kooragayalu',
    description: 'Farm-fresh tomatoes, brinjal, chillies and seasonal produce.',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&h=400&fit=crop',
    link: '/products?cat=vegetables',
    count: 3,
  },
];

const CategoryShowcase = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-3">
            Shop by Category
          </h2>
          <p className="text-muted-foreground font-body max-w-md mx-auto">
            Browse wholesale and retail products from trusted local vendors
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {categories.map((cat) => (
            <Link
              key={cat.title}
              to={cat.link}
              className="group relative overflow-hidden rounded-2xl aspect-[4/3] shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] transition-all duration-300"
            >
              <img src={cat.image} alt={cat.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <span className="text-xs text-secondary font-medium uppercase tracking-wider">{cat.titleLocal}</span>
                <h3 className="text-2xl font-display font-bold text-primary-foreground mb-1">{cat.title}</h3>
                <p className="text-sm text-primary-foreground/70 mb-3">{cat.description}</p>
                <div className="flex items-center gap-2 text-secondary text-sm font-semibold group-hover:gap-3 transition-all">
                  Browse {cat.count} items <ArrowRight className="h-4 w-4" />
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
