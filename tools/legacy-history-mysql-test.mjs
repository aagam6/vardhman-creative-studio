// Fresh disposable loopback MySQL only; no production env/provider transport.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {randomUUID,createHash} from 'node:crypto';
import {startBookingFixture,fixtureInput} from './booking-controls-fixture.mjs';
import {createLegacyHistoryReconciliation,legacyResolutionAction} from '../apps/api/legacy-history-reconciliation.mjs';
import {queueCrypto} from '../apps/api/message-queue.mjs';
const f=await startBookingFixture();let assertions=0;const check=(a,b)=>{assert.deepEqual(a,b);assertions++;};
try{
 for(const s of (await readFile('apps/api/migrations/012_notification_sender.sql','utf8')).replace(/^--.*$/gm,'').split(';').map(x=>x.trim()).filter(Boolean))await f.pool.query(s);
 await f.store.bookingControls.update(f.actor,{eventDate:'2026-11-02',mode:'open',capacity:20,version:1});
 const r=await f.store.register(fixtureInput(['Synthetic history one'],'2026-11-02','+12025550188'));const [[b]]=await f.pool.execute('SELECT * FROM ayambil_bookings WHERE number=?',[r.number]);
 const crypto=queueCrypto(f.fixtureQueueKey),service=createLegacyHistoryReconciliation({pool:f.pool,crypto});
 const ids=[];for(const type of ['confirmation','pass']){let id=randomUUID();ids.push(id);await f.pool.execute("INSERT INTO ayambil_message_queue(id,dedupe_hash,booking_id,notification_type,payload,next_attempt_at,updated_at) VALUES(?,?,?,?,?,UTC_TIMESTAMP(3),UTC_TIMESTAMP(3))",[id,createHash('sha256').update(id).digest('hex'),b.id,type,crypto.seal({to:b.mobile,eventDate:b.event_date})]);}
 const modern=randomUUID();await f.pool.execute("INSERT INTO ayambil_notification_outbox(id,dedupe_hash,revision_hash,purpose,subject,round_name,envelope,state,attempts,provider_id,created_at,updated_at) VALUES(?,?,?,'booking_confirmed',?,'initial','encrypted-fixture','delivered',1,'mock-provider',UTC_TIMESTAMP(3),UTC_TIMESTAMP(3))",[modern,'a'.repeat(64),'b'.repeat(64),b.id]);
 const [before]=await f.pool.query('SELECT * FROM ayambil_message_queue ORDER BY id');const [passes]=await f.pool.query('SELECT * FROM ayambil_passes ORDER BY id');const [bookings]=await f.pool.query('SELECT * FROM ayambil_bookings ORDER BY id');
 let audit=await service.list();check(audit.items.filter(x=>ids.includes(x.legacyId)).map(x=>x.classification),['covered','covered']);
 await Promise.all([service.resolve(ids,f.actor),service.resolve(ids,f.actor)]);let [[count]]=await f.pool.execute('SELECT COUNT(*) n FROM ayambil_notification_audit WHERE action=?',[legacyResolutionAction]);check(count.n,2);
 check((await service.list()).items.filter(x=>ids.includes(x.legacyId)).every(x=>x.resolved),true);
 check((await f.pool.query('SELECT * FROM ayambil_message_queue ORDER BY id'))[0],before);check((await f.pool.query('SELECT * FROM ayambil_passes ORDER BY id'))[0],passes);check((await f.pool.query('SELECT * FROM ayambil_bookings ORDER BY id'))[0],bookings);
 await assert.rejects(service.resolve(ids,{}));assertions++;
 await f.pool.execute("UPDATE ayambil_notification_outbox SET state='uncertain',provider_id=NULL WHERE id=?",[modern]);
 await assert.rejects(service.resolve(ids,f.actor),/currently covered/);assertions++;
 check((await f.pool.query('SELECT * FROM ayambil_message_queue ORDER BY id'))[0],before);
 // Atomic rollback: a covered row followed by a non-covered exact ID records nothing.
 await f.pool.execute("UPDATE ayambil_notification_outbox SET state='delivered',provider_id='mock-provider' WHERE id=?",[modern]);
 const extra='ffffffff-ffff-4fff-8fff-ffffffffffff',covered='00000000-0000-4000-8000-000000000001';for(const [id,type] of [[extra,'reminder'],[covered,'pass']])await f.pool.execute("INSERT INTO ayambil_message_queue(id,dedupe_hash,booking_id,notification_type,payload,next_attempt_at,updated_at) VALUES(?,?,?,?,?,UTC_TIMESTAMP(3),UTC_TIMESTAMP(3))",[id,createHash('sha256').update(id).digest('hex'),b.id,type,crypto.seal({to:b.mobile,eventDate:b.event_date})]);
 await assert.rejects(service.resolve([covered,extra],f.actor));assertions++;
 [[count]]=await f.pool.execute('SELECT COUNT(*) n FROM ayambil_notification_audit WHERE action=?',[legacyResolutionAction]);check(count.n,2);check(f.telemetry.providerCalls,0);
 console.log(JSON.stringify({assertions,realProviderCalls:0,originalQueuePassesBookingsUnchanged:true,concurrentIdempotency:true}));
}finally{await f.close();}
