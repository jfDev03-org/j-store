-- Add a tsvector column for full-text search on products.
-- This is much faster than ILIKE because GIN indexes avoid sequential scans.

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS search_vector tsvector
    GENERATED ALWAYS AS (
      setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
      setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
      setweight(to_tsvector('english', coalesce(brand, '')), 'C') ||
      setweight(to_tsvector('english', coalesce(sku, '')), 'D')
    ) STORED;

CREATE INDEX IF NOT EXISTS products_search_vector_idx
  ON products USING GIN (search_vector);
