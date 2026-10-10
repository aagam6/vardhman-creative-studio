begin;
-- One-time hosted validation helper. Browser roles never execute this RPC.
-- The authenticated Edge handler supplies the verified administrator UUID.
create function public.ayambil_test_register_fixture(p_body jsonb, p_actor uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb; a jsonb;
begin
 if p_actor is null or not exists(select 1 from public.ayambil_test_admins where user_id=p_actor and enabled) then
  raise exception 'Administrator required' using errcode='42501';
 end if;
 if coalesce(p_body->>'contactName','') not like 'Synthetic %' or p_body->>'mobile' is distinct from '+12025550123' then
  raise exception 'Synthetic fixtures only';
 end if;
 for a in select value from jsonb_array_elements(p_body->'attendees') loop
  if coalesce(a->>'fullName','') not like 'Synthetic %' then raise exception 'Synthetic fixtures only'; end if;
 end loop;
 -- Row lock prevents overlapping fixture calls from interfering. This update is
 -- uncommitted: every other session still sees the CLOSED registration gate.
 perform 1 from public.ayambil_test_settings where singleton for update;
 if (select registration_open from public.ayambil_test_settings where singleton) then
  raise exception 'Expected closed test gate';
 end if;
 update public.ayambil_test_settings set registration_open=true where singleton;
 result:=public.ayambil_test_api('register',p_body);
 update public.ayambil_test_settings set registration_open=false where singleton;
 return result;
 -- Any error rolls back both the gate update and all registration writes.
end $$;
revoke all on function public.ayambil_test_register_fixture(jsonb,uuid) from public,anon,authenticated;
grant execute on function public.ayambil_test_register_fixture(jsonb,uuid) to service_role;
commit;
