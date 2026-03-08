CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.check_low_stock()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  threshold integer;
  should_notify_app boolean;
  should_notify_email boolean;
  supabase_url text;
  service_key text;
BEGIN
  IF NEW.quantity_available < OLD.quantity_available AND NEW.is_active = true THEN
    SELECT
      COALESCE(s.low_stock_threshold, 10),
      COALESCE(s.notify_low_stock, true) AND COALESCE(s.notify_in_app, true),
      COALESCE(s.notify_low_stock, true) AND COALESCE(s.notify_email, true)
    INTO threshold, should_notify_app, should_notify_email
    FROM seller_settings s WHERE s.user_id = NEW.seller_id;

    IF threshold IS NULL THEN threshold := 10; END IF;
    IF should_notify_app IS NULL THEN should_notify_app := true; END IF;
    IF should_notify_email IS NULL THEN should_notify_email := true; END IF;

    IF NEW.quantity_available <= threshold THEN
      IF NOT EXISTS (
        SELECT 1 FROM notifications
        WHERE product_id = NEW.id
          AND type = 'low_stock'
          AND created_at > now() - interval '1 hour'
      ) THEN
        IF should_notify_app THEN
          INSERT INTO notifications (user_id, type, title, message, product_id)
          VALUES (
            NEW.seller_id,
            'low_stock',
            'Low Stock: ' || NEW.name,
            NEW.name || ' has only ' || NEW.quantity_available || ' units left (threshold: ' || threshold || ')',
            NEW.id
          );
        END IF;

        IF should_notify_email THEN
          SELECT decrypted_secret INTO supabase_url FROM vault.decrypted_secrets WHERE name = 'SUPABASE_URL' LIMIT 1;
          SELECT decrypted_secret INTO service_key FROM vault.decrypted_secrets WHERE name = 'SUPABASE_SERVICE_ROLE_KEY' LIMIT 1;

          IF supabase_url IS NOT NULL AND service_key IS NOT NULL THEN
            PERFORM extensions.http_post(
              url := supabase_url || '/functions/v1/send-low-stock-email',
              body := json_build_object(
                'seller_id', NEW.seller_id,
                'product_name', NEW.name,
                'quantity_available', NEW.quantity_available,
                'threshold', threshold
              )::jsonb,
              headers := json_build_object(
                'Content-Type', 'application/json',
                'Authorization', 'Bearer ' || service_key
              )::jsonb
            );
          END IF;
        END IF;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;