import test from 'node:test';
import assert from 'node:assert/strict';
import {hostingerBootstrap} from '../hostinger-bootstrap.mjs';
import {createStore} from '../store.mjs';
import {configuration} from '../config.mjs';
import {programme} from '../config.mjs';
import {provisionInitialAdmin} from '../bootstrap.mjs';
test('mock transactional strict bootstrap creates once, verifies repeat and rolls back partial state',async()=>{
 const names=['admins','admin_sessions','attendees','audit','bookings','capabilities','events','idempotency','message_queue','passes','rate_limits','registrations','schema_version','settings','whatsapp_attempts'];
 let admins=[],events=[],commits=0,rollbacks=0;
 const db={beginTransaction:async()=>{},commit:async()=>{commits++;},rollback:async()=>{rollbacks++;},query:async sql=>[sql.includes('schema_version')?[{version:1},{version:2}]:sql.includes('information_schema')?names.map(n=>({TABLE_NAME:'ayambil_'+n,ENGINE:'InnoDB'})):sql.includes('settings')?[{registration_open:0}]:sql.includes('FROM ayambil_admins')?admins:sql.includes('FROM ayambil_events')?events:[{count:0}]],execute:async(sql,args)=>{if(sql.includes('ayambil_events'))events.push({event_date:args[0],snapshot:args[1]});else admins.push({email:args[1],password_hash:args[2],enabled:1});}};
 const input={approved:true,email:'synthetic@example.invalid',password:'Synthetic-local-password-123!',initialProgramme:programme,hostingerOneTime:true};
 assert.deepEqual(await provisionInitialAdmin(db,input),{initialized:true});assert.deepEqual(await provisionInitialAdmin(db,input),{initialized:false});assert.equal(admins.length,1);assert.equal(commits,2);
 events.pop();await assert.rejects(provisionInitialAdmin(db,input));assert.equal(rollbacks,1);
});
test('one-time path requires explicit closed gates and clears private process input',async()=>{
 let calls=0;const pool={getConnection:async()=>{calls++;throw Error();}};
 assert.deepEqual(await hostingerBootstrap(pool,{}),{requested:false});
 const env={AYAMBIL_BOOTSTRAP_APPROVED:'true',AYAMBIL_REGISTRATION_OPEN:'true',AYAMBIL_WHATSAPP_ENABLED:'false',AYAMBIL_INITIAL_ADMIN_PASSWORD:'synthetic-not-used'};
 await assert.rejects(hostingerBootstrap(pool,env));assert.equal(calls,0);assert.equal(env.AYAMBIL_INITIAL_ADMIN_PASSWORD,undefined);assert.equal(env.AYAMBIL_BOOTSTRAP_APPROVED,undefined);
});
test('dateStrings configuration and readiness match both ISO dates without Date coercion',async()=>{
 const config=configuration({DB_HOST:'127.0.0.1',DB_PORT:'3306',DB_NAME:'synthetic',DB_USER:'synthetic',DB_PASSWORD:'synthetic',AYAMBIL_SITE_ORIGIN:'https://example.invalid',AYAMBIL_RATE_LIMIT_SECRET:'a'.repeat(32)});
 assert.equal(config.database.dateStrings,true);
 let dates=['2026-11-02','2026-11-03'];const pool={execute:async sql=>[sql.includes('schema_version')?[{version:1}]:dates.map(event_date=>({event_date}))]};
 assert.equal(await createStore(pool,config).ready(),true);dates=['2026-11-02'];assert.equal(await createStore(pool,config).ready(),false);
});
