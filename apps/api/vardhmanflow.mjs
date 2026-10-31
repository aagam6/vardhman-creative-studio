import {selectEntryRuntimeCatalog,reviewedEntryRuntimeDefinition} from './entry-runtime-revision.mjs';
import {reviewedBilingualDefinition} from './bilingual-snapshot-policy.mjs';
import {ApiError} from './config.mjs';
import {notificationTemplates} from './notification-context.mjs';
import {reviewedTemplateBodies} from './reviewed-template-bodies.mjs';
import {productionSnapshotsApproved,productionTemplatePolicy} from './production-template-policy.mjs';
import bilingualCatalog from './bilingual-template-catalog.json' with {type:'json'};
import {verifyEntryRevision as verifyEntryRevisionDefinition,entryRevisionPolicy} from './entry-timing-revision-policy.mjs';
export function bilingualDefinitionMetadata(templates,expected){
 // /templates.id is the provider's UUID, never the numeric Meta template ID.
 const candidates=Array.isArray(templates)?templates.filter(t=>t?.name===expected.name):[];
 const matches=candidates.filter(t=>t.language===expected.languageCode);
 const t=matches[0]||candidates[0];
 const uuid=typeof t?.id==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(t.id);
 const issues=[];const check=(ok,field)=>{if(!ok)issues.push(field);};
 check(!!t,'template.missing');
 if(t){
  check(uuid,'id');check(matches.length===1,'template.unique');check(!uuid||templates.filter(x=>x?.id===t.id).length===1,'providerId.unique');check(t.name===expected.name,'name');check(t.language===expected.languageCode,'language');check(t.status==='APPROVED','status');check(String(t.category).toUpperCase()==='UTILITY','category');
  const c=Array.isArray(t.components)?t.components:[];
  check(Array.isArray(t.components),'components.missing');
  const ofType=type=>c.filter(x=>String(x?.type).toUpperCase()===type);
  const bodies=ofType('BODY'),headers=ofType('HEADER'),buttonComponents=ofType('BUTTONS');
  check(bodies.length===1,'BODY.count');check(bodies[0]?.text===expected.body,'BODY.text');
  check(headers.length===1,'HEADER.count');check(headers[0]?.text===expected.header,'HEADER.text');
  if(expected.footer){const footer=ofType('FOOTER');check(footer.length===1&&footer[0].text===expected.footer,'FOOTER.text');}
  check(c.every(x=>(expected.footer?['BODY','HEADER','FOOTER','BUTTONS']:['BODY','HEADER','BUTTONS']).includes(String(x?.type).toUpperCase())),'components.unsupported');
  const buttons=buttonComponents[0]?.buttons;
  check(buttonComponents.length<2,'CTA.count');
  check((buttonComponents.length===0?0:Array.isArray(buttons)?buttons.length:-1)===(expected.button?1:0),'CTA.count');
  if(expected.button){check(String(buttons?.[0]?.type).toUpperCase()==='URL','CTA.type');check(buttons?.[0]?.text===expected.button,'CTA.text');check(buttons?.[0]?.url===expected.dynamicUrl,'CTA.url');}
 }
 return {providerIdStatus:!t||!Object.hasOwn(t,'id')?'missing':uuid?'valid_uuid':'invalid_uuid',providerTemplateId:uuid?t.id:null,metaTemplateId:expected.templateId,metaIdSource:'reviewed_catalog',identityVerified:!!t&&uuid&&matches.length===1&&templates.filter(x=>x?.id===t.id).length===1&&t.language===expected.languageCode&&t.status==='APPROVED'&&String(t.category).toUpperCase()==='UTILITY',providerComponentsAvailable:Array.isArray(t?.components),name:expected.name,templateId:expected.templateId,language:t?.language===expected.languageCode?expected.languageCode:null,status:['APPROVED','PENDING','REJECTED','PAUSED','DISABLED'].includes(t?.status)?t.status:null,category:String(t?.category).toUpperCase()==='UTILITY'?'UTILITY':null,verified:issues.length===0,issues,source:'authenticated_provider_definition'};
}
export function normalizePhone(value){const digits=String(value||'').replace(/[+\s()-]/g,'');const number=/^[6-9]\d{9}$/.test(digits)?'91'+digits:digits;if(!/^[1-9]\d{7,14}$/.test(number))throw new ApiError(400,'Valid international WhatsApp number required');return number;}
export function testBodyOverrideApproved(env){
 if(env.AYAMBIL_WHATSAPP_TEST_BODY_OVERRIDE!=='true')return false;
 if(env.AYAMBIL_STAGING_BUILD!=='true'||env.AYAMBIL_SITE_ORIGIN!=='https://white-reindeer-590806.hostingersite.com'||env.AYAMBIL_WHATSAPP_NORMAL_PROCESSING_APPROVED==='true')throw new ApiError(403,'BODY compatibility test requires the isolated staging origin/build and normal processing disabled');
 return true;
}
export function templateMetadata(template,mapping,{operatorSnapshots=false,requireReviewedBodies=false}={}){
 const snapshot=operatorSnapshots&&!Object.hasOwn(template,'components')&&Object.hasOwn(reviewedTemplateBodies,template.name);
 const components=snapshot?[{type:'BODY',text:reviewedTemplateBodies[template.name]}]:template.components;
 const body=Array.isArray(components)?components.find(c=>String(c?.type).toUpperCase()==='BODY'):null;
 const bodyAvailable=typeof body?.text==='string'&&!!body.text.trim();
 const indexes=bodyAvailable?[...body.text.matchAll(/\{\{\s*(\d+)\s*\}\}/g)].map(m=>Number(m[1])):[];
 const formatSupported=bodyAvailable&&components.length===1&&!/\{\{|\}\}/.test(body.text.replace(/\{\{\s*\d+\s*\}\}/g,''))&&indexes.every((n,i)=>n===i+1);
 const expected=Object.values(notificationTemplates).find(v=>v.name===template.name);
 const mappingVerified=!!expected&&mapping?.name===template.name&&mapping?.language===template.language&&JSON.stringify(mapping.fields)===JSON.stringify(expected.fields)&&indexes.length===expected.fields.length;
 const reviewedBodyMatches=!requireReviewedBodies||(Object.hasOwn(reviewedTemplateBodies,template.name)&&body?.text===reviewedTemplateBodies[template.name]);
 const verified=template.status==='APPROVED'&&template.language==='en'&&formatSupported&&mappingVerified&&reviewedBodyMatches;
 return {bodyAvailable,bodySource:bodyAvailable?(snapshot?'operator_reviewed_snapshot':'provider'):'unavailable',placeholderCount:bodyAvailable?indexes.length:null,placeholderIndexes:indexes,componentsVerified:verified&&!snapshot,verified,verification:template.status!=='APPROVED'||template.language!=='en'?'approval_or_language_mismatch':!bodyAvailable?'approved_body_unavailable':!formatSupported?'unsupported_body_definition':!mappingVerified?'mapping_mismatch':snapshot?'operator_snapshot_mapping_validated':'provider_body_verified'};
}
export function createFlow(env,fetcher=fetch){
 const metadataOptions={operatorSnapshots:(env.AYAMBIL_STAGING_BUILD==='true'&&env.AYAMBIL_SITE_ORIGIN==='https://white-reindeer-590806.hostingersite.com')||productionSnapshotsApproved(env),requireReviewedBodies:productionSnapshotsApproved(env)};
 const base=env.VARDHMAN_FLOW_BASE_URL||'https://vardhmanflow.com/api/v1';
 const missing=['VARDHMAN_FLOW_API_KEY','VARDHMAN_FLOW_API_SECRET'].filter(k=>!env[k]);
 if(base!=='https://vardhmanflow.com/api/v1')missing.push('VARDHMAN_FLOW_BASE_URL');
 let calls=[],recentRequests=[],lastResponse=null,cooldownUntil=0;
 const operation=suffix=>suffix==='account'?'account':suffix.startsWith('templates')?'templates':suffix.startsWith('messages/status/')?'message_status':suffix==='messages/template'?'message_submit':'other';
 const budget=()=>({scope:'this createFlow instance/process; provider key is shared beyond this process',localLimitPerMinute:50,documentedProviderLimitPerMinutePerKey:60,recentRequests:recentRequests.filter(r=>r.at>Date.now()-60000).reduce((a,r)=>(a[r.operation]=(a[r.operation]||0)+1,a),{}),cooldownUntil:cooldownUntil?new Date(cooldownUntil).toISOString():null,lastResponse:lastResponse?structuredClone(lastResponse):null});
 const request=async (suffix,body)=>{
  if(missing.length)throw new ApiError(503,'Vardhman Flow configuration required');
  if(Date.now()<cooldownUntil)throw Object.assign(new ApiError(429,'Provider cooldown active; no request made'),{code:'PROVIDER_COOLDOWN'});
  calls=calls.filter(t=>Date.now()-t<60000);if(calls.length>=50)throw Object.assign(new ApiError(429,'Provider check rate limit reached'),{code:'LOCAL_FLOW_BUDGET'});calls.push(Date.now());recentRequests=recentRequests.filter(r=>r.at>Date.now()-60000);recentRequests.push({at:Date.now(),operation:operation(suffix)});
  const headers={'X-API-Key':env.VARDHMAN_FLOW_API_KEY,'X-API-Secret':env.VARDHMAN_FLOW_API_SECRET};if(env.VARDHMAN_FLOW_CHANNEL_ID)headers['X-Channel-Id']=env.VARDHMAN_FLOW_CHANNEL_ID;
  try{
   if(body)headers['Content-Type']='application/json';
   const response=await fetcher(base+'/'+suffix,{method:body?'POST':'GET',body:body?JSON.stringify(body):undefined,headers,signal:AbortSignal.timeout(10000),redirect:'error'});
   const observed=Date.now(),retry=response.headers.get('retry-after');
   const retrySeconds=retry&&/^\d{1,9}$/.test(retry)?Number(retry):retry&&Number.isFinite(Date.parse(retry))?Math.max(0,Math.ceil((Date.parse(retry)-observed)/1000)):null;
   const providerId=response.headers.get('x-request-id')||response.headers.get('request-id')||response.headers.get('cf-ray');
   lastResponse={operation:operation(suffix),method:body?'POST':'GET',status:response.status,observedAt:new Date(observed).toISOString(),retryAfterPresent:retry!==null,retryAfterSeconds:retrySeconds,providerRequestId:/^[a-zA-Z0-9_.:-]{1,200}$/.test(providerId||'')?providerId:null};
   if(response.status===429){cooldownUntil=observed+Math.max(60,retrySeconds??60)*1000;lastResponse.cooldownBasis=retrySeconds===null?'local conservative minimum; provider reset unknown':'provider Retry-After with local minimum60s';}
   if(!response.ok){
    const messages={400:'Provider rejected parameters; verify template count and format',401:'Provider rejected authentication; verify private credentials',403:'Provider rejected permission or channel access',404:'Provider route or template unavailable',409:'Provider resource conflict; do not retry blindly',429:'Provider rate limit exceeded; no automatic send retry'};
    const error=new ApiError(response.status===429?429:503,messages[response.status]||'Provider request failed; acceptance not confirmed');
    error.code='PROVIDER_HTTP_'+response.status;
    if(body&&messages[response.status])error.providerRejected=response.status;
    throw error;
   }
   if(!/application\/json/i.test(response.headers.get('content-type')||''))throw Object.assign(new ApiError(503,'Provider JSON unavailable'),{code:'PROVIDER_INVALID_JSON'});
   const parsed=await response.json();if(parsed.success!==true||!parsed.data)throw new Error();return parsed.data;
  }catch(error){if(error instanceof ApiError)throw error;throw Object.assign(new ApiError(503,'Provider request unavailable; acceptance not confirmed'),{code:'PROVIDER_TRANSPORT_UNAVAILABLE'});}
 };
 return {
  async rateProbe(){try{const account=await request('account');return {recovered:true,providerStatus:200,budget:budget(),usage:{requestCount:Number.isFinite(account.usage?.requestCount)?account.usage.requestCount:null,monthlyRequestCount:Number.isFinite(account.usage?.monthlyRequestCount)?account.usage.monthlyRequestCount:null},channelHealthy:account.channel?.isActive===true&&account.channel?.healthStatus==='healthy'};}catch(e){return {recovered:false,providerStatus:e.code==='PROVIDER_COOLDOWN'||e.code==='LOCAL_FLOW_BUDGET'?null:budget().lastResponse?.status||null,blockedLocally:['PROVIDER_COOLDOWN','LOCAL_FLOW_BUDGET'].includes(e.code),code:/^(?:PROVIDER_[A-Z0-9_]+|LOCAL_FLOW_BUDGET)$/.test(e.code||'')?e.code:'PROBE_UNAVAILABLE',budget:budget()};}},
  configuration(){return {providerBudget:budget(),ready:false,configured:missing.length===0,missing,sending:env.AYAMBIL_WHATSAPP_ENABLED==='true',testBodyOverride:env.AYAMBIL_WHATSAPP_TEST_BODY_OVERRIDE==='true'&&env.AYAMBIL_STAGING_BUILD==='true'&&env.AYAMBIL_SITE_ORIGIN==='https://white-reindeer-590806.hostingersite.com'&&env.AYAMBIL_WHATSAPP_NORMAL_PROCESSING_APPROVED!=='true',reason:'Outbound workflow and approved template mappings require verification'};},
  compatibilityContext(eventDate){return testBodyOverrideApproved(env)?{to:normalizePhone(env.AYAMBIL_WHATSAPP_TEST_RECIPIENT),compatibilityTest:true,testEventDate:eventDate}:null;},
  async prepare(type,context){
   const compatibility=context.compatibilityTest===true;
   if(compatibility&&(type!=='test'||!testBodyOverrideApproved(env)||context.to!==normalizePhone(env.AYAMBIL_WHATSAPP_TEST_RECIPIENT)))throw new ApiError(403,'Authorized isolated compatibility test required');
   if(type==='test')type='confirmation'; // Reuse the reviewed approved confirmation contract.
   await this.inspect();
   let mappings;try{mappings=JSON.parse(env.AYAMBIL_FLOW_TEMPLATE_MAPPINGS);}catch{throw new ApiError(503,'Template mappings required');}
   if(!mappings||typeof mappings!=='object'||Array.isArray(mappings))throw new ApiError(503,'Template mappings required');
   const mapping=mappings[type+'_'+String(compatibility?context.testEventDate:context.eventDate||'').slice(-2)]||mappings[type];
   if(!mapping||typeof mapping.name!=='string'||typeof mapping.language!=='string'||!Array.isArray(mapping.fields))throw new ApiError(503,'Notification template mapping missing');
   const expected=notificationTemplates[type];
   if(expected&&(mapping.name!==expected.name||JSON.stringify(mapping.fields)!==JSON.stringify(expected.fields)))throw new ApiError(503,'Reviewed notification variable mapping required');
   const templates=await request('templates?status=APPROVED');const template=templates.find(t=>t.status==='APPROVED'&&t.name===mapping.name&&t.language===mapping.language);
   if(compatibility&&!['2026-11-02','2026-11-03'].includes(context.testEventDate))throw new ApiError(400,'Approved test evening required');
   const metadata=template&&templateMetadata(template,mapping,metadataOptions);
   if(!metadata?.verified||!['02','03'].every(day=>{const candidate=mappings[type+'_'+day]||mappings[type];return !candidate||templateMetadata(template,candidate,metadataOptions).verified;}))throw new ApiError(503,'Approved BODY definition and exact reviewed mapping required for configured evenings');
   const slots=metadata.placeholderIndexes;
   const allowed=['eventName','eventDate','time','performer','programme','venue','contactName','attendeeNames','attendeeCount','passLink','attendeeName','venueLocationUrl'];
   if(slots.length!==mapping.fields.length||slots.some((n,i)=>n!==i+1)||mapping.fields.some(f=>!allowed.includes(f)||(!compatibility&&(typeof context[f]!=='string'||!context[f].trim()))))throw new ApiError(503,'Template variables mismatch');
   return {to:normalizePhone(context.to),templateName:mapping.name,language:mapping.language,components:[{type:'body',parameters:mapping.fields.map((f,i)=>({type:'text',text:compatibility?`TEST VALUE ${i+1}`:context[f]}))}]};
  },
  async verifyBilingual(template){
   const account=await request('account');const channel=account.channel;
   if(!channel?.id||channel.isActive!==true||channel.healthStatus!=='healthy'||(env.VARDHMAN_FLOW_CHANNEL_ID&&env.VARDHMAN_FLOW_CHANNEL_ID!==channel.id))throw new ApiError(503,'Healthy channel required');
   const templates=await request('templates?status=APPROVED');
   const diagnostic=reviewedEntryRuntimeDefinition(templates,template,env,reviewedBilingualDefinition(templates,template,env,bilingualDefinitionMetadata(templates,template)));
   if(!diagnostic.verified)throw new ApiError(503,'Bilingual provider definition failed: '+diagnostic.issues.join(', '));
   return {verified:true,templateId:template.templateId,status:'APPROVED',category:'UTILITY',observedAt:new Date().toISOString(),source:diagnostic.source,...(diagnostic.snapshotPolicy?{snapshotPolicy:diagnostic.snapshotPolicy,providerComponentsVerified:false}:{providerComponentsVerified:true})};
  },
  // Explicit opt-in verification seam for a future reviewed revision rollout.
  // This does not select a catalog, prepare an intent, or activate dispatch.
  async verifyEntryRevision({uiEvidence}={}){
   if(env.AYAMBIL_SITE_ORIGIN!=='https://vardhmancreativestudio.com'||env.AYAMBIL_ENTRY_REVISION_POLICY!==entryRevisionPolicy.version||env.AYAMBIL_ENTRY_REVISION_SHA256!==entryRevisionPolicy.definitionHash)throw new ApiError(503,'Explicit versioned entry revision policy required');
   const account=await request('account'),templates=await request('templates?status=APPROVED');
   return verifyEntryRevisionDefinition({templates,channel:account.channel,configuredChannelId:env.VARDHMAN_FLOW_CHANNEL_ID,policy:entryRevisionPolicy,uiEvidence,observedAt:new Date().toISOString()});
  },
  async verifyCombinedPass(){return this.verifyLegacyNotification('pass');},
  async verifyReminder(){return this.verifyLegacyNotification('reminder');},
  async verifyLegacyNotification(type){
   if(!['pass','reminder'].includes(type))throw new ApiError(400,'Unsupported notification contract');
   const account=await request('account'),channel=account.channel;
   if(!channel?.id||channel.isActive!==true||channel.healthStatus!=='healthy'||!env.VARDHMAN_FLOW_CHANNEL_ID||env.VARDHMAN_FLOW_CHANNEL_ID!==channel.id)throw new ApiError(503,'Healthy configured channel required');
   const templates=await request('templates?status=APPROVED');
   const matches=Array.isArray(templates)?templates.filter(t=>t.name===notificationTemplates[type].name&&t.language==='en'):[];
   const t=matches[0],uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
   let mappings;try{mappings=JSON.parse(env.AYAMBIL_FLOW_TEMPLATE_MAPPINGS||'{}');}catch{throw new ApiError(503,'Reviewed pass mapping required');}
   const mapping={...notificationTemplates[type],language:'en'};
   if(matches.length!==1||!uuid.test(t?.id||'')||templates.filter(x=>x.id===t.id).length!==1||t.status!=='APPROVED'||String(t.category).toUpperCase()!=='UTILITY'||!['02','03'].every(day=>{const m=mappings[type+'_'+day]||mappings[type];return m?.name===mapping.name&&m.language==='en'&&JSON.stringify(m.fields)===JSON.stringify(mapping.fields);}))throw new ApiError(503,'Approved Utility pass/reminder identity/mapping required');
   const metadata=templateMetadata(t,mapping,{...metadataOptions,requireReviewedBodies:true});
   if(!metadata.verified)throw new ApiError(503,'Exact reviewed pass BODY required');
   return {verified:true,name:t.name,providerTemplateId:t.id,language:'en',status:'APPROVED',category:'UTILITY',source:metadata.bodySource,observedAt:new Date().toISOString()};
  },
  async sendPrepared(payload){
   if(env.AYAMBIL_WHATSAPP_ENABLED!=='true')throw new ApiError(403,'Sending not enabled');
   const data=await request('messages/template',payload);if(typeof data.messageId!=='string'||!data.messageId||data.messageId.length>200)throw new ApiError(503,'Provider acceptance unknown');
   const status=data.status==='queued'?'accepted':data.status;if(!['accepted','sent','delivered','read','failed'].includes(status))throw new ApiError(503,'Provider status unknown');return {id:data.messageId,status:['delivered','read'].includes(status)?'accepted':status};
  },
  async messageStatus(id){if(typeof id!=='string'||!id||id.length>200)throw new ApiError(400,'Invalid provider reference');const data=await request('messages/status/'+encodeURIComponent(id));if(data.id!==id||!['queued','sent','delivered','read','failed'].includes(data.status))throw Object.assign(new ApiError(503,'Provider status not verified'),{code:'PROVIDER_STATUS_MISMATCH'});return {status:data.status==='queued'?'accepted':data.status};},
  async recipientReceipts(mobile){
   const data=await request('messages/'+encodeURIComponent(normalizePhone(mobile))+'?limit=50&offset=0');
   if(!Array.isArray(data.messages)||!Number.isInteger(data.total)||data.total<0||data.total>50||data.messages.length!==data.total)throw new ApiError(503,'Complete recipient receipt history unavailable');
   return data.messages.map(m=>{if(typeof m.id!=='string'||!m.id||m.id.length>200)throw new ApiError(503,'Provider receipt identity missing');const template=m.templateName||m.template_name||(/^\[template: ([a-z0-9_]+)\]$/.exec(m.body||m.content||'')||[])[1]||null;return {id:m.id,template,status:m.status,createdAt:m.createdAt||m.created_at||null};});
  },
  async recipientHistory(mobile){const phone=normalizePhone(mobile);let data;try{data=await request('messages/'+encodeURIComponent(phone)+'?limit=50&offset=0');}catch(e){console.error(JSON.stringify({operation:'recipient_history_contract',stage:'provider_get',code:/^[A-Z0-9_]{1,64}$/.test(e.code||'')?e.code:'unavailable',status:lastResponse?.status||null}));throw e;}const issues=[];if(!Array.isArray(data.messages))issues.push('messages_missing');if(!Number.isInteger(data.total)||data.total<0)issues.push('total_invalid');if(data.total>50)issues.push('history_exceeds_page');if(Array.isArray(data.messages)&&data.messages.length!==data.total)issues.push('incomplete_page');if(Array.isArray(data.messages)&&data.messages.some(m=>typeof m.id!=='string'||!m.id||m.id.length>200))issues.push('message_id_missing');if(issues.length){console.error(JSON.stringify({operation:'recipient_history_contract',stage:'definition',issues,totalType:typeof data.total,total:Number.isInteger(data.total)?data.total:null,rows:Array.isArray(data.messages)?data.messages.length:null,idPresent:Array.isArray(data.messages)?data.messages.every(m=>typeof m.id==='string'):false,messageIdPresent:Array.isArray(data.messages)?data.messages.every(m=>typeof m.messageId==='string'):false}));throw new ApiError(503,'Complete recipient history unavailable');}const nonTemplateOnly=data.messages.every(m=>['text','image','document','audio','video','sticker','location','contacts','reaction'].includes(m.type)&&!m.templateName&&!m.template_name&&!m.template&&!/^\[template:/i.test(String(m.body||m.content||'')));return {ids:data.messages.map(m=>m.id),total:data.total,nonTemplateOnly};},
  async inspect({templateDefinitions=false}={}){
   const account=await request('account');const channel=account.channel;
   if(!channel?.id||channel.isActive!==true||channel.healthStatus!=='healthy'||(env.VARDHMAN_FLOW_CHANNEL_ID&&env.VARDHMAN_FLOW_CHANNEL_ID!==channel.id))throw new ApiError(503,'Active healthy channel not verified');
   const templates=await request('templates?status=APPROVED');if(!Array.isArray(templates))throw new ApiError(503,'Approved template response unavailable');
   // Only non-secret, known fields; never forward raw account/usage/error payloads.
   const expected=['ayambil_registration_confirm','ayambil_pass_ready','ayambil_event_reminder'];
   let mappings={};try{mappings=JSON.parse(env.AYAMBIL_FLOW_TEMPLATE_MAPPINGS||'{}')||{};}catch{}
   const approved=templates.filter(t=>t.status==='APPROVED'&&typeof t.name==='string'&&typeof t.language==='string'&&(!templateDefinitions||expected.includes(t.name))).map(t=>{
    const type=Object.keys(notificationTemplates).find(k=>notificationTemplates[k].name===t.name);
    const applicable=type?[mappings[type+'_02']||mappings[type],mappings[type+'_03']||mappings[type]]:[];
    const metadata=templateMetadata(t,applicable[0],metadataOptions);
    if(metadata.verified&&!applicable.every(m=>templateMetadata(t,m,metadataOptions).verified))Object.assign(metadata,{verified:false,componentsVerified:false,verification:'mapping_mismatch'});
   return {name:t.name,language:t.language,...metadata,...(productionSnapshotsApproved(env)&&metadata.bodySource==='operator_reviewed_snapshot'?{policyVersion:productionTemplatePolicy.version}:{} )};
   });
   return {...this.configuration(),accountVerified:true,channel:{active:true,health:'healthy',configuredIdMatched:env.VARDHMAN_FLOW_CHANNEL_ID?true:null,phoneConfigured:!!normalizePhone(channel.phoneNumber)},templates:approved,...(templateDefinitions?{bilingualTemplates:selectEntryRuntimeCatalog(bilingualCatalog,env).map(t=>reviewedEntryRuntimeDefinition(templates,t,env,reviewedBilingualDefinition(templates,t,env,bilingualDefinitionMetadata(templates,t)))),definitionObservedAt:new Date().toISOString()}:{}),usage:{requestCount:Number.isFinite(account.usage?.requestCount)?account.usage.requestCount:null,monthlyRequestCount:Number.isFinite(account.usage?.monthlyRequestCount)?account.usage.monthlyRequestCount:null}};
  }
 };
}
