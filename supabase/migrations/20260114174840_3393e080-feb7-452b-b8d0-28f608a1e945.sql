-- Rename Stripe-specific columns to be platform-agnostic
-- This supports the migration from direct Stripe integration to RevenueCat-only

-- Rename stripe_subscription_id to subscription_id
ALTER TABLE referral_relationships 
  RENAME COLUMN stripe_subscription_id TO subscription_id;

-- Rename stripe_customer_id to customer_id  
ALTER TABLE referral_relationships 
  RENAME COLUMN stripe_customer_id TO customer_id;

-- Add revenuecat_transaction_id column to referral_commissions
ALTER TABLE referral_commissions
  ADD COLUMN IF NOT EXISTS revenuecat_transaction_id TEXT;

-- Create an index for faster lookups by revenuecat_transaction_id
CREATE INDEX IF NOT EXISTS idx_referral_commissions_revenuecat_tx 
  ON referral_commissions(revenuecat_transaction_id);

-- Update config.toml entry will be handled separately