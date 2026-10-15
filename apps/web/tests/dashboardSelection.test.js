import test from 'node:test';
import assert from 'node:assert/strict';
import {scopeBatchToBookings,runReviewedBatch} from '../src/lib/ayambilBatchSend.js';
test('selected booking scope cannot include an unrelated queued recipient',async()=>{
 const ids=['a'.repeat(36),'b'.repeat(36)];
 const preview={date:'2026-11-02',type:'pass',reviewedLegacy:false,items:ids.map((booking_id,index)=>({id:String(index).repeat(36),booking_id,notification_type:'pass',number:'SYNTHETIC',recipientMasked:'••••0123'}))};
 assert.equal(scopeBatchToBookings(preview,[]).items.length,0);
 const scoped=scopeBatchToBookings(preview,[ids[0]]);assert.equal(scoped.items.length,1);const sent=[];
 await runReviewedBatch({preview:scoped,request:async(path,{body})=>{sent.push(body.bookingId);return {status:'sent'};},shouldStop:()=>false,onResult:()=>{}});assert.deepEqual(sent,[ids[0]]);
});
