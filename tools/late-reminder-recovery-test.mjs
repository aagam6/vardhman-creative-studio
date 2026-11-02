// Disposable loopback MySQL and in-memory provider only. Never reads production env.
import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {randomUUID} from 'node:crypto';
import {startBookingFixture,fixtureInput} from './booking-controls-fixture.mjs';
import {createProductionNotificationSender} from '../apps/api/notification-sender.mjs';import {bilingualCatalog} from '../apps/api/bilingual-template-adapter.mjs';
import {lateReminderExpiry} from '../apps/api/late-reminder-policy.mjs';
let checks=0,calls=0,reserveBlocked=false,rejectRateOnce=false,receipts=[],clock=new Date('2026-11-01T13:00:00.000Z');const eq=(a,b)=>{assert.deepEqual(a,b);checks++;};
for(const t of ['2026-11-01T18:29:59Z','2026-11-02T14:30:00Z','invalid']){assert.throws(()=>lateReminderExpiry('2026-11-02',t));checks++;}
eq(lateReminderExpiry('2026-11-02','2026-11-02T00:00:00Z'),'2026-11-02T14:30:00.000Z');
const f=await startBookingFixture();try{
 for(const s of (await readFile('apps/api/migrations/012_notification_sender.sql','utf8')).replace(/^--.*$/gm,'').split(';').map(s=>s.trim()).filter(Boolean))await f.pool.query(s);
 const setting=(await f.store.bookingControls.availability())[0];await f.store.bookingControls.update(f.actor,{eventDate:setting.event_date,mode:'open',capacity:100,version:setting.version});
 const catalog=structuredClone(bilingualCatalog);for(const t of catalog)t.approvalEvidence={verified:true,templateId:t.templateId,status:'APPROVED',category:'UTILITY',observedAt:new Date().toISOString()};
 const sender=createProductionNotificationSender({pool:f.pool,config:{...f.config,notificationService:true,notificationDispatch:true},key:f.fixtureQueueKey,catalog,now:()=>clock,provider:{async validate(){},async reserve(){if(reserveBlocked)throw Object.assign(Error('budget'),{code:'LOCAL_FLOW_BUDGET'});return 'fixture-reservation';},async recipientReceipts(){return receipts;},async submit(p,o){eq(o.reservation,'fixture-reservation');calls++;if(rejectRateOnce){rejectRateOnce=false;return {status:'rate_limited'};}return {providerId:randomUUID(),status:'sent'};}}});
 async function draft(name,phone){clock=new Date('2026-11-01T13:00:00.000Z');const b=await f.store.register(fixtureInput([name],'2026-11-02',phone));const [[saved]]=await f.pool.execute('SELECT id FROM ayambil_bookings WHERE number=?',[b.number]);return {subject:saved.id,id:await sender.enqueue({purpose:'reminder',subject:saved.id,round:'initial'})};}
 const main=await draft('Synthetic late reminder one','+12025550124'),expired=await draft('Synthetic expired reminder two','+12025550125'),unapproved=await draft('Synthetic unapproved reminder three','+12025550126');
 const passes=(await f.pool.query('SELECT * FROM ayambil_passes ORDER BY id'))[0];
 await assert.rejects(sender.authorizeLateReminder(main.id,f.actor));checks++;
 clock=new Date('2026-11-02T00:00:00.000Z');await assert.rejects(sender.authorizeLateReminder(main.id,{}));checks++;
 const [[before]]=await f.pool.execute('SELECT * FROM ayambil_notification_outbox WHERE id=?',[main.id]);
 const a=await sender.authorizeLateReminder(main.id,f.actor);eq(a.sent,false);eq(a.providerSubmissions,0);await sender.authorizeLateReminder(main.id,f.actor);
 const [[after]]=await f.pool.execute('SELECT * FROM ayambil_notification_outbox WHERE id=?',[main.id]);eq(after,before);eq(calls,0);
 const [[n]]=await f.pool.query("SELECT COUNT(*) n FROM ayambil_notification_audit WHERE action='late_reminder_authorized'");eq(n.n,1);
 await sender.handover({owner:'bilingual',version:1},f.actor);reserveBlocked=true;eq((await sender.runOne(main.id,{ownershipVersion:2})).status,'deferred');eq((await f.pool.execute('SELECT state,attempts,provider_id FROM ayambil_notification_outbox WHERE id=?',[main.id]))[0][0],{state:'held',attempts:0,provider_id:null});eq(calls,0);reserveBlocked=false;eq((await sender.runOne(main.id,{ownershipVersion:2})).status,'sent');eq(calls,1);
 await sender.runOne(main.id,{ownershipVersion:2});eq(calls,1);await assert.rejects(sender.authorizeLateReminder(main.id,f.actor));checks++;
 await sender.authorizeLateReminder(expired.id,f.actor);clock=new Date('2026-11-02T14:30:00.000Z');
 await f.pool.query("UPDATE ayambil_notification_audit SET created_at=DATE_SUB(UTC_TIMESTAMP(3),INTERVAL 1 MINUTE) WHERE action='claim_committed'");
 eq((await sender.runOne(expired.id,{ownershipVersion:2})).status,'not_claimed');eq(calls,1);
 const [[x]]=await f.pool.execute('SELECT state,attempts,provider_id FROM ayambil_notification_outbox WHERE id=?',[expired.id]);eq(x,{state:'blocked',attempts:0,provider_id:null});
 clock=new Date('2026-11-02T00:00:00.000Z');eq((await sender.runOne(unapproved.id,{ownershipVersion:2})).status,'not_claimed');eq(calls,1);
 eq((await f.pool.query('SELECT * FROM ayambil_passes ORDER BY id'))[0],passes);
 async function missing(name,phone){const b=await f.store.register(fixtureInput([name],'2026-11-02',phone));return (await f.pool.execute('SELECT id FROM ayambil_bookings WHERE number=?',[b.number]))[0][0].id;}
 const subject=await missing('Synthetic missing reminder','+12025550127');
 const protectedPasses=(await f.pool.query('SELECT * FROM ayambil_passes ORDER BY id'))[0];
 receipts=[{id:'prior',template:'ayambil_entry_timing_bilingual',status:'delivered'}];await assert.rejects(sender.prepareLateReminder(subject,f.actor));checks++;
 eq((await f.pool.execute('SELECT id FROM ayambil_notification_outbox WHERE subject=?',[subject]))[0].length,0);
 receipts=[];await assert.rejects(sender.prepareLateReminder(subject,{}));checks++;
 const prepared=await sender.prepareLateReminder(subject,f.actor);eq(prepared.sent,false);eq(prepared.providerSubmissions,0);eq(calls,1);
 eq((await sender.prepareLateReminder(subject,f.actor)).id,prepared.id);
 eq((await f.pool.execute('SELECT id FROM ayambil_notification_outbox WHERE subject=?',[subject]))[0].length,1);
 receipts=[{id:'raced',template:'ayambil_entry_timing_bilingual',status:'sent'}];await assert.rejects(sender.runOne(prepared.id,{ownershipVersion:2}));checks++;
 eq((await f.pool.execute('SELECT attempts FROM ayambil_notification_outbox WHERE id=?',[prepared.id]))[0][0].attempts,0);eq(calls,1);
 receipts=[];await f.pool.query("UPDATE ayambil_notification_audit SET created_at=DATE_SUB(UTC_TIMESTAMP(3),INTERVAL 1 MINUTE) WHERE action='claim_committed'");
 const outcomes=await Promise.allSettled([sender.runOne(prepared.id,{ownershipVersion:2}),sender.runOne(prepared.id,{ownershipVersion:2})]);
 eq(outcomes.filter(o=>o.status==='fulfilled'&&o.value.status==='sent').length,1);eq(calls,2);
 await sender.runOne(prepared.id,{ownershipVersion:2});eq(calls,2);
 eq((await f.pool.query('SELECT * FROM ayambil_passes ORDER BY id'))[0],protectedPasses);
 const c3=(await f.store.bookingControls.availability()).find(c=>c.event_date==='2026-11-03');await f.store.bookingControls.update(f.actor,{eventDate:'2026-11-03',mode:'waiting',capacity:30,version:c3.version});
 const waiting=await f.store.register(fixtureInput(['Synthetic reviewed approval'],'2026-11-03','+12025550128'));const [[w]]=await f.pool.execute('SELECT id FROM ayambil_waiting WHERE number=?',[waiting.number]);await f.store.bookingControls.approve(f.actor,w.id);const [[approved]]=await f.pool.execute('SELECT booking_id FROM ayambil_waiting WHERE id=?',[w.id]);
 const approvalId=await sender.enqueue({purpose:'waiting_approved',subject:approved.booking_id,round:'initial'});
 const approvalPasses=(await f.pool.query('SELECT * FROM ayambil_passes ORDER BY id'))[0];await f.pool.query("UPDATE ayambil_notification_audit SET created_at=DATE_SUB(UTC_TIMESTAMP(3),INTERVAL 1 MINUTE) WHERE action='claim_committed'");
 rejectRateOnce=true;eq((await sender.runOne(approvalId,{ownershipVersion:2})).status,'failed');eq(calls,3);const [[originalRejection]]=await f.pool.execute('SELECT * FROM ayambil_notification_outbox WHERE id=?',[approvalId]);eq(originalRejection.attempts,1);
 receipts=[{id:'already',template:'ayambil_waiting_approved_bilingual',status:'sent'}];await assert.rejects(sender.recoverRejectedApproval(approvalId,f.actor));checks++;eq(calls,3);
 receipts=[];await f.pool.query("UPDATE ayambil_notification_audit SET created_at=DATE_SUB(UTC_TIMESTAMP(3),INTERVAL 1 MINUTE) WHERE action='claim_committed'");
 eq((await sender.recoverRejectedApproval(approvalId,f.actor)).status,'sent');eq(calls,4);const [[recovered]]=await f.pool.execute('SELECT * FROM ayambil_notification_outbox WHERE id=?',[approvalId]);eq(recovered.attempts,2);eq(recovered.envelope,originalRejection.envelope);eq(recovered.round_name,'initial');
 const [[reviewAudit]]=await f.pool.execute("SELECT detail FROM ayambil_notification_audit WHERE action='rate_rejection_retry_reviewed' AND JSON_UNQUOTE(JSON_EXTRACT(detail,'$.id'))=?",[approvalId]);const proof=typeof reviewAudit.detail==='string'?JSON.parse(reviewAudit.detail):reviewAudit.detail;eq(proof.previousClaim,originalRejection.claim_id);eq(proof.previousAttempts,1);
 await assert.rejects(sender.recoverRejectedApproval(approvalId,f.actor));checks++;eq((await sender.runOne(approvalId,{ownershipVersion:2})).status,'not_claimed');eq(calls,4);eq((await f.pool.query('SELECT * FROM ayambil_passes ORDER BY id'))[0],approvalPasses);
 console.log(JSON.stringify({checks,mockSubmissions:calls,realProviderCalls:0,originalDraftPreserved:true,passesUnchanged:true}));
}finally{await f.close();}
