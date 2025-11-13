import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import ChatWidget from "@/components/ChatWidget";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Brain, Gamepad2, ShoppingBag, Trophy, MessageSquare, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { user, isSubscribed, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [featuredImage, setFeaturedImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/auth");
      } else if (!isSubscribed) {
        navigate("/subscription");
      }
    }
  }, [user, isSubscribed, loading, navigate]);

  useEffect(() => {
    if (user && isSubscribed) {
      fetchFeaturedImage();
    }
  }, [user, isSubscribed]);

  const fetchFeaturedImage = async () => {
    const { data, error } = await supabase
      .from("featured_images")
      .select("image_url")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error("Error fetching featured image:", error);
    } else if (data) {
      setFeaturedImage(data.image_url);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `featured/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('homework-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('homework-images')
        .getPublicUrl(filePath);

      // Delete old featured image
      if (featuredImage) {
        const { data: oldImages } = await supabase
          .from("featured_images")
          .select("id");
        
        if (oldImages && oldImages.length > 0) {
          await supabase
            .from("featured_images")
            .delete()
            .in('id', oldImages.map(img => img.id));
        }
      }

      // Insert new featured image
      const { error: insertError } = await supabase
        .from("featured_images")
        .insert({ image_url: publicUrl });

      if (insertError) throw insertError;

      setFeaturedImage(publicUrl);
      toast.success("Featured image updated!");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

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
      title: "Helper",
      description: "Get instant homework help",
      icon: Brain,
      to: "/ai-helper",
      color: "text-purple-500",
    },
    {
      title: "Fun",
      description: "Take a break and play",
      icon: Gamepad2,
      to: "/fun",
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

        {featuredImage && (
          <div className="mb-8 relative rounded-xl overflow-hidden shadow-maroon animate-fade-in">
            <img 
              src={featuredImage} 
              alt="Featured" 
              className="w-full h-64 md:h-96 object-cover"
            />
            {isAdmin && (
              <div className="absolute top-4 right-4">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="hidden"
                  id="featured-upload"
                />
                <label htmlFor="featured-upload">
                  <Button 
                    className="bg-gradient-maroon hover:opacity-90 cursor-pointer"
                    disabled={uploadingImage}
                    asChild
                  >
                    <span>
                      <Upload className="mr-2 h-4 w-4" />
                      {uploadingImage ? "Uploading..." : "Change Image"}
                    </span>
                  </Button>
                </label>
              </div>
            )}
          </div>
        )}

        {!featuredImage && isAdmin && (
          <Card className="mb-8 bg-card border-maroon-accent/20 animate-fade-in">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">Add a featured image to personalize your homepage</p>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="hidden"
                  id="featured-upload-empty"
                />
                <label htmlFor="featured-upload-empty">
                  <Button 
                    className="bg-gradient-maroon hover:opacity-90 cursor-pointer"
                    disabled={uploadingImage}
                    asChild
                  >
                    <span>
                      <Upload className="mr-2 h-4 w-4" />
                      {uploadingImage ? "Uploading..." : "Upload Featured Image"}
                    </span>
                  </Button>
                </label>
              </div>
            </CardContent>
          </Card>
        )}

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
