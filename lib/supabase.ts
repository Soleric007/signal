import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client with elevated privileges
export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

// ─── Database Schema SQL (run in Supabase SQL editor) ─────────────────────────
// Stored here for reference - paste into supabase.com → SQL Editor
export const SCHEMA_SQL = `
-- Predictions table
CREATE TABLE IF NOT EXISTS predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'tech',
  status TEXT NOT NULL DEFAULT 'pending',
  created_by TEXT NOT NULL DEFAULT 'anonymous',
  closes_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '30 days',
  vote_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Battle messages (AI agent arguments)
CREATE TABLE IF NOT EXISTS battle_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id UUID REFERENCES predictions(id) ON DELETE CASCADE,
  agent_id TEXT NOT NULL,
  content TEXT NOT NULL,
  confidence INTEGER NOT NULL DEFAULT 50,
  round INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Confidence history snapshots
CREATE TABLE IF NOT EXISTS confidence_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id UUID REFERENCES predictions(id) ON DELETE CASCADE,
  round INTEGER NOT NULL,
  values JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Votes
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id UUID REFERENCES predictions(id) ON DELETE CASCADE,
  agent_id TEXT NOT NULL,
  user_session TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(battle_id, user_session)
);

-- Enable realtime for battle_messages
ALTER PUBLICATION supabase_realtime ADD TABLE battle_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE confidence_snapshots;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_messages_battle ON battle_messages(battle_id, created_at);
CREATE INDEX IF NOT EXISTS idx_predictions_status ON predictions(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_votes_battle ON votes(battle_id);

-- RLS Policies (allow reads, restrict writes to service role)
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE confidence_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read predictions" ON predictions FOR SELECT USING (true);
CREATE POLICY "Public read messages" ON battle_messages FOR SELECT USING (true);
CREATE POLICY "Public read snapshots" ON confidence_snapshots FOR SELECT USING (true);
CREATE POLICY "Public read votes" ON votes FOR SELECT USING (true);
CREATE POLICY "Public insert votes" ON votes FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert predictions" ON predictions FOR INSERT WITH CHECK (true);
`
