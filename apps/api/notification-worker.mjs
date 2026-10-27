// Off unless both service+dispatch and an explicit reviewed activation cutoff exist.
export function startNotificationWorker(service,config,env,{schedule=setInterval,cancel=clearInterval}={}){
 if(env.AYAMBIL_BILINGUAL_WORKER_ENABLED!=='true')return {enabled:false,active:false,status:()=>({enabled:false,active:false,cutoff:null,lastTickAt:null,lastOutcome:'disabled',stopReason:null}),stop(){}};
 const since=env.AYAMBIL_BILINGUAL_ACTIVATION_AT;
 if(!service||!config.notificationDispatch||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(since||'')||!Number.isFinite(Date.parse(since)))throw Error('Reviewed bilingual activation required');
 let running=false,stopped=false,lastTickAt=null,lastOutcome='idle',stopReason=null;
 const stop=(reason='operator_stop')=>{stopped=true;stopReason=reason;cancel(timer);};
 const tick=async()=>{if(running||stopped)return;running=true;lastTickAt=new Date().toISOString();try{
  const owner=await service.owner();if(owner.owner!=='bilingual'){lastOutcome='paused';stop('owner_paused');return;}
  if(service.reconcileNext)await service.reconcileNext();
  const pending=await service.pending(since);if(!pending.length){lastOutcome='idle';return;}
  const id=pending[0].outbox_id||await service.enqueueHeldIntent(pending[0].id);const r=await service.runOne(id,{ownershipVersion:owner.version,automaticSince:since,actor:'transactional-worker'});
  lastOutcome=['accepted','sent','delivered','read','deferred','uncertain','failed','blocked','not_claimed'].includes(r.status)?r.status:'unconfirmed';
  if(!['accepted','sent','delivered','read','deferred'].includes(r.status))stop('submission_requires_review');
 }catch(error){if(error?.code==='DISPATCH_BUSY')lastOutcome='lease_busy';else{lastOutcome='error';stop('operation_requires_review');}}finally{running=false;}};
 const timer=schedule(tick,15000);return {enabled:true,get active(){return !stopped;},status:()=>({enabled:true,active:!stopped,cutoff:since,lastTickAt,lastOutcome,stopReason}),stop};
}
