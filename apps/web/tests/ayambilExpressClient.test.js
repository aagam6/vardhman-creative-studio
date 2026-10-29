import test from 'node:test';
import assert from 'node:assert/strict';
import { createAyambilApi, validateResponse } from '../src/lib/ayambilExpressClient.js';
import { passPage, passImagePlacement } from '../src/lib/ayambilPassLayout.js';
import {readFileSync} from 'node:fs';
const programme=JSON.parse(readFileSync(new URL('../../pocketbase/pb_hooks/ayambil/config.json',import.meta.url)));

test('held entry review and status-only audit use explicit POST routes once with CSRF and no send',async()=>{
 const calls=[];const api=createAyambilApi(async(url,options)=>{calls.push({url,options});return Response.json(url.includes('admin/session')?{authenticated:true,csrfToken:'a'.repeat(64)}:{items:[],writes:0,newSubmissions:0});});
 await api.restore();
 for(const operation of ['entry-revision-preview','entry-revision-refresh','observe-receipts']){
  const path='admin/notification-outbox/'+operation;
  const body=operation==='observe-receipts'?{after:'',limit:20}:{ids:['synthetic-held-id'],...(operation==='entry-revision-refresh'?{confirmation:'REFRESH HELD ENTRY REVISION ONLY'}:{})};
  await api.request(path,{method:'POST',body});
  const call=calls.at(-1);assert.equal(call.url,'/api/ayambil/'+path);assert.equal(call.options.method,'POST');assert.equal(call.options.headers['X-CSRF-Token'],'a'.repeat(64));assert.equal(call.options.body,JSON.stringify(body));assert.equal(call.options.cache,'no-store');
  await assert.rejects(api.request(path),/Invalid API operation/);
 }
 assert.equal(calls.length,4);assert.ok(calls.every(c=>!c.url.endsWith('/send')));
});
test('staging-only denial has actionable safe text and preserves administrator CSRF',async()=>{
 const calls=[];
 const api=createAyambilApi(async(url,options)=>{
  calls.push({url,options});
  if(url.includes('admin/session'))return Response.json({authenticated:true,csrfToken:'a'.repeat(64)});
  return Response.json({errorCode:'STAGING_TEST_ONLY',error:'private server text must not be echoed'},{status:403});
 });
 await api.restore();
 for(const path of ['admin/messages/test','admin/messages/process-test'])await assert.rejects(api.request(path,{method:'POST'}),error=>error.status===403&&error.message.includes('only on authorized staging')&&!error.message.includes('private server'));
 assert.equal(calls.at(-1).options.headers['X-CSRF-Token'],'a'.repeat(64));
});
test('mock transport: both evening bookings, retries, filters, mutations and one-attendee downloads',async()=>{
  for(const session of programme.sessions)for(const count of [1,2,3,4,5,6]){
    const passes=Array.from({length:count},(_,i)=>({number:'SYNTHETIC-'+i,attendeeName:'Synthetic attendee',status:'active',sessions:[session]}));
    const saved={id:'synthetic-booking',number:'SYNTHETIC',status:'active',attendees:passes.map((pass,i)=>({id:'synthetic-'+i,fullName:pass.attendeeName,dates:[session.date],passes:[pass]}))};
    const calls=[];
    const api=createAyambilApi(async(url,options)=>{calls.push({url,options});return Response.json(url.includes('bookings')?{items:[saved],page:1,hasMore:false,integration:{ready:false,missing:[]}}:url.includes('pass-download')?{passes:[passes[0]]}:saved);});
    const payload={requestKey:'a'.repeat(64),eventDate:session.date};
    assert.equal((await api.request('register',{method:'POST',body:payload})).attendees.length,count);
    await api.request('register',{method:'POST',body:payload});assert.equal(calls[0].options.body,calls[1].options.body);
    await api.request('admin/bookings',{query:{date:session.date,status:'active',search:'Synthetic',page:1}});
    for(const action of ['cancel','restore','reissue'])await api.request('admin/change',{method:'POST',body:{bookingId:saved.id,attendeeId:saved.attendees[0].id,action}});
    assert.equal((await api.request('pass-download',{method:'POST',body:{key:'b'.repeat(64)}})).passes.length,1);
  }
});
test('Express-only client verifies login, restores CSRF and sends same-origin cookies',async()=>{
  const calls=[]; const csrf='c'.repeat(64);
  const api=createAyambilApi(async(url,options)=>{calls.push({url,options});return Response.json(url.includes('logout')?{authenticated:false}:url.includes('bookings')?{items:[],page:2,hasMore:false,integration:{ready:false,missing:[]}}:url.includes('session')&&options.method==='GET'?{authenticated:true}:{authenticated:true,csrfToken:csrf});});
  await api.login('synthetic@example.invalid','synthetic');assert.equal(calls.length,2);
  await api.restore();await api.request('admin/bookings',{query:{page:2,status:'cancelled'}});await api.logout();
  assert.ok(calls.every(c=>c.url.startsWith('/api/ayambil/')&&c.options.credentials==='same-origin'&&c.options.cache==='no-store'));
  assert.equal(calls.at(-1).options.headers['X-CSRF-Token'],csrf);
  assert.match(calls[3].url,/status=cancelled/);
});
test('resolved but empty/non-authenticated login or session never authenticates',async()=>{
  for(const result of [{},{authenticated:false},{authenticated:true},{authenticated:true,csrfToken:''}]) await assert.rejects(createAyambilApi(async()=>Response.json(result)).login('a','b'));
  let n=0;await assert.rejects(createAyambilApi(async()=>Response.json(++n===1?{authenticated:true,csrfToken:'a'.repeat(64)}:{authenticated:false})).login('a','b'));
});
test('malformed lists, HTML successes and denial statuses fail safely',async()=>{
  await assert.rejects(createAyambilApi(async()=>Response.json({items:null})).request('admin/bookings'));
  await assert.rejects(createAyambilApi(async()=>new Response('HTML')).request('status'));
  await assert.rejects(createAyambilApi(async()=>Response.json({error:'denied'},{status:401})).restore(),e=>e.status===401);
});
test('landscape pass physical dimensions, per-side fit and excessive content rejection',()=>{
  assert.equal(passPage.width,205);assert.equal(passPage.height,120);
  const p=passImagePlacement(120/205);assert.ok(p.x>=0&&p.y===0&&p.height<=120&&p.width<=205);
  assert.throws(()=>passImagePlacement(5),/readable/);assert.throws(()=>passImagePlacement(NaN));
});

test('response boundary rejects seven attendees while accepting six and checking pass ownership',async()=>{
 const {validateResponse}=await import('../src/lib/ayambilExpressClient.js');
 const session=programme.sessions[0];
 const attendee=i=>({id:'attendee-'+i,fullName:'Synthetic '+i,dates:[session.date],passes:[{number:'SYNTHETIC-'+i,attendeeName:'Synthetic '+i,status:'active',sessions:[session]}]});
 const saved={id:'booking',number:'SYNTHETIC',status:'active',attendees:Array.from({length:6},(_,i)=>attendee(i))};
 const list=item=>({items:[item],page:1,hasMore:false,integration:{ready:false,missing:[]}});
 assert.doesNotThrow(()=>validateResponse('admin/bookings',list(saved)));
 assert.doesNotThrow(()=>validateResponse('admin/change',saved));
 assert.throws(()=>validateResponse('admin/bookings',list({...saved,attendees:[...saved.attendees,attendee(6)]})),/Invalid booking response/);
 const broken=structuredClone(saved);broken.attendees[5].passes[0].attendeeName='Different person';
 assert.throws(()=>validateResponse('admin/bookings',list(broken)),/Invalid saved pass association/);
});

 test('logout does not depend on session restoration and admin reads use distinct cache keys',async()=>{
 const calls=[];const api=createAyambilApi(async(url,options)=>{calls.push({url,options});return Response.json({authenticated:false});});
 await api.logout();assert.equal(calls.length,1);assert.match(calls[0].url,/admin\/logout$/);
 await api.request('admin/session');await api.request('admin/session');
 assert.notEqual(calls[1].url,calls[2].url);assert.match(calls[1].url,/_fresh=/);
 });


test('release guard has a safe specific error rather than an expired-session diagnosis',async()=>{
 const api=createAyambilApi(async()=>Response.json({errorCode:'BOOKING_CONTROLS_SEND_DISABLED',error:'do not echo arbitrary server text'},{status:403}));
 await assert.rejects(api.request('admin/messages/send-selected',{method:'POST'}),e=>e.status===403&&e.code==='BOOKING_CONTROLS_SEND_DISABLED'&&e.message.includes('before provider submission')&&!e.message.includes('arbitrary'));
});

test('unified waiting list accepts no-pass records but rejects invented entry access',()=>{
 const row={id:'waiting-id',number:'WAIT26-FIXTURE',status:'waiting',eventDate:'2026-11-03',attendees:[{fullName:'Waiting Guest',status:'waiting',dates:['2026-11-03'],passes:[]}]};
 const result={items:[row],page:1,hasMore:false,integration:{ready:false,missing:[]}};
 assert.doesNotThrow(()=>validateResponse('admin/bookings',result));
 assert.throws(()=>validateResponse('admin/bookings',{...result,items:[{...row,downloadKeys:['invented']}]}));
 assert.throws(()=>validateResponse('admin/bookings',{...result,items:[{...row,attendees:[{...row.attendees[0],passes:[{}]}]}]}));
});
