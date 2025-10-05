-- Add tags column to requests table for AI-extracted keywords
ALTER TABLE public.requests 
ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb;

-- Add index on tags column for better query performance
CREATE INDEX IF NOT EXISTS idx_requests_tags ON public.requests USING GIN(tags);