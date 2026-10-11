import test from 'node:test';
import assert from 'node:assert/strict';
import {createApp} from '../app.mjs';
import {createStore} from '../store.mjs';
import {ApiError} from '../config.mjs';
test('empty store list contract and authenticated disabled WhatsApp config remain JSON no-store',async()=>{
 const store=createStore({execute:async()=>[[]]},{});
 const empty=await store.list({});assert.deepEqual(empty,{items:[],page:1,hasMore:false,integration:{ready:false,missing:['WhatsApp sending disabled']}});
 store.session=async token=>{if(token!=='synthetic-session')throw new ApiError(401,'Administrator sign-in required');return {};};
 const app=createApp({store,config:{origin:'https://example.invalid'},staticDirectory:'.'});
 const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));const base=`http://127.0.0.1:${server.address().port}/api/ayambil`;
 try{for(const path of ['/admin/bookings','/admin/whatsapp']){
 const denied=await fetch(base+path);assert.equal(denied.status,401);assert.equal(denied.headers.get('cache-control'),'no-store');assert.match(denied.headers.get('content-type'),/json/);
 const response=await fetch(base+path,{headers:{cookie:'__Host-ayambil=synthetic-session'}});assert.equal(response.status,200);assert.equal(response.headers.get('cache-control'),'no-store');assert.match(response.headers.get('content-type'),/json/);const body=await response.json();if(path.endsWith('bookings'))assert.deepEqual(body,empty);else assert.equal(body.sending,false);
 }}finally{await new Promise(r=>server.close(r));}
});
