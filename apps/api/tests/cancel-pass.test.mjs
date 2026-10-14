import test from 'node:test';
import assert from 'node:assert/strict';
import {createStore} from '../store.mjs';
function fixture(pass={id:'selected-pass',status:'active'}){
 const calls=[];
 const db={beginTransaction:async()=>calls.push(['begin']),commit:async()=>calls.push(['commit']),rollback:async()=>calls.push(['rollback']),release(){},execute:async(sql,args=[])=>{
 calls.push([sql,args]);
 if(sql.startsWith('SELECT * FROM ayambil_bookings'))return [[{id:'booking-one',number:'BOOK26-test',status:'active',event_date:'2026-11-02'}]];
 if(sql.startsWith('SELECT p.id,p.status'))return [pass?[pass]:[]];
 return [[]];
 }};
 return {calls,store:createStore({getConnection:async()=>db},{},{})};
}
test('individual cancellation scopes pass lookup to booking, revokes its link and retains history',async()=>{
 const {store,calls}=fixture();await store.change({admin_id:'operator'},{action:'cancel-pass',bookingId:'booking-one',passNumber:'AYV26-one'});
 const lookup=calls.find(([sql])=>sql.startsWith('SELECT p.id,p.status'));assert.deepEqual(lookup[1],['AYV26-one','booking-one']);
 const updates=calls.filter(([sql])=>sql.startsWith('UPDATE'));assert.equal(updates.length,2);assert.deepEqual(updates.map(c=>c[1]),[['selected-pass'],['selected-pass']]);
 assert.ok(calls.some(([sql,args])=>sql.startsWith('INSERT INTO ayambil_audit')&&args[3]==='cancel-pass'));
 assert.ok(!calls.some(([sql])=>sql.startsWith('DELETE')));assert.ok(calls.some(([sql])=>sql==='commit'));
});
test('wrong booking or inactive pass rolls back without mutations',async()=>{
 for(const pass of [null,{id:'old',status:'cancelled'},{id:'old',status:'superseded'}]){
 const {store,calls}=fixture(pass);await assert.rejects(store.change({admin_id:'operator'},{action:'cancel-pass',bookingId:'booking-one',passNumber:'AYV26-one'}));
 assert.ok(calls.some(([sql])=>sql==='rollback'));assert.ok(!calls.some(([sql])=>sql.startsWith('UPDATE')));
 }
});
test('booking restoration excludes passes whose capabilities were explicitly revoked',async()=>{
 const {store,calls}=fixture();await store.change({admin_id:'operator'},{action:'restore',bookingId:'booking-one'});
 const passUpdate=calls.find(([sql])=>sql.startsWith('UPDATE ayambil_passes p'));assert.ok(passUpdate[0].includes('c.revoked_at IS NULL'));assert.deepEqual(passUpdate[1],['active','booking-one','active']);
});
