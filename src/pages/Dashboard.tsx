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
    <div className="min-h-screen bg-gradient-to-br from-grey-light via-background to-maroon-light/20">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-12 text-center animate-fade-in">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent animate-scale-in">
            Welcome to JCHS NEXUS
          </h1>
          <p className="text-muted-foreground text-lg">
            Your premium school platform for collaboration and growth
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Link key={feature.to} to={feature.to}>
                <Card 
                  className="hover:shadow-maroon hover:scale-105 hover:border-maroon-accent/40 transition-all duration-300 cursor-pointer h-full border-maroon-accent/20 bg-gradient-card backdrop-blur-sm group animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-3 bg-gradient-maroon/10 rounded-xl group-hover:bg-gradient-maroon/20 transition-all duration-300 shadow-sm">
                        <Icon className={`h-8 w-8 ${feature.color} group-hover:scale-110 transition-transform duration-300`} />
                      </div>
                      <CardTitle className="text-xl text-maroon-dark group-hover:text-maroon-accent transition-colors duration-300">
                        {feature.title}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                      {feature.description}
                    </p>
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
