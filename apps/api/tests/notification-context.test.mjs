import test from 'node:test';
import assert from 'node:assert/strict';
import {attendeeContext,notificationTemplates} from '../notification-context.mjs';
import {programme} from '../config.mjs';
import {createFlow} from '../vardhmanflow.mjs';
import {createStore} from '../store.mjs';
test('store reminder uses booking contact once for multiple attendees with stable booking dedupe',async()=>{
 const session=programme.sessions[1],jobs=[];
 const db={beginTransaction:async()=>{},commit:async()=>{},rollback:async()=>{},release(){},execute:async(sql)=>[sql.includes('FROM ayambil_bookings')?[{status:'active',whatsapp_consent:1,mobile:'12025550123',contact_name:'Synthetic family'}]:[{id:'one',full_name:'Synthetic One',snapshot:{sessions:[session]}},{id:'two',full_name:'Synthetic Two',snapshot:{sessions:[session]}}]]};
 const store=createStore({getConnection:async()=>db},{});
 await store.enqueueReminder({enqueue:async(db,item)=>jobs.push(item)},'synthetic-booking');
 assert.equal(jobs.length,1);assert.equal(jobs[0].dedupe,'booking:synthetic-booking');assert.equal(jobs[0].context.attendeeName,'Synthetic family');assert.equal(jobs[0].context.to,'12025550123');assert.equal(jobs[0].context.eventDate,session.date);assert.doesNotMatch(JSON.stringify(jobs[0].context),/Synthetic Two|passLink/);
});
test('individual contexts preserve both canonical evening associations and reject missing/crossed URLs',()=>{
 for(const session of programme.sessions){
  const first=attendeeContext(session,'Synthetic One','12025550123');const second=attendeeContext(session,'Synthetic Two','12025550123');
  assert.equal(first.attendeeName,'Synthetic One');assert.equal(second.attendeeName,'Synthetic Two');assert.equal(first.venueLocationUrl,session.mapsUrl);assert.equal(first.performer,session.performer);assert.equal(first.eventDate,session.date);assert.doesNotMatch(JSON.stringify(first),/Synthetic Two|passLink|attendeeNames/);
  assert.throws(()=>attendeeContext({...session,mapsUrl:undefined},'Synthetic','12025550123'));
  assert.throws(()=>attendeeContext({...session,mapsUrl:programme.sessions.find(s=>s.date!==session.date).mapsUrl},'Synthetic','12025550123'));
 }
});
test('mock approved BODY contracts require exact five/six/five ordered variables for each evening',async()=>{
 for(const [type,expected] of Object.entries(notificationTemplates))for(const session of programme.sessions){
  let slots=expected.fields.length;
  const env={VARDHMAN_FLOW_API_KEY:'synthetic',VARDHMAN_FLOW_API_SECRET:'synthetic',AYAMBIL_FLOW_TEMPLATE_MAPPINGS:JSON.stringify({[type]:{...expected,language:'en'}})};
  const flow=createFlow(env,async(url,options)=>{assert.equal(options.method,'GET');const data=url.endsWith('/account')?{channel:{id:'synthetic',isActive:true,healthStatus:'healthy',phoneNumber:'12025550123'}}:[{name:expected.name,status:'APPROVED',language:'en',components:[{type:'BODY',text:Array.from({length:slots},(_,i)=>`{{${i+1}}}`).join(' ')}]}];return new Response(JSON.stringify({success:true,data}),{headers:{'Content-Type':'application/json'}});});
  const context={...attendeeContext(session,'Synthetic One','12025550123'),passLink:'https://example.invalid/private#synthetic'};
  const payload=await flow.prepare(type,context);assert.equal(payload.components[0].parameters.length,type==='pass'?6:5);assert.deepEqual(payload.components[0].parameters.map(p=>p.text),expected.fields.map(f=>context[f]));
  await assert.rejects(flow.prepare(type,{...context,venueLocationUrl:''}));slots++;await assert.rejects(flow.prepare(type,context));
 }
});
