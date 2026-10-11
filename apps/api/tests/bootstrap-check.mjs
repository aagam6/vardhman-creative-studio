import assert from 'node:assert/strict';
import {programme} from '../config.mjs';
import {provisionInitialAdmin} from '../bootstrap.mjs';
import {passwordMatches} from '../security.mjs';
import {createStore} from '../store.mjs';
export async function checkBootstrap(pool,config) {
 const input={approved:true,email:'bootstrap@example.invalid',password:'Synthetic bootstrap password only',initialProgramme:programme};
 const db=await pool.getConnection();
 try {
  await assert.rejects(provisionInitialAdmin(db,{...input,initialProgramme:{...programme,sessions:[programme.sessions[0]]}}),/snapshots/);
  await assert.rejects(provisionInitialAdmin(db,{...input,approved:false}),/approval/);
  await pool.query('UPDATE ayambil_schema_version SET version=99');
  await assert.rejects(provisionInitialAdmin(db,input),/schema version/);
  await pool.query('UPDATE ayambil_schema_version SET version=1');
  await pool.query("CREATE TRIGGER ayambil_bootstrap_fail BEFORE INSERT ON ayambil_admins FOR EACH ROW SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='synthetic bootstrap failure'");
  await assert.rejects(provisionInitialAdmin(db,input));
  assert.equal((await pool.query('SELECT COUNT(*) AS n FROM ayambil_events'))[0][0].n,0);
  assert.equal((await pool.query('SELECT COUNT(*) AS n FROM ayambil_admins'))[0][0].n,0);
  await pool.query('DROP TRIGGER ayambil_bootstrap_fail');
  await provisionInitialAdmin(db,input);
  const [admins]=await pool.query('SELECT password_hash FROM ayambil_admins');
  assert.match(admins[0].password_hash,/^scrypt:/);
  assert.notEqual(admins[0].password_hash,input.password);
  assert.equal(await passwordMatches(input.password,admins[0].password_hash),true);
  assert.equal(await passwordMatches('wrong password',admins[0].password_hash),false);
  const [events]=await pool.query('SELECT snapshot FROM ayambil_events ORDER BY event_date');
  assert.deepEqual(events.map(e=>typeof e.snapshot==='string'?JSON.parse(e.snapshot):e.snapshot),programme.sessions);
  await assert.rejects(provisionInitialAdmin(db,input),/already exists/);
  const store=createStore(pool,config);
  const session=await store.login(input.email,input.password);
  await store.session(session.token);
  await store.logout(session.token);
  await assert.rejects(store.login(input.email,'wrong'),e=>e.status===401);
  assert.equal(Number((await pool.query('SELECT registration_open FROM ayambil_settings'))[0][0].registration_open),0);
  // Only synthetic rows in the guarded disposable schema; leave it clean for lifecycle suite.
  await pool.query('DELETE FROM ayambil_admin_sessions');
  await pool.query('DELETE FROM ayambil_admins');
  await pool.query('DELETE FROM ayambil_events');
 }finally{db.release();}
}
