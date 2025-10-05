-- Create table for identity verification
CREATE TABLE public.identity_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  id_document_url text,
  selfie_url text,
  submitted_at timestamp with time zone DEFAULT now(),
  reviewed_at timestamp with time zone,
  reviewer_notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.identity_verifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own verification
CREATE POLICY "Users can view own verification"
ON public.identity_verifications
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own verification
CREATE POLICY "Users can insert own verification"
ON public.identity_verifications
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending verification
CREATE POLICY "Users can update own pending verification"
ON public.identity_verifications
FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending');

-- Create storage bucket for verification documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('verification-documents', 'verification-documents', false);

-- Allow authenticated users to upload their verification documents
CREATE POLICY "Users can upload own verification documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'verification-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to view their own verification documents
CREATE POLICY "Users can view own verification documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'verification-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);