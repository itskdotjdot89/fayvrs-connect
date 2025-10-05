-- Create storage bucket for request images
INSERT INTO storage.buckets (id, name, public)
VALUES ('request-images', 'request-images', true);

-- Create policy for authenticated users to upload their own request images
CREATE POLICY "Users can upload request images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'request-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policy for public read access to request images
CREATE POLICY "Request images are publicly accessible"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'request-images');

-- Create policy for users to delete their own request images
CREATE POLICY "Users can delete their own request images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'request-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Add images column to requests table
ALTER TABLE public.requests
ADD COLUMN images TEXT[] DEFAULT '{}';

-- Add comment to document the column
COMMENT ON COLUMN public.requests.images IS 'Array of storage URLs for uploaded images';