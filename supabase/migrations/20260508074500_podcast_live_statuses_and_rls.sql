-- Podcast + live room status model and role-based permissions

-- 1) Status columns
alter table public.podcasts
  add column if not exists status text not null default 'published';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'podcasts_status_check'
  ) then
    alter table public.podcasts
      add constraint podcasts_status_check
      check (status in ('draft','processing_transcript','published','hidden_by_creator','removed_by_admin'));
  end if;
end $$;

alter table public.podcast_episodes
  add column if not exists status text not null default 'published';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'podcast_episodes_status_check'
  ) then
    alter table public.podcast_episodes
      add constraint podcast_episodes_status_check
      check (status in ('draft','processing_transcript','published','hidden_by_creator','removed_by_admin'));
  end if;
end $$;

alter table public.live_rooms
  alter column status type text,
  alter column status set default 'live';

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'live_rooms_status_check'
  ) then
    alter table public.live_rooms drop constraint live_rooms_status_check;
  end if;
  alter table public.live_rooms
    add constraint live_rooms_status_check
    check (status in ('scheduled','live','ended','removed_by_admin'));
end $$;

-- Backfill
update public.podcasts set status = 'published' where status is null;
update public.podcast_episodes set status = 'published' where status is null;
update public.live_rooms set status = 'live' where status is null;

-- 2) RLS enable
alter table public.podcasts enable row level security;
alter table public.podcast_episodes enable row level security;
alter table public.podcast_followers enable row level security;
alter table public.podcast_history enable row level security;
alter table public.podcast_comments enable row level security;
alter table public.saved_podcast_episodes enable row level security;
alter table public.live_rooms enable row level security;
alter table public.live_room_participants enable row level security;
alter table public.live_room_speakers enable row level security;
alter table public.live_room_messages enable row level security;
alter table public.live_room_reactions enable row level security;
alter table public.live_room_requests enable row level security;

-- 3) Drop old policies if they exist
drop policy if exists "podcasts public read" on public.podcasts;
drop policy if exists "podcasts creator manage" on public.podcasts;
drop policy if exists "podcasts admin moderate" on public.podcasts;
drop policy if exists "podcast episodes public read" on public.podcast_episodes;
drop policy if exists "podcast episodes creator manage" on public.podcast_episodes;
drop policy if exists "podcast episodes admin moderate" on public.podcast_episodes;
drop policy if exists "podcast followers self" on public.podcast_followers;
drop policy if exists "podcast history self" on public.podcast_history;
drop policy if exists "saved podcast episodes self" on public.saved_podcast_episodes;
drop policy if exists "podcast comments read published episodes" on public.podcast_comments;
drop policy if exists "podcast comments self insert" on public.podcast_comments;
drop policy if exists "podcast comments creator moderate" on public.podcast_comments;
drop policy if exists "live rooms public read" on public.live_rooms;
drop policy if exists "live rooms artist host create" on public.live_rooms;
drop policy if exists "live rooms host manage own" on public.live_rooms;
drop policy if exists "live rooms admin moderate" on public.live_rooms;
drop policy if exists "live room participants read room members" on public.live_room_participants;
drop policy if exists "live room participants self join_leave" on public.live_room_participants;
drop policy if exists "live room speakers read room members" on public.live_room_speakers;
drop policy if exists "live room speakers host manage" on public.live_room_speakers;
drop policy if exists "live room messages read room members" on public.live_room_messages;
drop policy if exists "live room messages self send" on public.live_room_messages;
drop policy if exists "live room reactions read room members" on public.live_room_reactions;
drop policy if exists "live room reactions self send" on public.live_room_reactions;
drop policy if exists "live room requests read room members" on public.live_room_requests;
drop policy if exists "live room requests self create" on public.live_room_requests;
drop policy if exists "live room requests host manage" on public.live_room_requests;

-- 4) Podcast policies
create policy "podcasts public read" on public.podcasts
for select using (status in ('published','processing_transcript'));

create policy "podcasts creator manage" on public.podcasts
for all using (
  exists (
    select 1
    from public.profiles p
    where p.id = creator_profile_id
      and p.user_id = auth.uid()
      and p.account_type in ('artist','both')
  )
) with check (
  exists (
    select 1
    from public.profiles p
    where p.id = creator_profile_id
      and p.user_id = auth.uid()
      and p.account_type in ('artist','both')
  )
);

create policy "podcasts admin moderate" on public.podcasts
for update using (
  exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin')
) with check (
  exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin')
);

create policy "podcast episodes public read" on public.podcast_episodes
for select using (
  status in ('published','processing_transcript')
  and exists (
    select 1 from public.podcasts p
    where p.id = podcast_id and p.status in ('published','processing_transcript')
  )
);

create policy "podcast episodes creator manage" on public.podcast_episodes
for all using (
  exists (
    select 1
    from public.podcasts p
    join public.profiles pr on pr.id = p.creator_profile_id
    where p.id = podcast_id
      and pr.user_id = auth.uid()
      and pr.account_type in ('artist','both')
  )
) with check (
  exists (
    select 1
    from public.podcasts p
    join public.profiles pr on pr.id = p.creator_profile_id
    where p.id = podcast_id
      and pr.user_id = auth.uid()
      and pr.account_type in ('artist','both')
  )
);

create policy "podcast episodes admin moderate" on public.podcast_episodes
for update using (
  exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin')
) with check (
  exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin')
);

create policy "podcast followers self" on public.podcast_followers
for all using (
  exists (select 1 from public.profiles p where p.id = user_id and p.user_id = auth.uid())
) with check (
  exists (select 1 from public.profiles p where p.id = user_id and p.user_id = auth.uid())
);

create policy "podcast history self" on public.podcast_history
for all using (
  exists (select 1 from public.profiles p where p.id = user_id and p.user_id = auth.uid())
) with check (
  exists (select 1 from public.profiles p where p.id = user_id and p.user_id = auth.uid())
);

create policy "saved podcast episodes self" on public.saved_podcast_episodes
for all using (
  exists (select 1 from public.profiles p where p.id = user_id and p.user_id = auth.uid())
) with check (
  exists (select 1 from public.profiles p where p.id = user_id and p.user_id = auth.uid())
);

create policy "podcast comments read published episodes" on public.podcast_comments
for select using (
  exists (
    select 1 from public.podcast_episodes pe
    where pe.id = episode_id and pe.status in ('published','processing_transcript')
  )
);

create policy "podcast comments self insert" on public.podcast_comments
for insert with check (
  exists (select 1 from public.profiles p where p.id = user_id and p.user_id = auth.uid())
);

create policy "podcast comments creator moderate" on public.podcast_comments
for delete using (
  exists (
    select 1
    from public.podcast_episodes pe
    join public.podcasts pod on pod.id = pe.podcast_id
    join public.profiles pr on pr.id = pod.creator_profile_id
    where pe.id = episode_id and pr.user_id = auth.uid()
  )
  or exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin')
);

-- 5) Live room policies
create policy "live rooms public read" on public.live_rooms
for select using (status in ('live','scheduled'));

create policy "live rooms artist host create" on public.live_rooms
for insert with check (
  exists (
    select 1
    from public.profiles p
    where p.id = host_user_id
      and p.user_id = auth.uid()
      and p.account_type in ('artist','both')
  )
);

create policy "live rooms host manage own" on public.live_rooms
for update using (
  exists (select 1 from public.profiles p where p.id = host_user_id and p.user_id = auth.uid())
) with check (
  exists (select 1 from public.profiles p where p.id = host_user_id and p.user_id = auth.uid())
);

create policy "live rooms admin moderate" on public.live_rooms
for update using (
  exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin')
) with check (
  exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin')
);

create policy "live room participants read room members" on public.live_room_participants
for select using (
  exists (
    select 1 from public.live_rooms lr
    where lr.id = room_id and lr.status in ('live','scheduled')
  )
);

create policy "live room participants self join_leave" on public.live_room_participants
for all using (
  exists (select 1 from public.profiles p where p.id = user_id and p.user_id = auth.uid())
) with check (
  exists (select 1 from public.profiles p where p.id = user_id and p.user_id = auth.uid())
);

create policy "live room speakers read room members" on public.live_room_speakers
for select using (
  exists (
    select 1 from public.live_rooms lr
    where lr.id = room_id and lr.status in ('live','scheduled')
  )
);

create policy "live room speakers host manage" on public.live_room_speakers
for all using (
  exists (
    select 1
    from public.live_rooms lr
    join public.profiles p on p.id = lr.host_user_id
    where lr.id = room_id and p.user_id = auth.uid()
  )
) with check (
  exists (
    select 1
    from public.live_rooms lr
    join public.profiles p on p.id = lr.host_user_id
    where lr.id = room_id and p.user_id = auth.uid()
  )
);

create policy "live room messages read room members" on public.live_room_messages
for select using (
  exists (
    select 1 from public.live_rooms lr
    where lr.id = room_id and lr.status in ('live','scheduled')
  )
);

create policy "live room messages self send" on public.live_room_messages
for insert with check (
  exists (select 1 from public.profiles p where p.id = user_id and p.user_id = auth.uid())
);

create policy "live room reactions read room members" on public.live_room_reactions
for select using (
  exists (
    select 1 from public.live_rooms lr
    where lr.id = room_id and lr.status in ('live','scheduled')
  )
);

create policy "live room reactions self send" on public.live_room_reactions
for insert with check (
  exists (select 1 from public.profiles p where p.id = user_id and p.user_id = auth.uid())
);

create policy "live room requests read room members" on public.live_room_requests
for select using (
  exists (
    select 1 from public.live_rooms lr
    where lr.id = room_id and lr.status in ('live','scheduled')
  )
);

create policy "live room requests self create" on public.live_room_requests
for insert with check (
  exists (select 1 from public.profiles p where p.id = user_id and p.user_id = auth.uid())
);

create policy "live room requests host manage" on public.live_room_requests
for update using (
  exists (
    select 1
    from public.live_rooms lr
    join public.profiles p on p.id = lr.host_user_id
    where lr.id = room_id and p.user_id = auth.uid()
  )
) with check (
  exists (
    select 1
    from public.live_rooms lr
    join public.profiles p on p.id = lr.host_user_id
    where lr.id = room_id and p.user_id = auth.uid()
  )
);
