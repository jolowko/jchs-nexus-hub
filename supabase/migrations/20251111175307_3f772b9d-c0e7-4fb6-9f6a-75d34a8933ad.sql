-- Add subscription_end_date to profiles
ALTER TABLE public.profiles ADD COLUMN subscription_end_date timestamp with time zone;

-- Add points_required to homework_posts (nullable, null means free)
ALTER TABLE public.homework_posts ADD COLUMN points_required integer DEFAULT 0;

-- Create user_unlocked_posts table to track unlocked homework
CREATE TABLE public.user_unlocked_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id uuid NOT NULL REFERENCES public.homework_posts(id) ON DELETE CASCADE,
  unlocked_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, post_id)
);

ALTER TABLE public.user_unlocked_posts ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_unlocked_posts
CREATE POLICY "Users can view their own unlocked posts"
  ON public.user_unlocked_posts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can unlock posts"
  ON public.user_unlocked_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add points_reward to games table
ALTER TABLE public.games ADD COLUMN points_reward integer DEFAULT 10;

-- Create avatars storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- Storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );