import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {createStore} from '../store.mjs';
import {createMessageQueue,queueCrypto} from '../message-queue.mjs';
import {attendeeContext} from '../notification-context.mjs';
import {programme} from '../config.mjs';
import {hash} from '../security.mjs';
export async function checkBookingPassMessages(pool,config){
 await pool.query('UPDATE ayambil_settings SET registration_open=TRUE WHERE id=1');
 const env={AYAMBIL_WHATSAPP_ENABLED:'true',AYAMBIL_QUEUE_ENCRYPTION_KEY:'c'.repeat(64),AYAMBIL_SITE_ORIGIN:'https://vardhmancreativestudio.com',AYAMBIL_PRODUCTION_TEMPLATE_POLICY:'ayambil-en-2026-10-13-v1',AYAMBIL_WHATSAPP_NORMAL_PROCESSING_APPROVED:'false',AYAMBIL_WHATSAPP_MANUAL_PROCESSING_APPROVED:'true',AYAMBIL_WHATSAPP_QUEUE_OWNER:'express-mysql',AYAMBIL_WHATSAPP_MANUAL_START_AT:'2000-01-01T00:00:00.000Z'};
 let sends=0,last;
 const queue=createMessageQueue(pool,{prepare:async(type,context)=>{last=context;return {type,context};},sendPrepared:async()=>({id:'combined-mock-'+(++sends),status:'sent'})},env),store=createStore(pool,config,{queue});
 const input=n=>({contactName:'Synthetic combined contact',mobile:'+12025550123',eventDate:'2026-11-02',termsAccepted:true,whatsappConsent:true,requestKey:randomUUID().replaceAll('-','').repeat(2),attendees:Array.from({length:n},(_,i)=>({fullName:'Combined guest '+i,dates:['2026-11-02']}))});
 for(const n of [2,3,4,5,6]){
  const receipt=await store.register(input(n)),b=(await store.list({search:receipt.number})).items[0];
  const [jobs]=await pool.execute('SELECT * FROM ayambil_message_queue WHERE booking_id=?',[b.id]);assert.equal(jobs.length,2);assert.equal(jobs.filter(j=>j.notification_type==='confirmation').length,1);
  const p=jobs.find(j=>j.notification_type==='pass');assert.equal((await queue.previewBatch({type:'pass',date:'2026-11-02',reviewedLegacy:true})).items.filter(j=>j.booking_id===b.id).length,1);const before=sends;
  await queue.runSelected({id:p.id,bookingId:b.id,type:'pass'});assert.equal(sends,before+1);
  const key=new URL(last.passLink).hash.slice(1),download=await store.downloadBooking(key);
  assert.equal(download.passes.length,n);await assert.rejects(store.download(key),e=>e.status===404);await assert.rejects(store.downloadBooking(receipt.downloadKeys[0]),e=>e.status===404);assert.deepEqual(download.passes.map(p=>p.number),receipt.attendees.map(a=>a.passes[0].number));
  assert.deepEqual(download.passes.map(p=>p.attendeeName),receipt.attendees.map(a=>a.fullName));
  assert.equal((await store.download(receipt.downloadKeys[0])).passes.length,1,'Old private attendee link must not expand');
  await assert.rejects(queue.runSelected({id:p.id,bookingId:b.id,type:'pass'}),e=>e.status===409);assert.equal(sends,before+1);
  const [actor]=await pool.query('SELECT id AS admin_id FROM ayambil_admins LIMIT 1');
  await store.change(actor[0],{action:'cancel-pass',bookingId:b.id,passNumber:download.passes[0].number});
  assert.equal((await store.downloadBooking(key)).passes.length,n-1);
  await store.change(actor[0],{action:'trash-pass',bookingId:b.id,passNumber:download.passes[0].number});
  assert.equal((await store.downloadBooking(key)).passes.length,n-1);
  await store.change(actor[0],{action:'cancel',bookingId:b.id});await assert.rejects(store.downloadBooking(key),e=>e.status===404);
 }
 // Reproduce the old six-individual-job shape without rewriting its sent history.
 for(const attempted of [false,true]){
  const receipt=await createStore(pool,config).register(input(6));const b=(await store.list({search:receipt.number})).items[0];
  const ids=[];for(let i=0;i<6;i++){const id=randomUUID();ids.push(id);await pool.execute('INSERT INTO ayambil_message_queue(id,dedupe_hash,booking_id,notification_type,payload,status,attempts,provider_id,next_attempt_at,updated_at) VALUES(?,?,?,?,?,?,?,?,UTC_TIMESTAMP(3),UTC_TIMESTAMP(3))',[id,hash('pass:'+b.id+':'+i),b.id,'pass',queueCrypto(env.AYAMBIL_QUEUE_ENCRYPTION_KEY).seal({...attendeeContext(programme.sessions[0],receipt.attendees[i].fullName,'+12025550123'),passLink:config.origin+'/500-akhand-ayambil-vijayollas/passes#'+receipt.downloadKeys[i]}),attempted&&i===0?'delivered':'queued',attempted&&i===0?1:0,attempted&&i===0?'old-delivered-'+b.id:null]);}
  const [history]=await pool.execute('SELECT * FROM ayambil_message_queue WHERE id=?',[ids[0]]);
  assert.equal((await queue.previewBatch({type:'pass',date:'2026-11-02',reviewedLegacy:true})).items.filter(j=>j.booking_id===b.id).length,1,'Six legacy pending jobs preview as one combined send');const before=sends;await Promise.allSettled(ids.slice(attempted?1:0).map(id=>queue.runSelected({id,bookingId:b.id,type:'pass',reviewedLegacy:true})));
  assert.equal(sends,before+1);assert.equal((await store.downloadBooking(new URL(last.passLink).hash.slice(1))).passes.length,6);
  const [remaining]=await pool.execute("SELECT * FROM ayambil_message_queue WHERE booking_id=? AND status='queued'",[b.id]);assert.equal(remaining.length,0);
  if(attempted){const [after]=await pool.execute('SELECT * FROM ayambil_message_queue WHERE id=?',[ids[0]]);assert.deepEqual(after,history);}
  for(const key of receipt.downloadKeys)assert.equal((await store.download(key)).passes.length,1);
 }
 console.log('Combined WhatsApp: 2–6 attendees, one provider call, scoped downloads, old links and delivered history preserved');
}
