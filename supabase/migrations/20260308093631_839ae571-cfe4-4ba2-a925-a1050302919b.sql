
-- Add notification preference columns to seller_settings
ALTER TABLE public.seller_settings
  ADD COLUMN IF NOT EXISTS notify_low_stock boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_new_order boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_order_status boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_email boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_in_app boolean NOT NULL DEFAULT true;

-- Update the check_low_stock function to respect preferences
CREATE OR REPLACE FUNCTION public.check_low_stock()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  threshold integer;
  should_notify boolean;
BEGIN
  IF NEW.quantity_available < OLD.quantity_available AND NEW.is_active = true THEN
    SELECT COALESCE(s.low_stock_threshold, 10), COALESCE(s.notify_low_stock, true) AND COALESCE(s.notify_in_app, true)
    INTO threshold, should_notify
    FROM seller_settings s WHERE s.user_id = NEW.seller_id;
    
    IF threshold IS NULL THEN threshold := 10; END IF;
    IF should_notify IS NULL THEN should_notify := true; END IF;
    
    IF NEW.quantity_available <= threshold AND should_notify THEN
      IF NOT EXISTS (
        SELECT 1 FROM notifications 
        WHERE product_id = NEW.id 
          AND type = 'low_stock' 
          AND created_at > now() - interval '1 hour'
      ) THEN
        INSERT INTO notifications (user_id, type, title, message, product_id)
        VALUES (
          NEW.seller_id,
          'low_stock',
          'Low Stock: ' || NEW.name,
          NEW.name || ' has only ' || NEW.quantity_available || ' units left (threshold: ' || threshold || ')',
          NEW.id
        );
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;
