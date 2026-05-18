-- JStore Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================
-- Categories
-- =========================================
CREATE TABLE categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  type        TEXT NOT NULL DEFAULT 'accessory' CHECK (type IN ('accessory', 'component', 'other')),
  description TEXT,
  image_url   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================
-- Products
-- =========================================
CREATE TABLE products (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  price       NUMERIC(10,2) NOT NULL,
  stock       INTEGER NOT NULL DEFAULT 0,
  images      TEXT[] NOT NULL DEFAULT '{}',
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  brand       TEXT,
  sku         TEXT UNIQUE,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX products_category_id_idx ON products(category_id);
CREATE INDEX products_is_active_idx ON products(is_active);

-- =========================================
-- Orders
-- =========================================
CREATE TABLE orders (
  id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  items                    JSONB NOT NULL DEFAULT '[]',
  subtotal                 NUMERIC(10,2) NOT NULL,
  shipping                 NUMERIC(10,2) NOT NULL DEFAULT 0,
  total                    NUMERIC(10,2) NOT NULL,
  status                   TEXT NOT NULL DEFAULT 'pending'
                             CHECK (status IN ('pending','paid','shipped','delivered','cancelled')),
  customer_name            TEXT NOT NULL,
  customer_email           TEXT NOT NULL,
  customer_phone           TEXT,
  shipping_address         JSONB NOT NULL DEFAULT '{}',
  stripe_payment_intent_id TEXT,
  stripe_session_id        TEXT,
  notes                    TEXT,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX orders_status_idx ON orders(status);
CREATE INDEX orders_customer_email_idx ON orders(customer_email);

-- =========================================
-- Repair Services
-- =========================================
CREATE TABLE repair_services (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name           TEXT NOT NULL,
  slug           TEXT NOT NULL UNIQUE,
  description    TEXT NOT NULL DEFAULT '',
  price_from     NUMERIC(10,2) NOT NULL,
  estimated_days INTEGER NOT NULL DEFAULT 1,
  device_models  TEXT[] NOT NULL DEFAULT '{}',
  category       TEXT NOT NULL DEFAULT 'general',
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================
-- Repair Requests
-- =========================================
CREATE TABLE repair_requests (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id        UUID REFERENCES repair_services(id) ON DELETE SET NULL,
  device_brand      TEXT NOT NULL,
  device_model      TEXT NOT NULL,
  issue_description TEXT NOT NULL,
  customer_name     TEXT NOT NULL,
  customer_email    TEXT NOT NULL,
  customer_phone    TEXT NOT NULL,
  status            TEXT NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending','quoted','approved','in_progress','completed','cancelled')),
  admin_notes       TEXT,
  quoted_price      NUMERIC(10,2),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX repair_requests_status_idx ON repair_requests(status);

-- =========================================
-- Bookings
-- =========================================
CREATE TABLE bookings (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id     UUID REFERENCES repair_services(id) ON DELETE SET NULL,
  scheduled_at   TIMESTAMPTZ NOT NULL,
  customer_name  TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  device_info    TEXT,
  status         TEXT NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','confirmed','cancelled','completed')),
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX bookings_scheduled_at_idx ON bookings(scheduled_at);
CREATE INDEX bookings_status_idx ON bookings(status);

-- =========================================
-- Updated_at triggers
-- =========================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER repair_requests_updated_at BEFORE UPDATE ON repair_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =========================================
-- Row Level Security
-- =========================================

-- Enable RLS on all tables
ALTER TABLE categories        ENABLE ROW LEVEL SECURITY;
ALTER TABLE products          ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders            ENABLE ROW LEVEL SECURITY;
ALTER TABLE repair_services   ENABLE ROW LEVEL SECURITY;
ALTER TABLE repair_requests   ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings          ENABLE ROW LEVEL SECURITY;

-- Public read access for shop data
CREATE POLICY "Public can view active categories"
  ON categories FOR SELECT USING (TRUE);

CREATE POLICY "Public can view active products"
  ON products FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Public can view active services"
  ON repair_services FOR SELECT USING (is_active = TRUE);

-- Public insert for customer-facing submissions
CREATE POLICY "Anyone can create repair requests"
  ON repair_requests FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Anyone can create bookings"
  ON bookings FOR INSERT WITH CHECK (TRUE);

-- Admin full access via service role key (bypasses RLS)
-- Orders are only accessible via service role (Stripe webhook + admin)

-- =========================================
-- Seed data
-- =========================================

INSERT INTO categories (name, slug, type, description) VALUES
  ('Cases & Covers', 'cases', 'accessory', 'Protective cases and covers for all phone models'),
  ('Screen Protectors', 'screen-protectors', 'accessory', 'Tempered glass and film screen protectors'),
  ('Chargers & Cables', 'chargers', 'accessory', 'USB-C, Lightning, and MicroUSB chargers and cables'),
  ('Batteries', 'batteries', 'component', 'Replacement batteries for popular phone models'),
  ('Screens & Displays', 'screens', 'component', 'Replacement screens and display assemblies'),
  ('Other Accessories', 'accessories', 'accessory', 'Headphones, stands, mounts and more');

INSERT INTO repair_services (name, slug, description, price_from, estimated_days, device_models, category) VALUES
  ('Screen Replacement', 'screen-replacement',
   'We replace cracked or damaged screens with high-quality OEM or aftermarket parts.',
   49.00, 0, ARRAY['iPhone 15','iPhone 14','iPhone 13','iPhone 12','Samsung S23','Samsung S22','Xiaomi 13'], 'screen'),
  ('Battery Replacement', 'battery-replacement',
   'Restore your phone battery life. We carry batteries for most popular models.',
   29.00, 0, ARRAY['iPhone 15','iPhone 14','iPhone 13','Samsung S23','Samsung S22','Xiaomi 13'], 'battery'),
  ('Charging Port Repair', 'charging-port-repair',
   'Fixing faulty or loose charging ports including USB-C, Lightning and MicroUSB.',
   39.00, 0, ARRAY['iPhone','Samsung','Xiaomi','Huawei','OnePlus'], 'port'),
  ('Water Damage Assessment', 'water-damage',
   'Full assessment and cleaning after liquid exposure. Price depends on extent of damage.',
   59.00, 2, ARRAY['All models'], 'water'),
  ('Back Glass Replacement', 'back-glass-replacement',
   'Replace cracked or shattered rear glass on compatible models.',
   69.00, 1, ARRAY['iPhone 15','iPhone 14','iPhone 13','Samsung S23'], 'glass'),
  ('Camera Repair', 'camera-repair',
   'Repair or replacement of front and rear cameras.',
   55.00, 1, ARRAY['iPhone','Samsung','Xiaomi'], 'camera');
