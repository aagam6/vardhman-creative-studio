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

test('logout deletes only the current session and refresh cannot restore it',async()=>{
 const token='b'.repeat(64);const sessions=new Set([hash(token),hash('c'.repeat(64))]);
 const pool={execute:async(sql,args)=>{
 if(sql.startsWith('DELETE FROM ayambil_admin_sessions')){sessions.delete(args[0]);return [{affectedRows:1}];}
 if(sql.startsWith('SELECT s.admin_id'))return [sessions.has(args[0])?[{admin_id:'synthetic',csrf_hash:'old'}]:[]];
 return [{affectedRows:1}];
 }};
 const store=createStore(pool,{});await store.restoreSession(token);await store.logout(token);
 await assert.rejects(store.restoreSession(token),error=>error.status===401);
 await store.restoreSession('c'.repeat(64));assert.equal(sessions.size,1);
});
