
-- Promo codes table
CREATE TABLE public.promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  max_redemptions integer NOT NULL DEFAULT 5000,
  current_redemptions integer NOT NULL DEFAULT 0,
  plan text NOT NULL DEFAULT 'yearly',
  duration_days integer NOT NULL DEFAULT 365,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active promo codes"
  ON public.promo_codes FOR SELECT
  USING (is_active = true);

-- Promo redemptions tracking table
CREATE TABLE public.promo_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_code_id uuid REFERENCES public.promo_codes(id) NOT NULL,
  user_id uuid NOT NULL,
  redeemed_at timestamptz DEFAULT now(),
  UNIQUE(promo_code_id, user_id)
);

ALTER TABLE public.promo_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own redemptions"
  ON public.promo_redemptions FOR SELECT
  USING (auth.uid() = user_id);
