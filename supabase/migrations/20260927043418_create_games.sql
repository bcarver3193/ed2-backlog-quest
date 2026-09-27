-- Initial schema. Browser access stays closed until an access model is chosen.
begin;

create table public.games (
  id uuid primary key default gen_random_uuid(),
  title text not null check (title ~ '[^[:space:]]'),
  platform text,
  status text not null default 'Backlog'
    check (status in ('Backlog', 'Playing', 'Completed', 'Dropped')),
  rating integer check (rating between 1 and 10),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create function public.set_games_timestamps()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if TG_OP = 'INSERT' then
    NEW.created_at := statement_timestamp();
  else
    NEW.id := OLD.id;
    NEW.created_at := OLD.created_at;
  end if;
  NEW.updated_at := statement_timestamp();
  return NEW;
end;
$$;

create trigger games_set_timestamps
before insert or update on public.games
for each row execute function public.set_games_timestamps();

alter table public.games enable row level security;
revoke all on table public.games from anon, authenticated;
grant select, insert, update, delete on table public.games to service_role;
revoke execute on function public.set_games_timestamps() from public, anon, authenticated;

commit;
