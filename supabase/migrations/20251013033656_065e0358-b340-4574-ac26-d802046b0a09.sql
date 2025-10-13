-- Security Fix: Restrict PII access in profiles table
-- Drop the overly permissive anonymous policy
DROP POLICY IF EXISTS "Anonymous users can view public profiles" ON public.profiles;

-- Update the policy for viewing other users' profiles to exclude sensitive PII
-- Note: RLS doesn't support column-level filtering, so this must be enforced in application layer
-- This policy just ensures authentication is required
DROP POLICY IF EXISTS "Users can view other public profiles" ON public.profiles;

CREATE POLICY "Authenticated users can view public profile fields"
ON public.profiles FOR SELECT
USING (
  auth.uid() IS NOT NULL AND 
  auth.uid() <> id
);

-- Add comment to remind developers to filter fields in application layer
COMMENT ON POLICY "Authenticated users can view public profile fields" ON public.profiles IS 
'IMPORTANT: When querying other users profiles, only select public fields: id, full_name, avatar_url, location (text only, NOT latitude/longitude), bio, is_verified, role. NEVER include: email, phone, latitude, longitude';

-- Ensure users can still view their own complete profile
-- This policy already exists but let's make it explicit
DROP POLICY IF EXISTS "Users can view own complete profile" ON public.profiles;

CREATE POLICY "Users can view own complete profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- Add validation trigger for handle_new_user to sanitize inputs
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  clean_name text;
  user_role app_role;
BEGIN
  -- Validate and sanitize full_name (remove potentially dangerous characters)
  clean_name := COALESCE(
    regexp_replace(
      TRIM(NEW.raw_user_meta_data->>'full_name'),
      '[^a-zA-Z0-9\s\-.'']',
      '',
      'g'
    ),
    ''
  );
  
  -- Enforce name length limits
  IF length(clean_name) > 100 THEN
    clean_name := substring(clean_name, 1, 100);
  END IF;
  
  -- Only allow 'requester' or 'provider' roles from signup
  -- Never allow direct admin or other role assignment
  user_role := COALESCE(
    (NEW.raw_user_meta_data->>'role')::app_role,
    'requester'
  );
  
  IF user_role NOT IN ('requester', 'provider') THEN
    user_role := 'requester';
  END IF;
  
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    clean_name,
    user_role
  );
  
  -- Also insert into user_roles
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    user_role
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;