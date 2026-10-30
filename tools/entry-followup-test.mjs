// Disposable loopback MySQL and in-memory provider only; no .env or production access.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {startBookingFixture,fixtureInput} from './booking-controls-fixture.mjs';
import {createProductionNotificationSender} from '../apps/api/notification-sender.mjs';
import {bilingualCatalog} from '../apps/api/bilingual-template-adapter.mjs';
import {entryRevision} from '../apps/api/entry-timing-revision-preview.mjs';
const f=await startBookingFixture();let assertions=0,calls=0;
const ok=(a,b)=>{assert.deepEqual(a,b);assertions++;};
try{
 for(const statement of (await readFile('apps/api/migrations/012_notification_sender.sql','utf8')).replace(/^--.*$/gm,'').split(';').map(s=>s.trim()).filter(Boolean))await f.pool.query(statement);
 const setting=(await f.store.bookingControls.availability())[0];await f.store.bookingControls.update(f.actor,{eventDate:setting.event_date,mode:'open',capacity:100,version:setting.version});
 const saved=await f.store.register(fixtureInput(['Synthetic follow-up guest']));const [[b]]=await f.pool.execute('SELECT id FROM ayambil_bookings WHERE number=?',[saved.number]);
 const oldId=randomUUID(),providerId=randomUUID();await f.pool.execute("INSERT INTO ayambil_notification_outbox(id,dedupe_hash,revision_hash,purpose,subject,round_name,envelope,state,attempts,provider_id,created_at,updated_at) VALUES(?,?,?,'entry_timing',?,'gate-time-v1','synthetic-preserved','delivered',1,?,UTC_TIMESTAMP(3),UTC_TIMESTAMP(3))",[oldId,'a'.repeat(64),'b'.repeat(64),b.id,providerId]);
 const [before]=await f.pool.query('SELECT * FROM ayambil_notification_outbox');const [passes]=await f.pool.query('SELECT * FROM ayambil_passes');const [legacy]=await f.pool.query('SELECT * FROM ayambil_message_queue');
 const catalog=structuredClone(bilingualCatalog).map(t=>t.purpose==='entry_timing'?{...t,...structuredClone(entryRevision)}:t);for(const t of catalog)t.approvalEvidence={verified:true,templateId:t.templateId,status:'APPROVED',category:'UTILITY',observedAt:new Date().toISOString()};
 let time='2026-10-30T00:00:00Z';const sender=createProductionNotificationSender({pool:f.pool,config:{...f.config,notificationService:true,notificationDispatch:true},key:f.fixtureQueueKey,catalog,now:()=>new Date(time),provider:{async validate(){},async submit(){calls++;return {providerId:randomUUID(),status:'sent'};},async status(){throw Error('No polling');}}});
 await assert.rejects(sender.authorizeEntryFollowup(oldId,{}));assertions++;
 const r=await sender.authorizeEntryFollowup(oldId,f.actor);ok(r.scheduledAt,'2026-11-01T12:30:00.000Z');ok(r.sent,false);
 const repeated=await Promise.allSettled([sender.authorizeEntryFollowup(oldId,f.actor),sender.authorizeEntryFollowup(oldId,f.actor)]);ok(repeated.filter(r=>r.status==='fulfilled').every(r=>r.value.unchanged),true);ok(repeated.filter(r=>r.status==='rejected').every(r=>r.reason.code==='DISPATCH_BUSY'),true);
 const [[n]]=await f.pool.query("SELECT COUNT(*) n FROM ayambil_notification_audit WHERE action='entry_followup_authorized'");ok(n.n,1);
 ok((await f.pool.query('SELECT * FROM ayambil_notification_outbox'))[0],before);ok(calls,0);
 ok(await sender.nextReminder(),null);await assert.rejects(sender.enqueue({purpose:'reminder',subject:b.id}));assertions++;
 time='2026-11-01T12:30:00Z';
 // Authorization is pinned to the exact provider receipt and definition; it
 // never exempts uncertainty or a changed prior submission.
 await f.pool.execute("UPDATE ayambil_notification_outbox SET state='uncertain' WHERE id=?",[oldId]);ok(await sender.nextReminder(),null);await assert.rejects(sender.authorizeEntryFollowup(oldId,f.actor));assertions++;
 await f.pool.execute("UPDATE ayambil_notification_outbox SET state='delivered',provider_id=? WHERE id=?",[randomUUID(),oldId]);ok(await sender.nextReminder(),null);
 await f.pool.execute('UPDATE ayambil_notification_outbox SET provider_id=? WHERE id=?',[providerId,oldId]);ok((await sender.nextReminder()).id,b.id);
 const reminder=await sender.enqueue({purpose:'reminder',subject:b.id});ok(await sender.enqueue({purpose:'reminder',subject:b.id}),reminder);
 await sender.handover({owner:'bilingual',version:1},f.actor);await sender.runOne(reminder,{ownershipVersion:2,actor:f.actor.admin_id});ok(calls,1);
 ok(await sender.nextReminder(),null);await sender.runOne(reminder,{ownershipVersion:2,actor:f.actor.admin_id});ok(calls,1);
 ok((await f.pool.query('SELECT * FROM ayambil_passes'))[0],passes);ok((await f.pool.query('SELECT * FROM ayambil_message_queue'))[0],legacy);
 ok((await f.pool.execute('SELECT * FROM ayambil_notification_outbox WHERE id=?',[oldId]))[0],before);
 console.log(JSON.stringify({assertions,mockSubmissions:calls,realProviderCalls:0,historyPreserved:true,passesUnchanged:true}));
}finally{await f.close();}
