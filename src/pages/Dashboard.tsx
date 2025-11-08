import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import ChatWidget from "@/components/ChatWidget";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Brain, Gamepad2, ShoppingBag, Trophy, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { user, isSubscribed, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/auth");
      } else if (!isSubscribed) {
        navigate("/subscription");
      }
    }
  }, [user, isSubscribed, loading, navigate]);

  if (loading || !user || !isSubscribed) {
    return null;
  }

  const features = [
    {
      title: "Homework Hub",
      description: "Share and collaborate on homework",
      icon: BookOpen,
      to: "/homework",
      color: "text-blue-500",
    },
    {
      title: "AI Helper",
      description: "Get instant homework help",
      icon: Brain,
      to: "/ai-helper",
      color: "text-purple-500",
    },
    {
      title: "Games",
      description: "Take a break and play",
      icon: Gamepad2,
      to: "/games",
      color: "text-green-500",
    },
    {
      title: "Merch Store",
      description: "Shop school merchandise",
      icon: ShoppingBag,
      to: "/merch",
      color: "text-accent",
    },
    {
      title: "Leaderboard",
      description: "See top contributors",
      icon: Trophy,
      to: "/leaderboard",
      color: "text-yellow-500",
    },
    {
      title: "Chat",
      description: "Connect with classmates",
      icon: MessageSquare,
      to: "/chat",
      color: "text-pink-500",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
            Welcome to JCHS NEXUS
          </h1>
          <p className="text-muted-foreground">
            Your premium school platform for collaboration and growth
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link key={feature.to} to={feature.to}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full border-accent/20">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-secondary rounded-lg">
                        <Icon className={`h-6 w-6 ${feature.color}`} />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </main>

      <ChatWidget />
    </div>
  );
}
