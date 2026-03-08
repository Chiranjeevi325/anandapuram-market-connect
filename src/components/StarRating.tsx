import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md';
}

const StarRating = ({ value, onChange, readonly = false, size = 'md' }: StarRatingProps) => {
  const [hover, setHover] = useState(0);
  const sizeClass = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          className={cn('transition-colors', readonly ? 'cursor-default' : 'cursor-pointer')}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
        >
          <Star
            className={cn(
              sizeClass,
              'transition-colors',
              (hover || value) >= star
                ? 'fill-marigold text-marigold'
                : 'text-muted-foreground/30'
            )}
          />
        </button>
      ))}
    </div>
  );
};

export default StarRating;
