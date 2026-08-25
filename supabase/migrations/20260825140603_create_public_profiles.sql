create schema if not exists private;
revoke all on schema private from public;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (char_length(display_name) <= 80),
  avatar_url text,
  created_at timestamptz not null,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to anon, authenticated;
grant insert, update on public.profiles to authenticated;

drop policy if exists "Profiles are publicly readable" on public.profiles;
create policy "Profiles are publicly readable"
on public.profiles
for select
to anon, authenticated
using (true);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
on public.profiles
for insert
to authenticated
with check ((select auth.uid()) = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create or replace function private.sync_user_public_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (
    id,
    display_name,
    avatar_url,
    created_at,
    updated_at
  )
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data->>'display_name'), ''),
      nullif(trim(new.raw_user_meta_data->>'full_name'), '')
    ),
    nullif(trim(new.raw_user_meta_data->>'avatar_url'), ''),
    new.created_at,
    now()
  )
  on conflict (id) do update
  set
    display_name = excluded.display_name,
    avatar_url = excluded.avatar_url,
    updated_at = now();

  return new;
end;
$$;

revoke all on function private.sync_user_public_profile()
from public, anon, authenticated;

drop trigger if exists sync_auth_user_public_profile on auth.users;
create trigger sync_auth_user_public_profile
after insert or update of raw_user_meta_data
on auth.users
for each row
execute function private.sync_user_public_profile();

insert into public.profiles (
  id,
  display_name,
  avatar_url,
  created_at,
  updated_at
)
select
  id,
  coalesce(
    nullif(trim(raw_user_meta_data->>'display_name'), ''),
    nullif(trim(raw_user_meta_data->>'full_name'), '')
  ),
  nullif(trim(raw_user_meta_data->>'avatar_url'), ''),
  created_at,
  now()
from auth.users
on conflict (id) do update
set
  display_name = excluded.display_name,
  avatar_url = excluded.avatar_url,
  created_at = excluded.created_at,
  updated_at = now();
