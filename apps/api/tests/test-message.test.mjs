import test from 'node:test';
import assert from 'node:assert/strict';
import {createMessageQueue,canVerifyProviderStatus} from '../message-queue.mjs';
test('queue metadata reveals eligibility only and missing reference remains 409 without provider call',async()=>{
 let touched=false;const raw={id:'synthetic',notification_type:'test',status:'queued',attempts:1,provider_id:null};
 const pool={query:async()=>[[raw]],execute:async()=>[[raw]]};const queue=createMessageQueue(pool,{messageStatus:async()=>{touched=true;}},{AYAMBIL_WHATSAPP_ENABLED:'true',AYAMBIL_QUEUE_ENCRYPTION_KEY:'a'.repeat(64)});
 const list=await queue.list();assert.equal(list[0].canVerifyProviderStatus,false);assert.equal(list[0].provider_id,undefined);await assert.rejects(queue.reconcile('synthetic'),e=>e.status===409);assert.equal(touched,false);
 for(const status of ['accepted','sent','delivered','read','failed','uncertain'])assert.equal(canVerifyProviderStatus({status,provider_id:'synthetic'}),true);
 for(const status of ['queued','preparing','sending','cancelled'])assert.equal(canVerifyProviderStatus({status,provider_id:'synthetic'}),false);
});

import {createApp} from '../app.mjs';
import {hash} from '../security.mjs';
import {programme} from '../config.mjs';
test('production and incomplete staging hide test controls and deny both operations without queue/provider access',async()=>{
 const csrf='a'.repeat(64);let touched=0;
 for(const config of [{origin:'https://vardhmancreativestudio.com',stagingBuild:false},{origin:'https://vardhmancreativestudio.com',stagingBuild:true},{origin:'https://white-reindeer-590806.hostingersite.com',stagingBuild:false}]){
  const server=createApp({config,staticDirectory:'.',testRecipient:'12025550123',store:{session:async()=>({csrf_hash:hash(csrf)}),limit:async()=>{touched++;return true;},enqueueTest:async()=>{touched++;}},queue:{runTest:async()=>{touched++;}},flow:{configuration:()=>({configured:true}),prepare:async()=>{touched++;}}}).listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
  try{
   const root=`http://127.0.0.1:${server.address().port}/api/ayambil/admin/`;
   assert.equal((await(await fetch(root+'whatsapp')).json()).testSendingAvailable,false);
   for(const path of ['messages/test','messages/process-test']){
    const response=await fetch(root+path,{method:'POST',headers:{Origin:config.origin,'Content-Type':'application/json','X-CSRF-Token':csrf},body:'{}'});
    assert.equal(response.status,403);assert.equal(response.headers.get('cache-control'),'no-store');assert.equal((await response.json()).errorCode,'STAGING_TEST_ONLY');
   }
  }finally{await new Promise(r=>server.close(r));}
 }
 assert.equal(touched,0);
});
test('test API preserves CSRF, server recipient, approved preflight and exact job; normal send denied',async()=>{
 const csrf='a'.repeat(64),id='11111111-1111-4111-8111-111111111111',calls=[];
 const store={session:async()=>({csrf_hash:hash(csrf)}),limit:async()=>true,enqueueTest:async(queue,item)=>{calls.push(item);return id;}};
 const flow={prepare:async(type,context)=>{calls.push({preparedType:type,context});return {};}};
 let processed=0;const queue={runTest:async job=>{assert.equal(job,id);processed++;return {processed:true,status:'sent'};}};
 const app=createApp({store,flow,queue,testRecipient:'+12025550123',config:{stagingBuild:true,origin:'https://white-reindeer-590806.hostingersite.com',rateSecret:'synthetic-rate-secret-at-least-32-characters'},staticDirectory:'.'});const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
 const request=(path,body={},token=csrf)=>fetch(`http://127.0.0.1:${server.address().port}/api/ayambil/admin/messages/`+path,{method:'POST',headers:{Origin:'https://white-reindeer-590806.hostingersite.com','Content-Type':'application/json','X-CSRF-Token':token},body:JSON.stringify(body)});
 try{
  const body={eventDate:programme.sessions[0].date,requestKey:'b'.repeat(64),to:'19999999999'};
  assert.equal((await request('test',body,'invalid')).status,403);assert.equal(calls.length,0);
  const queued=await request('test',body);assert.equal(queued.status,200,queued.status===200?'':await queued.text());assert.equal((await queued.json()).id,id);assert.equal(calls.length,2);assert.equal(calls[0].preparedType,'test');assert.equal(calls[0].context.to,'12025550123');assert.equal(calls[0].context.attendeeName,'Authorized operator test');assert.equal(calls[0].context.venueLocationUrl,programme.sessions[0].mapsUrl);
  assert.equal((await request('process')).status,403);assert.equal(processed,0);
  assert.equal((await request('process-test',{id},'invalid')).status,403);assert.equal(processed,0);
  assert.equal((await request('process-test',{id})).status,200);assert.equal(processed,1);
  flow.compatibilityContext=()=>({compatibilityTest:true,testEventDate:'2026-11-02',to:'12025550123'});
  assert.equal((await request('test',body)).status,200);
  assert.equal((await request('test',{...body,requestKey:'c'.repeat(64)})).status,200);
  const compatibilityJobs=calls.filter(c=>c.context?.compatibilityTest&&c.dedupe);
  assert.equal(compatibilityJobs.length,2);assert.equal(compatibilityJobs[0].dedupe,'staging-body-compatibility-v1');assert.equal(compatibilityJobs[1].dedupe,compatibilityJobs[0].dedupe);
 }finally{await new Promise(r=>server.close(r));}
});
