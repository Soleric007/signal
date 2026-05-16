-- ================================================================
-- SIGNAL - Supabase Database Schema
-- Paste this entire file into: Supabase Dashboard → SQL Editor → Run
-- ================================================================

-- 1. Predictions (battles)
CREATE TABLE IF NOT EXISTS predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'tech',
  status TEXT NOT NULL DEFAULT 'pending',  -- pending | live | resolving | resolved
  created_by TEXT NOT NULL DEFAULT 'anonymous',
  closes_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '30 days',
  vote_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  winner_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Battle messages (AI arguments)
CREATE TABLE IF NOT EXISTS battle_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id UUID NOT NULL REFERENCES predictions(id) ON DELETE CASCADE,
  agent_id TEXT NOT NULL,
  content TEXT NOT NULL,
  confidence INTEGER NOT NULL DEFAULT 50 CHECK (confidence >= 0 AND confidence <= 100),
  round INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Confidence snapshots for charting
CREATE TABLE IF NOT EXISTS confidence_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id UUID NOT NULL REFERENCES predictions(id) ON DELETE CASCADE,
  round INTEGER NOT NULL,
  values JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. User votes
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id UUID NOT NULL REFERENCES predictions(id) ON DELETE CASCADE,
  agent_id TEXT NOT NULL,
  user_session TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(battle_id, user_session)
);

-- ================================================================
-- Indexes
-- ================================================================
CREATE INDEX IF NOT EXISTS idx_predictions_status ON predictions(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_predictions_category ON predictions(category, status);
CREATE INDEX IF NOT EXISTS idx_messages_battle_id ON battle_messages(battle_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_agent ON battle_messages(agent_id);
CREATE INDEX IF NOT EXISTS idx_snapshots_battle ON confidence_snapshots(battle_id, round);
CREATE INDEX IF NOT EXISTS idx_votes_battle ON votes(battle_id);
CREATE INDEX IF NOT EXISTS idx_votes_session ON votes(user_session);

-- ================================================================
-- Row Level Security
-- ================================================================
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE confidence_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "public_read_predictions" ON predictions FOR SELECT USING (true);
CREATE POLICY "public_read_messages" ON battle_messages FOR SELECT USING (true);
CREATE POLICY "public_read_snapshots" ON confidence_snapshots FOR SELECT USING (true);
CREATE POLICY "public_read_votes" ON votes FOR SELECT USING (true);

-- Public write (no auth required for hackathon - lock down later)
CREATE POLICY "public_insert_predictions" ON predictions FOR INSERT WITH CHECK (true);
CREATE POLICY "public_insert_votes" ON votes FOR INSERT WITH CHECK (true);
CREATE POLICY "public_upsert_votes" ON votes FOR UPDATE WITH CHECK (true);

-- ================================================================
-- Helper function: increment vote count
-- ================================================================
CREATE OR REPLACE FUNCTION increment_vote_count(prediction_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE predictions
  SET vote_count = vote_count + 1,
      updated_at = NOW()
  WHERE id = prediction_id;
END;
$$;

-- ================================================================
-- Realtime subscriptions (enable for live updates)
-- ================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE battle_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE confidence_snapshots;
ALTER PUBLICATION supabase_realtime ADD TABLE votes;

-- ================================================================
-- Seed data: Sample battles for demo
-- ================================================================
INSERT INTO predictions (id, topic, category, status, vote_count, view_count, closes_at) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Will Bitcoin hit $150k before September 2025?', 'crypto', 'live', 2847, 18420, NOW() + INTERVAL '30 days'),
  ('22222222-2222-2222-2222-222222222222', 'Will Apple release AI glasses in 2025?', 'tech', 'live', 1923, 12300, NOW() + INTERVAL '60 days'),
  ('33333333-3333-3333-3333-333333333333', 'Will AI replace junior developers by 2027?', 'tech', 'live', 5621, 34100, NOW() + INTERVAL '90 days'),
  ('44444444-4444-4444-4444-444444444444', 'Will Elon Musk leave X/Twitter by end of 2025?', 'culture', 'live', 7203, 52000, NOW() + INTERVAL '45 days'),
  ('55555555-5555-5555-5555-555555555555', 'Will a major US bank collapse in 2025?', 'finance', 'live', 3312, 21500, NOW() + INTERVAL '120 days'),
  ('66666666-6666-6666-6666-666666666666', 'Will GPT-5 be released before summer 2025?', 'tech', 'resolved', 9841, 78200, NOW() - INTERVAL '5 days')
ON CONFLICT (id) DO NOTHING;
