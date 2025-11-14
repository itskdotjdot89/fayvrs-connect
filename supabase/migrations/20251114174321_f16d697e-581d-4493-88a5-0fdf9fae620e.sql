-- Create function to notify founder via webhook
CREATE OR REPLACE FUNCTION notify_founder(
  p_event_type TEXT,
  p_urgency TEXT,
  p_title TEXT,
  p_message TEXT,
  p_user_id UUID DEFAULT NULL,
  p_user_email TEXT DEFAULT NULL,
  p_related_id TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_supabase_url TEXT;
  v_service_role_key TEXT;
  v_request_id BIGINT;
BEGIN
  -- Get Supabase URL from environment
  v_supabase_url := current_setting('app.settings.supabase_url', true);
  v_service_role_key := current_setting('app.settings.service_role_key', true);
  
  -- Use Supabase URL from pg_net
  SELECT net.http_post(
    url := v_supabase_url || '/functions/v1/send-founder-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_service_role_key
    ),
    body := jsonb_build_object(
      'event_type', p_event_type,
      'urgency', p_urgency,
      'title', p_title,
      'message', p_message,
      'user_id', p_user_id,
      'user_email', p_user_email,
      'related_id', p_related_id,
      'metadata', p_metadata
    )
  ) INTO v_request_id;
  
  -- Log the notification attempt
  RAISE NOTICE 'Founder notification queued: % (Request ID: %)', p_title, v_request_id;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the transaction
    RAISE WARNING 'Failed to send founder notification: %', SQLERRM;
END;
$$;

-- Trigger: New User Signup
CREATE OR REPLACE FUNCTION trigger_founder_new_user_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_user_signup_notify_founder ON public.profiles;
CREATE TRIGGER on_user_signup_notify_founder
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION trigger_founder_new_user_signup();

-- Trigger: Identity Verification Submitted
CREATE OR REPLACE FUNCTION trigger_founder_verification_submitted()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_email TEXT;
BEGIN
  -- Get user email
  SELECT email INTO v_user_email
  FROM public.profiles
  WHERE id = NEW.user_id;
  
  PERFORM notify_founder(
    p_event_type := 'Identity Verification Submitted',
    p_urgency := 'urgent',
    p_title := 'New Identity Verification - Action Required',
    p_message := 'A user has submitted identity verification documents for review.',
    p_user_id := NEW.user_id,
    p_user_email := v_user_email,
    p_related_id := NEW.id::TEXT,
    p_metadata := jsonb_build_object(
      'Verification ID', NEW.id,
      'Status', NEW.status,
      'Submitted At', NEW.submitted_at
    )
  );
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_verification_submitted_notify_founder ON public.identity_verifications;
CREATE TRIGGER on_verification_submitted_notify_founder
  AFTER INSERT ON public.identity_verifications
  FOR EACH ROW
  WHEN (NEW.status = 'pending')
  EXECUTE FUNCTION trigger_founder_verification_submitted();

-- Trigger: New Service Request Posted
CREATE OR REPLACE FUNCTION trigger_founder_new_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_email TEXT;
  v_user_name TEXT;
BEGIN
  -- Get user details
  SELECT email, full_name INTO v_user_email, v_user_name
  FROM public.profiles
  WHERE id = NEW.user_id;
  
  PERFORM notify_founder(
    p_event_type := 'New Service Request Posted',
    p_urgency := 'info',
    p_title := 'New Service Request',
    p_message := 'A new service request has been posted: ' || NEW.title,
    p_user_id := NEW.user_id,
    p_user_email := v_user_email,
    p_related_id := NEW.id::TEXT,
    p_metadata := jsonb_build_object(
      'Request ID', NEW.id,
      'Title', NEW.title,
      'Category', COALESCE(NEW.category, 'Not specified'),
      'Budget Min', COALESCE(NEW.budget_min::TEXT, 'Not set'),
      'Budget Max', COALESCE(NEW.budget_max::TEXT, 'Not set'),
      'Location', COALESCE(NEW.location, 'Not specified'),
      'Request Type', NEW.request_type
    )
  );
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_request_created_notify_founder ON public.requests;
CREATE TRIGGER on_request_created_notify_founder
  AFTER INSERT ON public.requests
  FOR EACH ROW
  EXECUTE FUNCTION trigger_founder_new_request();

-- Trigger: New Proposal Submitted
CREATE OR REPLACE FUNCTION trigger_founder_new_proposal()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_provider_email TEXT;
  v_provider_name TEXT;
  v_request_title TEXT;
BEGIN
  -- Get provider details
  SELECT email, full_name INTO v_provider_email, v_provider_name
  FROM public.profiles
  WHERE id = NEW.provider_id;
  
  -- Get request title
  SELECT title INTO v_request_title
  FROM public.requests
  WHERE id = NEW.request_id;
  
  PERFORM notify_founder(
    p_event_type := 'New Proposal Submitted',
    p_urgency := 'info',
    p_title := 'New Proposal',
    p_message := 'A provider has submitted a proposal for: ' || v_request_title,
    p_user_id := NEW.provider_id,
    p_user_email := v_provider_email,
    p_related_id := NEW.id::TEXT,
    p_metadata := jsonb_build_object(
      'Proposal ID', NEW.id,
      'Provider Name', COALESCE(v_provider_name, 'Unknown'),
      'Request', v_request_title,
      'Bid Amount', COALESCE(NEW.price::TEXT, 'Not specified'),
      'Message Preview', LEFT(NEW.message, 100)
    )
  );
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_proposal_created_notify_founder ON public.proposals;
CREATE TRIGGER on_proposal_created_notify_founder
  AFTER INSERT ON public.proposals
  FOR EACH ROW
  EXECUTE FUNCTION trigger_founder_new_proposal();

-- Trigger: Proposal Accepted
CREATE OR REPLACE FUNCTION trigger_founder_proposal_accepted()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_provider_email TEXT;
  v_provider_name TEXT;
  v_request_title TEXT;
  v_requester_email TEXT;
BEGIN
  -- Get provider details
  SELECT email, full_name INTO v_provider_email, v_provider_name
  FROM public.profiles
  WHERE id = NEW.provider_id;
  
  -- Get request details
  SELECT r.title, p.email INTO v_request_title, v_requester_email
  FROM public.requests r
  JOIN public.profiles p ON r.user_id = p.id
  WHERE r.id = NEW.request_id;
  
  PERFORM notify_founder(
    p_event_type := 'Proposal Accepted',
    p_urgency := 'info',
    p_title := 'Proposal Accepted - Deal Closed',
    p_message := 'A proposal has been accepted for: ' || v_request_title,
    p_user_id := NEW.provider_id,
    p_user_email := v_provider_email,
    p_related_id := NEW.id::TEXT,
    p_metadata := jsonb_build_object(
      'Proposal ID', NEW.id,
      'Provider Name', COALESCE(v_provider_name, 'Unknown'),
      'Request', v_request_title,
      'Final Amount', COALESCE(NEW.price::TEXT, 'Not specified'),
      'Requester Email', v_requester_email
    )
  );
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_proposal_accepted_notify_founder ON public.proposals;
CREATE TRIGGER on_proposal_accepted_notify_founder
  AFTER UPDATE ON public.proposals
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'accepted')
  EXECUTE FUNCTION trigger_founder_proposal_accepted();

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION notify_founder TO authenticated;
GRANT EXECUTE ON FUNCTION notify_founder TO service_role;