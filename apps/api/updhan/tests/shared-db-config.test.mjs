import test from 'node:test';import assert from 'node:assert/strict';
import {updhanSharedDatabaseConfig,updhanIdentityReader} from '../shared-db-config.mjs';
import {verifyUpdhanRuntime,updhanTables} from '../runtime-preflight.mjs';
test('existing DB_* user reused, no new identity credentials or environment mutation',()=>{
 const env={DB_HOST:'127.0.0.1',DB_PORT:'3306',DB_NAME:'u531246927_vcs',DB_USER:'existing',DB_PASSWORD:'synthetic'};const before={...env};
 const c=updhanSharedDatabaseConfig(env);assert.equal(c.user,'existing');assert.equal(c.password,'synthetic');assert.equal(c.connectionLimit,4);assert.deepEqual(env,before);assert.throws(()=>updhanSharedDatabaseConfig({...env,DB_NAME:'other'}));
});
test('identity wrapper rejects writes and unrelated reads before reaching shared pool',async()=>{
 const calls=[];const reader=updhanIdentityReader({execute:async(...args)=>{calls.push(args);return [[]];}});
 await reader.execute('SELECT id,password_hash,enabled FROM ayambil_admins WHERE email=?',['synthetic']);
 for(const sql of ['UPDATE ayambil_admins SET enabled=FALSE','SELECT * FROM ayambil_bookings','DELETE FROM updhan_applications'])assert.throws(()=>reader.execute(sql,[]));assert.equal(calls.length,1);
});
test('explicit shared-principal preflight still enforces database engine and complete schema',async()=>{
 const pool={query:async sql=>sql.includes('VERSION')?[[{name:'u531246927_vcs',version:'11.8.9-MariaDB-log'}]]:[[{name:'u531246927_vcs'}]],execute:async()=>[updhanTables.map(name=>({name}))]};
 assert.equal((await verifyUpdhanRuntime({pool,identityPool:pool,databaseName:'u531246927_vcs',sharedPrincipal:true})).ready,true);
 await assert.rejects(verifyUpdhanRuntime({pool,identityPool:pool,databaseName:'wrong',sharedPrincipal:true}),/mismatch/);
 await assert.rejects(verifyUpdhanRuntime({pool:{...pool,execute:async()=>[[]]},identityPool:pool,databaseName:'u531246927_vcs',sharedPrincipal:true}),/schema/);
});
