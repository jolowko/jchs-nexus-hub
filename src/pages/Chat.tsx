import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@supabase/supabase-js";
import { Send, Users } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const chatMessageSchema = z.string().min(1).max(500);

interface Message {
  id: string;
  content: string;
  created_at: string;
  profile: {
    username: string;
  };
  user_id: string;
}

export default function Chat() {
  const { user, isSubscribed, loading } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [onlineCount, setOnlineCount] = useState(1);

  useEffect(() => {
    if (!loading && (!user || !isSubscribed)) {
      navigate("/auth");
    }
  }, [user, isSubscribed, loading, navigate]);

  useEffect(() => {
    if (user && isSubscribed) {
      fetchMessages();
      subscribeToMessages();
    }
  }, [user, isSubscribed]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    try {
      const response: any = await supabase
        .from("chat_messages")
        .select("id, content, created_at, user_id")
        .eq("room", "global")
        .order("created_at", { ascending: true })
        .limit(100);

      if (response.error || !response.data) {
        console.error("Error fetching messages:", response.error);
        return;
      }

      // Fetch usernames separately
      const messagesWithProfiles: Message[] = await Promise.all(
        response.data.map(async (msg: any) => {
          const profileResponse: any = await supabase
            .from("profiles")
            .select("username")
            .eq("id", msg.user_id)
            .single();
          
          return {
            id: msg.id,
            content: msg.content,
            created_at: msg.created_at,
            user_id: msg.user_id,
            profile: { username: profileResponse.data?.username || "Anonymous" },
          };
        })
      );

      setMessages(messagesWithProfiles);
    } catch (error) {
      console.error("Error in fetchMessages:", error);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel("global-chat")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: "room=eq.global",
        },
        async (payload: any) => {
          const profileResponse: any = await supabase
            .from("profiles")
            .select("username")
            .eq("id", payload.new.user_id)
            .single();

          const newMessage: Message = {
            id: payload.new.id,
            content: payload.new.content,
            created_at: payload.new.created_at,
            user_id: payload.new.user_id,
            profile: { username: profileResponse.data?.username || "Anonymous" },
          };

          setMessages((prev) => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      chatMessageSchema.parse(message);
    } catch {
      toast.error("Message must be between 1 and 500 characters");
      return;
    }

    if (!user) return;

    const response: any = await supabase.from("chat_messages").insert({
      content: message,
      user_id: user.id,
      room: "global",
    });

    if (response.error) {
      toast.error("Failed to send message");
      return;
    }

    setMessage("");
  };

  if (loading || !user || !isSubscribed) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
      <Navigation />
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <Card className="bg-card/95 backdrop-blur-sm border-gold-500/20 shadow-elegant h-[calc(100vh-12rem)] flex flex-col">
          <CardHeader className="border-b border-border/40">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl bg-gradient-gold bg-clip-text text-transparent">
                Global Chat
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{onlineCount} online</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.user_id === user?.id ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    msg.user_id === user?.id
                      ? "bg-gradient-to-br from-gold-500/20 to-navy-600/20 border border-gold-500/30"
                      : "bg-secondary/50 border border-border/40"
                  }`}
                >
                  <p className="text-xs font-semibold mb-1 text-gold-500">
                    {msg.profile.username}
                  </p>
                  <p className="text-sm text-foreground break-words">{msg.content}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </CardContent>
          <div className="p-4 border-t border-border/40">
            <form onSubmit={sendMessage} className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                maxLength={500}
                className="flex-1 bg-background/50"
              />
              <Button
                type="submit"
                disabled={!message.trim()}
                className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>
      </main>
    </div>
  );
}
