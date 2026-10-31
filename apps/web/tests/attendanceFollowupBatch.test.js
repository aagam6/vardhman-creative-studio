import test from 'node:test';
import assert from 'node:assert/strict';
import {reviewedNotificationBatch} from '../src/lib/notificationReviewedBatch.js';
const item={id:'11111111-2222-4333-8444-555555555555',purpose:'attendance',round_name:'response-followup-20261030',state:'held',attempts:0,provider_id:null};
const owner={owner:'bilingual',version:54};
test('explicit response follow-up batches preserve exact purpose, round and zero-attempt rules',()=>{
 assert.equal(reviewedNotificationBatch([item],owner).items[0].round,item.round_name);
 for(const change of [{purpose:'booking_confirmed'},{round_name:'random'},{attempts:1},{provider_id:'known'},{state:'uncertain'}])assert.throws(()=>reviewedNotificationBatch([{...item,...change}],owner));
 assert.throws(()=>reviewedNotificationBatch([item,{...item,id:'22222222-2222-4333-8444-555555555555',round_name:'initial'}],owner));
});
