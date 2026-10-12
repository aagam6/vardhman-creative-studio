import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createApp} from '../app.mjs';
test('listener starts with pending initialization, health changes 503 to 200 only after readiness',async()=>{
 const source=readFileSync(new URL('../server.mjs',import.meta.url),'utf8');
 assert.ok(source.indexOf('app.listen(port,host)')<source.indexOf('await hostingerBootstrap'));
 assert.doesNotMatch(source.slice(0,source.indexOf('app.listen(port,host)')),/\bawait\b/);
 let initialized=false,ready=false;
 const app=createApp({store:{ready:async()=>ready},config:{origin:'https://example.invalid'},staticDirectory:'.',isInitialized:()=>initialized});
 const start=performance.now();const server=app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));assert.ok(performance.now()-start<3000);
 try{const url=`http://127.0.0.1:${server.address().port}/api/ayambil/health`;
 let response=await fetch(url);assert.equal(response.status,503);assert.equal(response.headers.get('cache-control'),'no-store');
 initialized=true;response=await fetch(url);assert.equal(response.status,503);
 ready=true;response=await fetch(url);assert.equal(response.status,200);assert.deepEqual(await response.json(),{ready:true});
 }finally{await new Promise(resolve=>server.close(resolve));}
});
