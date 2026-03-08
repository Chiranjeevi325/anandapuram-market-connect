import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import StarRating from '@/components/StarRating';
import { toast } from 'sonner';
import { z } from 'zod';

const reviewSchema = z.object({
  rating: z.number().min(1, 'Please select a rating').max(5),
  comment: z.string().trim().max(500, 'Comment must be less than 500 characters').optional(),
});

interface ReviewFormProps {
  orderId: string;
  sellerId: string;
  onSubmitted: () => void;
  onCancel: () => void;
}

const ReviewForm = ({ orderId, sellerId, onSubmitted, onCancel }: ReviewFormProps) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user) return;

    const result = reviewSchema.safeParse({ rating, comment: comment || undefined });
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from('reviews' as any).insert({
      buyer_id: user.id,
      seller_id: sellerId,
      order_id: orderId,
      rating,
      comment: comment.trim() || null,
    } as any);

    setSubmitting(false);

    if (error) {
      if (error.code === '23505') {
        toast.error('You have already reviewed this order');
      } else {
        toast.error('Failed to submit review');
      }
    } else {
      toast.success('Review submitted!');
      onSubmitted();
    }
  };

  return (
    <div className="p-4 space-y-3 bg-muted/30 rounded-lg border">
      <p className="text-sm font-medium text-foreground">Rate this seller</p>
      <StarRating value={rating} onChange={setRating} />
      <Textarea
        placeholder="Share your experience (optional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={500}
        className="resize-none text-sm"
        rows={3}
      />
      <div className="flex gap-2 justify-end">
        <Button size="sm" variant="ghost" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button size="sm" onClick={handleSubmit} disabled={submitting || rating === 0}>
          {submitting ? 'Submitting...' : 'Submit Review'}
        </Button>
      </div>
    </div>
  );
};

export default ReviewForm;
