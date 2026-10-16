import test from 'node:test';
import assert from 'node:assert/strict';
import {createStore} from '../store.mjs';
import {createApp} from '../app.mjs';
import {ApiError} from '../config.mjs';
test('event overview aggregates the whole event without multiplying totals by attendees or messages',async()=>{
 const queries=[];const pool={execute:async(sql,args)=>{queries.push(sql);
 if(sql.includes("WHERE event_date=?"))return [[{bookings:args[0]==='2026-11-02'?70:50,activeBookings:args[0]==='2026-11-02'?65:45,cancelledBookings:5}]];
 if(sql.includes("WHERE b.event_date=?"))return [[{totalPasses:args[0]==='2026-11-02'?250:180,activePasses:args[0]==='2026-11-02'?230:170,cancelledPasses:args[0]==='2026-11-02'?20:10,trashedPasses:args[0]==='2026-11-02'?3:7}]];
 if(sql.includes('FROM ayambil_audit'))return [[{id:'audit',action:'cancel',actor:'operator@example.invalid'}]];
 if(sql.includes('FROM ayambil_bookings'))return [[{bookings:120,activeBookings:'110',cancelledBookings:'10'}]];
 if(sql.includes('FROM ayambil_passes'))return [[{activePasses:'400',cancelledPasses:'30',trashedPasses:'10'}]];
 if(sql.includes('FROM ayambil_message_queue'))return [[{pendingMessages:'75',failedMessages:'3'}]];
 throw Error('Unexpected query');}};
 const result=await createStore(pool,{}, {queue:{}}).overview();assert.deepEqual(result.evenings.map(e=>[e.date,e.bookings,e.totalPasses,e.activePasses,e.cancelledPasses]),[['2026-11-02',70,250,230,20],['2026-11-03',50,180,170,10]]);assert.equal(result.scope,'event');assert.equal(result.totals.bookings,120);assert.equal(result.totals.activePasses,400);assert.equal(result.totals.trashedPasses,10);assert.deepEqual(result.evenings.map(e=>e.trashedPasses),[3,7]);assert.equal(result.totals.pendingMessages,75);assert.ok(queries.find(sql=>sql.includes('AS pendingMessages')).includes("pa.status='active' AND pp.status='active' AND pp.trashed_at IS NULL"));assert.equal(result.activity[0].action,'cancel');assert.ok(queries.slice(0,3).every(sql=>!sql.includes('LIMIT')));assert.ok(queries.filter(sql=>sql.includes('AS cancelledPasses')).every(sql=>sql.includes("p.status='cancelled' AND p.trashed_at IS NULL")));
});
test('message filters reject unsupported states and bind selected status without recipient data',async()=>{
 const queries=[];const store=createStore({execute:async(sql,args)=>{queries.push({sql,args});return [[]];}},{});
 await store.list({message:'failed'});assert.ok(queries[0].sql.includes('CONVERT(mq.booking_id USING utf8mb4) COLLATE utf8mb4_unicode_ci'));assert.ok(queries[0].sql.includes("mq.status='failed'"));await store.list({});assert.ok(!queries[1].sql.includes('ayambil_message_queue'));assert.equal(queries[1].args.length,8);await assert.rejects(store.list({message:'anything'}),e=>e.status===400);await store.list({message:'pending'});const pending=queries[2].sql;assert.ok(pending.includes("b.status='active'"));assert.ok(pending.includes("pa.status='active' AND pp.status='active' AND pp.trashed_at IS NULL"));assert.ok(pending.includes("pass:booking:"));assert.ok(pending.includes("previous.id<mq.id"));
});
test('overview is denied to unauthenticated visitors and is never cached',async()=>{
 let touched=false;const store={session:async()=>{throw new ApiError(401,'Sign in');},overview:async()=>{touched=true;return {};}};
 const server=createApp({store,config:{origin:'https://example.invalid'},staticDirectory:'.'}).listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
 try{const response=await fetch(`http://127.0.0.1:${server.address().port}/api/ayambil/admin/overview`);assert.equal(response.status,401);assert.equal(response.headers.get('cache-control'),'no-store');assert.equal(touched,false);}finally{await new Promise(r=>server.close(r));}
});

test('central Trash lists only archived passes across all booking pages with bounded date pagination',async()=>{
 const calls=[];const fixture=Array.from({length:51},(_,i)=>({passNumber:'PASS-'+i,status:'cancelled'}));
 const store=createStore({execute:async(sql,args)=>{calls.push({sql,args});return [fixture];}},{});
 const result=await store.trash({page:2,date:'2026-11-03'});assert.equal(result.items.length,50);assert.equal(result.hasMore,true);assert.equal(result.page,2);
 assert.ok(calls[0].sql.includes('WHERE p.trashed_at IS NOT NULL AND b.event_date=?'));assert.ok(calls[0].sql.includes('ORDER BY p.trashed_at DESC,p.id LIMIT 51 OFFSET ?'));assert.deepEqual(calls[0].args,['2026-11-03',50]);
 await store.trash({});assert.deepEqual(calls[1].args,[0]);assert.ok(!calls[1].sql.includes('b.event_date=?'));
 for(const query of [{page:0},{page:'1 OR 1=1'},{page:100001},{date:'2026-11-04'}])await assert.rejects(store.trash(query),e=>e.status===400);
});
test('central Trash endpoint denies unauthenticated readers',async()=>{
 let touched=false;const server=createApp({store:{session:async()=>{throw new ApiError(401,'Sign in');},trash:async()=>{touched=true;}},config:{origin:'https://example.invalid'},staticDirectory:'.'}).listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
 try{const response=await fetch(`http://127.0.0.1:${server.address().port}/api/ayambil/admin/trash`);assert.equal(response.status,401);assert.equal(response.headers.get('cache-control'),'no-store');assert.equal(touched,false);}finally{await new Promise(r=>server.close(r));}
});
