import test from 'node:test';import assert from 'node:assert/strict';
import {createApp} from '../app.mjs';import {ApiError} from '../config.mjs';
test('pending audit is authenticated GET only and does not invoke preparation, sends or polling',async()=>{
 let audits=0;const forbidden=()=>{throw Error('Mutation/provider path must never be used');};
 const store={session:async token=>{if(token!=='fixture')throw new ApiError(401,'Sign in required');return{admin_id:'synthetic'};}};
 const notifications={owner:async()=>({owner:'bilingual',version:54}),pendingAudit:async()=>{audits++;return{items:[],total:0,noSend:true,providerCalls:0};},list:forbidden,intents:forbidden,enqueue:forbidden,runOne:forbidden,reconcile:forbidden};
 const server=createApp({store,notifications,config:{origin:'https://vardhmancreativestudio.com'},staticDirectory:process.cwd()}).listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
 const url=`http://127.0.0.1:${server.address().port}/api/ayambil/admin/notification-outbox?audit=pending`;
 try{assert.equal((await fetch(url)).status,401);assert.equal(audits,0);const r=await fetch(url,{headers:{cookie:'__Host-ayambil=fixture'}});assert.equal(r.status,200);assert.match(r.headers.get('cache-control'),/no-store/);const data=await r.json();assert.equal(data.pendingAudit.noSend,true);assert.equal(data.pendingAudit.providerCalls,0);assert.equal(data.owner.version,54);assert.equal(audits,1);assert.equal((await fetch(url,{method:'POST',headers:{origin:'https://vardhmancreativestudio.com'}})).status,404);assert.equal(audits,1);}finally{await new Promise(r=>server.close(r));}
});
