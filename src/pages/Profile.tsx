import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Upload } from "lucide-react";

export default function Profile() {
  const { user, profile, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file || !user) return;

      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      toast.success("Avatar updated successfully!");
      window.location.reload();
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error("Failed to upload avatar");
    } finally {
      setUploading(false);
    }
  };

  if (loading || !user) return null;

  const subscriptionEndDate = profile?.subscription_end_date 
    ? new Date(profile.subscription_end_date).toLocaleDateString()
    : "N/A";

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-card border border-border rounded-xl p-8 shadow-lg">
            <h1 className="text-3xl font-bold mb-8 text-foreground">Profile</h1>
            
            <div className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {profile?.username?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <label htmlFor="avatar-upload">
                    <Button 
                      variant="outline" 
                      disabled={uploading}
                      className="cursor-pointer"
                      asChild
                    >
                      <span>
                        <Upload className="mr-2 h-4 w-4" />
                        {uploading ? "Uploading..." : "Change Avatar"}
                      </span>
                    </Button>
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Profile Info */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Username</label>
                  <p className="text-lg text-foreground">{profile?.username}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Points</label>
                  <p className="text-lg text-foreground font-bold">{profile?.points}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Subscription Status</label>
                  <p className="text-lg text-foreground capitalize">{profile?.subscription_status}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Subscription Expires</label>
                  <p className="text-lg text-foreground">{subscriptionEndDate}</p>
                </div>
              </div>

              <Button onClick={signOut} variant="destructive" className="w-full">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
