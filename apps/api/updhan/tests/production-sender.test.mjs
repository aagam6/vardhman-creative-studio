import test from 'node:test';import assert from 'node:assert/strict';
import {createUpdhanProductionSender} from '../production-sender.mjs';
import {createUpdhanRuntime} from '../production-runtime.mjs';
test('production sender cannot schedule or send without activation and coordinated budget',async()=>{
 for(const env of [{},{UPDHAN_ACK_WORKER_ENABLED:'true',UPDHAN_WHATSAPP_ENABLED:'true',UPDHAN_WHATSAPP_ACTIVATION_APPROVED:'true'}]){
  const sender=createUpdhanProductionSender({env,runEvery:()=>assert.fail('timer'),fetchImpl:()=>assert.fail('network')});sender.start();assert.equal(sender.status().enabled,false);await sender.stop();
 }
});
test('missing Updhan configuration does not throw from shared server composition',async()=>{
 for(const env of [{},{UPDHAN_ENABLED:'true'}]){const runtime=createUpdhanRuntime({env,staticDirectory:'/public'});assert.equal(runtime.enabled,false);await runtime.close();}
});
