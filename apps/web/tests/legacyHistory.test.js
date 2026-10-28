import test from 'node:test';import assert from 'node:assert/strict';
import {createAyambilApi} from '../src/lib/ayambilExpressClient.js';
test('history UI transport supports exact no-send audit/resolution only',async()=>{
 const calls=[];const api=createAyambilApi(async(url,options)=>{calls.push({url,options});return new Response(JSON.stringify({items:[],noSend:true}),{status:200,headers:{'content-type':'application/json'}});});
 await api.request('admin/legacy-history');await api.request('admin/legacy-history/resolve',{method:'POST',body:{ids:['fixture']}});
 assert.equal(calls.length,2);assert.match(calls[0].url,/^\/api\/ayambil\/admin\/legacy-history\?_fresh=/);assert.equal(calls[1].options.method,'POST');assert.equal(calls[1].url,'/api/ayambil/admin/legacy-history/resolve');assert.equal(calls.every(x=>x.options.cache==='no-store'),true);
 for(const [path,method] of [['admin/legacy-history','POST'],['admin/legacy-history/resolve','GET'],['admin/legacy-history/send','POST']])await assert.rejects(api.request(path,{method}),/Invalid API operation/);
 assert.equal(calls.length,2);
});
