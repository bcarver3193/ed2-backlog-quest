-- Run as an administrator after the initial migration. Test rows are rolled back.
begin;

-- The owner exists only for this transaction; no real account is created.
select set_config('request.jwt.claim.sub', gen_random_uuid()::text, true);
insert into auth.users(id) values (auth.uid());

do $$
declare
  game public.games%rowtype;
  original_id uuid;
  original_created_at timestamptz;
  bad_title text;
  bad_rating integer;
begin
  insert into public.games (title) values ('Backlog Quest smoke test') returning * into game;
  if game.id is null or game.status <> 'Backlog' or game.rating is not null
      or game.created_at is null or game.updated_at is null then
    raise exception 'Default values failed';
  end if;
  original_id := game.id;
  original_created_at := game.created_at;

  update public.games set status = 'Completed', rating = 10, notes = 'Test',
    id = gen_random_uuid(), created_at = '2000-01-01', updated_at = '2000-01-01'
  where id = original_id returning * into game;
  if game.id <> original_id or game.created_at <> original_created_at
      or game.updated_at <= '2000-01-01'::timestamptz
      or game.status <> 'Completed' or game.rating <> 10 or game.notes <> 'Test' then
    raise exception 'Update or timestamp protection failed';
  end if;

  foreach bad_title in array array['', '   ', E'\t\n'] loop
    begin
      insert into public.games (title) values (bad_title);
      raise exception 'Invalid title accepted';
    exception when check_violation then null;
    end;
  end loop;

  begin
    insert into public.games (title) values (null);
    raise exception 'Null title accepted';
  exception when not_null_violation then null;
  end;

  begin
    insert into public.games (title, status) values ('Test', 'Invalid');
    raise exception 'Invalid status accepted';
  exception when check_violation then null;
  end;

  foreach bad_rating in array array[0, 11] loop
    begin
      insert into public.games (title, rating) values ('Test', bad_rating);
      raise exception 'Invalid rating accepted';
    exception when check_violation then null;
    end;
  end loop;

  if not (select relrowsecurity from pg_class where oid = 'public.games'::regclass) then
    raise exception 'Row level security is disabled';
  end if;
  if (select count(*) from pg_policies where schemaname = 'public' and tablename = 'games') <> 4 then
    raise exception 'Expected four ownership policies';
  end if;
  if has_table_privilege('anon', 'public.games', 'SELECT,INSERT,UPDATE,DELETE') then
    raise exception 'Unexpected anonymous privileges';
  end if;

  delete from public.games where id = original_id;
  if exists (select 1 from public.games where id = original_id) then
    raise exception 'Delete failed';
  end if;
  raise notice 'Games smoke checks passed; test transaction will be rolled back.';
end;
$$;

rollback;
