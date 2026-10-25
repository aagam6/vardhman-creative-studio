import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {randomBytes} from 'node:crypto';
import {startBookingFixture,fixtureInput} from './booking-controls-fixture.mjs';
import {createLocalNotificationSender,createInMemoryNotificationProvider,localSenderSchema} from '../apps/api/local-notification-sender.mjs';
import {createLocalQueueCoordinator,localOwnershipSchema,requireQueueOwnership} from '../apps/api/queue-ownership-reconciliation.mjs';
import {createMessageQueue} from '../apps/api/message-queue.mjs';
import {createLocalFlowContract} from '../apps/api/local-flow-contract.mjs';
import {bilingualCatalog} from '../apps/api/bilingual-template-adapter.mjs';
const f=await startBookingFixture(),provider=createInMemoryNotificationProvider(),key=randomBytes(32).toString('hex');let assertions=0,statusCalls=0;
const ok=(a,b)=>{assert.deepEqual(a,b);assertions++;};
try{
 await f.pool.query(localSenderSchema);for(const sql of localOwnershipSchema)await f.pool.query(sql);
 const e=(await f.store.bookingControls.availability())[0];await f.store.bookingControls.update(f.actor,{eventDate:e.event_date,mode:'open',capacity:100,version:e.version});
 const saved=await f.store.register(fixtureInput(['Ownership Guest']));const b=(await f.store.bookingControls.duplicates()).bookings.find(x=>x.number===saved.number);
 const catalog=structuredClone(bilingualCatalog);for(const t of catalog)t.approvalEvidence.observedAt=new Date().toISOString();
 const sender=createLocalNotificationSender({pool:f.pool,config:f.config,key,provider,catalog});
 let status='sent',wrong=false;
 const c=createLocalQueueCoordinator({pool:f.pool,config:f.config,statusProvider:{mockStatusOnly:true,async status(id){statusCalls++;return {id:wrong?'wrong':id,status};}}});
 const contract=createLocalFlowContract();const statusCoordinator=createLocalQueueCoordinator({pool:f.pool,config:f.config,statusProvider:{mockStatusOnly:true,async status(id){return {id,...await contract.flow.messageStatus(id)};}}});
 const baseline={passes:(await f.pool.query('SELECT * FROM ayambil_passes'))[0],queue:(await f.pool.query('SELECT * FROM ayambil_message_queue'))[0]};
 const id=await sender.enqueue({purpose:'entry_timing',subject:b.id});
 await assert.rejects(sender.runOne(id,{ownershipVersion:1}));assertions++;ok(provider.calls.length,0);
 const contenders=await Promise.allSettled(Array.from({length:6},()=>c.handover({owner:'bilingual',version:1})));ok(contenders.filter(r=>r.status==='fulfilled').length,1);
 await assert.rejects(sender.runOne(id,{ownershipVersion:1}));assertions++;
 await assert.rejects(requireQueueOwnership(f.pool,'legacy',2));assertions++;
 ok((await sender.runOne(id,{ownershipVersion:2})).status,'accepted');ok(provider.calls.length,1);
 ok((await statusCoordinator.reconcile(id)).status,'sent');ok(contract.requests[0].statusRead,true);ok((await c.reconcile(id)).status,'sent');ok((await c.reconcile(id)).changed,false);
 status='delivered';ok((await c.reconcile(id)).status,'delivered');status='sent';ok((await c.reconcile(id)).status,'delivered');status='failed';ok((await c.reconcile(id)).status,'delivered');status='read';ok((await c.reconcile(id)).status,'read');
 wrong=true;await assert.rejects(c.reconcile(id));assertions++;wrong=false;
 const uncertain=await sender.enqueue({purpose:'entry_timing',subject:b.id,round:'unknown'});provider.outcomes.push(new Error('timeout'));await sender.runOne(uncertain,{ownershipVersion:2});
 await assert.rejects(c.reconcile(uncertain));assertions++;
 await assert.rejects(c.handover({owner:'legacy',version:2}));assertions++;
 const paused=await c.handover({owner:'paused',version:2});ok(paused.realDispatchEnabled,false);
 await assert.rejects(sender.runOne(uncertain,{ownershipVersion:paused.version}));assertions++;
 await assert.rejects(c.webhook({}));assertions++;
 const calls=provider.calls.length;status='read';await c.reconcile(id);ok(provider.calls.length,calls);
 ok((await f.pool.query('SELECT * FROM ayambil_passes'))[0],baseline.passes);ok((await f.pool.query('SELECT * FROM ayambil_message_queue'))[0],baseline.queue);await f.store.download(saved.downloadKeys[0]);assertions++;
 // Real legacy-queue reconciliation re-reads locked status after delayed API response.
 const [legacyRows]=await f.pool.query('SELECT id FROM ayambil_message_queue LIMIT 1');const legacyId=legacyRows[0].id;
 await f.pool.execute("UPDATE ayambil_message_queue SET status='accepted',provider_id='mock-legacy' WHERE id=?",[legacyId]);
 const legacyQueue=createMessageQueue(f.pool,{async messageStatus(){await f.pool.execute("UPDATE ayambil_message_queue SET status='read' WHERE id=?",[legacyId]);return {status:'sent'};}},{});
 ok((await legacyQueue.reconcile(legacyId)).status,'read');
 // Restore only synthetic test setup, never a production row.
 await f.pool.execute("UPDATE ayambil_message_queue SET status='queued',provider_id=NULL WHERE id=?",[legacyId]);
 const result={passed:true,assertions,statusReadCalls:statusCalls,mockSubmissions:provider.calls.length,realNetworkCalls:0,oldPassValid:true,protectedRowsUnchanged:true,webhook:'disabled pending verified provider signature contract'};
 await mkdir('tmp/ownership-reconciliation-20261025',{recursive:true});await writeFile('tmp/ownership-reconciliation-20261025/results.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
}finally{await f.close();}
