// Explicit hosted TEST opt-in. All provider testing is in the offline harness.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
import {randomBytes} from 'node:crypto';
const ref='elixeakdejaqpuiaresr',base=`https://${ref}.supabase.co`;
if(process.env.AYAMBIL_RUN_HOSTED_TESTS!==ref)throw Error('Test project opt-in required');
function cli(cmd){try{return JSON.parse(execFileSync('cmd.exe',['/d','/s','/c',`npx -y supabase ${cmd} --agent no --output-format text --output json`],{encoding:'utf8',stdio:['ignore','pipe','pipe'],timeout:60000}));}catch{throw Error('CLI failed; raw output suppressed');}}
assert.ok(cli('projects list').some(p=>p.id===ref&&p.name==='vardhman-ayambil'&&p.region==='ap-south-1'));
const keys=cli('projects api-keys --project-ref '+ref);
const pub=keys.find(k=>k.type==='publishable')?.api_key,service=keys.find(k=>k.name==='service_role')?.api_key;assert.ok(pub&&service);
const dir='.ayambil-runtime/supabase-test';mkdirSync(dir,{recursive:true});
let sequence=0;const sql=text=>{const path=`${dir}/phase4b-query-${++sequence}.sql`;writeFileSync(path,text);return cli('db query --linked --file '+path);};
const results=[];function record(test,status,detail){const result={test,status,detail};results.push(result);console.log(JSON.stringify(result));}
async function http(path,body,key=pub,token){const r=await fetch(base+path,{method:'POST',headers:{apikey:key,'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:JSON.stringify(body),signal:AbortSignal.timeout(25000)});let data;try{data=await r.json();}catch{data={};}return {status:r.status,data};}
const edge=(op,body={},token)=>http('/functions/v1/ayambil-test',{operation:op,body},pub,token);
const accounts=[],bookings=[];let admin;
try{
 assert.equal((await edge('register')).status,403);record('public_registration_closed_before',403,'No public enablement');
 for(const label of ['ordinary','admin']){
  const email=`ayambil-4b-${label}-${Date.now()}-${randomBytes(4).toString('hex')}@example.invalid`,password=randomBytes(32).toString('base64url');
  const created=await http('/auth/v1/admin/users',{email,password,email_confirm:true},service,service);assert.equal(created.status,200);
  const auth=await http('/auth/v1/token?grant_type=password',{email,password});assert.equal(auth.status,200);
  accounts.push({id:created.data.id,token:auth.data.access_token,label});
 }
 admin=accounts[1];sql(`insert into public.ayambil_test_admins(user_id,enabled) values('${admin.id}',true);`);
 assert.equal((await edge('admin/test-register')).status,401);
 assert.equal((await edge('admin/test-register',{},accounts[0].token)).status,403);record('fixture_auth_boundaries','401/403','Anonymous and authenticated non-admin denied');
 for(const date of ['2026-11-02','2026-11-03']){
  const attendees=(date.endsWith('03')?['Synthetic Sairam First','Synthetic Sairam Second']:['Synthetic Manan Attendee']).map(fullName=>({fullName,dates:[date]}));
  const body={requestKey:randomBytes(32).toString('hex'),contactName:'Synthetic Phase4B Contact',mobile:'+12025550123',eventDate:date,whatsappConsent:true,termsAccepted:true,attendees};
  const saved=await edge('admin/test-register',body,admin.token);assert.equal(saved.status,200);assert.equal(saved.data.attendees.length,attendees.length);
  const listing=await edge('admin/bookings',{search:saved.data.number},admin.token);assert.equal(listing.status,200);assert.equal(listing.data.items.length,1);
  const booking=listing.data.items[0];bookings.push(booking.id);
  const retries=await Promise.all([edge('admin/test-register',body,admin.token),edge('admin/test-register',body,admin.token)]);
  assert.ok(retries.every(r=>r.status===200&&r.data.number===saved.data.number));
  assert.equal((await edge('admin/test-register',{...body,contactName:'Synthetic Changed Contact'},admin.token)).status,400);
  assert.equal((await edge('register',body)).status,403);
  assert.equal(sql('select registration_open from public.ayambil_test_settings')[0].registration_open,false);
  record('hosted_edge_registration_'+date,200,`${attendees.length} attendees; consistent passes; retries identical; public gate remains false`);
  const rows=sql(`select d.token,a.id as attendee_id,a.ordinal from ayambil_private.downloads d join public.ayambil_test_passes p on p.id=d.pass_id join public.ayambil_test_attendees a on a.id=p.attendee_id where a.booking_id='${booking.id}' and p.status='active' order by a.ordinal;`);
  assert.equal(rows.length,attendees.length);
  assert.equal((await edge('download',{key:randomBytes(32).toString('hex')})).status,404);
  assert.equal((await edge('download',{})).status,404);
  assert.equal((await edge('download',{key:rows[0].token},'invalid-jwt')).status,200); // Capability key, not user JWT, authorizes the download.
  for(let i=0;i<rows.length;i++){
   const download=await edge('download',{key:rows[i].token,bookingId:randomBytes(16).toString('hex')});assert.equal(download.status,200);assert.equal(download.data.passes.length,1);
   const pass=download.data.passes[0];assert.equal(pass.attendeeName,attendees[i].fullName);assert.equal(pass.sessions[0].date,date);
   assert.equal(pass.sessions[0].venue,date.endsWith('03')?'Tagore Hall':'Shri Chandramauleshwar Hall');
   if(date.endsWith('03')&&i===0){assert.equal(pass.sessions[0].programme,'મારી મા... મારો પ્રાણ');writeFileSync(dir+'/downloaded-pass.json',JSON.stringify(pass));}
  }
  record('https_private_download_'+date,'200/404','Opaque capability authorizes exactly one attendee; missing/random key denied');
  const change=action=>edge('admin/change',{action,bookingId:booking.id,attendeeId:rows[0].attendee_id},admin.token);
  assert.equal((await change('cancel')).status,200);assert.equal((await edge('download',{key:rows[0].token})).status,404);
  assert.equal((await change('restore')).status,200);assert.equal((await edge('download',{key:rows[0].token})).status,200);
  assert.equal((await change('reissue')).status,200);assert.equal((await edge('download',{key:rows[0].token})).status,404);
  assert.equal((await change('cancel')).status,200);record('cancel_restore_supersede_'+date,'200/404','HTTPS authorization enforced across pass lifecycle');
 }
 const real={requestKey:randomBytes(32).toString('hex'),contactName:'Real Contact',mobile:'+12025550123',eventDate:'2026-11-03',whatsappConsent:true,termsAccepted:true,attendees:[{fullName:'Synthetic Person',dates:['2026-11-03']}]};
 assert.equal((await edge('admin/test-register',real,admin.token)).status,400);record('real_data_fixture_denied',400,'Synthetic-only enforcement');
}finally{
 // Soft cancellation preserves audit/history; random-password test users are retained.
 for(const id of bookings){try{const r=await edge('admin/change',{action:'cancel',bookingId:id},admin?.token);if(r.status!==200)throw Error();}catch{sql(`update public.ayambil_test_bookings set status='cancelled' where id='${id}';update public.ayambil_test_attendees set status='cancelled' where booking_id='${id}';update public.ayambil_test_passes set status='cancelled' where status<>'superseded' and attendee_id in (select id from public.ayambil_test_attendees where booking_id='${id}');update public.ayambil_test_messages set status='cancelled' where booking_id='${id}';`);}}
 if(admin)sql(`update public.ayambil_test_admins set enabled=false where user_id='${admin.id}';`);
 writeFileSync(dir+'/phase4b-results.json',JSON.stringify(results,null,2));
}
assert.equal((await edge('register')).status,403);
const safety=sql('select (select registration_open from public.ayambil_test_settings) as open,(select count(*) from public.ayambil_test_bookings where status=\'active\') as active,(select count(*) from public.ayambil_test_admins where enabled) as admins,(select count(*) from public.ayambil_test_messages where attempts>0) as sends;')[0];
assert.equal(safety.open,false);assert.equal(Number(safety.active),0);assert.equal(Number(safety.admins),0);assert.equal(Number(safety.sends),0);
record('final_safety',200,'Gate false; zero active bookings, enabled test admins or message attempts');
