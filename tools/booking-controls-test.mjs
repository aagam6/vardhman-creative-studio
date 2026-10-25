import assert from 'node:assert/strict';
import {startBookingFixture,fixtureInput} from './booking-controls-fixture.mjs';
import {createApp} from '../apps/api/app.mjs';
import {hash} from '../apps/api/security.mjs';
import {bookingPassToken} from '../apps/api/booking-pass-link.mjs';
import {programme} from '../apps/api/config.mjs';
const f=await startBookingFixture();const {store,pool,actor}=f;const c=store.bookingControls;
let assertions=0;const ok=(a,b)=>{assert.deepEqual(a,b);assertions++;};
const metric=async table=>(await pool.query('SELECT COUNT(*) n FROM '+table))[0][0].n;
const update=async(date,mode,capacity)=>{const row=(await c.availability()).find(r=>r.event_date===date);return c.update(actor,{eventDate:date,mode,capacity,version:row.version});};
try{
 await update('2026-11-02','open',6);
 await assert.rejects(c.update(actor,{eventDate:'2026-11-02',mode:'open',capacity:999,version:1}),e=>e.status===409);
 const old=await store.register(fixtureInput(['Old active guest']));ok(old.status,'active');await store.download(old.downloadKeys[0]);
 const oldRecord=(await c.duplicates()).bookings.find(x=>x.number===old.number),oldCombined=bookingPassToken(f.fixtureQueueKey,oldRecord.id,programme.sessions[0]);ok((await store.downloadBooking(oldCombined)).passes.length,1);
 const exact=fixtureInput(['Guest A','Guest B','Guest C','Guest D','Guest E']);const exactResult=await store.register(exact);ok(exactResult.status,'active');ok(await metric('ayambil_passes'),6);
 const overflow=fixtureInput(['Waiting one','Waiting two']);const waiting=await store.register(overflow);ok(waiting.status,'waiting');ok(waiting.attendees.flatMap(a=>a.passes).length,0);ok(waiting.downloadKeys,undefined);
 const repeated=await Promise.all(Array.from({length:8},()=>store.register(overflow)));ok(new Set(repeated.map(r=>r.number)).size,1);ok(await metric('ayambil_waiting'),1);
 await assert.rejects(store.register({...overflow,contactName:'Conflicting contact'}),e=>e.status===409);
 const waitingRow=(await c.waiting())[0];const queueBefore=await metric('ayambil_message_queue');
 await assert.rejects(store.downloadBooking(bookingPassToken(f.fixtureQueueKey,waitingRow.id,programme.sessions[0])),e=>e.status===404);
 await assert.rejects(c.approve(actor,waitingRow.id),e=>e.status===409);ok(await metric('ayambil_passes'),6);
 await assert.rejects(store.enqueueReminder(f.queue,waitingRow.id),e=>e.status===409);
 await assert.rejects(store.downloadBooking('invalid'),e=>e.status===404);await assert.rejects(store.download(waiting.number),e=>e.status===404);
 await update('2026-11-02','waiting',8);
 const approved=await Promise.all(Array.from({length:8},()=>c.approve(actor,waitingRow.id)));ok(new Set(approved.map(x=>x.number)).size,1);ok(await metric('ayambil_passes'),8);ok(await metric('ayambil_message_queue'),queueBefore+2);
 await store.download(approved.find(x=>x.downloadKeys?.length).downloadKeys[0]);await store.download(old.downloadKeys[0]);
 const approvedRecord=(await c.duplicates()).bookings.find(x=>x.number===approved[0].number);ok((await store.downloadBooking(bookingPassToken(f.fixtureQueueKey,approvedRecord.id,programme.sessions[0]))).passes.length,2);ok((await store.downloadBooking(oldCombined)).passes.length,1);
 ok((await store.register(overflow)).status,'active');
 await update('2026-11-02','closed',1);await assert.rejects(store.register(fixtureInput()),e=>e.status===403);ok((await store.download(old.downloadKeys[0])).passes.length,1);
 // Separate event concurrency with more registrations than capacity and > pool size.
 await update('2026-11-03','open',6);
 const concurrent=await Promise.all(Array.from({length:12},(_,i)=>store.register(fixtureInput(['Concurrent '+i],'2026-11-03'))));ok(concurrent.filter(x=>x.status==='active').length,6);ok(concurrent.filter(x=>x.status==='waiting').length,6);
 await update('2026-11-03','waiting',100);ok((await store.register(fixtureInput(['Waiting despite spare capacity'],'2026-11-03'))).status,'waiting');
 // A failed approval rolls back the entire group and all message rows.
 const rollbackInput=fixtureInput(['Rollback guest one','Rollback guest two'],'2026-11-03');const rollbackWaiting=await store.register(rollbackInput),rollbackRow=(await c.waiting()).find(x=>x.number===rollbackWaiting.number);
 const passesBeforeFailure=await metric('ayambil_passes'),queueBeforeFailure=await metric('ayambil_message_queue');
 await pool.query("CREATE TRIGGER ayambil_fixture_fail BEFORE INSERT ON ayambil_passes FOR EACH ROW SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='synthetic failure'");
 await assert.rejects(c.approve(actor,rollbackRow.id));await pool.query('DROP TRIGGER ayambil_fixture_fail');ok(await metric('ayambil_passes'),passesBeforeFailure);ok(await metric('ayambil_message_queue'),queueBeforeFailure);ok((await c.waiting()).find(x=>x.id===rollbackRow.id).status,'waiting');
 // Contending approvals and registrations share a capacity lock; full groups only.
 await update('2026-11-03','open',8);const rows=(await c.waiting()).filter(x=>x.eventDate==='2026-11-03');
 const contention=await Promise.allSettled([...rows.slice(0,4).map(x=>c.approve(actor,x.id)),store.register(fixtureInput(['Overflow group one','Overflow group two'],'2026-11-03'))]);
 ok((await c.availability()).find(x=>x.event_date==='2026-11-03').activePersons,8);
 const names=['Family A','Family B','Family C','Family D','Family E'];await update('2026-11-02','open',50);
 const a=await store.register(fixtureInput(names)),b=await store.register(fixtureInput([...names,'Family F']));
 const list=await c.duplicates(),pairs=list.pairs;ok(pairs.length>0,true);const ids=[a.number,b.number].map(n=>list.bookings.find(b=>b.number===n).id);
 const review=await c.createReview(actor,{purpose:'duplicate',bookingIds:ids});const first=await c.link(actor,review.id),second=await c.link(actor,review.id);await assert.rejects(c.family(first.path.split('#')[1]),e=>e.status===404);
 const token=second.path.split('#')[1],response={attending:'yes',count:6,names:[...names,'Family F'],finalBookingId:ids[1]};
 const beforePasses=await metric('ayambil_passes'),beforeQueue=await metric('ayambil_message_queue');const responses=await Promise.all(Array.from({length:6},()=>c.respond(token,response)));ok(responses.every(x=>x.bookingChanges===0),true);
 await assert.rejects(c.respond(token,{...response,count:5}),e=>e.status===400);await assert.rejects(c.respond(token,{...response,names:['Different'],count:1}),e=>e.status===409);
 ok(await metric('ayambil_passes'),beforePasses);ok(await metric('ayambil_message_queue'),beforeQueue);await store.download(a.downloadKeys[0]);
 await c.review(actor,{id:review.id,action:'follow_up',note:'LOCAL proposal only, no booking changes'});await assert.rejects(c.respond(token,response),e=>e.status===404);
 const attendance=await c.createReview(actor,{purpose:'attendance',bookingIds:[ids[0]]});const link=await c.link(actor,attendance.id);await c.respond(link.path.split('#')[1],{attending:'no',count:0,names:[]});ok(await metric('ayambil_passes'),beforePasses);await store.download(a.downloadKeys[0]);
 await c.revoke(actor,attendance.id);await assert.rejects(c.family(link.path.split('#')[1]),e=>e.status===404);
 const exp=await c.createReview(actor,{purpose:'attendance',bookingIds:[ids[0]],round:'expiry-test'});const expLink=await c.link(actor,exp.id);await pool.execute('UPDATE ayambil_family_reviews SET expires_at=DATE_SUB(UTC_TIMESTAMP(3),INTERVAL 1 SECOND) WHERE id=?',[exp.id]);await assert.rejects(c.family(expLink.path.split('#')[1]),e=>e.status===404);
 const [[attempts]]=await pool.query('SELECT SUM(attempts) n FROM ayambil_message_queue');ok(Number(attempts.n),0);
 const [[dedup]]=await pool.query('SELECT COUNT(*) n FROM (SELECT dedupe_hash FROM ayambil_message_queue GROUP BY dedupe_hash HAVING COUNT(*)>1) d');ok(dedup.n,0);
 const app=createApp({store,config:f.config,staticDirectory:process.cwd()+'/dist/apps/web'});const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));const origin='http://127.0.0.1:'+server.address().port;
 try{ok((await fetch(origin+'/api/ayambil/admin/booking-controls')).status,401);ok((await fetch(origin+'/api/ayambil/admin/booking-controls/event',{method:'POST',headers:{Origin:f.config.origin,'Content-Type':'application/json',Cookie:'__Host-ayambil='+f.session.token},body:'{}'})).status,403);ok((await fetch(origin+'/api/ayambil/admin/booking-controls',{headers:{Cookie:'__Host-ayambil='+f.session.token}})).status,200);}finally{await new Promise(r=>server.close(r));}
 console.log(JSON.stringify({passed:true,assertions,realMysqlVersion:f.version,database:f.databaseName,providerCalls:0,queueAttempts:Number(attempts.n),tests:'exact capacity, groups, waiting mode, closed, 12-way registration, 8-way approval, replay, reviews, expiry/revocation, attendance no mutation, HTTP auth/CSRF, old pass preservation'}));
}finally{await f.close();}
