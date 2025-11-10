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
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { supabase } from "@/integrations/supabase/client";
import { Plus, ShoppingCart, Package, Trash2 } from "lucide-react";
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
  const [imageUrls, setImageUrls] = useState<string>("");

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
    
    // Split image URLs by comma and trim whitespace
    const imageUrlList = imageUrls.split(',').map(url => url.trim()).filter(url => url);
    
    const { error } = await supabase.from("merch_items").insert({
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: parseFloat(formData.get("price") as string),
      stock: parseInt(formData.get("stock") as string),
      image_url: imageUrlList.length > 0 ? JSON.stringify(imageUrlList) : null,
    });

    if (error) {
      toast.error("Failed to add merch item");
      return;
    }

    toast.success("Merch item added successfully!");
    setIsDialogOpen(false);
    setImageUrls("");
    fetchMerchItems();
    e.currentTarget.reset();
  };

  const handleDeleteItem = async (itemId: string) => {
    const { error } = await supabase
      .from("merch_items")
      .delete()
      .eq("id", itemId);

    if (error) {
      toast.error("Failed to delete item");
      return;
    }

    toast.success("Item deleted successfully");
    fetchMerchItems();
  };

  const parseImageUrls = (imageUrl: string | undefined): string[] => {
    if (!imageUrl) return [];
    try {
      const parsed = JSON.parse(imageUrl);
      return Array.isArray(parsed) ? parsed : [imageUrl];
    } catch {
      return [imageUrl];
    }
  };

  if (loading || !user || !isSubscribed) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-grey-light via-background to-maroon-light/20">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
              Merchandise Store
            </h1>
            <p className="text-muted-foreground">Show your school spirit with official JCHS gear</p>
          </div>
          {isAdmin && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-maroon hover:opacity-90 shadow-maroon">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-maroon-accent/20">
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
                    <Label htmlFor="image_urls">Image URLs (comma-separated)</Label>
                    <Textarea 
                      id="image_urls" 
                      placeholder="https://image1.jpg, https://image2.jpg, https://image3.jpg"
                      value={imageUrls}
                      onChange={(e) => setImageUrls(e.target.value)}
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Add multiple image URLs separated by commas
                    </p>
                  </div>
                  <Button type="submit" className="w-full bg-gradient-maroon hover:opacity-90">
                    Add Product
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {merchItems.length === 0 ? (
          <Card className="bg-card/95 backdrop-blur-sm border-maroon-accent/20 text-center py-12 shadow-md">
            <CardContent>
              <Package className="h-16 w-16 mx-auto mb-4 text-maroon-accent opacity-50" />
              <p className="text-muted-foreground text-lg">No merchandise available yet.</p>
              {isAdmin && <p className="text-sm text-muted-foreground mt-2">Add some products to get started!</p>}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {merchItems.map((item) => {
              const images = parseImageUrls(item.image_url);
              return (
                <Card 
                  key={item.id} 
                  className="bg-gradient-card backdrop-blur-sm border-maroon-accent/20 hover:border-maroon-accent/40 hover:shadow-maroon transition-all duration-300 group flex flex-col"
                >
                  {images.length > 0 && (
                    <div className="w-full h-64 overflow-hidden rounded-t-lg">
                      {images.length === 1 ? (
                        <img 
                          src={images[0]} 
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <Carousel className="w-full h-full">
                          <CarouselContent>
                            {images.map((img, idx) => (
                              <CarouselItem key={idx}>
                                <img 
                                  src={img} 
                                  alt={`${item.name} - ${idx + 1}`}
                                  className="w-full h-64 object-cover"
                                />
                              </CarouselItem>
                            ))}
                          </CarouselContent>
                          <CarouselPrevious className="left-2" />
                          <CarouselNext className="right-2" />
                        </Carousel>
                      )}
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-maroon-dark group-hover:text-maroon-accent transition-colors">
                      {item.name}
                    </CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-maroon-accent">
                        ${item.price.toFixed(2)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {item.stock > 0 ? `${item.stock} in stock` : "Out of stock"}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Button 
                      className="flex-1 bg-gradient-maroon hover:opacity-90"
                      disabled={item.stock === 0}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      {item.stock > 0 ? "Add to Cart" : "Out of Stock"}
                    </Button>
                    {isAdmin && (
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </CardFooter>
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
