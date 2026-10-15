import test from 'node:test';
import assert from 'node:assert/strict';
import {createStore} from '../store.mjs';
import {hash} from '../security.mjs';
test('refreshing multiple tabs keeps session-bound CSRF stable without extending expiry',async()=>{
 const updates=[];const token='a'.repeat(64);
 const pool={execute:async(sql,args)=>{if(sql.startsWith('SELECT s.admin_id'))return [[{admin_id:'synthetic',csrf_hash:'old'}]];updates.push([sql,args]);return [{affectedRows:1}];}};
 const store=createStore(pool,{});
 const first=await store.restoreSession(token),second=await store.restoreSession(token);
 assert.equal(first.csrfToken,second.csrfToken);assert.equal(first.csrfToken.length,64);assert.notEqual(first.csrfToken,token);
 assert.equal(updates[0][1][0],hash(first.csrfToken));assert.ok(updates.every(([sql])=>!sql.includes('SET expires_at')));
 await assert.rejects(store.restoreSession('invalid'),e=>e.status===401);
});
