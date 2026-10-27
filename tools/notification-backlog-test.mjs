// Disposable loopback MySQL; no production env and no real provider transport.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash,randomUUID} from 'node:crypto';
import {startBookingFixture,fixtureInput} from './booking-controls-fixture.mjs';
import {createProductionNotificationSender} from '../apps/api/notification-sender.mjs';
import {bilingualCatalog} from '../apps/api/bilingual-template-adapter.mjs';
import {queueCrypto} from '../apps/api/message-queue.mjs';
const f=await startBookingFixture();let assertions=0;const payloads=[];
const ok=(a,b)=>{assert.deepEqual(a,b);assertions++;},reject=async(fn,re)=>{await assert.rejects(fn,re);assertions++;};
try{
 const c=f.store.bookingControls,sql=(await readFile('apps/api/migrations/012_notification_sender.sql','utf8')).replace(/^--.*$/gm,'');for(const s of sql.split(';').map(s=>s.trim()).filter(Boolean))await f.pool.query(s);
 await c.update(f.actor,{eventDate:'2026-11-02',mode:'open',capacity:200,version:1});
 const register=async(names,phone)=>{const receipt=await f.store.register(fixtureInput(names,'2026-11-02',phone));return {receipt,booking:(await c.duplicates()).bookings.find(b=>b.number===receipt.number)};};
 const pass=await register(['One','Two','Three','Four','Five','Six'],'+12025550121');
 const prior=await register(['Already received pass'],'+12025550122');
 const dupA=await register(['Family A','Family B','Family C','Family D'],'+12025550123'),dupB=await register(['Family A','Family B','Family C','Family D','Family E'],'+12025550123');
 const repeated=await register(['મીના શાહ','મીના  શાહ'],'+12025550124');
 const attend=await register(['Attend A'],'+12025550125'),attendMore=await register(['Attend B'],'+12025550125');
 const existing=await register(['Existing link'],'+12025550126'),rollback=await register(['Rollback link'],'+12025550127');
 const late=await register(['Late hold'],'+12025550128'),last=await register(['Final boundary hold'],'+12025550129');
 await f.pool.execute("UPDATE ayambil_message_queue SET attempts=1,status='sent',provider_id=CONCAT('fixture-',id) WHERE booking_id IN (?,?) AND notification_type='confirmation'",[pass.booking.id,last.booking.id]);
 await f.pool.execute("UPDATE ayambil_message_queue SET attempts=1,status='sent',provider_id=CONCAT('fixture-',id) WHERE booking_id=? AND notification_type='pass'",[prior.booking.id]);
 const er=await c.createReview(f.actor,{purpose:'attendance',bookingIds:[existing.booking.id]}),el=await c.link(f.actor,er.id),oldHash=(await f.pool.query('SELECT token_hash FROM ayambil_family_reviews WHERE id=?',[er.id]))[0][0].token_hash;
 const protectedHash=async()=>{const records={};for(const t of ['ayambil_bookings','ayambil_attendees','ayambil_passes','ayambil_capabilities','ayambil_message_queue'])records[t]=(await f.pool.query('SELECT * FROM '+t+' ORDER BY '+(t==='ayambil_capabilities'?'key_hash':'id')))[0];return createHash('sha256').update(JSON.stringify(records)).digest('hex');};const before=await protectedHash();
 const catalog=structuredClone(bilingualCatalog).map(t=>({...t,approvalEvidence:{verified:true,templateId:t.templateId,status:'APPROVED',category:'UTILITY',observedAt:new Date().toISOString()}}));
 const config={...f.config,notificationService:true,notificationDispatch:false},provider={validate:async()=>{},submit:async p=>{payloads.push(p);return {providerId:'mock-'+payloads.length,status:'accepted'};},status:async()=>({status:'delivered'})};
 const sender=createProductionNotificationSender({pool:f.pool,config,key:f.fixtureQueueKey,provider,catalog});await sender.ready();
 await reject(()=>sender.enqueue({purpose:'booking_confirmed',subject:pass.booking.id}),/Legacy confirmation/);
 await reject(()=>sender.enqueue({purpose:'pass_link',subject:prior.booking.id}),/Legacy pass/);
 for(const subject of [dupA.booking.id,repeated.booking.id])for(const purpose of ['booking_confirmed','pass_link'])await reject(()=>sender.enqueue({purpose,subject}),/duplicate\/name review/);
 await reject(()=>sender.enqueue({purpose:'pass_link',subject:pass.booking.id,round:'again'}),/cannot be repeated/);
 const ids=await Promise.all(Array.from({length:8},()=>sender.prepareSubject({purpose:'pass_link',subject:pass.booking.id},f.actor,c)));ok(new Set(ids.map(r=>r.id)).size,1);ok(ids.every(r=>r.sent===false),true);const job=ids[0].id;
 await reject(()=>sender.runOne(job),/dispatch disabled/);ok(payloads.length,0);
 config.notificationDispatch=true;await sender.handover({owner:'bilingual',version:1},f.actor);
 const results=await Promise.allSettled(Array.from({length:8},()=>sender.runOne(job,{ownershipVersion:2})));ok(results.filter(r=>r.status==='fulfilled'&&r.value.status==='accepted').length,1);ok(payloads.length,1);
 ok(payloads[0].name,'ayambil_pass_ready');ok(payloads[0].language.code,'en');ok(payloads[0].components[0].parameters.length,6);
 const url=new URL(payloads[0].components[0].parameters[5].text);ok(url.pathname,'/500-akhand-ayambil-vijayollas/passes');const downloaded=await f.store.downloadBooking(url.hash.slice(1));ok(downloaded.passes.length,6);ok(new Set(downloaded.passes.map(p=>p.number)).size,6);
 await sender.runOne(job,{ownershipVersion:2});ok(payloads.length,1);ok((await sender.prepareSubject({purpose:'pass_link',subject:pass.booking.id},f.actor,c)).id,job);
 await reject(()=>sender.prepareSubject({purpose:'attendance',subject:dupA.booking.id},f.actor,c),/unresolved_duplicate_review/);
 await reject(()=>sender.prepareSubject({purpose:'attendance',subject:repeated.booking.id},f.actor,c),/repeated_name_hold/);
 await reject(()=>sender.prepareSubject({purpose:'attendance',subject:existing.booking.id},f.actor,c),/original secure escrow/);ok((await f.pool.query('SELECT token_hash FROM ayambil_family_reviews WHERE id=?',[er.id]))[0][0].token_hash,oldHash);ok((await c.family(el.path.split('#')[1])).id,er.id);
 await c.revoke(f.actor,er.id);await reject(()=>sender.prepareSubject({purpose:'attendance',subject:existing.booking.id},f.actor,c),/original secure escrow/);ok((await f.pool.query('SELECT token_hash FROM ayambil_family_reviews WHERE id=?',[er.id]))[0][0].token_hash,null);
 const prepared=await Promise.all(Array.from({length:8},()=>sender.prepareSubject({purpose:'attendance',subject:attend.booking.id},f.actor,c)));ok(new Set(prepared.map(r=>r.id)).size,1);
 const saved=(await f.pool.query('SELECT * FROM ayambil_notification_outbox WHERE id=?',[prepared[0].id]))[0][0],secret=queueCrypto(f.fixtureQueueKey).open(saved.envelope);ok(saved.envelope.includes(secret.token),false);ok((await c.family(secret.token)).bookings.length,2);
 ok((await sender.runOne(saved.id,{ownershipVersion:2})).status,'accepted');ok(payloads.length,2);ok(payloads[1].components[0].parameters.length,10);
 await c.respond(secret.token,{attending:'no',names:[],count:0});await reject(()=>sender.prepareSubject({purpose:'attendance',subject:attend.booking.id},f.actor,c),/already_responded|already answered/);await sender.runOne(saved.id,{ownershipVersion:2});ok(payloads.length,2);
 // Link hash and encrypted outbox must commit atomically; failed insert cannot orphan a token.
 await f.pool.query("CREATE TRIGGER fixture_prepare_rollback BEFORE INSERT ON ayambil_notification_outbox FOR EACH ROW SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='synthetic rollback'");
 await reject(()=>sender.prepareSubject({purpose:'attendance',subject:rollback.booking.id},f.actor,c),/synthetic rollback/);await f.pool.query('DROP TRIGGER fixture_prepare_rollback');
 const rr=(await f.pool.query("SELECT token_hash FROM ayambil_family_reviews WHERE purpose='attendance' AND contact_key='12025550127'"))[0][0];ok(rr.token_hash,null);ok(!!(await sender.prepareSubject({purpose:'attendance',subject:rollback.booking.id},f.actor,c)).id,true);
 const lj=await sender.enqueue({purpose:'booking_confirmed',subject:late.booking.id});await f.pool.execute("INSERT INTO ayambil_family_reviews(id,purpose,event_date,snapshot,contact_key,review_round,created_at) VALUES(?,'duplicate','2026-11-02',JSON_ARRAY(),'12025550128','hold',UTC_TIMESTAMP(3))",[randomUUID()]);ok((await sender.runOne(lj,{ownershipVersion:2})).status,'not_claimed');ok(payloads.length,2);
 const finalJob=await sender.enqueue({purpose:'pass_link',subject:last.booking.id});await f.pool.query(`CREATE TRIGGER fixture_final_pass_hold AFTER UPDATE ON ayambil_notification_outbox FOR EACH ROW BEGIN IF NEW.id='${finalJob}' AND NEW.state='processing' AND OLD.state='held' THEN INSERT INTO ayambil_family_reviews(id,purpose,event_date,snapshot,contact_key,review_round,created_at) VALUES(UUID(),'duplicate','2026-11-02',JSON_ARRAY(),'12025550129','late-hold',UTC_TIMESTAMP(3)); END IF; END`);
 ok((await sender.runOne(finalJob,{ownershipVersion:2})).status,'blocked');ok(payloads.length,2);await f.pool.query('DROP TRIGGER fixture_final_pass_hold');
 await sender.handover({owner:'paused',version:2},f.actor);config.notificationDispatch=false;ok(await protectedHash(),before);ok(f.telemetry.providerCalls,0);ok((await sender.owner()).owner,'paused');
 for(const r of [pass,prior,dupA,dupB,repeated,attend,attendMore,existing,rollback,late,last]){await f.store.download(r.receipt.downloadKeys[0]);assertions++;}
 console.log(JSON.stringify({passed:true,assertions,mockProviderPosts:payloads.length,realNetworkCalls:0,protectedFixtureRowsUnchanged:true,oldLinksPreserved:true}));
}finally{await f.close();}
