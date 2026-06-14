-- ============================================================
-- Mass Distribution — Full Schema (v3)
-- Run this in Supabase SQL Editor:
-- Dashboard → SQL Editor → New Query → paste → Run
-- Safe to re-run: uses DROP CASCADE + IF NOT EXISTS
-- ============================================================

-- Drop in reverse-dependency order
DROP TABLE IF EXISTS price_lists  CASCADE;
DROP TABLE IF EXISTS order_items  CASCADE;
DROP TABLE IF EXISTS orders       CASCADE;
DROP TABLE IF EXISTS customers    CASCADE;
DROP TABLE IF EXISTS products     CASCADE;

-- ── 1. products (no dependencies) ────────────────────────────────────────────
CREATE TABLE products (
  id          integer  PRIMARY KEY,
  name_en     text     NOT NULL,
  name_ar     text     NOT NULL,
  brand       text     NOT NULL,
  category    text     NOT NULL,
  price       numeric  NOT NULL,   -- per piece, ex-VAT (EGP)
  pack_size   text,                -- e.g. "Case of 12 pcs"
  image_url   text,
  is_active   boolean  NOT NULL DEFAULT true,
  stock       integer  NOT NULL DEFAULT 999
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products_select" ON products FOR SELECT USING (true);
CREATE POLICY "products_insert" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "products_update" ON products FOR UPDATE USING (true);
CREATE POLICY "products_delete" ON products FOR DELETE USING (true);

CREATE INDEX idx_products_brand    ON products(brand);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_active   ON products(is_active);

-- ── 2. customers (no dependencies) ───────────────────────────────────────────
CREATE TABLE customers (
  id             uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  name           text    NOT NULL,
  phone          text,
  email          text,
  business_name  text,
  address        text,
  created_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "customers_insert" ON customers FOR INSERT WITH CHECK (true);
CREATE POLICY "customers_select" ON customers FOR SELECT USING (true);

-- ── 3. orders (depends on customers) ─────────────────────────────────────────
CREATE TABLE orders (
  id            uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id   uuid    REFERENCES customers(id) ON DELETE SET NULL,
  status        text    NOT NULL DEFAULT 'pending',
  total         numeric NOT NULL DEFAULT 0,
  notes         text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders_insert" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "orders_select" ON orders FOR SELECT USING (true);
CREATE POLICY "orders_update" ON orders FOR UPDATE USING (true);

-- ── 4. order_items (depends on orders + products) ─────────────────────────────
CREATE TABLE order_items (
  id           uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     uuid    NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id   integer REFERENCES products(id) ON DELETE SET NULL,
  product_name text    NOT NULL,
  quantity     integer NOT NULL CHECK (quantity > 0),
  unit_price   numeric NOT NULL,
  subtotal     numeric NOT NULL
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "order_items_insert" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "order_items_select" ON order_items FOR SELECT USING (true);

-- ── 5. price_lists (depends on products) ─────────────────────────────────────
CREATE TABLE price_lists (
  id             uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_type  text    NOT NULL,
  product_id     integer NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  special_price  numeric NOT NULL,
  UNIQUE (customer_type, product_id)
);

ALTER TABLE price_lists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "price_lists_select" ON price_lists FOR SELECT USING (true);
CREATE POLICY "price_lists_insert" ON price_lists FOR INSERT WITH CHECK (true);
