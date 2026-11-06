import test from 'node:test';import assert from 'node:assert/strict';
import {updhanToday,updhanDayBounds} from '../calendar-day.mjs';
import {createUpdhanProductionService} from '../production-service.mjs';
const databaseName='updhan_local_summary',actor={id:'reviewer',roles:['updhan_admin']};
test('India day boundaries cover midnight and leap days without host timezone dependence',()=>{
 assert.equal(updhanToday(new Date('2026-11-06T18:29:59Z')),'2026-11-06');assert.equal(updhanToday(new Date('2026-11-06T18:30:00Z')),'2026-11-07');
 assert.deepEqual(updhanDayBounds('2028-02-29'),{start:'2028-02-28 18:30:00',end:'2028-02-29 18:30:00'});
 for(const day of ['2027-02-29','2026-13-01',"2026-01-01' OR 1=1",[],null])assert.throws(()=>updhanDayBounds(day),e=>e.status===400);
});
function fixture(){const calls=[],pool={pool:{config:{connectionConfig:{database:databaseName}}},async query(sql){calls.push({sql});if(sql.includes('GROUP BY status'))return[[{status:'received',n:2}]];if(sql.includes('GROUP BY o.state'))return[[{state:'submitted',n:3}]];if(sql.includes('COUNT(')&&!sql.includes('SELECT o.'))return[[{n:1}]];return[[]];},async execute(sql,args){calls.push({sql,args});if(sql.includes('COUNT(*)'))return[[{n:2}]];return[[]];}};
 const service=createUpdhanProductionService({pool,databaseName,encryptionKey:'cd'.repeat(32),photoRetentionDays:null});return{calls,service};}
test('admin overview queries are read-only, authenticated and today excludes trash',async()=>{
 const {calls,service}=fixture();await assert.rejects(service.summary({roles:[]}),e=>e.status===403);assert.equal(calls.length,0);
 const r=await service.summary(actor);assert.equal(r.activity.newToday,2);assert.equal(r.activity.timeZone,'Asia/Kolkata');assert.equal(r.counts.received,2);assert.equal(r.messages.submitted,3);
 const today=calls.find(c=>c.sql.includes("status<>'trashed' AND created_at"));assert.deepEqual(today.args,Object.values(updhanDayBounds(r.activity.date)));
 assert.ok(calls.every(c=>c.sql.startsWith('SELECT ')&&!c.sql.includes('ayambil_')));
});
test('review/today quick filters apply to both count and rows and use UTC bounds',async()=>{
 const {calls,service}=fixture();await service.list(actor,{today:'true',reviewPending:'true'});
 assert.equal(calls.length,2);for(const c of calls){assert.match(c.sql,/a.status IN \('received','under_review'\)/);assert.match(c.sql,/a.created_at>=\? AND a.created_at<\?/);assert.equal(c.args.length,2);}
 calls.length=0;await assert.rejects(service.list(actor,{from:'2027-02-29'}),e=>e.status===400);assert.equal(calls.length,0);
 await service.list(actor,{from:'2027-04-25',to:'2027-04-25'});for(const c of calls)assert.deepEqual(c.args,['2027-04-24 18:30:00','2027-04-25 18:30:00']);
});
