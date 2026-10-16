import test from 'node:test';
import assert from 'node:assert/strict';
import {createMessageQueue,normalQueuePolicy,queueCrypto} from '../message-queue.mjs';
import {startQueueWorker} from '../queue-worker.mjs';
const approved={AYAMBIL_WHATSAPP_ENABLED:'true',AYAMBIL_QUEUE_ENCRYPTION_KEY:'a'.repeat(64),AYAMBIL_WHATSAPP_NORMAL_PROCESSING_APPROVED:'true',AYAMBIL_WHATSAPP_QUEUE_OWNER:'express-mysql',AYAMBIL_WHATSAPP_AUTOMATION_START_AT:'2026-10-13T00:00:00.000Z',AYAMBIL_WHATSAPP_AUTO_WORKER_ENABLED:'true'};
test('execution approval and staging-test isolation fail before database access',async()=>{
 let touched=0;const pool={getConnection:async()=>{touched++;throw Error();}};
 for(const env of [{...approved,AYAMBIL_WHATSAPP_NORMAL_PROCESSING_APPROVED:'false'},{...approved,AYAMBIL_WHATSAPP_QUEUE_OWNER:''},{...approved,AYAMBIL_WHATSAPP_AUTOMATION_START_AT:''}])await assert.rejects(createMessageQueue(pool,{},env).runOne(),e=>e.status===403);
 await assert.rejects(createMessageQueue(pool,{},approved).runOne('a'.repeat(36)),e=>e.status===403);
 assert.equal(touched,0);assert.equal(normalQueuePolicy(approved),'2026-10-13 00:00:00.000');
});
test('worker defaults off, never sends at startup, serializes ticks and pauses after uncertainty',async()=>{
 let ticks,cancels=0,sends=0,release;
 const queue={reconcileFresh:async()=>({blocked:false}),runOne:async()=>{sends++;await new Promise(r=>release=r);return {status:'uncertain'};}};
 const schedule=callback=>{ticks=callback;return 1;},cancel=()=>cancels++;
 assert.equal(startQueueWorker(queue,{}).enabled,false);
 startQueueWorker(queue,approved,{schedule,cancel});assert.equal(sends,0);
 const first=ticks();await new Promise(r=>setImmediate(r));await ticks();assert.equal(sends,1);release();await first;await ticks();assert.equal(sends,1);assert.equal(cancels,1);
});
test('existing uncertain intent pauses before any new send; worker logs only constants',async()=>{
 let tick,sends=0;const logs=[];
 startQueueWorker({reconcileFresh:async()=>({blocked:true}),runOne:async()=>sends++},approved,{schedule:cb=>{tick=cb;return 1;},cancel:()=>{},log:s=>logs.push(s)});
 await tick();assert.equal(sends,0);assert.deepEqual(logs,['Express message worker paused: manual reconciliation required.']);
});
test('normal selection is bounded to fresh consented bookings, never old/tests/prior attempts',async()=>{
 let sql,args,sends=0;const db={beginTransaction:async()=>{},commit:async()=>{},rollback:async()=>{},release(){},execute:async(s,a)=>{sql=s;args=a;return [[]];}};
 const queue=createMessageQueue({getConnection:async()=>db},{sendPrepared:async()=>sends++},approved);
 assert.deepEqual(await queue.runOne(),{processed:false});assert.match(sql,/q.attempts=0/);assert.match(sql,/q.provider_id IS NULL/);assert.match(sql,/b.whatsapp_consent=TRUE/);assert.match(sql,/b.status='active'/);assert.match(sql,/b.created_at>=\?/);assert.match(sql,/q.updated_at>=\?/);assert.match(sql,/'confirmation','pass','reminder'/);assert.doesNotMatch(sql,/'test'|'admin'/);assert.deepEqual(args,['2026-10-13 00:00:00.000','2026-10-13 00:00:00.000']);assert.equal(sends,0);
});
test('pass preflight accepts alphanumeric capability only for the same booking and saved recipient',async()=>{
 const id='11111111-1111-4111-8111-111111111111',key='AbZ9'.repeat(16);let sends=0,capabilityChecked=false;const statements=[];
 const context={to:'+12025550123',eventDate:'2026-11-02',passLink:'https://example.invalid/passes#'+key};
 const job={id:'synthetic-job',booking_id:id,notification_type:'pass',attempts:0,payload:queueCrypto(approved.AYAMBIL_QUEUE_ENCRYPTION_KEY).seal(context)};
 const execute=async(sql,args)=>{statements.push(sql);if(sql.startsWith('SELECT q.*'))return [[job]];if(sql.startsWith('SELECT contact_name'))return [[{contact_name:'Synthetic Contact',mobile:'+12025550123',event_date:'2026-11-02'}]];if(sql.startsWith('SELECT p.id')){assert.match(sql,/a.booking_id=\?/);assert.match(sql,/c.revoked_at IS NULL/);assert.match(sql,/c.expires_at>/);assert.equal(args[0],id);capabilityChecked=true;return [[{id:'synthetic-pass'}]];}if(sql.startsWith('SELECT status,whatsapp_consent'))return [[{status:'active',whatsapp_consent:1,mobile:'+12025550123',event_date:'2026-11-02'}]];return [[]];};
 const db={execute,beginTransaction:async()=>{},commit:async()=>{},rollback:async()=>{},release(){}};
 const queue=createMessageQueue({execute,getConnection:async()=>db},{prepare:async()=>({}),sendPrepared:async()=>{assert.ok(statements.some(s=>s.includes("status='sending'")));sends++;return {id:'synthetic-provider',status:'sent'};}},{...approved,AYAMBIL_SITE_ORIGIN:'https://example.invalid'});
 assert.equal((await queue.runOne()).status,'sent');assert.equal(capabilityChecked,true);assert.equal(sends,1);
});
test('wrong saved recipient/evening and expired capability never reach provider POST',async()=>{
 let sends=0;
 for(const mode of ['recipient','evening','capability']){
  const context={to:mode==='recipient'?'12025550999':'+12025550123',eventDate:mode==='evening'?'2026-11-03':'2026-11-02',...(mode==='capability'?{passLink:'https://example.invalid/passes#'+'AbZ9'.repeat(16)}:{})};
  const job={id:'synthetic-job',booking_id:'synthetic-booking',notification_type:'confirmation',attempts:0,payload:queueCrypto(approved.AYAMBIL_QUEUE_ENCRYPTION_KEY).seal(context)};
  const writes=[];const execute=async(sql)=>{if(sql.startsWith('SELECT q.*'))return [[job]];if(sql.startsWith('SELECT p.id'))return [[]];if(sql.startsWith('SELECT status,whatsapp_consent'))return [[{status:'active',whatsapp_consent:1,mobile:'+12025550123',event_date:'2026-11-02'}]];writes.push(sql);return [[]];};
  const db={execute,beginTransaction:async()=>{},commit:async()=>{},rollback:async()=>{},release(){}};
  const queue=createMessageQueue({execute,getConnection:async()=>db},{prepare:async()=>{throw Error('should not prepare');},sendPrepared:async()=>sends++},approved);
  assert.equal((await queue.runOne()).status,mode==='capability'?'cancelled':'preflight_failed');assert.equal(writes.some(sql=>sql.includes("status='sending'")),false);
 }
 assert.equal(sends,0);
});
test('uncertainty lookup is independent of bounded reconciliation pages',async()=>{
 let queries=0;
 const queue=createMessageQueue({execute:async sql=>{queries++;assert.match(sql,/q.status IN \('preparing','sending','uncertain'\)/);assert.match(sql,/LIMIT 1/);return [[{id:'synthetic-uncertain'}]];}},{},approved);
 assert.deepEqual(await queue.reconcileFresh(),{blocked:true});assert.equal(queries,1);
});
