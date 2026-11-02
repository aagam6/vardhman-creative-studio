import test from 'node:test';
import assert from 'node:assert/strict';
import {reminderPayload,assertReminderWindow,reminderSchedule} from '../notification-reminders.mjs';
import {startNotificationWorker} from '../notification-worker.mjs';
import {programme} from '../config.mjs';
import {createFlow} from '../vardhmanflow.mjs';
import {createBilingualMockAdapter,bilingualCatalog} from '../bilingual-template-adapter.mjs';
import {notificationTemplates} from '../notification-context.mjs';
import {reviewedTemplateBodies} from '../reviewed-template-bodies.mjs';
import {reminderStartsAt} from '../reminder-schedule.mjs';

test('Sairam 16:00 metadata and final submission guard use the same exact boundary',()=>{
 assert.equal(reminderSchedule.events.find(e=>e.eventDate==='2026-11-03').startsAt,'2026-11-02T10:30:00.000Z');
 assert.equal(reminderStartsAt('2026-11-03'),Date.parse('2026-11-02T10:30:00.000Z'));
 assert.throws(()=>assertReminderWindow('2026-11-03',new Date('2026-11-02T10:29:59.999Z')));
 assertReminderWindow('2026-11-03',new Date('2026-11-02T10:30:00.000Z'));
 assert.throws(()=>assertReminderWindow('2026-11-03',new Date('2026-11-02T18:30:00.000Z')));
 assert.equal(reminderSchedule.events.find(e=>e.eventDate==='2026-11-02').startsAt,'2026-11-01T12:30:00.000Z');
 assert.equal(reminderSchedule.separateEntryNotice,false);
});
test('reminder preflight requires exact approved Utility/en UUID, BODY and configured mapping',async()=>{
 const def={id:'11111111-2222-4333-8444-555555555555',name:'ayambil_event_reminder',language:'en',status:'APPROVED',category:'UTILITY',components:[{type:'BODY',text:reviewedTemplateBodies.ayambil_event_reminder}]};
 const env={VARDHMAN_FLOW_API_KEY:'fixture',VARDHMAN_FLOW_API_SECRET:'fixture',VARDHMAN_FLOW_CHANNEL_ID:'fixture',AYAMBIL_SITE_ORIGIN:'https://vardhmancreativestudio.com',AYAMBIL_PRODUCTION_TEMPLATE_POLICY:'ayambil-en-2026-10-13-v1',AYAMBIL_FLOW_TEMPLATE_MAPPINGS:JSON.stringify({reminder:{...notificationTemplates.reminder,language:'en'}})};
 const flow=d=>createFlow(env,async(url,o)=>{assert.equal(o.method,'GET');return new Response(JSON.stringify({success:true,data:url.endsWith('/account')?{channel:{id:'fixture',isActive:true,healthStatus:'healthy'}}:[d]}),{headers:{'content-type':'application/json'}});});
 assert.equal((await flow(def).verifyReminder()).verified,true);const omitted={...def};delete omitted.components;assert.equal((await flow(omitted).verifyReminder()).source,'operator_reviewed_snapshot');
 for(const d of [{...def,language:'gu'},{...def,category:'MARKETING'},{...def,status:'PAUSED'},{...def,components:[{type:'BODY',text:'wrong'}]}])await assert.rejects(flow(d).verifyReminder());
});
test('scheduled entry timing retains both prior-day IST windows with one exact eight-field bilingual template',()=>{
 for(const session of programme.sessions){const start=reminderStartsAt(session.date);assert.throws(()=>assertReminderWindow(session.date,new Date(start-1)));assertReminderWindow(session.date,new Date(start));assert.throws(()=>assertReminderWindow(session.date,new Date(session.date+'T00:00:00+05:30')));const catalog=structuredClone(bilingualCatalog);catalog.find(t=>t.purpose==='entry_timing').approvalEvidence.observedAt=new Date().toISOString();const p=reminderPayload({session,source:{contactName:'Synthetic family',bookingReference:'BOOK26-SYNTHETIC',mobile:'12025550123'},build:createBilingualMockAdapter(catalog)});assert.equal(p.name,'ayambil_entry_timing_bilingual');assert.equal(p.purpose,'reminder');assert.equal(p.language.code,'en');assert.deepEqual(p.components[0].parameters.map(p=>p.text),['Synthetic family','BOOK26-SYNTHETIC',session.performer,session.label,'Synthetic family','BOOK26-SYNTHETIC',session.performer,session.label]);assert.match(p.renderedBody,/9:00 PM IST/);assert.equal(p.components.length,1);}
});
test('new reminder opt-in shares transactional owner and never runs before an eligible selection',async()=>{
 let tick,calls=0,select=0;const service={owner:async()=>({owner:'bilingual',version:7}),pending:async()=>[],nextReminder:async()=>{select++;return select===1?null:{id:'subject',outbox_id:'saved'};},runOne:async(id,o)=>{assert.equal(id,'saved');assert.equal(o.automaticReminder,true);assert.equal(o.ownershipVersion,7);assert.equal(o.automaticSince,undefined);calls++;return {status:'sent'};}};
 const w=startNotificationWorker(service,{notificationDispatch:true},{AYAMBIL_BILINGUAL_WORKER_ENABLED:'true',AYAMBIL_BILINGUAL_REMINDERS_ENABLED:'true',AYAMBIL_BILINGUAL_ACTIVATION_AT:'2026-10-27T07:28:06.000Z'},{schedule:fn=>(tick=fn,1),cancel:()=>{}});assert.equal(calls,0);await tick();assert.equal(calls,0);await tick();assert.equal(calls,1);assert.equal(w.active,true);assert.equal(w.status().reminders.time,'16:00');assert.equal(w.status().cutoff,'2026-10-27T07:28:06.000Z');
});
test('resolved zero-attempt eligibility holds are rechecked without replaying submitted records',async()=>{
 const saved=Date.now;let clock=saved(),tick,held=true,submitted=0;Date.now=()=>clock;
 try{const service={owner:async()=>({owner:'bilingual',version:1}),pending:async(s,o)=>submitted||o.excludeIntentIds.length?[]:[{id:'11111111-2222-4333-8444-555555555555'}],enqueueHeldIntent:async()=>{if(held)throw Object.assign(Error('hold'),{code:'NOTIFICATION_INELIGIBLE',holdReason:'duplicate_or_name_hold'});return 'job';},runOne:async()=>{submitted++;return {status:'sent'};}};
 const w=startNotificationWorker(service,{notificationDispatch:true},{AYAMBIL_BILINGUAL_WORKER_ENABLED:'true',AYAMBIL_BILINGUAL_ACTIVATION_AT:'2026-10-27T07:28:06.000Z'},{schedule:f=>(tick=f,1),cancel:()=>{}});await tick();held=false;await tick();assert.equal(submitted,0);clock+=300001;await tick();await tick();assert.equal(submitted,1);assert.equal(w.active,true);
 }finally{Date.now=saved;}
});
