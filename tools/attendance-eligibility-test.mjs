// Fresh loopback MySQL and injected in-memory provider only; no .env/provider network.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash,randomUUID} from 'node:crypto';
import {startBookingFixture,fixtureInput} from './booking-controls-fixture.mjs';
import {createProductionNotificationSender} from '../apps/api/notification-sender.mjs';
import {bilingualCatalog} from '../apps/api/bilingual-template-adapter.mjs';
const f=await startBookingFixture();let assertions=0,posts=0;
const ok=(a,b)=>{assert.deepEqual(a,b);assertions++;},reject=async(fn,re)=>{await assert.rejects(fn,re);assertions++;};
try{
 const c=f.store.bookingControls,sql=(await readFile('apps/api/migrations/012_notification_sender.sql','utf8')).replace(/^--.*$/gm,'');for(const s of sql.split(';').map(s=>s.trim()).filter(Boolean))await f.pool.query(s);
 for(const date of ['2026-11-02','2026-11-03'])await c.update(f.actor,{eventDate:date,mode:'open',capacity:200,version:1});
 const catalog=structuredClone(bilingualCatalog).map(t=>({...t,approvalEvidence:{verified:true,templateId:t.templateId,status:'APPROVED',category:'UTILITY',observedAt:new Date().toISOString(),source:'synthetic fixture only'}}));
 const config={...f.config,notificationService:true,notificationDispatch:false},provider={validate:async()=>{},submit:async()=>({providerId:'mock-'+ ++posts,status:'accepted'}),status:async()=>({status:'read'})};
 const sender=createProductionNotificationSender({pool:f.pool,config,key:f.fixtureQueueKey,provider,catalog});await sender.ready();
 const register=async(names,phone='+12025550123',event='2026-11-02')=>{const r=await f.store.register(fixtureInput(names,event,phone));return {receipt:r,booking:(await c.duplicates()).bookings.find(b=>b.number===r.number)};};
 const a=await register(['Guest A','Guest B','Guest C','Guest D','Guest E']),b=await register(['Guest A','Guest B','Guest C','Guest D']),six=await register(['Guest A','Guest B','Guest C','Guest D','Guest E','Guest F']);
 const repeated=await register([' મીના  શાહ ','મીના શાહ'],'+12025550124');
 await reject(()=>c.createReview(f.actor,{purpose:'attendance',bookingIds:[a.booking.id]}),/unresolved_duplicate_review/);await reject(()=>c.createReview(f.actor,{purpose:'attendance',bookingIds:[repeated.booking.id]}),/repeated_name_hold/);
 const dup=await Promise.all(Array.from({length:8},()=>c.createReview(f.actor,{purpose:'duplicate',bookingIds:[a.booking.id,b.booking.id,six.booking.id]})));ok(new Set(dup.map(r=>r.id)).size,1);const dupLink=await c.link(f.actor,dup[0].id);
 const savedReview=(await f.pool.query('SELECT * FROM ayambil_family_reviews WHERE id=?',[dup[0].id]))[0][0];
 ok((await c.createReview(f.actor,{purpose:'duplicate',bookingIds:[six.booking.id,a.booking.id,b.booking.id]})).reused,true);ok((await f.pool.query('SELECT * FROM ayambil_family_reviews WHERE id=?',[dup[0].id]))[0][0],savedReview);
 const other=await register(['Other event A'],'+12025550123','2026-11-03'),clean=await register(['Clean One'],'+12025550125'),cleanFamily=await register(['Distinct family'],'+12025550125');
 const snapshot=async()=>{const result={};for(const t of ['ayambil_bookings','ayambil_attendees','ayambil_passes','ayambil_capabilities','ayambil_message_queue'])result[t]=(await f.pool.query('SELECT * FROM '+t+' ORDER BY '+(t==='ayambil_capabilities'?'key_hash':'id')))[0];return createHash('sha256').update(JSON.stringify(result)).digest('hex');};
 const before=await snapshot();
 const rs=await Promise.all(Array.from({length:8},()=>c.createReview(f.actor,{purpose:'attendance',bookingIds:[clean.booking.id],unansweredOnly:true})));ok(new Set(rs.map(r=>r.id)).size,1);const link=await c.link(f.actor,rs[0].id),token=link.path.split('#')[1];ok((await c.family(token)).bookings.length,2);
 const jobs=await Promise.all(Array.from({length:8},()=>sender.enqueue({purpose:'attendance',subject:rs[0].id,token})));ok(new Set(jobs).size,1);await reject(()=>sender.runOne(jobs[0]),/dispatch disabled/);ok(posts,0);
 const otherReview=await c.createReview(f.actor,{purpose:'attendance',bookingIds:[other.booking.id]});ok(!!otherReview.id,true);
 const dashboard=await c.dashboard({view:'attendance'});ok(dashboard.items.find(r=>r.bookings.some(b=>b.id===a.booking.id)).eligibility.eligible,false);ok(dashboard.items.find(r=>r.bookings.some(b=>b.id===repeated.booking.id)).eligibility.reasons,['repeated_name_hold']);
 // An open review arriving after preparation blocks claim, without provider submission.
 const heldId=randomUUID();await f.pool.execute('INSERT INTO ayambil_family_reviews(id,purpose,event_date,snapshot,contact_key,review_round,created_at) VALUES(?,?,?,?,?,?,UTC_TIMESTAMP(3))',[heldId,'duplicate','2026-11-02',JSON.stringify([clean.booking,cleanFamily.booking]),'12025550125','synthetic-hold']);
 await reject(()=>sender.enqueue({purpose:'attendance',subject:rs[0].id,token}),/unresolved_duplicate_review/);await reject(()=>c.createReview(f.actor,{purpose:'attendance',bookingIds:[clean.booking.id]}),/unresolved_duplicate_review/);
 config.notificationDispatch=true;await sender.handover({owner:'bilingual',version:1},f.actor);ok((await sender.runOne(jobs[0],{ownershipVersion:2})).status,'not_claimed');ok(posts,0);ok(Number((await f.pool.query('SELECT attempts FROM ayambil_notification_outbox WHERE id=?',[jobs[0]]))[0][0].attempts),0);
 // Hold inserted by a disposable-only trigger after claiming must be seen by final pre-submit recheck.
 const late=await register(['Late scope'],'+12025550126'),lr=await c.createReview(f.actor,{purpose:'attendance',bookingIds:[late.booking.id]}),ll=await c.link(f.actor,lr.id),lj=await sender.enqueue({purpose:'attendance',subject:lr.id,token:ll.path.split('#')[1]});
 await f.pool.query(`CREATE TRIGGER fixture_late_hold AFTER UPDATE ON ayambil_notification_outbox FOR EACH ROW BEGIN IF NEW.id='${lj}' AND NEW.state='processing' AND OLD.state='held' THEN INSERT INTO ayambil_family_reviews(id,purpose,event_date,snapshot,contact_key,review_round,created_at) VALUES(UUID(),'duplicate','2026-11-02',JSON_ARRAY(),'12025550126','late-hold',UTC_TIMESTAMP(3)); END IF; END`);
 ok((await sender.runOne(lj,{ownershipVersion:2})).status,'blocked');ok(posts,0);await f.pool.query('DROP TRIGGER fixture_late_hold');ok((await f.pool.query('SELECT error_code FROM ayambil_notification_outbox WHERE id=?',[lj]))[0][0].error_code,'eligibility_changed_before_submit');
 // Distinct names on the same phone are legitimate, one invitation, even under parallel requests.
 const safe=await register(['Safe invitation'],'+12025550127'),sr=await c.createReview(f.actor,{purpose:'attendance',bookingIds:[safe.booking.id]}),sl=await c.link(f.actor,sr.id),sj=await sender.enqueue({purpose:'attendance',subject:sr.id,token:sl.path.split('#')[1]});
 const results=await Promise.allSettled(Array.from({length:8},()=>sender.runOne(sj,{ownershipVersion:2})));ok(results.filter(r=>r.status==='fulfilled'&&r.value.status==='accepted').length,1);ok(posts,1);await sender.runOne(sj,{ownershipVersion:2});ok(posts,1);ok(await sender.enqueue({purpose:'attendance',subject:sr.id,token:sl.path.split('#')[1]}),sj);
 await sender.handover({owner:'paused',version:2},f.actor);config.notificationDispatch=false;
 await c.respond(dupLink.path.split('#')[1],{attending:'yes',names:six.booking.names,count:6,finalBookingId:six.booking.id});await c.review(f.actor,{id:dup[0].id,action:'reviewed',note:'Synthetic reviewed proposal; no source mutation'});ok(!!(await c.createReview(f.actor,{purpose:'attendance',bookingIds:[a.booking.id]})).id,true);
 // Verify preserved rows from before late/safe fixture creation, including old pass downloads.
 for(const r of [a,b,six,repeated,clean,cleanFamily,other])await f.store.download(r.receipt.downloadKeys[0]);assertions+=7;
 const after=(await f.pool.query('SELECT * FROM ayambil_family_reviews WHERE id=?',[dup[0].id]))[0][0];ok(after.token_hash,savedReview.token_hash);
 const preserved=async()=>{const result={};for(const t of ['ayambil_bookings','ayambil_attendees','ayambil_passes','ayambil_capabilities','ayambil_message_queue']){const rows=(await f.pool.query('SELECT * FROM '+t+' ORDER BY '+(t==='ayambil_capabilities'?'key_hash':'id')))[0];const added=[late.booking.id,safe.booking.id];if(t==='ayambil_bookings')result[t]=rows.filter(r=>!added.includes(r.id));else if(t==='ayambil_attendees'||t==='ayambil_message_queue')result[t]=rows.filter(r=>!added.includes(r.booking_id));else if(t==='ayambil_passes'){const ids=(await f.pool.query('SELECT id FROM ayambil_attendees WHERE booking_id IN (?,?)',added))[0].map(r=>r.id);result[t]=rows.filter(r=>!ids.includes(r.attendee_id));}else{const ids=(await f.pool.query('SELECT p.id FROM ayambil_passes p JOIN ayambil_attendees a ON a.id=p.attendee_id WHERE a.booking_id IN (?,?)',added))[0].map(r=>r.id);result[t]=rows.filter(r=>!ids.includes(r.pass_id));}}return createHash('sha256').update(JSON.stringify(result)).digest('hex');};ok(await preserved(),before);ok(f.telemetry.providerCalls,0);ok((await sender.owner()).owner,'paused');
 console.log(JSON.stringify({passed:true,assertions,mockProviderPosts:posts,realNetworkCalls:0,protectedFixtureRowsUnchanged:true,existingReviewReused:true,lateHoldBlocked:true}));
}finally{await f.close();}
