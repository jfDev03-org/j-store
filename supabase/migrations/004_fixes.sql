-- ============================================================
-- Migration 004: Storage RLS tightening + stock restore helper
-- Run in the Supabase SQL Editor.
-- ============================================================

-- ── 1. STORAGE: restrict write/delete to admin role only ──────

DROP POLICY IF EXISTS "Authenticated users can upload product images"  ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update product images"   ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete product images"   ON storage.objects;

CREATE POLICY "Admins can upload product images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'products'
    AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admins can update product images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'products'
    AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admins can delete product images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'products'
    AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );


-- ── 2. STOCK: add restore function (used on session expiry) ───

CREATE OR REPLACE FUNCTION increment_stock(p_product_id UUID, p_qty INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE products
  SET stock = stock + p_qty
  WHERE id = p_product_id;
END;
$$;
