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
test('supervisor has one in-flight tick, drains before stop and releases only its Updhan lease',async()=>{
 let scheduled,cleared=0,claims=0,releases=0,resolveRecovery;
 const recovery=new Promise(r=>{resolveRecovery=r;});
 const c={beginTransaction:async()=>{},commit:async()=>{},rollback:async()=>{},release(){},query:async()=>[[{enabled:1,owner:'reviewed-owner'}]],execute:async(sql)=>{assert.match(sql,/UPDATE updhan_worker_ownership/);claims++;return [{affectedRows:1}];}};
 const pool={getConnection:async()=>c,query:async()=>[[]],execute:async(sql,args)=>{assert.match(sql,/UPDATE updhan_worker_ownership/);assert.deepEqual(args,['reviewed-owner']);releases++;}};
 const env={UPDHAN_ACK_WORKER_ENABLED:'true',UPDHAN_WHATSAPP_ENABLED:'true',UPDHAN_WHATSAPP_ACTIVATION_APPROVED:'true',UPDHAN_ACK_QUEUE_OWNER:'reviewed-owner',VARDHMAN_FLOW_API_KEY:'synthetic',VARDHMAN_FLOW_API_SECRET:'synthetic',VARDHMAN_FLOW_CHANNEL_ID:'synthetic'};
 const sender=createUpdhanProductionSender({env,pool,repository:{recoverExpired:()=>recovery},reserveRequestBudget:async()=>true,fetchImpl:()=>assert.fail('idle cannot use network'),runEvery:fn=>{scheduled=fn;return {unref(){}};},clearEvery:()=>cleared++});
 sender.start();sender.start();scheduled();scheduled();assert.equal(sender.status().active,true);
 let drained=false;const stop=sender.stop().then(()=>{drained=true;});assert.equal(drained,false);resolveRecovery();await stop;
 assert.equal(claims,1);assert.equal(releases,1);assert.equal(cleared,1);scheduled();assert.equal(sender.status().active,false);
});
