create table if not exists public.push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  expo_push_token text not null,
  device_type text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, expo_push_token)
);

create table if not exists public.push_delivery_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  expo_push_token text not null,
  ticket_id text,
  status text not null default 'queued',
  title text,
  body text,
  payload jsonb not null default '{}'::jsonb,
  error_message text,
  created_at timestamptz not null default now()
);

create table if not exists public.push_receipts (
  id uuid primary key default gen_random_uuid(),
  ticket_id text unique not null,
  status text not null,
  message text,
  details jsonb,
  checked_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_push_logs_ticket_id on public.push_delivery_logs(ticket_id);
create index if not exists idx_push_receipts_status on public.push_receipts(status);

alter table public.push_tokens enable row level security;
alter table public.push_delivery_logs enable row level security;
alter table public.push_receipts enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'push_tokens' and policyname = 'push tokens self manage'
  ) then
    execute 'create policy "push tokens self manage" on public.push_tokens
      for all using (exists (select 1 from public.profiles p where p.id = user_id and p.user_id = auth.uid()))
      with check (exists (select 1 from public.profiles p where p.id = user_id and p.user_id = auth.uid()))';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'push_delivery_logs' and policyname = 'push delivery logs self read'
  ) then
    execute 'create policy "push delivery logs self read" on public.push_delivery_logs
      for select using (exists (select 1 from public.profiles p where p.id = user_id and p.user_id = auth.uid()))';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'push_receipts' and policyname = 'push receipts authenticated read'
  ) then
    execute 'create policy "push receipts authenticated read" on public.push_receipts
      for select using (auth.role() = ''authenticated'')';
  end if;
end $$;
