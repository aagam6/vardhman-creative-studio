import test from 'node:test';import assert from 'node:assert/strict';import express from 'express';import {createUpdhanProductionRouter}from'../production-server.mjs';
test('export API requires same-origin authenticated CSRF session and private no-store response',async()=>{
 const csrf='c'.repeat(64),token='a'.repeat(64);let called=0;
 const pool={async execute(sql){if(sql.startsWith('SELECT hits'))return[[{hits:1}]];if(sql.startsWith('SELECT actor_id'))return[[{actor_id:'reviewer',roles:'["updhan_admin"]',csrf_token:csrf}]];return[{}];}};
 const app=express();app.use('/api/updhan',createUpdhanProductionRouter({pool,service:{exportApplications:async(actor,body)=>{assert.equal(actor.id,'reviewer');assert.deepEqual(body.ids,['id']);called++;return{items:[]};}},origin:'https://example.com',authenticate:async()=>null,rateSecret:'x'.repeat(32)}));
 const server=await new Promise(resolve=>{const s=app.listen(0,'127.0.0.1',()=>resolve(s));});
 try{const url=`http://127.0.0.1:${server.address().port}/api/updhan/admin/export-applications`,send=headers=>fetch(url,{method:'POST',headers:{Origin:'https://example.com','Content-Type':'application/json',...headers},body:JSON.stringify({ids:['id']})});
 assert.equal((await send({})).status,401);assert.equal((await send({Cookie:'__Host-updhan='+token})).status,403);const good=await send({Cookie:'__Host-updhan='+token,'X-CSRF-Token':csrf});assert.equal(good.status,200);assert.match(good.headers.get('cache-control'),/no-store/);assert.equal(called,1);
 }finally{await new Promise(r=>server.close(r));}
});
