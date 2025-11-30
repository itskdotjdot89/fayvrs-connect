-- Fix Security Definer Views by recreating them with SECURITY INVOKER
-- This ensures views enforce the querying user's RLS policies instead of the view creator's

-- Drop and recreate referrer_performance_view with SECURITY INVOKER
DROP VIEW IF EXISTS public.referrer_performance_view;

CREATE VIEW public.referrer_performance_view 
WITH (security_invoker = true) AS
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

-- For conversations materialized view: convert to a regular view with SECURITY INVOKER
-- Materialized views don't support RLS, so we need to convert it to a regular view

-- Drop the existing materialized view and related objects
DROP TRIGGER IF EXISTS refresh_conversations_trigger ON messages;
DROP FUNCTION IF EXISTS refresh_conversations();
DROP MATERIALIZED VIEW IF EXISTS public.conversations;

-- Create as a regular view with SECURITY INVOKER
CREATE VIEW public.conversations
WITH (security_invoker = true) AS
SELECT DISTINCT ON (conversation_id)
  CASE 
    WHEN m.sender_id < m.recipient_id 
    THEN m.sender_id || '-' || m.recipient_id
    ELSE m.recipient_id || '-' || m.sender_id
  END as conversation_id,
  CASE 
    WHEN m.sender_id < m.recipient_id 
    THEN m.sender_id
    ELSE m.recipient_id
  END as user1_id,
  CASE 
    WHEN m.sender_id < m.recipient_id 
    THEN m.recipient_id
    ELSE m.sender_id
  END as user2_id,
  m.content as last_message,
  m.sender_id as last_sender_id,
  m.created_at as last_message_at,
  (SELECT COUNT(*) 
   FROM messages m2 
   WHERE (m2.sender_id = m.sender_id AND m2.recipient_id = m.recipient_id)
      OR (m2.sender_id = m.recipient_id AND m2.recipient_id = m.sender_id)
   ) as message_count
FROM messages m
ORDER BY conversation_id, m.created_at DESC;