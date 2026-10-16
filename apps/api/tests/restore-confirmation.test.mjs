import test from 'node:test';
import assert from 'node:assert/strict';
import {createStore} from '../store.mjs';

for(const confirmationStatus of ['queued','sent','delivered','read'])test(`repeated six-pass cancel/restore retains the exact queue when confirmation is ${confirmationStatus}`,async()=>{
 const booking={id:'synthetic-booking',number:'BOOK26-SYNTHETIC',status:'active',event_date:'2026-11-02'};
 const attendees=Array.from({length:6},(_,i)=>({id:'attendee-'+i,full_name:'Synthetic Guest '+i,status:'active',ordinal:i+1}));
 const passes=attendees.map((a,i)=>({id:'pass-'+i,attendee_id:a.id,status:'active',snapshot:{number:'AYV26-'+i,attendeeName:a.full_name}}));
 const jobs=[{id:'original-confirmation',notification_type:'confirmation',status:confirmationStatus,attempts:confirmationStatus==='queued'?0:1,provider_id:confirmationStatus==='queued'?null:'existing-provider-id'},...attendees.map((a,i)=>({id:'original-pass-job-'+i,notification_type:'pass',status:'queued',attempts:0,provider_id:null}))];
 const before=structuredClone(jobs),writes=[];let enqueued=0;
 const execute=async(sql,args=[])=>{
  if(sql.startsWith('SELECT * FROM ayambil_bookings'))return [[booking]];
  if(sql.startsWith('SELECT * FROM ayambil_attendees'))return [attendees];
  if(sql.startsWith('SELECT snapshot,status,trashed_at'))return [passes.filter(p=>p.attendee_id===args[0])];
  if(sql.startsWith('SELECT notification_type,status,attempts,updated_at FROM ayambil_message_queue'))return [jobs];
  if(sql.startsWith('UPDATE ayambil_bookings SET')){writes.push(sql);booking.status=args[0];return [[]];}
  if(sql.startsWith('UPDATE ayambil_attendees SET')){writes.push(sql);attendees.forEach(a=>a.status=args[0]);return [[]];}
  if(sql.startsWith('UPDATE ayambil_passes p')){writes.push(sql);passes.forEach(p=>p.status=args[0]);return [[]];}
  if(sql.startsWith('INSERT INTO ayambil_audit')){writes.push(sql);return [[]];}
  throw Error('Unexpected restore query: '+sql);
 };
 const db={execute,beginTransaction:async()=>{},commit:async()=>{},rollback:async()=>{},release(){}};
 const store=createStore({getConnection:async()=>db},{},{queue:{enqueue:async()=>{enqueued++;throw Error('Restore must not enqueue');}}});
 for(let attempt=0;attempt<3;attempt++){
  await store.change({admin_id:'operator'},{action:'cancel',bookingId:booking.id});
  await store.change({admin_id:'operator'},{action:'restore',bookingId:booking.id});
  assert.equal(booking.status,'active');assert.ok(passes.every(p=>p.status==='active'));
  assert.deepEqual(jobs,before);assert.equal(jobs.filter(j=>j.notification_type==='confirmation').length,1);assert.equal(jobs.length,7);
 }
 assert.equal(enqueued,0);assert.ok(!writes.some(sql=>sql.includes('ayambil_message_queue')||sql.includes('ayambil_whatsapp_attempts')));
});
