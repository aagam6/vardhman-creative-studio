import test from 'node:test';
import assert from 'node:assert/strict';
import {createApp} from '../app.mjs';
import {ApiError} from '../config.mjs';
import {hash} from '../security.mjs';
test('subject preparation retains authentication, Origin, CSRF and the shared ten/minute preparation bucket',async()=>{
 let prepares=0;const limits=[];const subject='11111111-2222-4333-8444-555555555555';
 const store={bookingControls:{},session:async token=>{if(token!=='fixture')throw new ApiError(401,'Sign in required');return {admin_id:'synthetic-admin',csrf_hash:hash('synthetic-csrf')};},limit:async(bucket,max)=>{limits.push({bucket,max});return true;}};
 const notifications={owner:async()=>({owner:'paused',version:1}),list:async()=>({items:[],page:1,hasMore:false}),intents:async()=>[],prepareSubject:async(input,actor,controls)=>{prepares++;assert.deepEqual(input,{purpose:'pass_link',subject});assert.equal(actor.admin_id,'synthetic-admin');assert.equal(controls,store.bookingControls);return {id:subject,sent:false};},enqueueHeldIntent:async()=>subject};
 const config={origin:'https://vardhmancreativestudio.com',rateSecret:'a'.repeat(64)};
 const app=createApp({store,config,notifications,staticDirectory:process.cwd()});const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));const base=`http://127.0.0.1:${server.address().port}/api/ayambil/admin/notification-outbox/`;
 const headers={origin:config.origin,'content-type':'application/json',cookie:'__Host-ayambil=fixture','x-csrf-token':'synthetic-csrf'};
 try{
  let read=await fetch(base.slice(0,-1));assert.equal(read.status,401);read=await fetch(base.slice(0,-1),{headers:{cookie:headers.cookie}});assert.equal(read.status,200);assert.deepEqual((await read.json()).transactionalWorker,{enabled:false,active:false});assert.equal(prepares,0);
  for(const changed of [{origin:'https://example.invalid'},{cookie:''},{'x-csrf-token':''}]){const r=await fetch(base+'prepare-subject',{method:'POST',headers:{...headers,...changed},body:JSON.stringify({purpose:'pass_link',subject})});assert.ok([401,403].includes(r.status));}
  assert.equal(prepares,0);
  let r=await fetch(base+'prepare-subject',{method:'POST',headers,body:JSON.stringify({purpose:'pass_link',subject,to:'forbidden override'})});assert.equal(r.status,400);assert.equal(prepares,0);
  r=await fetch(base+'prepare-subject',{method:'POST',headers,body:JSON.stringify({purpose:'pass_link',subject})});assert.deepEqual(await r.json(),{id:subject,sent:false});assert.equal(prepares,1);
  await fetch(base+'prepare',{method:'POST',headers,body:JSON.stringify({id:subject})});assert.equal(limits.at(-1).bucket,limits.at(-2).bucket);assert.ok(limits.every(x=>x.max===10));
 }finally{await new Promise(r=>server.close(r));}
});
