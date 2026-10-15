import test from 'node:test';
import assert from 'node:assert/strict';
import {createMessageQueue} from '../message-queue.mjs';
import {hash} from '../security.mjs';
test('message listing exposes saved contact and exact original attendee/pass without capabilities or payload',async()=>{
 const queue=createMessageQueue({query:async()=>[[{id:'job',booking_id:'b',notification_type:'pass',dedupe_hash:hash('pass:b:1'),contactName:'Synthetic Contact',recipient:'+12025550123',provider_id:'provider',status:'read'}]],execute:async()=>[[{booking_id:'b',ordinal:2,full_name:'Synthetic Second',number:'ORIGINAL',revision:1},{booking_id:'b',ordinal:2,full_name:'Synthetic Second',number:'REISSUED',revision:2}]]},{},{});
 const [message]=await queue.list();assert.equal(message.attendeeName,'Synthetic Second');assert.equal(message.passNumber,'ORIGINAL');assert.equal(message.contactName,'Synthetic Contact');assert.equal(message.recipient,'+12025550123');assert.ok(!('provider_id'in message));assert.ok(!('dedupe_hash'in message));assert.ok(!('payload'in message));
});
