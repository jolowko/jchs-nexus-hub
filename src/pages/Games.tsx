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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Plus, ExternalLink, Gamepad2, Coins } from "lucide-react";
import { toast } from "sonner";

interface Game {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail_url?: string;
  points_reward: number;
  created_at: string;
}

export default function Games() {
  const { user, profile, isSubscribed, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [games, setGames] = useState<Game[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [playedGames, setPlayedGames] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!loading && (!user || !isSubscribed)) {
      navigate("/auth");
    }
  }, [user, isSubscribed, loading, navigate]);

  useEffect(() => {
    if (user && isSubscribed) {
      fetchGames();
    }
  }, [user, isSubscribed]);

  const fetchGames = async () => {
    const { data, error } = await supabase
      .from("games")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching games:", error);
      return;
    }

    setGames(data);
  };

  const handleAddGame = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const { error } = await supabase.from("games").insert({
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      url: formData.get("url") as string,
      thumbnail_url: formData.get("thumbnail_url") as string || null,
      points_reward: parseInt(formData.get("points_reward") as string) || 10,
    });

    if (error) {
      toast.error("Failed to add game");
      return;
    }

    toast.success("Game added successfully!");
    setIsDialogOpen(false);
    fetchGames();
    e.currentTarget.reset();
  };

  const handlePlayGame = async (gameId: string, gameUrl: string, pointsReward: number) => {
    if (!user || !profile || playedGames.has(gameId)) {
      window.open(gameUrl, '_blank');
      return;
    }

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ points: profile.points + pointsReward })
        .eq("id", user.id);

      if (error) throw error;

      setPlayedGames(prev => new Set([...prev, gameId]));
      toast.success(`You earned ${pointsReward} points!`);
      window.open(gameUrl, '_blank');
      
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      console.error("Error awarding points:", error);
      toast.error("Failed to award points");
      window.open(gameUrl, '_blank');
    }
  };

  if (loading || !user || !isSubscribed) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
              Games Hub
            </h1>
            <p className="text-muted-foreground">Take a break and have some fun</p>
          </div>
          {isAdmin && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-maroon hover:opacity-90 shadow-maroon">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Game
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-maroon-accent/20">
                <DialogHeader>
                  <DialogTitle>Add New Game</DialogTitle>
                  <DialogDescription>Add a new game to the hub</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddGame} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Game Title</Label>
                    <Input id="title" name="title" required className="bg-background" />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" required className="bg-background" />
                  </div>
                  <div>
                    <Label htmlFor="url">Game URL</Label>
                    <Input id="url" name="url" type="url" required placeholder="https://..." className="bg-background" />
                  </div>
                  <div>
                    <Label htmlFor="thumbnail_url">Thumbnail URL (optional)</Label>
                    <Input id="thumbnail_url" name="thumbnail_url" type="url" placeholder="https://..." className="bg-background" />
                  </div>
                  <div>
                    <Label htmlFor="points_reward">Points Reward</Label>
                    <Input id="points_reward" name="points_reward" type="number" defaultValue="10" min="1" className="bg-background" />
                  </div>
                  <Button type="submit" className="w-full bg-gradient-maroon hover:opacity-90">Add Game</Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {games.length === 0 ? (
          <Card className="bg-card backdrop-blur-sm border-border text-center py-12 shadow-md">
            <CardContent>
              <Gamepad2 className="h-16 w-16 mx-auto mb-4 text-maroon-accent opacity-50" />
              <p className="text-muted-foreground text-lg">No games available yet.</p>
              {isAdmin && <p className="text-sm text-muted-foreground mt-2">Add some games to get started!</p>}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => (
              <Card key={game.id} className="bg-card backdrop-blur-sm border-border hover:border-maroon-accent/40 hover:shadow-maroon transition-all duration-300 group">
                {game.thumbnail_url && (
                  <div className="w-full h-48 overflow-hidden rounded-t-lg">
                    <img 
                      src={game.thumbnail_url} 
                      alt={game.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-foreground group-hover:text-maroon-accent transition-colors">
                    {game.title}
                  </CardTitle>
                  <CardDescription>{game.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-accent font-semibold">
                    <Coins className="h-5 w-5" />
                    <span>Earn {game.points_reward} points</span>
                  </div>
                  <Button 
                    onClick={() => handlePlayGame(game.id, game.url, game.points_reward)}
                    className="w-full bg-gradient-maroon hover:opacity-90"
                    disabled={playedGames.has(game.id)}
                  >
                    {playedGames.has(game.id) ? "Played" : "Play Now"}
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
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
