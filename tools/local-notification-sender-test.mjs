import assert from 'node:assert/strict';
import {writeFile,mkdir} from 'node:fs/promises';
import {randomBytes} from 'node:crypto';
import {startBookingFixture,fixtureInput} from './booking-controls-fixture.mjs';
import {createLocalNotificationSender,createInMemoryNotificationProvider,localSenderSchema} from '../apps/api/local-notification-sender.mjs';
import {bilingualCatalog} from '../apps/api/bilingual-template-adapter.mjs';
const f=await startBookingFixture(),provider=createInMemoryNotificationProvider(),key=randomBytes(32).toString('hex');
const catalog=structuredClone(bilingualCatalog); // Fresh SYNTHETIC approval evidence, not a refreshed live approval.
for(const t of catalog)t.approvalEvidence.observedAt=new Date().toISOString();
let assertions=0;const ok=(a,b)=>{assert.deepEqual(a,b);assertions++;};
const options={pool:f.pool,config:f.config,key,provider,catalog};
const fingerprint=async()=>{const result={};for(const table of ['ayambil_bookings','ayambil_attendees','ayambil_passes','ayambil_capabilities','ayambil_message_queue']){const [r]=await f.pool.query('SELECT * FROM '+table);result[table]=JSON.stringify(r);}return result;};
try{
 await f.pool.query(localSenderSchema);
 assert.throws(()=>createLocalNotificationSender({...options,provider:{submit:()=>fetch('https://invalid')}}));assertions++;
 assert.throws(()=>createLocalNotificationSender({...options,config:{...f.config,disposable:false}}));assertions++;
 const controls=f.store.bookingControls;
 const update=async(date,mode,capacity)=>{const e=(await controls.availability()).find(e=>e.event_date===date);await controls.update(f.actor,{eventDate:date,mode,capacity,version:e.version});};
 await update('2026-11-02','open',100);await update('2026-11-03','waiting',10);
 const receipt=await f.store.register(fixtureInput(['Sender Guest A','Sender Guest B']));
 const second=await f.store.register(fixtureInput(['Sender Guest A','Sender Guest B','Sender Guest C']));
 const books=(await controls.duplicates()).bookings,booking=books.find(b=>b.number===receipt.number),other=books.find(b=>b.number===second.number);
 const independent=await f.store.register(fixtureInput(['Independent Guest'],'2026-11-02','+12025550199'));const independentId=(await controls.duplicates()).bookings.find(b=>b.number===independent.number).id;
 const waitingReceipt=await f.store.register(fixtureInput(['Waiting Sender'],'2026-11-03'));
 const waiting=(await controls.waiting()).find(w=>w.number===waitingReceipt.number);
 const review=await controls.createReview(f.actor,{purpose:'duplicate',bookingIds:[booking.id,other.id]});const reviewLink=await controls.link(f.actor,review.id);
 const attendance=await controls.createReview(f.actor,{purpose:'attendance',bookingIds:[booking.id]});const attendanceLink=await controls.link(f.actor,attendance.id);
 const sender=createLocalNotificationSender(options);
 const before=await fingerprint();
 const badLanguage=structuredClone(catalog);badLanguage.find(t=>t.purpose==='entry_timing').languageCode='gu';await assert.rejects(createLocalNotificationSender({...options,catalog:badLanguage}).enqueue({purpose:'entry_timing',subject:independentId}));assertions++;
 const badCategory=structuredClone(catalog);badCategory.find(t=>t.purpose==='entry_timing').approvalEvidence.category='MARKETING';await assert.rejects(createLocalNotificationSender({...options,catalog:badCategory}).enqueue({purpose:'entry_timing',subject:independentId}));assertions++;
 const heldId=randomBytes(16).toString('hex').replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/,'$1-$2-$3-$4-$5');
 await f.pool.execute("INSERT INTO ayambil_notification_intents(id,dedupe_hash,booking_id,subject,purpose,review_round,context,created_at) VALUES(?,SHA2(?,256),?,?,'entry_timing','bridge',?,UTC_TIMESTAMP(3))",[heldId,heldId,independentId,independentId,JSON.stringify({mobile:'untrusted-do-not-use'})]);
 const bridged=await sender.enqueueHeldIntent(heldId);await sender.runOne(bridged);ok(provider.calls.at(-1).to,'+12025550199');ok((await f.pool.query('SELECT state FROM ayambil_notification_intents WHERE id=?',[heldId]))[0][0].state,'held');
 const bridgeCalls=provider.calls.length;

 const confirm={purpose:'booking_confirmed',subject:booking.id};
 const ids=await Promise.all(Array.from({length:12},()=>sender.enqueue(confirm)));ok(new Set(ids).size,1);
 const claimed=await Promise.all(Array.from({length:8},()=>sender.runOne(ids[0])));ok(claimed.filter(x=>x.status==='accepted').length,1);ok(provider.calls.length,bridgeCalls+1);
 await sender.runOne(ids[0]);ok(provider.calls.length,bridgeCalls+1);
 await assert.rejects(sender.enqueue({...confirm,round:'repeat'}));assertions++;
 const ack=await sender.enqueue({purpose:'waiting_received',subject:waiting.id});await sender.runOne(ack);ok(provider.calls.at(-1).name,'ayambil_waiting_received_bilingual');
 ok(provider.calls.at(-1).to,'+12025550123');
 const duplicate=await sender.enqueue({purpose:'booking_verify',subject:review.id,token:reviewLink.path.split('#')[1]});await sender.runOne(duplicate);
 const att=await sender.enqueue({purpose:'attendance',subject:attendance.id,token:attendanceLink.path.split('#')[1]});await sender.runOne(att);
 const gate=await sender.enqueue({purpose:'entry_timing',subject:booking.id});await sender.runOne(gate);
 ok(await fingerprint(),before); // Mock processing never writes protected booking/pass/legacy queue tables.
 const approved=await controls.approve(f.actor,waiting.id);const afterApproval=await fingerprint();
 const approval=await sender.enqueue({purpose:'waiting_approved',subject:waiting.id});await sender.runOne(approval);
 ok(await sender.enqueue({purpose:'waiting_approved',subject:(await controls.duplicates()).bookings.find(b=>b.number===approved.number).id}),approval);await assert.rejects(sender.enqueue({purpose:'booking_confirmed',subject:(await controls.duplicates()).bookings.find(b=>b.number===approved.number).id}));assertions++;ok(new Set(provider.calls.map(x=>x.purpose)).size,6);ok(provider.calls.every(x=>x.language.code==='en'&&x.sendAllowed===false),true);ok(await fingerprint(),afterApproval);
 // Timeout, malformed response and crash windows are never automatically resubmitted.
 for(const [round,result,expected] of [['timeout',new Error('simulated timeout'),'uncertain'],['malformed',{},'uncertain'],['reject',{status:'rejected'},'failed'],['rate',{status:'rate_limited'},'failed']]){
  const id=await sender.enqueue({purpose:'entry_timing',subject:booking.id,round});provider.outcomes.push(result);ok((await sender.runOne(id)).status,expected);const count=provider.calls.length;await sender.runOne(id);ok(provider.calls.length,count);
 }
 for(const crash of ['crashAfterClaim','crashAfterProvider']){
  const id=await sender.enqueue({purpose:'entry_timing',subject:booking.id,round:crash});await assert.rejects(sender.runOne(id,{[crash]:true}));assertions++;
  const count=provider.calls.length;const restarted=createLocalNotificationSender(options);
  await restarted.recover();ok((await restarted.list()).find(r=>r.id===id).state,'processing');
  await f.pool.execute('UPDATE ayambil_local_notification_outbox SET updated_at=DATE_SUB(UTC_TIMESTAMP(3),INTERVAL 6 MINUTE) WHERE id=?',[id]);await restarted.recover();ok((await restarted.list()).find(r=>r.id===id).state,'uncertain');await restarted.runOne(id);ok(provider.calls.length,count);
 }
 // Response/revocation and pass revision changes invalidate stale intents.
 const pending=await controls.createReview(f.actor,{purpose:'attendance',bookingIds:[booking.id],round:'followup'});const link=await controls.link(f.actor,pending.id);
 const pendingId=await sender.enqueue({purpose:'attendance',subject:pending.id,token:link.path.split('#')[1],round:'followup'});
 await controls.respond(link.path.split('#')[1],{attending:'no',count:0,names:[]});await sender.runOne(pendingId);ok((await sender.list()).find(r=>r.id===pendingId).state,'blocked');
 const revoke=await controls.createReview(f.actor,{purpose:'attendance',bookingIds:[independentId],round:'revoke'});const revokeLink=await controls.link(f.actor,revoke.id);const revokeId=await sender.enqueue({purpose:'attendance',subject:revoke.id,round:'revoke',token:revokeLink.path.split('#')[1]});await controls.revoke(f.actor,revoke.id);await sender.runOne(revokeId);ok((await sender.list()).find(r=>r.id===revokeId).state,'blocked');
 const stale=await sender.enqueue({purpose:'entry_timing',subject:booking.id,round:'stale'});await f.pool.execute("UPDATE ayambil_passes p JOIN ayambil_attendees a ON a.id=p.attendee_id SET p.trashed_at=UTC_TIMESTAMP(3) WHERE a.booking_id=?",[booking.id]);await sender.runOne(stale);ok((await sender.list()).find(r=>r.id===stale).state,'blocked');
 const prior=await sender.enqueue({purpose:'booking_confirmed',subject:other.id});await f.pool.execute("UPDATE ayambil_message_queue SET attempts=1 WHERE booking_id=? AND notification_type='confirmation'",[other.id]);await sender.runOne(prior);ok((await sender.list()).find(r=>r.id===prior).state,'blocked');
 const expired=await controls.createReview(f.actor,{purpose:'attendance',bookingIds:[independentId],round:'expiry'});const expiredLink=await controls.link(f.actor,expired.id);const expiredId=await sender.enqueue({purpose:'attendance',subject:expired.id,round:'expiry',token:expiredLink.path.split('#')[1]});await f.pool.execute('UPDATE ayambil_family_reviews SET expires_at=DATE_SUB(UTC_TIMESTAMP(3),INTERVAL 1 SECOND) WHERE id=?',[expired.id]);await sender.runOne(expiredId);ok((await sender.list()).find(r=>r.id===expiredId).state,'blocked');
 const bad=structuredClone(catalog);bad[0].languageCode='gu';await assert.rejects(createLocalNotificationSender({...options,catalog:bad}).enqueue({purpose:'booking_confirmed',subject:other.id}));assertions++;
 const [raw]=await f.pool.query('SELECT envelope FROM ayambil_local_notification_outbox');ok(raw.every(r=>!r.envelope.includes('Sender')&&!r.envelope.includes('respond#')),true);
 const result={passed:true,assertions,mockProviderCalls:provider.calls.length,actualProviderCalls:0,fixtureProviderCalls:f.telemetry.providerCalls,source:'disposable MySQL; synthetic approval clock; mock-only API'};
 await mkdir('tmp/local-sender-20261025',{recursive:true});await writeFile('tmp/local-sender-20261025/results.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
}finally{await f.close();}
