import {prepareCurrentSchema,checkTrashLifecycle} from './trash-engine-check.mjs';
import {checkCompatibility,checkParallelLists} from './compatibility-check.mjs';
import {checkSearchCollations} from './collation-check.mjs';
import {checkEmptyAdmin,checkPopulatedExport} from './empty-admin-check.mjs';
import {checkQueue} from './queue-check.mjs';
import {checkBootstrap} from './bootstrap-check.mjs';
// Independently opted-in REAL MariaDB integration, never production.
// EMPTY disposable local schema ayambil_test_* and an explicit approval flag.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import mysql from 'mysql2/promise';
import {randomUUID} from 'node:crypto';
import {configuration,programme} from '../config.mjs';
import {createStore,transaction} from '../store.mjs';
import {passwordHash} from '../security.mjs';
test('REAL MariaDB: schema, concurrent idempotency, rollback, auth, filters and pass lifecycle', {skip:process.env.AYAMBIL_DISPOSABLE_MARIADB_TEST!=='true'},async()=>{
 if(!['127.0.0.1','localhost'].includes(process.env.DB_HOST)||!/^ayambil_test_mariadb_[a-z0-9_]+$/.test(process.env.DB_NAME||''))throw Error('Only disposable local MySQL schemas are allowed');
 assert.notEqual(process.env.AYAMBIL_DISPOSABLE_MYSQL_TEST,'true','Engine opt-ins must be separate');
 assert.equal(process.env.DB_PORT,process.env.AYAMBIL_MARIADB_VERIFIED_PORT,'Verified disposable port required before connection');
 const config=configuration({...process.env,AYAMBIL_SITE_ORIGIN:'https://example.invalid',AYAMBIL_RATE_LIMIT_SECRET:'synthetic-local-only-secret-at-least-32',AYAMBIL_REGISTRATION_OPEN:'true'});
 const pool=mysql.createPool(config.database);
 try {
  const [tables]=await pool.query('SHOW TABLES');assert.equal(tables.length,0,'Disposable schema must be empty');
  const [version]=await pool.query('SELECT VERSION() AS version');assert.match(version[0].version,/^11\.8\.\d+-MariaDB/,'Test requires MariaDB 11.8');
  const [mode]=await pool.query('SELECT @@sql_mode AS mode, @@check_constraint_checks AS checks, @@foreign_key_checks AS fks');
  assert.equal(Number(mode[0].checks),1);assert.equal(Number(mode[0].fks),1);
  console.log('MariaDB engine',version[0].version,'SQL mode',mode[0].mode,'schema',process.env.DB_NAME);
  const migration=readFileSync(new URL('../migrations/001_ayambil.sql',import.meta.url),'utf8').replace(/^--.*$/gm,'');
  for(const statement of migration.split(';').map(s=>s.trim()).filter(Boolean))await pool.query(statement);
  await checkBootstrap(pool,config);
  for(const s of programme.sessions)await pool.execute('INSERT INTO ayambil_events VALUES(?,?)',[s.date,JSON.stringify(s)]);
  await prepareCurrentSchema(pool);
  const store=createStore(pool,config);assert.equal(await store.ready(),false);
  assert.deepEqual(await store.list({}),{items:[],page:1,hasMore:false,integration:{ready:false,missing:['WhatsApp sending disabled']}});
  await checkEmptyAdmin(pool,store,config);
  const body=n=>({contactName:'Synthetic Contact',mobile:'+12025550123',eventDate:'2026-11-02',termsAccepted:true,whatsappConsent:true,requestKey:randomUUID().replaceAll('-','').repeat(2),attendees:Array.from({length:n},(_,i)=>({fullName:'Synthetic Attendee '+i,dates:['2026-11-02']}))});
  await assert.rejects(store.register(body(1)),e=>e.status===403);
  await pool.query('UPDATE ayambil_settings SET registration_open=TRUE WHERE id=1');
  await assert.rejects(store.register(body(7)),e=>e.status===400);
  const input=body(2);const results=await Promise.all(Array.from({length:4},()=>store.register(input)));assert.equal(new Set(results.map(r=>r.number)).size,1);
  const receipt=results.find(r=>r.downloadKeys);assert.equal(receipt.downloadKeys.length,2);await checkCompatibility(pool,store,input,receipt);
  const [count]=await pool.query('SELECT COUNT(*) AS n FROM ayambil_bookings');assert.equal(count[0].n,1);
  await assert.rejects(store.register({...input,contactName:'Changed Contact'}),e=>e.status===409);
  const download=await store.download(receipt.downloadKeys[0]);assert.equal(download.passes.length,1);assert.equal(download.passes[0].attendeeName,'Synthetic Attendee 0');
  await assert.rejects(store.download('missing'),e=>e.status===404);
  const admin=randomUUID();await pool.execute('INSERT INTO ayambil_admins VALUES(?,?,?,TRUE)',[admin,'synthetic@example.invalid',await passwordHash('Synthetic password long enough')]);
  await assert.rejects(store.login('synthetic@example.invalid','wrong'),e=>e.status===401);
  const session=await store.login('synthetic@example.invalid','Synthetic password long enough');const actor=await store.session(session.token);
  const list=await store.list({date:'2026-11-02',status:'active',search:'Synthetic',page:1});assert.equal(list.items.length,1);assert.equal(list.hasMore,false);await checkSearchCollations(pool,config,list.items[0]);
  assert.equal((await store.list({page:2})).items.length,0);await assert.rejects(store.list({date:'2026-11-04'}),e=>e.status===400);
  await checkPopulatedExport(store,config,session.token);
  const booking=list.items[0];
  const [engines]=await pool.query('SELECT ENGINE FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE()');assert.ok(engines.every(t=>t.ENGINE==='InnoDB'));
  await assert.rejects(pool.execute('INSERT INTO ayambil_attendees(id,booking_id,full_name,ordinal) VALUES(?,?,?,7)',[randomUUID(),booking.id,'Synthetic invalid']));
  await assert.rejects(pool.execute('INSERT INTO ayambil_attendees(id,booking_id,full_name,ordinal) VALUES(?,?,?,1)',[randomUUID(),randomUUID(),'Synthetic invalid']));
  await assert.rejects(pool.execute('INSERT INTO ayambil_attendees(id,booking_id,full_name,ordinal) VALUES(?,?,?,1)',[randomUUID(),booking.id,'Synthetic duplicate']));
  await assert.rejects(pool.execute('INSERT INTO ayambil_passes(id,attendee_id,number,snapshot,revision) VALUES(?,?,?,?,99)',[randomUUID(),booking.attendees[0].id,randomUUID(),'{}']));
  await assert.rejects(pool.execute('UPDATE ayambil_events SET snapshot=? WHERE event_date=?',['invalid json','2026-11-02']));
  await transaction(pool,async db=>{await db.execute('UPDATE ayambil_events SET snapshot=? WHERE event_date=?',[JSON.stringify({text:'વિજયોત્સવ'}),'2026-11-02']);const [r]=await db.execute('SELECT snapshot FROM ayambil_events WHERE event_date=?',['2026-11-02']);assert.equal((typeof r[0].snapshot==='string'?JSON.parse(r[0].snapshot):r[0].snapshot).text,'વિજયોત્સવ');await db.execute('UPDATE ayambil_events SET snapshot=? WHERE event_date=?',[JSON.stringify(programme.sessions[0]),'2026-11-02']);});
  const [indexes]=await pool.query('SHOW INDEX FROM ayambil_passes');
  assert.ok(indexes.some(i=>i.Column_name==='current_attendee'&&Number(i.Non_unique)===0));
  const [columns]=await pool.query('SHOW FULL COLUMNS FROM ayambil_passes');
  assert.match(columns.find(c=>c.Field==='current_attendee').Extra,/STORED GENERATED/);
  const modeConnection=await pool.getConnection();try{
    await modeConnection.query("SET SESSION sql_mode='ANSI_QUOTES'");
    assert.equal((await createStore(modeConnection,config).list({page:1})).items.length,1);
    await modeConnection.query('SET SESSION sql_mode=?',[mode[0].mode]);
  }finally{modeConnection.release();}
  // The list query uses standard single-quoted literals in both modes.
  
  await pool.execute('UPDATE ayambil_admins SET enabled=FALSE WHERE id=?',[admin]);
  await assert.rejects(store.session(session.token),e=>e.status===401);
  await pool.execute('UPDATE ayambil_admins SET enabled=TRUE WHERE id=?',[admin]);
  const expiring=await store.login('synthetic@example.invalid','Synthetic password long enough');
  await pool.query('UPDATE ayambil_admin_sessions SET expires_at=DATE_SUB(UTC_TIMESTAMP(3),INTERVAL 1 DAY)');
  await assert.rejects(store.session(expiring.token),e=>e.status===401);
  // Restore only the synthetic actor session for the remaining lifecycle tests.
  const replacement=await store.login('synthetic@example.invalid','Synthetic password long enough');
  await store.session(replacement.token);
  await store.change(actor,{action:'cancel',bookingId:booking.id});await assert.rejects(store.download(receipt.downloadKeys[0]),e=>e.status===404);
  await store.change(actor,{action:'restore',bookingId:booking.id});await store.download(receipt.downloadKeys[0]);
  const reissued=await store.change(actor,{action:'reissue',bookingId:booking.id,attendeeId:booking.attendees[0].id});await assert.rejects(store.download(receipt.downloadKeys[0]),e=>e.status===404);await store.download(reissued.downloadKey);
  await pool.query('UPDATE ayambil_capabilities SET expires_at=DATE_SUB(UTC_TIMESTAMP(3),INTERVAL 1 DAY)');await assert.rejects(store.download(reissued.downloadKey),e=>e.status===404);
  // Force a pass INSERT failure, exercising actual transaction rollback.
  await pool.query("CREATE TRIGGER ayambil_test_fail BEFORE INSERT ON ayambil_passes FOR EACH ROW SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='synthetic failure'");
  await assert.rejects(store.register(body(1)));const [after]=await pool.query('SELECT COUNT(*) AS n FROM ayambil_bookings');assert.equal(after[0].n,1);
  await pool.query('DROP TRIGGER ayambil_test_fail');
  await store.logout(session.token);await assert.rejects(store.session(session.token),e=>e.status===401);
  await checkParallelLists(store,input);await checkQueue(pool);await checkTrashLifecycle(pool,config,actor);assert.equal(await store.ready(),true);
 }finally{try{await pool.query('UPDATE ayambil_settings SET registration_open=FALSE WHERE id=1');}catch{}await pool.end();}
 // Preserve schema for inspection. Operator removes ONLY this disposable schema.
});
