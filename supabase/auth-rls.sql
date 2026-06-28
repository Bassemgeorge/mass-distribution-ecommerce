-- ============================================================
-- Auth-aware RLS policies for Mass Distribution
-- Run this in Supabase SQL Editor after running products-schema.sql
-- ============================================================

-- customers: users can only read/update their own profile
DROP POLICY IF EXISTS "customers_select_own"  ON customers;
DROP POLICY IF EXISTS "customers_insert_own"  ON customers;
DROP POLICY IF EXISTS "customers_update_own"  ON customers;
DROP POLICY IF EXISTS "customers_open_select" ON customers;
DROP POLICY IF EXISTS "customers_open_insert" ON customers;
DROP POLICY IF EXISTS "customers_open_update" ON customers;

-- Allow any authenticated or anon insert (needed for guest checkout + signUp)
CREATE POLICY "customers_insert_own" ON customers
  FOR INSERT WITH CHECK (true);

-- Authenticated users see only their own row; anon sees nothing
CREATE POLICY "customers_select_own" ON customers
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND id = auth.uid()
  );

-- Users can only update their own row
CREATE POLICY "customers_update_own" ON customers
  FOR UPDATE USING (id = auth.uid());


-- orders: users see only their own orders
DROP POLICY IF EXISTS "orders_select_own"  ON orders;
DROP POLICY IF EXISTS "orders_insert_own"  ON orders;
DROP POLICY IF EXISTS "orders_open_select" ON orders;
DROP POLICY IF EXISTS "orders_open_insert" ON orders;

-- Any insert (guest checkout goes through anon key, no auth.uid())
CREATE POLICY "orders_insert_any" ON orders
  FOR INSERT WITH CHECK (true);

-- Authenticated users see only their orders
CREATE POLICY "orders_select_own" ON orders
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND customer_id = auth.uid()
  );


-- order_items: visible if the parent order belongs to the user
DROP POLICY IF EXISTS "order_items_select_own"  ON order_items;
DROP POLICY IF EXISTS "order_items_insert_any"  ON order_items;
DROP POLICY IF EXISTS "order_items_open_select" ON order_items;
DROP POLICY IF EXISTS "order_items_open_insert" ON order_items;

CREATE POLICY "order_items_insert_any" ON order_items
  FOR INSERT WITH CHECK (true);

CREATE POLICY "order_items_select_own" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
        AND orders.customer_id = auth.uid()
    )
  );


-- products: public read (no auth required)
DROP POLICY IF EXISTS "products_open_select" ON products;
CREATE POLICY "products_public_read" ON products
  FOR SELECT USING (true);
