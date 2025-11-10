-- Add moderation columns to requests table
ALTER TABLE public.requests 
ADD COLUMN moderation_status TEXT DEFAULT 'approved' CHECK (moderation_status IN ('approved', 'pending', 'rejected', 'flagged')),
ADD COLUMN moderation_notes TEXT,
ADD COLUMN flagged_reason TEXT,
ADD COLUMN moderated_by UUID REFERENCES public.profiles(id),
ADD COLUMN moderated_at TIMESTAMP WITH TIME ZONE;

-- Create index for admin queries
CREATE INDEX idx_requests_moderation_status ON public.requests(moderation_status);

-- Update RLS policy to hide rejected requests from public feed
DROP POLICY IF EXISTS "Anyone can view open requests" ON public.requests;

CREATE POLICY "Anyone can view approved/flagged open requests" 
ON public.requests 
FOR SELECT 
USING (
  (status = 'open' AND moderation_status IN ('approved', 'flagged'))
  OR user_id = auth.uid()
);

-- Drop existing admin policies if they exist
DROP POLICY IF EXISTS "Admins can view all requests" ON public.requests;
DROP POLICY IF EXISTS "Admins can update moderation fields" ON public.requests;

-- Policy for admins to view all requests (check user_roles table)
CREATE POLICY "Admins can view all requests" 
ON public.requests 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Policy for admins to update moderation fields
CREATE POLICY "Admins can update moderation fields" 
ON public.requests 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);