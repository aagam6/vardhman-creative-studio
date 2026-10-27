import test from 'node:test';
import assert from 'node:assert/strict';
import {reviewedNotificationBatch,runNotificationBatch,NOTIFICATION_BATCH_INTERVAL_MS} from '../src/lib/notificationReviewedBatch.js';
import {createAyambilApi} from '../src/lib/ayambilExpressClient.js';
const row=n=>({id:`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`,purpose:'booking_verify',round_name:'initial',state:'held',attempts:0,provider_id:null});
const owner={owner:'bilingual',version:16};
test('review rejects prior attempts, receipts, mixed purposes, duplicate IDs and paused ownership',()=>{
 assert.equal(reviewedNotificationBatch([row(1)],owner).version,16);
 for(const rows of [[{...row(1),attempts:1}],[{...row(1),provider_id:'receipt'}],[row(1),row(1)],[row(1),{...row(2),purpose:'attendance'}],Array.from({length:21},(_,i)=>row(i))])assert.throws(()=>reviewedNotificationBatch(rows,owner));
 assert.throws(()=>reviewedNotificationBatch([row(1)],{owner:'paused',version:17}));
});
test('foreground batch submits each exact ID once, persists each outcome and paces below 4/min',async()=>{
 const calls=[],saved=[],waits=[];const preview=reviewedNotificationBatch([row(1),row(2)],owner);
 const result=await runNotificationBatch({preview,request:async(path,o)=>{calls.push({path,...o.body});return {status:'accepted'};},shouldStop:()=>false,onResult:async(i,r)=>saved.push([i.id,r.status]),wait:async ms=>waits.push(ms)});
 assert.equal(result.submitted,2);assert.deepEqual(waits,[17000]);assert.ok(NOTIFICATION_BATCH_INTERVAL_MS>15000);assert.deepEqual(calls.map(c=>c.id),preview.items.map(i=>i.id));assert.equal(saved.length,2);assert.equal(calls[0].version,16);assert.equal(calls[0].confirmation,'SEND ONE REVIEWED MESSAGE');
});
test('timeout/429/uncertainty/rejection stops without second submission or automatic resume',async()=>{
 for(const outcome of ['uncertain','blocked','failed','not_claimed','timeout','429']){
  let calls=0;const saved=[];
  const result=await runNotificationBatch({preview:reviewedNotificationBatch([row(1),row(2)],owner),request:async()=>{calls++;if(outcome==='timeout')throw Error('timeout');if(outcome==='429')throw {status:429};return {status:outcome};},shouldStop:()=>false,onResult:async(i,r)=>saved.push(r),wait:async()=>assert.fail('must stop')});
  assert.equal(calls,1);assert.equal(result.stopped,true);assert.equal(saved.length,1);
 }
});
test('stop requested during current request preserves its outcome and stops next ID',async()=>{
 let stop=false,calls=0;
 const result=await runNotificationBatch({preview:reviewedNotificationBatch([row(1),row(2)],owner),request:async()=>{calls++;stop=true;return {status:'sent'};},shouldStop:()=>stop,onResult:async()=>{},wait:async()=>assert.fail('must stop')});
 assert.equal(calls,1);assert.equal(result.submitted,1);assert.equal(result.stopped,true);
});
test('notification transport covers three bounded provider calls and preserves safe HTTP correlation',async t=>{
 const delays=[];t.mock.method(globalThis,'setTimeout',(_,ms)=>{delays.push(ms);return 0;});t.mock.method(globalThis,'clearTimeout',()=>{});
 const reference='00000000-0000-4000-8000-000000000999';
 const api=createAyambilApi(async()=>new Response(JSON.stringify({error:'SECRET RAW PROVIDER ERROR MUST NEVER APPEAR'}),{status:429,headers:{'content-type':'application/json','x-request-id':reference}}));
 await assert.rejects(api.request('admin/notification-outbox/send',{method:'POST',body:{id:row(1).id}}),e=>e.status===429&&e.requestId===reference&&!e.message.includes('SECRET')&&!e.message.includes('Please retry'));
 assert.deepEqual(delays,[45000]);
});
