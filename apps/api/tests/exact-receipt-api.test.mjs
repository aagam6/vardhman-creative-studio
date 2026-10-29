import test from 'node:test';
import assert from 'node:assert/strict';
import {createApp} from '../app.mjs';
import {ApiError} from '../config.mjs';
import {hash} from '../security.mjs';

test('exact receipt audit preserves auth, origin, CSRF and the existing two/minute limiter',async()=>{
 let observed=0,allowed=true;const limits=[];
 const store={session:async token=>{if(token!=='fixture')throw new ApiError(401,'Sign in required');return {admin_id:'synthetic-admin',csrf_hash:hash('synthetic-csrf')};},limit:async(bucket,max)=>(limits.push({bucket,max}),allowed)};
 const ids=['00000000-0000-4000-8000-000000000001'];
 const notifications={observeReceipts:async input=>{observed++;assert.deepEqual(input,{ids});return {items:[],writes:0,newSubmissions:0};},runOne:async()=>{throw Error('Send must not be called');}};
 const config={origin:'https://vardhmancreativestudio.com',rateSecret:'a'.repeat(64)};
 const server=createApp({store,config,notifications,staticDirectory:process.cwd()}).listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
 const url=`http://127.0.0.1:${server.address().port}/api/ayambil/admin/notification-outbox/observe-receipts`,headers={origin:config.origin,'content-type':'application/json',cookie:'__Host-ayambil=fixture','x-csrf-token':'synthetic-csrf'};
 try{
  for(const changed of [{origin:'https://example.invalid'},{cookie:''},{'x-csrf-token':''}]){const r=await fetch(url,{method:'POST',headers:{...headers,...changed},body:JSON.stringify({ids})});assert.ok([401,403].includes(r.status));}
  assert.equal(observed,0);
  let r=await fetch(url,{method:'POST',headers,body:JSON.stringify({ids,to:'forbidden'})});assert.equal(r.status,400);assert.equal(observed,0);
  r=await fetch(url,{method:'POST',headers,body:JSON.stringify({ids})});assert.equal(r.status,200);assert.equal((await r.json()).writes,0);assert.equal(observed,1);
  allowed=false;r=await fetch(url,{method:'POST',headers,body:JSON.stringify({ids})});assert.equal(r.status,429);assert.equal(observed,1);assert.ok(limits.every(r=>r.max===2));assert.equal(new Set(limits.map(r=>r.bucket)).size,1);
 }finally{await new Promise(r=>server.close(r));}
});
