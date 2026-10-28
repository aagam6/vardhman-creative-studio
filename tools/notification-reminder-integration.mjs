import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash,randomUUID} from 'node:crypto';
import {startBookingFixture,fixtureInput} from './booking-controls-fixture.mjs';
import {queueCrypto} from '../apps/api/message-queue.mjs';
import {bilingualCatalog} from '../apps/api/bilingual-template-adapter.mjs';
import {createProductionNotificationSender} from '../apps/api/notification-sender.mjs';
const f=await startBookingFixture();let checks=0,posts=0,time=new Date('2026-11-01T12:29:59.000Z');const ok=(a,b)=>{assert.deepEqual(a,b);checks++;};
try{
 for(const s of (await readFile('apps/api/migrations/012_notification_sender.sql','utf8')).replace(/^--.*$/gm,'').split(';').map(s=>s.trim()).filter(Boolean))await f.pool.query(s);
 await f.store.bookingControls.update(f.actor,{eventDate:'2026-11-02',mode:'open',capacity:100,version:1});
 const r=await f.store.register(fixtureInput(['Synthetic One','Synthetic Two']));const b=(await f.pool.query('SELECT id FROM ayambil_bookings WHERE number=?',[r.number]))[0][0];
 const fingerprint=async()=>{const data=[];for(const table of ['ayambil_bookings','ayambil_attendees','ayambil_passes','ayambil_capabilities','ayambil_message_queue'])data.push((await f.pool.query('SELECT * FROM '+table))[0]);return createHash('sha256').update(JSON.stringify(data)).digest('hex');};const before=await fingerprint();
 const catalog=structuredClone(bilingualCatalog);for(const t of catalog)t.approvalEvidence.observedAt=new Date().toISOString();
 const sender=createProductionNotificationSender({catalog,pool:f.pool,config:{...f.config,notificationService:true,notificationDispatch:true},key:f.fixtureQueueKey,provider:{validate:async()=>{},submit:async p=>{posts++;ok(p.name,'ayambil_entry_timing_bilingual');ok(p.components[0].parameters.length,8);return {providerId:'synthetic-'+posts,status:'sent'};},status:async()=>({status:'delivered'})},now:()=>time});await sender.ready();await sender.handover({owner:'bilingual',version:1},f.actor);
 ok(await sender.nextReminder(),null);await assert.rejects(sender.enqueue({purpose:'reminder',subject:b.id}),/outside/);checks++;
 await assert.rejects(sender.enqueue({purpose:'entry_timing',subject:b.id,round:'gate-time-v1'}),/outside/);checks++;
 time=new Date('2026-11-01T12:30:00.000Z');ok((await sender.nextReminder()).id,b.id);
 const selected=await sender.reviewSelection({subjects:[b.id],purpose:'reminder'},f.actor);ok(selected.sent,false);ok(selected.items[0].eligible,true);ok(posts,0);
 const ids=await Promise.all(Array.from({length:6},()=>sender.enqueue({purpose:'reminder',subject:b.id})));ok(new Set(ids).size,1);
 const results=await Promise.allSettled(Array.from({length:5},()=>sender.runOne(ids[0],{ownershipVersion:2,automaticReminder:true})));ok(results.filter(r=>r.status==='fulfilled'&&r.value.status==='sent').length,1);ok(posts,1);ok(await sender.nextReminder(),null);
 await assert.rejects(sender.enqueue({purpose:'entry_timing',subject:b.id,round:'another-notice'}),/already attempted/);checks++;
 ok((await sender.reviewSelection({subjects:[b.id],purpose:'reminder'},f.actor)).items[0].eligible,false);ok(await fingerprint(),before);
 const register=async(names,mobile)=>{const r=await f.store.register(fixtureInput(names,'2026-11-02',mobile));return (await f.pool.query('SELECT id FROM ayambil_bookings WHERE number=?',[r.number]))[0][0].id;};
 const legacy=await register(['Legacy reminded'],'+12025550124');await f.pool.execute("UPDATE ayambil_message_queue SET notification_type='reminder',attempts=1,status='sent',provider_id=CONCAT('mock-',id) WHERE booking_id=? AND notification_type='confirmation'",[legacy]);await assert.rejects(sender.enqueue({purpose:'reminder',subject:legacy}),/Legacy reminder/);checks++;
 const late=await register(['Cancel before send'],'+12025550125');const lateId=await sender.enqueue({purpose:'reminder',subject:late});await f.pool.execute("UPDATE ayambil_bookings SET status='cancelled' WHERE id=?",[late]);await f.pool.query("UPDATE ayambil_notification_audit SET created_at=DATE_SUB(UTC_TIMESTAMP(3),INTERVAL 1 MINUTE) WHERE action='claim_committed'");ok((await sender.runOne(lateId,{ownershipVersion:2,automaticReminder:true})).status,'not_claimed');ok(posts,1);
 await assert.rejects(sender.enqueue({purpose:'reminder',subject:b.id,round:'again'}),/cannot be repeated/);checks++;
 const earlier=await register(['Already received entry'],'+12025550126');await f.pool.execute("INSERT INTO ayambil_notification_outbox(id,dedupe_hash,revision_hash,purpose,subject,round_name,envelope,state,attempts,provider_id,created_at,updated_at) VALUES(UUID(),?,?, 'entry_timing',?,'gate-time-v1','fixture','uncertain',1,NULL,UTC_TIMESTAMP(3),UTC_TIMESTAMP(3))",['d'.repeat(64),'e'.repeat(64),earlier]);await assert.rejects(sender.enqueue({purpose:'reminder',subject:earlier}),/already attempted/);checks++;
 time=new Date('2026-11-01T18:30:00.000Z');ok(await sender.nextReminder(),null);ok(f.telemetry.providerCalls,0);
 // Read-only pending audit covers all 17 records, not a single latest page.
 const confirmed=await sender.enqueue({purpose:'booking_confirmed',subject:b.id});
 for(let n=0;n<15;n++){const id=randomUUID(),state=n===14?'processing':n===13?'ready':'held';await f.pool.execute("INSERT INTO ayambil_notification_outbox(id,dedupe_hash,revision_hash,purpose,subject,round_name,envelope,state,attempts,created_at,updated_at) VALUES(?,?,?,'booking_confirmed',?,'initial',?,?,?,UTC_TIMESTAMP(3),UTC_TIMESTAMP(3))",[id,createHash('sha256').update(id).digest('hex'),'a'.repeat(64),randomUUID(),queueCrypto(f.fixtureQueueKey).seal({purpose:'booking_confirmed',subject:randomUUID(),token:'SYNTHETIC-PRIVATE-TOKEN'}),state,n===14?1:0]);}
 const savedOutbox=(await f.pool.query('SELECT * FROM ayambil_notification_outbox ORDER BY id'))[0];const audited=await sender.pendingAudit();ok(audited.total,17);ok(audited.byReason.acceptance_uncertain,1);ok(audited.byReason.in_flight,1);ok(audited.byReason.source_unavailable,14);ok(audited.items.find(i=>i.id===confirmed).reason,'source_eligible_requires_provider_preflight');ok(audited.providerCalls,0);ok(audited.noSend,true);ok(posts,1);ok((await f.pool.query('SELECT * FROM ayambil_notification_outbox ORDER BY id'))[0],savedOutbox);assert.doesNotMatch(JSON.stringify(audited),/SYNTHETIC-PRIVATE-TOKEN|envelope|revision_hash/);checks++;
 console.log(JSON.stringify({passed:true,checks,mockPosts:posts,realProviderCalls:0,readOnlyAuditRows:audited.total,protectedRowsUnchanged:true}));
}finally{await f.close();}
