import {selectEntryRuntimeCatalog} from './entry-runtime-revision.mjs';
import {bilingualCatalog} from './bilingual-template-adapter.mjs';
import {createProductionNotificationSender} from './notification-sender.mjs';
import {normalizePhone} from './vardhmanflow.mjs';
import {LIVE_UPDATE_PURPOSE} from './registered-live-update-payload.mjs';
export function createNotificationService({pool,config,flow,key,env=process.env}){
 const catalog=selectEntryRuntimeCatalog(bilingualCatalog,env);
 const wire=p=>({to:normalizePhone(p.to),templateName:p.name,language:p.language.code,components:p.components});
 const provider={
  async validate(purpose){if(purpose===LIVE_UPDATE_PURPOSE)return flow.verifyLiveUpdate();if(purpose==='pass_link')return flow.verifyCombinedPass();const t=catalog.find(t=>t.purpose===(purpose==='reminder'?'entry_timing':purpose));if(!t)throw Error('Unknown purpose');t.approvalEvidence=await flow.verifyBilingual(t);},
  async reserve(p){return flow.reserveTemplateSubmission(wire(p));},
  async submit(p,{reservation}={}){try{const r=await flow.sendPrepared(wire(p),{reservation});return {providerId:r.id,status:r.status==='failed'?'rejected':r.status};}catch(e){if(e.providerRejected)return {status:e.providerRejected===429?'rate_limited':'rejected'};throw e;}},
  async status(id){return flow.messageStatus(id);},
  async recipientHistory(mobile){return flow.recipientHistory(mobile);},
  async recipientReceipts(mobile){return flow.recipientReceipts(mobile);}
 };
 return createProductionNotificationSender({pool,config,key,provider,catalog});
}
