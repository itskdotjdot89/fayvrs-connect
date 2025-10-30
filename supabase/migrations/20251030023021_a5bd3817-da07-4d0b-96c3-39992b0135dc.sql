-- Create enums for referral system
CREATE TYPE public.referral_relationship_status AS ENUM ('pending', 'active', 'completed', 'cancelled');
CREATE TYPE public.referral_commission_status AS ENUM ('pending', 'available', 'withdrawn', 'cancelled');
CREATE TYPE public.payout_method AS ENUM ('stripe_connect', 'paypal', 'subscription_credit');
CREATE TYPE public.withdrawal_status AS ENUM ('pending', 'processing', 'completed', 'failed');

-- Table 1: referral_codes - Store unique referral codes for each user
CREATE TABLE public.referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  code TEXT NOT NULL UNIQUE,
  referral_link TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  total_clicks INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table 2: referral_relationships - Track who referred whom
CREATE TABLE public.referral_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  referral_code_id UUID NOT NULL REFERENCES referral_codes(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  status referral_relationship_status DEFAULT 'pending',
  first_payment_date TIMESTAMP WITH TIME ZONE,
  subscription_start_date TIMESTAMP WITH TIME ZONE,
  commission_end_date TIMESTAMP WITH TIME ZONE,
  total_payments_count INTEGER DEFAULT 0,
  total_commission_earned NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table 3: referral_commissions - Track individual commission payments
CREATE TABLE public.referral_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_relationship_id UUID NOT NULL REFERENCES referral_relationships(id) ON DELETE CASCADE,
  referrer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT,
  stripe_invoice_id TEXT,
  subscription_amount NUMERIC(10,2) NOT NULL,
  commission_amount NUMERIC(10,2) NOT NULL,
  commission_rate NUMERIC(4,2) DEFAULT 0.20,
  payment_number INTEGER NOT NULL,
  subscription_period_start TIMESTAMP WITH TIME ZONE,
  subscription_period_end TIMESTAMP WITH TIME ZONE,
  status referral_commission_status DEFAULT 'pending',
  becomes_available_at TIMESTAMP WITH TIME ZONE NOT NULL,
  withdrawn_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table 4: referrer_earnings - Aggregate earnings per referrer
CREATE TABLE public.referrer_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  pending_balance NUMERIC(10,2) DEFAULT 0,
  available_balance NUMERIC(10,2) DEFAULT 0,
  total_withdrawn NUMERIC(10,2) DEFAULT 0,
  lifetime_earnings NUMERIC(10,2) DEFAULT 0,
  active_referrals_count INTEGER DEFAULT 0,
  total_referrals_count INTEGER DEFAULT 0,
  last_withdrawal_date TIMESTAMP WITH TIME ZONE,
  preferred_payout_method payout_method,
  stripe_connect_account_id TEXT,
  paypal_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table 5: referral_withdrawals - Track withdrawal requests
CREATE TABLE public.referral_withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  payout_method payout_method NOT NULL,
  status withdrawal_status DEFAULT 'pending',
  stripe_transfer_id TEXT,
  paypal_transaction_id TEXT,
  initiated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  failure_reason TEXT,
  metadata JSONB
);

-- Table 6: referral_link_clicks - Track referral link clicks for analytics
CREATE TABLE public.referral_link_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code_id UUID NOT NULL REFERENCES referral_codes(id) ON DELETE CASCADE,
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT,
  converted_to_signup BOOLEAN DEFAULT false,
  converted_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- Enable RLS on all tables
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrer_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_link_clicks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for referral_codes
CREATE POLICY "Users can view own referral code"
  ON public.referral_codes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own referral code"
  ON public.referral_codes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert referral codes"
  ON public.referral_codes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can view active codes for validation"
  ON public.referral_codes FOR SELECT
  USING (is_active = true);

-- RLS Policies for referral_relationships
CREATE POLICY "Users can view own referral relationships as referrer"
  ON public.referral_relationships FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referred_user_id);

CREATE POLICY "Service role can manage referral relationships"
  ON public.referral_relationships FOR ALL
  USING (true)
  WITH CHECK (true);

-- RLS Policies for referral_commissions
CREATE POLICY "Referrers can view own commissions"
  ON public.referral_commissions FOR SELECT
  USING (auth.uid() = referrer_id);

CREATE POLICY "Service role can manage commissions"
  ON public.referral_commissions FOR ALL
  USING (true)
  WITH CHECK (true);

-- RLS Policies for referrer_earnings
CREATE POLICY "Users can view own earnings"
  ON public.referrer_earnings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own earnings"
  ON public.referrer_earnings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage earnings"
  ON public.referrer_earnings FOR ALL
  USING (true)
  WITH CHECK (true);

-- RLS Policies for referral_withdrawals
CREATE POLICY "Users can view own withdrawals"
  ON public.referral_withdrawals FOR SELECT
  USING (auth.uid() = referrer_id);

CREATE POLICY "Users can insert own withdrawals"
  ON public.referral_withdrawals FOR INSERT
  WITH CHECK (auth.uid() = referrer_id);

CREATE POLICY "Service role can manage withdrawals"
  ON public.referral_withdrawals FOR ALL
  USING (true)
  WITH CHECK (true);

-- RLS Policies for referral_link_clicks
CREATE POLICY "Service role can manage clicks"
  ON public.referral_link_clicks FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_referral_codes_user_id ON public.referral_codes(user_id);
CREATE INDEX idx_referral_codes_code ON public.referral_codes(code);
CREATE INDEX idx_referral_relationships_referrer_id ON public.referral_relationships(referrer_id);
CREATE INDEX idx_referral_relationships_referred_user_id ON public.referral_relationships(referred_user_id);
CREATE INDEX idx_referral_relationships_status ON public.referral_relationships(status);
CREATE INDEX idx_referral_commissions_referrer_id ON public.referral_commissions(referrer_id);
CREATE INDEX idx_referral_commissions_status ON public.referral_commissions(status);
CREATE INDEX idx_referral_commissions_becomes_available_at ON public.referral_commissions(becomes_available_at);
CREATE INDEX idx_referrer_earnings_user_id ON public.referrer_earnings(user_id);

-- Create trigger function to auto-generate referral code on user signup
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
    base_code := lower(split_part(NEW.email, '@', 1));
    base_code := regexp_replace(base_code, '[^a-zA-Z0-9]', '', 'g');
  END IF;
  
  -- Ensure minimum length
  IF length(base_code) < 3 THEN
    base_code := base_code || 'user';
  END IF;
  
  -- Find unique code
  final_code := base_code;
  WHILE EXISTS (SELECT 1 FROM public.referral_codes WHERE code = final_code) LOOP
    counter := counter + 1;
    final_code := base_code || counter::TEXT;
  END LOOP;
  
  -- Insert referral code
  INSERT INTO public.referral_codes (user_id, code, referral_link)
  VALUES (
    NEW.id,
    final_code,
    'https://fayvrs.com/r/' || final_code
  );
  
  -- Initialize earnings record
  INSERT INTO public.referrer_earnings (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;

-- Create trigger on profiles table
CREATE TRIGGER on_user_created_generate_referral
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_referral_code_trigger();

-- Create view for referrer performance analytics
CREATE VIEW public.referrer_performance_view AS
SELECT 
  rr.referrer_id,
  p.full_name,
  p.email,
  COUNT(DISTINCT rr.referred_user_id) as total_referrals,
  SUM(CASE WHEN rr.status = 'active' THEN 1 ELSE 0 END) as active_referrals,
  SUM(rr.total_commission_earned) as lifetime_earnings,
  AVG(rr.total_payments_count) as avg_payments_per_referral,
  re.available_balance,
  re.pending_balance
FROM public.referral_relationships rr
JOIN public.profiles p ON p.id = rr.referrer_id
LEFT JOIN public.referrer_earnings re ON re.user_id = rr.referrer_id
GROUP BY rr.referrer_id, p.full_name, p.email, re.available_balance, re.pending_balance;