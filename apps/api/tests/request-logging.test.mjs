import test from 'node:test';
import assert from 'node:assert/strict';
import {createApp} from '../app.mjs';

test('API request logs cover successful, denied, malformed and unmatched requests without private fields',async()=>{
 const entries=[];const previous=console.log;console.log=line=>entries.push(JSON.parse(line));
 const app=createApp({store:{status:async()=>({ready:true,open:true,whatsapp:'disabled'}),session:async()=>{throw Object.assign(new Error('denied'),{status:401});}},config:{origin:'https://example.invalid'},staticDirectory:'.'});
 const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));const root=`http://127.0.0.1:${server.address().port}/api/ayambil`;
 try {
 const response=await fetch(root+'/status?mobile=private-phone',{headers:{Cookie:'private-cookie'}});await response.text();
 const malformed=await fetch(root+'/register',{method:'POST',headers:{Origin:'https://example.invalid','Content-Type':'application/json'},body:'{private-body'});await malformed.text();
 const missing=await fetch(root+'/private-pass-secret');await missing.text();
 assert.equal(entries.length,3);assert.equal(entries[0].endpoint,'/status');assert.equal(entries[0].status,200);assert.equal(entries[0].requestId,response.headers.get('x-request-id'));assert.equal(entries[1].status,400);assert.equal(entries[2].endpoint,'unmatched');assert.equal(entries[2].status,404);
 assert.ok(entries.every(e=>Number.isInteger(e.durationMs)&&e.durationMs>=0));assert.doesNotMatch(JSON.stringify(entries),/private|mobile|Cookie/);
 }finally{console.log=previous;await new Promise(r=>server.close(r));}
});
