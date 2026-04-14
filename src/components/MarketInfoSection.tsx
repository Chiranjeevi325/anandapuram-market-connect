import { Clock, MapPin, Truck, Phone, Leaf } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const infoItems = [
  { icon: Clock, title: 'Market Timing', detail: '4:00 AM – 12:00 PM', sub: 'Peak hours: 4 AM – 9 AM' },
  { icon: MapPin, title: 'Location', detail: 'AH45 Highway Junction', sub: 'Anandapuram, Visakhapatnam' },
  { icon: Truck, title: 'Pre-Order & Pickup', detail: 'Order by 10 PM', sub: 'Ready for 5:00 AM pickup' },
  { icon: Phone, title: 'Helpline', detail: '+91 891 XXX XXXX', sub: 'Available 3 AM – 1 PM' },
];

const MarketInfoSection = () => {
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation();
  const { ref: gridRef, isVisible: gridVisible } = useScrollAnimation(0.1);
  const { ref: philoRef, isVisible: philoVisible } = useScrollAnimation(0.1);

  return (
    <section className="section-gap bg-surface-container-low">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div
          ref={titleRef}
          className={`text-center mb-14 transition-all duration-700 ${titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <p className="text-sm font-semibold text-secondary uppercase tracking-wider mb-2">Essential Details</p>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground">
            Market Information
          </h2>
        </div>

        {/* Info cards — tonal layering */}
        <div ref={gridRef} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {infoItems.map((item, i) => (
            <div
              key={item.title}
              className={`tonal-card p-6 text-center transition-all duration-500 group cursor-default ${gridVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}
              style={{ transitionDelay: gridVisible ? `${i * 100}ms` : '0ms' }}
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-surface-container-low mb-5 group-hover:bg-surface-container-high group-hover:scale-110 transition-all duration-300">
                <item.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display font-bold text-foreground mb-1 text-base">{item.title}</h3>
              <p className="text-lg font-bold text-secondary">{item.detail}</p>
              <p className="text-sm text-muted-foreground mt-1 font-body">{item.sub}</p>
            </div>
          ))}
        </div>

        {/* Farming Philosophy — editorial block */}
        <div
          ref={philoRef}
          className={`max-w-3xl mx-auto text-center transition-all duration-700 ${philoVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px flex-1 bg-outline-variant/20" />
            <Leaf className="h-5 w-5 text-primary" />
            <div className="h-px flex-1 bg-outline-variant/20" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-4">Our Farming Philosophy</h3>
          <p className="text-muted-foreground text-lg leading-relaxed font-body mb-6">
            We believe in the quiet revolution of the soil. No synthetic pesticides, no rigid industrial rows.
            Just a dance between the farmer and the seasons at Anandapuram Market.
          </p>
          <div className="inline-flex items-center gap-2 bg-surface-container-highest rounded-2xl px-6 py-3">
            <Truck className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Eco-Friendly Delivery</span>
            <span className="text-xs text-muted-foreground">• Zero-plastic packaging</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MarketInfoSection;
