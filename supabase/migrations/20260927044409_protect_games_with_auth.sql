-- Supabase Auth ownership: every game belongs to one signed-in user.
alter table public.games
  add column user_id uuid not null default auth.uid()
  references auth.users(id) on delete cascade;

create index games_user_id_idx on public.games(user_id);

grant select, insert, update, delete on public.games to authenticated;
revoke all on public.games from anon;

create policy games_select_own on public.games
for select to authenticated
using ((select auth.uid()) = user_id);

create policy games_insert_own on public.games
for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy games_update_own on public.games
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy games_delete_own on public.games
for delete to authenticated
using ((select auth.uid()) = user_id);
