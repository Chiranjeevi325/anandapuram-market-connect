
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid NOT NULL,
  seller_id uuid NOT NULL,
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  rating smallint NOT NULL,
  comment text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (order_id)
);

-- Validation trigger for rating range
CREATE OR REPLACE FUNCTION public.validate_review_rating()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.rating < 1 OR NEW.rating > 5 THEN
    RAISE EXCEPTION 'Rating must be between 1 and 5';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER check_review_rating
  BEFORE INSERT OR UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_review_rating();

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Everyone can read reviews
CREATE POLICY "Reviews viewable by everyone"
  ON public.reviews FOR SELECT
  USING (true);

-- Buyers can insert reviews for their own completed orders
CREATE POLICY "Buyers can insert reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (
    auth.uid() = buyer_id
    AND EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = reviews.order_id
        AND orders.buyer_id = auth.uid()
        AND orders.seller_id = reviews.seller_id
        AND orders.status = 'delivered'
    )
  );
