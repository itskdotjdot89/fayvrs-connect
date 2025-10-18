-- Fix 1: Remove role column from profiles table (privilege escalation risk)
-- This column creates a dual source of truth with user_roles table
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;

-- Fix 2: Update handle_new_user() function to not insert role into profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  clean_name text;
  user_role app_role;
BEGIN
  -- Validate and sanitize full_name
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
  user_role := COALESCE(
    (NEW.raw_user_meta_data->>'role')::app_role,
    'requester'
  );
  
  IF user_role NOT IN ('requester', 'provider') THEN
    user_role := 'requester';
  END IF;
  
  -- Insert into profiles WITHOUT role column
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    clean_name
  );
  
  -- Insert into user_roles (ONLY source of truth for roles)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    user_role
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;