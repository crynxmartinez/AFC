-- Migration: Remaining Features
-- Run this in Supabase SQL Editor

-- Comment Pinning
ALTER TABLE entry_comments ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false;
ALTER TABLE entry_comments ADD COLUMN IF NOT EXISTS pinned_at TIMESTAMPTZ;

-- Comment Mentions (track mentioned users for notifications)
ALTER TABLE entry_comments ADD COLUMN IF NOT EXISTS mentioned_users UUID[] DEFAULT '{}';

-- Index for faster pinned comment queries
CREATE INDEX IF NOT EXISTS idx_entry_comments_pinned ON entry_comments(entry_id, is_pinned) WHERE is_pinned = true;
