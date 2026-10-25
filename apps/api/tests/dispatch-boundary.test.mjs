import test from 'node:test';
import assert from 'node:assert/strict';
import {createMessageQueue} from '../message-queue.mjs';
import {nextDeliveryStatus} from '../delivery-status-policy.mjs';
test('all direct production dispatch entries remain closed before database/provider access',async()=>{
 let calls=0;const forbidden=new Proxy({},{get(){return ()=>{calls++;throw Error('must not access');};}});
 const q=createMessageQueue(forbidden,forbidden,{AYAMBIL_BOOKING_CONTROLS_ENABLED:'true',AYAMBIL_WHATSAPP_ENABLED:'true',AYAMBIL_QUEUE_ENCRYPTION_KEY:'a'.repeat(64)});
 for(const fn of [()=>q.runSelected({}),()=>q.runOne(),()=>q.runScheduledReminder(),()=>q.runTest('11111111-1111-4111-8111-111111111111')])await assert.rejects(fn(),e=>e.status===403);
 assert.equal(q.manualAvailable(),false);assert.equal(calls,0);
});
test('delivery reconciliation is monotonic and late acceptance does not erase failure',()=>{
 for(const previous of ['delivered','read'])assert.equal(nextDeliveryStatus(previous,'failed'),previous);
 assert.equal(nextDeliveryStatus('read','delivered'),'read');assert.equal(nextDeliveryStatus('failed','accepted'),'failed');assert.equal(nextDeliveryStatus('failed','read'),'read');assert.equal(nextDeliveryStatus('uncertain','sent'),'sent');
 assert.throws(()=>nextDeliveryStatus('accepted','unknown'));
});
