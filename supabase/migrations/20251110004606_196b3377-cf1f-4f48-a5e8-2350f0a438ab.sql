-- Create storage bucket for homework images
INSERT INTO storage.buckets (id, name, public)
VALUES ('homework-images', 'homework-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for homework images
CREATE POLICY "Anyone can view homework images"
ON storage.objects FOR SELECT
USING (bucket_id = 'homework-images');

CREATE POLICY "Authenticated users can upload homework images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'homework-images' 
  AND auth.uid() IS NOT NULL
);