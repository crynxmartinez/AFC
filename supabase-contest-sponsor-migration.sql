-- ============================================
-- CONTEST SPONSOR MIGRATION
-- Add sponsor fields to contests table
-- ============================================

-- Add sponsor columns to contests table
ALTER TABLE contests
ADD COLUMN IF NOT EXISTS has_sponsor BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS sponsor_name TEXT,
ADD COLUMN IF NOT EXISTS sponsor_logo_url TEXT,
ADD COLUMN IF NOT EXISTS sponsor_prize_amount DECIMAL(10, 2) DEFAULT 0;

-- Create sponsor_logos storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('sponsor-logos', 'sponsor-logos', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for sponsor-logos bucket
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Admins can upload sponsor logos'
  ) THEN
    CREATE POLICY "Admins can upload sponsor logos"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'sponsor-logos' AND
      (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Anyone can view sponsor logos'
  ) THEN
    CREATE POLICY "Anyone can view sponsor logos"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'sponsor-logos');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Admins can update sponsor logos'
  ) THEN
    CREATE POLICY "Admins can update sponsor logos"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
      bucket_id = 'sponsor-logos' AND
      (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Admins can delete sponsor logos'
  ) THEN
    CREATE POLICY "Admins can delete sponsor logos"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
      bucket_id = 'sponsor-logos' AND
      (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
    );
  END IF;
END $$;

-- Add comment
COMMENT ON COLUMN contests.has_sponsor IS 'Whether this contest has a sponsor';
COMMENT ON COLUMN contests.sponsor_name IS 'Name of the sponsor';
COMMENT ON COLUMN contests.sponsor_logo_url IS 'URL to sponsor logo image';
COMMENT ON COLUMN contests.sponsor_prize_amount IS 'Additional prize amount from sponsor';
