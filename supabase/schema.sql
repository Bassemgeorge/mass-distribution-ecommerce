-- ============================================================
-- Mass Distribution — Supabase Schema
-- Run this entire file in the Supabase SQL Editor
-- (Dashboard → SQL Editor → New Query → paste → Run)
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Sequence for human-readable order numbers
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- ── products ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id             uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_ar        text        NOT NULL,
  name_en        text        NOT NULL,
  sku            text        UNIQUE NOT NULL,
  brand          text        NOT NULL,
  category       text        NOT NULL,
  unit_price     numeric     NOT NULL,
  pack_size      text,
  min_order_qty  integer     NOT NULL DEFAULT 1,
  stock_quantity integer     NOT NULL DEFAULT 9999,
  image_url      text,
  is_active      boolean     NOT NULL DEFAULT true,
  created_at     timestamptz NOT NULL DEFAULT now()
);

-- ── customers ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customers (
  id             uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_name  text        NOT NULL,
  contact_name   text,
  phone          text,
  email          text        UNIQUE,
  address        text,
  area           text,
  customer_type  text        CHECK (customer_type IN ('hotel','restaurant','cafe','catering','other')),
  credit_limit   numeric     NOT NULL DEFAULT 0,
  created_at     timestamptz NOT NULL DEFAULT now()
);

-- ── orders ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id               uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number     text        UNIQUE NOT NULL
                               DEFAULT ('ORD-' || LPAD(nextval('order_number_seq')::text, 4, '0')),
  customer_id      uuid        REFERENCES customers(id) ON DELETE SET NULL,
  status           text        NOT NULL DEFAULT 'pending'
                               CHECK (status IN ('pending','confirmed','processing','delivered','cancelled')),
  total_amount     numeric     NOT NULL DEFAULT 0,
  delivery_address text,
  notes            text,
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- ── order_items ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id           uuid    PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id     uuid    NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id   uuid    REFERENCES products(id) ON DELETE SET NULL,
  product_sku  text,                       -- kept for display even if product deleted
  product_name text    NOT NULL,
  quantity     integer NOT NULL CHECK (quantity > 0),
  unit_price   numeric NOT NULL,
  subtotal     numeric NOT NULL
);

-- ── price_lists ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS price_lists (
  id             uuid    PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_type  text    NOT NULL,
  product_id     uuid    NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  special_price  numeric NOT NULL,
  UNIQUE (customer_type, product_id)
);

-- ── Row Level Security ────────────────────────────────────────────────────────
ALTER TABLE products    ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers   ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_lists ENABLE ROW LEVEL SECURITY;

-- Products: anyone can read; only service role can write
CREATE POLICY "products_read"   ON products    FOR SELECT USING (true);
CREATE POLICY "products_insert" ON products    FOR INSERT WITH CHECK (true);  -- remove after seeding
CREATE POLICY "products_update" ON products    FOR UPDATE USING (true);

-- Customers: anyone can insert (self-registration at checkout); read own record later
CREATE POLICY "customers_insert" ON customers FOR INSERT WITH CHECK (true);
CREATE POLICY "customers_read"   ON customers FOR SELECT USING (true);

-- Orders: anyone can insert; anyone can read (tighten with auth later)
CREATE POLICY "orders_insert" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "orders_read"   ON orders FOR SELECT USING (true);
CREATE POLICY "orders_update" ON orders FOR UPDATE USING (true);

-- Order items: follow order permissions
CREATE POLICY "order_items_insert" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "order_items_read"   ON order_items FOR SELECT USING (true);

-- Price lists: anyone can read
CREATE POLICY "price_lists_read"   ON price_lists FOR SELECT USING (true);
CREATE POLICY "price_lists_insert" ON price_lists FOR INSERT WITH CHECK (true);

-- ── Useful indexes ────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_products_sku      ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_brand    ON products(brand);
CREATE INDEX IF NOT EXISTS idx_orders_customer   ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status     ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created    ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
