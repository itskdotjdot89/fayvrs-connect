-- Fix 1: Add storage policy for admins to view verification documents
CREATE POLICY "Admins can view all verification documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'verification-documents' AND
  public.has_role(auth.uid(), 'admin')
);

-- Fix 2: Create rate limiting table for geocoding endpoints
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  count INTEGER NOT NULL DEFAULT 1,
  last_request TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_rate_limits_key ON public.rate_limits(key);
CREATE INDEX IF NOT EXISTS idx_rate_limits_last_request ON public.rate_limits(last_request);

-- Enable RLS on rate_limits table
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Policy: Allow edge functions to manage rate limits (no user access needed)
CREATE POLICY "Service role can manage rate limits"
ON public.rate_limits
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Cleanup function: Remove old rate limit entries (older than 1 hour)
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.rate_limits
  WHERE last_request < NOW() - INTERVAL '1 hour';
END;
$$;