import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Send, Loader2, Video, Flag } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useUserPresence } from "@/hooks/useUserPresence";
import { OnlineIndicator } from "@/components/OnlineIndicator";
import { VideoCallModal } from "@/components/VideoCallModal";
import { IncomingCallModal } from "@/components/IncomingCallModal";
import { ReportDialog } from "@/components/ReportDialog";

export default function Messages() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isOnline, statusText } = useUserPresence(userId);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [showIncomingCall, setShowIncomingCall] = useState(false);
  const [incomingCallData, setIncomingCallData] = useState<{
    sessionId: string;
    callerId: string;
    callerName: string;
    callerAvatar?: string;
  } | null>(null);
  const [activeCallSessionId, setActiveCallSessionId] = useState<string | null>(null);

  // Fetch recipient profile (only public fields - no email, phone, latitude, longitude)
  const { data: recipient } = useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, location, bio, is_verified')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  // Fetch messages
  const { data: messages, isLoading } = useQuery({
    queryKey: ['messages', user?.id, userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user?.id},recipient_id.eq.${userId}),and(sender_id.eq.${userId},recipient_id.eq.${user?.id})`)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && !!userId,
  });

  // Subscribe to new messages
  useEffect(() => {
    if (!user?.id || !userId) return;

    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['messages', user.id, userId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, userId, queryClient]);

  // Listen for incoming video calls
  useEffect(() => {
    if (!user?.id) return;

    const callChannel = supabase
      .channel('incoming-calls')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'call_sessions',
          filter: `receiver_id=eq.${user.id}`,
        },
        async (payload: any) => {
          const callSession = payload.new;
          if (callSession.status === 'pending') {
            const { data: callerProfile } = await supabase
              .from('profiles')
              .select('full_name, avatar_url')
              .eq('id', callSession.caller_id)
              .single();
            
            setIncomingCallData({
              sessionId: callSession.id,
              callerId: callSession.caller_id,
              callerName: callerProfile?.full_name || 'Unknown',
              callerAvatar: callerProfile?.avatar_url,
            });
            setShowIncomingCall(true);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(callChannel);
    };
  }, [user?.id]);

  const startVideoCall = async () => {
    if (!user?.id || !userId) return;
    
    try {
      const { data, error } = await supabase
        .from('call_sessions')
        .insert({
          caller_id: user.id,
          receiver_id: userId,
          status: 'pending',
        } as any)
        .select()
        .single();

      if (error) throw error;
      
      setActiveCallSessionId(data.id);
      setShowVideoCall(true);
    } catch (error) {
      toast.error('Failed to start video call');
      console.error(error);
    }
  };

  const acceptCall = () => {
    if (incomingCallData) {
      setActiveCallSessionId(incomingCallData.sessionId);
      setShowIncomingCall(false);
      setShowVideoCall(true);
      
      supabase
        .from('call_sessions')
        .update({ status: 'active' })
        .eq('id', incomingCallData.sessionId);
    }
  };

  const declineCall = () => {
    if (incomingCallData) {
      supabase
        .from('call_sessions')
        .update({ status: 'declined' })
        .eq('id', incomingCallData.sessionId);
      
      setShowIncomingCall(false);
      setIncomingCallData(null);
    }
  };

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user!.id,
          recipient_id: userId!,
          content,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ['messages', user?.id, userId] });
    },
    onError: () => {
      toast.error("Failed to send message");
    },
  });

  // Mark messages as read
  useEffect(() => {
    if (!messages || !user?.id) return;

    const unreadMessages = messages.filter(
      m => m.recipient_id === user.id && !m.is_read
    );

    if (unreadMessages.length > 0) {
      const markAsRead = async () => {
        const { error } = await supabase
          .from('messages')
          .update({ is_read: true })
          .in('id', unreadMessages.map(m => m.id));

        if (error) console.error('Error marking messages as read:', error);
      };

      markAsRead();
    }
  }, [messages, user?.id]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    sendMessageMutation.mutate(message.trim());
  };

  if (!userId) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Select a conversation to start messaging</p>
          <Button onClick={() => navigate('/feed')}>Go to Feed</Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-xl"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            <div className="relative">
              <Avatar className="w-10 h-10 border-2 border-accent">
                <AvatarImage src={recipient?.avatar_url} />
                <AvatarFallback className="bg-primary text-white font-semibold">
                  {recipient?.full_name?.substring(0, 2).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <OnlineIndicator 
                isOnline={isOnline} 
                size="sm" 
                className="absolute bottom-0 right-0 border-2 border-white"
              />
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-foreground text-sm">
                {recipient?.full_name || 'User'}
              </h2>
              <OnlineIndicator 
                isOnline={isOnline} 
                showText 
                statusText={statusText}
              />
            </div>

            <Button
              onClick={startVideoCall}
              size="icon"
              variant="ghost"
              className="rounded-xl"
            >
              <Video className="w-5 h-5" />
            </Button>
            
            {userId && (
              <ReportDialog 
                reportedUserId={userId}
                triggerButton={
                  <Button variant="ghost" size="icon" className="rounded-xl">
                    <Flag className="w-4 h-4" />
                  </Button>
                }
              />
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-md mx-auto space-y-4">
          {messages && messages.length > 0 ? (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender_id === user?.id ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[75%] space-y-1 ${msg.sender_id === user?.id ? "items-end" : "items-start"} flex flex-col`}>
                  <div
                    className={`rounded-2xl px-4 py-2.5 ${
                      msg.sender_id === user?.id
                        ? "bg-primary text-white rounded-tr-md"
                        : "bg-white text-foreground rounded-tl-md shadow-sm"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  </div>
                  <span className="text-xs text-muted-foreground px-1">
                    {new Date(msg.created_at).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-border p-4">
        <form onSubmit={handleSendMessage} className="max-w-md mx-auto flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="h-11 rounded-2xl"
            disabled={sendMessageMutation.isPending}
          />
          
          <Button 
            type="submit"
            size="icon" 
            className="w-11 h-11 rounded-xl flex-shrink-0"
            disabled={!message.trim() || sendMessageMutation.isPending}
          >
            {sendMessageMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </form>
      </div>

      {showVideoCall && activeCallSessionId && user?.id && userId && (
        <VideoCallModal
          isOpen={showVideoCall}
          onClose={() => {
            setShowVideoCall(false);
            setActiveCallSessionId(null);
          }}
          callSessionId={activeCallSessionId}
          localUserId={user.id}
          remoteUserId={userId}
          remoteUserName={recipient?.full_name || 'User'}
          isInitiator={incomingCallData?.callerId !== user.id}
        />
      )}

      {showIncomingCall && incomingCallData && (
        <IncomingCallModal
          isOpen={showIncomingCall}
          callerName={incomingCallData.callerName}
          callerAvatar={incomingCallData.callerAvatar}
          onAccept={acceptCall}
          onDecline={declineCall}
        />
      )}
    </div>
  );
}
