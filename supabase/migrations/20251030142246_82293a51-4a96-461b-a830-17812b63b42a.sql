-- Backfill referral codes for existing users who don't have them yet
DO $$
DECLARE
  profile_record RECORD;
  base_code TEXT;
  final_code TEXT;
  counter INTEGER;
BEGIN
  -- Loop through all profiles that don't have a referral code
  FOR profile_record IN 
    SELECT p.id, p.email, p.full_name
    FROM public.profiles p
    LEFT JOIN public.referral_codes rc ON rc.user_id = p.id
    WHERE rc.id IS NULL
  LOOP
    -- Generate base code from full_name or email
    IF profile_record.full_name IS NOT NULL AND profile_record.full_name != '' THEN
      base_code := lower(regexp_replace(profile_record.full_name, '[^a-zA-Z0-9]', '', 'g'));
    ELSE
      base_code := lower(split_part(profile_record.email, '@', 1));
      base_code := regexp_replace(base_code, '[^a-zA-Z0-9]', '', 'g');
    END IF;
    
    -- Ensure minimum length
    IF length(base_code) < 3 THEN
      base_code := base_code || 'user';
    END IF;
    
    -- Find unique code
    counter := 0;
    final_code := base_code;
    WHILE EXISTS (SELECT 1 FROM public.referral_codes WHERE code = final_code) LOOP
      counter := counter + 1;
      final_code := base_code || counter::TEXT;
    END LOOP;
    
    -- Insert referral code
    INSERT INTO public.referral_codes (user_id, code, referral_link)
    VALUES (
      profile_record.id,
      final_code,
      'https://fayvrs.com/r/' || final_code
    );
    
    -- Initialize earnings record if it doesn't exist
    INSERT INTO public.referrer_earnings (user_id)
    VALUES (profile_record.id)
    ON CONFLICT (user_id) DO NOTHING;
    
    RAISE NOTICE 'Created referral code % for user %', final_code, profile_record.email;
  END LOOP;
END $$;