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
