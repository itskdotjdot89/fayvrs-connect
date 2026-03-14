

## Promo Code Redemption System

### Overview
Create a promo code system that lets providers enter `FAYVRS2025` on the paywall to get a free 1-year subscription. The code supports up to 5,000 redemptions.

### 1. Database: `promo_codes` table (migration)

```sql
CREATE TABLE public.promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  max_redemptions integer NOT NULL DEFAULT 5000,
  current_redemptions integer NOT NULL DEFAULT 0,
  plan text NOT NULL DEFAULT 'yearly',
  duration_days integer NOT NULL DEFAULT 365,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz -- when the promo campaign itself expires
);

ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

-- Anyone can read active codes (for validation)
CREATE POLICY "Public can view active promo codes"
  ON public.promo_codes FOR SELECT
  USING (is_active = true);
```

### 2. Database: `promo_redemptions` tracking table (migration)

```sql
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
```

### 3. Seed the `FAYVRS2025` code (insert)

```sql
INSERT INTO public.promo_codes (code, max_redemptions, duration_days, plan, is_active)
VALUES ('FAYVRS2025', 5000, 365, 'yearly', true);
```

### 4. Edge Function: `redeem-promo-code`

- Accepts `{ code: string }` with JWT auth
- Validates: code exists, is active, hasn't hit max redemptions, user hasn't already redeemed
- Checks user doesn't already have an active subscription
- Inserts into `provider_subscriptions` with `status: 'active'`, `plan: 'yearly'`, `expires_at: now + 365 days`
- Inserts into `promo_redemptions` to prevent double-use
- Increments `current_redemptions` on the promo code
- Returns success with subscription details

### 5. UI: Add promo code input to `ProviderPaywall.tsx`

- Add a "Have a promo code?" text button below the subscription options
- On click, expands to show a text input + "Redeem" button
- On submit, calls the `redeem-promo-code` edge function
- On success, calls `refreshSubscriptionStatus()` and navigates to `/feed`
- Works on both web and native (no App Store payment conflict since it's free)

### Files Changed
- **New migration**: `promo_codes` and `promo_redemptions` tables
- **New edge function**: `supabase/functions/redeem-promo-code/index.ts`
- **Edit**: `src/pages/ProviderPaywall.tsx` — add promo code UI section
- **Edit**: `supabase/config.toml` — add function config

