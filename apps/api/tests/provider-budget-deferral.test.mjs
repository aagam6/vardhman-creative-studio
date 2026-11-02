import test from 'node:test';import assert from 'node:assert/strict';import {createFlow} from '../vardhmanflow.mjs';import {startNotificationWorker} from '../notification-worker.mjs';
const env={VARDHMAN_FLOW_API_KEY:'fixture',VARDHMAN_FLOW_API_SECRET:'fixture',AYAMBIL_WHATSAPP_ENABLED:'true'};
const payload={to:'12025550123',templateName:'fixture',language:'en',components:[]};
test('one-use payload-bound reservation counts once and reserves before provider POST',async()=>{
 let allowed=true,reserved=0,posts=0;const f=createFlow(env,async(url,o)=>{assert.equal(o.method,'POST');posts++;return new Response(JSON.stringify({success:true,data:{messageId:'fixture-provider-id',status:'sent'}}),{headers:{'content-type':'application/json'}});},{reserveRequestBudget:async()=>{reserved++;return allowed;}});
 allowed=false;await assert.rejects(f.reserveTemplateSubmission(payload),e=>e.code==='LOCAL_FLOW_BUDGET');assert.equal(posts,0);
 allowed=true;const permit=await f.reserveTemplateSubmission(payload);allowed=false;assert.equal((await f.sendPrepared(payload,{reservation:permit})).status,'sent');assert.equal(posts,1);assert.equal(reserved,2);
 await assert.rejects(f.sendPrepared(payload,{reservation:permit}));assert.equal(posts,1);
 allowed=true;const other=await f.reserveTemplateSubmission(payload);await assert.rejects(f.sendPrepared({...payload,to:'12025550124'},{reservation:other}));await assert.rejects(f.sendPrepared(payload,{reservation:other}));assert.equal(posts,1);
 await assert.rejects(f.sendPrepared(payload,{reservation:{}}));assert.equal(posts,1);
});
test('read-only receipt budget/cooldown errors defer worker without stopping or submitting',async()=>{
 for(const code of ['LOCAL_FLOW_BUDGET','PROVIDER_COOLDOWN','PROVIDER_HTTP_429']){let tick,submits=0;const w=startNotificationWorker({owner:async()=>({owner:'bilingual',version:1}),reconcileNext:async()=>{throw Object.assign(Error('budget'),{code});},runOne:async()=>submits++},{notificationDispatch:true},{AYAMBIL_BILINGUAL_WORKER_ENABLED:'true',AYAMBIL_BILINGUAL_ACTIVATION_AT:'2026-10-27T07:28:06.000Z'},{schedule:f=>(tick=f,1),cancel:()=>{}});await tick();assert.equal(w.active,true);assert.equal(w.status().lastOutcome,'deferred');assert.equal(w.status().stopReason,null);assert.equal(submits,0);}
});
