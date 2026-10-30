import test from 'node:test';import assert from 'node:assert/strict';
import {inspectUpdhanProvider} from '../provider-readiness.mjs';
test('read-only verification cannot send and incomplete template metadata fails closed',async()=>{
 const calls=[];const result=await inspectUpdhanProvider({env:{UPDHAN_FLOW_API_KEY:'synthetic',UPDHAN_FLOW_API_SECRET:'synthetic',UPDHAN_FLOW_CHANNEL_ID:'channel'},fetchImpl:async(url,options)=>{calls.push({url,options});return {ok:true,json:async()=>({success:true,data:url.endsWith('/account')?{channel:{id:'channel',isActive:true,healthStatus:'healthy'}}:[{name:'updhan_registration_received_v1',id:'provider-uuid',language:'hi',status:'APPROVED',category:'UTILITY'}]})};}});
 assert.equal(calls.length,2);assert.ok(calls.every(c=>c.options.method==='GET'&&!c.options.body&&!c.url.includes('/messages')));assert.equal(result.templateExact,false);assert.equal(result.sendingEnabled,false);assert.equal(result.rateBudgetVerified,false);
});
