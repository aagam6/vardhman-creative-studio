import test from 'node:test';
import assert from 'node:assert/strict';
import {createMessageQueue,manualQueuePolicy,queueCrypto} from '../message-queue.mjs';
import {productionSnapshotsApproved,productionTemplatePolicy} from '../production-template-policy.mjs';
import {templateMetadata} from '../vardhmanflow.mjs';
import {notificationTemplates} from '../notification-context.mjs';
import {createApp} from '../app.mjs';
import {hash} from '../security.mjs';
import {ApiError} from '../config.mjs';
import {tmpdir} from 'node:os';
const env={AYAMBIL_WHATSAPP_ENABLED:'true',AYAMBIL_QUEUE_ENCRYPTION_KEY:'a'.repeat(64),AYAMBIL_SITE_ORIGIN:'https://vardhmancreativestudio.com',AYAMBIL_PRODUCTION_TEMPLATE_POLICY:productionTemplatePolicy.version,AYAMBIL_WHATSAPP_MANUAL_PROCESSING_APPROVED:'true',AYAMBIL_WHATSAPP_QUEUE_OWNER:'express-mysql',AYAMBIL_WHATSAPP_MANUAL_START_AT:'2026-10-13T00:00:00.000Z',AYAMBIL_WHATSAPP_NORMAL_PROCESSING_APPROVED:'false'};
const selected={id:'11111111-1111-4111-8111-111111111111',bookingId:'22222222-2222-4222-8222-222222222222',type:'confirmation'};
test('batch preview is read-only, masked, exact evening/type and excludes attempted or blocked bookings',async()=>{
 let calls=0;
 const pool={execute:async(sql,args)=>{
  calls++;assert.ok(sql.startsWith('SELECT'));
  for(const guard of ['q.attempts=0','q.provider_id IS NULL',"q.status='queued'",'b.whatsapp_consent=TRUE',"b.status='active'",'NOT EXISTS',"'preparing','sending','uncertain'",'LIMIT 1001'])assert.ok(sql.includes(guard));
  assert.deepEqual(args.slice(0,2),['confirmation','2026-11-02']);
  if(args.length===4)assert.ok(sql.includes('b.created_at>=?'));else assert.ok(!sql.includes('b.created_at>=?'));
  return [[{id:selected.id,booking_id:selected.bookingId,notification_type:'confirmation',number:'SYNTHETIC-BOOKING',mobile:'+12025550123'}]];
 }};
 const queue=createMessageQueue(pool,{},env);
 const result=await queue.previewBatch({type:'confirmation',date:'2026-11-02'});
 assert.equal(result.items[0].recipientMasked,'••••0123');assert.ok(!JSON.stringify(result).includes('12025550123'));
 await queue.previewBatch({type:'confirmation',date:'2026-11-02',reviewedLegacy:true});
 await assert.rejects(queue.previewBatch({type:'test',date:'2026-11-02'}),e=>e.status===400);
 assert.equal(calls,2);
 const disabled=createMessageQueue(pool,{}, {...env,AYAMBIL_WHATSAPP_MANUAL_PROCESSING_APPROVED:'false'});
 await assert.rejects(disabled.previewBatch({type:'confirmation',date:'2026-11-02'}),e=>e.status===403);assert.equal(calls,2);
});
test('manual policy is independent, production-only, versioned and default-off',()=>{
 assert.equal(manualQueuePolicy(env),'2026-10-13 00:00:00.000');
 for(const patch of [{AYAMBIL_WHATSAPP_MANUAL_PROCESSING_APPROVED:'false'},{AYAMBIL_WHATSAPP_QUEUE_OWNER:''},{AYAMBIL_STAGING_BUILD:'true'},{AYAMBIL_WHATSAPP_AUTO_WORKER_ENABLED:'true'},{AYAMBIL_WHATSAPP_NORMAL_PROCESSING_APPROVED:'true'},{AYAMBIL_PRODUCTION_TEMPLATE_POLICY:'unknown'},{AYAMBIL_WHATSAPP_MANUAL_START_AT:''},{AYAMBIL_WHATSAPP_TEST_BODY_OVERRIDE:'true'}])assert.throws(()=>manualQueuePolicy({...env,...patch}));
});
test('production snapshots validate omitted BODY mappings, reject malformed components, locale and unknown templates',()=>{
 const options={operatorSnapshots:productionSnapshotsApproved(env),requireReviewedBodies:true};
 for(const mapping of Object.values(notificationTemplates)){
  const t={name:mapping.name,language:'en',status:'APPROVED'},m={...mapping,language:'en'};
  assert.equal(templateMetadata(t,m,options).bodySource,'operator_reviewed_snapshot');assert.equal(templateMetadata(t,m,options).verified,true);
  assert.equal(templateMetadata({...t,components:[]},m,options).verified,false);
  assert.equal(templateMetadata({...t,components:[{type:'BODY',text:m.fields.map((_,i)=>`{{${i+1}}}`).join(' ')}]},m,options).verified,false);
  assert.equal(templateMetadata({...t,language:'en_US'},m,options).verified,false);
  assert.equal(templateMetadata(t,{...m,fields:[...m.fields].reverse()},options).verified,false);
 }
 assert.equal(templateMetadata({name:'unknown',language:'en',status:'APPROVED'},{},options).verified,false);
});
test('selected send claims exact eligible job once; persists intent; timeout refuses retry',async()=>{
 let status='queued',posts=0;const statements=[];
 const job={id:selected.id,booking_id:selected.bookingId,notification_type:'confirmation',payload:queueCrypto(env.AYAMBIL_QUEUE_ENCRYPTION_KEY).seal({to:'+12025550123',eventDate:'2026-11-02'})};
 const execute=async(sql,args)=>{
  statements.push(sql);
  if(sql.startsWith('SELECT q.*')){assert.deepEqual(args,[selected.id,selected.bookingId,selected.type,'2026-10-13 00:00:00.000','2026-10-13 00:00:00.000']);for(const clause of ['q.attempts=0','q.provider_id IS NULL',"b.status='active'",'b.whatsapp_consent=TRUE','b.created_at>=?','q.updated_at>=?'])assert.ok(sql.includes(clause));return [status==='queued'?[job]:[]];}
  if(sql.startsWith('SELECT id'))return [[]];
  if(sql.startsWith('SELECT status'))return [[{status:'active',whatsapp_consent:1,mobile:'+12025550123',event_date:'2026-11-02'}]];
  if(sql.includes("status='preparing'"))status='preparing';if(sql.includes("status='sending'"))status='sending';if(sql.includes("status='uncertain'"))status='uncertain';return [[]];
 };
 const db={execute,beginTransaction:async()=>{},commit:async()=>{},rollback:async()=>{},release(){}};
 const queue=createMessageQueue({execute,getConnection:async()=>db},{prepare:async()=>({}),sendPrepared:async()=>{assert.equal(status,'sending');posts++;throw Error('mock timeout');}},env);
 assert.equal((await queue.runSelected(selected)).status,'uncertain');assert.equal(posts,1);
 await assert.rejects(queue.runSelected(selected),e=>e.status===409);assert.equal(posts,1);
 await assert.rejects(queue.runSelected({...selected,type:'test'}),e=>e.status===400);
});
test('disabled manual send never accesses database',async()=>{
 let touched=false;const q=createMessageQueue({getConnection:async()=>{touched=true;}},{},{...env,AYAMBIL_WHATSAPP_MANUAL_PROCESSING_APPROVED:'false'});
 await assert.rejects(q.runSelected(selected),e=>e.status===403);assert.equal(touched,false);
});
test('exact reviewed older job bypasses only date boundary; in-flight booking and attempts stay protected',async()=>{
 let blocked=false,posts=0,claimed=false;
 const job={id:selected.id,booking_id:selected.bookingId,notification_type:'confirmation',payload:queueCrypto(env.AYAMBIL_QUEUE_ENCRYPTION_KEY).seal({to:'+12025550123',eventDate:'2026-11-02'})};
 const execute=async(sql,args)=>{
  if(sql.startsWith('SELECT q.*')) {
   for(const clause of ['q.id=?','q.booking_id=?','q.notification_type=?',"q.status='queued'",'q.attempts=0','q.provider_id IS NULL',"b.status='active'",'b.whatsapp_consent=TRUE','FOR UPDATE'])assert.ok(sql.includes(clause));
   if(sql.includes('b.created_at>=?'))return [[]];
   assert.deepEqual(args,[selected.id,selected.bookingId,selected.type]);return [[job]];
  }
  if(sql.startsWith('SELECT id'))return [blocked?[{id:'in-flight'}]:[]];
  if(sql.startsWith('SELECT status'))return [[{status:'active',whatsapp_consent:1,mobile:'+12025550123',event_date:'2026-11-02'}]];
  if(sql.includes("status='preparing'"))claimed=true;
  return [[]];
 };
 const db={execute,beginTransaction:async()=>{},commit:async()=>{},rollback:async()=>{},release(){}};
 const queue=createMessageQueue({execute,getConnection:async()=>db},{prepare:async()=>({}),sendPrepared:async()=>{posts++;return {status:'accepted',id:'synthetic-provider-id'};}},env);
 await assert.rejects(queue.runSelected(selected),e=>e.status===409);assert.equal(posts,0);
 await assert.rejects(queue.runSelected({...selected,reviewedLegacy:'true'}),e=>e.status===400);
 blocked=true;await assert.rejects(queue.runSelected({...selected,reviewedLegacy:true}),e=>e.status===409);assert.equal(claimed,false);assert.equal(posts,0);
 blocked=false;assert.equal((await queue.runSelected({...selected,reviewedLegacy:true})).status,'accepted');assert.equal(posts,1);
});
test('manual endpoint requires session, exact origin, CSRF, rate limit and identifiers only',async()=>{
 let sends=0,limited=false;const csrf='synthetic-csrf';
 const store={session:async token=>{if(token!=='synthetic-session')throw new ApiError(401,'Unauthorized');return {csrf_hash:hash(csrf)};},limit:async()=>!limited};
 const server=createApp({store,staticDirectory:tmpdir(),config:{origin:env.AYAMBIL_SITE_ORIGIN,rateSecret:'synthetic-rate'},queue:{runSelected:async body=>{assert.deepEqual(body,selected);sends++;return {status:'accepted'};}}}).listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
 const url=`http://127.0.0.1:${server.address().port}/api/ayambil/admin/messages/send-selected`;
 const request=(patch={},body=selected)=>fetch(url,{method:'POST',headers:{origin:env.AYAMBIL_SITE_ORIGIN,cookie:'__Host-ayambil=synthetic-session','x-csrf-token':csrf,'content-type':'application/json',...patch},body:JSON.stringify(body)});
 try{
  assert.equal((await request({cookie:''})).status,401);assert.equal((await request({origin:'https://example.invalid'})).status,403);assert.equal((await request({'x-csrf-token':'wrong'})).status,403);
  limited=true;assert.equal((await request()).status,429);limited=false;
  assert.equal((await request({}, {...selected,to:'browser-override'})).status,400);assert.equal(sends,0);
  const response=await request();assert.equal(response.status,200);assert.equal(response.headers.get('cache-control'),'no-store');assert.equal(sends,1);
 }finally{await new Promise(r=>server.close(r));}
});
