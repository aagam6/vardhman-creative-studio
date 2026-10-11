import {checkQueue} from './queue-check.mjs';
import {checkBootstrap} from './bootstrap-check.mjs';
// Opt-in REAL MySQL integration, never production. Requires a newly created,
// EMPTY disposable local schema ayambil_test_* and an explicit approval flag.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import mysql from 'mysql2/promise';
import {randomUUID} from 'node:crypto';
import {configuration,programme} from '../config.mjs';
import {createStore} from '../store.mjs';
import {passwordHash} from '../security.mjs';
test('REAL MySQL: schema, concurrent idempotency, rollback, auth, filters and pass lifecycle', {skip:process.env.AYAMBIL_DISPOSABLE_MYSQL_TEST!=='true'},async()=>{
 if(!['127.0.0.1','localhost'].includes(process.env.DB_HOST)||!/^ayambil_test_[a-z0-9_]+$/.test(process.env.DB_NAME||''))throw Error('Only disposable local MySQL schemas are allowed');
 const config=configuration({...process.env,AYAMBIL_SITE_ORIGIN:'https://example.invalid',AYAMBIL_RATE_LIMIT_SECRET:'synthetic-local-only-secret-at-least-32',AYAMBIL_REGISTRATION_OPEN:'true'});
 const pool=mysql.createPool(config.database);
 try {
  const [tables]=await pool.query('SHOW TABLES');assert.equal(tables.length,0,'Disposable schema must be empty');
  const [version]=await pool.query('SELECT VERSION() AS version');assert.match(version[0].version,/^8\./,'Test requires MySQL 8');
  const migration=readFileSync(new URL('../migrations/001_ayambil.sql',import.meta.url),'utf8').replace(/^--.*$/gm,'');
  for(const statement of migration.split(';').map(s=>s.trim()).filter(Boolean))await pool.query(statement);
  await checkBootstrap(pool,config);
  for(const s of programme.sessions)await pool.execute('INSERT INTO ayambil_events VALUES(?,?)',[s.date,JSON.stringify(s)]);
  const store=createStore(pool,config);assert.equal(await store.ready(),true);
  const body=n=>({contactName:'Synthetic Contact',mobile:'+12025550123',eventDate:'2026-11-02',termsAccepted:true,whatsappConsent:true,requestKey:randomUUID().replaceAll('-','').repeat(2),attendees:Array.from({length:n},(_,i)=>({fullName:'Synthetic Attendee '+i,dates:['2026-11-02']}))});
  await assert.rejects(store.register(body(1)),e=>e.status===403);
  await pool.query('UPDATE ayambil_settings SET registration_open=TRUE WHERE id=1');
  await assert.rejects(store.register(body(3)),e=>e.status===400);
  const input=body(2);const results=await Promise.all(Array.from({length:4},()=>store.register(input)));assert.equal(new Set(results.map(r=>r.number)).size,1);
  const receipt=results.find(r=>r.downloadKeys);assert.equal(receipt.downloadKeys.length,2);
  const [count]=await pool.query('SELECT COUNT(*) AS n FROM ayambil_bookings');assert.equal(count[0].n,1);
  await assert.rejects(store.register({...input,contactName:'Changed Contact'}),e=>e.status===409);
  const download=await store.download(receipt.downloadKeys[0]);assert.equal(download.passes.length,1);assert.equal(download.passes[0].attendeeName,'Synthetic Attendee 0');
  await assert.rejects(store.download('missing'),e=>e.status===404);
  const admin=randomUUID();await pool.execute('INSERT INTO ayambil_admins VALUES(?,?,?,TRUE)',[admin,'synthetic@example.invalid',await passwordHash('Synthetic password long enough')]);
  await assert.rejects(store.login('synthetic@example.invalid','wrong'),e=>e.status===401);
  const session=await store.login('synthetic@example.invalid','Synthetic password long enough');const actor=await store.session(session.token);
  const list=await store.list({date:'2026-11-02',status:'active',search:'Synthetic',page:1});assert.equal(list.items.length,1);assert.equal(list.hasMore,false);
  assert.equal((await store.list({page:2})).items.length,0);await assert.rejects(store.list({date:'2026-11-04'}),e=>e.status===400);
  const booking=list.items[0];await store.change(actor,{action:'cancel',bookingId:booking.id});await assert.rejects(store.download(receipt.downloadKeys[0]),e=>e.status===404);
  await store.change(actor,{action:'restore',bookingId:booking.id});await store.download(receipt.downloadKeys[0]);
  const reissued=await store.change(actor,{action:'reissue',bookingId:booking.id,attendeeId:booking.attendees[0].id});await assert.rejects(store.download(receipt.downloadKeys[0]),e=>e.status===404);await store.download(reissued.downloadKey);
  await pool.query('UPDATE ayambil_capabilities SET expires_at=DATE_SUB(UTC_TIMESTAMP(3),INTERVAL 1 DAY)');await assert.rejects(store.download(reissued.downloadKey),e=>e.status===404);
  // Force a pass INSERT failure, exercising actual transaction rollback.
  await pool.query("CREATE TRIGGER ayambil_test_fail BEFORE INSERT ON ayambil_passes FOR EACH ROW SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='synthetic failure'");
  await assert.rejects(store.register(body(1)));const [after]=await pool.query('SELECT COUNT(*) AS n FROM ayambil_bookings');assert.equal(after[0].n,1);
  await pool.query('DROP TRIGGER ayambil_test_fail');
  await store.logout(session.token);await assert.rejects(store.session(session.token),e=>e.status===401);
  await checkQueue(pool);
 }finally{await pool.end();}
 // Preserve schema for inspection. Operator removes ONLY this disposable schema.
});
