import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import ChatWidget from "@/components/ChatWidget";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Lock, Unlock, Upload, X, Heart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface HomeworkPost {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  likes: number;
  user_id: string;
  created_at: string;
  points_required: number;
  profiles: {
    username: string;
    avatar_url: string | null;
  };
}

export default function Homework() {
  const { user, profile, isSubscribed, loading } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<HomeworkPost[]>([]);
  const [unlockedPosts, setUnlockedPosts] = useState<Set<string>>(new Set());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && (!user || !isSubscribed)) {
      navigate("/auth");
    }
  }, [user, isSubscribed, loading, navigate]);

  useEffect(() => {
    if (user && isSubscribed) {
      fetchPosts();
      fetchUnlockedPosts();
    }
  }, [user, isSubscribed]);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from("homework_posts")
      .select(`
        *,
        profiles!homework_posts_user_id_fkey(username, avatar_url)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching posts:", error);
    } else {
      setPosts(data as any || []);
    }
  };

  const fetchUnlockedPosts = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("user_unlocked_posts")
      .select("post_id")
      .eq("user_id", user.id);

    if (error) {
      console.error("Error fetching unlocked posts:", error);
    } else {
      setUnlockedPosts(new Set(data?.map(u => u.post_id) || []));
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const pointsRequired = parseInt(formData.get("points_required") as string) || 0;

    try {
      let imageUrl = null;

      if (image) {
        const fileExt = image.name.split('.').pop();
        const filePath = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('homework-images')
          .upload(filePath, image);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('homework-images')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      const { error } = await supabase.from("homework_posts").insert({
        title,
        description,
        image_url: imageUrl,
        user_id: user.id,
        points_required: pointsRequired,
      });

      if (error) throw error;

      toast.success("Post created successfully!");
      setImage(null);
      setImagePreview(null);
      setIsDialogOpen(false);
      fetchPosts();
      e.currentTarget.reset();
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post");
    }
  };

  const unlockPost = async (postId: string, points: number) => {
    if (!user || !profile) return;

    if (profile.points < points) {
      toast.error("Not enough points!");
      return;
    }

    try {
      const { error: pointsError } = await supabase
        .from("profiles")
        .update({ points: profile.points - points })
        .eq("id", user.id);

      if (pointsError) throw pointsError;

      const { error: unlockError } = await supabase
        .from("user_unlocked_posts")
        .insert({ user_id: user.id, post_id: postId });

      if (unlockError) throw unlockError;

      toast.success(`Post unlocked for ${points} points!`);
      setUnlockedPosts(prev => new Set([...prev, postId]));
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error("Error unlocking post:", error);
      toast.error("Failed to unlock post");
    }
  };

  const isPostUnlocked = (post: HomeworkPost) => {
    return post.user_id === user?.id || 
           post.points_required === 0 || 
           unlockedPosts.has(post.id);
  };

  if (loading || !user || !isSubscribed) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
              Homework Hub
            </h1>
            <p className="text-muted-foreground">Share and discover homework help</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-maroon hover:opacity-90 shadow-maroon">
                <Upload className="mr-2 h-4 w-4" />
                Create Post
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-maroon-accent/20">
              <DialogHeader>
                <DialogTitle>Create Homework Post</DialogTitle>
                <DialogDescription>Share your homework with the community</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" name="title" required className="bg-background" />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" required className="bg-background" />
                </div>
                <div>
                  <Label htmlFor="points_required">Points Required (0 for free)</Label>
                  <Input 
                    id="points_required" 
                    name="points_required" 
                    type="number" 
                    defaultValue="0" 
                    min="0" 
                    className="bg-background"
                  />
                </div>
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    {imagePreview ? (
                      <div className="relative inline-block">
                        <img src={imagePreview} alt="Preview" className="max-h-48 rounded" />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setImage(null);
                            setImagePreview(null);
                          }}
                          className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="text-muted-foreground">
                        <Upload className="mx-auto h-12 w-12 mb-2" />
                        <p>Drop image here or click to upload</p>
                      </div>
                    )}
                  </label>
                </div>
                <Button type="submit" className="w-full bg-gradient-maroon hover:opacity-90">Create Post</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {posts.length === 0 ? (
          <Card className="bg-card backdrop-blur-sm border-border text-center py-12 shadow-md">
            <CardContent>
              <p className="text-muted-foreground text-lg">No posts yet. Be the first to share!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {posts.map((post) => {
              const unlocked = isPostUnlocked(post);
              
              return (
                <Card key={post.id} className="bg-card border-border hover:shadow-maroon transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-foreground">{post.title}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">by {post.profiles.username}</p>
                      </div>
                      
                      {!unlocked && post.points_required > 0 && (
                        <Button
                          onClick={() => unlockPost(post.id, post.points_required)}
                          variant="outline"
                          size="sm"
                          className="gap-2"
                        >
                          <Lock className="h-4 w-4" />
                          Unlock ({post.points_required} pts)
                        </Button>
                      )}
                      
                      {unlocked && post.points_required > 0 && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Unlock className="h-4 w-4" />
                          Unlocked
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {unlocked ? (
                      <>
                        <p className="mb-4 text-foreground">{post.description}</p>
                        {post.image_url && (
                          <img 
                            src={post.image_url} 
                            alt={post.title}
                            className="max-w-full h-auto rounded-lg"
                          />
                        )}
                      </>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Lock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>This post requires {post.points_required} points to unlock</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
      <ChatWidget />
    </div>
  );
}
