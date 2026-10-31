// Disposable loopback MySQL and in-memory provider only. No environment loaded.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {startBookingFixture,fixtureInput} from './booking-controls-fixture.mjs';
import {createProductionNotificationSender} from '../apps/api/notification-sender.mjs';
import {bilingualCatalog} from '../apps/api/bilingual-template-adapter.mjs';
const f=await startBookingFixture();let checks=0,calls=0;
const eq=(a,b)=>{assert.deepEqual(a,b);checks++;};
try{
 for(const s of (await readFile('apps/api/migrations/012_notification_sender.sql','utf8')).replace(/^--.*$/gm,'').split(';').map(s=>s.trim()).filter(Boolean))await f.pool.query(s);
 const setting=(await f.store.bookingControls.availability())[0];await f.store.bookingControls.update(f.actor,{eventDate:setting.event_date,mode:'open',capacity:100,version:setting.version});
 f.config.attendanceFinalCutoff='2026-10-30T14:52:00.000Z';
 const catalog=structuredClone(bilingualCatalog);for(const t of catalog)t.approvalEvidence={verified:true,templateId:t.templateId,status:'APPROVED',category:'UTILITY',observedAt:new Date().toISOString()};
 const sender=createProductionNotificationSender({pool:f.pool,config:{...f.config,notificationService:true,notificationDispatch:true},key:f.fixtureQueueKey,catalog,provider:{async validate(){},async submit(){calls++;return {status:'sent',providerId:randomUUID()};},async status(){throw Error('No polling');}}});
 const register=async(phone,name)=>{const s=await f.store.register(fixtureInput([name],'2026-11-02',phone));return (await f.pool.execute('SELECT id FROM ayambil_bookings WHERE number=?',[s.number]))[0][0].id;};
 const id=await register('+12025550123','Synthetic cutoff guest');await f.pool.execute('UPDATE ayambil_bookings SET created_at=? WHERE id=?',['2026-10-30 14:51:00',id]);
 const protectedBefore=(await f.pool.query('SELECT * FROM ayambil_passes ORDER BY id'))[0];
 const p=await sender.prepareSubject({purpose:'attendance',subject:id},f.actor,f.store.bookingControls);
 eq((await sender.prepareSubject({purpose:'attendance',subject:id},f.actor,f.store.bookingControls)).id,p.id);
 await sender.handover({owner:'bilingual',version:1},f.actor);
 eq((await sender.runOne(p.id,{ownershipVersion:2})).status,'sent');eq(calls,1);
 eq((await sender.runOne(p.id,{ownershipVersion:2})).status,'deferred');eq(calls,1);
 await assert.rejects(sender.prepareSubject({purpose:'attendance_followup',subject:p.id},f.actor),/Delivered initial/);checks++;
 await f.pool.execute("UPDATE ayambil_notification_outbox SET state='delivered' WHERE id=?",[p.id]);
 const follow=await sender.prepareSubject({purpose:'attendance_followup',subject:p.id},f.actor);
 eq((await sender.prepareSubject({purpose:'attendance_followup',subject:p.id},f.actor)).id,follow.id);
 const [[initialRow]]=await f.pool.execute('SELECT subject,envelope FROM ayambil_notification_outbox WHERE id=?',[p.id]);
 const [[followRow]]=await f.pool.execute('SELECT subject,round_name,envelope FROM ayambil_notification_outbox WHERE id=?',[follow.id]);eq(followRow.subject,initialRow.subject);eq(followRow.round_name,'response-followup-20261030');
 const [[reviewBefore]]=await f.pool.execute('SELECT * FROM ayambil_family_reviews WHERE id=?',[initialRow.subject]);
 eq((await f.pool.query('SELECT COUNT(*) n FROM ayambil_family_reviews'))[0][0].n,1);
 // A real reply arriving after preparation blocks the follow-up before claim.
 await f.pool.execute('UPDATE ayambil_family_reviews SET response=? WHERE id=?',[JSON.stringify({attending:'yes',count:1,names:['Synthetic cutoff guest']}),initialRow.subject]);
 await f.pool.query("UPDATE ayambil_notification_audit SET created_at=DATE_SUB(UTC_TIMESTAMP(3),INTERVAL 30 SECOND) WHERE action='claim_committed'");
 eq((await sender.runOne(follow.id,{ownershipVersion:2})).status,'not_claimed');eq(calls,1);
 const [[reviewAfter]]=await f.pool.execute('SELECT * FROM ayambil_family_reviews WHERE id=?',[initialRow.subject]);for(const k of ['id','token_hash','expires_at','snapshot','review_round'])eq(reviewAfter[k],reviewBefore[k]);
 eq((await f.pool.query('SELECT * FROM ayambil_passes ORDER BY id'))[0],protectedBefore);
 const later=await register('+12025550124','Synthetic later guest');await f.pool.execute('UPDATE ayambil_bookings SET created_at=? WHERE id=?',['2026-10-30 14:52:00.001',later]);
 await assert.rejects(sender.prepareSubject({purpose:'attendance',subject:later},f.actor,f.store.bookingControls),/outside_final_attendance_cutoff/);checks++;
 const stale=await register('+12025550125','Synthetic old guest');await f.pool.execute('UPDATE ayambil_bookings SET created_at=? WHERE id=?',['2026-10-30 14:50:00',stale]);
 const sp=await sender.prepareSubject({purpose:'attendance',subject:stale},f.actor,f.store.bookingControls);
 await register('+12025550125','Synthetic late family guest');
 await f.pool.query("UPDATE ayambil_notification_audit SET created_at=DATE_SUB(UTC_TIMESTAMP(3),INTERVAL 30 SECOND) WHERE action='claim_committed'");
 eq((await sender.runOne(sp.id,{ownershipVersion:2})).status,'not_claimed');eq(calls,1);
 const [[row]]=await f.pool.execute('SELECT attempts,state,provider_id FROM ayambil_notification_outbox WHERE id=?',[sp.id]);eq(row.attempts,0);eq(row.state,'blocked');eq(row.provider_id,null);
 // Successful follow-up is a separate explicit once-only submission, using the
 // same review/link; concurrent preparation and submission cannot duplicate it.
 const fid=await register('+12025550126','Synthetic unanswered guest');await f.pool.execute('UPDATE ayambil_bookings SET created_at=? WHERE id=?',['2026-10-30 14:00:00',fid]);
 const fp=await sender.prepareSubject({purpose:'attendance',subject:fid},f.actor,f.store.bookingControls);
 eq((await sender.runOne(fp.id,{ownershipVersion:2})).status,'sent');eq(calls,2);
 await f.pool.execute("UPDATE ayambil_notification_outbox SET state='read' WHERE id=?",[fp.id]);
 const concurrent=await Promise.all([sender.prepareSubject({purpose:'attendance_followup',subject:fp.id},f.actor),sender.prepareSubject({purpose:'attendance_followup',subject:fp.id},f.actor)]);eq(concurrent[0].id,concurrent[1].id);
 await f.pool.query("UPDATE ayambil_notification_audit SET created_at=DATE_SUB(UTC_TIMESTAMP(3),INTERVAL 30 SECOND) WHERE action='claim_committed'");
 const outcomes=await Promise.all([sender.runOne(concurrent[0].id,{ownershipVersion:2}),sender.runOne(concurrent[0].id,{ownershipVersion:2})]);eq(outcomes.filter(x=>x.status==='sent').length,1);eq(calls,3);
 const [[sentFollow]]=await f.pool.execute('SELECT attempts,state FROM ayambil_notification_outbox WHERE id=?',[concurrent[0].id]);eq(sentFollow.attempts,1);eq(sentFollow.state,'sent');
 eq((await sender.prepareSubject({purpose:'attendance_followup',subject:fp.id},f.actor)).id,concurrent[0].id);eq(calls,3);
 console.log(JSON.stringify({checks,mockSubmissions:calls,realProviderCalls:0,lateFamilyBlocked:true,passDataUnchanged:true}));
}finally{await f.close();}
