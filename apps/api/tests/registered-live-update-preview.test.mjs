import test from 'node:test';
import assert from 'node:assert/strict';
import {liveUpdateDefinition as d,liveUpdateDefinitionHash,verifyLiveUpdateDefinition,buildLiveUpdateMock,planLiveUpdateAudience} from '../registered-live-update-preview.mjs';
const now=Date.parse('2026-11-02T17:30:00Z');
const template={id:'00000000-0000-4000-8000-000000000001',name:d.name,language:'en',status:'APPROVED',category:'UTILITY'};
const channel={id:'channel-fixture',isActive:true,healthStatus:'healthy'};
const proof={verified:true,metaTemplateId:d.metaTemplateId,definitionHash:liveUpdateDefinitionHash,definition:d,status:'APPROVED',source:'authenticated_meta_and_flow_review',observedAt:new Date(now).toISOString()};
const verify=(t=template,e=proof,c=channel)=>verifyLiveUpdateDefinition({templates:[t],channel:c,configuredChannelId:'channel-fixture',reviewedSnapshot:e,now});
const data={contactName:'શાહ દીર્ઘનામ ચંદ્રકાન્તભાઈ પરિવાર',bookingReference:'BOOK26-FIXTURE-ONLY',eventLabel:'મનન સંઘવી / Manan Sanghvi',eventDate:'૨ નવેમ્બર ૨૦૨૬ / 2 November 2026',eventTime:'રાત્રે ૮:૦૦ / 8:00 PM',venue:'શ્રી ચંદ્રમૌલેશ્વર હોલ / Shri Chandramauleshwar Hall',videoId:'Ij1kZRSQTOc'};
test('exact six mixed-language fields and separate one dynamic YouTube suffix, no transport',()=>{
 const p=buildLiveUpdateMock(data);assert.deepEqual(p.components[0].parameters.map(p=>p.text),d.fields.map(f=>data[f]));assert.equal(p.components[1].parameters[0].text,data.videoId);assert.equal(p.url,'https://www.youtube.com/live/Ij1kZRSQTOc');assert.equal(p.sendAllowed,false);assert.equal(p.components.length,2);assert.ok(p.renderedBody.includes(data.contactName));assert.ok(!p.renderedBody.includes('{{'));
});
test('each missing value and unsafe/sample URL value fails closed',()=>{
 for(const f of d.fields)assert.throws(()=>buildLiveUpdateMock({...data,[f]:''}));
 for(const videoId of ['https://youtube.com/live/Ij1kZRSQTOc','../Ij1kZRSQTOc','%7B%7B1%7D%7D','SAMPLE-NOT-VALID','Ij1kZRSQTOc?x'])assert.throws(()=>buildLiveUpdateMock({...data,videoId}));
 assert.throws(()=>buildLiveUpdateMock({...data,bookingReference:'BOOK26-SAMPLE-NOT-VALID'}));
});
test('API UUID and Meta ID remain separate; healthy configured channel, en and approved Utility mandatory',()=>{
 const r=verify();assert.equal(r.verified,true);assert.equal(r.providerTemplateId,template.id);assert.equal(r.metaTemplateId,'3229049627294144');assert.equal(r.providerComponentsVerified,false);assert.equal(r.sendAllowed,false);
 for(const changes of [{id:d.metaTemplateId},{language:'en_US'},{status:'PENDING'},{category:'MARKETING'},{name:'wrong'}])assert.equal(verify({...template,...changes}).verified,false);
 for(const changes of [{id:'wrong'},{isActive:false},{healthStatus:'unhealthy'}])assert.equal(verify(template,proof,{...channel,...changes}).verified,false);
 assert.equal(verify(template,{...proof,verified:false}).verified,false);assert.equal(verify(template,{...proof,observedAt:'2026-10-29T00:00:00Z'}).verified,false);
});
test('supplied wrong BODY/header/footer or double-placeholder CTA cannot fall back to snapshot',()=>{
 const components=[{type:'BODY',text:d.body},{type:'FOOTER',text:d.footer},{type:'BUTTONS',buttons:[{type:'URL',text:d.button,url:d.dynamicUrl}]}];
 assert.equal(verify({...template,components}).providerComponentsVerified,true);
 for(const c of [[...components,{type:'HEADER',text:'unexpected'}],components.map(x=>x.type==='BODY'?{...x,text:'wrong'}:x),components.map(x=>x.type==='FOOTER'?{...x,text:'wrong'}:x),components.map(x=>x.type==='BUTTONS'?{...x,buttons:[{type:'URL',text:d.button,url:'https://www.youtube.com/live/%7B%7B1%7D%7D{{1}}'}]}:x)])assert.equal(verify({...template,components:c}).verified,false);
 assert.equal(verify(template,{...proof,definition:{...d,dynamicUrl:'https://www.youtube.com/live/%7B%7B1%7D%7D{{1}}'}}).verified,false);
});
const booking=(id,extra={})=>({id,mobile:'+919876543210',eventDate:'2026-11-02',status:'active',consent:true,validPersons:3,...extra});
test('one contact/event/video scope across related bookings; other events, Waiting, no consent and holds excluded',()=>{
 const books=[booking('a'),booking('b',{mobile:'9876543210'}),booking('c',{eventDate:'2026-11-03'}),booking('d',{status:'waiting'}),booking('e',{consent:false}),booking('f',{validPersons:0}),booking('g',{duplicateHold:true}),booking('h',{nameHold:true}),booking('i',{status:'cancelled'})];const before=JSON.stringify(books);
 const r=planLiveUpdateAudience({bookings:books,eventDate:'2026-11-02',videoId:data.videoId});assert.equal(r.recipients.length,1);assert.deepEqual(r.recipients[0].bookingIds,['a','b']);assert.equal(r.excluded.length,7);assert.equal(JSON.stringify(books),before);assert.equal(r.providerCalls,0);assert.equal(r.writes,0);
});
test('prior accepted/sent/delivered/read/failed/uncertain or claim blocks every repeated plan; no new round bypass',()=>{
 const args={bookings:[booking('a')],eventDate:'2026-11-02',videoId:data.videoId};const first=planLiveUpdateAudience(args);assert.deepEqual(planLiveUpdateAudience(args),first);const dedupeKey=first.recipients[0].dedupeKey;
 for(const state of ['processing','accepted','sent','delivered','read','failed','uncertain'])assert.equal(planLiveUpdateAudience({...args,prior:[{dedupeKey,state,attempts:1}]}).recipients.length,0);
 assert.equal(planLiveUpdateAudience({...args,prior:[{dedupeKey,state:'held',attempts:0,claimId:'existing-claim'}]}).recipients.length,0);
});
