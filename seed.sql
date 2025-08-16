-- seed.sql
-- Database schema and seed data for subscription cancellation flow
-- Does not include production-level optimizations or advanced RLS policies

-- Enable Row Level Security

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  monthly_price INTEGER NOT NULL, -- Price in USD cents
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending_cancellation', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cancellations table
CREATE TABLE IF NOT EXISTS cancellations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  downsell_variant TEXT NOT NULL CHECK (downsell_variant IN ('A', 'B')),
  reason TEXT,
  accepted_downsell BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- extend cancellations table
ALTER TABLE cancellations
  ADD COLUMN IF NOT EXISTS path            TEXT CHECK (path IN ('not_yet','found_job')),
  ADD COLUMN IF NOT EXISTS reason_key      TEXT CHECK (reason_key IN ('too_expensive','not_helpful','not_enough','not_moving','other')),
  ADD COLUMN IF NOT EXISTS reason_text     TEXT,          -- freeform explanation if user cancels
  ADD COLUMN IF NOT EXISTS feedback_text   TEXT,          -- “what could we improve?” on found-job flow
  ADD COLUMN IF NOT EXISTS found_with_mm   BOOLEAN,       -- found job via Migrate Mate?
  ADD COLUMN IF NOT EXISTS has_lawyer      BOOLEAN,       -- company providing immigration lawyer?
  ADD COLUMN IF NOT EXISTS visa_type       TEXT CHECK (char_length(visa_type) <= 120),
  ADD COLUMN IF NOT EXISTS needs_visa_help BOOLEAN;       -- convenience flag


-- indexes for optimized performance
CREATE INDEX IF NOT EXISTS cxl_user_idx ON cancellations (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS cxl_sub_idx  ON cancellations (subscription_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cancellations ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (candidates should enhance these)
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cancellations" ON cancellations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own cancellations" ON cancellations
  FOR SELECT USING (auth.uid() = user_id);




-- Additional RLS policies
-- Replace the current insert/select policies on cancellations
DROP POLICY IF EXISTS "Users can insert own cancellations" ON cancellations;
DROP POLICY IF EXISTS "Users can view own cancellations"   ON cancellations;

CREATE POLICY "Insert cancellation only for own subscription"
ON cancellations
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM subscriptions s
    WHERE s.id = subscription_id AND s.user_id = auth.uid()
  )
);

CREATE POLICY "Select own cancellations (via subscription ownership)"
ON cancellations
FOR SELECT
USING (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM subscriptions s
    WHERE s.id = subscription_id AND s.user_id = auth.uid()
  )
);

-- Seed data
INSERT INTO users (id, email) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'user1@example.com'),
  ('550e8400-e29b-41d4-a716-446655440002', 'user2@example.com'),
  ('550e8400-e29b-41d4-a716-446655440003', 'user3@example.com')
ON CONFLICT (email) DO NOTHING;

-- Seed subscriptions with $25 and $29 plans
INSERT INTO subscriptions (user_id, monthly_price, status) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 2500, 'active'), -- $25.00
  ('550e8400-e29b-41d4-a716-446655440002', 2900, 'active'), -- $29.00
  ('550e8400-e29b-41d4-a716-446655440003', 2500, 'active')  -- $25.00
ON CONFLICT DO NOTHING; 