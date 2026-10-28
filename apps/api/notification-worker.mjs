import {reminderSchedule} from './notification-reminders.mjs';
// Transactional work and opt-in reminders share the same lease, pacing and ledger.
export function startNotificationWorker(service,config,env,{schedule=setInterval,cancel=clearInterval}={}){
 if(env.AYAMBIL_BILINGUAL_WORKER_ENABLED!=='true')return {enabled:false,active:false,status:()=>({enabled:false,active:false,cutoff:null,lastTickAt:null,lastOutcome:'disabled',stopReason:null}),stop(){}};
 const since=env.AYAMBIL_BILINGUAL_ACTIVATION_AT;
 if(!service||!config.notificationDispatch||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(since||'')||!Number.isFinite(Date.parse(since)))throw Error('Reviewed bilingual activation required');
 let running=false,stopped=false,lastTickAt=null,lastOutcome='idle',stopReason=null,lastStage=null,lastErrorCode=null;
 const remindersEnabled=env.AYAMBIL_BILINGUAL_REMINDERS_ENABLED==='true';
 const heldReminders=new Set(),heldIntents=new Map(),holdExpiry=new Map();let preparingIntent=null,preparingReminder=null;
 const stop=(reason='operator_stop')=>{stopped=true;stopReason=reason;cancel(timer);};
 const tick=async()=>{if(running||stopped)return;running=true;lastTickAt=new Date().toISOString();try{
  lastStage='owner';const owner=await service.owner();if(owner.owner!=='bilingual'){lastOutcome='paused';return;}
  lastStage='receipt_reconciliation';if(service.reconcileNext)await service.reconcileNext();
  for(const [id,until] of holdExpiry)if(Date.now()>=until){heldIntents.delete(id);holdExpiry.delete(id);}
  preparingIntent=null;preparingReminder=null;
  lastStage='pending_selection';const pending=await service.pending(since,{excludeIntentIds:[...heldIntents.keys()]});let id,options;
  if(pending.length){lastStage='prepare';preparingIntent=pending[0].id;id=pending[0].outbox_id||await service.enqueueHeldIntent(pending[0].id);options={ownershipVersion:owner.version,automaticSince:since,actor:'transactional-worker'};}
  else if(remindersEnabled&&service.nextReminder){lastStage='reminder_selection';const item=await service.nextReminder({excludeSubjects:[...heldReminders]});if(!item){lastOutcome='idle';return;}preparingReminder=item.id;lastStage='reminder_prepare';id=item.outbox_id||await service.enqueue({purpose:'reminder',subject:item.id,round:'initial'});options={ownershipVersion:owner.version,automaticReminder:true,actor:'reminder-worker'};}
  else {lastOutcome='idle';return;}
  lastStage='submit';const r=await service.runOne(id,options);
  lastOutcome=['accepted','sent','delivered','read','deferred','uncertain','failed','blocked','not_claimed'].includes(r.status)?r.status:'unconfirmed';
  if(!['accepted','sent','delivered','read','deferred'].includes(r.status))stop('submission_requires_review');
 }catch(error){if(lastStage==='prepare'&&error?.code==='NOTIFICATION_INELIGIBLE'&&preparingIntent&&heldIntents.size<1000){heldIntents.set(preparingIntent,error.holdReason);holdExpiry.set(preparingIntent,Date.now()+300000);lastOutcome='held';}else if(lastStage==='reminder_prepare'&&preparingReminder&&heldReminders.size<2000&&['Confirmed notification held for duplicate/name review','Active booking required','Active passes required','Legacy reminder already attempted','Reminder or entry notice already attempted','Reminder outside previous-day 18:00 IST window'].includes(error?.message)){heldReminders.add(preparingReminder);lastOutcome='reminder_held';}else if(error?.code==='DISPATCH_BUSY')lastOutcome='lease_busy';else{lastOutcome='error';lastErrorCode=/^(?:ER_[A-Z0-9_]+|PROVIDER_HTTP_[0-9]{3}|PROVIDER_(?:INVALID_JSON|TRANSPORT_UNAVAILABLE|STATUS_MISMATCH)|ETIMEDOUT|ECONNRESET|DISPATCH_BUSY)$/.test(error?.code||'')?error.code:'REVIEW_REQUIRED';stop('operation_requires_review');}}finally{running=false;}};
 const timer=schedule(tick,15000);return {enabled:true,get active(){return !stopped;},status:()=>({enabled:true,active:!stopped,cutoff:since,lastTickAt,lastOutcome,stopReason,lastStage,lastErrorCode,reminders:{enabled:remindersEnabled,...reminderSchedule,held:heldReminders.size},heldIntents:[...heldIntents].map(([id,reason])=>({id,reason}))}),stop};
}
