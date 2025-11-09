import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";

export default function Admin() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [serverVerified, setServerVerified] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/");
      return;
    }

    // Server-side verification of admin status
    const verifyAdminServerSide = async () => {
      const { data, error } = await supabase.rpc('verify_admin_access');
      
      if (error || !data) {
        console.error("Admin verification failed:", error);
        navigate("/");
        return;
      }
      
      setServerVerified(true);
    };

    if (user && isAdmin) {
      verifyAdminServerSide();
    }
  }, [user, isAdmin, loading, navigate]);

  if (loading || !user || !isAdmin || !serverVerified) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Admin Panel</h1>
        <p>Manage users, content, and merchandise</p>
      </main>
    </div>
  );
}
