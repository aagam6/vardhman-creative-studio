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
 const passUpdate=calls.find(([sql])=>sql.startsWith('UPDATE ayambil_passes p'));assert.ok(passUpdate[0].includes('c.revoked_at IS NULL'));assert.deepEqual(passUpdate[1],['active','booking-one']);
});

test('local stateful scenario: cancel one pass, deny its download, retain other pass across booking restore',async()=>{
 const state={booking:{id:'b',number:'BOOK26-SYNTHETIC',status:'active',event_date:'2026-11-02'},passes:[{id:'p1',number:'AYV26-ONE',status:'active',revoked:false,snapshot:{number:'AYV26-ONE',attendeeName:'Synthetic One'}},{id:'p2',number:'AYV26-TWO',status:'active',revoked:false,snapshot:{number:'AYV26-TWO',attendeeName:'Synthetic Two'}}],audit:[]};
 const {hash}=await import('../security.mjs');const keys=['A'.repeat(64),'B'.repeat(64)];
 const execute=async(sql,args=[])=>{
  if(sql.startsWith('SELECT * FROM ayambil_bookings'))return [[state.booking]];
  if(sql.startsWith('SELECT p.id,p.status'))return [state.passes.filter(p=>p.number===args[0]&&args[1]===state.booking.id)];
  if(sql.startsWith("UPDATE ayambil_passes SET status='cancelled'")){state.passes.find(p=>p.id===args[0]).status='cancelled';return [[]];}
  if(sql.startsWith('UPDATE ayambil_capabilities SET')){state.passes.find(p=>p.id===args[0]).revoked=true;return [[]];}
  if(sql.startsWith('UPDATE ayambil_bookings SET')){state.booking.status=args[0];return [[]];}
  if(sql.startsWith('UPDATE ayambil_attendees SET'))return [[]];
  if(sql.startsWith('UPDATE ayambil_passes p')){for(const p of state.passes)if(args[0]==='cancelled'||!p.revoked)p.status=args[0];return [[]];}
  if(sql.startsWith('INSERT INTO ayambil_audit')){state.audit.push(args[3]);return [[]];}
  if(sql.startsWith('SELECT p.snapshot,p.status FROM ayambil_capabilities')){
   const index=keys.findIndex(key=>hash(key)===args[0]);const p=state.passes[index];return [[...(p&&!p.revoked&&p.status==='active'&&state.booking.status==='active'?[{snapshot:p.snapshot,status:p.status}]:[])]];
  }
  if(sql.startsWith('SELECT * FROM ayambil_attendees'))return [[]];
  throw Error('Unexpected local query: '+sql);
 };
 const db={execute,beginTransaction:async()=>{},commit:async()=>{},rollback:async()=>{},release(){}};
 const store=createStore({execute,getConnection:async()=>db},{},{}),actor={admin_id:'synthetic-admin'};
 assert.equal((await store.download(keys[0])).passes[0].number,'AYV26-ONE');
 await store.change(actor,{action:'cancel-pass',bookingId:'b',passNumber:'AYV26-ONE'});
 await assert.rejects(store.download(keys[0]),e=>e.status===404);
 assert.equal((await store.download(keys[1])).passes[0].number,'AYV26-TWO');assert.equal(state.booking.status,'active');
 await store.change(actor,{action:'cancel',bookingId:'b'});await assert.rejects(store.download(keys[1]),e=>e.status===404);
 await store.change(actor,{action:'restore',bookingId:'b'});await assert.rejects(store.download(keys[0]),e=>e.status===404);
 assert.equal((await store.download(keys[1])).passes[0].number,'AYV26-TWO');assert.equal(state.passes.length,2);assert.deepEqual(state.audit,['cancel-pass','cancel','restore']);
});

test('whole booking cancellation updates all current passes without capability eligibility filter',async()=>{
 const {store,calls}=fixture();await store.change({admin_id:'operator'},{action:'cancel',bookingId:'booking-one'});
 const update=calls.find(([sql])=>sql.startsWith('UPDATE ayambil_passes p'));
 assert.deepEqual(update[1],['cancelled','booking-one']);assert.ok(!update[0].includes('ayambil_capabilities'));
 assert.ok(calls.some(([sql,args])=>sql.startsWith('INSERT INTO ayambil_audit')&&args[3]==='cancel'));
});

test('failed booking update reports its safe stage and rolls back',async()=>{
 const error=Object.assign(new Error('Private SQL data'),{errno:1451});let rolledBack=false;
 const db={beginTransaction:async()=>{},commit:async()=>{},rollback:async()=>{rolledBack=true;},release(){},execute:async(sql)=>{
 if(sql.startsWith('SELECT * FROM ayambil_bookings'))return [[{id:'b'}]];
 throw error;
 }};
 await assert.rejects(createStore({getConnection:async()=>db},{}).change({admin_id:'a'},{action:'cancel',bookingId:'b'}),e=>e.ayambilStage==='change.booking'&&e.errno===1451);
 assert.equal(rolledBack,true);
});

test('Trash accepts only cancelled passes and preserves status, links and history',async()=>{
 const {store,calls}=fixture({id:'p',status:'cancelled',trashed_at:null});
 await store.change({admin_id:'operator'},{action:'trash-pass',bookingId:'booking-one',passNumber:'AYV26-one'});
 const updates=calls.filter(([sql])=>sql.startsWith('UPDATE'));
 assert.equal(updates.length,1);assert.equal(updates[0][0],'UPDATE ayambil_passes SET trashed_at=UTC_TIMESTAMP(3) WHERE id=?');
 assert.ok(!calls.some(([sql])=>sql.startsWith('DELETE')));
 assert.ok(calls.some(([sql,args])=>sql.startsWith('INSERT INTO ayambil_audit')&&args[3]==='trash-pass'));
 for(const pass of [null,{id:'p',status:'active'},{id:'p',status:'superseded'},{id:'p',status:'cancelled',trashed_at:'2026-10-15'}]){
 const f=fixture(pass);await assert.rejects(f.store.change({admin_id:'operator'},{action:'trash-pass',bookingId:'booking-one',passNumber:'AYV26-one'}));assert.ok(!f.calls.some(([sql])=>sql.startsWith('UPDATE')));
 }
});
test('Restore from Trash clears only trash metadata and whole booking restore excludes Trash',async()=>{
 const {store,calls}=fixture({id:'p',status:'cancelled',trashed_at:'2026-10-15'});
 await store.change({admin_id:'operator'},{action:'untrash-pass',bookingId:'booking-one',passNumber:'AYV26-one'});
 assert.deepEqual(calls.filter(([sql])=>sql.startsWith('UPDATE')).map(([sql])=>sql),['UPDATE ayambil_passes SET trashed_at=NULL WHERE id=?']);
 const f=fixture();await f.store.change({admin_id:'operator'},{action:'restore',bookingId:'booking-one'});
 assert.ok(f.calls.find(([sql])=>sql.startsWith('UPDATE ayambil_passes p'))[0].includes('p.trashed_at IS NULL'));
});

test('reissue cannot silently supersede a pass held in Trash',async()=>{
 let updated=false;
 const db={beginTransaction:async()=>{},commit:async()=>{},rollback:async()=>{},release(){},execute:async(sql)=>{
 if(sql.startsWith('SELECT * FROM ayambil_bookings'))return [[{id:'b',status:'active'}]];
 if(sql.includes('p.trashed_at IS NOT NULL'))return [[{id:'trashed'}]];
 if(sql.startsWith('UPDATE'))updated=true;
 return [[]];
 }};
 await assert.rejects(createStore({getConnection:async()=>db},{}).change({admin_id:'operator'},{action:'reissue',bookingId:'b',attendeeId:'a'}),e=>e.status===409);
 assert.equal(updated,false);
});
