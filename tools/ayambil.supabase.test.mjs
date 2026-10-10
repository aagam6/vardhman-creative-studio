// Disposable in-memory PostgreSQL only. No Supabase project or credentials used.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {randomBytes} from 'node:crypto';
import {PGlite} from '@electric-sql/pglite';
import {createHandler} from '../supabase/functions/_shared/handler.mjs';
import {validateBooking,messagePayload} from '../supabase/functions/_shared/contracts.mjs';
import * as flow from '../supabase/functions/_shared/vardhmanflow.mjs';
const config=JSON.parse(readFileSync(new URL('../supabase/functions/_shared/programme.json',import.meta.url),'utf8'));
const envValues={AYAMBIL_TARGET:'test',AYAMBIL_EXPECTED_PROJECT_REF:'test-ref',SUPABASE_URL:'https://test-ref.supabase.co',AYAMBIL_ALLOWED_ORIGINS:'["http://localhost:3002"]',AYAMBIL_RATE_LIMIT_SALT:'local-test-only',AYAMBIL_TEST_REGISTRATION_OPEN:'true',AYAMBIL_FLOW_API_PREFIX:'/api/v1',AYAMBIL_FLOW_API_KEY:'test-only',AYAMBIL_FLOW_API_SECRET:'test-only',AYAMBIL_FLOW_TEMPLATE_02:'event_02',AYAMBIL_FLOW_TEMPLATE_03:'event_03',AYAMBIL_FLOW_LANGUAGE_02:'en',AYAMBIL_FLOW_LANGUAGE_03:'en',AYAMBIL_FLOW_PARAMETERS_02:'["confirmationDetails"]',AYAMBIL_FLOW_PARAMETERS_03:'["confirmationDetails"]',AYAMBIL_PUBLIC_SITE_URL:'https://preview.invalid',AYAMBIL_WORKER_SECRET:'test-only-worker-secret-long-enough-123',AYAMBIL_TEST_RECIPIENTS_JSON:'["+919876543210"]'};
const env=k=>envValues[k]||'';
const admin='11111111-1111-4111-8111-111111111111';
const body=(date='2026-11-02',names=['Test Attendee'])=>({requestKey:randomBytes(32).toString('hex'),contactName:'Test Contact',mobile:'+919876543210',eventDate:date,whatsappConsent:true,termsAccepted:true,attendees:names.map(fullName=>({fullName,dates:[date]}))});
let pg;let passed=0;
const check=(condition)=>{assert.ok(condition);passed++;};
async function rpc(operation,body={},actor=null){const result=await pg.query('select public.ayambil_test_api($1,$2::jsonb,$3::uuid) as value',[operation,JSON.stringify(body),actor]);return result.rows[0].value;}
async function request(handler,operation,body={},token){const response=await handler(new Request('https://test-ref.supabase.co/functions/v1/ayambil-test',{method:'POST',headers:{'Content-Type':'application/json',Origin:'http://localhost:3002',...(token?{Authorization:'Bearer '+token}:{})},body:JSON.stringify({operation,body})}));return {status:response.status,data:await response.json()};}

test('Supabase migrations, permission boundaries, Edge handler and saved pass lifecycle',async()=>{
 pg=new PGlite();
 try{
  // Emulate Supabase's existing Auth schema/roles; never shipped as a migration.
  await pg.exec('create role anon; create role authenticated; create role service_role bypassrls; create schema auth; create table auth.users(id uuid primary key);');
  for(const name of readdirSync('supabase/migrations').sort())await pg.exec(readFileSync('supabase/migrations/'+name,'utf8'));
  assert.equal(config.eventName,JSON.parse(readFileSync('apps/pocketbase/pb_hooks/ayambil/config.json','utf8')).eventName);
  assert.deepEqual(config,JSON.parse(readFileSync('apps/pocketbase/pb_hooks/ayambil/config.json','utf8')));
  const sessions=await pg.query('select snapshot from public.ayambil_test_sessions order by event_date');assert.deepEqual(sessions.rows.map(r=>r.snapshot),config.sessions);
  const gate=await pg.query('select registration_open from public.ayambil_test_settings');check(gate.rows[0].registration_open===false);
  await assert.rejects(()=>rpc('register',body()),/Registration closed/);
  // Local fixture only; remote test project requires a separately authorized step.
  await pg.exec(`update public.ayambil_test_settings set registration_open=true; insert into auth.users values('${admin}');insert into public.ayambil_test_admins(user_id,enabled) values('${admin}',true);`);
  const handler=createHandler({env,rpc,user:async token=>{if(token!=='test-jwt')throw Error('Invalid');return admin;},send:()=>assert.fail('No provider sends in registration'),config});
  const source=body();const saved=await request(handler,'register',source);assert.equal(saved.status,200);check(saved.data.attendees.length===1);check((await pg.query('select terms_version,terms_accepted_at from public.ayambil_test_bookings')).rows.every(r=>r.terms_version==='2026-10-10'&&r.terms_accepted_at));check(saved.data.id===undefined&&saved.data.mobile===undefined&&saved.data.attendees[0].id===undefined);
  check(saved.data.attendees[0].passes[0].sessions[0].venue==='Shri Chandramauleshwar Hall');
  const retries=await Promise.all(Array.from({length:4},()=>request(handler,'register',source)));check(retries.every(r=>r.status===200&&r.data.number===saved.data.number));
  await assert.rejects(()=>rpc('register',{...source,contactName:'Changed Name'}),/conflict/);
  const multi=await request(handler,'register',body('2026-11-03',['Test First','Test Second']));check(multi.data.attendees.length===2);check(new Set(multi.data.attendees.map(a=>a.passes[0].number)).size===2);check(multi.data.attendees.every(a=>a.passes[0].sessions[0].venue==='Tagore Hall'));
  for(const invalid of [body('2026-11-02',['First Test','Second Test','Third Test']),{...body(),termsAccepted:false},{...body(),termsAccepted:undefined},{...body(),termsAccepted:'true'},{...body(),whatsappConsent:false},body('2026-11-04'),{...body(),mobile:'bad'},{...body(),contactName:'<script>'},{...body(),attendees:[{fullName:'Wrong Dates',dates:['2026-11-02','2026-11-03']}]}]){assert.equal((await request(handler,'register',invalid)).status,400);await assert.rejects(()=>rpc('register',invalid));}
  const denied=await request(handler,'admin/bookings');check(denied.status===401);check((await request(handler,'admin/bookings',{},'bad-token')).status===403);
  await rpc('admin/bookings',{search:saved.data.number},admin);
  const list=await request(handler,'admin/bookings',{search:saved.data.number},'test-jwt');assert.equal(list.status,200);const booking=list.data.items[0];check(list.data.items.length===1);check((await request(handler,'admin/bookings',{date:'2026-11-03'},'test-jwt')).data.items.length===1);
  const keys=await pg.query('select d.token from ayambil_private.downloads d join public.ayambil_test_passes p on p.id=d.pass_id join public.ayambil_test_attendees a on a.id=p.attendee_id where a.booking_id=$1',[booking.id]);
  const download=await request(handler,'download',{key:keys.rows[0].token});check(download.status===200&&download.data.passes.length===1);check(download.data.passes[0].attendeeName==='Test Attendee');check((await request(handler,'download',{key:randomBytes(32).toString('hex')})).status===404);
  const otherDownload=await pg.query('select token from ayambil_private.downloads where token<>$1 limit 1',[keys.rows[0].token]);check((await rpc('download',{key:otherDownload.rows[0].token})).passes.length===1);
  await pg.query("update ayambil_private.downloads set expires_at=now()-interval '1 second' where token=$1",[keys.rows[0].token]);check((await request(handler,'download',{key:keys.rows[0].token})).status===404);await pg.query("update ayambil_private.downloads set expires_at=now()+interval '7 days' where token=$1",[keys.rows[0].token]);
  await request(handler,'admin/change',{action:'cancel',bookingId:booking.id},'test-jwt');check((await request(handler,'download',{key:keys.rows[0].token})).status===404);
  await assert.rejects(()=>rpc('admin/change',{action:'reissue',bookingId:booking.id,attendeeId:booking.attendees[0].id},admin));
  await request(handler,'admin/change',{action:'restore',bookingId:booking.id},'test-jwt');check((await request(handler,'download',{key:keys.rows[0].token})).status===200);
  const reissued=await request(handler,'admin/change',{action:'reissue',bookingId:booking.id,attendeeId:booking.attendees[0].id},'test-jwt');check(reissued.data.attendees[0].passes.length===2);check(reissued.data.attendees[0].passes.filter(p=>p.status==='active').length===1);check((await request(handler,'download',{key:keys.rows[0].token})).status===404);
  await assert.rejects(()=>rpc('admin/change',{bookingId:booking.id},admin),/Invalid action/);
  await pg.query('update public.ayambil_test_admins set enabled=false where user_id=$1',[admin]);check((await request(handler,'admin/bookings',{},'test-jwt')).status===403);await pg.query('update public.ayambil_test_admins set enabled=true where user_id=$1',[admin]);
  for(const role of ['anon','authenticated']){
   await pg.exec('set role '+role);
   await assert.rejects(()=>pg.query('select * from public.ayambil_test_attendees'),/permission denied/);
   await assert.rejects(()=>rpc('admin/bookings',{},admin),/permission denied/);
   await assert.rejects(()=>pg.query('select * from ayambil_private.downloads'),/permission denied/);
   await pg.exec('reset role');passed+=3;
  }
  const rls=await pg.query("select count(*)::integer as count from pg_class c join pg_namespace n on n.oid=c.relnamespace where (n.nspname='public' and c.relname like 'ayambil_test_%' or n.nspname='ayambil_private' and c.relname in ('downloads','rate_limits')) and c.relkind='r' and c.relrowsecurity");check(rls.rows[0].count===11);
  // Prove deny policies hold even if a future migration accidentally adds a grant.
  await pg.exec('grant select on public.ayambil_test_bookings to authenticated;set role authenticated');
  check((await pg.query('select * from public.ayambil_test_bookings')).rows.length===0);
  await pg.exec('reset role;revoke select on public.ayambil_test_bookings from authenticated');
  await pg.exec(readFileSync('supabase/tests/security.sql','utf8'));
  const before=await pg.query('select count(*)::integer as count from public.ayambil_test_bookings');
  await pg.exec("create function public.test_fail_pass() returns trigger language plpgsql as $$ begin raise exception 'Test pass failure'; end $$;create trigger test_fail before insert on public.ayambil_test_passes for each row execute function public.test_fail_pass();");
  const failed=body();await assert.rejects(()=>rpc('register',failed),/Test pass failure/);const after=await pg.query('select count(*)::integer as count from public.ayambil_test_bookings');check(before.rows[0].count===after.rows[0].count);await pg.exec('drop trigger test_fail on public.ayambil_test_passes');check((await rpc('register',failed)).attendees.length===1);
  // Real SQL claim/ack and retry, provider HTTP mocked in the actual worker handler.
  const queued=await rpc('register',body());
  const templates=['02','03'].map(day=>({name:'event_'+day,language:'en',status:'APPROVED',components:[{type:'BODY',text:'Confirmation: {{1}}'}]}));let sends=0;
  const send=async options=>{if(options.url.endsWith('/account'))return {statusCode:200,json:{success:true,data:{channel:{id:'fixture-channel',isActive:true,healthStatus:'healthy'}}}};if(options.url.includes('templates?'))return {statusCode:200,json:{success:true,data:templates}};if(options.url.includes('messages/status/'))return {statusCode:200,json:{success:true,data:{id:options.url.split('/').pop(),status:'delivered'}}};sends++;return {statusCode:200,json:{success:true,data:{messageId:'mock-'+sends,status:'sent'}}};};
  const worker=createHandler({env:k=>k==='AYAMBIL_TEST_WHATSAPP_SEND_ENABLED'?'true':env(k),rpc,user:()=>assert.fail(),send,config});
  check((await request(worker,'worker')).status===401);const w=await request(worker,'worker',{},envValues.AYAMBIL_WORKER_SECRET);assert.equal(w.status,200);check(sends===1);await request(worker,'worker',{},envValues.AYAMBIL_WORKER_SECRET);check(sends===2);
  const ref=await pg.query("select * from public.ayambil_test_messages where provider_ref='mock-1'");check(ref.rows[0].status==='delivered');
  await rpc('poll-result',{id:ref.rows[0].id,ref:'mock-1',status:'failed'});check((await pg.query('select status from public.ayambil_test_messages where id=$1',[ref.rows[0].id])).rows[0].status==='delivered');
  const retryBooking=(await rpc('admin/bookings',{search:queued.number},admin)).items[0];
  await pg.query("update public.ayambil_test_messages set status='failed' where booking_id=$1",[retryBooking.id]);const passNumber=retryBooking.attendees[0].passes[0].number;
  await rpc('admin/whatsapp-retry',{bookingId:retryBooking.id},admin);await assert.rejects(()=>rpc('admin/whatsapp-retry',{bookingId:retryBooking.id},admin));check((await rpc('admin/bookings',{search:queued.number},admin)).items[0].attendees[0].passes[0].number===passNumber);
  await pg.query("update public.ayambil_test_messages set status='uncertain' where booking_id=$1",[retryBooking.id]);await assert.rejects(()=>rpc('admin/whatsapp-retry',{bookingId:retryBooking.id},admin));
  const timeout=createHandler({env:k=>k==='AYAMBIL_TEST_WHATSAPP_SEND_ENABLED'?'true':env(k),rpc,user:()=>assert.fail(),send:async options=>{if(options.method==='POST')throw Error('Ambiguous timeout');return send(options);},config});
  const timeoutJob=await rpc('register',body());await request(timeout,'worker',{},envValues.AYAMBIL_WORKER_SECRET);
  const uncertain=await pg.query("select id,attempts,attempt_id from public.ayambil_test_messages where status='uncertain' and attempts>0 and provider_ref is null");check(uncertain.rows.length===1);
  await request(timeout,'worker',{},envValues.AYAMBIL_WORKER_SECRET);check((await pg.query('select attempts from public.ayambil_test_messages where id=$1',[uncertain.rows[0].id])).rows[0].attempts===uncertain.rows[0].attempts);
  const stale=await rpc('register',body());const staleId=(await rpc('admin/bookings',{search:stale.number},admin)).items[0].id;
  await pg.query("update public.ayambil_test_messages set status='sending',attempted_at=now()-interval '3 minutes' where booking_id=$1",[staleId]);
  await rpc('claim');check((await pg.query('select status from public.ayambil_test_messages where booking_id=$1',[staleId])).rows[0].status==='uncertain');
  const ignored=await rpc('send-result',{id:uncertain.rows[0].id,attemptId:'different',status:'sent',ref:'late-ref'});check(ignored.ignored===true);
  assert.ok(timeoutJob.number);
  const rateBucket='e'.repeat(64);for(let i=0;i<30;i++)assert.equal((await rpc('limit',{bucket:rateBucket})).allowed,true);check((await rpc('limit',{bucket:rateBucket})).allowed===false);
  const close=createHandler({env:k=>k==='AYAMBIL_TEST_REGISTRATION_OPEN'?'false':env(k),rpc,user:()=>admin,send,config});check((await request(close,'register',body())).status===403);check((await request(handler,'status')).data.open===false);
  const closedUnconfigured=createHandler({env:k=>k==='AYAMBIL_TEST_REGISTRATION_OPEN'?'false':k==='AYAMBIL_RATE_LIMIT_SALT'?'':env(k),rpc:()=>assert.fail('Closed registration must not call database'),user:()=>admin,send,config});assert.equal((await request(closedUnconfigured,'register',body())).status,403);
  const wrongTarget=createHandler({env:k=>k==='AYAMBIL_EXPECTED_PROJECT_REF'?'other-ref':env(k),rpc,user:()=>admin,send,config});check((await request(wrongTarget,'register',body())).status===503);
  const deniedOrigin=await handler(new Request('https://example.invalid',{method:'POST',headers:{Origin:'https://untrusted.invalid'},body:JSON.stringify({operation:'status'})}));check(deniedOrigin.status===403);
  console.log(passed+' Supabase/PostgreSQL/Edge assertions passed. HTTP provider calls mocked; multi-session locking and hosted runtime not verified.');
 }finally{await pg?.close();}
});

test('provider content and validation remain single-evening and no-QR',()=>{
 for(const date of ['2026-11-02','2026-11-03']){
  const booking=validateBooking(body(date),config);const payload=messagePayload(booking,['a'.repeat(64)],env,config,flow.mapping);const text=payload.components[0].parameters[0].text;const session=config.sessions.find(s=>s.date===date);assert.ok(text.includes(session.programme)&&text.includes(session.venue));assert.ok(!text.includes(date.endsWith('02')?'Tagore Hall':'Chandramauleshwar'));assert.equal(payload.to,'919876543210');
 }
 assert.equal(flow.classify({statusCode:500,json:{}}).status,'uncertain');
});

test('staff-only hosted fixture uses normal validation without opening public registration',async()=>{
 const db=new PGlite();
 try{
  await db.exec('create role anon; create role authenticated; create role service_role bypassrls; create schema auth; create table auth.users(id uuid primary key);');
  for(const name of readdirSync('supabase/migrations').sort())if(!name.includes('disable_staff_fixture'))await db.exec(readFileSync('supabase/migrations/'+name,'utf8'));
  await db.exec(`insert into auth.users values('${admin}');insert into public.ayambil_test_admins(user_id,enabled) values('${admin}',true);`);
  const run=async(op,p={},actor=null)=>(await db.query(op==='admin/test-register'?'select public.ayambil_test_register_fixture($1::jsonb,$2::uuid) as value':'select public.ayambil_test_api($1,$2::jsonb,$3::uuid) as value',op==='admin/test-register'?[JSON.stringify(p),actor]:[op,JSON.stringify(p),actor])).rows[0].value;
  const closedEnv=k=>k==='AYAMBIL_TEST_REGISTRATION_OPEN'?'false':env(k);
  const handler=createHandler({env:closedEnv,rpc:run,user:async token=>{if(token!=='staff-token')throw Error();return admin;},send:()=>assert.fail('No provider calls'),config});
  const fixture={...body('2026-11-03',['Synthetic First','Synthetic Second']),contactName:'Synthetic Contact',mobile:'+12025550123'};
  assert.equal((await request(handler,'register',fixture)).status,403);
  assert.equal((await request(handler,'admin/test-register',fixture)).status,401);
  assert.equal((await request(handler,'admin/test-register',fixture,'invalid')).status,403);
  const registered=await request(handler,'admin/test-register',fixture,'staff-token');assert.equal(registered.status,200);assert.equal(registered.data.attendees.length,2);
  assert.equal(registered.data.attendees[0].passes[0].sessions[0].venue,'Tagore Hall');
  assert.equal((await db.query('select registration_open from public.ayambil_test_settings')).rows[0].registration_open,false);
  assert.equal((await request(handler,'admin/test-register',fixture,'staff-token')).data.number,registered.data.number);
  assert.equal((await request(handler,'admin/test-register',{...fixture,contactName:'Real Contact'},'staff-token')).status,400);
  assert.equal((await request(handler,'admin/test-register',{...fixture,mobile:'+919876543210'},'staff-token')).status,400);
  assert.equal((await request(handler,'admin/test-register',{...fixture,attendees:[{fullName:'Real Attendee',dates:['2026-11-03']}]},'staff-token')).status,400);
  assert.equal((await db.query('select count(*)::integer as n from public.ayambil_test_bookings')).rows[0].n,1);
  assert.equal((await db.query('select registration_open from public.ayambil_test_settings')).rows[0].registration_open,false);
  await db.exec('set role anon');await assert.rejects(()=>run('admin/test-register',fixture,admin),/permission denied/);await db.exec('reset role');
  if(readdirSync('supabase/migrations').some(name=>name.includes('disable_staff_fixture'))){
   await db.exec(readFileSync('supabase/migrations/202610100004_ayambil_disable_staff_fixture.sql','utf8'));
   await db.exec('set role service_role');await assert.rejects(()=>run('admin/test-register',fixture,admin),/permission denied/);await db.exec('reset role');
  }
 }finally{await db.close();}
});

test('WhatsApp request construction, acceptance, rejection and delay use mocked transport only',async()=>{
 const templates=['02','03'].map(day=>({name:'event_'+day,language:'en',status:'APPROVED',components:[{type:'BODY',text:'Event confirmation {{1}}'}]}));
 const requests=[];
 const mock=async options=>{
  requests.push(options);
  if(options.method==='GET'&&options.url.endsWith('/account'))return {statusCode:200,json:{success:true,data:{channel:{id:'mock-channel',isActive:true,healthStatus:'healthy'}}}};
  if(options.method==='GET')return {statusCode:200,json:{success:true,data:templates}};
  await new Promise(resolve=>setTimeout(resolve,5));
  return {statusCode:200,json:{success:true,data:{messageId:'mock-accepted',status:'queued'}}};
 };
 await flow.preflight(mock,env);
 for(const date of ['2026-11-02','2026-11-03']){
  const booking=validateBooking({...body(date,['Synthetic First','Synthetic Second']),contactName:'Synthetic Contact',mobile:'+12025550123'},config);
  const payload=messagePayload(booking,['a'.repeat(64),'b'.repeat(64)],env,config,flow.mapping);
  const options={method:'POST',url:flow.url(env('AYAMBIL_FLOW_API_PREFIX'),'messages/template'),headers:flow.headers(env),body:JSON.stringify(payload),timeout:20};
  assert.equal(options.url,'https://vardhmanflow.com/api/v1/messages/template');assert.equal(payload.templateName,date.endsWith('03')?'event_03':'event_02');assert.equal(payload.language,'en');
  const text=payload.components[0].parameters[0].text;const session=config.sessions.find(s=>s.date===date);
  assert.ok(text.includes(session.label)&&text.includes(session.programme)&&text.includes(session.venue)&&text.includes('Attendees: 2'));
  assert.ok(text.includes('/passes#'+'a'.repeat(64))&&text.includes('/passes#'+'b'.repeat(64)));
  assert.equal(flow.classify(await mock(options)).status,'accepted');
 }
 assert.equal(requests.filter(r=>r.method==='POST').length,2);
 assert.equal(flow.classify({statusCode:400,json:{success:false}}).status,'failed');
 assert.equal(flow.classify({statusCode:408,json:{}}).status,'uncertain');
 assert.equal(flow.classify({statusCode:200,json:{success:true,data:{}}}).status,'uncertain');
});
