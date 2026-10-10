begin;
-- Phase 4B cleanup: retain migration/history, disable the one-time fixture RPC.
-- No registration flags, data or unrelated objects are deleted or overwritten.
revoke all on function public.ayambil_test_register_fixture(jsonb,uuid) from public,anon,authenticated,service_role;
commit;
