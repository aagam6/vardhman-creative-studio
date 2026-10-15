import test from 'node:test';
import assert from 'node:assert/strict';
import {createApp} from '../app.mjs';
test('session restoration server failures carry a request reference and safe endpoint diagnostics',async()=>{
 const logs=[];const previous=console.error;console.error=value=>logs.push(value);
 const store={restoreSession:async()=>{throw Object.assign(new Error('private session cookie database password'),{errno:1205,sqlState:'HY000'});}};
 const server=createApp({store,config:{origin:'https://example.invalid'},staticDirectory:'.'}).listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
 try {
 const response=await fetch(`http://127.0.0.1:${server.address().port}/api/ayambil/admin/session`,{method:'POST',headers:{Origin:'https://example.invalid','Content-Type':'application/json'},body:'{}'});
 assert.equal(response.status,503);const log=JSON.parse(logs[0]);assert.equal(log.endpoint,'/admin/session');assert.equal(log.errno,1205);assert.equal(log.requestId,response.headers.get('x-request-id'));assert.doesNotMatch(logs.join(''),/private|cookie|password/);
 }finally {console.error=previous;await new Promise(r=>server.close(r));}
});
