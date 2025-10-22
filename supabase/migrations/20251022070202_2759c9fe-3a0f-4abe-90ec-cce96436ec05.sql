-- Update handle_new_user() to assign BOTH roles automatically for dual-role system
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  clean_name text;
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
  
  -- Insert into profiles WITHOUT role column
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    clean_name
  );
  
  -- Insert BOTH roles automatically (dual-role system)
  -- Every user can browse and post requests (requester) and view feed as provider
  -- Provider features are gated by verification + subscription
  INSERT INTO public.user_roles (user_id, role)
  VALUES 
    (NEW.id, 'requester'),
    (NEW.id, 'provider');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;