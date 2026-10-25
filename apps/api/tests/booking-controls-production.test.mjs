import test from 'node:test';
import assert from 'node:assert/strict';
import {assertControlsConfiguration,assertControlsReady} from '../booking-controls-policy.mjs';
import {configuration} from '../config.mjs';
const config={database:{host:'localhost',port:3306,database:'approved_live_schema'},origin:'https://vardhmancreativestudio.com',bookingControls:true,bookingControlsProduction:true,notificationDispatchEnabled:false};
const pool={pool:{config:{connectionConfig:{host:'localhost',port:3306,database:'approved_live_schema'}}}};
test('production integration requires explicit independent flags, actual pool and canonical origin',()=>{
 assert.doesNotThrow(()=>assertControlsConfiguration(config,pool));
 for(const c of [{...config,bookingControls:false},{...config,bookingControlsProduction:false},{...config,notificationDispatchEnabled:true},{...config,origin:'https://other.invalid'},{...config,database:{...config.database,port:3307}},{...config,database:{...config.database,database:'other'}}])assert.throws(()=>assertControlsConfiguration(c,pool));
});
test('schema readiness stays closed until additive tables and both configured events are ready',async()=>{
 const events=[{event_date:'2026-11-02',mode:'open',capacity:1800,approval_capacity_configured:1},{event_date:'2026-11-03',mode:'waiting',capacity:0,approval_capacity_configured:0}];let enabled=0;
 const db={execute:async sql=>sql.includes('SELECT enabled')?[[{enabled}]]:sql.includes('SELECT event_date')?[events]:[[]]};
 assert.equal(await assertControlsReady(db,config),false);enabled=1;assert.equal(await assertControlsReady(db,config),true);events[0].approval_capacity_configured=0;assert.equal(await assertControlsReady(db,config),false);
 await assert.rejects(assertControlsReady({execute:async()=>{throw Error('Missing schema');}},config));
});
test('environment flags default off and dispatch-on is rejected before startup',()=>{
 const env={DB_HOST:'localhost',DB_PORT:'3306',DB_NAME:'synthetic',DB_USER:'synthetic',DB_PASSWORD:'synthetic',AYAMBIL_SITE_ORIGIN:'https://vardhmancreativestudio.com',AYAMBIL_RATE_LIMIT_SECRET:'x'.repeat(32)};
 const c=configuration(env);assert.equal(c.bookingControls,false);assert.equal(c.bookingControlsProduction,false);assert.equal(c.notificationDispatchEnabled,false);
 assert.throws(()=>configuration({...env,AYAMBIL_NOTIFICATION_DISPATCH_ENABLED:'true'}));
});
