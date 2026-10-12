import test from 'node:test';
import assert from 'node:assert/strict';
import {createFlow,normalizePhone,templateMetadata} from '../vardhmanflow.mjs';
import {notificationTemplates} from '../notification-context.mjs';
const env={VARDHMAN_FLOW_API_KEY:'synthetic-key',VARDHMAN_FLOW_API_SECRET:'synthetic-secret',VARDHMAN_FLOW_CHANNEL_ID:'synthetic-channel'};
test('operator diagnostic returns only matching approved BODY definitions using GET',async()=>{
 const flow=createFlow(env,async(url,options)=>{
  assert.equal(options.method,'GET');
  const data=url.endsWith('/account')?{channel:{id:'synthetic-channel',isActive:true,healthStatus:'healthy',phoneNumber:'12025550123'}}:[{name:'ayambil_pass_ready',language:'en',status:'APPROVED',components:[{type:'BODY',text:'{{1}} {{2}}',secret:'excluded'}],secret:'excluded'},{name:'unrelated',language:'en',status:'APPROVED'}];
  return new Response(JSON.stringify({success:true,data}),{headers:{'Content-Type':'application/json'}});
 });
 const result=await flow.inspect({templateDefinitions:true});assert.equal(result.templates.length,1);assert.equal(result.templates[0].bodyAvailable,true);assert.deepEqual(result.templates[0].placeholderIndexes,[1,2]);assert.equal(result.templates[0].verified,false);assert.equal(result.templates[0].verification,'mapping_mismatch');assert.doesNotMatch(JSON.stringify(result),/excluded|synthetic-secret|\{\{1\}\}/);
});

test('template metadata fails closed for absent BODY, malformed slots, wrong language and unsafe mappings',async()=>{
 for(const [type,definition] of Object.entries(notificationTemplates)){
  const mapping={...definition,language:'en'};
  const template={name:definition.name,language:'en',status:'APPROVED',components:[{type:'BODY',text:definition.fields.map((_,i)=>`{{${i+1}}}`).join(' ')}]};
  assert.equal(templateMetadata(template,mapping).verified,true);assert.equal(templateMetadata(template,mapping).placeholderCount,definition.fields.length);
  assert.equal(templateMetadata({...template,components:undefined},mapping).verification,'approved_body_unavailable');
  for(const text of ['{{0}} {{1}}','{{1}} {{3}}','{{name}}','{{1}} {{2}} {{3}} {{4}}','{{1}} {{2}} {{3}} {{4}} {{5}} {{6}} {{7}}'])assert.equal(templateMetadata({...template,components:[{type:'BODY',text}]},mapping).verified,false);
  assert.equal(templateMetadata(template,{...mapping,language:'en_US'}).verified,false);
  assert.equal(templateMetadata(template,{...mapping,fields:[...mapping.fields].reverse()}).verified,false);
  assert.equal(templateMetadata({...template,components:[...template.components,{type:'BUTTONS'}]},mapping).verified,false);
 }
 let posts=0;const mapping={...notificationTemplates.confirmation,language:'en'};
 const flow=createFlow({...env,AYAMBIL_FLOW_TEMPLATE_MAPPINGS:JSON.stringify({confirmation:mapping})},async(url,options)=>{if(options.method!=='GET')posts++;return new Response(JSON.stringify({success:true,data:url.endsWith('/account')?{channel:{id:'synthetic-channel',isActive:true,healthStatus:'healthy',phoneNumber:'12025550123'}}:[{name:mapping.name,language:'en',status:'APPROVED'}]}),{headers:{'Content-Type':'application/json'}});});
 const inspected=await flow.inspect({templateDefinitions:true});assert.equal(inspected.templates[0].verified,false);assert.equal(inspected.templates[0].placeholderCount,null);
 await assert.rejects(flow.prepare('test',{}),e=>e.status===503);
 await assert.rejects(flow.sendPrepared({}),e=>e.status===403);assert.equal(posts,0);
});
test('Flow configuration, canonical prefix, server headers and sanitized channel/template inspection',async()=>{
 assert.equal(createFlow({}).configuration().configured,false);
 assert.equal(createFlow({...env,VARDHMAN_FLOW_BASE_URL:'https://vardhmanflow.com/api/v1/api/v1'}).configuration().configured,false);
 const urls=[];const client=createFlow(env,async(url,options)=>{urls.push(url);assert.equal(options.headers['X-API-Secret'],env.VARDHMAN_FLOW_API_SECRET);assert.equal(options.headers['X-Channel-Id'],env.VARDHMAN_FLOW_CHANNEL_ID);return new Response(JSON.stringify({success:true,data:url.endsWith('/account')?{channel:{id:'synthetic-channel',isActive:true,healthStatus:'healthy',phoneNumber:'+91 98765 43210'},secret:'never expose',usage:{requestCount:1}}:[{name:'synthetic',language:'en',status:'APPROVED'}]}),{headers:{'Content-Type':'application/json'}});});
 const result=await client.inspect();assert.deepEqual(urls,['https://vardhmanflow.com/api/v1/account','https://vardhmanflow.com/api/v1/templates?status=APPROVED']);assert.equal(result.sending,false);assert.equal(result.channel.phone,'919876543210');assert.equal(result.templates[0].componentsVerified,false);assert.doesNotMatch(JSON.stringify(result),/synthetic-secret|never expose/);
});
test('Flow rejects HTML, failures, invalid channel and phone; no mutation or false delivery',async()=>{
 for(const response of [new Response('html',{headers:{'Content-Type':'text/html'}}),new Response('{}',{status:401}),new Response(JSON.stringify({success:true,data:{channel:{id:'wrong',isActive:true,healthStatus:'healthy'}}}),{headers:{'Content-Type':'application/json'}})])await assert.rejects(createFlow(env,async()=>response).inspect());
 assert.equal(normalizePhone('9876543210'),'919876543210');assert.throws(()=>normalizePhone('invalid'));
 const flow=createFlow(env,async()=>{throw Error('sensitive diagnostics');});await assert.rejects(flow.inspect(),e=>!e.message.includes('sensitive'));
});
test('Flow verifies mapped body slots before POST and distinguishes sent from delivered',async()=>{
 const configured={...env,AYAMBIL_WHATSAPP_ENABLED:'true',AYAMBIL_FLOW_TEMPLATE_MAPPINGS:JSON.stringify({confirmation:{name:'ayambil_registration_confirm',language:'en',fields:['attendeeName','programme','eventDate','venue','venueLocationUrl']}})};
 const calls=[];const flow=createFlow(configured,async(url,options)=>{calls.push([url,options.method]);let data;if(url.endsWith('/account'))data={channel:{id:'synthetic-channel',isActive:true,healthStatus:'healthy',phoneNumber:'12025550123'}};else if(url.includes('/templates'))data=[{name:'ayambil_registration_confirm',status:'APPROVED',language:'en',components:[{type:'BODY',text:'Hello {{1}} {{2}} {{3}} {{4}} {{5}}'}]}];else if(url.endsWith('/messages/template')){assert.equal(JSON.parse(options.body).components[0].parameters[0].text,'Synthetic');data={messageId:'synthetic-id',status:'sent'};}else data={id:'synthetic-id',status:'delivered'};return new Response(JSON.stringify({success:true,data}),{headers:{'Content-Type':'application/json'}});});
 const payload=await flow.prepare('test',{to:'12025550123',attendeeName:'Synthetic',programme:'Synthetic programme',eventDate:'2026-11-02',venue:'Synthetic venue',venueLocationUrl:'https://maps.app.goo.gl/synthetic'});assert.equal((await flow.sendPrepared(payload)).status,'sent');assert.equal((await flow.messageStatus('synthetic-id')).status,'delivered');
 await assert.rejects(flow.prepare('confirmation',{to:'12025550123',contactName:'Synthetic'}));assert.equal(calls.filter(c=>c[1]==='POST').length,1);
});
