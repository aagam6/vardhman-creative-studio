import test from 'node:test';import assert from 'node:assert/strict';import {createApp} from '../app.mjs';import {ApiError} from '../config.mjs';import {hash} from '../security.mjs';
test('live-update review/preparation require Origin, admin, CSRF; recipient overrides rejected and no sending route is called',async()=>{
 let prepares=0,reviews=0;const limits=[];const store={session:async token=>{if(token!=='fixture')throw new ApiError(401,'Sign in required');return {admin_id:'synthetic-admin',csrf_hash:hash('synthetic-csrf')};},limit:async(bucket,max)=>{limits.push({bucket,max});return true;}};
 const notifications={liveUpdateAudience:async()=>{reviews++;return {items:[],sent:false};},prepareLiveUpdate:async()=>{prepares++;return {id:'synthetic',sent:false};}};
 const origin='https://vardhmancreativestudio.com',server=createApp({store,notifications,config:{origin,rateSecret:'a'.repeat(64)},staticDirectory:process.cwd()}).listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));const base=`http://127.0.0.1:${server.address().port}/api/ayambil/admin/notification-outbox/`,headers={origin,'content-type':'application/json',cookie:'__Host-ayambil=fixture','x-csrf-token':'synthetic-csrf'};
 try{for(const path of ['live-update-audience','live-update-prepare']){for(const changed of [{origin:'https://evil.invalid'},{cookie:''},{'x-csrf-token':''}])assert.ok([401,403].includes((await fetch(base+path,{method:'POST',headers:{...headers,...changed},body:'{}'})).status));assert.equal((await fetch(base+path,{method:'POST',headers,body:JSON.stringify({to:'forbidden'})})).status,400);}
 assert.equal(prepares,0);assert.equal(reviews,0);
 assert.equal((await fetch(base+'live-update-audience',{method:'POST',headers,body:JSON.stringify({eventDate:'2026-11-03',videoId:'h0XA0A99zDE'})})).status,200);assert.equal(reviews,1);
 assert.equal((await fetch(base+'live-update-prepare',{method:'POST',headers,body:JSON.stringify({subject:'fixture',videoId:'h0XA0A99zDE'})})).status,200);assert.equal(prepares,1);assert.equal(limits.at(-1).max,10);
 }finally{await new Promise(r=>server.close(r));}
});
