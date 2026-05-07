alter table public.user_settings
  add column if not exists audio_quality text default 'normal',
  add column if not exists gapless_playback boolean not null default false,
  add column if not exists auto_play_on_bluetooth boolean not null default false,
  add column if not exists improve_recommendations boolean not null default true,
  add column if not exists hidden_genres jsonb not null default '[]'::jsonb,
  add column if not exists muted_artists jsonb not null default '[]'::jsonb,
  add column if not exists save_podcast_progress boolean not null default true,
  add column if not exists default_podcast_speed numeric not null default 1.0,
  add column if not exists default_radio_mood text,
  add column if not exists default_radio_genre text,
  add column if not exists allow_party_invites boolean not null default true,
  add column if not exists allow_live_room_invites boolean not null default true,
  add column if not exists lyrics_auto_generate boolean not null default true;

create table if not exists public.notification_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references public.profiles(id) on delete cascade,
  all_notifications boolean not null default true,
  new_song_release boolean not null default true,
  podcast_new_episode boolean not null default true,
  playlist_likes boolean not null default true,
  new_followers boolean not null default true,
  comments_replies boolean not null default true,
  party_invites boolean not null default true,
  live_room_invites boolean not null default true,
  lyrics_generated boolean not null default true,
  email_notifications boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.privacy_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references public.profiles(id) on delete cascade,
  private_account boolean not null default false,
  show_listening_activity boolean not null default true,
  show_public_playlists boolean not null default true,
  blocked_users jsonb not null default '[]'::jsonb,
  content_filters jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.playback_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references public.profiles(id) on delete cascade,
  autoplay_recommendations boolean not null default true,
  crossfade_seconds int not null default 0,
  gapless_playback boolean not null default false,
  audio_quality text not null default 'normal',
  normalize_volume boolean not null default true,
  explicit_content_filter boolean not null default true,
  auto_play_on_bluetooth boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.podcast_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references public.profiles(id) on delete cascade,
  auto_download_followed boolean not null default false,
  default_playback_speed numeric not null default 1.0,
  save_progress boolean not null default true,
  new_episode_notifications boolean not null default true,
  transcript_language text default 'en',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.mood_radio_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references public.profiles(id) on delete cascade,
  default_mood text,
  default_genre text,
  use_listening_history boolean not null default true,
  hide_repeated_songs boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.party_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references public.profiles(id) on delete cascade,
  allow_friend_invites boolean not null default true,
  allow_follower_join_public boolean not null default true,
  party_notifications boolean not null default true,
  auto_sync_playback boolean not null default true,
  allow_song_suggestions boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.live_room_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references public.profiles(id) on delete cascade,
  allow_room_invites boolean not null default true,
  allow_microphone_requests boolean not null default true,
  room_notifications boolean not null default true,
  show_active_status boolean not null default true,
  blocked_room_users jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.artist_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references public.profiles(id) on delete cascade,
  upload_defaults jsonb not null default '{}'::jsonb,
  lyrics_auto_generate boolean not null default true,
  allow_fan_lyric_suggestions boolean not null default false,
  analytics_email_reports boolean not null default false,
  fan_messaging boolean not null default true,
  promotion_settings jsonb not null default '{}'::jsonb,
  payout_settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.podcasts (
  id uuid primary key default gen_random_uuid(),
  creator_profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  cover_path text,
  category_id uuid,
  release_schedule timestamptz,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.podcast_categories (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  created_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'podcasts_category_fk'
  ) then
    alter table public.podcasts
      add constraint podcasts_category_fk
      foreign key (category_id) references public.podcast_categories(id) on delete set null;
  end if;
end $$;

create table if not exists public.podcast_episodes (
  id uuid primary key default gen_random_uuid(),
  podcast_id uuid not null references public.podcasts(id) on delete cascade,
  title text not null,
  description text,
  cover_path text,
  audio_path text not null,
  duration_seconds int,
  release_date timestamptz,
  transcript_text text,
  transcript_json jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.podcast_followers (
  id uuid primary key default gen_random_uuid(),
  podcast_id uuid not null references public.podcasts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(podcast_id, user_id)
);

create table if not exists public.podcast_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  episode_id uuid not null references public.podcast_episodes(id) on delete cascade,
  playback_seconds int not null default 0,
  completed boolean not null default false,
  playback_speed numeric not null default 1.0,
  updated_at timestamptz not null default now(),
  unique(user_id, episode_id)
);

create table if not exists public.podcast_comments (
  id uuid primary key default gen_random_uuid(),
  episode_id uuid not null references public.podcast_episodes(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  parent_comment_id uuid references public.podcast_comments(id) on delete cascade,
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.saved_podcast_episodes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  episode_id uuid not null references public.podcast_episodes(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, episode_id)
);

create table if not exists public.radio_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  mood text not null,
  genre text,
  started_at timestamptz not null default now(),
  ended_at timestamptz
);

create table if not exists public.radio_queue (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.radio_sessions(id) on delete cascade,
  song_id uuid not null references public.songs(id) on delete cascade,
  position int not null,
  generated_score numeric default 0,
  played boolean not null default false,
  created_at timestamptz not null default now(),
  unique(session_id, position)
);

create table if not exists public.radio_feedback (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.radio_sessions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  song_id uuid not null references public.songs(id) on delete cascade,
  feedback text not null check (feedback in ('like','dislike','skip','save','hide_artist','replay')),
  created_at timestamptz not null default now()
);

create table if not exists public.radio_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references public.profiles(id) on delete cascade,
  default_mood text,
  default_genre text,
  use_history boolean not null default true,
  hide_repeats boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.listening_parties (
  id uuid primary key default gen_random_uuid(),
  host_user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  is_public boolean not null default false,
  status text not null default 'active' check (status in ('active','ended')),
  created_at timestamptz not null default now(),
  ended_at timestamptz
);

create table if not exists public.party_members (
  id uuid primary key default gen_random_uuid(),
  party_id uuid not null references public.listening_parties(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'guest' check (role in ('host','guest')),
  joined_at timestamptz not null default now(),
  unique(party_id, user_id)
);

create table if not exists public.party_queue (
  id uuid primary key default gen_random_uuid(),
  party_id uuid not null references public.listening_parties(id) on delete cascade,
  song_id uuid not null references public.songs(id) on delete cascade,
  position int not null,
  suggested_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  unique(party_id, position)
);

create table if not exists public.party_messages (
  id uuid primary key default gen_random_uuid(),
  party_id uuid not null references public.listening_parties(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.party_reactions (
  id uuid primary key default gen_random_uuid(),
  party_id uuid not null references public.listening_parties(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  reaction text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.party_votes (
  id uuid primary key default gen_random_uuid(),
  party_id uuid not null references public.listening_parties(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  vote_type text not null check (vote_type in ('skip','keep')),
  created_at timestamptz not null default now(),
  unique(party_id, user_id, vote_type)
);

create table if not exists public.party_playback_state (
  id uuid primary key default gen_random_uuid(),
  party_id uuid unique not null references public.listening_parties(id) on delete cascade,
  song_id uuid references public.songs(id),
  playback_seconds int not null default 0,
  is_playing boolean not null default false,
  updated_by uuid references public.profiles(id),
  updated_at timestamptz not null default now()
);

create table if not exists public.live_rooms (
  id uuid primary key default gen_random_uuid(),
  host_user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  room_type text default 'music_discussion',
  status text not null default 'live' check (status in ('live','ended')),
  created_at timestamptz not null default now(),
  ended_at timestamptz
);

create table if not exists public.live_room_participants (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.live_rooms(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'listener' check (role in ('host','speaker','listener')),
  joined_at timestamptz not null default now(),
  unique(room_id, user_id)
);

create table if not exists public.live_room_speakers (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.live_rooms(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  is_muted boolean not null default false,
  added_at timestamptz not null default now(),
  unique(room_id, user_id)
);

create table if not exists public.live_room_messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.live_rooms(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.live_room_reactions (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.live_rooms(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  reaction text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.live_room_requests (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.live_rooms(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  request_type text not null check (request_type in ('speak','invite')),
  status text not null default 'pending' check (status in ('pending','accepted','rejected')),
  created_at timestamptz not null default now()
);

