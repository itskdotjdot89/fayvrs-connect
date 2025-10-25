-- Drop trigger first, then recreate function with proper search_path
DROP TRIGGER IF EXISTS refresh_conversations_trigger ON messages;
DROP FUNCTION IF EXISTS refresh_conversations() CASCADE;

-- Recreate function with proper security settings
CREATE OR REPLACE FUNCTION refresh_conversations()
RETURNS trigger AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY conversations;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public';

-- Recreate trigger
CREATE TRIGGER refresh_conversations_trigger
AFTER INSERT ON messages
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_conversations();

-- Fix delete_old_call_signals function
DROP FUNCTION IF EXISTS delete_old_call_signals();
CREATE OR REPLACE FUNCTION delete_old_call_signals()
RETURNS void AS $$
BEGIN
  DELETE FROM call_signals WHERE created_at < now() - interval '1 hour';
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public';

-- Create a secure function to get user conversations
CREATE OR REPLACE FUNCTION get_user_conversations(user_uuid UUID)
RETURNS TABLE (
  conversation_id TEXT,
  user1_id UUID,
  user2_id UUID,
  last_message TEXT,
  last_sender_id UUID,
  last_message_at TIMESTAMPTZ,
  message_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.conversation_id,
    c.user1_id,
    c.user2_id,
    c.last_message,
    c.last_sender_id,
    c.last_message_at,
    c.message_count
  FROM conversations c
  WHERE c.user1_id = user_uuid OR c.user2_id = user_uuid
  ORDER BY c.last_message_at DESC;
END;
$$ LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public';