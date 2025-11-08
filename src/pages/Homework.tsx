import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import ChatWidget from "@/components/ChatWidget";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Heart, MessageCircle, Upload } from "lucide-react";

interface HomeworkPost {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  likes: number;
  created_at: string;
  profiles: {
    username: string;
  };
}

export default function Homework() {
  const { user, isSubscribed, loading } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<HomeworkPost[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!loading && (!user || !isSubscribed)) {
      navigate("/auth");
    } else if (user && isSubscribed) {
      fetchPosts();
    }
  }, [user, isSubscribed, loading, navigate]);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from("homework_posts")
      .select("*, profiles:user_id(username)")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load posts");
      return;
    }

    setPosts(data as any);
  };

  const createPost = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    const { error } = await supabase
      .from("homework_posts")
      .insert({
        user_id: user.id,
        title,
        description,
      });

    if (error) {
      toast.error("Failed to create post");
      return;
    }

    toast.success("Post created!");
    setTitle("");
    setDescription("");
    setShowCreateForm(false);
    fetchPosts();
  };

  const likePost = async (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    const { error } = await supabase
      .from("homework_posts")
      .update({ likes: post.likes + 1 })
      .eq("id", postId);

    if (error) {
      toast.error("Failed to like post");
      return;
    }

    fetchPosts();
  };

  if (loading || !user || !isSubscribed) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Homework Hub</h1>
            <p className="text-muted-foreground">Share and collaborate on assignments</p>
          </div>
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            <Upload className="mr-2 h-4 w-4" />
            New Post
          </Button>
        </div>

        {showCreateForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Create Homework Post</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={createPost} className="space-y-4">
                <Input
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
                <Textarea
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={4}
                />
                <div className="flex gap-2">
                  <Button type="submit">Post</Button>
                  <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{post.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      by {post.profiles?.username || "Anonymous"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => likePost(post.id)}
                    >
                      <Heart className="h-4 w-4 mr-1" />
                      {post.likes}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      Reply
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{post.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <ChatWidget />
    </div>
  );
}
