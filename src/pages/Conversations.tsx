import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConversationRow {
  conversation_id: string;
  user1_id: string;
  user2_id: string;
  last_message: string | null;
  last_sender_id: string | null;
  last_message_at: string;
  message_count: number;
}

export default function Conversations() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    document.title = "Conversations | Fayvrs";
  }, []);

  const { data: conversations, isLoading, refetch } = useQuery({
    queryKey: ["conversations", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_user_conversations", {
        user_uuid: user!.id,
      });
      if (error) throw error;
      return (data || []) as ConversationRow[];
    },
  });

  const otherUserIds = useMemo(() => {
    if (!conversations || !user?.id) return [] as string[];
    const ids = new Set<string>();
    conversations.forEach((c) => {
      ids.add(c.user1_id === user.id ? c.user2_id : c.user1_id);
    });
    return Array.from(ids);
  }, [conversations, user?.id]);

  const { data: profiles } = useQuery({
    queryKey: ["conversation-profiles", otherUserIds.join(",")],
    enabled: otherUserIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, is_verified")
        .in("id", otherUserIds);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: unreadCounts } = useQuery({
    queryKey: ["unread-counts", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("sender_id, id")
        .eq("recipient_id", user!.id)
        .eq("is_read", false);
      if (error) throw error;
      const map = new Map<string, number>();
      (data || []).forEach((m: any) => {
        map.set(m.sender_id, (map.get(m.sender_id) || 0) + 1);
      });
      return map;
    },
  });

  // Realtime: refetch on new messages
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel("conversations")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        () => {
          refetch();
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, refetch]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-surface">
      <header className="bg-white border-b border-border">
        <div className="max-w-md mx-auto px-4 py-4">
          <h1 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <MessageCircle className="w-5 h-5" /> Conversations
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Chat with people you’ve connected with
          </p>
        </div>
      </header>

      <section className="max-w-md mx-auto p-4">
        <ul className="space-y-2">
          {(conversations || []).map((c) => {
            const otherId = c.user1_id === user?.id ? c.user2_id : c.user1_id;
            const profile = profiles?.find((p) => p.id === otherId);
            const unread = unreadCounts?.get(otherId) || 0;
            return (
              <li key={c.conversation_id}>
                <button
                  onClick={() => navigate(`/messages/${otherId}`)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl bg-white border border-border hover:border-accent transition-colors"
                  )}
                >
                  <Avatar className="w-10 h-10 border-2 border-accent">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback className="bg-primary text-white font-semibold">
                      {profile?.full_name?.substring(0, 2).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">
                        {profile?.full_name || "User"}
                      </span>
                      {profile?.is_verified && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/20 text-accent-foreground">Verified</span>
                      )}
                      {unread > 0 && (
                        <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                          {unread}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {c.last_message || "Tap to view conversation"}
                    </p>
                  </div>

                  <span className="text-[10px] text-muted-foreground">
                    {new Date(c.last_message_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </button>
              </li>
            );
          })}
          {conversations && conversations.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No conversations yet.
            </div>
          )}
        </ul>
      </section>
    </main>
  );
}
