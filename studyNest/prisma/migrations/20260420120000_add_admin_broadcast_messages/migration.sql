-- Creates admin broadcast table for scheduled student messages
CREATE TABLE IF NOT EXISTS admin_broadcast_messages (
  message_id SERIAL PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by VARCHAR(120) NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_messages_active_time
ON admin_broadcast_messages (is_active, scheduled_at DESC);
