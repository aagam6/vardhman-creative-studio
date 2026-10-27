// Off unless both service+dispatch and an explicit reviewed activation cutoff exist.
export function startNotificationWorker(service,config,env,{schedule=setInterval,cancel=clearInterval}={}){
 if(env.AYAMBIL_BILINGUAL_WORKER_ENABLED!=='true')return {enabled:false,stop(){}};
 const since=env.AYAMBIL_BILINGUAL_ACTIVATION_AT;
 if(!service||!config.notificationDispatch||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(since||'')||!Number.isFinite(Date.parse(since)))throw Error('Reviewed bilingual activation required');
 let running=false,stopped=false;
 const stop=()=>{stopped=true;cancel(timer);};
 const tick=async()=>{if(running||stopped)return;running=true;try{
  const owner=await service.owner();if(owner.owner!=='bilingual'){stop();return;}
  if(service.reconcileNext)await service.reconcileNext();
  const pending=await service.pending(since);if(!pending.length)return;
  const id=pending[0].outbox_id||await service.enqueueHeldIntent(pending[0].id);const r=await service.runOne(id,{ownershipVersion:owner.version,automaticSince:since,actor:'transactional-worker'});
  if(!['accepted','sent','delivered','read','deferred'].includes(r.status))stop();
 }catch(error){if(error?.code!=='DISPATCH_BUSY')stop();}finally{running=false;}};
 const timer=schedule(tick,15000);return {enabled:true,get active(){return !stopped;},stop};
}
