-- Fix the streams INSERT policy to require a valid song_id
DROP POLICY IF EXISTS "Anyone can record streams" ON public.streams;
CREATE POLICY "Authenticated users can record streams" ON public.streams 
  FOR INSERT 
  WITH CHECK (
    auth.role() = 'authenticated' AND
    song_id IN (SELECT id FROM public.songs WHERE is_public = true)
  );