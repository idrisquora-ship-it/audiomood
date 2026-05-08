-- Allow streaming catalogue for songs that are live (no admin approval required).
drop policy if exists "songs public approved read" on public.songs;

create policy "songs public playable read" on public.songs
for select using (
  status in ('approved', 'processing_lyrics', 'pending_review')
);
