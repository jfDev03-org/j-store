-- Atomic stock decrement.
-- Returns TRUE if stock was successfully decremented, FALSE if insufficient stock.
-- Single UPDATE statement guarantees atomicity — no TOCTOU race condition.
CREATE OR REPLACE FUNCTION decrement_stock_safe(p_product_id UUID, p_qty INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE products
  SET stock = stock - p_qty
  WHERE id = p_product_id
    AND stock >= p_qty;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count > 0;
END;
$$;
