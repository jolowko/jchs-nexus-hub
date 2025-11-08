import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

export default function Subscription() {
  const { user, isSubscribed } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  if (!user) {
    navigate("/auth");
    return null;
  }

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout");
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, "_blank");
        toast.success("Redirecting to checkout...");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to start checkout");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubscribed) {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-gold">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl mb-2">Unlock JCHS NEXUS</CardTitle>
          <CardDescription className="text-base">
            Get access to all premium features for just $5/month
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            {[
              "Global & Private Chat",
              "Homework Sharing & Collaboration",
              "AI Homework Helper",
              "Access to Games",
              "School Merchandise Store",
              "Leaderboard & Points System",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center">
                  <Check className="w-3 h-3 text-accent" />
                </div>
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-baseline justify-center gap-1 mb-4">
              <span className="text-4xl font-bold">$5</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <Button 
              onClick={handleSubscribe}
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Subscribe Now"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
