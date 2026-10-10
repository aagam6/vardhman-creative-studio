begin;
create function ayambil_private.sha(v text) returns text language sql immutable
set search_path = '' as $$ select encode(sha256(convert_to(v,'UTF8')),'hex') $$;
create function ayambil_private.key() returns text language sql volatile
set search_path = '' as $$ select replace(gen_random_uuid()::text || gen_random_uuid()::text,'-','') $$;

create function ayambil_private.issue_pass(a uuid) returns void language plpgsql
set search_path = '' as $$
declare pid uuid; n text; who text; session jsonb; token text;
begin
  select x.full_name,s.snapshot into strict who,session
    from public.ayambil_test_attendees x join public.ayambil_test_registrations r on r.attendee_id=x.id
    join public.ayambil_test_sessions s on s.event_date=r.event_date where x.id=a;
  n := 'AYV26-' || upper(replace(gen_random_uuid()::text,'-',''));
  insert into public.ayambil_test_passes(attendee_id,number,snapshot)
    values(a,n,jsonb_build_object('number',n,'attendeeName',who,'eventName','500 Akhand Ayambil Tap — Vijayollas','sessions',jsonb_build_array(session),'issuedAt',now())) returning id into pid;
  token := ayambil_private.key();
  insert into ayambil_private.downloads(pass_id,token_hash,token) values(pid,ayambil_private.sha(token),token);
end $$;

create function ayambil_private.booking(b uuid, privileged boolean default false) returns jsonb language sql stable
set search_path = '' as $$
 select jsonb_build_object('number',x.number,'status',x.status,'eventDate',x.event_date,'created',x.created_at,
   'whatsapp',jsonb_build_object('status',m.status) || case when privileged then jsonb_build_object('failure',m.failure,'attempts',m.attempts,'providerRef',m.provider_ref,'attemptedAt',m.attempted_at,'acceptedAt',m.accepted_at,'deliveredAt',m.delivered_at,'history',m.history) else '{}'::jsonb end,
   'attendees',coalesce((select jsonb_agg(jsonb_build_object('fullName',a.full_name,'status',a.status,'dates',jsonb_build_array(r.event_date),'passes',coalesce((select jsonb_agg(p.snapshot || jsonb_build_object('status',p.status) order by p.created_at,p.id) from public.ayambil_test_passes p where p.attendee_id=a.id),'[]'::jsonb)) || case when privileged then jsonb_build_object('id',a.id) else '{}'::jsonb end order by a.ordinal)
     from public.ayambil_test_attendees a join public.ayambil_test_registrations r on r.attendee_id=a.id where a.booking_id=x.id),'[]'::jsonb))
   || case when privileged then jsonb_build_object('id',x.id,'contactName',x.contact_name,'mobile',x.mobile) else '{}'::jsonb end
 from public.ayambil_test_bookings x left join public.ayambil_test_messages m on m.booking_id=x.id where x.id=b
$$;

-- One HTTP RPC call is one PostgreSQL transaction. No browser role may execute it.
create function public.ayambil_test_api(p_operation text, p_body jsonb default '{}', p_actor uuid default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
 b public.ayambil_test_bookings%rowtype;
 m public.ayambil_test_messages%rowtype;
 a jsonb; aid uuid; i integer := 0; body jsonb; rh text; ph text;
 page integer; result jsonb; new_status text; matches uuid[];
 pass public.ayambil_test_passes%rowtype; count_attempts integer; new_token text;
begin
 if p_operation='status' then
   return jsonb_build_object('ready',true,'open',false,'whatsapp','test_backend');
 end if;
 if p_operation='limit' then
   if coalesce(p_body->>'bucket','') !~ '^[a-f0-9]{64}$' then raise exception 'Invalid rate bucket'; end if;
   insert into ayambil_private.rate_limits(bucket,attempts) values(p_body->>'bucket',1)
    on conflict(bucket) do update set attempts=case when ayambil_private.rate_limits.started_at < now()-interval '1 minute' then 1 else ayambil_private.rate_limits.attempts+1 end,
     started_at=case when ayambil_private.rate_limits.started_at < now()-interval '1 minute' then now() else ayambil_private.rate_limits.started_at end returning attempts into count_attempts;
   delete from ayambil_private.rate_limits where started_at < now()-interval '1 day';
   return jsonb_build_object('allowed',count_attempts<=30);
 end if;
 if p_operation='register' then
   if jsonb_typeof(p_body->'attendees') <> 'array' or coalesce(jsonb_array_length(p_body->'attendees'),0)=0 then raise exception 'Attendees required'; end if;
   if coalesce(p_body->>'requestKey','') !~ '^[a-f0-9]{64}$' then raise exception 'Invalid request identifier'; end if;
   if coalesce(p_body->>'contactName','') !~ '^[^<>[:cntrl:]]{2,120}$' or coalesce(p_body->>'mobile','') !~ '^\+[1-9][0-9]{7,14}$' then raise exception 'Invalid contact'; end if;
   if coalesce(p_body->>'whatsappConsent','') <> 'true' or not exists(select 1 from public.ayambil_test_sessions where event_date::text=p_body->>'eventDate') then raise exception 'Invalid event or consent'; end if;
   for a in select value from jsonb_array_elements(p_body->'attendees') loop
     if coalesce(a->>'fullName','') !~ '^[^<>[:cntrl:]]{2,120}$' or jsonb_typeof(a->'dates') <> 'array' or jsonb_array_length(a->'dates') <> 1 or coalesce(a->'dates'->>0,'') <> p_body->>'eventDate' then raise exception 'Invalid attendee'; end if;
   end loop;
   body := jsonb_build_object('contactName',p_body->>'contactName','mobile',p_body->>'mobile','eventDate',p_body->>'eventDate','whatsappConsent',true,'attendees',p_body->'attendees');
   rh := ayambil_private.sha(p_body->>'requestKey'); ph := ayambil_private.sha(body::text);
   -- Serialize concurrent requests with the same key; different keys remain independent.
   perform pg_advisory_xact_lock(hashtextextended(rh,0));
   select * into b from public.ayambil_test_bookings where request_hash=rh;
   if found then
     if b.payload_hash<>ph then raise exception 'Submission identifier conflict'; end if;
     return ayambil_private.booking(b.id);
   end if;
   if not (select registration_open from public.ayambil_test_settings where singleton) then raise exception 'Registration closed'; end if;
   insert into public.ayambil_test_bookings(number,request_hash,payload_hash,contact_name,mobile,event_date,whatsapp_consent)
    values('BOOK26-'||upper(replace(gen_random_uuid()::text,'-','')),rh,ph,p_body->>'contactName',p_body->>'mobile',(p_body->>'eventDate')::date,true) returning * into b;
   for a in select value from jsonb_array_elements(p_body->'attendees') loop
     i:=i+1;
     insert into public.ayambil_test_attendees(booking_id,full_name,ordinal) values(b.id,a->>'fullName',i) returning id into aid;
     insert into public.ayambil_test_registrations(attendee_id,booking_id,event_date) values(aid,b.id,b.event_date);
     perform ayambil_private.issue_pass(aid);
   end loop;
   insert into public.ayambil_test_messages(booking_id) values(b.id);
   return ayambil_private.booking(b.id);
 end if;
 if p_operation='download' then
   if coalesce(p_body->>'key','') !~ '^[a-f0-9]{64}$' then raise exception 'Download unavailable'; end if;
   select p.* into pass from ayambil_private.downloads d join public.ayambil_test_passes p on p.id=d.pass_id
    join public.ayambil_test_attendees a on a.id=p.attendee_id join public.ayambil_test_bookings bk on bk.id=a.booking_id
    where d.token_hash=ayambil_private.sha(p_body->>'key') and d.expires_at>now() and p.status='active' and a.status='active' and bk.status='active';
   if not found then raise exception 'Download unavailable'; end if;
   return jsonb_build_object('passes',jsonb_build_array(pass.snapshot||jsonb_build_object('status',pass.status)));
 end if;
 -- Worker-only operations: the Edge worker additionally requires a private worker
 -- secret and test-deployment gate, neither obtainable with a publishable key.
 if p_operation='claim' then
   update public.ayambil_test_messages set status='uncertain',failure='Interrupted send: reconcile before retry.' where status='sending' and attempted_at<now()-interval '2 minutes';
   select * into m from public.ayambil_test_messages where status='queued' order by created_at for update skip locked limit 1;
   if not found then return null; end if;
   select * into b from public.ayambil_test_bookings where id=m.booking_id;
   if b.status<>'active' or not b.whatsapp_consent then
     update public.ayambil_test_messages set status='cancelled' where id=m.id; return null;
   end if;
   for pass in select p.* from public.ayambil_test_passes p join public.ayambil_test_attendees a on a.id=p.attendee_id where a.booking_id=b.id and p.status='active' loop
     if exists(select 1 from ayambil_private.downloads where pass_id=pass.id and expires_at<=now()) then
       new_token:=ayambil_private.key(); update ayambil_private.downloads set token=new_token,token_hash=ayambil_private.sha(new_token),expires_at=now()+interval '7 days' where pass_id=pass.id;
     end if;
   end loop;
   update public.ayambil_test_messages set status='sending',attempts=attempts+1,attempt_id=gen_random_uuid(),attempted_at=now(),failure=null where id=m.id returning * into m;
   return jsonb_build_object('id',m.id,'attemptId',m.attempt_id,'booking',ayambil_private.booking(b.id,true),'links',
     (select jsonb_agg(d.token order by a.ordinal) from ayambil_private.downloads d join public.ayambil_test_passes p on p.id=d.pass_id join public.ayambil_test_attendees a on a.id=p.attendee_id where a.booking_id=b.id and p.status='active'));
 end if;
 if p_operation='poll-list' then
   return coalesce((select jsonb_agg(jsonb_build_object('id',id,'ref',provider_ref)) from (select id,provider_ref from public.ayambil_test_messages where provider_ref is not null and status in ('accepted','sent','delivered','uncertain') order by created_at limit 20) q),'[]'::jsonb);
 end if;
 if p_operation in ('send-result','poll-result') then
   select * into strict m from public.ayambil_test_messages where id=(p_body->>'id')::uuid for update;
   new_status:=p_body->>'status';
   if new_status not in ('accepted','sent','delivered','read','failed','uncertain') then raise exception 'Invalid provider state'; end if;
   if p_operation='send-result' and (m.status<>'sending' or m.attempt_id::text<>p_body->>'attemptId') then return jsonb_build_object('ignored',true); end if;
   if p_operation='poll-result' then
     if m.provider_ref is distinct from p_body->>'ref' or m.status in ('cancelled','failed','read') or (m.status='delivered' and new_status not in ('delivered','read')) or (m.status='sent' and new_status='accepted') then return jsonb_build_object('ignored',true); end if;
   end if;
   update public.ayambil_test_messages set status=new_status,provider_ref=coalesce(nullif(p_body->>'ref',''),provider_ref),failure=nullif(p_body->>'failure',''),
     accepted_at=case when p_operation='send-result' and nullif(p_body->>'ref','') is not null then now() else accepted_at end,
     delivered_at=case when new_status in ('delivered','read') then coalesce(delivered_at,now()) else delivered_at end where id=m.id;
   return jsonb_build_object('status',new_status);
 end if;

 if p_actor is null or not exists(select 1 from public.ayambil_test_admins where user_id=p_actor and enabled) then raise exception 'Administrator required' using errcode='42501'; end if;
 if p_operation='admin-check' then return jsonb_build_object('enabled',true); end if;
 if p_operation='admin/bookings' then
   if coalesce(p_body->>'date','') not in ('','2026-11-02','2026-11-03') or coalesce(p_body->>'status','') not in ('','active','cancelled') then raise exception 'Invalid filter'; end if;
   page := greatest(1,least(100000,coalesce((p_body->>'page')::integer,1)));
   select array_agg(id) into matches from (
    select bk.id from public.ayambil_test_bookings bk where
     (coalesce(p_body->>'date','')='' or bk.event_date::text=p_body->>'date') and
     (coalesce(p_body->>'status','')='' or bk.status=p_body->>'status') and
     (coalesce(p_body->>'search','')='' or position(lower(left(p_body->>'search',120)) in lower(bk.contact_name||' '||bk.mobile||' '||bk.number))>0 or exists(select 1 from public.ayambil_test_attendees a where a.booking_id=bk.id and position(lower(left(p_body->>'search',120)) in lower(a.full_name))>0))
     order by bk.created_at desc,bk.id limit 51 offset (page-1)*50) q;
   select coalesce(jsonb_agg(ayambil_private.booking(id,true)),'[]'::jsonb) into result from unnest(matches[1:50]) id;
   return jsonb_build_object('items',result,'page',page,'hasMore',coalesce(array_length(matches,1),0)>50);
 end if;
 if p_operation in ('admin/change','admin/whatsapp-retry') then
   select * into strict b from public.ayambil_test_bookings where id=(p_body->>'bookingId')::uuid for update;
   if p_operation='admin/whatsapp-retry' then
     select * into strict m from public.ayambil_test_messages where booking_id=b.id for update;
     if b.status<>'active' or not b.whatsapp_consent or m.status<>'failed' then raise exception 'Only confirmed failures may retry'; end if;
     update public.ayambil_test_messages set history=history||jsonb_build_array(jsonb_build_object('at',now(),'providerRef',provider_ref,'failure',failure)),status='queued',provider_ref=null,failure=null where id=m.id;
     new_status:='whatsapp_retry';
   elsif p_body->>'action'='reissue' then
     if b.status<>'active' or not exists(select 1 from public.ayambil_test_attendees where id=(p_body->>'attendeeId')::uuid and booking_id=b.id and status='active') then raise exception 'Active attendee required'; end if;
     update public.ayambil_test_passes set status='superseded' where attendee_id=(p_body->>'attendeeId')::uuid and status<>'superseded';
     perform ayambil_private.issue_pass((p_body->>'attendeeId')::uuid); new_status:='reissue';
   else
     if coalesce(p_body->>'action','') not in ('cancel','restore') then raise exception 'Invalid action'; end if;
     new_status:=case when p_body->>'action'='cancel' then 'cancelled' else 'active' end;
     update public.ayambil_test_bookings set status=new_status where id=b.id;
     update public.ayambil_test_attendees set status=new_status where booking_id=b.id;
     update public.ayambil_test_passes p set status=new_status from public.ayambil_test_attendees a where p.attendee_id=a.id and a.booking_id=b.id and p.status<>'superseded';
     if new_status='cancelled' then update public.ayambil_test_messages set status='cancelled' where booking_id=b.id and status in ('queued','sending','failed','uncertain'); end if;
     new_status:=p_body->>'action';
   end if;
   insert into public.ayambil_test_audit(actor,booking_id,action) values(p_actor,b.id,new_status);
   return ayambil_private.booking(b.id,true);
 end if;
 raise exception 'Unsupported operation';
end $$;
revoke all on all functions in schema ayambil_private from public,anon,authenticated;
revoke all on function public.ayambil_test_api(text,jsonb,uuid) from public,anon,authenticated;
grant execute on function public.ayambil_test_api(text,jsonb,uuid) to service_role;
commit;
