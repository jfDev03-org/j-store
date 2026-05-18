-- ============================================================
-- Migration 007 — Phase 3: Purchases back-office
-- Run in Supabase SQL Editor
-- ============================================================

-- ─── purchases ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS purchases (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier    text NOT NULL,
  status      text NOT NULL DEFAULT 'pending'
              CHECK (status IN ('pending', 'received', 'cancelled')),
  notes       text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  received_at timestamptz
);

-- ─── purchase_items ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS purchase_items (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id       uuid NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
  product_id        uuid NOT NULL REFERENCES products(id),
  quantity_ordered  int  NOT NULL CHECK (quantity_ordered > 0),
  quantity_received int  NOT NULL DEFAULT 0,
  unit_cost         numeric(10,2) NOT NULL DEFAULT 0,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_purchase_items_purchase_id ON purchase_items(purchase_id);
CREATE INDEX IF NOT EXISTS idx_purchase_items_product_id  ON purchase_items(product_id);

-- ─── receive_purchase() ──────────────────────────────────────
-- Marks the purchase as received and increments store_stock for each item.
-- Idempotent: safe to call multiple times (status check prevents double-receive).
CREATE OR REPLACE FUNCTION receive_purchase(
  p_purchase_id uuid,
  p_store_id    uuid
) RETURNS void AS $$
DECLARE
  v_item RECORD;
BEGIN
  -- Guard: only process pending purchases
  UPDATE purchases
  SET status = 'received', received_at = now()
  WHERE id = p_purchase_id AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'purchase_not_pending';
  END IF;

  -- Update received quantities and increment stock
  FOR v_item IN
    SELECT product_id, quantity_ordered FROM purchase_items
    WHERE purchase_id = p_purchase_id
  LOOP
    UPDATE purchase_items
    SET quantity_received = quantity_ordered
    WHERE purchase_id = p_purchase_id AND product_id = v_item.product_id;

    PERFORM increment_stock(p_store_id, v_item.product_id, v_item.quantity_ordered, 'purchase_received');
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ─── RLS ─────────────────────────────────────────────────────
ALTER TABLE purchases      ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_items ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS; these policies cover any future direct access
CREATE POLICY "purchases_service_role" ON purchases
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "purchase_items_service_role" ON purchase_items
  FOR ALL TO service_role USING (true) WITH CHECK (true);
