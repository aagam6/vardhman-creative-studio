// Production modules, fresh disposable DB and mocked authenticated provider HTTP only.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {once} from 'node:events';
import {randomUUID} from 'node:crypto';
import {startBookingFixture,fixtureInput} from './booking-controls-fixture.mjs';
import {createNotificationService} from '../apps/api/notification-service.mjs';
import {createFlow} from '../apps/api/vardhmanflow.mjs';
import {bilingualCatalog} from '../apps/api/bilingual-template-adapter.mjs';
import {createApp} from '../apps/api/app.mjs';
import {notificationSettings} from '../apps/api/notification-settings.mjs';
const f=await startBookingFixture(),calls=[],outcomes=[];let assertions=0,templateMutation=false;
const ok=(a,b)=>{assert.deepEqual(a,b);assertions++;};
const templates=()=>bilingualCatalog.map(t=>({id:t.templateId,name:t.name,language:t.languageCode,status:'APPROVED',category:templateMutation?'MARKETING':'UTILITY',components:[{type:'HEADER',format:'TEXT',text:t.header},{type:'BODY',text:t.body},...(t.button?[{type:'BUTTONS',buttons:[{type:'URL',text:t.button,url:t.dynamicUrl}]}]:[])]}));
const flow=createFlow({VARDHMAN_FLOW_API_KEY:'synthetic',VARDHMAN_FLOW_API_SECRET:'synthetic',AYAMBIL_WHATSAPP_ENABLED:'true'},async(url,options)=>{
 calls.push({url,method:options.method});let data;
 if(url.endsWith('/account'))data={channel:{id:'synthetic',isActive:true,healthStatus:'healthy'}};
 else if(url.includes('/templates?'))data=templates();
 else if(url.includes('/messages/status/'))data={id:url.split('/').at(-1),status:'read'};
 else if(url.endsWith('/messages/template')){const next=outcomes.shift();if(next instanceof Error)throw next;if(next?.gate)await next.gate;data=next?.body||{messageId:'mock-'+calls.length,status:'queued'};}
 else throw Error('Unexpected mocked provider URL');
 return Response.json({success:true,data});
});
let server;
try{
 const originalEvent=(await f.store.bookingControls.availability())[0];await f.store.bookingControls.update(f.actor,{eventDate:originalEvent.event_date,mode:'open',capacity:100,version:originalEvent.version});const preMigration=await f.store.register(fixtureInput(['Pre-migration valid guest'],'2026-11-02','+12025550198'));const preserved=(await f.pool.query('SELECT * FROM ayambil_passes'))[0];
 const sql=(await readFile('apps/api/migrations/012_notification_sender.sql','utf8')).replace(/^--.*$/gm,'');for(const statement of sql.split(';').map(s=>s.trim()).filter(Boolean))await f.pool.query(statement);
 ok((await f.pool.query('SELECT * FROM ayambil_passes'))[0],preserved);await f.store.download(preMigration.downloadKeys[0]);assertions++;
 ok(notificationSettings({}),{notificationService:false,notificationDispatch:false});assert.throws(()=>notificationSettings({AYAMBIL_BILINGUAL_DISPATCH_ENABLED:'true'}));assertions++;
 const config={...f.config,notificationService:true,notificationDispatch:false};const service=createNotificationService({pool:f.pool,config,flow,key:f.fixtureQueueKey});await service.ready();
 await f.store.bookingControls.update(f.actor,{eventDate:'2026-11-02',mode:'open',capacity:100,version:(await f.store.bookingControls.availability()).find(e=>e.event_date==='2026-11-02').version});await f.store.bookingControls.update(f.actor,{eventDate:'2026-11-03',mode:'waiting',capacity:10,version:1});
 const saved=await f.store.register(fixtureInput(['Production Contract A','Production Contract B']));const saved2=await f.store.register(fixtureInput(['Production Contract A','Production Contract B','Production Contract C']));const books=(await f.store.bookingControls.duplicates()).bookings;const book=books.find(b=>b.number===saved.number),book2=books.find(b=>b.number===saved2.number);
 const before={bookings:(await f.pool.query('SELECT * FROM ayambil_bookings'))[0],passes:(await f.pool.query('SELECT * FROM ayambil_passes'))[0],queue:(await f.pool.query('SELECT * FROM ayambil_message_queue'))[0]};
 const initial=await service.enqueue({purpose:'booking_confirmed',subject:book.id});await assert.rejects(service.runOne(initial,{ownershipVersion:1}));assertions++;
 ok(calls.filter(c=>c.method==='POST').length,0);config.notificationDispatch=true;
 await assert.rejects(service.runOne(initial,{ownershipVersion:1}));assertions++;
 const owner=await service.handover({owner:'bilingual',version:1},f.actor);ok(owner.version,2);
 const results=await Promise.allSettled(Array.from({length:8},()=>service.runOne(initial,{ownershipVersion:2,actor:f.actor.admin_id})));ok(results.filter(r=>r.status==='fulfilled'&&r.value.status==='accepted').length,1);ok(calls.filter(c=>c.method==='POST').length,1);
 await service.runOne(initial,{ownershipVersion:2});ok(calls.filter(c=>c.method==='POST').length,1);
 ok((await service.reconcile(initial,f.actor)).status,'read');ok((await service.reconcile(initial,f.actor)).status,'read');
 // Wrong current live definition blocks preparation (no snapshot-only bypass).
 templateMutation=true;await assert.rejects(service.enqueue({purpose:'entry_timing',subject:book.id}));assertions++;templateMutation=false;
 // Metadata polling has a provider limit; use a fresh adapter for the remainder, no policy weakening.
 const waitingReceipt=await f.store.register(fixtureInput(['Production Waiting'],'2026-11-03'));const waiting=(await f.store.bookingControls.waiting()).find(x=>x.number===waitingReceipt.number);
 const ack=await service.enqueue({purpose:'waiting_received',subject:waiting.id});ok((await service.runOne(ack,{ownershipVersion:2})).status,'accepted');
 await f.store.bookingControls.approve(f.actor,waiting.id);const approval=await service.enqueue({purpose:'waiting_approved',subject:waiting.id});ok((await service.runOne(approval,{ownershipVersion:2})).status,'accepted');
 const dup=await f.store.bookingControls.createReview(f.actor,{purpose:'duplicate',bookingIds:[book.id,book2.id]});const dupLink=await f.store.bookingControls.link(f.actor,dup.id);
 const dupId=await service.enqueue({purpose:'booking_verify',subject:dup.id,token:dupLink.path.split('#')[1]});ok((await service.runOne(dupId,{ownershipVersion:2})).status,'accepted');
 const att=await f.store.bookingControls.createReview(f.actor,{purpose:'attendance',bookingIds:[book.id]});const attLink=await f.store.bookingControls.link(f.actor,att.id);
 const attId=await service.enqueue({purpose:'attendance',subject:att.id,token:attLink.path.split('#')[1]});
 await f.store.bookingControls.respond(attLink.path.split('#')[1],{attending:'no',count:0,names:[]});ok((await service.runOne(attId,{ownershipVersion:2})).status,'not_claimed');
 const notice=await service.prepareEntryNotice({bookingIds:[book.id],round:'gate-v1'},f.actor);ok(notice.sent,false);ok((await service.prepareEntryNotice({bookingIds:[book.id],round:'gate-v1'},f.actor)).ids[0],notice.ids[0]);await assert.rejects(service.prepareEntryNotice({bookingIds:[book.id,book.id],round:'gate-v1'},f.actor));assertions++;
 const gate=await service.enqueue({purpose:'entry_timing',subject:book.id,round:'gates'});outcomes.push(new Error('synthetic timeout'));ok((await service.runOne(gate,{ownershipVersion:2})).status,'uncertain');await assert.rejects(service.reconcile(gate,f.actor));assertions++;
 const count=calls.filter(c=>c.method==='POST').length;await service.runOne(gate,{ownershipVersion:2});ok(calls.filter(c=>c.method==='POST').length,count);
 await service.handover({owner:'paused',version:2},f.actor);await assert.rejects(service.handover({owner:'bilingual',version:3},f.actor));assertions++;
 const currentQueue=(await f.pool.query('SELECT * FROM ayambil_message_queue'))[0];ok(currentQueue.filter(q=>before.queue.some(b=>b.id===q.id)),before.queue);
 const currentPasses=(await f.pool.query('SELECT * FROM ayambil_passes'))[0];ok(currentPasses.filter(p=>before.passes.some(b=>b.id===p.id)),before.passes);await f.store.download(saved.downloadKeys[0]);assertions++;
 // Real API route auth/CSRF and dispatch-off are independently enforced.
 config.notificationDispatch=false;
 const app=createApp({store:f.store,config,flow,queue:f.queue,notifications:service,staticDirectory:'.'});server=app.listen(0,'127.0.0.1');await once(server,'listening');const base='http://127.0.0.1:'+server.address().port;
 let r=await fetch(base+'/api/ayambil/admin/notification-outbox');ok(r.status,401);
 const headers={Origin:config.origin,Cookie:'__Host-ayambil='+f.session.token,'Content-Type':'application/json'};
 r=await fetch(base+'/api/ayambil/admin/notification-outbox',{headers});ok(r.status,200);const summary=await r.json();ok(summary.dispatchEnabled,false);ok(summary.items.every(i=>!('envelope'in i)&&!('mobile'in i)),true);
 r=await fetch(base+'/api/ayambil/admin/notification-outbox/send',{method:'POST',headers,body:JSON.stringify({id:initial,version:3,confirmation:'SEND ONE REVIEWED MESSAGE'})});ok(r.status,403);
 const finalCalls=calls.filter(c=>c.method==='POST').length;
 r=await fetch(base+'/api/ayambil/admin/notification-outbox/send',{method:'POST',headers:{...headers,'X-CSRF-Token':f.session.csrf},body:JSON.stringify({id:initial,version:3,confirmation:'SEND ONE REVIEWED MESSAGE'})});ok(r.status,403);ok(calls.filter(c=>c.method==='POST').length,finalCalls);
 const result={passed:true,assertions,mockProviderPosts:finalCalls,actualNetworkCalls:0,oldPassPreserved:true,productionModules:true};await mkdir('tmp/production-sender-20261025',{recursive:true});await writeFile('tmp/production-sender-20261025/results.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
}finally{if(server)await new Promise(r=>server.close(r));await f.close();}
