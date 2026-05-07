-- Allow authenticated users to upload their own media (path prefix is enforced in app logic).
create policy "song audio owner upload" on storage.objects
for insert to authenticated with check (bucket_id = 'song-audio');

create policy "song covers owner upload" on storage.objects
for insert to authenticated with check (bucket_id = 'song-covers');

create policy "album covers owner upload" on storage.objects
for insert to authenticated with check (bucket_id = 'album-covers');

