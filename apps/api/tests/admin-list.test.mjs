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

test('collation bookings error is classified by errno without raw error text',async()=>{
 const logs=[],original=console.error;console.error=value=>logs.push(value);
 const store=createStore({execute:async()=>{const error=new TypeError('secret personal SQL details');error.code='private-unrecognized-value';error.errno=1267;error.sqlState='HY000';throw error;}},{});store.session=async()=>({});
 const server=createApp({store,config:{origin:'https://example.invalid'},staticDirectory:'.'}).listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
 try{const response=await fetch(`http://127.0.0.1:${server.address().port}/api/ayambil/admin/bookings`);assert.equal(response.status,503);assert.equal(response.headers.get('cache-control'),'no-store');const log=JSON.parse(logs[0]);assert.equal(log.code,'ER_CANT_AGGREGATE_2COLLATIONS');assert.equal(log.errno,1267);assert.equal(log.sqlState,'HY000');assert.equal(log.category,'TypeError');assert.equal(log.stage,'bookings.select');assert.equal(log.requestId,response.headers.get('x-request-id'));assert.doesNotMatch(logs.join(''),/secret|personal|private-unrecognized|SQL details/);assert.doesNotMatch(await response.text(),/HY000|1267|secret|personal/);}
 finally{console.error=original;await new Promise(r=>server.close(r));}
});
test('bookings diagnostics contain only generated correlation and safe stage/code',async()=>{
 const logs=[],original=console.error;console.error=value=>logs.push(value);
 const store=createStore({execute:async()=>{const error=new Error('private password cookie SQL parameter fixture');error.code='ER_BAD_FIELD_ERROR';throw error;}},{});store.session=async()=>({});
 const server=createApp({store,config:{origin:'https://example.invalid'},staticDirectory:'.'}).listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
 try{const res=await fetch(`http://127.0.0.1:${server.address().port}/api/ayambil/admin/bookings`);assert.equal(res.status,503);const log=JSON.parse(logs[0]);assert.equal(log.requestId,res.headers.get('x-request-id'));assert.equal(log.stage,'bookings.select');assert.equal(log.code,'ER_BAD_FIELD_ERROR');assert.doesNotMatch(logs.join(''),/private|password|cookie|parameter/);assert.equal(res.headers.get('cache-control'),'no-store');}finally{console.error=original;await new Promise(r=>server.close(r));}
});
test('unclassified bookings error retains safe numeric diagnostics without raw error text',async()=>{
 const logs=[],original=console.error;console.error=value=>logs.push(value);
 const store=createStore({execute:async()=>{const error=new TypeError('secret personal SQL details');error.code='private-unrecognized-value';error.errno=1105;error.sqlState='HY000';throw error;}},{});store.session=async()=>({});
 const server=createApp({store,config:{origin:'https://example.invalid'},staticDirectory:'.'}).listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
 try{const response=await fetch(`http://127.0.0.1:${server.address().port}/api/ayambil/admin/bookings`);assert.equal(response.status,503);assert.equal(response.headers.get('cache-control'),'no-store');const log=JSON.parse(logs[0]);assert.equal(log.code,'unclassified');assert.equal(log.errno,1105);assert.equal(log.sqlState,'HY000');assert.equal(log.category,'TypeError');assert.equal(log.stage,'bookings.select');assert.equal(log.requestId,response.headers.get('x-request-id'));assert.doesNotMatch(logs.join(''),/secret|personal|private-unrecognized|SQL details/);assert.doesNotMatch(await response.text(),/HY000|1105|secret|personal/);}
 finally{console.error=original;await new Promise(r=>server.close(r));}
});

test('driver pool saturation is classified without disclosing error text',async()=>{
 const logs=[],original=console.error;console.error=v=>logs.push(v);
 const store=createStore({execute:async()=>{throw Error('Queue limit reached.');}},{});store.session=async()=>({});
 const server=createApp({store,config:{origin:'https://example.invalid'},staticDirectory:'.'}).listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
 try{const r=await fetch('http://127.0.0.1:'+server.address().port+'/api/ayambil/admin/bookings');assert.equal(r.status,503);assert.equal(JSON.parse(logs[0]).code,'LOCAL_POOL_QUEUE_LIMIT');assert.doesNotMatch(logs.join(''),/Queue limit reached/);}finally{console.error=original;await new Promise(r=>server.close(r));}
});
