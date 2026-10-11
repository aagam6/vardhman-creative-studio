import test from 'node:test';
import assert from 'node:assert/strict';
import {createAyambilApi,supportedOperations} from '../src/lib/ayambilExpressClient.js';
test('explicit operation and method allowlist rejects arbitrary paths before transport',async()=>{
 const calls=[];const api=createAyambilApi(async(path,options)=>{calls.push({path,options});return Response.json(path.endsWith('/health')?{ready:true}:path.endsWith('/status')?{ready:true,open:false,whatsapp:'disabled'}:path.endsWith('/bookings')?{items:[],page:1,hasMore:false,integration:{ready:false,missing:[]}}:{});});
 for(const [path,methods] of Object.entries(supportedOperations))for(const method of methods){try{await api.request(path,{method});}catch(error){assert.notEqual(error.message,'Invalid API operation');}}
 assert.equal(calls.length,Object.values(supportedOperations).flat().length);
 const before=calls.length;
 for(const path of ['../admin/bookings','admin/../bookings','admin/messages/unknown','/admin/bookings','admin/bookings?x=1','admin%2fbookings','constructor',''])await assert.rejects(api.request(path),/Invalid API operation/);
 for(const [path,method] of [['admin/bookings','POST'],['admin/messages/test','GET'],['admin/login','PUT'],['health','get']])await assert.rejects(api.request(path,{method}),/Invalid API operation/);
 assert.equal(calls.length,before);
});
test('empty bookings succeed; safe HTTP errors preserve status without echoing server data',async()=>{
 const empty={items:[],page:1,hasMore:false,integration:{ready:false,missing:[]}};
 assert.deepEqual(await createAyambilApi(async()=>Response.json(empty)).request('admin/bookings'),empty);
 for(const status of [401,403,500,503])await assert.rejects(createAyambilApi(async()=>Response.json({error:'private fixture'},{status})).request('admin/bookings'),error=>error.status===status&&!error.message.includes('private fixture')&&([401,403].includes(status)?error.message.includes('authentication'):error.message.includes(String(status))));
 await assert.rejects(createAyambilApi(async()=>Response.json({...empty,page:'1'})).request('admin/bookings'),/Invalid bookings response/);
});
