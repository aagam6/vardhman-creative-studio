import {ApiError} from './config.mjs';
import {notificationTemplates} from './notification-context.mjs';
export function normalizePhone(value){const digits=String(value||'').replace(/[+\s()-]/g,'');const number=/^[6-9]\d{9}$/.test(digits)?'91'+digits:digits;if(!/^[1-9]\d{7,14}$/.test(number))throw new ApiError(400,'Valid international WhatsApp number required');return number;}
export function createFlow(env,fetcher=fetch){
 const base=env.VARDHMAN_FLOW_BASE_URL||'https://vardhmanflow.com/api/v1';
 const missing=['VARDHMAN_FLOW_API_KEY','VARDHMAN_FLOW_API_SECRET'].filter(k=>!env[k]);
 if(base!=='https://vardhmanflow.com/api/v1')missing.push('VARDHMAN_FLOW_BASE_URL');
 let calls=[];
 const request=async (suffix,body)=>{
  if(missing.length)throw new ApiError(503,'Vardhman Flow configuration required');
  calls=calls.filter(t=>Date.now()-t<60000);if(calls.length>=50)throw new ApiError(429,'Provider check rate limit reached');calls.push(Date.now());
  const headers={'X-API-Key':env.VARDHMAN_FLOW_API_KEY,'X-API-Secret':env.VARDHMAN_FLOW_API_SECRET};if(env.VARDHMAN_FLOW_CHANNEL_ID)headers['X-Channel-Id']=env.VARDHMAN_FLOW_CHANNEL_ID;
  try{
   if(body)headers['Content-Type']='application/json';
   const response=await fetcher(base+'/'+suffix,{method:body?'POST':'GET',body:body?JSON.stringify(body):undefined,headers,signal:AbortSignal.timeout(10000),redirect:'error'});
   if(!response.ok)throw new ApiError(response.status===429?429:503,'Provider check failed; verify credentials, permissions and route');
   if(!/application\/json/i.test(response.headers.get('content-type')||''))throw new Error();
   const parsed=await response.json();if(parsed.success!==true||!parsed.data)throw new Error();return parsed.data;
  }catch(error){if(error instanceof ApiError)throw error;throw new ApiError(503,'Provider request unavailable; acceptance not confirmed');}
 };
 return {
  configuration(){return {ready:false,configured:missing.length===0,missing,sending:env.AYAMBIL_WHATSAPP_ENABLED==='true',reason:'Outbound workflow and approved template mappings require verification'};},
  async prepare(type,context){
   if(type==='test')type='confirmation'; // Reuse the reviewed approved confirmation contract.
   await this.inspect();
   let mappings;try{mappings=JSON.parse(env.AYAMBIL_FLOW_TEMPLATE_MAPPINGS);}catch{throw new ApiError(503,'Template mappings required');}
   const mapping=mappings[type+'_'+String(context.eventDate||'').slice(-2)]||mappings[type];
   if(!mapping||typeof mapping.name!=='string'||typeof mapping.language!=='string'||!Array.isArray(mapping.fields))throw new ApiError(503,'Notification template mapping missing');
   const expected=notificationTemplates[type];
   if(expected&&(mapping.name!==expected.name||JSON.stringify(mapping.fields)!==JSON.stringify(expected.fields)))throw new ApiError(503,'Reviewed notification variable mapping required');
   const templates=await request('templates?status=APPROVED');const template=templates.find(t=>t.status==='APPROVED'&&t.name===mapping.name&&t.language===mapping.language);
   if(!template||!Array.isArray(template.components)||template.components.length!==1||String(template.components[0].type).toLowerCase()!=='body'||typeof template.components[0].text!=='string')throw new ApiError(503,'Verified text-body template required');
   const slots=[...new Set([...template.components[0].text.matchAll(/\{\{\s*(\d+)\s*\}\}/g)].map(m=>Number(m[1])))].sort((a,b)=>a-b);
   const allowed=['eventName','eventDate','time','performer','programme','venue','contactName','attendeeNames','attendeeCount','passLink','attendeeName','venueLocationUrl'];
   if(slots.length!==mapping.fields.length||slots.some((n,i)=>n!==i+1)||mapping.fields.some(f=>!allowed.includes(f)||typeof context[f]!=='string'||!context[f].trim()))throw new ApiError(503,'Template variables mismatch');
   return {to:normalizePhone(context.to),templateName:mapping.name,language:mapping.language,components:[{type:'body',parameters:mapping.fields.map(f=>({type:'text',text:context[f]}))}]};
  },
  async sendPrepared(payload){
   if(env.AYAMBIL_WHATSAPP_ENABLED!=='true')throw new ApiError(403,'Sending not enabled');
   const data=await request('messages/template',payload);if(typeof data.messageId!=='string'||!data.messageId||data.messageId.length>200)throw new ApiError(503,'Provider acceptance unknown');
   const status=data.status==='queued'?'accepted':data.status;if(!['accepted','sent','delivered','read','failed'].includes(status))throw new ApiError(503,'Provider status unknown');return {id:data.messageId,status:['delivered','read'].includes(status)?'accepted':status};
  },
  async messageStatus(id){if(typeof id!=='string'||!id||id.length>200)throw new ApiError(400,'Invalid provider reference');const data=await request('messages/status/'+encodeURIComponent(id));if(data.id!==id||!['queued','sent','delivered','read','failed'].includes(data.status))throw new ApiError(503,'Provider status not verified');return {status:data.status==='queued'?'accepted':data.status};},
  async inspect({templateDefinitions=false}={}){
   const account=await request('account');const channel=account.channel;
   if(!channel?.id||channel.isActive!==true||channel.healthStatus!=='healthy'||(env.VARDHMAN_FLOW_CHANNEL_ID&&env.VARDHMAN_FLOW_CHANNEL_ID!==channel.id))throw new ApiError(503,'Active healthy channel not verified');
   const templates=await request('templates?status=APPROVED');if(!Array.isArray(templates))throw new ApiError(503,'Approved template response unavailable');
   // Only non-secret, known fields; never forward raw account/usage/error payloads.
   const expected=['ayambil_registration_confirm','ayambil_pass_ready','ayambil_event_reminder'];
   const approved=templates.filter(t=>t.status==='APPROVED'&&typeof t.name==='string'&&typeof t.language==='string'&&(!templateDefinitions||expected.includes(t.name))).map(t=>({name:t.name,language:t.language,componentsVerified:Array.isArray(t.components),...(templateDefinitions?{components:(Array.isArray(t.components)?t.components:[]).map(c=>({type:String(c.type||''),...(String(c.type).toUpperCase()==='BODY'&&typeof c.text==='string'?{text:c.text,placeholders:[...c.text.matchAll(/\{\{\s*(\d+)\s*\}\}/g)].map(m=>Number(m[1]))}:{})}))}:{})}));
   return {...this.configuration(),accountVerified:true,channel:{active:true,health:'healthy',phone:normalizePhone(channel.phoneNumber)},templates:approved,usage:{requestCount:Number.isFinite(account.usage?.requestCount)?account.usage.requestCount:null,monthlyRequestCount:Number.isFinite(account.usage?.monthlyRequestCount)?account.usage.monthlyRequestCount:null}};
  }
 };
}
