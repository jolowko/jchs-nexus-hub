import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";

export default function Chat() {
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
        <h1 className="text-3xl font-bold mb-4">Chat</h1>
        <p>Full chat page - use the widget in the corner for quick access!</p>
      </main>
    </div>
  );
}
