import {verifyAcknowledgementTemplate,updhanWhatsappTemplate} from './whatsapp-contract.mjs';
// Deliberately independent of the sending adapter. Exactly two metadata GETs;
// no message endpoint, no key creation, no secret/body logging, no retry.
export async function inspectUpdhanProvider({env,fetchImpl=fetch}){
 const required=['UPDHAN_FLOW_API_KEY','UPDHAN_FLOW_API_SECRET','UPDHAN_FLOW_CHANNEL_ID'];
 if(required.some(k=>typeof env[k]!=='string'||!env[k].trim()))throw Error('Read-only provider credentials required');
 const get=async path=>{const r=await fetchImpl('https://vardhmanflow.com/api/v1/'+path,{method:'GET',headers:{'X-API-Key':env.UPDHAN_FLOW_API_KEY,'X-API-Secret':env.UPDHAN_FLOW_API_SECRET,'X-Channel-Id':env.UPDHAN_FLOW_CHANNEL_ID},redirect:'error',signal:AbortSignal.timeout(10000)});if(!r.ok)throw Error('Provider metadata HTTP '+r.status);const j=await r.json();if(j.success!==true||!j.data)throw Error('Provider metadata invalid');return j.data;};
 const account=await get('account'),templates=await get('templates?status=APPROVED');
 const t=Array.isArray(templates)?templates.find(t=>t.name===updhanWhatsappTemplate.name):null;
 return {readOnly:true,requests:2,channelMatches:account.channel?.id===env.UPDHAN_FLOW_CHANNEL_ID,channelActive:account.channel?.isActive===true,channelHealthy:account.channel?.healthStatus==='healthy',templateFound:!!t,templateExact:verifyAcknowledgementTemplate(t),providerTemplateId:typeof t?.id==='string'?t.id:null,metaIdMatches:String(t?.metaTemplateId??t?.id)===updhanWhatsappTemplate.metaId,language:t?.language??null,status:t?.status??null,category:t?.category??null,componentEvidenceComplete:Array.isArray(t?.components),rateBudgetVerified:false,sendingEnabled:false};
}
