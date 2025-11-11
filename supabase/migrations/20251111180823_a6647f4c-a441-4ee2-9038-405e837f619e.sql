-- Ensure homework-images bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('homework-images', 'homework-images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Authenticated users can upload homework images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view homework images" ON storage.objects;

-- Create RLS policies for homework-images bucket
CREATE POLICY "Authenticated users can upload homework images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'homework-images');

CREATE POLICY "Anyone can view homework images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'homework-images');

-- Add embed_code column to games table for embedded games
ALTER TABLE games ADD COLUMN IF NOT EXISTS embed_code text;

-- Create featured_images table for homepage customization
CREATE TABLE IF NOT EXISTS featured_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on featured_images
ALTER TABLE featured_images ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view featured images" ON featured_images;
DROP POLICY IF EXISTS "Admins can insert featured images" ON featured_images;
DROP POLICY IF EXISTS "Admins can update featured images" ON featured_images;
DROP POLICY IF EXISTS "Admins can delete featured images" ON featured_images;

-- Create policies for featured_images
CREATE POLICY "Anyone can view featured images"
ON featured_images FOR SELECT
TO public
USING (true);

CREATE POLICY "Admins can insert featured images"
ON featured_images FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update featured images"
ON featured_images FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete featured images"
ON featured_images FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));