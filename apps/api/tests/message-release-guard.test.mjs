import test from 'node:test';
import assert from 'node:assert/strict';
import {once} from 'node:events';
import {createApp} from '../app.mjs';
test('release send guard logs one 403 with request reference and never calls provider or store',async()=>{
 let calls=0;const rows=[],original=console.log;console.log=line=>{try{rows.push(JSON.parse(line));}catch{}};
 const app=createApp({config:{bookingControls:true,origin:'https://example.invalid'},store:new Proxy({},{get(){return ()=>{calls++;throw Error('unexpected store access');};}}),staticDirectory:'.',flow:{send(){calls++;}},queue:{runOne(){calls++;}}});
 const server=app.listen(0,'127.0.0.1');await once(server,'listening');
 try{const r=await fetch(`http://127.0.0.1:${server.address().port}/api/ayambil/admin/messages/send-selected`,{method:'POST'});assert.equal(r.status,403);assert.equal((await r.json()).errorCode,'BOOKING_CONTROLS_SEND_DISABLED');assert.match(r.headers.get('x-request-id'),/^[a-f0-9-]{36}$/);assert.match(r.headers.get('cache-control'),/no-store/);assert.equal(calls,0);assert.equal(rows.filter(x=>x.operation==='api.request'&&x.status===403).length,1);}finally{console.log=original;await new Promise(r=>server.close(r));}
});
