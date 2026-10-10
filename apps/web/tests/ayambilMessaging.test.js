import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { createHash, randomBytes } from 'node:crypto';
const require = createRequire(import.meta.url);
const messaging = require('../../pocketbase/pb_hooks/ayambil/messaging.cjs');
const flow = require('../../pocketbase/pb_hooks/ayambil/vardhmanflow.cjs');
const config = require('../../pocketbase/pb_hooks/ayambil/config.json');
const values = { AYAMBIL_FLOW_API_KEY:'test-only',AYAMBIL_FLOW_API_SECRET:'test-only',AYAMBIL_FLOW_CHANNEL_ID:'test-channel',AYAMBIL_FLOW_API_PREFIX:'/api/v1',AYAMBIL_FLOW_TEMPLATE_02:'event_02',AYAMBIL_FLOW_TEMPLATE_03:'event_03',AYAMBIL_FLOW_LANGUAGE_02:'en',AYAMBIL_FLOW_LANGUAGE_03:'en',AYAMBIL_FLOW_PARAMETERS_02:'["confirmationDetails"]',AYAMBIL_FLOW_PARAMETERS_03:'["confirmationDetails"]',AYAMBIL_PUBLIC_SITE_URL:'https://example.invalid',AYAMBIL_DEPLOYMENT_VERIFIED:'true',AYAMBIL_FLOW_TEMPLATES_VERIFIED:'true' };
const env = key => values[key] || '';
test('two attendees receive separate opaque private links in one confirmation',()=>{
  const keys=['a'.repeat(64),'b'.repeat(64)];
  const result=messaging.payload({eventDate:'2026-11-03',mobile:'+12025550123',attendees:[{fullName:'Synthetic First'},{fullName:'Synthetic Second'}]},keys,env);
  const text=result.components[0].parameters[0].text;
  for(const key of keys)assert.ok(text.includes('/passes#'+key));
  assert.ok(text.includes('3 November 2026'));assert.ok(text.includes('Tagore Hall'));
  assert.equal(result.templateName,'event_03');
});
globalThis.$os = {getenv:env};
globalThis.$security = {sha256:v=>createHash('sha256').update(v).digest('hex'),randomString:n=>randomBytes(n).toString('hex').slice(0,n)};
globalThis.BadRequestError=Error;
class Row { constructor(id,data){this.id=id;this.data=data;} getString(k){return String(this.data[k]||'');} getBool(k){return this.data[k]===true;}getInt(k){return Number(this.data[k]||0);}getStringSlice(k){return this.data[k]||[];}set(k,v){this.data[k]=v;} }
function fixture(date='2026-11-02') {
  const b=new Row('b',{number:'BOOK26-test',event_date:date,contact_name:'Test Contact',mobile:'+919876543210',status:'active',whatsapp_consent:true});
  const m=new Row('m',{booking:'b',status:'queued',download_key:'x'.repeat(64),download_expires:new Date(Date.now()+86400000).toISOString()});
  const a=new Row('a',{booking:'b',full_name:'Test Attendee',dates:[date],status:'active'});
  const p=new Row('p',{attendee:'a',status:'active',snapshot:JSON.stringify({number:'AYV26-test',attendeeName:'Test Attendee',eventName:config.eventName,sessions:config.sessions.filter(s=>s.date===date)})});
  const tables={ayambil_bookings:[b],ayambil_messages:[m],ayambil_attendees:[a],ayambil_passes:[p]};
  const app={runInTransaction:fn=>fn(app),save:()=>{},findRecordById:(table,id)=>tables[table].find(r=>r.id===id),findFirstRecordByFilter:table=>tables[table][0],findRecordsByFilter:(table,filter,sort,limit,offset,params)=>{if(table==='ayambil_messages'&&params?.ref)return tables[table].filter(r=>r.getString('provider_ref')===params.ref);if(table==='ayambil_messages'&&filter.includes('status = \"queued\"'))return tables[table].filter(r=>['queued','sending'].includes(r.getString('status')));return tables[table];}};
  return {app,b,m};
}
const templates=['02','03'].map(day=>({name:'event_'+day,language:'en',status:'APPROVED',components:[{type:'BODY',text:'Registration confirmed: {{1}}'}]}));
function provider(sendMessage) { return options=>{
  if (options.url.endsWith('/account')) return {statusCode:200,json:{success:true,data:{channel:{id:'test-channel',isActive:true,healthStatus:'healthy'}}}};
  if (options.url.includes('/templates?')) return {statusCode:200,json:{success:true,data:templates}};
  return sendMessage(options);
}; }
test('registration stays closed without verified VardhmanFlow configuration',()=>{
 assert.equal(messaging.settings(()=> '').ready,false);assert.equal(messaging.settings(env).ready,true);
 assert.equal(messaging.settings(k=>k==='AYAMBIL_DEPLOYMENT_VERIFIED'?'false':env(k)).ready,false);
 assert.equal(messaging.settings(k=>k==='AYAMBIL_FLOW_TEMPLATES_VERIFIED'?'false':env(k)).ready,false);
});
test('read-only account discovery resolves documented prefix and stops on authorization failures',()=>{
 let calls=0;const discovered=flow.discover(options=>{calls++;return options.url.includes('/api/v1/api/v1/')?{statusCode:200,json:{success:true,data:{channel:{id:'test'}}}}:{statusCode:404,json:{}};},env);
 assert.equal(discovered.prefix,'/api/v1/api/v1');assert.equal(calls,2);
 assert.throws(()=>flow.discover(()=>({statusCode:401,json:{success:false}}),env));
 assert.throws(()=>flow.url('https://untrusted.invalid','account'));
 assert.equal(flow.headers(env)['X-API-Key'],'test-only');assert.equal(flow.headers(env)['Authorization'],undefined);
 assert.equal(flow.headers(k=>k==='AYAMBIL_FLOW_CHANNEL_ID'?'':env(k))['X-Channel-Id'],undefined);
});
test('approved templates require actual language, body component count and explicit mapping',()=>{
 assert.deepEqual(flow.preflight(provider(()=>assert.fail()),env),{'02':['confirmationDetails'],'03':['confirmationDetails']});
 for(const change of [{status:'PENDING'},{language:'gu'},{components:undefined},{components:[{type:'BODY',text:'{{1}} {{2}}'}]},{components:[{type:'BODY',text:'{{2}}'}]},{components:[{type:'HEADER',format:'DOCUMENT'},{type:'BODY',text:'{{1}}'}]}]) assert.throws(()=>flow.validateTemplate({...templates[0],...change},env,'02'));
 assert.throws(()=>flow.preflight(provider(()=>assert.fail()),k=>k==='AYAMBIL_FLOW_CHANNEL_ID'?'other':env(k)));
});
test('VardhmanFlow payload uses saved single-event details and private pass link',()=>{
 for(const date of ['2026-11-02','2026-11-03']){
  const session=config.sessions.find(s=>s.date===date);const payload=messaging.payload({eventDate:date,mobile:'+919876543210',attendees:[{fullName:'Test Attendee'}]},'x'.repeat(64),env);
  assert.equal(payload.templateName,date.endsWith('02')?'event_02':'event_03');assert.equal(payload.to,'919876543210');assert.equal(payload.language,'en');assert.equal(payload.messaging_product,undefined);
  const text=payload.components[0].parameters.map(p=>p.text).join(' ');assert.ok(text.includes(session.label)&&text.includes(session.venue)&&text.includes(session.programme));
  assert.ok(!text.includes(date.endsWith('02')?'Tagore Hall':'Chandramauleshwar'));assert.ok(text.includes('/passes#'));assert.ok(!text.includes('9876543210'));
 }
});
test('actual provider acknowledgment, sent, delivery, rejection and delayed responses differ',()=>{
 for(const status of ['sent','delivered','read','failed']) assert.equal(messaging.classify({statusCode:200,json:{success:true,data:{messageId:'uuid-test',status}}}).status,status);
 assert.equal(messaging.classify({statusCode:200,json:{success:true,data:{messageId:'uuid-test',status:'queued'}}}).status,'accepted');
 assert.equal(messaging.classify({statusCode:200,json:{success:false,error:'Rejected'}}).status,'failed');
 assert.equal(messaging.classify({statusCode:400,json:{success:false}}).status,'failed');
 for(const statusCode of [200,408,500])assert.equal(messaging.classify({statusCode,json:{}}).status,'uncertain');
 assert.equal(flow.status({statusCode:200,json:{success:true,data:{id:'other',status:'delivered'}}},'uuid-test'),null);
});
test('worker sends only once; authenticated polling records delivery without regressions',()=>{
 const {app,m}=fixture();let sends=0;
 const send=provider(options=>{sends++;assert.ok(options.url.endsWith('/messages/template'));return {statusCode:200,json:{success:true,data:{messageId:'uuid-test',status:'sent'}}};});
 messaging.process(app,send);messaging.process(app,send);assert.equal(sends,1);assert.equal(m.getString('provider_ref'),'uuid-test');assert.equal(m.getString('status'),'sent');
 messaging.poll(app,options=>{assert.ok(options.url.endsWith('/messages/status/uuid-test'));assert.equal(options.headers['X-API-Key'],'test-only');return {statusCode:200,json:{success:true,data:{id:'uuid-test',status:'delivered',deliveredAt:'2026-10-10T12:00:00Z'}}};});
 assert.equal(m.getString('status'),'delivered');
 for(const status of ['sent','failed']) messaging.applyStatus(app,'m',{status,ref:'uuid-test',failure:''});assert.equal(m.getString('status'),'delivered');
 messaging.poll(app,()=>{throw new Error('timeout');});assert.equal(m.getString('status'),'delivered');
 messaging.applyStatus(app,'m',{status:'read',ref:'wrong',failure:''});assert.equal(m.getString('status'),'delivered');
});
test('network uncertainty, worker crash and consent never trigger automatic resending',()=>{
 const {app,m}=fixture();let calls=0;const send=provider(()=>{calls++;throw new Error('timeout');});
 messaging.process(app,send);messaging.process(app,send);assert.equal(calls,1);assert.equal(m.getString('status'),'uncertain');
 const noConsent=fixture();noConsent.b.set('whatsapp_consent',false);messaging.process(noConsent.app,provider(()=>assert.fail('No consent must never send')));assert.equal(noConsent.m.getString('status'),'cancelled');
 const crashed=fixture();crashed.m.set('status','sending');crashed.m.set('attempted_at',new Date(Date.now()-180000).toISOString());messaging.process(crashed.app,provider(()=>assert.fail('Do not resend')));assert.equal(crashed.m.getString('status'),'uncertain');
});
test('failed preflight leaves queue unsent; no webhook handler remains',()=>{
 const {app,m}=fixture();assert.throws(()=>messaging.process(app,()=>({statusCode:401,json:{success:false}})));assert.equal(m.getString('status'),'queued');assert.equal(messaging.webhook,undefined);
});
