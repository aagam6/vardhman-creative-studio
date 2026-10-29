import {createHash} from 'node:crypto';
import {entryRevision,entryRevisionDefinitionHash} from './entry-timing-revision-preview.mjs';
const hash=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
export const entryRevisionPolicy=Object.freeze({version:'ayambil-entry-reviewed-2026-10-28-v2',definitionHash:entryRevisionDefinitionHash,activationDefault:false});
export function entryDefinitionProjection(t=entryRevision){return {name:t.name,metaTemplateId:t.templateId,languageCode:t.languageCode,category:'UTILITY',header:t.header,body:t.body,footer:t.footer,button:t.button,dynamicUrl:t.dynamicUrl};}
// Pure validator. API response must be supplied by the existing authenticated,
// rate-budgeted integration. No credentials, network, configuration or writes.
export function verifyEntryRevision({templates,channel,configuredChannelId,policy,uiEvidence,observedAt,now=Date.now()}){
 const issues=[];const check=(ok,field)=>{if(!ok)issues.push(field);};const t=entryRevision;
 check(channel?.id&&channel.id===configuredChannelId&&channel.isActive===true&&channel.healthStatus==='healthy','channel');
 const age=now-Date.parse(observedAt);check(Number.isFinite(age)&&age>=0&&age<=86400000,'apiEvidence.freshness');
 const matches=Array.isArray(templates)?templates.filter(x=>x?.name===t.name&&x.language===t.languageCode):[],actual=matches[0];
 check(matches.length===1,'template.unique');
 check(/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(actual?.id||''),'providerUUID');
 check(!!actual&&templates.filter(x=>x.id===actual.id).length===1,'providerUUID.unique');
 check(actual?.status==='APPROVED','status');check(actual?.category==='UTILITY','category');
 if(actual&&Object.hasOwn(actual,'metaTemplateId'))check(String(actual.metaTemplateId)===t.templateId,'suppliedMetaId');
 const expected=entryDefinitionProjection();check(hash(expected)===entryRevisionDefinitionHash,'snapshot.integrity');
 let source='unverified';
 if(actual&&Object.hasOwn(actual,'components')){
  const c=actual.components;check(Array.isArray(c),'components.format');
  if(Array.isArray(c)){
   const of=type=>c.filter(x=>String(x?.type).toUpperCase()===type);
   for(const [type,field] of [['HEADER','header'],['BODY','body'],['FOOTER','footer']])check(of(type).length===1&&of(type)[0].text===t[field],type+'.text');
   const buttons=of('BUTTONS');check(buttons.length===1&&buttons[0].buttons?.length===1,'CTA.count');const b=buttons[0]?.buttons?.[0];check(b?.type==='URL'&&b.text===t.button&&b.url===t.dynamicUrl,'CTA.definition');
   check(c.every(x=>['HEADER','BODY','FOOTER','BUTTONS'].includes(String(x?.type).toUpperCase())),'components.unsupported');
  }source='authenticated_api_components';
 }else{
  check(policy?.version===entryRevisionPolicy.version&&policy.definitionHash===entryRevisionDefinitionHash,'explicitVersionedPolicy');
  const uiAge=now-Date.parse(uiEvidence?.observedAt);check(Number.isFinite(uiAge)&&uiAge>=0&&uiAge<=86400000,'uiEvidence.freshness');
  check(uiEvidence?.source==='authenticated_provider_visible_UI_not_API'&&uiEvidence.bodyExactMatch===true&&uiEvidence.headerExactMatch===true&&uiEvidence.footerExactMatch===true&&uiEvidence.buttonExactMatch===true&&uiEvidence.languageCode==='en'&&uiEvidence.status==='APPROVED'&&uiEvidence.category==='UTILITY','reviewedUIEvidence');
  check(uiEvidence?.bodySha256===createHash('sha256').update(t.body).digest('hex'),'uiEvidence.bodyHash');source='versioned_operator_reviewed_snapshot';
 }
 return {verified:issues.length===0,issues,providerTemplateId:issues.includes('providerUUID')?null:actual?.id||null,metaTemplateId:t.templateId,language:actual?.language||null,source,providerComponentsVerified:source==='authenticated_api_components'&&issues.length===0,definitionHash:entryRevisionDefinitionHash,sendAllowed:false};
}
