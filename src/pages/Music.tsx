import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import ChatWidget from "@/components/ChatWidget";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Music as MusicIcon, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface MusicEmbed {
  id: string;
  user_id: string;
  service: string;
  embed_url: string;
  title: string;
  description: string | null;
  created_at: string;
}

export default function Music() {
  const { user, profile, isSubscribed, loading } = useAuth();
  const navigate = useNavigate();
  const [musicService, setMusicService] = useState<string>("spotify");
  const [embeds, setEmbeds] = useState<MusicEmbed[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !isSubscribed)) {
      navigate("/auth");
    }
  }, [user, isSubscribed, loading, navigate]);

  useEffect(() => {
    if (user && isSubscribed && profile) {
      setMusicService(profile.music_service || "spotify");
      fetchEmbeds();
    }
  }, [user, isSubscribed, profile]);

  const fetchEmbeds = async () => {
    const { data, error } = await supabase
      .from("music_embeds")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching music embeds:", error);
      return;
    }

    setEmbeds(data || []);
  };

  const handleServiceChange = async (service: string) => {
    if (!user) return;

    setMusicService(service);

    const { error } = await supabase
      .from("profiles")
      .update({ music_service: service })
      .eq("id", user.id);

    if (error) {
      toast.error("Failed to update music service");
      return;
    }

    toast.success(`Switched to ${service === 'apple_music' ? 'Apple Music' : service === 'soundcloud' ? 'SoundCloud' : 'Spotify'}`);
  };

  const handleAddEmbed = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    const formData = new FormData(e.currentTarget);
    const embedUrl = formData.get("embed_url") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string || null;

    const { error } = await supabase.from("music_embeds").insert({
      user_id: user.id,
      service: musicService,
      embed_url: embedUrl,
      title,
      description,
    });

    if (error) {
      toast.error("Failed to add music");
      console.error(error);
      return;
    }

    toast.success("Music added successfully!");
    setIsDialogOpen(false);
    fetchEmbeds();
    e.currentTarget.reset();
  };

  const handleDeleteEmbed = async (id: string) => {
    const { error } = await supabase
      .from("music_embeds")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete music");
      return;
    }

    toast.success("Music deleted");
    fetchEmbeds();
  };

  const getEmbedCode = (embed: MusicEmbed) => {
    // Convert share URLs to embed URLs
    let embedCode = embed.embed_url;

    if (embed.service === 'spotify') {
      // Convert spotify.com/track or playlist to embed format
      embedCode = embedCode.replace('spotify.com/', 'spotify.com/embed/');
      return `<iframe style="border-radius:12px" src="${embedCode}" width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`;
    } else if (embed.service === 'soundcloud') {
      // SoundCloud embed
      return `<iframe width="100%" height="300" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=${encodeURIComponent(embedCode)}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true"></iframe>`;
    } else if (embed.service === 'apple_music') {
      // Apple Music embed
      return `<iframe allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write" frameborder="0" height="450" style="width:100%;max-width:660px;overflow:hidden;border-radius:10px;" sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation" src="${embedCode}"></iframe>`;
    }

    return embedCode;
  };

  if (loading || !user || !isSubscribed) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
              Music Hub
            </h1>
            <p className="text-muted-foreground">Share and discover music with your classmates</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-maroon hover:opacity-90 shadow-maroon">
                <Plus className="mr-2 h-4 w-4" />
                Add Music
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-maroon-accent/20">
              <DialogHeader>
                <DialogTitle>Add Music</DialogTitle>
                <DialogDescription>
                  Share a song, album, or playlist from your favorite music service
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddEmbed} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" name="title" required className="bg-background" placeholder="Song/Playlist name" />
                </div>
                <div>
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea id="description" name="description" className="bg-background" placeholder="Why you love this..." />
                </div>
                <div>
                  <Label htmlFor="embed_url">Music URL</Label>
                  <Input 
                    id="embed_url" 
                    name="embed_url" 
                    required 
                    className="bg-background" 
                    placeholder={
                      musicService === 'spotify' ? 'https://open.spotify.com/track/...' :
                      musicService === 'soundcloud' ? 'https://soundcloud.com/...' :
                      'https://music.apple.com/...'
                    }
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Paste the share link from {musicService === 'apple_music' ? 'Apple Music' : musicService === 'soundcloud' ? 'SoundCloud' : 'Spotify'}
                  </p>
                </div>
                <Button type="submit" className="w-full bg-gradient-maroon hover:opacity-90">
                  Add Music
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-6">
          <Label htmlFor="service-select" className="text-foreground mb-2 block">
            Preferred Music Service
          </Label>
          <Select value={musicService} onValueChange={handleServiceChange}>
            <SelectTrigger className="w-[280px] bg-card border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="spotify">Spotify</SelectItem>
              <SelectItem value="apple_music">Apple Music</SelectItem>
              <SelectItem value="soundcloud">SoundCloud</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {embeds.length === 0 ? (
          <Card className="bg-card backdrop-blur-sm border-border text-center py-12 shadow-md">
            <CardContent>
              <MusicIcon className="h-16 w-16 mx-auto mb-4 text-maroon-accent opacity-50" />
              <p className="text-muted-foreground text-lg">No music shared yet.</p>
              <p className="text-sm text-muted-foreground mt-2">Be the first to share your favorite tunes!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {embeds.map((embed) => (
              <Card key={embed.id} className="bg-card backdrop-blur-sm border-border hover:border-maroon-accent/40 hover:shadow-maroon transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-foreground">{embed.title}</CardTitle>
                      {embed.description && (
                        <CardDescription className="mt-1">{embed.description}</CardDescription>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {embed.service === 'apple_music' ? 'Apple Music' : 
                         embed.service === 'soundcloud' ? 'SoundCloud' : 'Spotify'}
                      </p>
                    </div>
                    {user.id === embed.user_id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteEmbed(embed.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div 
                    className="w-full"
                    dangerouslySetInnerHTML={{ __html: getEmbedCode(embed) }}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <ChatWidget />
    </div>
  );
}
