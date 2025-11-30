-- Make the founder notification trigger more resilient
-- Drop and recreate with better error handling

DROP TRIGGER IF EXISTS on_user_signup_notify_founder ON public.profiles;

CREATE OR REPLACE FUNCTION public.trigger_founder_new_user_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only send notification if not a demo account
  IF NEW.email NOT LIKE '%demo-%' THEN
    BEGIN
      PERFORM notify_founder(
        p_event_type := 'New User Registration',
        p_urgency := 'info',
        p_title := 'New User Signup',
        p_message := 'A new user has registered on the platform.',
        p_user_id := NEW.id,
        p_user_email := NEW.email,
        p_metadata := jsonb_build_object(
          'Full Name', COALESCE(NEW.full_name, 'Not provided'),
          'Location', COALESCE(NEW.location, 'Not provided'),
          'Phone', COALESCE(NEW.phone, 'Not provided')
        )
      );
    EXCEPTION WHEN OTHERS THEN
      -- Silently fail - don't block user creation
      RAISE WARNING 'Founder notification failed for user %: %', NEW.email, SQLERRM;
    END;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_user_signup_notify_founder
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION trigger_founder_new_user_signup();