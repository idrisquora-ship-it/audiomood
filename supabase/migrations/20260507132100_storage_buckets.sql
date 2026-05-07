insert into storage.buckets (id, name, public) values
('song-audio', 'song-audio', false),
('song-covers', 'song-covers', true),
('artist-avatars', 'artist-avatars', true),
('artist-banners', 'artist-banners', true),
('user-avatars', 'user-avatars', true),
('album-covers', 'album-covers', true),
('temp-uploads', 'temp-uploads', false)
on conflict (id) do nothing;

create policy "song audio signed only" on storage.objects
for select using (
  bucket_id = 'song-audio'
  and auth.role() = 'authenticated'
);

create policy "public assets readable" on storage.objects
for select using (
  bucket_id in ('song-covers','artist-avatars','artist-banners','user-avatars','album-covers')
);
