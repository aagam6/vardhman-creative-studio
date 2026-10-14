import test from 'node:test';
import assert from 'node:assert/strict';
import { createAyambilApi } from '../src/lib/ayambilExpressClient.js';
import { passPage, passImagePlacement } from '../src/lib/ayambilPassLayout.js';
import {readFileSync} from 'node:fs';
const programme=JSON.parse(readFileSync(new URL('../../pocketbase/pb_hooks/ayambil/config.json',import.meta.url)));
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
  for(const session of programme.sessions)for(const count of [1,2]){
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
