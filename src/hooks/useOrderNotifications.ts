import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  ready: 'Ready for Pickup',
  picked_up: 'Picked Up',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const useOrderNotifications = () => {
  const { user, profile } = useAuth();

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('order-status-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          const newRow = payload.new as any;
          const oldRow = payload.old as any;

          // Only notify if status actually changed
          if (newRow.status === oldRow.status) return;

          // Notify buyers about their orders, sellers about orders they fulfill
          const isBuyer = newRow.buyer_id === user.id;
          const isSeller = newRow.seller_id === user.id;

          if (!isBuyer && !isSeller) return;

          const label = statusLabels[newRow.status] || newRow.status;
          const orderId = (newRow.id as string).slice(0, 8);

          if (isBuyer) {
            toast.info(`Order #${orderId} is now "${label}"`, {
              description: 'Tap to view your orders',
              action: {
                label: 'View',
                onClick: () => window.location.assign('/orders'),
              },
            });
          } else if (isSeller && newRow.status === 'cancelled') {
            toast.warning(`Order #${orderId} was cancelled`, {
              action: {
                label: 'View',
                onClick: () => window.location.assign('/orders'),
              },
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
};
