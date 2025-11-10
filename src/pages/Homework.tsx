import { useState, useEffect, useRef } from "react";
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
import { Heart, MessageCircle, Upload, X, Image as ImageIcon } from "lucide-react";
import { z } from "zod";

const homeworkSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  description: z.string().trim().min(1, "Description is required").max(5000, "Description must be less than 5000 characters"),
});

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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImageSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleImageSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${user!.id}-${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('homework-images')
      .upload(fileName, file);

    if (uploadError) {
      toast.error("Failed to upload image");
      return null;
    }

    const { data } = supabase.storage
      .from('homework-images')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const createPost = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    const validation = homeworkSchema.safeParse({ title, description });
    if (!validation.success) {
      const errorMessage = validation.error.errors[0]?.message || "Invalid input";
      toast.error(errorMessage);
      return;
    }

    setUploading(true);

    let imageUrl = null;
    if (imageFile) {
      imageUrl = await uploadImage(imageFile);
      if (!imageUrl) {
        setUploading(false);
        return;
      }
    }

    const { error } = await supabase
      .from("homework_posts")
      .insert({
        user_id: user.id,
        title: validation.data.title,
        description: validation.data.description,
        image_url: imageUrl,
      });

    setUploading(false);

    if (error) {
      toast.error("Failed to create post");
      return;
    }

    toast.success("Post created!");
    setTitle("");
    setDescription("");
    setImageFile(null);
    setImagePreview(null);
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
    <div className="min-h-screen bg-gradient-to-br from-grey-light via-background to-maroon-light/20">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
              Homework Hub
            </h1>
            <p className="text-muted-foreground">Share and collaborate on assignments</p>
          </div>
          <Button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-gradient-maroon hover:opacity-90 shadow-maroon"
          >
            <Upload className="mr-2 h-4 w-4" />
            New Post
          </Button>
        </div>

        {showCreateForm && (
          <Card className="mb-6 border-maroon-accent/20 shadow-md">
            <CardHeader className="bg-gradient-card">
              <CardTitle>Create Homework Post</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={createPost} className="space-y-4">
                <Input
                  placeholder="Title (max 200 characters)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={200}
                  required
                  className="border-maroon-accent/20 focus:border-maroon-accent"
                />
                <Textarea
                  placeholder="Description (max 5000 characters)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={5000}
                  required
                  rows={4}
                  className="border-maroon-accent/20 focus:border-maroon-accent"
                />
                
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    isDragging 
                      ? 'border-maroon-accent bg-maroon-light/30' 
                      : 'border-border hover:border-maroon-accent/50'
                  }`}
                >
                  {imagePreview ? (
                    <div className="relative">
                      <img src={imagePreview} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Drag and drop an image here, or click to select
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Select Image
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageSelect(file);
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    disabled={uploading}
                    className="bg-gradient-maroon hover:opacity-90"
                  >
                    {uploading ? "Posting..." : "Post"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowCreateForm(false);
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6">
          {posts.map((post) => (
            <Card key={post.id} className="border-maroon-accent/20 shadow-md hover:shadow-maroon transition-shadow">
              <CardHeader className="bg-gradient-card">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-maroon-dark">{post.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      by {post.profiles?.username || "Anonymous"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => likePost(post.id)}
                      className="hover:text-maroon-accent"
                    >
                      <Heart className="h-4 w-4 mr-1" />
                      {post.likes}
                    </Button>
                    <Button variant="ghost" size="sm" className="hover:text-maroon-accent">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      Reply
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {post.image_url && (
                  <img 
                    src={post.image_url} 
                    alt="Homework" 
                    className="w-full max-h-96 object-contain rounded-lg mb-4 border border-border"
                  />
                )}
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
