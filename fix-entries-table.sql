-- Fix entries table schema and RLS policies
-- This ensures the entries table has all required columns and proper policies

-- First, check if the entries table exists and has the correct structure
DO $$ 
BEGIN
    -- Add any missing columns (if they don't exist)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'entries' AND column_name = 'phase_1_url') THEN
        ALTER TABLE entries ADD COLUMN phase_1_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'entries' AND column_name = 'phase_2_url') THEN
        ALTER TABLE entries ADD COLUMN phase_2_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'entries' AND column_name = 'phase_3_url') THEN
        ALTER TABLE entries ADD COLUMN phase_3_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'entries' AND column_name = 'phase_4_url') THEN
        ALTER TABLE entries ADD COLUMN phase_4_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'entries' AND column_name = 'status') THEN
        ALTER TABLE entries ADD COLUMN status TEXT NOT NULL DEFAULT 'draft';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'entries' AND column_name = 'rejection_reason') THEN
        ALTER TABLE entries ADD COLUMN rejection_reason TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'entries' AND column_name = 'vote_count') THEN
        ALTER TABLE entries ADD COLUMN vote_count INTEGER NOT NULL DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'entries' AND column_name = 'final_rank') THEN
        ALTER TABLE entries ADD COLUMN final_rank INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'entries' AND column_name = 'submitted_at') THEN
        ALTER TABLE entries ADD COLUMN submitted_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'entries' AND column_name = 'approved_at') THEN
        ALTER TABLE entries ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view approved entries" ON entries;
DROP POLICY IF EXISTS "Users can insert own entries" ON entries;
DROP POLICY IF EXISTS "Users can update own entries" ON entries;
DROP POLICY IF EXISTS "Admins can update any entry" ON entries;
DROP POLICY IF EXISTS "Admins can view all entries" ON entries;

-- Enable RLS
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "Users can view approved entries or own entries"
ON entries
FOR SELECT
USING (status = 'approved' OR user_id = auth.uid());

CREATE POLICY "Admins can view all entries"
ON entries
FOR SELECT
USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Users can insert own entries"
ON entries
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own entries"
ON entries
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can update any entry"
ON entries
FOR UPDATE
USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can delete entries"
ON entries
FOR DELETE
USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
