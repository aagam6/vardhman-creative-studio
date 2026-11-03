// Disposable loopback database, synthetic records, in-memory provider only.
import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {randomUUID} from 'node:crypto';
import {startBookingFixture,fixtureInput} from './booking-controls-fixture.mjs';
import {createProductionNotificationSender} from '../apps/api/notification-sender.mjs';
import {LIVE_UPDATE_PURPOSE} from '../apps/api/registered-live-update-payload.mjs';
let checks=0,calls=0,receipts=[],timeout=false,budget=false;const eq=(a,b)=>{assert.deepEqual(a,b);checks++;},reject=async p=>{await assert.rejects(p);checks++;};
const f=await startBookingFixture();try{
 for(const s of (await readFile('apps/api/migrations/012_notification_sender.sql','utf8')).replace(/^--.*$/gm,'').split(';').map(s=>s.trim()).filter(Boolean))await f.pool.query(s);
 const eventDate='2026-11-03',videoId='h0XA0A99zDE',setting=(await f.store.bookingControls.availability()).find(s=>s.event_date===eventDate);await f.store.bookingControls.update(f.actor,{eventDate,mode:'open',capacity:100,version:setting.version});
 const provider={async validate(p){eq(p,LIVE_UPDATE_PURPOSE);if(budget)throw Object.assign(Error('budget'),{code:'LOCAL_FLOW_BUDGET'});},async recipientReceipts(){return receipts;},async submit(p){calls++;eq(p.name,'ayambil_registered_event_live_update_bilingual');eq(p.components[0].parameters.length,6);eq(p.components[1].parameters[0].text,videoId);if(timeout)throw Error('mock timeout');return {providerId:randomUUID(),status:'sent'};}};
 const sender=createProductionNotificationSender({pool:f.pool,config:{...f.config,notificationService:true,notificationDispatch:true},key:f.fixtureQueueKey,provider,now:()=>new Date('2026-11-03T12:00:00Z')});
 async function book(name,mobile){const b=await f.store.register(fixtureInput([name],eventDate,mobile));return (await f.pool.execute('SELECT id FROM ayambil_bookings WHERE number=?',[b.number]))[0][0].id;}
 const first=await book('Synthetic live family one','+12025550124'),other=await book('Synthetic different family','+12025550124'),second=await book('Synthetic live family two','+12025550125');
 const passes=(await f.pool.query('SELECT * FROM ayambil_passes ORDER BY id'))[0],bookings=(await f.pool.query('SELECT * FROM ayambil_bookings ORDER BY id'))[0];
 const audience=await sender.liveUpdateAudience({eventDate,videoId},f.actor);eq(audience.items.length,2);eq(audience.sharedContacts,1);eq(audience.sent,false);eq(calls,0);
 await reject(sender.prepareLiveUpdate({subject:first,videoId},{}));await reject(sender.liveUpdateAudience({eventDate:'2026-11-02',videoId},f.actor));
 receipts=[{id:'prior',template:'ayambil_registered_event_live_update_bilingual',status:'sent'}];eq((await sender.prepareLiveUpdate({subject:first,videoId},f.actor)).reason,'prior_provider_live_update');eq(calls,0);
 receipts=[];budget=true;eq((await sender.prepareLiveUpdate({subject:first,videoId},f.actor)).status,'deferred');budget=false;
 const prepared=await sender.prepareLiveUpdate({subject:first,videoId},f.actor);eq(prepared.status,'prepared');eq(prepared.sent,false);eq((await sender.prepareLiveUpdate({subject:first,videoId},f.actor)).id,prepared.id);
 const again=await sender.prepareLiveUpdate({subject:other,videoId},f.actor);eq(again.status,'held');eq((await f.pool.query('SELECT COUNT(*) n FROM ayambil_notification_outbox'))[0][0].n,1);
 await sender.handover({owner:'bilingual',version:1},f.actor);
 receipts=[{id:'raced',template:'ayambil_registered_event_live_update_bilingual',status:'delivered'}];await reject(sender.runOne(prepared.id,{ownershipVersion:2}));eq((await f.pool.execute('SELECT attempts FROM ayambil_notification_outbox WHERE id=?',[prepared.id]))[0][0].attempts,0);eq(calls,0);
 receipts=[];const result=await Promise.allSettled([sender.runOne(prepared.id,{ownershipVersion:2}),sender.runOne(prepared.id,{ownershipVersion:2})]);eq(result.filter(r=>r.status==='fulfilled'&&r.value.status==='sent').length,1);eq(calls,1);await sender.runOne(prepared.id,{ownershipVersion:2});eq(calls,1);
 const next=await sender.prepareLiveUpdate({subject:second,videoId},f.actor);await f.pool.query("UPDATE ayambil_notification_audit SET created_at=DATE_SUB(UTC_TIMESTAMP(3),INTERVAL 1 MINUTE) WHERE action='claim_committed'");timeout=true;eq((await sender.runOne(next.id,{ownershipVersion:2})).status,'uncertain');eq(calls,2);await sender.runOne(next.id,{ownershipVersion:2});eq(calls,2);
 eq((await f.pool.query('SELECT * FROM ayambil_passes ORDER BY id'))[0],passes);eq((await f.pool.query('SELECT * FROM ayambil_bookings ORDER BY id'))[0],bookings);eq(f.telemetry.providerCalls,0);
 console.log(JSON.stringify({checks,mockSubmissions:calls,realProviderCalls:0,protectedBookingsAndPassesUnchanged:true}));
}finally{await f.close();}
