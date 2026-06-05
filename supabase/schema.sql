create extension if not exists pgcrypto with schema extensions;

create table if not exists public.memory_state (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.memory_settings (
  id text primary key,
  admin_code_hash text not null,
  updated_at timestamptz not null default now()
);

alter table public.memory_state enable row level security;
alter table public.memory_settings enable row level security;

drop policy if exists "memory_state_read_disabled" on public.memory_state;
drop policy if exists "memory_state_public_read" on public.memory_state;
drop policy if exists "memory_state_write_disabled" on public.memory_state;

create policy "memory_state_public_read"
on public.memory_state
for select
using (true);

create policy "memory_state_write_disabled"
on public.memory_state
for all
using (false)
with check (false);

insert into public.memory_settings (id, admin_code_hash)
values ('default', extensions.crypt('change-me', extensions.gen_salt('bf')))
on conflict (id) do nothing;

-- Run this after the schema, and replace the value with your shared admin code:
-- update public.memory_settings
-- set admin_code_hash = extensions.crypt('your-shared-admin-code', extensions.gen_salt('bf')),
--     updated_at = now()
-- where id = 'default';

create or replace function public.save_memory_state(
  p_data jsonb,
  p_admin_code text
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  saved_data jsonb;
begin
  if not exists (
    select 1
    from public.memory_settings
    where id = 'default'
      and admin_code_hash = extensions.crypt(p_admin_code, admin_code_hash)
  ) then
    raise exception 'Invalid admin code' using errcode = '28000';
  end if;

  insert into public.memory_state (id, data, updated_at)
  values ('default', p_data, now())
  on conflict (id) do update
    set data = excluded.data,
        updated_at = now()
  returning data into saved_data;

  return saved_data;
end;
$$;

grant execute on function public.save_memory_state(jsonb, text) to anon, authenticated;

insert into storage.buckets (id, name, public)
values ('between-us-images', 'between-us-images', true)
on conflict (id) do update set public = true;
