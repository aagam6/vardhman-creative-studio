import test from 'node:test';
import assert from 'node:assert/strict';
import {createAyambilApi} from '../src/lib/ayambilExpressClient.js';
test('selected manual message uses POST with session CSRF and exact identifiers',async()=>{
 const calls=[];const csrf='a'.repeat(64),body={id:'synthetic-job',bookingId:'synthetic-booking',type:'confirmation'};
 const api=createAyambilApi(async(url,options)=>{calls.push({url,options});return Response.json(url.includes('session')?{authenticated:true,csrfToken:csrf}:{processed:true,status:'accepted'});});
 await api.restore();assert.equal((await api.request('admin/messages/send-selected',{method:'POST',body})).status,'accepted');
 assert.equal(calls[1].options.headers['X-CSRF-Token'],csrf);assert.deepEqual(JSON.parse(calls[1].options.body),body);assert.equal(calls[1].options.cache,'no-store');
 await assert.rejects(api.request('admin/messages/send-selected'),/Invalid API operation/);
});
