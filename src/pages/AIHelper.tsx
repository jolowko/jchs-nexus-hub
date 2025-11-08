import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import ChatWidget from "@/components/ChatWidget";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Brain, Send } from "lucide-react";

export default function AIHelper() {
  const { user, isSubscribed, loading } = useAuth();
  const navigate = useNavigate();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !isSubscribed)) {
      navigate("/auth");
    }
  }, [user, isSubscribed, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim()) return;

    setIsLoading(true);
    setAnswer("");

    try {
      const { data, error } = await supabase.functions.invoke("ai-helper", {
        body: { question },
      });

      if (error) throw error;

      setAnswer(data.answer);
      toast.success("Answer generated!");
    } catch (error: any) {
      toast.error(error.message || "Failed to get answer");
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || !user || !isSubscribed) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Brain className="h-8 w-8 text-accent" />
          </div>
          <h1 className="text-3xl font-bold mb-2">AI Homework Helper</h1>
          <p className="text-muted-foreground">Get instant help with your homework</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Ask a Question</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea
                placeholder="Type your homework question here..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={6}
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading || !question.trim()}>
                {isLoading ? (
                  "Thinking..."
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Get Answer
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {answer && (
          <Card>
            <CardHeader>
              <CardTitle>Answer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap">{answer}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <ChatWidget />
    </div>
  );
}
