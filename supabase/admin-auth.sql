-- ============================================================
-- Admin authorization for Mass Distribution
-- Run this once in Supabase SQL Editor.
-- Admin access is based on auth.users.raw_app_meta_data.role = 'admin'.
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Admins can manage the store data. Existing customer-facing policies remain
-- in effect for normal users and are combined with these policies by Postgres.
DROP POLICY IF EXISTS "admin_customers_all" ON public.customers;
CREATE POLICY "admin_customers_all" ON public.customers
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_orders_all" ON public.orders;
CREATE POLICY "admin_orders_all" ON public.orders
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_order_items_all" ON public.order_items;
CREATE POLICY "admin_order_items_all" ON public.order_items
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Product reads stay public, but writes are admin-only.
DROP POLICY IF EXISTS "products_insert" ON public.products;
DROP POLICY IF EXISTS "products_update" ON public.products;
DROP POLICY IF EXISTS "products_delete" ON public.products;
DROP POLICY IF EXISTS "admin_products_all" ON public.products;
CREATE POLICY "admin_products_all" ON public.products
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Price-list writes are admin-only; existing read policies remain unchanged.
DROP POLICY IF EXISTS "price_lists_insert" ON public.price_lists;
DROP POLICY IF EXISTS "admin_price_lists_all" ON public.price_lists;
CREATE POLICY "admin_price_lists_all" ON public.price_lists
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- The inquiries table may be created by a separate script, so guard this policy.
DO $$
BEGIN
  IF to_regclass('public.inquiries') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "admin_inquiries_all" ON public.inquiries';
    EXECUTE 'CREATE POLICY "admin_inquiries_all" ON public.inquiries
      FOR ALL TO authenticated
      USING (public.is_admin())
      WITH CHECK (public.is_admin())';
  END IF;
END;
$$;

-- Promote exactly one existing Auth user after replacing the email:
-- UPDATE auth.users
-- SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb)
--   || '{"role":"admin"}'::jsonb
-- WHERE email = 'admin@example.com';
