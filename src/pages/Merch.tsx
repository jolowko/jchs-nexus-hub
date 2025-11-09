import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import ChatWidget from "@/components/ChatWidget";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Plus, ShoppingCart, Package } from "lucide-react";
import { toast } from "sonner";

interface MerchItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  stock: number;
  created_at: string;
}

export default function Merch() {
  const { user, isSubscribed, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [merchItems, setMerchItems] = useState<MerchItem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !isSubscribed)) {
      navigate("/auth");
    }
  }, [user, isSubscribed, loading, navigate]);

  useEffect(() => {
    if (user && isSubscribed) {
      fetchMerchItems();
    }
  }, [user, isSubscribed]);

  const fetchMerchItems = async () => {
    const { data, error } = await supabase
      .from("merch_items")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching merch items:", error);
      return;
    }

    setMerchItems(data);
  };

  const handleAddItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const { error } = await supabase.from("merch_items").insert({
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: parseFloat(formData.get("price") as string),
      stock: parseInt(formData.get("stock") as string),
      image_url: formData.get("image_url") as string || null,
    });

    if (error) {
      toast.error("Failed to add merch item");
      return;
    }

    toast.success("Merch item added successfully!");
    setIsDialogOpen(false);
    fetchMerchItems();
    e.currentTarget.reset();
  };

  if (loading || !user || !isSubscribed) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-gold bg-clip-text text-transparent">
              Merchandise Store
            </h1>
            <p className="text-muted-foreground">Show your school spirit with official JCHS gear</p>
          </div>
          {isAdmin && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-gold-500/20">
                <DialogHeader>
                  <DialogTitle>Add New Product</DialogTitle>
                  <DialogDescription>Add a new merchandise item to the store</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddItem} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Product Name</Label>
                    <Input id="name" name="name" required />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Price ($)</Label>
                      <Input id="price" name="price" type="number" step="0.01" min="0" required />
                    </div>
                    <div>
                      <Label htmlFor="stock">Stock</Label>
                      <Input id="stock" name="stock" type="number" min="0" required />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="image_url">Image URL (optional)</Label>
                    <Input id="image_url" name="image_url" type="url" placeholder="https://..." />
                  </div>
                  <Button type="submit" className="w-full">Add Product</Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {merchItems.length === 0 ? (
          <Card className="bg-card/95 backdrop-blur-sm border-gold-500/20 text-center py-12">
            <CardContent>
              <Package className="h-16 w-16 mx-auto mb-4 text-gold-500 opacity-50" />
              <p className="text-muted-foreground text-lg">No merchandise available yet.</p>
              {isAdmin && <p className="text-sm text-muted-foreground mt-2">Add some products to get started!</p>}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {merchItems.map((item) => (
              <Card key={item.id} className="bg-card/95 backdrop-blur-sm border-gold-500/20 hover:border-gold-500/40 hover:shadow-elegant transition-all duration-300 group flex flex-col">
                {item.image_url && (
                  <div className="w-full h-64 overflow-hidden rounded-t-lg">
                    <img 
                      src={item.image_url} 
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="group-hover:text-gold-500 transition-colors">
                    {item.name}
                  </CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gold-500">
                      ${item.price.toFixed(2)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {item.stock > 0 ? `${item.stock} in stock` : "Out of stock"}
                    </span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700"
                    disabled={item.stock === 0}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    {item.stock > 0 ? "Add to Cart" : "Out of Stock"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
      <ChatWidget />
    </div>
  );
}
