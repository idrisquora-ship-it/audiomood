-- Genres/moods reference data: readable by authenticated users + anon (browse before login if needed).

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'genres' and policyname = 'genres public read') then
    create policy "genres public read" on public.genres for select using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'moods' and policyname = 'moods public read') then
    create policy "moods public read" on public.moods for select using (true);
  end if;
end $$;

-- Seed onboarding options (skip if tables already populated).
insert into public.genres (name) values
  ('Pop'),
  ('Hip Hop'),
  ('R&B'),
  ('Rock'),
  ('Electronic'),
  ('Jazz'),
  ('Classical'),
  ('Country'),
  ('Latin'),
  ('Afrobeats'),
  ('Indie'),
  ('Soul'),
  ('Metal')
on conflict (name) do nothing;

insert into public.moods (name) values
  ('Happy'),
  ('Sad'),
  ('Chill'),
  ('Energetic'),
  ('Focused'),
  ('Party'),
  ('Romantic'),
  ('Melancholic'),
  ('Motivated'),
  ('Relaxed'),
  ('Workout'),
  ('Late night')
on conflict (name) do nothing;
