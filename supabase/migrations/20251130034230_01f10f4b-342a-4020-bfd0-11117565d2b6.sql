-- Make handle_new_user function completely non-blocking
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Try to insert profile, but don't fail if it errors
  BEGIN
    INSERT INTO public.profiles (id, email)
    VALUES (NEW.id, NEW.email)
    ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
  EXCEPTION 
    WHEN OTHERS THEN
      -- Just log and continue - never block user creation
      RAISE WARNING 'Profile creation failed for user %: %', NEW.email, SQLERRM;
  END;
  
  -- Always return NEW to allow the auth user creation to complete
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Even if everything fails, still return NEW
    RAISE WARNING 'handle_new_user failed completely: %', SQLERRM;
    RETURN NEW;
END;
$$;