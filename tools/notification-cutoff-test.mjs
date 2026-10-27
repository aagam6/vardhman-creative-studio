// Disposable loopback MySQL only. No .env or real provider transport.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {randomUUID,createHash} from 'node:crypto';
import {startBookingFixture,fixtureInput} from './booking-controls-fixture.mjs';
import {createProductionNotificationSender} from '../apps/api/notification-sender.mjs';
import {bilingualCatalog} from '../apps/api/bilingual-template-adapter.mjs';
const f=await startBookingFixture();let assertions=0,posts=0;const ok=(a,b)=>{assert.deepEqual(a,b);assertions++;};
try{
 for(const s of (await readFile('apps/api/migrations/012_notification_sender.sql','utf8')).replace(/^--.*$/gm,'').split(';').map(s=>s.trim()).filter(Boolean))await f.pool.query(s);
 const c=f.store.bookingControls;await c.update(f.actor,{eventDate:'2026-11-03',mode:'waiting',capacity:0,version:1});
 const ids=[];for(let n=0;n<4;n++){const r=await f.store.register(fixtureInput(['Synthetic cutoff '+n],'2026-11-03','+1202555013'+n));ids.push((await c.waiting()).find(w=>w.number===r.number).id);}
 const cutoff='2026-10-27T07:28:06.000Z';
 for(let n=0;n<4;n++)await f.pool.execute("INSERT INTO ayambil_notification_intents(id,dedupe_hash,subject,purpose,review_round,context,created_at) VALUES(?,?,?,'waiting_received','initial',JSON_OBJECT(),?)",[randomUUID(),createHash('sha256').update('fixture'+n).digest('hex'),ids[n],n===0?'2026-10-27 07:28:05.999':n===1?'2026-10-27 07:28:06.000':n===2?'2026-10-27 07:28:06.001':'2026-10-27 07:28:06.002']);
 const catalog=structuredClone(bilingualCatalog).map(t=>({...t,approvalEvidence:{verified:true,templateId:t.templateId,status:'APPROVED',category:'UTILITY',observedAt:new Date().toISOString()}}));const config={...f.config,notificationService:true,notificationDispatch:true};
 const sender=createProductionNotificationSender({pool:f.pool,config,key:f.fixtureQueueKey,catalog,provider:{validate:async()=>{},submit:async()=>({providerId:'fixture-'+ ++posts,status:'accepted'})}});await sender.ready();await sender.handover({owner:'bilingual',version:1},f.actor);
 const oldJob=await sender.enqueue({purpose:'waiting_received',subject:ids[0]}),equalJob=await sender.enqueue({purpose:'waiting_received',subject:ids[1]}),newJob=await sender.enqueue({purpose:'waiting_received',subject:ids[2]});
 const pending=await sender.pending(cutoff);ok(pending.length,1);ok(pending[0].outbox_id,newJob);
 for(const job of [oldJob,equalJob]){await assert.rejects(sender.runOne(job,{ownershipVersion:2,automaticSince:cutoff}),/Outside automatic/);assertions++;}ok(posts,0);
 const results=await Promise.allSettled([sender.runOne(newJob,{ownershipVersion:2,automaticSince:cutoff}),sender.runOne(newJob,{ownershipVersion:2,actor:'manual-admin'})]);ok(results.filter(r=>r.status==='fulfilled'&&r.value.status==='accepted').length,1);ok(results.every(r=>r.status==='fulfilled'),true);ok(posts,1);
 const next=await sender.pending(cutoff);ok(next.length,1);ok(next[0].outbox_id,null);const nextJob=await sender.enqueueHeldIntent(next[0].id);ok((await sender.runOne(nextJob,{ownershipVersion:2,automaticSince:cutoff})).status,'deferred');ok(posts,1);ok(Number((await f.pool.query('SELECT attempts FROM ayambil_notification_outbox WHERE id=?',[nextJob]))[0][0].attempts),0);
 // Disposable fixture advances only the pacing timestamp, never a production row.
 await f.pool.query("UPDATE ayambil_notification_audit SET created_at=DATE_SUB(UTC_TIMESTAMP(3),INTERVAL 20 SECOND) WHERE action='claim_committed'");
 // A provider receipt update is not a new submission and must not defer the next record.
 await f.pool.execute('UPDATE ayambil_notification_outbox SET updated_at=UTC_TIMESTAMP(3) WHERE id=?',[newJob]);
 ok((await sender.pending(cutoff))[0].outbox_id,nextJob);ok((await sender.runOne(nextJob,{ownershipVersion:2,automaticSince:cutoff})).status,'accepted');ok(posts,2);ok((await sender.pending(cutoff)).length,0);
 const held=await f.store.register(fixtureInput(['Synthetic consent hold'],'2026-11-03','+12025550999'));const heldWaiting=(await c.waiting()).find(w=>w.number===held.number);const heldId=randomUUID();await f.pool.execute("INSERT INTO ayambil_notification_intents(id,dedupe_hash,subject,purpose,review_round,context,created_at) VALUES(?,?,?,'waiting_received','initial',JSON_OBJECT(),'2026-10-27 07:28:07.000')",[heldId,createHash('sha256').update('heldfixture').digest('hex'),heldWaiting.id]);await f.pool.execute("UPDATE ayambil_waiting SET payload=JSON_SET(payload,'$.whatsappConsent',false) WHERE id=?",[heldWaiting.id]);await assert.rejects(sender.enqueueHeldIntent(heldId),e=>e.code==='NOTIFICATION_INELIGIBLE'&&e.holdReason==='consent_missing');assertions++;ok((await sender.pending(cutoff))[0].id,heldId);ok((await sender.pending(cutoff,{excludeIntentIds:[heldId]})).length,0);ok(posts,2);
 const old=await f.pool.query('SELECT attempts,provider_id FROM ayambil_notification_outbox WHERE id IN (?,?)',[oldJob,equalJob]);ok(old[0].every(r=>r.attempts===0&&!r.provider_id),true);await sender.handover({owner:'paused',version:2},f.actor);ok((await sender.owner()).owner,'paused');ok(f.telemetry.providerCalls,0);
 console.log(JSON.stringify({passed:true,assertions,mockProviderPosts:posts,realNetworkCalls:0,strictCutoff:true,restartPreparedRecovery:true,sharedLeaseDedup:true,sharedDurablePacing:true}));
}finally{await f.close();}
