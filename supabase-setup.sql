-- Chạy trong Supabase → SQL Editor

CREATE TABLE IF NOT EXISTS pubg_users (
  username TEXT PRIMARY KEY,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE pubg_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_all" ON pubg_users;
CREATE POLICY "allow_all" ON pubg_users
  FOR ALL USING (true) WITH CHECK (true);
