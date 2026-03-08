import { Clock, MapPin, Truck, Phone } from 'lucide-react';
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

  return (
    <section className="py-16 bg-leaf-light">
      <div className="container mx-auto px-4">
        <h2
          ref={titleRef}
          className={`text-3xl font-display font-bold text-center text-foreground mb-10 transition-all duration-700 ${titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          Market Information
        </h2>
        <div ref={gridRef} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {infoItems.map((item, i) => (
            <div
              key={item.title}
              className={`bg-card rounded-xl p-6 shadow-[var(--shadow-card)] text-center hover:shadow-[var(--shadow-elevated)] hover:-translate-y-1 transition-all duration-500 group ${gridVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}
              style={{ transitionDelay: gridVisible ? `${i * 100}ms` : '0ms' }}
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                <item.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display font-bold text-foreground mb-1">{item.title}</h3>
              <p className="text-lg font-semibold text-primary">{item.detail}</p>
              <p className="text-sm text-muted-foreground mt-1">{item.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MarketInfoSection;
