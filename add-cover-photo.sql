-- ============================================
-- ADD COVER PHOTO TO USER PROFILES
-- ============================================
-- Adds cover_photo_url column and storage bucket for profile banners

-- Step 1: Add cover_photo_url column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS cover_photo_url TEXT;

-- Step 2: Create storage bucket for cover photos
-- Run this in Supabase Dashboard → Storage → Create Bucket
-- Bucket name: cover-photos
-- Public: Yes

-- Step 3: Storage policies for cover photos
-- Allow users to upload their own cover photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('cover-photos', 'cover-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload own cover photo" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own cover photo" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own cover photo" ON storage.objects;
DROP POLICY IF EXISTS "Public can view cover photos" ON storage.objects;

-- Allow users to upload their own cover photos
CREATE POLICY "Users can upload own cover photo"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'cover-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own cover photos
CREATE POLICY "Users can update own cover photo"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'cover-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own cover photos
CREATE POLICY "Users can delete own cover photo"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'cover-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access to cover photos
CREATE POLICY "Public can view cover photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'cover-photos');

-- Step 4: Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_cover_photo 
ON users(cover_photo_url) 
WHERE cover_photo_url IS NOT NULL;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name = 'cover_photo_url';

-- Check storage bucket
SELECT * FROM storage.buckets WHERE id = 'cover-photos';
