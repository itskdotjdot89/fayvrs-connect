-- Create materialized view for conversations
CREATE MATERIALIZED VIEW conversations AS
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

-- Create index for fast lookups
CREATE INDEX idx_conversations_users ON conversations(user1_id, user2_id);

-- Create function to refresh conversations
CREATE OR REPLACE FUNCTION refresh_conversations()
RETURNS trigger AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY conversations;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-refresh on message insert
CREATE TRIGGER refresh_conversations_trigger
AFTER INSERT ON messages
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_conversations();

-- Create call_sessions table
CREATE TABLE call_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caller_id UUID NOT NULL,
  callee_id UUID NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('ringing', 'active', 'ended', 'declined', 'missed')),
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for call_sessions
ALTER TABLE call_sessions ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only see calls they're part of
CREATE POLICY "Users can view their own calls"
  ON call_sessions FOR SELECT
  USING (auth.uid() = caller_id OR auth.uid() = callee_id);

CREATE POLICY "Users can insert calls"
  ON call_sessions FOR INSERT
  WITH CHECK (auth.uid() = caller_id);

CREATE POLICY "Users can update their calls"
  ON call_sessions FOR UPDATE
  USING (auth.uid() = caller_id OR auth.uid() = callee_id);

-- Enable realtime for call_sessions
ALTER PUBLICATION supabase_realtime ADD TABLE call_sessions;

-- Create call_signals table for WebRTC signaling
CREATE TABLE call_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_session_id UUID NOT NULL REFERENCES call_sessions(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL,
  to_user_id UUID NOT NULL,
  signal_type TEXT NOT NULL CHECK (signal_type IN ('offer', 'answer', 'ice-candidate')),
  signal_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for call_signals
ALTER TABLE call_signals ENABLE ROW LEVEL SECURITY;

-- Policies for call_signals
CREATE POLICY "Users can view signals for their calls"
  ON call_signals FOR SELECT
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users can insert signals"
  ON call_signals FOR INSERT
  WITH CHECK (auth.uid() = from_user_id);

-- Enable realtime for call_signals
ALTER PUBLICATION supabase_realtime ADD TABLE call_signals;

-- Auto-delete old signals (cleanup function)
CREATE OR REPLACE FUNCTION delete_old_call_signals()
RETURNS void AS $$
BEGIN
  DELETE FROM call_signals WHERE created_at < now() - interval '1 hour';
END;
$$ LANGUAGE plpgsql;