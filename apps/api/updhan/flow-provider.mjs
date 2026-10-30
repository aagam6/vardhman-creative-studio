import {acknowledgementPayload,verifyAcknowledgementTemplate,updhanWhatsappTemplate} from './whatsapp-contract.mjs';

const base='https://vardhmanflow.com/api/v1';
export class UpdhanProviderError extends Error{constructor(code,{acceptanceUnknown=false,rejected=false}={}){super(code);this.code=code;this.acceptanceUnknown=acceptanceUnknown;this.rejected=rejected;}}
// Separate Updhan adapter. Never reads AYAMBIL_* settings, sends PDFs, creates
// templates, starts timers or connects at import. Every network path is opt-in.
export function createUpdhanFlowProvider({env={},fetchImpl=fetch,allowNetwork=false,reserveSendBudget,reserveRequestBudget=reserveSendBudget}={}){
 const configured=['UPDHAN_FLOW_API_KEY','UPDHAN_FLOW_API_SECRET','UPDHAN_FLOW_CHANNEL_ID'].every(k=>typeof env[k]==='string'&&env[k].trim());
 const enabled=allowNetwork&&configured&&env.UPDHAN_WHATSAPP_ENABLED==='true'&&env.UPDHAN_WHATSAPP_ACTIVATION_APPROVED==='true';
 function guard(){if(!enabled)throw new UpdhanProviderError('updhan_sending_disabled');}
 async function request(path,body){
  guard();if(typeof reserveRequestBudget!=='function'||await reserveRequestBudget({method:body?'POST':'GET',path})!==true)throw new UpdhanProviderError('shared_rate_budget_unavailable',{rejected:!!body});let response;
  try{response=await fetchImpl(base+'/'+path,{method:body?'POST':'GET',headers:{'X-API-Key':env.UPDHAN_FLOW_API_KEY,'X-API-Secret':env.UPDHAN_FLOW_API_SECRET,'X-Channel-Id':env.UPDHAN_FLOW_CHANNEL_ID,...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{}),redirect:'error',signal:AbortSignal.timeout(10000)});}catch{throw new UpdhanProviderError('provider_outcome_unknown',{acceptanceUnknown:!!body});}
  if(!response.ok){const rejected=!!body&&[400,401,403,404,422,429].includes(response.status);throw new UpdhanProviderError('provider_http_'+response.status,{rejected,acceptanceUnknown:!!body&&!rejected});}
  let result;try{if(!response.headers.get('content-type')?.includes('application/json'))throw Error();result=await response.json();if(result?.success!==true||!result.data)throw Error();}catch{throw new UpdhanProviderError('provider_invalid_response',{acceptanceUnknown:!!body});}return result.data;
 }
 return {
  configuration(){return {configured,enabled,template:updhanWhatsappTemplate.name,language:'hi',category:'UTILITY',attachments:false};},
  async prepare(input){
   const payload=acknowledgementPayload(input);guard();
   const account=await request('account');if(account.channel?.id!==env.UPDHAN_FLOW_CHANNEL_ID||account.channel.isActive!==true||account.channel.healthStatus!=='healthy')throw new UpdhanProviderError('channel_not_verified');
   const templates=await request('templates?status=APPROVED');if(!Array.isArray(templates)||!templates.some(verifyAcknowledgementTemplate))throw new UpdhanProviderError('acknowledgement_template_not_verified');
   return payload;
  },
  async sendPrepared(payload){
   const expected=acknowledgementPayload({name:payload?.components?.[0]?.parameters?.[0]?.text,reference:payload?.components?.[0]?.parameters?.[1]?.text,to:payload?.to});if(JSON.stringify(payload)!==JSON.stringify(expected))throw new UpdhanProviderError('unreviewed_payload');
   const result=await request('messages/template',payload);
   if(typeof result.messageId!=='string'||!/^[^\s\x00-\x1f\x7f]{1,180}$/.test(result.messageId)||!['queued','accepted','sent','delivered','read','failed'].includes(result.status))throw new UpdhanProviderError('provider_acceptance_unknown',{acceptanceUnknown:true});
   // Send response cannot independently prove delivered/read.
   return {providerReference:result.messageId,state:result.status==='failed'?'failed':'submitted'};
  },
  async status(providerReference){if(typeof providerReference!=='string'||!/^[^\s\x00-\x1f\x7f]{1,200}$/.test(providerReference))throw new UpdhanProviderError('invalid_provider_reference');const result=await request('messages/status/'+encodeURIComponent(providerReference));if(result.id!==providerReference||!['queued','accepted','sent','delivered','read','failed'].includes(result.status))throw new UpdhanProviderError('status_not_verified');return {state:['queued','accepted','sent'].includes(result.status)?'submitted':result.status};},
 };
}
