import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createMessageQueue,queueCrypto} from '../message-queue.mjs';
import {transaction,createStore} from '../store.mjs';
import {configuration} from '../config.mjs';
import {randomUUID} from 'node:crypto';
export async function checkQueue(pool){
 const migration=readFileSync(new URL('../migrations/002_whatsapp_queue.sql',import.meta.url),'utf8').replace(/^--.*$/gm,'');for(const statement of migration.split(';').map(s=>s.trim()).filter(Boolean))await pool.query(statement);
 let sends=0,fail=false,prepareFailure=false;const flow={prepare:async()=>{if(prepareFailure)throw Error('synthetic template missing');return {};},sendPrepared:async()=>{sends++;if(fail)throw Error('timeout');return {id:'synthetic-provider-'+sends,status:'sent'};},messageStatus:async()=>({status:'delivered'})};
 const env={AYAMBIL_WHATSAPP_ENABLED:'true',AYAMBIL_QUEUE_ENCRYPTION_KEY:'a'.repeat(64)};const queue=createMessageQueue(pool,flow,env);
 const item={type:'test',dedupe:'synthetic-only',context:{to:'12025550123',eventDate:'2026-11-02'}};
 await transaction(pool,db=>queue.enqueue(db,item));await transaction(pool,db=>queue.enqueue(db,item));assert.equal((await queue.list()).length,1);
 const restarted=createMessageQueue(pool,flow,env);await Promise.all([restarted.runOne(),queue.runOne()]);assert.equal(sends,1);
 const rows=await queue.list();assert.equal(rows[0].status,'sent');await queue.reconcile(rows[0].id);assert.equal((await queue.list())[0].status,'delivered');
 await assert.rejects(transaction(pool,async db=>{await queue.enqueue(db,{...item,dedupe:'rollback'});throw Error('synthetic failure');}));assert.equal((await queue.list()).length,1);
 fail=true;await transaction(pool,db=>queue.enqueue(db,{...item,dedupe:'uncertain'}));await queue.runOne();await queue.runOne();assert.equal(sends,2);assert.ok((await queue.list()).some(r=>r.status==='uncertain'));
 const [stored]=await pool.query('SELECT payload FROM ayambil_message_queue');assert.ok(stored.every(r=>!r.payload.includes('12025550123')));
 prepareFailure=true;await transaction(pool,db=>queue.enqueue(db,{...item,dedupe:'bad-template'}));
 for(let i=0;i<3;i++){await pool.query("UPDATE ayambil_message_queue SET next_attempt_at=UTC_TIMESTAMP(3) WHERE status='queued'");await queue.runOne();}
 assert.ok((await queue.list()).some(r=>r.status==='failed'&&r.attempts===3));prepareFailure=false;
 const config=configuration({...process.env,AYAMBIL_SITE_ORIGIN:'https://example.invalid',AYAMBIL_RATE_LIMIT_SECRET:'synthetic-local-only-secret-at-least-32',AYAMBIL_REGISTRATION_OPEN:'true',AYAMBIL_WHATSAPP_ENABLED:'false'});
 await pool.query('DELETE FROM ayambil_message_queue');
 await pool.query('UPDATE ayambil_settings SET registration_open=TRUE WHERE id=1');
 const input={contactName:'Synthetic queue contact',mobile:'+12025550123',eventDate:'2026-11-02',termsAccepted:true,whatsappConsent:true,requestKey:randomUUID().replaceAll('-','').repeat(2),attendees:[{fullName:'Synthetic queued attendee',dates:['2026-11-02']},{fullName:'Synthetic second attendee',dates:['2026-11-02']}]};
 const store=createStore(pool,config,{queue,adminRecipients:['12025550124']});
 await store.register(input);await store.register(input);assert.equal((await queue.list()).length,5);
 const [contexts]=await pool.query("SELECT notification_type,payload FROM ayambil_message_queue WHERE notification_type IN ('confirmation','pass')");
 const decoded=contexts.map(row=>({type:row.notification_type,context:queueCrypto(env.AYAMBIL_QUEUE_ENCRYPTION_KEY).open(row.payload)}));
 assert.equal(decoded.filter(row=>row.type==='confirmation').length,2);
 assert.equal(new Set(decoded.filter(row=>row.type==='pass').map(row=>row.context.passLink)).size,2);
 for(const row of decoded){assert.ok(input.attendees.some(a=>a.fullName===row.context.attendeeName));assert.ok(row.context.venueLocationUrl);assert.equal(row.context.attendeeNames,undefined);}
 await pool.query("UPDATE ayambil_bookings SET status='cancelled' WHERE contact_name='Synthetic queue contact'");
 const before=sends;await queue.runOne();assert.equal(sends,before);assert.ok((await queue.list()).some(r=>r.status==='cancelled'));
 await pool.query('UPDATE ayambil_settings SET registration_open=FALSE WHERE id=1');}
