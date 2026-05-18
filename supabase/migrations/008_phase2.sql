-- ============================================================
-- Migration 008 — Phase 2: Automatic fulfillment store assignment
-- Run in Supabase SQL Editor
-- ============================================================

-- ─── assign_fulfillment_store() ──────────────────────────────
-- Returns the store_id that can fulfil a given product+qty.
-- Selects the store with the highest quantity (most stock first)
-- so we balance load away from low-stock stores.
-- Returns NULL if no store can fulfil the request.
CREATE OR REPLACE FUNCTION assign_fulfillment_store(
  p_product_id uuid,
  p_qty        int
) RETURNS uuid AS $$
  SELECT store_id
  FROM store_stock
  JOIN stores ON stores.id = store_stock.store_id
  WHERE store_stock.product_id = p_product_id
    AND store_stock.quantity   >= p_qty
    AND stores.is_active       = true
  ORDER BY store_stock.quantity DESC
  LIMIT 1;
$$ LANGUAGE sql STABLE;

-- ─── fulfillment_store_id on order_items ─────────────────────
-- Records which store fulfilled each line item.
-- Nullable: NULL for orders created before Phase 2 or orders
-- where the store was not recorded (e.g. manual orders).
ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS fulfillment_store_id uuid REFERENCES stores(id);

CREATE INDEX IF NOT EXISTS idx_order_items_fulfillment_store
  ON order_items(fulfillment_store_id);
