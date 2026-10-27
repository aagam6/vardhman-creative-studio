// Fresh disposable MySQL; provider calls are in-memory counters only.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {startBookingFixture,fixtureInput} from './booking-controls-fixture.mjs';
import {createProductionNotificationSender} from '../apps/api/notification-sender.mjs';
import {bilingualCatalog} from '../apps/api/bilingual-template-adapter.mjs';
const f=await startBookingFixture();let assertions=0,posts=0;const ok=(a,b)=>{assert.deepEqual(a,b);assertions++;};
try{
 const c=f.store.bookingControls;for(const s of (await readFile('apps/api/migrations/012_notification_sender.sql','utf8')).replace(/^--.*$/gm,'').split(';').map(s=>s.trim()).filter(Boolean))await f.pool.query(s);
 await c.update(f.actor,{eventDate:'2026-11-02',mode:'open',capacity:100,version:1});await c.update(f.actor,{eventDate:'2026-11-03',mode:'waiting',capacity:0,version:1});
 const w=async(phone,consent=true)=>{const r=await f.store.register(fixtureInput(['Synthetic waiting'],'2026-11-03',phone));const saved=(await c.waiting()).find(w=>w.number===r.number);if(!consent)await f.pool.execute("UPDATE ayambil_waiting SET payload=JSON_SET(payload,'$.whatsappConsent',CAST('false' AS JSON)) WHERE id=?",[saved.id]);return saved;};
 const noConsent=await w('+12025550131',false),normal=await w('+12025550132'),late=await w('+12025550133');
 const a=await f.store.register(fixtureInput(['Family A','Family B'],'2026-11-02','+12025550134')),b=await f.store.register(fixtureInput(['Family A','Family B','Family C'],'2026-11-02','+12025550134'));
 const all=(await c.duplicates()).bookings,ids=[a,b].map(r=>all.find(x=>x.number===r.number).id),review=await c.createReview(f.actor,{purpose:'duplicate',bookingIds:ids}),link=await c.link(f.actor,review.id),token=link.path.split('#')[1];
 const fingerprint=async()=>{const data={};for(const t of ['bookings','attendees','passes','capabilities','message_queue'])data[t]=(await f.pool.query('SELECT * FROM ayambil_'+t+' ORDER BY '+(t==='capabilities'?'key_hash':'id')))[0];return createHash('sha256').update(JSON.stringify(data)).digest('hex');};const before=await fingerprint();
 const config={...f.config,notificationService:true,notificationDispatch:false},catalog=structuredClone(bilingualCatalog).map(t=>({...t,approvalEvidence:{verified:true,templateId:t.templateId,status:'APPROVED',category:'UTILITY',observedAt:new Date().toISOString()}})),provider={validate:async()=>{},submit:async p=>{posts++;ok(p.name,'ayambil_waiting_received_bilingual');ok(p.components.length,1);ok(p.components[0].parameters.length,10);return {providerId:'mock-waiting',status:'accepted'};}};
 const sender=createProductionNotificationSender({pool:f.pool,config,key:f.fixtureQueueKey,provider,catalog});await sender.ready();await assert.rejects(sender.enqueue({purpose:'waiting_received',subject:noConsent.id}),/consent required/);assertions++;
 const nj=await sender.enqueue({purpose:'waiting_received',subject:normal.id}),lj=await sender.enqueue({purpose:'waiting_received',subject:late.id}),dj=await sender.enqueue({purpose:'booking_verify',subject:review.id,token});
 config.notificationDispatch=true;await sender.handover({owner:'bilingual',version:1},f.actor);
 const results=await Promise.allSettled(Array.from({length:8},()=>sender.runOne(nj,{ownershipVersion:2})));ok(results.filter(r=>r.status==='fulfilled'&&r.value.status==='accepted').length,1);ok(posts,1);await sender.runOne(nj,{ownershipVersion:2});ok(posts,1);
 await f.pool.query(`CREATE TRIGGER fixture_consent_change AFTER UPDATE ON ayambil_notification_outbox FOR EACH ROW BEGIN IF NEW.id='${lj}' AND NEW.state='processing' AND OLD.state='held' THEN UPDATE ayambil_waiting SET payload=JSON_SET(payload,'$.whatsappConsent',CAST('false' AS JSON)) WHERE id='${late.id}'; END IF; END`);
 ok((await sender.runOne(lj,{ownershipVersion:2})).status,'blocked');ok(posts,1);ok((await f.pool.query('SELECT error_code FROM ayambil_notification_outbox WHERE id=?',[lj]))[0][0].error_code,'eligibility_changed_before_submit');await f.pool.query('DROP TRIGGER fixture_consent_change');
 await f.pool.query(`CREATE TRIGGER fixture_family_response AFTER UPDATE ON ayambil_notification_outbox FOR EACH ROW BEGIN IF NEW.id='${dj}' AND NEW.state='processing' AND OLD.state='held' THEN UPDATE ayambil_family_reviews SET response=JSON_OBJECT('attending','no','names',JSON_ARRAY(),'count',0) WHERE id='${review.id}'; END IF; END`);
 ok((await sender.runOne(dj,{ownershipVersion:2})).status,'blocked');ok(posts,1);await f.pool.query('DROP TRIGGER fixture_family_response');ok((await c.family(token)).response.attending,'no');
 await sender.handover({owner:'paused',version:2},f.actor);config.notificationDispatch=false;ok(await fingerprint(),before);ok(f.telemetry.providerCalls,0);ok((await sender.owner()).owner,'paused');
 console.log(JSON.stringify({passed:true,assertions,mockProviderPosts:posts,realNetworkCalls:0,waitingConsentEnforced:true,waitingAndDuplicateFinalBoundaryBlocked:true,protectedFixtureRowsUnchanged:true}));
}finally{await f.close();}
