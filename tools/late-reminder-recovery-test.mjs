// Disposable loopback MySQL and in-memory provider only. Never reads production env.
import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {randomUUID} from 'node:crypto';
import {startBookingFixture,fixtureInput} from './booking-controls-fixture.mjs';
import {createProductionNotificationSender} from '../apps/api/notification-sender.mjs';import {bilingualCatalog} from '../apps/api/bilingual-template-adapter.mjs';
import {lateReminderExpiry} from '../apps/api/late-reminder-policy.mjs';
let checks=0,calls=0,clock=new Date('2026-11-01T13:00:00.000Z');const eq=(a,b)=>{assert.deepEqual(a,b);checks++;};
for(const t of ['2026-11-01T18:29:59Z','2026-11-02T14:30:00Z','invalid']){assert.throws(()=>lateReminderExpiry('2026-11-02',t));checks++;}
eq(lateReminderExpiry('2026-11-02','2026-11-02T00:00:00Z'),'2026-11-02T14:30:00.000Z');
const f=await startBookingFixture();try{
 for(const s of (await readFile('apps/api/migrations/012_notification_sender.sql','utf8')).replace(/^--.*$/gm,'').split(';').map(s=>s.trim()).filter(Boolean))await f.pool.query(s);
 const setting=(await f.store.bookingControls.availability())[0];await f.store.bookingControls.update(f.actor,{eventDate:setting.event_date,mode:'open',capacity:100,version:setting.version});
 const catalog=structuredClone(bilingualCatalog);for(const t of catalog)t.approvalEvidence={verified:true,templateId:t.templateId,status:'APPROVED',category:'UTILITY',observedAt:new Date().toISOString()};
 const sender=createProductionNotificationSender({pool:f.pool,config:{...f.config,notificationService:true,notificationDispatch:true},key:f.fixtureQueueKey,catalog,now:()=>clock,provider:{async validate(){},async submit(){calls++;return {providerId:randomUUID(),status:'sent'};}}});
 async function draft(name,phone){clock=new Date('2026-11-01T13:00:00.000Z');const b=await f.store.register(fixtureInput([name],'2026-11-02',phone));const [[saved]]=await f.pool.execute('SELECT id FROM ayambil_bookings WHERE number=?',[b.number]);return {subject:saved.id,id:await sender.enqueue({purpose:'reminder',subject:saved.id,round:'initial'})};}
 const main=await draft('Synthetic late reminder one','+12025550124'),expired=await draft('Synthetic expired reminder two','+12025550125'),unapproved=await draft('Synthetic unapproved reminder three','+12025550126');
 const passes=(await f.pool.query('SELECT * FROM ayambil_passes ORDER BY id'))[0];
 await assert.rejects(sender.authorizeLateReminder(main.id,f.actor));checks++;
 clock=new Date('2026-11-02T00:00:00.000Z');await assert.rejects(sender.authorizeLateReminder(main.id,{}));checks++;
 const [[before]]=await f.pool.execute('SELECT * FROM ayambil_notification_outbox WHERE id=?',[main.id]);
 const a=await sender.authorizeLateReminder(main.id,f.actor);eq(a.sent,false);eq(a.providerSubmissions,0);await sender.authorizeLateReminder(main.id,f.actor);
 const [[after]]=await f.pool.execute('SELECT * FROM ayambil_notification_outbox WHERE id=?',[main.id]);eq(after,before);eq(calls,0);
 const [[n]]=await f.pool.query("SELECT COUNT(*) n FROM ayambil_notification_audit WHERE action='late_reminder_authorized'");eq(n.n,1);
 await sender.handover({owner:'bilingual',version:1},f.actor);eq((await sender.runOne(main.id,{ownershipVersion:2})).status,'sent');eq(calls,1);
 await sender.runOne(main.id,{ownershipVersion:2});eq(calls,1);await assert.rejects(sender.authorizeLateReminder(main.id,f.actor));checks++;
 await sender.authorizeLateReminder(expired.id,f.actor);clock=new Date('2026-11-02T14:30:00.000Z');
 await f.pool.query("UPDATE ayambil_notification_audit SET created_at=DATE_SUB(UTC_TIMESTAMP(3),INTERVAL 1 MINUTE) WHERE action='claim_committed'");
 eq((await sender.runOne(expired.id,{ownershipVersion:2})).status,'not_claimed');eq(calls,1);
 const [[x]]=await f.pool.execute('SELECT state,attempts,provider_id FROM ayambil_notification_outbox WHERE id=?',[expired.id]);eq(x,{state:'blocked',attempts:0,provider_id:null});
 clock=new Date('2026-11-02T00:00:00.000Z');eq((await sender.runOne(unapproved.id,{ownershipVersion:2})).status,'not_claimed');eq(calls,1);
 eq((await f.pool.query('SELECT * FROM ayambil_passes ORDER BY id'))[0],passes);
 console.log(JSON.stringify({checks,mockSubmissions:calls,realProviderCalls:0,originalDraftPreserved:true,passesUnchanged:true}));
}finally{await f.close();}
