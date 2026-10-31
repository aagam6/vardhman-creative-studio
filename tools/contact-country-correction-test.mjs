// Synthetic, disposable MySQL only. No .env, production data or provider transport.
import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {randomUUID} from 'node:crypto';
import {startBookingFixture,fixtureInput} from './booking-controls-fixture.mjs';import {createProductionNotificationSender} from '../apps/api/notification-sender.mjs';import {bilingualCatalog} from '../apps/api/bilingual-template-adapter.mjs';import {queueCrypto} from '../apps/api/message-queue.mjs';
const f=await startBookingFixture();let checks=0,calls=0,actualRecipient;const eq=(a,b)=>{assert.deepEqual(a,b);checks++;};
try{
 for(const s of (await readFile('apps/api/migrations/012_notification_sender.sql','utf8')).replace(/^--.*$/gm,'').split(';').map(s=>s.trim()).filter(Boolean))await f.pool.query(s);
 const setting=(await f.store.bookingControls.availability())[0];await f.store.bookingControls.update(f.actor,{eventDate:setting.event_date,mode:'open',capacity:100,version:setting.version});
 const oldMobile='+447001234567',newMobile='+917001234567';const result=await f.store.register(fixtureInput(['Synthetic correction guest'],'2026-11-02',oldMobile));const [[b]]=await f.pool.execute('SELECT * FROM ayambil_bookings WHERE number=?',[result.number]);await f.pool.query('UPDATE ayambil_bookings SET created_at=DATE_SUB(UTC_TIMESTAMP(3),INTERVAL 3 DAY)');
 const [jobs]=await f.pool.query('SELECT id FROM ayambil_message_queue');const providerIds=[];for(const j of jobs){const id=randomUUID();providerIds.push(id);await f.pool.execute("UPDATE ayambil_message_queue SET status='sent',attempts=1,provider_id=?,payload='' WHERE id=?",[id,j.id]);}
 const catalog=structuredClone(bilingualCatalog);for(const t of catalog)t.approvalEvidence={verified:true,templateId:t.templateId,status:'APPROVED',category:'UTILITY',observedAt:new Date().toISOString()};
 const sender=createProductionNotificationSender({pool:f.pool,config:{...f.config,notificationService:true,notificationDispatch:true},key:f.fixtureQueueKey,catalog,provider:{async validate(){},async recipientHistory(phone){return phone===oldMobile?{ids:providerIds,total:providerIds.length}:{ids:['synthetic-manual-reply'],total:1,nonTemplateOnly:true};},async submit(p){calls++;actualRecipient=p.to;return{status:'sent',providerId:randomUUID()};}}});
 await sender.handover({owner:'bilingual',version:1},f.actor);
 const attendance=await sender.prepareSubject({purpose:'attendance',subject:b.id},f.actor,f.store.bookingControls);const [[oldDraft]]=await f.pool.execute('SELECT * FROM ayambil_notification_outbox WHERE id=?',[attendance.id]);const token=queueCrypto(f.fixtureQueueKey).open(oldDraft.envelope).token;
 const passes=(await f.pool.query('SELECT * FROM ayambil_passes ORDER BY id'))[0],caps=(await f.pool.query('SELECT * FROM ayambil_capabilities ORDER BY pass_id'))[0],legacy=(await f.pool.query('SELECT * FROM ayambil_message_queue ORDER BY id'))[0];
 await assert.rejects(sender.prepareSubject({purpose:'booking_confirmed',subject:b.id},f.actor,f.store.bookingControls));checks++;
 const correction={id:b.id,expectedMobile:oldMobile,newMobile,version:2};await assert.rejects(sender.correctContactCountry({...correction,newMobile:'+917001234568'},f.actor));checks++;
 const r=await sender.correctContactCountry(correction,f.actor);eq(r.sent,false);eq(r.legacyHistoryPreserved,true);eq(calls,0);
 const [[after]]=await f.pool.execute('SELECT * FROM ayambil_bookings WHERE id=?',[b.id]);eq(after.mobile,newMobile);for(const k of ['id','number','status','contact_name','event_date','whatsapp_consent'])eq(after[k],b[k]);
 eq((await f.pool.query('SELECT * FROM ayambil_passes ORDER BY id'))[0],passes);eq((await f.pool.query('SELECT * FROM ayambil_capabilities ORDER BY pass_id'))[0],caps);eq((await f.pool.query('SELECT * FROM ayambil_message_queue ORDER BY id'))[0],legacy);
 await assert.rejects(f.store.bookingControls.family(token));checks++;await assert.rejects(sender.correctContactCountry(correction,f.actor));checks++;
 const confirmed=await sender.prepareSubject({purpose:'booking_confirmed',subject:b.id},f.actor,f.store.bookingControls);eq((await sender.runOne(confirmed.id,{ownershipVersion:2,actor:f.actor.admin_id})).status,'sent');eq(actualRecipient,newMobile);eq(calls,1);
 await sender.runOne(confirmed.id,{ownershipVersion:2,actor:f.actor.admin_id});eq(calls,1);await assert.rejects(sender.prepareSubject({purpose:'pass_link',subject:b.id},f.actor,f.store.bookingControls));checks++;
 eq((await f.pool.query('SELECT * FROM ayambil_message_queue ORDER BY id'))[0],legacy);eq((await f.pool.query('SELECT * FROM ayambil_passes ORDER BY id'))[0],passes);
 console.log(JSON.stringify({checks,mockSubmissions:calls,realProviderCalls:0,oldReceiptsPreserved:true,passesAndCapabilitiesUnchanged:true}));
}finally{await f.close();}
