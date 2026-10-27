import test from 'node:test';
import assert from 'node:assert/strict';
import {notificationSettings} from '../notification-settings.mjs';
import {startNotificationWorker} from '../notification-worker.mjs';
const env={AYAMBIL_NOTIFICATION_SERVICE_ENABLED:'true',AYAMBIL_BILINGUAL_DISPATCH_ENABLED:'true',AYAMBIL_BOOKING_CONTROLS_ENABLED:'true',AYAMBIL_WHATSAPP_ENABLED:'true',AYAMBIL_BILINGUAL_DISPATCH_APPROVAL:'reviewed-v1'};
test('new dispatch is default off and requires independent approval and exclusive legacy-off flags',()=>{
 assert.deepEqual(notificationSettings({}),{notificationService:false,notificationDispatch:false});
 assert.equal(notificationSettings(env).notificationDispatch,true);
 for(const key of ['AYAMBIL_NOTIFICATION_SERVICE_ENABLED','AYAMBIL_BOOKING_CONTROLS_ENABLED','AYAMBIL_WHATSAPP_ENABLED','AYAMBIL_BILINGUAL_DISPATCH_APPROVAL'])assert.throws(()=>notificationSettings({...env,[key]:''}));
 for(const key of ['AYAMBIL_WHATSAPP_AUTO_WORKER_ENABLED','AYAMBIL_WHATSAPP_REMINDER_SCHEDULER_ENABLED','AYAMBIL_WHATSAPP_NORMAL_PROCESSING_APPROVED','AYAMBIL_WHATSAPP_MANUAL_PROCESSING_APPROVED'])assert.throws(()=>notificationSettings({...env,[key]:'true'}));
});
test('bilingual automatic worker is separately off and cannot infer an activation cutoff',()=>{
 let scheduled=0;assert.equal(startNotificationWorker(null,{},{}).enabled,false);
 assert.throws(()=>startNotificationWorker({}, {notificationDispatch:true},{AYAMBIL_BILINGUAL_WORKER_ENABLED:'true'},{schedule(){scheduled++;}}));assert.equal(scheduled,0);
});
test('worker handles one reviewed new intent, honors owner/cutoff and stops on uncertain without retry',async()=>{
 let tick,cancelled=0,calls=0,cutoff;
 const service={async owner(){return {owner:'bilingual',version:4};},async pending(s){cutoff=s;return [{id:'intent'}];},async enqueueHeldIntent(id){assert.equal(id,'intent');return 'outbox';},async runOne(id,options){calls++;assert.equal(id,'outbox');assert.equal(options.ownershipVersion,4);return {status:'uncertain'};}};
 const worker=startNotificationWorker(service,{notificationDispatch:true},{AYAMBIL_BILINGUAL_WORKER_ENABLED:'true',AYAMBIL_BILINGUAL_ACTIVATION_AT:'2026-10-25T00:00:00.000Z'},{schedule(fn){tick=fn;return 1;},cancel(){cancelled++;}});
 assert.equal(calls,0);await tick();await tick();assert.equal(calls,1);assert.equal(cancelled,1);assert.equal(worker.active,false);assert.equal(cutoff,'2026-10-25T00:00:00.000Z');
});
test('restart reuses prepared transactional outbox and deferred pacing never retries a submission',async()=>{
 let tick,calls=0,prepares=0,cancelled=0;const cutoff='2026-10-27T07:28:06.000Z';
 const service={owner:async()=>({owner:'bilingual',version:28}),pending:async s=>{assert.equal(s,cutoff);return [{id:'intent',outbox_id:'prepared'}];},enqueueHeldIntent:async()=>{prepares++;},runOne:async(id,o)=>{assert.equal(id,'prepared');assert.equal(o.automaticSince,cutoff);assert.equal(o.ownershipVersion,28);assert.equal(o.actor,'transactional-worker');calls++;return {status:calls===1?'deferred':'uncertain'};}};
 const worker=startNotificationWorker(service,{notificationDispatch:true},{AYAMBIL_BILINGUAL_WORKER_ENABLED:'true',AYAMBIL_BILINGUAL_ACTIVATION_AT:cutoff},{schedule(fn){tick=fn;return 1;},cancel(){cancelled++;}});
 await tick();assert.equal(worker.active,true);assert.equal(calls,1);assert.equal(prepares,0);await tick();await tick();assert.equal(calls,2);assert.equal(cancelled,1);assert.equal(worker.active,false);
});
test('shared lease busy is a pre-claim deferral, while other errors stop without retry',async()=>{
 let tick,cancelled=0,calls=0;const service={owner:async()=>({owner:'bilingual',version:1}),pending:async()=>[{id:'intent',outbox_id:'ready'}],runOne:async()=>{calls++;if(calls===1)throw Object.assign(Error('busy'),{code:'DISPATCH_BUSY'});throw Error('unknown failure');}};
 const worker=startNotificationWorker(service,{notificationDispatch:true},{AYAMBIL_BILINGUAL_WORKER_ENABLED:'true',AYAMBIL_BILINGUAL_ACTIVATION_AT:'2026-10-27T07:28:06.000Z'},{schedule(fn){tick=fn;return 1;},cancel(){cancelled++;}});
 await tick();assert.equal(worker.active,true);assert.equal(worker.status().lastOutcome,'lease_busy');assert.equal(cancelled,0);await tick();await tick();assert.equal(calls,2);assert.equal(cancelled,1);assert.equal(worker.active,false);assert.equal(worker.status().stopReason,'operation_requires_review');assert.doesNotMatch(JSON.stringify(worker.status()),/unknown failure/);
});
test('paused ownership never dispatches; explicit owner resume can wake the configured transactional worker',async()=>{
 let tick,owner='paused',calls=0,cancelled=0;const service={owner:async()=>({owner,version:2}),pending:async()=>[{id:'intent',outbox_id:'job'}],runOne:async()=>{calls++;return {status:calls===1?'accepted':'uncertain'};}};
 const worker=startNotificationWorker(service,{notificationDispatch:true},{AYAMBIL_BILINGUAL_WORKER_ENABLED:'true',AYAMBIL_BILINGUAL_ACTIVATION_AT:'2026-10-27T07:28:06.000Z'},{schedule(fn){tick=fn;return 1;},cancel(){cancelled++;}});
 await tick();assert.equal(calls,0);assert.equal(worker.status().lastOutcome,'paused');assert.equal(worker.active,true);owner='bilingual';await tick();assert.equal(calls,1);await tick();await tick();assert.equal(calls,2);assert.equal(worker.active,false);assert.equal(cancelled,1);
});
