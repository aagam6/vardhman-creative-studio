-- Read-only assertions to run against the local/test project after migrations.
-- No fixture inserts, no flag changes, no deletion, no production data exports.
do $$
declare t text;
begin
  foreach t in array array['settings','admins','sessions','bookings','attendees','registrations','passes','messages','audit'] loop
    if not exists(select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='ayambil_test_'||t and c.relrowsecurity) then
      raise exception 'RLS missing on %',t;
    end if;
    if has_table_privilege('anon','public.ayambil_test_'||t,'SELECT') or has_table_privilege('authenticated','public.ayambil_test_'||t,'SELECT') or has_table_privilege('authenticated','public.ayambil_test_'||t,'UPDATE') then
      raise exception 'Unexpected browser privilege on %',t;
    end if;
  end loop;
  if has_function_privilege('anon','public.ayambil_test_api(text,jsonb,uuid)','EXECUTE') or has_function_privilege('authenticated','public.ayambil_test_api(text,jsonb,uuid)','EXECUTE') then
    raise exception 'Browser may execute privileged RPC';
  end if;
  if has_schema_privilege('anon','ayambil_private','USAGE') or has_schema_privilege('authenticated','ayambil_private','USAGE') then
    raise exception 'Private schema exposed';
  end if;
end $$;
