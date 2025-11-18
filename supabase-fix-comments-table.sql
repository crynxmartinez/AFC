-- ============================================
-- FIX COMMENTS TABLE STRUCTURE
-- ============================================

-- First, let's see what columns exist
-- Run this to check: SELECT column_name FROM information_schema.columns WHERE table_name = 'comments';

-- Drop the old comments table if it has wrong structure
DROP TABLE IF EXISTS comments CASCADE;

-- Create the correct comments table
CREATE TABLE comments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  entry_id uuid REFERENCES entries(id) ON DELETE CASCADE NOT NULL,
  parent_comment_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  edited BOOLEAN DEFAULT false,
  edited_at timestamp,
  created_at timestamp DEFAULT now()
);

-- Indexes for comments
CREATE INDEX idx_comments_entry ON comments(entry_id);
CREATE INDEX idx_comments_user ON comments(user_id);
CREATE INDEX idx_comments_parent ON comments(parent_comment_id);

-- RLS policies for comments
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments"
ON comments FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can add comments"
ON comments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
ON comments FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
ON comments FOR DELETE
USING (auth.uid() = user_id);
