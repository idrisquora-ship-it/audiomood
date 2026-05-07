create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references auth.users(id) on delete cascade,
  username text unique,
  display_name text,
  avatar_url text,
  bio text,
  account_type text not null default 'listener' check (account_type in ('listener','artist','both')),
  role text not null default 'user' check (role in ('user','artist','admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.artist_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references auth.users(id) on delete cascade,
  artist_name text not null,
  bio text,
  avatar_url text,
  banner_url text,
  verified boolean not null default false,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  monthly_listeners int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.artist_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  artist_name text not null,
  bio text,
  social_links jsonb default '{}'::jsonb,
  genre_id uuid,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  reviewed_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.genres (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  created_at timestamptz not null default now()
);

create table if not exists public.moods (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  created_at timestamptz not null default now()
);

create table if not exists public.albums (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.artist_profiles(id) on delete cascade,
  title text not null,
  description text,
  cover_path text,
  release_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.songs (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.artist_profiles(id) on delete cascade,
  album_id uuid references public.albums(id) on delete set null,
  title text not null,
  description text,
  audio_path text not null,
  cover_path text,
  genre_id uuid references public.genres(id),
  mood_id uuid references public.moods(id),
  duration int,
  language text,
  explicit boolean not null default false,
  status text not null default 'pending_review' check (status in ('draft','uploading','processing_lyrics','pending_review','approved','rejected','hidden')),
  play_count int not null default 0,
  like_count int not null default 0,
  release_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.playlists (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  cover_url text,
  visibility text not null default 'private' check (visibility in ('private','public')),
  is_liked_songs boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists playlists_liked_unique on public.playlists(owner_id) where is_liked_songs = true;

create table if not exists public.playlist_songs (
  id uuid primary key default gen_random_uuid(),
  playlist_id uuid not null references public.playlists(id) on delete cascade,
  song_id uuid not null references public.songs(id) on delete cascade,
  position int not null default 0,
  added_at timestamptz not null default now(),
  unique (playlist_id, song_id)
);

create table if not exists public.liked_songs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  song_id uuid not null references public.songs(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, song_id)
);

create table if not exists public.follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references public.profiles(id) on delete cascade,
  artist_id uuid not null references public.artist_profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (follower_id, artist_id)
);

create table if not exists public.listening_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  song_id uuid not null references public.songs(id) on delete cascade,
  source_type text not null,
  source_id uuid,
  listened_seconds int not null default 0,
  completed boolean not null default false,
  skipped boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.play_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  song_id uuid not null references public.songs(id) on delete cascade,
  event_type text not null,
  source_type text,
  source_id uuid,
  listened_seconds int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.recommendation_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  song_id uuid not null references public.songs(id) on delete cascade,
  score numeric not null default 0,
  signals jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique (user_id, song_id)
);

create table if not exists public.lyrics (
  id uuid primary key default gen_random_uuid(),
  song_id uuid unique not null references public.songs(id) on delete cascade,
  lyrics_text text,
  lyrics_json jsonb,
  source text not null default 'elevenlabs',
  status text not null default 'pending' check (status in ('pending','processing','generated','reviewed','failed','hidden')),
  reviewed_by_artist boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lyrics_jobs (
  id uuid primary key default gen_random_uuid(),
  song_id uuid not null references public.songs(id) on delete cascade,
  provider text not null default 'elevenlabs',
  status text not null default 'pending' check (status in ('pending','processing','generated','failed')),
  error_message text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  song_id uuid not null references public.songs(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  parent_comment_id uuid references public.comments(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  target_type text not null,
  target_id uuid not null,
  reason text not null,
  details text,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text not null,
  type text not null,
  read boolean not null default false,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan text not null default 'free',
  status text not null default 'inactive',
  provider text default 'stripe',
  provider_subscription_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_actions (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null references auth.users(id) on delete cascade,
  action text not null,
  target_type text not null,
  target_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.user_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references public.profiles(id) on delete cascade,
  autoplay_recommendations boolean not null default true,
  notifications_enabled boolean not null default true,
  theme text not null default 'dark',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.search_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  query text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_songs_status on public.songs(status);
create index if not exists idx_play_events_user on public.play_events(user_id, created_at desc);
create index if not exists idx_liked_songs_user on public.liked_songs(user_id, created_at desc);
create index if not exists idx_history_user on public.listening_history(user_id, created_at desc);

create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger artist_profiles_updated_at before update on public.artist_profiles for each row execute function public.set_updated_at();
create trigger songs_updated_at before update on public.songs for each row execute function public.set_updated_at();
create trigger playlists_updated_at before update on public.playlists for each row execute function public.set_updated_at();
create trigger lyrics_updated_at before update on public.lyrics for each row execute function public.set_updated_at();
create trigger subscriptions_updated_at before update on public.subscriptions for each row execute function public.set_updated_at();
create trigger user_settings_updated_at before update on public.user_settings for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.artist_profiles enable row level security;
alter table public.artist_applications enable row level security;
alter table public.songs enable row level security;
alter table public.albums enable row level security;
alter table public.genres enable row level security;
alter table public.moods enable row level security;
alter table public.playlists enable row level security;
alter table public.playlist_songs enable row level security;
alter table public.liked_songs enable row level security;
alter table public.follows enable row level security;
alter table public.listening_history enable row level security;
alter table public.play_events enable row level security;
alter table public.recommendation_scores enable row level security;
alter table public.lyrics enable row level security;
alter table public.lyrics_jobs enable row level security;
alter table public.comments enable row level security;
alter table public.reports enable row level security;
alter table public.notifications enable row level security;
alter table public.subscriptions enable row level security;
alter table public.admin_actions enable row level security;
alter table public.user_settings enable row level security;
alter table public.search_history enable row level security;

create policy "profiles self read/write" on public.profiles
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "songs public approved read" on public.songs
for select using (status = 'approved');

create policy "songs artist manage own" on public.songs
for all using (exists (select 1 from public.artist_profiles ap where ap.id = artist_id and ap.user_id = auth.uid()))
with check (exists (select 1 from public.artist_profiles ap where ap.id = artist_id and ap.user_id = auth.uid()));

create policy "playlists owner manage" on public.playlists
for all using (exists (select 1 from public.profiles p where p.id = owner_id and p.user_id = auth.uid()))
with check (exists (select 1 from public.profiles p where p.id = owner_id and p.user_id = auth.uid()));

create policy "playlists public read" on public.playlists
for select using (visibility = 'public');

create policy "playlist songs read via playlist visibility" on public.playlist_songs
for select using (
  exists (
    select 1 from public.playlists p
    where p.id = playlist_id
      and (p.visibility = 'public' or exists (select 1 from public.profiles pr where pr.id = p.owner_id and pr.user_id = auth.uid()))
  )
);

create policy "playlist songs owner manage" on public.playlist_songs
for all using (
  exists (
    select 1 from public.playlists p
    join public.profiles pr on pr.id = p.owner_id
    where p.id = playlist_id and pr.user_id = auth.uid()
  )
) with check (
  exists (
    select 1 from public.playlists p
    join public.profiles pr on pr.id = p.owner_id
    where p.id = playlist_id and pr.user_id = auth.uid()
  )
);

create policy "liked songs self" on public.liked_songs
for all using (exists (select 1 from public.profiles p where p.id = user_id and p.user_id = auth.uid()))
with check (exists (select 1 from public.profiles p where p.id = user_id and p.user_id = auth.uid()));

create policy "history self" on public.listening_history
for all using (exists (select 1 from public.profiles p where p.id = user_id and p.user_id = auth.uid()))
with check (exists (select 1 from public.profiles p where p.id = user_id and p.user_id = auth.uid()));

create policy "events self" on public.play_events
for all using (exists (select 1 from public.profiles p where p.id = user_id and p.user_id = auth.uid()))
with check (exists (select 1 from public.profiles p where p.id = user_id and p.user_id = auth.uid()));

create policy "user settings self" on public.user_settings
for all using (exists (select 1 from public.profiles p where p.id = user_id and p.user_id = auth.uid()))
with check (exists (select 1 from public.profiles p where p.id = user_id and p.user_id = auth.uid()));
