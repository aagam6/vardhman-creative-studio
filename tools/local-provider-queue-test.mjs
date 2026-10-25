import assert from 'node:assert/strict';
import {writeFile,mkdir} from 'node:fs/promises';
import {randomBytes} from 'node:crypto';
import {startBookingFixture,fixtureInput} from './booking-controls-fixture.mjs';
import {createMessageQueue} from '../apps/api/message-queue.mjs';
import {createLocalNotificationSender,createQueueBackedLocalProvider,localSenderSchema} from '../apps/api/local-notification-sender.mjs';
import {createBilingualMockAdapter,bilingualCatalog} from '../apps/api/bilingual-template-adapter.mjs';
const f=await startBookingFixture(),key=randomBytes(32).toString('hex');let assertions=0;
const ok=(a,b)=>{assert.deepEqual(a,b);assertions++;};
try{
 await f.pool.query(localSenderSchema);const e=(await f.store.bookingControls.availability())[0];await f.store.bookingControls.update(f.actor,{eventDate:e.event_date,mode:'open',capacity:100,version:e.version});
 const saved=await f.store.register(fixtureInput(['Queue Contract Guest']));const b=(await f.store.bookingControls.duplicates()).bookings.find(x=>x.number===saved.number);
 const catalog=structuredClone(bilingualCatalog);for(const t of catalog)t.approvalEvidence.observedAt=new Date().toISOString();
 const provider=createQueueBackedLocalProvider(f.pool,key);const sender=createLocalNotificationSender({pool:f.pool,config:f.config,key,provider,catalog});
 const [before]=await f.pool.query('SELECT * FROM ayambil_message_queue');const [passes]=await f.pool.query('SELECT * FROM ayambil_passes');
 const initial=await sender.enqueue({purpose:'booking_confirmed',subject:b.id});
 const legacy=await provider.queue.runOne();ok(legacy.status,'cancelled');ok(provider.calls.length,0);
 ok((await sender.runOne(initial)).status,'accepted');ok(provider.calls.length,1);
 const sent=provider.calls[0];ok(sent.templateName,'ayambil_booking_confirmed_bilingual');ok(sent.language,'en');ok(sent.to,'12025550123');ok(sent.components[0].parameters.length,10);ok(sent.components[1].sub_type,'url');
 ok((await provider.queue.runOne()).status,'cancelled');ok(provider.calls.length,1);await sender.runOne(initial);ok(provider.calls.length,1);
 for(const [round,response,expected] of [
  ['400',{status:400,body:{error:'synthetic'}},'failed'],['403',{status:403,body:{error:'synthetic'}},'failed'],
  ['429',{status:429,body:{error:'synthetic'}},'failed'],['500',{status:500,body:{error:'synthetic'}},'uncertain'],
  ['timeout',new Error('synthetic timeout'),'uncertain'],['html',{status:200,contentType:'text/html',body:'not json'},'uncertain'],
  ['bad-id',{status:200,body:{success:true,data:{status:'sent'}}},'uncertain'],['bad-status',{status:200,body:{success:true,data:{messageId:'mock-x',status:'unknown'}}},'uncertain'],
  ['delivered',{status:200,body:{success:true,data:{messageId:'mock-delivered',status:'delivered'}}},'accepted']
 ]){
  const id=await sender.enqueue({purpose:'entry_timing',subject:b.id,round});provider.responses.push(response);ok((await sender.runOne(id)).status,expected);const calls=provider.calls.length;await sender.runOne(id);ok(provider.calls.length,calls);
 }
 // All six approved payload shapes pass the real serializer with mock HTTP only.
 const build=createBilingualMockAdapter(catalog),data={contactName:'Synthetic Guest',eventLabel:'Synthetic Event',eventDate:'2 November 2026',bookingReference:'BOOK26-SYNTHETIC',waitingReference:'WAIT26-SYNTHETIC',attendeeCount:2,approvedAttendeeCount:2,urlSuffix:'respond#'+'a'.repeat(64)};
 for(const t of catalog){const p=build(t.purpose,data);await provider.submit({...p,to:'+12025550123'});const wire=provider.calls.at(-1);ok(wire.templateName,t.name);ok(wire.language,'en');ok(wire.components[0].parameters.length,t.parameters.length);}
 // Real queue adapter cannot accept a real or arbitrary provider even with a synthetic DB.
 const unsafe=createMessageQueue(f.pool,{sendPrepared:()=>{throw Error('must never run');}},{AYAMBIL_LOCAL_PROVIDER_REHEARSAL:'true'});
 await assert.rejects(unsafe.submitLocalBilingualPrepared({}),e=>e.status===403);assertions++;
 ok((await f.pool.query('SELECT * FROM ayambil_message_queue'))[0],before);ok((await f.pool.query('SELECT * FROM ayambil_passes'))[0],passes);await f.store.download(saved.downloadKeys[0]);assertions++;
 const result={passed:true,assertions,mockedHttpRequests:provider.calls.length,actualNetworkRequests:0,actualWhatsAppMessages:0,legacyQueueUnchanged:true,oldPassDownload:true};
 await mkdir('tmp/local-provider-queue-20261025',{recursive:true});await writeFile('tmp/local-provider-queue-20261025/results.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
}finally{await f.close();}
