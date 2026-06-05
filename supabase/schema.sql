create table if not exists public.memory_state (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.memory_state enable row level security;

drop policy if exists "memory_state_read_disabled" on public.memory_state;
drop policy if exists "memory_state_write_disabled" on public.memory_state;

create policy "memory_state_read_disabled"
on public.memory_state
for select
using (false);

create policy "memory_state_write_disabled"
on public.memory_state
for all
using (false)
with check (false);

insert into storage.buckets (id, name, public)
values ('between-us-images', 'between-us-images', true)
on conflict (id) do update set public = true;
