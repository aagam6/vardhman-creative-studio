import {bilingualCatalog} from './bilingual-template-adapter.mjs';
import {createProductionNotificationSender} from './notification-sender.mjs';
import {normalizePhone} from './vardhmanflow.mjs';
export function createNotificationService({pool,config,flow,key}){
 const catalog=structuredClone(bilingualCatalog);
 const provider={
  async validate(purpose){if(purpose==='pass_link')return flow.verifyCombinedPass();const t=catalog.find(t=>t.purpose===purpose);if(!t)throw Error('Unknown purpose');t.approvalEvidence=await flow.verifyBilingual(t);},
  async submit(p){try{const r=await flow.sendPrepared({to:normalizePhone(p.to),templateName:p.name,language:p.language.code,components:p.components});return {providerId:r.id,status:r.status==='failed'?'rejected':r.status};}catch(e){if(e.providerRejected)return {status:e.providerRejected===429?'rate_limited':'rejected'};throw e;}},
  async status(id){return flow.messageStatus(id);}
 };
 return createProductionNotificationSender({pool,config,key,provider,catalog});
}
