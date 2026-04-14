import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export function useWishlist() {
  const { user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setWishlistIds(new Set());
      return;
    }
    const { data } = await supabase
      .from('wishlist')
      .select('product_id')
      .eq('user_id', user.id);
    if (data) {
      setWishlistIds(new Set(data.map(w => w.product_id)));
    }
  }, [user]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const toggle = useCallback(async (productId: string) => {
    if (!user) {
      toast.error('Sign in to save favorites');
      return;
    }
    // Check if it's a valid UUID (database product) or static product
    const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productId);
    if (!isValidUUID) {
      toast.error('Cannot save this product to wishlist');
      return;
    }

    setLoading(true);
    const isWished = wishlistIds.has(productId);

    if (isWished) {
      setWishlistIds(prev => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);
      if (error) {
        setWishlistIds(prev => new Set(prev).add(productId));
        toast.error('Failed to remove from wishlist');
      } else {
        toast.success('Removed from wishlist');
      }
    } else {
      setWishlistIds(prev => new Set(prev).add(productId));
      const { error } = await supabase
        .from('wishlist')
        .insert({ user_id: user.id, product_id: productId });
      if (error) {
        setWishlistIds(prev => {
          const next = new Set(prev);
          next.delete(productId);
          return next;
        });
        toast.error('Failed to add to wishlist');
      } else {
        toast.success('Added to wishlist');
      }
    }
    setLoading(false);
  }, [user, wishlistIds]);

  const isWishlisted = useCallback((productId: string) => wishlistIds.has(productId), [wishlistIds]);

  return { wishlistIds, toggle, isWishlisted, loading, totalWishlist: wishlistIds.size };
}
