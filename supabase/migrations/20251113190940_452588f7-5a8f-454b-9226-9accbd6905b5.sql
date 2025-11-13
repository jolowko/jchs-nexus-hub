-- Add music service preference to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS music_service text DEFAULT 'spotify' CHECK (music_service IN ('spotify', 'apple_music', 'soundcloud'));

-- Create music_embeds table to store user's music embeds
CREATE TABLE IF NOT EXISTS music_embeds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  service text NOT NULL CHECK (service IN ('spotify', 'apple_music', 'soundcloud')),
  embed_url text NOT NULL,
  title text NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE music_embeds ENABLE ROW LEVEL SECURITY;

-- RLS Policies for music_embeds
CREATE POLICY "Subscribers can view all music embeds"
  ON music_embeds FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.subscription_status = 'active'
    )
  );

CREATE POLICY "Users can create their own music embeds"
  ON music_embeds FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.subscription_status = 'active'
    )
  );

CREATE POLICY "Users can delete their own music embeds"
  ON music_embeds FOR DELETE
  USING (auth.uid() = user_id);