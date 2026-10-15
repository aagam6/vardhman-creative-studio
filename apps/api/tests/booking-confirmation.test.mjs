import test from 'node:test';
import assert from 'node:assert/strict';
import {createStore} from '../store.mjs';
import {programme} from '../config.mjs';
test('six-person registration queues one booking confirmation and six individual pass links',async()=>{
 const jobs=[],attendees=[],passes=[];let booking;
 const db={beginTransaction:async()=>{},commit:async()=>{},rollback:async()=>{},release(){},execute:async(sql,args=[])=>{
 if(sql.startsWith('SELECT * FROM ayambil_idempotency'))return [[{payload_hash:payloadHash}]];
 if(sql.startsWith('SELECT registration_open'))return [[{registration_open:1}]];
 if(sql.startsWith('SELECT snapshot FROM ayambil_events'))return [[{snapshot:programme.sessions[0]}]];
 if(sql.startsWith('INSERT INTO ayambil_bookings'))booking={id:args[0],number:args[1],status:'active',event_date:args[4]};
 if(sql.startsWith('INSERT INTO ayambil_attendees'))attendees.push({id:args[0],full_name:args[2]});
 if(sql.startsWith('SELECT COALESCE(MAX'))return [[{revision:1}]];
 if(sql.startsWith('INSERT INTO ayambil_passes'))passes.push({attendee_id:args[1],snapshot:JSON.parse(args[3]),status:'active'});
 if(sql.startsWith('SELECT * FROM ayambil_bookings'))return [[booking]];
 if(sql.startsWith('SELECT * FROM ayambil_attendees'))return [attendees];
 if(sql.startsWith('SELECT snapshot,status'))return [passes.filter(p=>p.attendee_id===args[0])];
 return [{affectedRows:1}];
 }};
 const input={contactName:'Synthetic Contact',mobile:'+12025550123',eventDate:'2026-11-02',termsAccepted:true,whatsappConsent:true,requestKey:'a'.repeat(64),attendees:Array.from({length:6},(_,i)=>({fullName:'Synthetic Person '+i,dates:['2026-11-02']}))};
 const {bookingInput}=await import('../config.mjs');const {hash}=await import('../security.mjs');const {requestKey,...payload}=bookingInput(input);const payloadHash=hash(JSON.stringify(payload));
 const store=createStore({getConnection:async()=>db},{registrationOpen:true,origin:'https://example.invalid'},{queue:{enqueue:async(db,job)=>jobs.push(job)}});
 const result=await store.register(input);assert.equal(result.attendees.length,6);assert.equal(jobs.filter(j=>j.type==='confirmation').length,1);assert.equal(jobs.filter(j=>j.type==='pass').length,6);assert.equal(jobs.find(j=>j.type==='confirmation').context.attendeeName,'Synthetic Contact');
});
