// Explicit opt-in: TEST project only. No provider requests or secret output.
import assert from 'node:assert/strict';
import {execFile,execFileSync} from 'node:child_process';
import {promisify} from 'node:util';
import {mkdirSync,writeFileSync} from 'node:fs';
import {randomBytes} from 'node:crypto';
const ref='elixeakdejaqpuiaresr';
if(process.env.AYAMBIL_RUN_HOSTED_TESTS!==ref)throw Error('Explicit test-project opt-in required');
const base=`https://${ref}.supabase.co`;
const flags=' --agent no --output-format text --output json';
const cli=cmd=>{try{return JSON.parse(execFileSync('cmd.exe',['/d','/s','/c','npx -y supabase '+cmd+flags],{encoding:'utf8',stdio:['ignore','pipe','pipe'],timeout:60000}));}catch{throw Error('Supabase CLI operation failed; raw output suppressed');}};
const asyncExec=promisify(execFile);
const cliAsync=async cmd=>JSON.parse((await asyncExec('cmd.exe',['/d','/s','/c','npx -y supabase '+cmd+flags],{encoding:'utf8',timeout:60000})).stdout);
const projects=cli('projects list');
assert.ok(projects.some(p=>p.id===ref&&p.name==='vardhman-ayambil'&&p.region==='ap-south-1'));
const keys=cli('projects api-keys --project-ref '+ref);
const pub=keys.find(k=>k.type==='publishable')?.api_key;
const service=keys.find(k=>k.name==='service_role')?.api_key;
assert.ok(pub&&service);
const results=[];
const record=(test,status,detail)=>{results.push({test,status,detail});console.log(JSON.stringify({test,status,detail}));};
async function http(path,body,key=pub,token,origin){
 const response=await fetch(base+path,{method:body===undefined?'GET':'POST',headers:{apikey:key,...(token?{Authorization:'Bearer '+token}:{}),...(origin?{Origin:origin}:{}),'Content-Type':'application/json'},...(body===undefined?{}:{body:JSON.stringify(body)}),signal:AbortSignal.timeout(25000)});
 let data;try{data=await response.json();}catch{data={};}
 return {status:response.status,data,origin:response.headers.get('access-control-allow-origin')};
}
const edge=(op,body={},token,origin='http://127.0.0.1:3002')=>http('/functions/v1/ayambil-test',{operation:op,body},pub,token,origin);
const rpc=(op,body={},actor=null)=>http('/rest/v1/rpc/ayambil_test_api',{p_operation:op,p_body:body,p_actor:actor},service,service);
mkdirSync('.ayambil-runtime/supabase-test',{recursive:true});
let counter=0;
const sqlFile=sql=>{const file='.ayambil-runtime/supabase-test/query-'+(++counter)+'.sql';writeFileSync(file,sql);return file;};
const sql=statement=>cli('db query --linked --file '+sqlFile(statement));
const accounts=[];
try {
 const status=await edge('status');assert.equal(status.status,200);assert.equal(status.data.open,false);record('closed_status',200,'open=false');
 const closed=await edge('register');assert.equal(closed.status,403);record('closed_registration',403,closed.data.error);
 const cors=await edge('status',{},undefined,'https://untrusted.invalid');assert.equal(cors.status,403);assert.equal(cors.origin,null);record('untrusted_cors',403,'No allow-origin header');
 const anon=await edge('admin/bookings');assert.equal(anon.status,401);record('anonymous_admin',401,anon.data.error);
 const worker=await edge('worker');assert.equal(worker.status,401);record('worker_without_secret',401,'No messaging invocation');
 for(const label of ['nonadmin','admin']) {
  const email=`ayambil-${label}-${Date.now()}-${randomBytes(4).toString('hex')}@example.invalid`;
  const password=randomBytes(32).toString('base64url');
  const created=await http('/auth/v1/admin/users',{email,password,email_confirm:true},service,service);
  assert.equal(created.status,200);assert.ok(created.data.id);
  const auth=await http('/auth/v1/token?grant_type=password',{email,password});
  assert.equal(auth.status,200);assert.ok(auth.data.access_token);
  accounts.push({id:created.data.id,token:auth.data.access_token,label});
  record('hosted_auth_'+label,200,'Synthetic confirmed test user signed in; credentials not retained');
 }
 const ordinary=accounts[0],admin=accounts[1];
 sql(`insert into public.ayambil_test_admins(user_id,enabled) values('${admin.id}',true);`);
 const denied=await edge('admin/bookings',{},ordinary.token);assert.equal(denied.status,403);record('authenticated_nonadmin',403,denied.data.error);
 for(const account of [null,ordinary,admin]) {
  for(const table of ['attendees','passes','bookings']){
   const read=await http('/rest/v1/ayambil_test_'+table+'?select=id',undefined,pub,account?.token);
   assert.ok([401,403].includes(read.status));record((account?.label||'anon')+'_read_'+table,read.status,'42501 permission denied');
  }
  const write=await http('/rest/v1/ayambil_test_attendees',{full_name:'Synthetic Unauthorized'},pub,account?.token);assert.ok([401,403].includes(write.status));record((account?.label||'anon')+'_write',write.status,'Direct write denied');
  const call=await http('/rest/v1/rpc/ayambil_test_api',{p_operation:'admin/bookings',p_actor:admin.id},pub,account?.token);assert.ok([401,403].includes(call.status));record((account?.label||'anon')+'_privileged_rpc',call.status,'RPC execution denied');
 }
 const adminEdge=await edge('admin/bookings',{},admin.token);assert.ok([200,503].includes(adminEdge.status));record('authorized_admin_edge',adminEdge.status,adminEdge.status===503?'Blocked: server configuration missing':'Authenticated admin operation succeeded');
 // First session opens its own uncommitted gate only. Other sessions see false.
 // Second session submits the same new request while the first holds the lock.
 const requestKey=randomBytes(32).toString('hex');
 const payload={requestKey,contactName:'Synthetic Concurrency Contact',mobile:'+12025550123',eventDate:'2026-11-02',whatsappConsent:true,termsAccepted:true,attendees:[{fullName:'Synthetic Concurrency Attendee',dates:['2026-11-02']}]};
 const literal=JSON.stringify(payload).replaceAll("'","''");
 const firstFile=sqlFile(`begin; update public.ayambil_test_settings set registration_open=true; select public.ayambil_test_api('register','${literal}'::jsonb)->>'number' as number, pg_backend_pid() as pid; select pg_sleep(8); update public.ayambil_test_settings set registration_open=false; commit; select number, pg_backend_pid() as pid from public.ayambil_test_bookings where request_hash=ayambil_private.sha('${requestKey}');`);
 const first=cliAsync('db query --linked --file '+firstFile);
 await new Promise(resolve=>setTimeout(resolve,2500));
 const secondFile=sqlFile(`select public.ayambil_test_api('register','${literal}'::jsonb)->>'number' as number, pg_backend_pid() as pid;`);
 const second=cliAsync('db query --linked --file '+secondFile);
 const [one,two]=await Promise.all([first,second]);
 assert.equal(one[0].number,two[0].number);assert.notEqual(one[0].pid,two[0].pid);
 const counts=sql(`select count(*)::integer as bookings, (select count(*)::integer from public.ayambil_test_passes p join public.ayambil_test_attendees a on a.id=p.attendee_id join public.ayambil_test_bookings b on b.id=a.booking_id where b.request_hash=ayambil_private.sha('${requestKey}')) as passes, (select registration_open from public.ayambil_test_settings) as open from public.ayambil_test_bookings where request_hash=ayambil_private.sha('${requestKey}');`);
 assert.equal(counts[0].bookings,1);assert.equal(counts[0].passes,1);assert.equal(counts[0].open,false);record('concurrent_new_submission',200,'Independent backend PIDs; identical booking; one booking/pass; gate remains closed');
 const privateData=sql(`select bk.id, a.id as attendee_id, d.token from public.ayambil_test_bookings bk join public.ayambil_test_attendees a on a.booking_id=bk.id join public.ayambil_test_passes p on p.attendee_id=a.id join ayambil_private.downloads d on d.pass_id=p.id where bk.request_hash=ayambil_private.sha('${requestKey}');`)[0];
 const downloaded=await rpc('download',{key:privateData.token});assert.equal(downloaded.status,200);assert.equal(downloaded.data.passes.length,1);assert.equal(downloaded.data.passes[0].attendeeName,payload.attendees[0].fullName);assert.equal(downloaded.data.passes[0].sessions[0].date,'2026-11-02');record('service_rpc_private_pass',200,'Exactly one saved attendee snapshot; correct date');
 const privateEdge=await edge('download',{key:privateData.token});assert.ok([200,503].includes(privateEdge.status));
 if(privateEdge.status===200){assert.equal(privateEdge.data.passes.length,1);assert.equal(privateEdge.data.passes[0].attendeeName,payload.attendees[0].fullName);writeFileSync('.ayambil-runtime/supabase-test/downloaded-pass.json',JSON.stringify(privateEdge.data.passes[0]));}
 record('private_download_edge',privateEdge.status,privateEdge.status===503?'Blocked: server configuration missing; PDF preview not verified':'Correct attendee snapshot; PDF preview still requires isolated frontend');
 const adminCall=(op,body)=>adminEdge.status===200?edge(op,body,admin.token):rpc(op,body,admin.id);
 const list=await adminCall('admin/bookings',{search:one[0].number,date:'2026-11-02'});assert.equal(list.status,200);assert.equal(list.data.items.length,1);record('authorized_admin_filter',200,adminEdge.status===200?'Actual Edge filter matched correct synthetic booking':'Database-only filter matched correct booking');
 const cancelled=await adminCall('admin/change',{action:'cancel',bookingId:privateData.id});assert.equal(cancelled.status,200);
 const unavailable=await rpc('download',{key:privateData.token});assert.equal(unavailable.status,400);record('cancelled_private_pass',400,'Download denied');
 if(adminEdge.status===200){
  assert.equal((await edge('download',{key:privateData.token})).status,404);
  assert.equal((await adminCall('admin/change',{action:'restore',bookingId:privateData.id})).status,200);
  assert.equal((await edge('download',{key:privateData.token})).status,200);
  const reissue=await adminCall('admin/change',{action:'reissue',bookingId:privateData.id,attendeeId:privateData.attendee_id});assert.equal(reissue.status,200);
  assert.equal((await edge('download',{key:privateData.token})).status,404);record('edge_cancel_restore_reissue',200,'Cancelled and superseded keys rejected with 404; restore allowed 200');
  assert.equal((await adminCall('admin/change',{action:'cancel',bookingId:privateData.id})).status,200);
 }
} finally {
 // Revoke test admin membership; do not delete test users or schema/history.
 for(const account of accounts)if(account.label==='admin')sql(`update public.ayambil_test_admins set enabled=false where user_id='${account.id}';`);
 writeFileSync('.ayambil-runtime/supabase-test/results.json',JSON.stringify(results,null,2));
}
