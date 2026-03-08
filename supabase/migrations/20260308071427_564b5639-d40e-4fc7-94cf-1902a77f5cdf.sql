
-- Drop restrictive policies and recreate as permissive
DROP POLICY IF EXISTS "Profiles viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Products viewable by everyone" ON public.products;
DROP POLICY IF EXISTS "Sellers can insert own products" ON public.products;
DROP POLICY IF EXISTS "Sellers can update own products" ON public.products;
DROP POLICY IF EXISTS "Sellers can delete own products" ON public.products;
DROP POLICY IF EXISTS "Buyers can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Buyers can create orders" ON public.orders;
DROP POLICY IF EXISTS "Order parties can update" ON public.orders;
DROP POLICY IF EXISTS "Order items viewable by order parties" ON public.order_items;
DROP POLICY IF EXISTS "Buyers can insert order items" ON public.order_items;

-- Profiles (permissive)
CREATE POLICY "Profiles viewable by everyone" ON public.profiles FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- User roles
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Products
CREATE POLICY "Products viewable by everyone" ON public.products FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Sellers can insert own products" ON public.products FOR INSERT TO authenticated WITH CHECK (auth.uid() = seller_id AND public.has_role(auth.uid(), 'seller'));
CREATE POLICY "Sellers can update own products" ON public.products FOR UPDATE TO authenticated USING (auth.uid() = seller_id AND public.has_role(auth.uid(), 'seller'));
CREATE POLICY "Sellers can delete own products" ON public.products FOR DELETE TO authenticated USING (auth.uid() = seller_id AND public.has_role(auth.uid(), 'seller'));

-- Orders
CREATE POLICY "Buyers can view own orders" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "Buyers can create orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Order parties can update" ON public.orders FOR UPDATE TO authenticated USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Order items
CREATE POLICY "Order items viewable by order parties" ON public.order_items FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND (buyer_id = auth.uid() OR seller_id = auth.uid()))
);
CREATE POLICY "Buyers can insert order items" ON public.order_items FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND buyer_id = auth.uid())
);
