import test from 'node:test';
import assert from 'node:assert/strict';
import {waitingApprovalPlan,collectWaitingApprovalPlan,approveWaitingPlan} from '../src/lib/ayambilWaitingApproval.js';
const group=(id,n=2)=>({id,number:'WAIT26-'+id,status:'waiting',eventDate:'2026-11-03',contactName:'Synthetic family',attendees:Array.from({length:n},()=>({fullName:'Fixture'}))});
test('review is one evening, whole groups, unique fixed IDs',()=>{
 const plan=waitingApprovalPlan([group('a',6),group('b',1)]);assert.equal(plan.persons,7);assert.equal(plan.items.length,2);
 for(const input of [[],[group('a'),group('a')],[{...group('a'),status:'active'}],[group('a'),{...group('b'),eventDate:'2026-11-02'}]])assert.throws(()=>waitingApprovalPlan(input));
});
test('all-pages review reads beyond loaded50 and pins evening/waiting, not message filters',async()=>{
 const calls=[];const plan=await collectWaitingApprovalPlan(async(path,{query})=>{calls.push(query);return {page:query.page,hasMore:query.page===1,items:[group(String(query.page))]};},{date:'2026-11-03',search:'fixture',message:'failed'});
 assert.equal(plan.items.length,2);assert.equal(calls[1].page,2);assert.ok(calls.every(q=>q.status==='waiting'&&q.message===''&&q.date==='2026-11-03'));
 await assert.rejects(collectWaitingApprovalPlan(()=>assert.fail(),{}),/one evening/);
 await assert.rejects(collectWaitingApprovalPlan(async()=>({page:1,items:[group('a'),group('a')],hasMore:false}),{date:'2026-11-03'}),/Refresh/);
});
test('sequential existing authenticated transaction path, no send or retry transport',async()=>{
 let active=0,max=0;const calls=[];const plan=waitingApprovalPlan([group('a'),group('b')]);
 const result=await approveWaitingPlan(async(path,options)=>{active++;max=Math.max(max,active);calls.push({path,...options});await Promise.resolve();active--;return {number:'BOOK26-'+options.body.id};},plan);
 assert.equal(max,1);assert.equal(result.results.length,2);assert.equal(result.remaining.length,0);assert.ok(calls.every(c=>c.path==='admin/booking-controls/approve'&&c.method==='POST'));assert.deepEqual(calls.map(c=>c.body),[{id:'a'},{id:'b'}]);
});
test('capacity conflict stops batch, retains successful IDs; no replay',async()=>{
 const calls=[];const plan=waitingApprovalPlan([group('a'),group('b'),group('c')]);
 const result=await approveWaitingPlan(async(_,o)=>{calls.push(o.body.id);if(o.body.id==='b')throw Object.assign(Error('conflict'),{status:409});return {number:'BOOK26-a'};},plan);
 assert.deepEqual(calls,['a','b']);assert.deepEqual(result.results.map(r=>r.state),['approved','blocked']);assert.equal(result.remaining[0].id,'c');
});
test('unknown acceptance/invalid response stops immediately; never auto retries',async()=>{
 for(const response of [()=>{throw Object.assign(Error('timeout'),{code:'MUTATION_UNCONFIRMED'});},()=>({})]){let calls=0;const result=await approveWaitingPlan(async()=>{calls++;return response();},waitingApprovalPlan([group('a'),group('b')]));assert.equal(calls,1);assert.equal(result.results[0].state,'unconfirmed');assert.equal(result.remaining.length,1);}
});
test('operator stop only takes effect after in-flight group, without cancelling/repeating it',async()=>{
 let stop=false,calls=0;const result=await approveWaitingPlan(async()=>{calls++;stop=true;return {number:'BOOK26-a'};},waitingApprovalPlan([group('a'),group('b')]),()=>{},()=>stop);assert.equal(calls,1);assert.equal(result.results[0].state,'approved');assert.equal(result.remaining[0].id,'b');
});
