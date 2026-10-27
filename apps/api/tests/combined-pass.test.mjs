import test from 'node:test';
import assert from 'node:assert/strict';
import {createFlow} from '../vardhmanflow.mjs';
import {notificationTemplates} from '../notification-context.mjs';
import {reviewedTemplateBodies} from '../reviewed-template-bodies.mjs';
import {combinedPassPayload} from '../combined-pass-notification.mjs';
import {programme} from '../config.mjs';
const definition={id:'11111111-2222-4333-8444-555555555555',name:'ayambil_pass_ready',language:'en',status:'APPROVED',category:'UTILITY',components:[{type:'BODY',text:reviewedTemplateBodies.ayambil_pass_ready}]};
const env={VARDHMAN_FLOW_API_KEY:'synthetic',VARDHMAN_FLOW_API_SECRET:'synthetic',VARDHMAN_FLOW_CHANNEL_ID:'test-channel',AYAMBIL_FLOW_TEMPLATE_MAPPINGS:JSON.stringify({pass:{...notificationTemplates.pass,language:'en'}}),AYAMBIL_SITE_ORIGIN:'https://vardhmancreativestudio.com',AYAMBIL_PRODUCTION_TEMPLATE_POLICY:'ayambil-en-2026-10-13-v1'};
const make=(t=definition,extra={})=>createFlow({...env,...extra},async(url,options)=>{assert.equal(options.method,'GET');return new Response(JSON.stringify({success:true,data:url.endsWith('/account')?{channel:{id:'test-channel',isActive:true,healthStatus:'healthy'}}:[t]}),{headers:{'content-type':'application/json'}});});
test('standalone pass uses approved Utility/en/provider UUID and exact reviewed BODY',async()=>{
 const r=await make().verifyCombinedPass();assert.equal(r.providerTemplateId,definition.id);assert.equal(r.source,'provider');assert.equal(r.category,'UTILITY');
 const omitted={...definition};delete omitted.components;assert.equal((await make(omitted).verifyCombinedPass()).source,'operator_reviewed_snapshot');
 for(const t of [{...definition,id:'123456789'},{...definition,language:'en_US'},{...definition,status:'PENDING'},{...definition,category:'MARKETING'},{...definition,components:[]},{...definition,components:[{type:'BODY',text:'wrong'}]},{...definition,components:[...definition.components,{type:'HEADER',text:'unreviewed'}]}])await assert.rejects(make(t).verifyCombinedPass());
 await assert.rejects(make(omitted,{AYAMBIL_PRODUCTION_TEMPLATE_POLICY:''}).verifyCombinedPass());await assert.rejects(make(definition,{AYAMBIL_FLOW_TEMPLATE_MAPPINGS:'{}'}).verifyCombinedPass());await assert.rejects(make(definition,{VARDHMAN_FLOW_CHANNEL_ID:'wrong'}).verifyCombinedPass());
});
test('standalone payload is one existing six-position pass template with canonical combined URL',()=>{
 const p=combinedPassPayload({session:programme.sessions[0],source:{contactName:'SYNTHETIC FAMILY',mobile:'12025550123'},subject:'11111111-2222-4333-8444-555555555555',key:'a'.repeat(64),origin:'https://vardhmancreativestudio.com'});
 assert.equal(p.name,'ayambil_pass_ready');assert.equal(p.language.code,'en');assert.equal(p.components.length,1);assert.equal(p.components[0].parameters.length,6);assert.equal(p.components[0].parameters[0].text,'SYNTHETIC FAMILY');assert.match(p.components[0].parameters[5].text,/^https:\/\/vardhmancreativestudio.com\/500-akhand-ayambil-vijayollas\/passes#/);
 assert.throws(()=>combinedPassPayload({session:programme.sessions[0],source:{contactName:'SYNTHETIC',mobile:'12025550123'},subject:'11111111-2222-4333-8444-555555555555',key:'a'.repeat(64),origin:'https://example.invalid'}));
});
