import test from 'node:test';import assert from 'node:assert/strict';
import {inspectUpdhanProvider} from '../provider-readiness.mjs';
import {updhanWhatsappTemplate as t,verifyAcknowledgementTemplate} from '../whatsapp-contract.mjs';
test('verified flat provider schema binds UUID, channel, Meta identity and all content',()=>{
 const flat={id:'49bffc8a-734f-423b-85c8-0a1883732e08',channelId:'aa40827e-8239-49b0-bee4-3045bb3d95d7',whatsappTemplateId:t.metaId,name:t.name,language:'hi',category:'UTILITY',status:'APPROVED',mediaType:'text',header:t.header,body:t.body,footer:t.footer,buttons:[t.button]};
 assert.equal(verifyAcknowledgementTemplate(flat),true);
 for(const [key,value] of Object.entries({id:'other',channelId:'other',whatsappTemplateId:'other',body:'changed',header:'changed',footer:'changed',language:'en',status:'PENDING',mediaUrl:'https://example.com/photo',buttons:[]}))assert.equal(verifyAcknowledgementTemplate({...flat,[key]:value}),false,key);
});
test('read-only verification cannot send and incomplete template metadata fails closed',async()=>{
 const calls=[];const result=await inspectUpdhanProvider({env:{UPDHAN_FLOW_API_KEY:'synthetic',UPDHAN_FLOW_API_SECRET:'synthetic',UPDHAN_FLOW_CHANNEL_ID:'channel'},fetchImpl:async(url,options)=>{calls.push({url,options});return {ok:true,json:async()=>({success:true,data:url.endsWith('/account')?{channel:{id:'channel',isActive:true,healthStatus:'healthy'}}:[{name:'updhan_registration_received_v1',id:'provider-uuid',language:'hi',status:'APPROVED',category:'UTILITY'}]})};}});
 assert.equal(calls.length,2);assert.ok(calls.every(c=>c.options.method==='GET'&&!c.options.body&&!c.url.includes('/messages')));assert.equal(result.templateExact,false);assert.equal(result.sendingEnabled,false);assert.equal(result.rateBudgetVerified,false);
});
