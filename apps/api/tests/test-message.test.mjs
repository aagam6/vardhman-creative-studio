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
test('test API preserves CSRF, server recipient, approved preflight and exact job; normal send denied',async()=>{
 const csrf='a'.repeat(64),id='11111111-1111-4111-8111-111111111111',calls=[];
 const store={session:async()=>({csrf_hash:hash(csrf)}),limit:async()=>true,enqueueTest:async(queue,item)=>{calls.push(item);return id;}};
 const flow={prepare:async(type,context)=>{calls.push({preparedType:type,context});return {};}};
 let processed=0;const queue={runTest:async job=>{assert.equal(job,id);processed++;return {processed:true,status:'sent'};}};
 const app=createApp({store,flow,queue,testRecipient:'+12025550123',config:{origin:'https://example.invalid',rateSecret:'synthetic-rate-secret-at-least-32-characters'},staticDirectory:'.'});const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
 const request=(path,body={},token=csrf)=>fetch(`http://127.0.0.1:${server.address().port}/api/ayambil/admin/messages/`+path,{method:'POST',headers:{Origin:'https://example.invalid','Content-Type':'application/json','X-CSRF-Token':token},body:JSON.stringify(body)});
 try{
  const body={eventDate:programme.sessions[0].date,requestKey:'b'.repeat(64),to:'19999999999'};
  assert.equal((await request('test',body,'invalid')).status,403);assert.equal(calls.length,0);
  const queued=await request('test',body);assert.equal(queued.status,200,queued.status===200?'':await queued.text());assert.equal((await queued.json()).id,id);assert.equal(calls.length,2);assert.equal(calls[0].preparedType,'test');assert.equal(calls[0].context.to,'12025550123');assert.equal(calls[0].context.attendeeName,'Authorized operator test');assert.equal(calls[0].context.venueLocationUrl,programme.sessions[0].mapsUrl);
  assert.equal((await request('process')).status,403);assert.equal(processed,0);
  assert.equal((await request('process-test',{id},'invalid')).status,403);assert.equal(processed,0);
  assert.equal((await request('process-test',{id})).status,200);assert.equal(processed,1);
 }finally{await new Promise(r=>server.close(r));}
});
