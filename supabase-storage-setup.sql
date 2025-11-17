-- Supabase Storage Buckets Setup for AFC
-- Run this in your Supabase SQL Editor

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('contest-thumbnails', 'contest-thumbnails', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('entry-artworks', 'entry-artworks', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('user-avatars', 'user-avatars', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for contest-thumbnails
CREATE POLICY "Anyone can view contest thumbnails"
ON storage.objects FOR SELECT
USING (bucket_id = 'contest-thumbnails');

CREATE POLICY "Admins can upload contest thumbnails"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'contest-thumbnails' AND
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can update contest thumbnails"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'contest-thumbnails' AND
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can delete contest thumbnails"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'contest-thumbnails' AND
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Storage policies for entry-artworks
CREATE POLICY "Anyone can view entry artworks"
ON storage.objects FOR SELECT
USING (bucket_id = 'entry-artworks');

CREATE POLICY "Users can upload their own entry artworks"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'entry-artworks' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own entry artworks"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'entry-artworks' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own entry artworks"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'entry-artworks' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policies for user-avatars
CREATE POLICY "Anyone can view user avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'user-avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'user-avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'user-avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'user-avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
