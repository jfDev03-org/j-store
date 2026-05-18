-- ============================================================
-- Migration 006: Phase 1 — Multi-store foundations
-- 1.1 stores table
-- 1.2 store_stock (per-store quantities)
-- 1.3 stock_movements (audit trail)
-- 1.4 Updated decrement_stock_safe() + increment_stock() (store-aware)
-- + Trigger to keep products.stock in sync (backward compat)
-- Run in the Supabase SQL Editor.
-- ============================================================

-- ── 1.1  stores ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS stores (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text        NOT NULL,
  location   text,
  is_active  boolean     NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

INSERT INTO stores (name, location) VALUES ('Loja Principal', 'Lisboa')
ON CONFLICT DO NOTHING;


-- ── 1.2  store_stock ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS store_stock (
  store_id     uuid    NOT NULL REFERENCES stores(id)   ON DELETE CASCADE,
  product_id   uuid    NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity     int     NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  min_quantity int     NOT NULL DEFAULT 5,               -- low-stock alert threshold
  PRIMARY KEY (store_id, product_id)
);

ALTER TABLE store_stock ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS store_stock_product_id_idx ON store_stock(product_id);

-- Seed store_stock from the existing products.stock column
INSERT INTO store_stock (store_id, product_id, quantity)
SELECT
  (SELECT id FROM stores ORDER BY created_at LIMIT 1),
  id,
  COALESCE(stock, 0)
FROM products
ON CONFLICT DO NOTHING;


-- ── 1.3  stock_movements ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS stock_movements (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id     uuid        NOT NULL REFERENCES stores(id)   ON DELETE RESTRICT,
  product_id   uuid        NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  delta        int         NOT NULL,        -- positive = in, negative = out
  reason       text        NOT NULL,        -- 'sale', 'adjustment', 'transfer_in', 'transfer_out', 'reservation_expired'
  reference_id uuid,                        -- order_id, transfer_id, etc.
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS stock_movements_store_product_idx ON stock_movements(store_id, product_id);
CREATE INDEX IF NOT EXISTS stock_movements_reference_id_idx  ON stock_movements(reference_id);
CREATE INDEX IF NOT EXISTS stock_movements_created_at_idx    ON stock_movements(created_at DESC);


-- ── 1.4  decrement_stock_safe() — store-aware ─────────────────────────────────
-- Returns void; raises exception 'insufficient_stock' if not enough stock.
-- Caller should wrap in a try/catch and handle the exception.
CREATE OR REPLACE FUNCTION decrement_stock_safe(
  p_store_id   uuid,
  p_product_id uuid,
  p_qty        int
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE store_stock
  SET quantity = quantity - p_qty
  WHERE store_id   = p_store_id
    AND product_id = p_product_id
    AND quantity   >= p_qty;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'insufficient_stock' USING HINT = p_product_id;
  END IF;

  INSERT INTO stock_movements (store_id, product_id, delta, reason)
  VALUES (p_store_id, p_product_id, -p_qty, 'sale');
END;
$$;


-- ── increment_stock() — store-aware ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION increment_stock(
  p_store_id   uuid,
  p_product_id uuid,
  p_qty        int,
  p_reason     text DEFAULT 'reservation_expired'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE store_stock
  SET quantity = quantity + p_qty
  WHERE store_id   = p_store_id
    AND product_id = p_product_id;

  INSERT INTO stock_movements (store_id, product_id, delta, reason)
  VALUES (p_store_id, p_product_id, p_qty, p_reason);
END;
$$;


-- ── Trigger: keep products.stock in sync with total store_stock ───────────────
-- Ensures backward-compatible queries on products.stock still work.
CREATE OR REPLACE FUNCTION sync_products_stock()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE products
  SET stock = (
    SELECT COALESCE(SUM(quantity), 0)
    FROM store_stock
    WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
  )
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_products_stock ON store_stock;
CREATE TRIGGER trg_sync_products_stock
AFTER INSERT OR UPDATE OR DELETE ON store_stock
FOR EACH ROW EXECUTE FUNCTION sync_products_stock();
