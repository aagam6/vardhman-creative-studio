import test from 'node:test';
import assert from 'node:assert/strict';
import {createStore} from '../store.mjs';
import {bookingInput} from '../config.mjs';
import {hash} from '../security.mjs';
test('store registration refuses either closed gate regardless of WhatsApp queue',async()=>{
 const input={contactName:'Synthetic Contact',mobile:'+12025550123',eventDate:'2026-11-02',termsAccepted:true,whatsappConsent:true,requestKey:'a'.repeat(64),attendees:[{fullName:'Synthetic Attendee',dates:['2026-11-02']}]};
 const {requestKey,...payload}=bookingInput(input);void requestKey;
 for(const registrationOpen of [false,true])for(const databaseOpen of [0,1]){
 if(registrationOpen&&databaseOpen)continue;
 let rolledBack=false;const db={beginTransaction:async()=>{},commit:async()=>assert.fail('closed gate committed'),rollback:async()=>{rolledBack=true;},release:()=>{},execute:async sql=>[sql.includes('SELECT * FROM ayambil_idempotency')?[{payload_hash:hash(JSON.stringify(payload)),booking_id:null}]:sql.includes('SELECT registration_open')?[{registration_open:databaseOpen}]:[]]};
 const store=createStore({getConnection:async()=>db},{registrationOpen},{queue:{}});
 await assert.rejects(store.register(input),e=>e.status===403);assert.equal(rolledBack,true);
 }
});

