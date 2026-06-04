CREATE TABLE IF NOT EXISTS contacts (
  id SERIAL PRIMARY KEY,
  telegram_id BIGINT UNIQUE NOT NULL,
  username TEXT,
  first_name TEXT,
  segment TEXT NOT NULL DEFAULT 'lead' CHECK (segment IN ('lead','client','cold','blocked')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  source TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_message_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS broadcast_log (
  id SERIAL PRIMARY KEY,
  broadcast_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  segment TEXT NOT NULL,
  message TEXT NOT NULL,
  total_sent INTEGER NOT NULL DEFAULT 0,
  total_failed INTEGER NOT NULL DEFAULT 0
);
