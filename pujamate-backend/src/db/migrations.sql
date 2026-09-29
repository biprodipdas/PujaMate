-- ============================================================
-- PujaMate — Neon PostgreSQL Migration Script
-- Run with: psql "$DATABASE_URL" -f src/db/migrations.sql
-- ============================================================

-- Enable case-insensitive email uniqueness & UUID support if needed later
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- Enables trigram indexes so ILIKE '%term%' search can use an index
-- instead of a full table scan (see idx_pujas_name_trgm below)
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ------------------------------------------------------------
-- 1. Users
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN')),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- ------------------------------------------------------------
-- 2. Pujas (Pandals)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pujas (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  area VARCHAR(100) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  pujo_type VARCHAR(50) NOT NULL DEFAULT 'THEME'
    CHECK (pujo_type IN ('THEME', 'TRADITIONAL', 'BIG_BUDGET', 'AWARD_WINNING', 'FAMILY_FRIENDLY')),
  facilities JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pujas_area ON pujas (area);
CREATE INDEX IF NOT EXISTS idx_pujas_type ON pujas (pujo_type);
-- Common combined filter (Explore page's Area + Category filters used together)
CREATE INDEX IF NOT EXISTS idx_pujas_area_type ON pujas (area, pujo_type);
-- Speeds up "nearby" queries using simple bounding-box filters
CREATE INDEX IF NOT EXISTS idx_pujas_lat_lng ON pujas (latitude, longitude);
-- GIN trigram indexes so ILIKE '%term%' search (name/description) can use
-- an index scan instead of scanning every row — a plain btree index can't
-- help with a leading wildcard.
CREATE INDEX IF NOT EXISTS idx_pujas_name_trgm ON pujas USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_pujas_description_trgm ON pujas USING gin (description gin_trgm_ops);
-- GIN index on the facilities JSONB column so containment (@>) and
-- key-existence (?) lookups in GET /pujas/facilities can use an index
-- instead of evaluating the JSONB expression on every row.
CREATE INDEX IF NOT EXISTS idx_pujas_facilities_gin ON pujas USING gin (facilities);

-- ------------------------------------------------------------
-- 3. Crowd Reports (time-decayed community reporting)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS crowd_reports (
  id SERIAL PRIMARY KEY,
  puja_id INT NOT NULL REFERENCES pujas(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  crowd_level VARCHAR(20) NOT NULL CHECK (crowd_level IN ('LOW', 'MODERATE', 'HEAVY')),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_crowd_reports_puja_time ON crowd_reports (puja_id, created_at DESC);

-- ------------------------------------------------------------
-- 4. Visited Pujas (Puja Passport check-ins)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS visited_pujas (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  puja_id INT NOT NULL REFERENCES pujas(id) ON DELETE CASCADE,
  visited_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, puja_id)
);

CREATE INDEX IF NOT EXISTS idx_visited_pujas_user ON visited_pujas (user_id);
-- The passport zone-progress query LEFT JOINs on (puja_id, user_id) with
-- puja_id as the join key; the UNIQUE(user_id, puja_id) constraint above
-- creates an index with user_id leading, which doesn't serve a puja_id-led
-- lookup well at scale.
CREATE INDEX IF NOT EXISTS idx_visited_pujas_puja_user ON visited_pujas (puja_id, user_id);

-- ------------------------------------------------------------
-- 5. Saved Routes
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS routes (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(150) NOT NULL,
  stops JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_routes_user ON routes (user_id);

-- ------------------------------------------------------------
-- 6. Reviews
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  puja_id INT NOT NULL REFERENCES pujas(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (puja_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_puja ON reviews (puja_id);

-- ------------------------------------------------------------
-- 7. Emergency Services (PRD 5.8 — verified police/hospital/
--    pharmacy/first-aid locations shown on the Emergency module)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS emergency_services (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  category VARCHAR(30) NOT NULL
    CHECK (category IN ('POLICE', 'HOSPITAL', 'PHARMACY', 'FIRST_AID')),
  phone VARCHAR(20) NOT NULL,
  area VARCHAR(100),
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_emergency_category ON emergency_services (category);
CREATE INDEX IF NOT EXISTS idx_emergency_lat_lng ON emergency_services (latitude, longitude);

-- ============================================================
-- End of migration
-- ============================================================


-- ------------------------------------------------------------
-- 8. Friend Groups (V2)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS friend_groups (
  id SERIAL PRIMARY KEY,
  owner_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(120) NOT NULL,
  plan JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS friend_group_members (
  id SERIAL PRIMARY KEY,
  group_id INT NOT NULL REFERENCES friend_groups(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (group_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_friend_groups_owner ON friend_groups (owner_id);
CREATE INDEX IF NOT EXISTS idx_friend_group_members_group ON friend_group_members (group_id);
CREATE INDEX IF NOT EXISTS idx_friend_group_members_user ON friend_group_members (user_id);

-- ------------------------------------------------------------
-- 9. Web Push subscriptions (V2)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notification_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  puja_id INT REFERENCES pujas(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notification_subscriptions_user ON notification_subscriptions (user_id);
CREATE INDEX IF NOT EXISTS idx_notification_subscriptions_puja ON notification_subscriptions (puja_id);

-- ------------------------------------------------------------
-- 10. Community photo wall (V3-lite)
-- Images are stored in Cloudinary; PostgreSQL stores only metadata/URL.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS photo_posts (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  puja_id INT REFERENCES pujas(id) ON DELETE SET NULL,
  image_url TEXT NOT NULL,
  caption VARCHAR(280),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_photo_posts_created ON photo_posts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_photo_posts_puja ON photo_posts (puja_id, created_at DESC);


-- ------------------------------------------------------------
-- 11. Puja Blog (V4)
-- User-written Puja experiences; optional cover image and pandal tag.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS blog_posts (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  puja_id INT REFERENCES pujas(id) ON DELETE SET NULL,
  title VARCHAR(180) NOT NULL,
  content TEXT NOT NULL,
  cover_image_url TEXT,
  is_sample BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created ON blog_posts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_puja ON blog_posts (puja_id, created_at DESC);

-- ------------------------------------------------------------
-- 12. Public missing-pandal suggestions
-- Suggestions are reviewed before becoming public pandal records.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pandal_suggestions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(180) NOT NULL,
  area VARCHAR(180) NOT NULL,
  description TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  region VARCHAR(40) NOT NULL DEFAULT 'OTHER',
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_pandal_suggestions_status_created ON pandal_suggestions (status, created_at DESC);
