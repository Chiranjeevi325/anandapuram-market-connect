import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { dailyPrices } from '@/data/products';

const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'stable' }) => {
  if (trend === 'up') return <TrendingUp className="h-3.5 w-3.5 text-primary" />;
  if (trend === 'down') return <TrendingDown className="h-3.5 w-3.5 text-accent" />;
  return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
};

const PriceTicker = () => {
  const items = [...dailyPrices, ...dailyPrices];

  return (
    <div className="bg-primary overflow-hidden py-2.5">
      <div className="flex animate-ticker whitespace-nowrap">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2 px-6">
            <span className="text-sm font-medium text-primary-foreground/70">{item.name}</span>
            <span className="text-sm font-bold text-secondary">{item.price}</span>
            <TrendIcon trend={item.trend} />
            <span className="text-primary-foreground/30">•</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PriceTicker;
