-- ============================================================
-- Get Parade Ready — A/B Test — Supabase Schema
-- Run this in your Supabase project: SQL Editor → New query
-- ============================================================

CREATE TABLE sessions (
  id                   UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at           TIMESTAMPTZ DEFAULT NOW(),

  -- Which version participants saw first
  order_shown          TEXT NOT NULL CHECK (order_shown IN ('A_first', 'B_first')),

  -- ── Version A (Full vocal crowd track) ──────────────────
  emotional_response_a INTEGER CHECK (emotional_response_a BETWEEN 1 AND 5),
  share_intent_a       TEXT    CHECK (share_intent_a IN ('Yes', 'Maybe', 'No')),
  purchase_intent_a    INTEGER CHECK (purchase_intent_a BETWEEN 1 AND 5),
  open_comment_a       TEXT,

  did_play_a           BOOLEAN DEFAULT FALSE,
  replay_count_a       INTEGER DEFAULT 0,
  watched_to_end_a     BOOLEAN DEFAULT FALSE,

  -- ── Version B (Instrumental-only track) ─────────────────
  emotional_response_b INTEGER CHECK (emotional_response_b BETWEEN 1 AND 5),
  share_intent_b       TEXT    CHECK (share_intent_b IN ('Yes', 'Maybe', 'No')),
  purchase_intent_b    INTEGER CHECK (purchase_intent_b BETWEEN 1 AND 5),
  open_comment_b       TEXT,

  did_play_b           BOOLEAN DEFAULT FALSE,
  replay_count_b       INTEGER DEFAULT 0,
  watched_to_end_b     BOOLEAN DEFAULT FALSE,

  -- ── Final preference ────────────────────────────────────
  final_preference     TEXT CHECK (final_preference IN ('A', 'B')),
  final_comment        TEXT,

  completed            BOOLEAN DEFAULT FALSE
);

-- ── Row Level Security ───────────────────────────────────────────────────
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Anyone (anonymous users) can insert a completed session
CREATE POLICY "Allow public inserts"
  ON sessions FOR INSERT TO anon
  WITH CHECK (true);

-- Anyone can read sessions (dashboard uses anon key + its own password gate)
CREATE POLICY "Allow public reads"
  ON sessions FOR SELECT TO anon
  USING (true);
