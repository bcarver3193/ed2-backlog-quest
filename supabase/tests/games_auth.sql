-- Database authorization test: synthetic Auth users and rows are rolled back.
begin;
select set_config('test.user_a', gen_random_uuid()::text, true);
select set_config('test.user_b', gen_random_uuid()::text, true);
insert into auth.users (id) values
  (current_setting('test.user_a')::uuid),
  (current_setting('test.user_b')::uuid);

set local role authenticated;
select set_config('request.jwt.claim.sub', current_setting('test.user_a'), true);
insert into public.games(title) values ('Owner A test');
select set_config('request.jwt.claim.sub', current_setting('test.user_b'), true);
insert into public.games(title) values ('Owner B test');

do $$
declare affected integer;
begin
  if (select count(*) from public.games) <> 1 then
    raise exception 'Cross-user read isolation failed';
  end if;
  if not exists(select 1 from public.games where title = 'Owner B test'
    and user_id = auth.uid()) then
    raise exception 'Default ownership failed';
  end if;
  update public.games set notes = 'Unauthorized' where user_id = current_setting('test.user_a')::uuid;
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'Cross-user update allowed'; end if;
  delete from public.games where user_id = current_setting('test.user_a')::uuid;
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'Cross-user delete allowed'; end if;
  begin
    insert into public.games(title,user_id) values ('Spoof',current_setting('test.user_a')::uuid);
    raise exception 'Spoofed owner insert allowed';
  exception when insufficient_privilege then null;
  end;
  begin
    update public.games set user_id = current_setting('test.user_a')::uuid;
    raise exception 'Ownership transfer allowed';
  exception when insufficient_privilege then null;
  end;
  update public.games set status = 'Completed', rating = 10, notes = 'Owner edit';
  get diagnostics affected = row_count;
  if affected <> 1 then raise exception 'Owner update failed'; end if;
  delete from public.games;
  get diagnostics affected = row_count;
  if affected <> 1 then raise exception 'Owner delete failed'; end if;
end;
$$;

-- A token without a user subject must not authorize any rows.
select set_config('request.jwt.claim.sub', '', true);
do $$
begin
  if exists(select 1 from public.games) then raise exception 'Missing identity can read games'; end if;
  begin
    insert into public.games(title,user_id) values ('No identity',current_setting('test.user_a')::uuid);
    raise exception 'Missing identity can insert games';
  exception when insufficient_privilege then null;
  end;
end;
$$;

set local role anon;
do $$
begin
  begin
    perform 1 from public.games;
    raise exception 'Anonymous read allowed';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.games(title) values ('Anonymous');
    raise exception 'Anonymous insert allowed';
  exception when insufficient_privilege then null;
  end;
  begin
    update public.games set notes = 'Anonymous';
    raise exception 'Anonymous update allowed';
  exception when insufficient_privilege then null;
  end;
  begin
    delete from public.games;
    raise exception 'Anonymous delete allowed';
  exception when insufficient_privilege then null;
  end;
end;
$$;

reset role;
do $$
begin
  if not exists(select 1 from public.games where user_id = current_setting('test.user_a')::uuid
    and notes is null) then raise exception 'Other account data changed'; end if;
end;
$$;
select 'PASS: owner CRUD, cross-user isolation, spoofing and anonymous denial' as result;
rollback;
