-- Fix the trigger that's failing on user creation
-- Drop the existing trigger/function if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recreate the function with the correct column name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into profiles
  INSERT INTO public.profiles (id, email, created_at, updated_at)
  VALUES (NEW.id, NEW.email, NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;

  -- Insert into referrer_earnings with correct column name (user_id, not referrer_id)
  INSERT INTO public.referrer_earnings (user_id, pending_balance, available_balance, total_withdrawn, lifetime_earnings, active_referrals_count, total_referrals_count)
  VALUES (NEW.id, 0, 0, 0, 0, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();