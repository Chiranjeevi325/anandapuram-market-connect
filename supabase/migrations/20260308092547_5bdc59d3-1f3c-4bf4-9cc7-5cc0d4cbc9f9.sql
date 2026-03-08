
-- Seller settings table for stock threshold
CREATE TABLE public.seller_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  low_stock_threshold integer NOT NULL DEFAULT 10,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.seller_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sellers can view own settings" ON public.seller_settings FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Sellers can insert own settings" ON public.seller_settings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Sellers can update own settings" ON public.seller_settings FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL DEFAULT 'low_stock',
  title text NOT NULL,
  message text NOT NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "System can insert notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Trigger function: check stock after product update and create notification
CREATE OR REPLACE FUNCTION public.check_low_stock()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  threshold integer;
BEGIN
  -- Only check if quantity actually decreased and product is active
  IF NEW.quantity_available < OLD.quantity_available AND NEW.is_active = true THEN
    -- Get seller's custom threshold, default to 10
    SELECT COALESCE(s.low_stock_threshold, 10) INTO threshold
    FROM seller_settings s WHERE s.user_id = NEW.seller_id;
    
    IF threshold IS NULL THEN threshold := 10; END IF;
    
    -- Check if now below threshold (and wasn't already notified recently)
    IF NEW.quantity_available <= threshold THEN
      -- Avoid duplicate notifications within 1 hour for same product
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
$$;

CREATE TRIGGER trigger_check_low_stock
AFTER UPDATE OF quantity_available ON public.products
FOR EACH ROW EXECUTE FUNCTION public.check_low_stock();
