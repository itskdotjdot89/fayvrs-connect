-- Update generate_referral_code_trigger to use relative paths instead of hardcoded domain
CREATE OR REPLACE FUNCTION public.generate_referral_code_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_code TEXT;
  final_code TEXT;
  counter INTEGER := 0;
BEGIN
  -- Generate base code from full_name or email
  IF NEW.full_name IS NOT NULL AND NEW.full_name != '' THEN
    base_code := lower(regexp_replace(NEW.full_name, '[^a-zA-Z0-9]', '', 'g'));
  ELSE
    base_code := split_part(NEW.email, '@', 1);
    base_code := lower(regexp_replace(base_code, '[^a-zA-Z0-9]', '', 'g'));
  END IF;
  
  -- Ensure base_code is not empty
  IF base_code = '' THEN
    base_code := 'user';
  END IF;
  
  -- Try to find unique code
  final_code := base_code;
  LOOP
    -- Check if code exists
    IF NOT EXISTS (SELECT 1 FROM public.referral_codes WHERE code = final_code) THEN
      EXIT;
    END IF;
    
    counter := counter + 1;
    final_code := base_code || counter::text;
    
    -- Safety: prevent infinite loop
    IF counter > 1000 THEN
      RAISE EXCEPTION 'Could not generate unique referral code';
    END IF;
  END LOOP;
  
  -- Insert referral code with relative path
  INSERT INTO public.referral_codes (user_id, code, referral_link)
  VALUES (
    NEW.id,
    final_code,
    '/r/' || final_code
  );
  
  -- Initialize earnings record
  INSERT INTO public.referrer_earnings (referrer_id, user_id)
  VALUES (NEW.id, NEW.id)
  ON CONFLICT (referrer_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Update existing referral codes to use relative paths
UPDATE public.referral_codes
SET referral_link = '/r/' || code
WHERE referral_link LIKE 'https://fayvrs.com/r/%' OR referral_link LIKE 'http://%';