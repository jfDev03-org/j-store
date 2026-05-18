-- ============================================================
-- Migration 009: Atomic transfer_stock() function
-- Moves stock from one store to another in a single transaction.
-- Uses UPSERT on destination so the product doesn't need to
-- be pre-initialized in the target store.
-- ============================================================

CREATE OR REPLACE FUNCTION transfer_stock(
  p_from_store_id uuid,
  p_to_store_id   uuid,
  p_product_id    uuid,
  p_qty           int
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF p_from_store_id = p_to_store_id THEN
    RAISE EXCEPTION 'same_store';
  END IF;

  IF p_qty <= 0 THEN
    RAISE EXCEPTION 'invalid_qty';
  END IF;

  -- Decrement source store (raises 'insufficient_stock' if not enough)
  UPDATE store_stock
  SET quantity = quantity - p_qty
  WHERE store_id   = p_from_store_id
    AND product_id = p_product_id
    AND quantity   >= p_qty;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'insufficient_stock' USING HINT = p_product_id;
  END IF;

  INSERT INTO stock_movements (store_id, product_id, delta, reason)
  VALUES (p_from_store_id, p_product_id, -p_qty, 'transfer_out');

  -- Upsert destination (auto-create the row if not initialized yet)
  INSERT INTO store_stock (store_id, product_id, quantity, min_quantity)
  VALUES (p_to_store_id, p_product_id, p_qty, 5)
  ON CONFLICT (store_id, product_id)
  DO UPDATE SET quantity = store_stock.quantity + p_qty;

  INSERT INTO stock_movements (store_id, product_id, delta, reason)
  VALUES (p_to_store_id, p_product_id, p_qty, 'transfer_in');
END;
$$;
