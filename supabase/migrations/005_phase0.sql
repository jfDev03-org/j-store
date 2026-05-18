-- ============================================================
-- Migration 005: Phase 0 Foundations
-- 0.1 — Webhook idempotency column on orders
-- 0.2 — Normalised order_items table (replaces JSONB for new orders)
-- 0.3 — domain_events audit log
-- Run in the Supabase SQL Editor.
-- ============================================================

-- ── 0.1  Idempotency: store the Stripe event ID on orders ────────────────────
-- Unique constraint means a duplicate webhook event will fail on insert,
-- giving us a hard idempotency guarantee instead of relying on status checks.

ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_event_id text UNIQUE;


-- ── 0.2  Normalised order_items ──────────────────────────────────────────────
-- New orders will INSERT rows here. The legacy items JSONB column is kept
-- intact so existing orders are unaffected.

CREATE TABLE IF NOT EXISTS order_items (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    uuid        NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  uuid        REFERENCES products(id) ON DELETE SET NULL,
  product_name text       NOT NULL,              -- snapshot at time of purchase
  unit_price  numeric(10,2) NOT NULL,            -- price at time of purchase
  quantity    int         NOT NULL CHECK (quantity > 0),
  product_image text      NOT NULL DEFAULT '',
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON order_items(order_id);
CREATE INDEX IF NOT EXISTS order_items_product_id_idx ON order_items(product_id);

-- RLS: service role only (same as orders)
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;


-- ── 0.3  domain_events audit log ─────────────────────────────────────────────
-- Written to in parallel with existing operations. Pure append-only log.

CREATE TABLE IF NOT EXISTS domain_events (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  type       text        NOT NULL,
  payload    jsonb       NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS domain_events_type_idx       ON domain_events(type);
CREATE INDEX IF NOT EXISTS domain_events_created_at_idx ON domain_events(created_at DESC);

-- RLS: service role only
ALTER TABLE domain_events ENABLE ROW LEVEL SECURITY;
