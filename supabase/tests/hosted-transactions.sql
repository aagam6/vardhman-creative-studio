-- TEST PROJECT ONLY. All fixtures and flag changes roll back together.
-- Other sessions continue to see registration_open=false throughout this test.
begin;
do $$
declare a jsonb; b jsonb; again jsonb; payload jsonb; k text; bid uuid; aid uuid;
 admin_id uuid := gen_random_uuid(); before_count bigint; denied boolean;
begin
 if (select registration_open from public.ayambil_test_settings) then raise exception 'Expected closed test gate'; end if;
 select count(*) into before_count from public.ayambil_test_bookings;
 update public.ayambil_test_settings set registration_open=true;
 insert into auth.users(id) values(admin_id);
 insert into public.ayambil_test_admins(user_id,enabled) values(admin_id,true);
 payload:=jsonb_build_object('requestKey',ayambil_private.key(),'contactName','Synthetic Test Contact','mobile','+12025550123','whatsappConsent',true,'termsAccepted',true,'eventDate','2026-11-02','attendees',jsonb_build_array(jsonb_build_object('fullName','Synthetic First','dates',jsonb_build_array('2026-11-02'))));
 a:=public.ayambil_test_api('register',payload);
 again:=public.ayambil_test_api('register',payload);
 if a->>'number' is distinct from again->>'number' then raise exception 'Idempotency failed'; end if;
 denied:=false;
 begin perform public.ayambil_test_api('register',payload||'{"contactName":"Changed Contact"}'::jsonb); exception when others then denied:=true; end;
 if not denied then raise exception 'Conflicting retry allowed'; end if;
 payload:=payload||jsonb_build_object('requestKey',ayambil_private.key(),'eventDate','2026-11-03','attendees',jsonb_build_array(jsonb_build_object('fullName','Synthetic Second','dates',jsonb_build_array('2026-11-03')),jsonb_build_object('fullName','Synthetic Third','dates',jsonb_build_array('2026-11-03'))));
 b:=public.ayambil_test_api('register',payload);
 if jsonb_array_length(b->'attendees')<>2 or a#>>'{attendees,0,passes,0,sessions,0,venue}'<>'Shri Chandramauleshwar Hall' or b#>>'{attendees,1,passes,0,sessions,0,venue}'<>'Tagore Hall' then raise exception 'Wrong pass date/venue/count'; end if;
 if (select count(*) from public.ayambil_test_bookings)<>before_count+2 then raise exception 'Duplicate booking'; end if;
 select id into bid from public.ayambil_test_bookings where number=a->>'number';
 select id into aid from public.ayambil_test_attendees where booking_id=bid;
 select d.token into k from ayambil_private.downloads d join public.ayambil_test_passes p on p.id=d.pass_id where p.attendee_id=aid;
 again:=public.ayambil_test_api('download',jsonb_build_object('key',k));
 if jsonb_array_length(again->'passes')<>1 or again#>>'{passes,0,attendeeName}'<>'Synthetic First' then raise exception 'Cross-booking download leakage'; end if;
 denied:=false;
 begin perform public.ayambil_test_api('admin/bookings','{}',gen_random_uuid()); exception when insufficient_privilege then denied:=true; end;
 if not denied then raise exception 'Non-admin allowed'; end if;
 perform public.ayambil_test_api('admin/change',jsonb_build_object('bookingId',bid,'action','cancel'),admin_id);
 denied:=false;
 begin perform public.ayambil_test_api('download',jsonb_build_object('key',k)); exception when others then denied:=true; end;
 if not denied then raise exception 'Cancelled download allowed'; end if;
 perform public.ayambil_test_api('admin/change',jsonb_build_object('bookingId',bid,'action','restore'),admin_id);
 perform public.ayambil_test_api('download',jsonb_build_object('key',k));
 perform public.ayambil_test_api('admin/change',jsonb_build_object('bookingId',bid,'attendeeId',aid,'action','reissue'),admin_id);
 denied:=false;
 begin perform public.ayambil_test_api('download',jsonb_build_object('key',k)); exception when others then denied:=true; end;
 if not denied then raise exception 'Superseded key accepted'; end if;
 update public.ayambil_test_messages set status='failed' where booking_id=bid;
 perform public.ayambil_test_api('admin/whatsapp-retry',jsonb_build_object('bookingId',bid),admin_id);
 if (select count(*) from public.ayambil_test_passes where attendee_id=aid)<>2 then raise exception 'Retry duplicated pass'; end if;
 update public.ayambil_test_settings set registration_open=false;
 denied:=false;
 begin perform public.ayambil_test_api('register',payload||jsonb_build_object('requestKey',ayambil_private.key())); exception when others then denied:=true; end;
 if not denied then raise exception 'Closed database gate allowed registration'; end if;
end $$;
-- Artificial pass-write failure is scoped to this rollback-only transaction.
create function ayambil_private.hosted_test_fail_pass() returns trigger language plpgsql as $$
begin raise exception 'Synthetic pass failure'; end $$;
create trigger ayambil_hosted_test_fail before insert on public.ayambil_test_passes
for each row execute function ayambil_private.hosted_test_fail_pass();
do $$ declare before_count bigint; denied boolean:=false; begin
 select count(*) into before_count from public.ayambil_test_bookings;
 update public.ayambil_test_settings set registration_open=true;
 begin
  perform public.ayambil_test_api('register',jsonb_build_object('requestKey',ayambil_private.key(),'contactName','Synthetic Rollback Contact','mobile','+12025550123','whatsappConsent',true,'termsAccepted',true,'eventDate','2026-11-02','attendees',jsonb_build_array(jsonb_build_object('fullName','Synthetic Rollback Attendee','dates',jsonb_build_array('2026-11-02')))));
 exception when others then denied:=true;
 end;
 if not denied or (select count(*) from public.ayambil_test_bookings)<>before_count then raise exception 'Partial registration committed'; end if;
 update public.ayambil_test_settings set registration_open=false;
end $$;
-- Exercise RLS itself as well as revoked grants. This grant is never committed.
grant select on public.ayambil_test_bookings to authenticated;
set local role authenticated;
do $$ begin if exists(select 1 from public.ayambil_test_bookings) then raise exception 'RLS leaked a booking'; end if; end $$;
reset role;
rollback;
select registration_open as registration_open_after_rollback from public.ayambil_test_settings;
