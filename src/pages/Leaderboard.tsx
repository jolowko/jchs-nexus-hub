import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import ChatWidget from "@/components/ChatWidget";

export default function Leaderboard() {
  const { user, isSubscribed, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || !isSubscribed)) {
      navigate("/auth");
    }
  }, [user, isSubscribed, loading, navigate]);

  if (loading || !user || !isSubscribed) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Leaderboard</h1>
        <p>Top contributors coming soon!</p>
      </main>
      <ChatWidget />
    </div>
  );
}
