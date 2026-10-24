import test from 'node:test';
import assert from 'node:assert/strict';
import mysql from 'mysql2/promise';
import {readFileSync} from 'node:fs';
import {randomUUID} from 'node:crypto';
import {configuration,programme} from '../config.mjs';
import {createStore} from '../store.mjs';
import {prepareCurrentSchema} from './trash-engine-check.mjs';
test('real local MySQL Empty Trash: atomic backup/delete, stale protection, active/queue preservation',{skip:process.env.AYAMBIL_DISPOSABLE_MYSQL_TEST!=='true'},async()=>{
 assert.equal(process.env.AYAMBIL_DISPOSABLE_MYSQL_TEST,'true');assert.equal(process.env.DB_HOST,'127.0.0.1');assert.match(process.env.DB_NAME,/^ayambil_test_/);
 const config={...configuration({...process.env,AYAMBIL_SITE_ORIGIN:'https://example.invalid',AYAMBIL_RATE_LIMIT_SECRET:'local-synthetic-secret-not-production-123',AYAMBIL_REGISTRATION_OPEN:'true',AYAMBIL_WHATSAPP_ENABLED:'false'}),localTrashPurge:true};
 const pool=mysql.createPool(config.database);try{
 const [tables]=await pool.query('SHOW TABLES');assert.equal(tables.length,0);
 const apply=async url=>{for(const sql of readFileSync(url,'utf8').replace(/^--.*$/gm,'').split(';').map(s=>s.trim()).filter(Boolean))await pool.query(sql);};
 await apply(new URL('../migrations/001_ayambil.sql',import.meta.url));
 for(const s of programme.sessions)await pool.execute('INSERT INTO ayambil_events VALUES(?,?)',[s.date,JSON.stringify(s)]);
 await prepareCurrentSchema(pool);await apply(new URL('../migrations/002_whatsapp_queue.sql',import.meta.url));await apply(new URL('./local-trash-backup.sql',import.meta.url));
 await apply(new URL('../migrations/008_trash_backup_maintenance.sql',import.meta.url));
 await pool.query('UPDATE ayambil_settings SET registration_open=TRUE WHERE id=1');
 const actor={admin_id:randomUUID()};await pool.execute('INSERT INTO ayambil_admins VALUES(?,?,?,TRUE)',[actor.admin_id,'local@example.invalid','not-a-login-hash']);
 const store=createStore(pool,config);const make=async date=>store.register({contactName:'Disposable Local Family',mobile:'+12025550123',eventDate:date,termsAccepted:true,whatsappConsent:true,requestKey:randomUUID().replaceAll('-','').repeat(2),attendees:['પ્રથમ સ્થાનિક નામ','બીજું સ્થાનિક નામ','Third Local Guest'].map(fullName=>({fullName,dates:[date]}))});
 const productionStore=createStore(pool,{...config,localTrashPurge:false,trashPurgeEnabled:true,maintenanceSchemaEnabled:true});
 await pool.query("UPDATE ayambil_settings SET maintenance_active=TRUE,maintenance_until=DATE_SUB(UTC_TIMESTAMP(3),INTERVAL 1 MINUTE) WHERE id=1");
 assert.equal((await productionStore.status()).open,false,'Expired countdown must never reopen bookings');assert.equal((await productionStore.status()).maintenance.active,true);
 await assert.rejects(productionStore.register({contactName:'Blocked Local Guest',mobile:'+12025550123',eventDate:'2026-11-02',termsAccepted:true,whatsappConsent:true,requestKey:randomUUID().replaceAll('-','').repeat(2),attendees:[{fullName:'Blocked Guest',dates:['2026-11-02']}]}),e=>e.status===403);
 assert.equal((await pool.query('SELECT COUNT(*) n FROM ayambil_bookings'))[0][0].n,0);
 await pool.query('UPDATE ayambil_settings SET maintenance_active=FALSE,maintenance_until=NULL WHERE id=1');assert.equal((await productionStore.status()).open,true);
 const active=await make('2026-11-02'),cancel=await make('2026-11-03');const b=(await store.list({search:cancel.number})).items[0];
 await store.change(actor,{action:'cancel',bookingId:b.id});
 await pool.execute("INSERT INTO ayambil_message_queue(id,dedupe_hash,booking_id,notification_type,payload,status,attempts,next_attempt_at,updated_at) VALUES(?,SHA2(?,256),?,'confirmation','synthetic-not-sendable','failed',1,UTC_TIMESTAMP(3),UTC_TIMESTAMP(3))",[randomUUID(),'local-test-confirmation',b.id]);
 for(const a of b.attendees.slice(0,2))await store.change(actor,{action:'trash-pass',bookingId:b.id,passNumber:a.passes[0].number});
 const snapshots=async()=>{const result={};for(const table of ['ayambil_bookings','ayambil_attendees','ayambil_registrations','ayambil_message_queue','ayambil_idempotency'])result[table]=(await pool.query('SELECT * FROM '+table+' ORDER BY 1'))[0];result.otherPasses=(await pool.query('SELECT * FROM ayambil_passes WHERE trashed_at IS NULL ORDER BY id'))[0];result.otherCaps=(await pool.query('SELECT c.* FROM ayambil_capabilities c JOIN ayambil_passes p ON p.id=c.pass_id WHERE p.trashed_at IS NULL ORDER BY c.key_hash'))[0];return result;};
 const before=await snapshots(),overview=await store.overview(),preview=await store.localTrashPurge.preview();assert.equal(preview.count,2);
 await assert.rejects(createStore(pool,{...config,localTrashPurge:false}).localTrashPurge.preview(),e=>e.status===403);
 await assert.rejects(createStore(pool,{...config,database:{...config.database,host:'production.invalid'}}).localTrashPurge.preview(),e=>e.status===403);
 await assert.rejects(store.localTrashPurge.empty(actor,{revision:preview.revision,confirmation:'bad'}),e=>e.status===400);
 await assert.rejects(store.localTrashPurge.empty(actor,{revision:'0'.repeat(64),confirmation:'EMPTY TRASH'}),e=>e.status===409);
 // A DB failure must roll back backups, capabilities and deletes together.
 await pool.query("CREATE TRIGGER local_fail_purge BEFORE DELETE ON ayambil_passes FOR EACH ROW SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='local rollback test'");
 await assert.rejects(store.localTrashPurge.empty(actor,{...preview,confirmation:'EMPTY TRASH'}));await pool.query('DROP TRIGGER local_fail_purge');
 assert.equal((await store.localTrashPurge.preview()).count,2);assert.equal((await pool.query('SELECT COUNT(*) n FROM ayambil_local_trash_backup'))[0][0].n,0);assert.deepEqual(await snapshots(),before);
 const results=await Promise.allSettled([1,2].map(()=>store.localTrashPurge.empty(actor,{...preview,confirmation:'EMPTY TRASH'})));assert.equal(results.filter(r=>r.status==='fulfilled').length,1);assert.equal(results.find(r=>r.status==='fulfilled').value.deleted,2);
 assert.deepEqual(await snapshots(),before);assert.equal((await store.trash({})).items.length,0);
 const preservedHistory=(await store.list({search:cancel.number})).items[0];assert.equal(preservedHistory.attendees.filter(a=>a.passHistoryPurged).length,2);assert.equal(preservedHistory.attendees.length,3);
 const after=await store.overview();assert.equal(after.totals.activePasses,overview.totals.activePasses);assert.equal(after.totals.cancelledPasses,overview.totals.cancelledPasses);assert.equal(after.totals.trashedPasses,overview.totals.trashedPasses-2);
 assert.equal((await pool.query('SELECT COUNT(*) n FROM ayambil_local_trash_backup'))[0][0].n,2);await store.download(active.downloadKeys[0]);await assert.rejects(store.download(cancel.downloadKeys[0]),e=>e.status===404);
 // Even an incorrectly trashed active pass must never be purged.
 await pool.query("UPDATE ayambil_passes SET trashed_at=UTC_TIMESTAMP(3) WHERE status='active' LIMIT 1");const bad=await store.localTrashPurge.preview();assert.equal(bad.eligible,false);await assert.rejects(store.localTrashPurge.empty(actor,{...bad,confirmation:'EMPTY TRASH'}),e=>e.status===409);
 await pool.query("UPDATE ayambil_passes SET trashed_at=NULL WHERE status='active'");
 // Exercise the production archive branch against this disposable schema only.
 const remaining=(await store.list({search:cancel.number})).items[0].attendees.find(a=>a.passes.length);await store.change(actor,{action:'trash-pass',bookingId:b.id,passNumber:remaining.passes[0].number});
 const prodPreview=await productionStore.localTrashPurge.preview();assert.equal(prodPreview.localOnly,false);const prodResult=await productionStore.localTrashPurge.empty(actor,{...prodPreview,confirmation:'EMPTY TRASH'});assert.equal(prodResult.deleted,1);assert.equal((await pool.query('SELECT COUNT(*) n FROM ayambil_trash_backup'))[0][0].n,1);
 assert.equal((await productionStore.list({search:cancel.number})).items[0].attendees.filter(a=>a.passHistoryPurged).length,1);
 console.log('Verified real MySQL: 2 Trash rows purged; active download valid; all booking/attendee/queue/other pass rows identical; backups 2; rollback and concurrent repeat safe.');
 }finally{await pool.end();}
});
