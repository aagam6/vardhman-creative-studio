import test from 'node:test';import assert from 'node:assert/strict';import {createApp} from '../app.mjs';import {ApiError} from '../config.mjs';import {hash} from '../security.mjs';
test('one late reminder authorization requires admin Origin CSRF and exact ID without recipient overrides',async()=>{
 let writes=0;const store={session:async t=>{if(t!=='fixture')throw new ApiError(401,'Sign in required');return{admin_id:'fixture-admin',csrf_hash:hash('fixture-csrf')};},limit:async()=>true};
 const notifications={authorizeLateReminder:async(id,actor)=>{assert.equal(id,'exact-fixture-id');assert.equal(actor.admin_id,'fixture-admin');writes++;return{sent:false,providerSubmissions:0};}};
 const origin='https://vardhmancreativestudio.com',server=createApp({store,notifications,config:{origin,rateSecret:'a'.repeat(64)},staticDirectory:process.cwd()}).listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
 const url=`http://127.0.0.1:${server.address().port}/api/ayambil/admin/notification-outbox/late-reminder-authorize`,headers={origin,'content-type':'application/json',cookie:'__Host-ayambil=fixture','x-csrf-token':'fixture-csrf'},body={id:'exact-fixture-id',confirmation:'AUTHORIZE ONE EVENT DAY REMINDER'};
 try{for(const missing of [{cookie:''},{origin:'https://invalid.example'},{'x-csrf-token':''}])assert.ok([401,403].includes((await fetch(url,{method:'POST',headers:{...headers,...missing},body:JSON.stringify(body)})).status));
 for(const b of [{...body,to:'override'},{...body,confirmation:'yes'},{...body,round:'new'}])assert.equal((await fetch(url,{method:'POST',headers,body:JSON.stringify(b)})).status,400);
 assert.equal(writes,0);const response=await fetch(url,{method:'POST',headers,body:JSON.stringify(body)});assert.equal(response.status,200);assert.deepEqual(await response.json(),{sent:false,providerSubmissions:0});assert.equal(writes,1);
 }finally{await new Promise(r=>server.close(r));}
});
