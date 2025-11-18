-- Add missing id column to follows table
ALTER TABLE follows
ADD COLUMN IF NOT EXISTS id UUID DEFAULT uuid_generate_v4();

-- Make it primary key if not already
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'follows_pkey'
  ) THEN
    ALTER TABLE follows ADD PRIMARY KEY (id);
  END IF;
END $$;
