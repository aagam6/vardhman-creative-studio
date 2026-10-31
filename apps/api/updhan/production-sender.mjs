import {createAcknowledgementWorker} from './acknowledgement-worker.mjs';
import {createAcknowledgementRunner} from './acknowledgement-runner.mjs';
import {createUpdhanFlowProvider} from './flow-provider.mjs';

// A budget reservation must coordinate every process using the provider key.
// An in-memory counter here would not coordinate the existing Ayambil sender.
export function createUpdhanProductionSender({env,pool,repository,reserveRequestBudget,fetchImpl,runEvery=setInterval,clearEvery=clearInterval}){
 const approved=['UPDHAN_ACK_WORKER_ENABLED','UPDHAN_WHATSAPP_ENABLED','UPDHAN_WHATSAPP_ACTIVATION_APPROVED'].every(k=>env[k]==='true');
 const reason=!approved?'disabled':typeof reserveRequestBudget!=='function'?'shared_budget_unverified':!env.UPDHAN_ACK_QUEUE_OWNER?'owner_missing':null;
 let timer,pending,stopped=false,last='idle';
 if(reason)return {start(){},async stop(){},status:()=>({enabled:false,active:false,reason})};
 const provider=createUpdhanFlowProvider({env,fetchImpl,allowNetwork:true,reserveRequestBudget});
 if(!provider.configuration().enabled)return {start(){},async stop(){},status:()=>({enabled:false,active:false,reason:'provider_not_configured'})};
 const worker=createAcknowledgementWorker({repository,provider,enabled:true});
 const runner=createAcknowledgementRunner({pool,repository,worker,owner:env.UPDHAN_ACK_QUEUE_OWNER,enabled:true});
 const tick=()=>{if(stopped||pending)return;pending=runner.tick().then(r=>{last=r.state;},()=>{last='unavailable';}).finally(()=>{pending=null;});};
 return {start(){if(timer||stopped)return;timer=runEvery(tick,5000);timer?.unref?.();},async stop(){stopped=true;if(timer)clearEvery(timer);timer=null;await pending;},status:()=>({enabled:true,active:!!pending,last})};
}
