import {normalQueuePolicy} from './message-queue.mjs';
// No import-time sends. Startup invokes this only after database readiness.
export function startQueueWorker(queue,env,{schedule=setInterval,cancel=clearInterval,log=()=>{}}={}){
 if(env.AYAMBIL_WHATSAPP_AUTO_WORKER_ENABLED!=='true')return {enabled:false,stop(){}};
 if(!queue||env.AYAMBIL_WHATSAPP_ENABLED!=='true')throw Error('Configured Express queue required');
 normalQueuePolicy(env);
 let running=false,stopped=false;
 const stop=()=>{stopped=true;cancel(timer);};
 const tick=async()=>{
  if(running||stopped)return;
  running=true;
  try{
   if((await queue.reconcileFresh()).blocked){log('Express message worker paused: manual reconciliation required.');stop();return;}
   const result=await queue.runOne();
   if(['uncertain','failed','preflight_failed'].includes(result.status)){log('Express message worker paused: reviewed operator action required.');stop();}
  }catch{log('Express message worker paused: operation unavailable.');stop();}
  finally{running=false;}
 };
 const timer=schedule(tick,15000);
 return {enabled:true,get active(){return !stopped;},stop};
}
