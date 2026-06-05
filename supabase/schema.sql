create table if not exists public.memory_state (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.memory_state enable row level security;

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

create or replace function public.save_memory_state(
  p_data jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  saved_data jsonb;
begin
  insert into public.memory_state (id, data, updated_at)
  values ('default', p_data, now())
  on conflict (id) do update
    set data = excluded.data,
        updated_at = now()
  returning data into saved_data;

  return saved_data;
end;
$$;

drop function if exists public.save_memory_state(jsonb, text);
grant execute on function public.save_memory_state(jsonb) to anon, authenticated;

insert into storage.buckets (id, name, public)
values ('between-us-images', 'between-us-images', true)
on conflict (id) do update set public = true;
