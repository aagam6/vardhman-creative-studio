import assert from 'node:assert/strict';
import mysql from 'mysql2/promise';
import {startBookingFixture,fixtureInput} from './booking-controls-fixture.mjs';
import {createStore} from '../apps/api/store.mjs';
import {assertControlsConfiguration} from '../apps/api/booking-controls-policy.mjs';
const f=await startBookingFixture();let pool;
try{
 const schema='ayambil_release_test_'+Date.now();await f.root.query('CREATE DATABASE '+schema+' CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
 const [tables]=await f.root.query('SHOW TABLES');for(const row of tables){const name=Object.values(row)[0];assert(/^[a-z0-9_]+$/.test(name));await f.root.query(`CREATE TABLE ${schema}.${name} LIKE ${name}`);const [columns]=await f.root.query('SHOW COLUMNS FROM '+name);const fields=columns.filter(c=>!String(c.Extra).includes('GENERATED')).map(c=>'`'+c.Field+'`').join(',');await f.root.query(`INSERT INTO ${schema}.${name} (${fields}) SELECT ${fields} FROM ${name}`);}
 const old=f.pool.pool.config.connectionConfig;
 pool=mysql.createPool({host:'127.0.0.1',port:old.port,user:'root',password:old.password,database:schema,dateStrings:true,timezone:'Z'});
 const config={...f.config,database:{host:'127.0.0.1',database:schema},origin:'https://vardhmancreativestudio.com',disposable:false,bookingControls:true,bookingControlsProduction:true,notificationDispatchEnabled:false};
 const queue={enqueue(){throw Error('Legacy notification queue must not be used by production controls');}};
 const store=createStore(pool,config,{queue});assert(await store.ready());
 for(const bad of [{...config,bookingControlsProduction:false},{...config,notificationDispatchEnabled:true},{...config,origin:'https://other.invalid'}])assert.throws(()=>assertControlsConfiguration(bad,pool));
 await pool.query('UPDATE ayambil_booking_controls_release SET enabled=FALSE');assert.equal(await store.ready(),false);await assert.rejects(store.register(fixtureInput()),e=>e.status===503);await pool.query('UPDATE ayambil_booking_controls_release SET enabled=TRUE');
 await pool.query("UPDATE ayambil_booking_controls SET mode='open',capacity=2,approval_capacity_configured=TRUE WHERE event_date='2026-11-02'");await pool.query("UPDATE ayambil_booking_controls SET mode='waiting',capacity=0,approval_capacity_configured=FALSE WHERE event_date='2026-11-03'");
 const oldBooking=await store.register(fixtureInput(['Old existing']));assert.equal(oldBooking.status,'active');
 const overflow=await store.register(fixtureInput(['Whole group one','Whole group two']));assert.equal(overflow.status,'waiting');
 const waiting=await store.register(fixtureInput(['Unconfigured approval'],'2026-11-03'));const w=(await store.bookingControls.waiting()).find(w=>w.number===waiting.number);await assert.rejects(store.bookingControls.approve(f.actor,w.id),e=>e.status===409&&/capacity not configured/i.test(e.message));
 await pool.query("UPDATE ayambil_booking_controls SET capacity=5,approval_capacity_configured=TRUE WHERE event_date='2026-11-03'");const approvals=await Promise.all(Array.from({length:8},()=>store.bookingControls.approve(f.actor,w.id)));assert.equal(new Set(approvals.map(a=>a.number)).size,1);
 const [intents]=await pool.query('SELECT purpose,state,context FROM ayambil_notification_intents');assert.equal(intents.filter(i=>i.purpose==='booking_confirmed').length,1);assert.equal(intents.filter(i=>i.purpose==='waiting_approved').length,1);assert.equal(intents.filter(i=>i.purpose==='waiting_received').length,2);assert(intents.every(i=>i.state==='held'));const [[q]]=await pool.query('SELECT COUNT(*) n FROM ayambil_message_queue');assert.equal(Number(q.n),0);
 console.log(JSON.stringify({passed:true,productionPolicyOnDisposableEngine:true,schemaGate:true,approvalNotConfigured:true,intents:intents.length,legacyQueueRows:0,providerCalls:0,concurrentApprovals:8}));
}finally{await pool?.end();await f.close();}
