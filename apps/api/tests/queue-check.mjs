import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createMessageQueue,queueCrypto} from '../message-queue.mjs';
import {transaction,createStore} from '../store.mjs';
import {configuration} from '../config.mjs';
import {randomUUID} from 'node:crypto';
import {provisionInitialAdmin} from '../bootstrap.mjs';
import {programme} from '../config.mjs';
import {checkBookingPassMessages} from './booking-pass-engine-check.mjs';
export async function checkQueue(pool){
 const migration=readFileSync(new URL('../migrations/002_whatsapp_queue.sql',import.meta.url),'utf8').replace(/^--.*$/gm,'');for(const statement of migration.split(';').map(s=>s.trim()).filter(Boolean))await pool.query(statement);
 // Existing lifecycle data deliberately refuses the environment bootstrap.
 const bootstrapDb=await pool.getConnection();
 try{await assert.rejects(provisionInitialAdmin(bootstrapDb,{approved:true,email:'synthetic@example.invalid',password:'Synthetic-local-password-123!',initialProgramme:programme,hostingerOneTime:true}));}finally{bootstrapDb.release();}
 let sends=0,fail=false,prepareFailure=false;const flow={prepare:async()=>{if(prepareFailure)throw Error('synthetic template missing');return {};},sendPrepared:async()=>{sends++;if(fail)throw Error('timeout');return {id:'synthetic-provider-'+sends,status:'sent'};},messageStatus:async()=>({status:'delivered'})};
 const env={AYAMBIL_WHATSAPP_ENABLED:'true',AYAMBIL_QUEUE_ENCRYPTION_KEY:'a'.repeat(64),AYAMBIL_WHATSAPP_TEST_RECIPIENT:'12025550123',AYAMBIL_STAGING_BUILD:'true',AYAMBIL_SITE_ORIGIN:'https://white-reindeer-590806.hostingersite.com',AYAMBIL_WHATSAPP_NORMAL_PROCESSING_APPROVED:'true',AYAMBIL_WHATSAPP_QUEUE_OWNER:'express-mysql',AYAMBIL_WHATSAPP_AUTOMATION_START_AT:'2000-01-01T00:00:00.000Z'};const queue=createMessageQueue(pool,flow,env);
 const item={type:'test',dedupe:'synthetic-only',context:{to:'12025550123',eventDate:'2026-11-02'}};
 await transaction(pool,db=>queue.enqueue(db,item));await transaction(pool,db=>queue.enqueue(db,item));assert.equal((await queue.list()).length,1);
 const restarted=createMessageQueue(pool,flow,env);const firstId=await transaction(pool,db=>queue.testId(db,item.dedupe));await Promise.all([restarted.runTest(firstId),queue.runTest(firstId)]);assert.equal(sends,1);
 const rows=await queue.list();assert.equal(rows[0].status,'sent');await queue.reconcile(rows[0].id);assert.equal((await queue.list())[0].status,'delivered');
 await assert.rejects(transaction(pool,async db=>{await queue.enqueue(db,{...item,dedupe:'rollback'});throw Error('synthetic failure');}));assert.equal((await queue.list()).length,1);
 fail=true;await transaction(pool,db=>queue.enqueue(db,{...item,dedupe:'uncertain'}));const uncertainFirstId=await transaction(pool,db=>queue.testId(db,'uncertain'));await queue.runTest(uncertainFirstId);await queue.runTest(uncertainFirstId);assert.equal(sends,2);assert.ok((await queue.list()).some(r=>r.status==='uncertain'));
 const [stored]=await pool.query('SELECT payload FROM ayambil_message_queue');assert.ok(stored.every(r=>!r.payload.includes('12025550123')));
 prepareFailure=true;await transaction(pool,db=>queue.enqueue(db,{...item,dedupe:'bad-template'}));
 const badId=await transaction(pool,db=>queue.testId(db,'bad-template'));await queue.runTest(badId);await queue.runTest(badId);assert.ok((await queue.list()).some(r=>r.status==='failed'&&r.attempts===1));prepareFailure=false;
 const config=configuration({...process.env,AYAMBIL_SITE_ORIGIN:'https://example.invalid',AYAMBIL_RATE_LIMIT_SECRET:'synthetic-local-only-secret-at-least-32',AYAMBIL_REGISTRATION_OPEN:'true',AYAMBIL_WHATSAPP_ENABLED:'false'});
 await pool.query('DELETE FROM ayambil_message_queue');
 fail=false;const normalIds=[];
 for(const type of ['confirmation','pass','reminder','admin']){await transaction(pool,db=>queue.enqueue(db,{type,dedupe:'isolation-'+type,context:{to:'12025550123'}}));}
 const beforeNormal=await queue.list();normalIds.push(...beforeNormal.map(r=>r.id));
 const testItem={type:'test',dedupe:'exact-authorized',context:{to:'12025550123'}};
 const testId=await transaction(pool,async db=>{await queue.enqueue(db,testItem);return queue.testId(db,testItem.dedupe);});
 const countBefore=sends;assert.equal((await queue.runTest(testId)).status,'sent');assert.equal(sends,countBefore+1);
 assert.equal((await queue.runTest(testId)).processed,false);
 fail=true;const uncertainItem={type:'test',dedupe:'exact-test-uncertain',context:{to:'12025550123',compatibilityTest:true}};
 const uncertainId=await transaction(pool,async db=>{await queue.enqueue(db,uncertainItem);return queue.testId(db,uncertainItem.dedupe);});
 const sendsBeforeTimeout=sends;assert.equal((await queue.runTest(uncertainId)).status,'uncertain');assert.equal(sends,sendsBeforeTimeout+1);assert.equal((await queue.runTest(uncertainId)).processed,false);assert.equal(sends,sendsBeforeTimeout+1);fail=false;
 for(const id of normalIds)assert.equal((await queue.runTest(id)).processed,false);
 const afterNormal=(await queue.list()).filter(r=>normalIds.includes(r.id));assert.deepEqual(afterNormal,beforeNormal);
 const [testStored]=await pool.execute('SELECT provider_id FROM ayambil_message_queue WHERE id=?',[testId]);assert.ok(testStored[0].provider_id);
 const queueMetadata=(await queue.list()).find(r=>r.id===testId);assert.equal(queueMetadata.canVerifyProviderStatus,true);assert.equal(queueMetadata.provider_id,undefined);
 await pool.query('DELETE FROM ayambil_message_queue');
 await pool.query('UPDATE ayambil_settings SET registration_open=TRUE WHERE id=1');
 const input={contactName:'Synthetic queue contact',mobile:'+12025550123',eventDate:'2026-11-02',termsAccepted:true,whatsappConsent:true,requestKey:randomUUID().replaceAll('-','').repeat(2),attendees:[{fullName:'Synthetic queued attendee',dates:['2026-11-02']},{fullName:'Synthetic second attendee',dates:['2026-11-02']}]};
 const store=createStore(pool,config,{queue,adminRecipients:['12025550124']});
 await store.register(input);await store.register(input);assert.equal((await queue.list()).length,3);
 const [contexts]=await pool.query("SELECT notification_type,payload FROM ayambil_message_queue WHERE notification_type IN ('confirmation','pass')");
 const decoded=contexts.map(row=>({type:row.notification_type,context:queueCrypto(env.AYAMBIL_QUEUE_ENCRYPTION_KEY).open(row.payload)}));
 assert.equal(decoded.filter(row=>row.type==='confirmation').length,1);
 assert.equal(decoded.filter(row=>row.type==='pass').length,1);assert.equal(decoded.find(row=>row.type==='pass').context.bookingPasses,true);
 for(const row of decoded){assert.equal(row.context.attendeeName,input.contactName);assert.ok(row.context.venueLocationUrl);assert.equal(row.context.attendeeNames,undefined);}
 const excluded=createMessageQueue(pool,flow,{...env,AYAMBIL_WHATSAPP_AUTOMATION_START_AT:'2100-01-01T00:00:00.000Z'});
 const beforeFresh=await queue.list(),beforeFreshSends=sends;
 assert.equal((await excluded.runOne()).processed,false);assert.deepEqual(await queue.list(),beforeFresh);assert.equal(sends,beforeFreshSends);
 const manual=createMessageQueue(pool,flow,{...env,AYAMBIL_STAGING_BUILD:'false',AYAMBIL_SITE_ORIGIN:'https://vardhmancreativestudio.com',AYAMBIL_PRODUCTION_TEMPLATE_POLICY:'ayambil-en-2026-10-13-v1',AYAMBIL_WHATSAPP_NORMAL_PROCESSING_APPROVED:'false',AYAMBIL_WHATSAPP_MANUAL_PROCESSING_APPROVED:'true',AYAMBIL_WHATSAPP_MANUAL_START_AT:'2000-01-01T00:00:00.000Z'});
 const selected=(await manual.list()).find(row=>row.notification_type==='confirmation');
 const exact={id:selected.id,bookingId:selected.booking_id,type:selected.notification_type};
 assert.equal((await manual.runSelected(exact)).status,'sent');
 await assert.rejects(manual.runSelected(exact),e=>e.status===409);
 for(let i=0;i<1;i++)assert.equal((await queue.runOne()).status,'sent');
 assert.equal((await queue.runOne()).processed,false);assert.equal(sends,beforeFreshSends+2);
 const submitted=await queue.list();assert.equal(submitted.filter(row=>row.notification_type==='admin'&&row.status==='queued'&&row.attempts===0).length,1);
 assert.equal((await queue.reconcileFresh()).blocked,false);assert.equal((await queue.list()).filter(row=>row.status==='delivered').length,2);
 await pool.query("UPDATE ayambil_bookings SET status='cancelled' WHERE contact_name='Synthetic queue contact'");
 const before=sends,unchanged=await queue.list();await queue.runOne();assert.equal(sends,before);assert.deepEqual(await queue.list(),unchanged);
 // Exercise concurrent enqueue calls with six different attendee keys against
 // the real engine. Neither legacy hashes nor delivery states may create a job.
 const sixInput={...input,requestKey:randomUUID().replaceAll('-','').repeat(2),contactName:'Synthetic single confirmation',attendees:Array.from({length:6},(_,i)=>({fullName:'Synthetic six '+i,dates:['2026-11-02']}))};
 const sixReceipt=await store.register(sixInput);
 const [[sixBooking]]=await pool.execute('SELECT id FROM ayambil_bookings WHERE number=?',[sixReceipt.number]);
 const enqueueSix=()=>Promise.all(Array.from({length:6},(_,i)=>transaction(pool,db=>queue.enqueue(db,{bookingId:sixBooking.id,type:'confirmation',dedupe:sixBooking.id+':attendee:'+i,context:{to:'12025550123'}}))));
 const snapshot=async()=>{
  const [bookings]=await pool.execute('SELECT * FROM ayambil_bookings WHERE id=?',[sixBooking.id]);
  const [passes]=await pool.execute('SELECT p.* FROM ayambil_passes p JOIN ayambil_attendees a ON a.id=p.attendee_id WHERE a.booking_id=? ORDER BY p.id',[sixBooking.id]);
  const [jobs]=await pool.execute('SELECT * FROM ayambil_message_queue WHERE booking_id=? ORDER BY id',[sixBooking.id]);
  return {bookings,passes,jobs};
 };
 const initial=await snapshot();assert.equal(initial.passes.length,6);assert.equal(initial.jobs.filter(j=>j.notification_type==='confirmation').length,1);assert.equal(initial.jobs.filter(j=>j.notification_type==='pass').length,1);
 await enqueueSix();assert.deepEqual(await snapshot(),initial);
 // Disposable fixture only: race the first enqueue with no confirmation row.
 await pool.execute("DELETE FROM ayambil_message_queue WHERE booking_id=? AND notification_type='confirmation'",[sixBooking.id]);
 await enqueueSix();const raced=await snapshot();
 assert.deepEqual(raced.bookings,initial.bookings);assert.deepEqual(raced.passes,initial.passes);
 assert.deepEqual(raced.jobs.filter(j=>j.notification_type==='pass'),initial.jobs.filter(j=>j.notification_type==='pass'));
 assert.equal(raced.jobs.filter(j=>j.notification_type==='confirmation').length,1);
 const [[canonical]]=await pool.execute("SELECT dedupe_hash=SHA2(CONCAT('confirmation:',booking_id),256) AS canonical FROM ayambil_message_queue WHERE booking_id=? AND notification_type='confirmation'",[sixBooking.id]);assert.equal(Number(canonical.canonical),1);
 for(const status of ['queued','sent','delivered','read','uncertain','cancelled']){
  await pool.execute("UPDATE ayambil_message_queue SET dedupe_hash=SHA2(?,256),status=?,attempts=?,provider_id=? WHERE booking_id=? AND notification_type='confirmation'",['legacy-confirmation-'+status,status,status==='queued'?0:1,status==='queued'||status==='cancelled'?null:'legacy-'+status,sixBooking.id]);
  const old=await snapshot();await enqueueSix();assert.deepEqual(await snapshot(),old);
 }
 assert.equal(sends,before,'enqueue and historical checks must never send');
 await checkBookingPassMessages(pool,config);
 await pool.query('UPDATE ayambil_settings SET registration_open=FALSE WHERE id=1');}
