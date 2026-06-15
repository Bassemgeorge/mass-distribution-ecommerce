-- ============================================================
-- Carton-based pricing migration
-- Run in Supabase SQL Editor → New Query → paste → Run
-- ============================================================

-- Add carton_price column (price per carton, what customer pays)
ALTER TABLE products ADD COLUMN IF NOT EXISTS carton_price numeric;

-- Add case_count column (display text, e.g. "12 pcs per carton")
ALTER TABLE products ADD COLUMN IF NOT EXISTS case_count text;

-- Populate case_count from existing pack_size
UPDATE products SET case_count = pack_size WHERE case_count IS NULL;

-- Set carton_price = price for now (update actual prices via admin panel later)
UPDATE products SET carton_price = price WHERE carton_price IS NULL;

-- Verify
SELECT id, name_en, price AS unit_price, carton_price, pack_size, case_count
FROM products LIMIT 10;
