import test from 'node:test';
import assert from 'node:assert/strict';
import {createFlow,normalizePhone,templateMetadata,testBodyOverrideApproved} from '../vardhmanflow.mjs';
import {notificationTemplates} from '../notification-context.mjs';
import {reviewedTemplateBodies} from '../reviewed-template-bodies.mjs';
import catalog from '../bilingual-template-catalog.json' with {type:'json'};
const env={VARDHMAN_FLOW_API_KEY:'synthetic-key',VARDHMAN_FLOW_API_SECRET:'synthetic-secret',VARDHMAN_FLOW_CHANNEL_ID:'synthetic-channel'};
test('bilingual inspector and sender share strict full-definition checks with only GET calls',async()=>{
 const definitions=catalog.map((t,i)=>({id:`11111111-2222-4333-8444-${String(i+1).padStart(12,'0')}`,name:t.name,language:t.languageCode,status:'APPROVED',category:'UTILITY',components:[{type:'HEADER',text:t.header},{type:'BODY',text:t.body},...(t.button?[{type:'BUTTONS',buttons:[{type:'URL',text:t.button,url:t.dynamicUrl}]}]:[])]}));
 let calls=0;
 const makeFlow=()=>createFlow(env,async(url,options)=>{calls++;assert.equal(options.method,'GET');return new Response(JSON.stringify({success:true,data:url.endsWith('/account')?{channel:{id:'synthetic-channel',isActive:true,healthStatus:'healthy',phoneNumber:'12025550123'}}:definitions}),{headers:{'Content-Type':'application/json'}});});let flow=makeFlow();
 let result=await flow.inspect({templateDefinitions:true});assert.equal(calls,2);assert.equal(result.bilingualTemplates.length,6);assert.ok(result.bilingualTemplates.every(t=>t.verified));assert.equal(result.channel.configuredIdMatched,true);
 for(const t of catalog)assert.equal((await flow.verifyBilingual(t)).verified,true);
 const original=structuredClone(definitions[0]);
 for(const [mutate,field] of [[t=>delete t.components,'components.missing'],[t=>t.id='wrong','id'],[t=>t.name='wrong','template.missing'],[t=>t.language='en_US','language'],[t=>t.status='PENDING','status'],[t=>t.category='MARKETING','category'],[t=>t.components[0].text='wrong','HEADER.text'],[t=>t.components[1].text='wrong','BODY.text'],[t=>t.components.push({...t.components[1]}),'BODY.count'],[t=>t.components.push({type:'FOOTER',text:'secret'}),'components.unsupported'],[t=>t.components.push({type:'BUTTONS',buttons:[{type:'URL',text:'wrong',url:'https://example.invalid/secret'}]}),'CTA.count']]){
  flow=makeFlow();definitions[0]=structuredClone(original);mutate(definitions[0]);result=await flow.inspect({templateDefinitions:true});assert.ok(result.bilingualTemplates[0].issues.includes(field),field);await assert.rejects(flow.verifyBilingual(catalog[0]),e=>e.status===503&&e.message.includes(field));assert.doesNotMatch(JSON.stringify(result),/synthetic-secret|example.invalid|secret|\{\{1\}\}/);
 }
 definitions[0]=original;definitions[0].components.find(c=>c.type==='BUTTONS').buttons[0].url='wrong';await assert.rejects(flow.verifyBilingual(catalog[0]),/CTA.url/);
});
test('operator snapshot fallback preserves exact mapping, provenance and fails closed for explicit components',async()=>{
 const options={operatorSnapshots:true},mappings={};
 for(const [type,definition] of Object.entries(notificationTemplates)){
  const mapping={...definition,language:'en'};mappings[type]=mapping;
  const template={name:definition.name,language:'en',status:'APPROVED'};
  const result=templateMetadata(template,mapping,options);assert.equal(result.verified,true);assert.equal(result.bodySource,'operator_reviewed_snapshot');assert.equal(result.componentsVerified,false);assert.deepEqual(result.placeholderIndexes,definition.fields.map((_,i)=>i+1));
  assert.equal(templateMetadata(template,{...mapping,fields:[...mapping.fields].reverse()},options).verified,false);
  for(const components of [undefined,null,[],[null],[{type:'HEADER',text:'text'}],[{type:'BODY'}],[{type:'BODY',text:'{{1}} {{1}} {{2}} {{3}} {{4}} {{5}}'}],[{type:'BODY',text:'{{2}} {{1}} {{3}} {{4}} {{5}}'}]])assert.equal(templateMetadata({...template,components},mapping,options).verified,false);
  assert.equal(templateMetadata({...template,status:'PENDING'},mapping,options).verified,false);assert.equal(templateMetadata({...template,language:'en_US'},{...mapping,language:'en_US'},options).verified,false);
  assert.equal(templateMetadata({...template,components:[{type:'BODY',text:reviewedTemplateBodies[template.name]}]},mapping,options).bodySource,'provider');
 }
 assert.equal(mappings.pass.fields[5],'passLink');assert.match(reviewedTemplateBodies.ayambil_pass_ready,/Download your digital pass:\n\{\{6\}\}/);
 const staging={...env,AYAMBIL_STAGING_BUILD:'true',AYAMBIL_SITE_ORIGIN:'https://white-reindeer-590806.hostingersite.com',AYAMBIL_WHATSAPP_TEST_BODY_OVERRIDE:'false',AYAMBIL_WHATSAPP_NORMAL_PROCESSING_APPROVED:'false',AYAMBIL_FLOW_TEMPLATE_MAPPINGS:JSON.stringify(mappings)};
 let posts=0;const fetcher=async(url,options)=>{if(options.method==='POST')posts++;return new Response(JSON.stringify({success:true,data:url.endsWith('/account')?{channel:{id:'synthetic-channel',isActive:true,healthStatus:'healthy',phoneNumber:'12025550123'}}:Object.values(mappings).map(m=>({name:m.name,language:'en',status:'APPROVED'}))}),{headers:{'Content-Type':'application/json'}});};
 const context={to:'12025550123',attendeeName:'Synthetic',programme:'Synthetic',eventDate:'2026-11-02',venue:'Synthetic',venueLocationUrl:'https://example.invalid',passLink:'https://example.invalid/private-synthetic'};
 const flow=createFlow(staging,fetcher);for(const type of Object.keys(mappings))assert.equal((await flow.prepare(type,context)).components[0].parameters.length,mappings[type].fields.length);
 const bad=createFlow({...staging,AYAMBIL_FLOW_TEMPLATE_MAPPINGS:JSON.stringify({...mappings,confirmation_03:{...mappings.confirmation,fields:['invalid']}})},fetcher);assert.equal((await bad.inspect()).templates.find(t=>t.name===mappings.confirmation.name).verified,false);await assert.rejects(bad.prepare('confirmation',context));
 await assert.rejects(createFlow({...staging,AYAMBIL_FLOW_TEMPLATE_MAPPINGS:'null'},fetcher).prepare('confirmation',context),e=>e.status===503);
 await assert.rejects(createFlow({...staging,AYAMBIL_SITE_ORIGIN:'https://vardhmancreativestudio.com'},fetcher).prepare('confirmation',context),e=>e.status===503);assert.equal(posts,0);
});
test('BODY compatibility override is staging-only, test-only and uses synthetic values and server recipient',async()=>{
 const mapping={...notificationTemplates.confirmation,language:'en'};
 const configured={...env,AYAMBIL_WHATSAPP_ENABLED:'true',AYAMBIL_WHATSAPP_TEST_BODY_OVERRIDE:'true',AYAMBIL_STAGING_BUILD:'true',AYAMBIL_SITE_ORIGIN:'https://white-reindeer-590806.hostingersite.com',AYAMBIL_WHATSAPP_TEST_RECIPIENT:'12025550123',AYAMBIL_FLOW_TEMPLATE_MAPPINGS:JSON.stringify({confirmation:mapping})};
 for(const unsafe of [{AYAMBIL_STAGING_BUILD:'false'},{AYAMBIL_SITE_ORIGIN:'https://vardhmancreativestudio.com'},{AYAMBIL_WHATSAPP_NORMAL_PROCESSING_APPROVED:'true'}])assert.throws(()=>testBodyOverrideApproved({...configured,...unsafe}),e=>e.status===403);
 assert.equal(testBodyOverrideApproved({...configured,AYAMBIL_WHATSAPP_TEST_BODY_OVERRIDE:'false'}),false);
 let posts=0;const flow=createFlow(configured,async(url,options)=>{if(options.method==='POST')posts++;return new Response(JSON.stringify({success:true,data:url.endsWith('/account')?{channel:{id:'synthetic-channel',isActive:true,healthStatus:'healthy',phoneNumber:'12025550123'}}:url.includes('/templates')?[{name:mapping.name,language:'en',status:'APPROVED'}]:{messageId:'synthetic-reference',status:'sent'}}),{headers:{'Content-Type':'application/json'}});});
 const context=flow.compatibilityContext('2026-11-02');assert.deepEqual(Object.keys(context).sort(),['compatibilityTest','testEventDate','to']);
 const payload=await flow.prepare('test',context);assert.equal(payload.to,configured.AYAMBIL_WHATSAPP_TEST_RECIPIENT);assert.equal(payload.templateName,mapping.name);assert.equal(payload.language,'en');assert.deepEqual(payload.components[0].parameters,mapping.fields.map((_,i)=>({type:'text',text:`TEST VALUE ${i+1}`})));assert.equal(posts,0);
 await assert.rejects(flow.prepare('confirmation',context),e=>e.status===403);await assert.rejects(flow.prepare('test',{...context,to:'19999999999'}),e=>e.status===403);
 await assert.rejects(flow.prepare('confirmation',{to:context.to,eventDate:'2026-11-02'}),e=>e.status===503);
 const denied=createFlow(configured,async()=>new Response('{}',{status:400}));await assert.rejects(denied.sendPrepared(payload),e=>e.providerRejected===400&&!e.message.includes('secret'));
});
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
 const result=await client.inspect();assert.deepEqual(urls,['https://vardhmanflow.com/api/v1/account','https://vardhmanflow.com/api/v1/templates?status=APPROVED']);assert.equal(result.sending,false);assert.equal(result.channel.phoneConfigured,true);assert.equal(result.channel.phone,undefined);assert.doesNotMatch(JSON.stringify(result),/919876543210/);assert.equal(result.templates[0].componentsVerified,false);assert.doesNotMatch(JSON.stringify(result),/synthetic-secret|never expose/);
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
