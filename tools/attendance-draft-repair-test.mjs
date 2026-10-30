// Disposable MySQL only; mock provider, no environment or external transport.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {startBookingFixture,fixtureInput} from './booking-controls-fixture.mjs';
import {createProductionNotificationSender} from '../apps/api/notification-sender.mjs';
import {bilingualCatalog} from '../apps/api/bilingual-template-adapter.mjs';
const f=await startBookingFixture();let checks=0,calls=0;const eq=(a,b)=>{assert.deepEqual(a,b);checks++;};
try{
 for(const s of (await readFile('apps/api/migrations/012_notification_sender.sql','utf8')).replace(/^--.*$/gm,'').split(';').map(s=>s.trim()).filter(Boolean))await f.pool.query(s);
 const setting=(await f.store.bookingControls.availability())[0];await f.store.bookingControls.update(f.actor,{eventDate:setting.event_date,mode:'open',capacity:100,version:setting.version});
 const saved=await f.store.register(fixtureInput(['Synthetic retained guest']));const [[b]]=await f.pool.execute('SELECT id FROM ayambil_bookings WHERE number=?',[saved.number]);
 await f.pool.query("UPDATE ayambil_bookings SET created_at=DATE_SUB(UTC_TIMESTAMP(3),INTERVAL 3 DAY)");
 const catalog=structuredClone(bilingualCatalog);for(const t of catalog)t.approvalEvidence={verified:true,templateId:t.templateId,status:'APPROVED',category:'UTILITY',observedAt:new Date().toISOString()};
 const sender=createProductionNotificationSender({pool:f.pool,config:{...f.config,notificationService:true,notificationDispatch:true},key:f.fixtureQueueKey,catalog,provider:{async validate(){},async submit(){calls++;return{status:'sent',providerId:randomUUID()};},async status(){throw Error('No polling');}}});
 const prepared=await sender.prepareSubject({purpose:'attendance',subject:b.id},f.actor,f.store.bookingControls);
 await sender.handover({owner:'bilingual',version:1},f.actor);
 const [[original]]=await f.pool.execute('SELECT * FROM ayambil_notification_outbox WHERE id=?',[prepared.id]);const [[reviewBefore]]=await f.pool.execute('SELECT * FROM ayambil_family_reviews WHERE id=?',[original.subject]);
 const extra=await f.store.register(fixtureInput(['Synthetic second guest']));await f.pool.query("UPDATE ayambil_bookings SET created_at=DATE_SUB(UTC_TIMESTAMP(3),INTERVAL 3 DAY)");
 const passes=(await f.pool.query('SELECT * FROM ayambil_passes ORDER BY id'))[0],legacy=(await f.pool.query('SELECT * FROM ayambil_message_queue ORDER BY id'))[0];
 eq((await sender.runOne(prepared.id,{ownershipVersion:2,actor:f.actor.admin_id})).status,'not_claimed');eq(calls,0);
 const plan=await sender.previewAttendanceRepair(prepared.id,f.actor);eq(plan.reason,'contact_scope_changed');eq(plan.bookingCount,2);eq(plan.persons,2);eq(plan.sent,false);
 const [[notMutated]]=await f.pool.execute('SELECT * FROM ayambil_family_reviews WHERE id=?',[original.subject]);eq(notMutated,reviewBefore);
 await assert.rejects(sender.repairAttendanceDraft({...plan,previousHash:'0'.repeat(64),version:2},f.actor));checks++;
 const repaired=await sender.repairAttendanceDraft({...plan,version:2},f.actor);eq(repaired.state,'held');eq(repaired.sent,false);eq(calls,0);
 const [[after]]=await f.pool.execute('SELECT * FROM ayambil_notification_outbox WHERE id=?',[prepared.id]);for(const k of ['id','subject','envelope','round_name','dedupe_hash','attempts','provider_id','claim_id'])eq(after[k],original[k]);
 const [[reviewAfter]]=await f.pool.execute('SELECT * FROM ayambil_family_reviews WHERE id=?',[original.subject]);for(const k of ['id','token_hash','expires_at','review_round','communication_key','response','decision'])eq(reviewAfter[k],reviewBefore[k]);
 await assert.rejects(sender.repairAttendanceDraft({...plan,version:2},f.actor));checks++;
 const sent=await sender.runOne(prepared.id,{ownershipVersion:2,actor:f.actor.admin_id});eq(sent.status,'sent');eq(calls,1);
 await assert.rejects(sender.previewAttendanceRepair(prepared.id,f.actor));checks++;eq(calls,1);
 eq((await f.pool.query('SELECT * FROM ayambil_passes ORDER BY id'))[0],passes);eq((await f.pool.query('SELECT * FROM ayambil_message_queue ORDER BY id'))[0],legacy);
 // A payload revision may be refreshed only while zero-attempt and unchanged.
 const other=await f.store.register(fixtureInput(['Synthetic distinct contact'],'2026-11-02','+12025550124'));await f.pool.query("UPDATE ayambil_bookings SET created_at=DATE_SUB(UTC_TIMESTAMP(3),INTERVAL 3 DAY)");const [[ob]]=await f.pool.execute('SELECT id FROM ayambil_bookings WHERE number=?',[other.number]);
 const op=await sender.prepareSubject({purpose:'attendance',subject:ob.id},f.actor,f.store.bookingControls);
 await f.pool.execute("UPDATE ayambil_notification_outbox SET state='blocked',revision_hash=? WHERE id=?",['f'.repeat(64),op.id]);
 const changed=await sender.previewAttendanceRepair(op.id,f.actor);eq(changed.reason,'payload_revision_changed');
 await f.pool.execute("UPDATE ayambil_bookings SET status='cancelled' WHERE id=?",[ob.id]);await assert.rejects(sender.repairAttendanceDraft({...changed,version:2},f.actor));checks++;eq(calls,1);
 console.log(JSON.stringify({checks,mockSubmissions:calls,realProviderCalls:0,protectedPassesUnchanged:true,legacyUnchanged:true,linksPreserved:true}));
}finally{await f.close();}
