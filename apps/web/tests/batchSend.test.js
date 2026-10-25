import test from 'node:test';
import assert from 'node:assert/strict';
import {runReviewedBatch,validateBatchPreview,BATCH_INTERVAL_MS} from '../src/lib/ayambilBatchSend.js';
const item=n=>({id:`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`,booking_id:'11111111-1111-4111-8111-111111111111',notification_type:'confirmation',number:'SYNTHETIC BOOKING',recipientMasked:'••••0123'});
const preview={date:'2026-11-02',type:'confirmation',reviewedLegacy:false,items:[item(1),item(2)]};
test('batch supports 500 exact IDs, masks contacts, bounds preview and rejects duplicates',()=>{
 assert.equal(validateBatchPreview({...preview,items:Array.from({length:500},(_,i)=>item(i+1))}).items.length,500);
 for(const items of [[item(1),item(1)],[{...item(1),recipientMasked:'+12025550123'}],Array.from({length:1001},(_,i)=>item(i+1))])assert.throws(()=>validateBatchPreview({...preview,items}));
});
test('batch submits exact reviewed IDs sequentially with pacing, never a recipient override',async()=>{
 const calls=[],waits=[],results=[];
 const outcome=await runReviewedBatch({preview:{...preview,reviewedLegacy:true},request:async(path,options)=>{calls.push({path,body:options.body});return {status:'accepted'};},shouldStop:()=>false,onResult:(job,result)=>results.push(result),wait:async ms=>waits.push(ms)});
 assert.equal(outcome.submitted,2);assert.deepEqual(waits,[BATCH_INTERVAL_MS]);assert.equal(results.length,2);
 assert.deepEqual(calls[0].body,{id:item(1).id,bookingId:item(1).booking_id,type:'confirmation',reviewedLegacy:true});
});
test('uncertainty, rejection, throttle and cancellation stop without advancing or retrying',async()=>{
 for(const status of ['uncertain','failed','preflight_failed','cancelled']){
  let calls=0;await runReviewedBatch({preview,request:async()=>{calls++;return {status};},shouldStop:()=>false,onResult:()=>{},wait:async()=>assert.fail('must not wait or advance')});assert.equal(calls,1);
 }
 let calls=0;await runReviewedBatch({preview,request:async()=>{calls++;throw {status:429};},shouldStop:()=>false,onResult:()=>{}});assert.equal(calls,1);
 let stop=false;calls=0;await runReviewedBatch({preview,request:async()=>{calls++;stop=true;return {status:'accepted'};},shouldStop:()=>stop,onResult:()=>{}});assert.equal(calls,1);
});


test('explicit release send block stops with zero submitted and no retry',async()=>{
 let calls=0;const results=[];
 const outcome=await runReviewedBatch({preview,request:async()=>{calls++;throw {status:403,code:'BOOKING_CONTROLS_SEND_DISABLED'};},shouldStop:()=>false,onResult:(job,result)=>results.push(result),wait:async()=>assert.fail('blocked batch must not advance')});
 assert.equal(calls,1);assert.equal(outcome.submitted,0);assert.equal(outcome.stopped,true);assert.equal(results[0].status,'blocked - sending disabled');
});
