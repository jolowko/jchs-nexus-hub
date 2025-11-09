-- Create games table
CREATE TABLE public.games (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

-- Create policies for games (public read, admin write)
CREATE POLICY "Anyone can view games" 
ON public.games 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert games" 
ON public.games 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update games" 
ON public.games 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete games" 
ON public.games 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'));

-- Create merch_items table
CREATE TABLE public.merch_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.merch_items ENABLE ROW LEVEL SECURITY;

-- Create policies for merch_items (public read, admin write)
CREATE POLICY "Anyone can view merch items" 
ON public.merch_items 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert merch items" 
ON public.merch_items 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update merch items" 
ON public.merch_items 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete merch items" 
ON public.merch_items 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'));