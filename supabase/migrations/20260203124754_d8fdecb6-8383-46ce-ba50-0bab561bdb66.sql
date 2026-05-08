-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'listener' CHECK (role IN ('listener', 'artist')),
  display_name TEXT NOT NULL,
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create songs table
CREATE TABLE public.songs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  cover_url TEXT,
  duration INTEGER NOT NULL DEFAULT 0,
  genre TEXT,
  plays INTEGER NOT NULL DEFAULT 0,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lyrics table
CREATE TABLE public.lyrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  song_id UUID NOT NULL UNIQUE REFERENCES public.songs(id) ON DELETE CASCADE,
  lyrics_json JSONB NOT NULL DEFAULT '{"lines": []}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create playlists table
CREATE TABLE public.playlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  cover_url TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create playlist_songs junction table
CREATE TABLE public.playlist_songs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  playlist_id UUID NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
  song_id UUID NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(playlist_id, song_id)
);

-- Create likes table
CREATE TABLE public.likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  song_id UUID NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, song_id)
);

-- Create follows table
CREATE TABLE public.follows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(follower_id, artist_id),
  CHECK (follower_id != artist_id)
);

-- Create streams table for analytics
CREATE TABLE public.streams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  song_id UUID NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  played_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  duration_played INTEGER NOT NULL DEFAULT 0
);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('audio_files', 'audio_files', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('cover_images', 'cover_images', true);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lyrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streams ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Songs policies
CREATE POLICY "Public songs are viewable by everyone" ON public.songs FOR SELECT USING (is_public = true OR artist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "Artists can insert their own songs" ON public.songs FOR INSERT WITH CHECK (artist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() AND role = 'artist'));
CREATE POLICY "Artists can update their own songs" ON public.songs FOR UPDATE USING (artist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "Artists can delete their own songs" ON public.songs FOR DELETE USING (artist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Lyrics policies
CREATE POLICY "Lyrics are viewable by everyone" ON public.lyrics FOR SELECT USING (true);
CREATE POLICY "Artists can insert lyrics for their songs" ON public.lyrics FOR INSERT WITH CHECK (song_id IN (SELECT id FROM public.songs WHERE artist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())));
CREATE POLICY "Artists can update lyrics for their songs" ON public.lyrics FOR UPDATE USING (song_id IN (SELECT id FROM public.songs WHERE artist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())));

-- Playlists policies
CREATE POLICY "Public playlists are viewable by everyone" ON public.playlists FOR SELECT USING (is_public = true OR user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users can create their own playlists" ON public.playlists FOR INSERT WITH CHECK (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users can update their own playlists" ON public.playlists FOR UPDATE USING (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users can delete their own playlists" ON public.playlists FOR DELETE USING (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Playlist songs policies
CREATE POLICY "Playlist songs viewable if playlist is accessible" ON public.playlist_songs FOR SELECT USING (playlist_id IN (SELECT id FROM public.playlists WHERE is_public = true OR user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())));
CREATE POLICY "Users can add songs to their playlists" ON public.playlist_songs FOR INSERT WITH CHECK (playlist_id IN (SELECT id FROM public.playlists WHERE user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())));
CREATE POLICY "Users can remove songs from their playlists" ON public.playlist_songs FOR DELETE USING (playlist_id IN (SELECT id FROM public.playlists WHERE user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())));

-- Likes policies
CREATE POLICY "Likes are viewable by everyone" ON public.likes FOR SELECT USING (true);
CREATE POLICY "Users can like songs" ON public.likes FOR INSERT WITH CHECK (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users can unlike songs" ON public.likes FOR DELETE USING (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Follows policies
CREATE POLICY "Follows are viewable by everyone" ON public.follows FOR SELECT USING (true);
CREATE POLICY "Users can follow artists" ON public.follows FOR INSERT WITH CHECK (follower_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users can unfollow artists" ON public.follows FOR DELETE USING (follower_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Streams policies
CREATE POLICY "Streams are viewable by song owners and the user" ON public.streams FOR SELECT USING (
  user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR 
  song_id IN (SELECT id FROM public.songs WHERE artist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
);
CREATE POLICY "Anyone can record streams" ON public.streams FOR INSERT WITH CHECK (true);

-- Storage policies for audio_files
CREATE POLICY "Audio files are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'audio_files');
CREATE POLICY "Artists can upload audio files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'audio_files' AND auth.role() = 'authenticated');
CREATE POLICY "Artists can update their audio files" ON storage.objects FOR UPDATE USING (bucket_id = 'audio_files' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Artists can delete their audio files" ON storage.objects FOR DELETE USING (bucket_id = 'audio_files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for cover_images
CREATE POLICY "Cover images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'cover_images');
CREATE POLICY "Users can upload cover images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'cover_images' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update their cover images" ON storage.objects FOR UPDATE USING (bucket_id = 'cover_images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their cover images" ON storage.objects FOR DELETE USING (bucket_id = 'cover_images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, role)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'listener')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for auto-creating profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_songs_updated_at BEFORE UPDATE ON public.songs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_lyrics_updated_at BEFORE UPDATE ON public.lyrics FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_playlists_updated_at BEFORE UPDATE ON public.playlists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to increment song plays
CREATE OR REPLACE FUNCTION public.increment_song_plays(song_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.songs SET plays = plays + 1 WHERE id = song_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create indexes for performance
CREATE INDEX idx_songs_artist_id ON public.songs(artist_id);
CREATE INDEX idx_songs_created_at ON public.songs(created_at DESC);
CREATE INDEX idx_songs_plays ON public.songs(plays DESC);
CREATE INDEX idx_streams_song_id ON public.streams(song_id);
CREATE INDEX idx_streams_played_at ON public.streams(played_at DESC);
CREATE INDEX idx_likes_user_id ON public.likes(user_id);
CREATE INDEX idx_likes_song_id ON public.likes(song_id);
CREATE INDEX idx_follows_artist_id ON public.follows(artist_id);
CREATE INDEX idx_playlist_songs_playlist_id ON public.playlist_songs(playlist_id);