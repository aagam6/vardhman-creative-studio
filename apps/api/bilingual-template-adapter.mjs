import {readFileSync} from 'node:fs';
import {ApiError} from './config.mjs';
export const bilingualCatalog=JSON.parse(readFileSync(new URL('./bilingual-template-catalog.json',import.meta.url),'utf8'));
function languageReady(t){const e=t.languageCodeEvidence;return typeof t.languageCode==='string'&&!!t.languageCode&&e?.verified===true&&e.code===t.languageCode&&e.templateId===t.templateId&&e.name===t.name;}
function approvalReady(t){const e=t.approvalEvidence,age=Date.now()-Date.parse(e?.observedAt);return e?.verified===true&&e.templateId===t.templateId&&['APPROVED','Active – Quality pending'].includes(e.status)&&String(e.category).toUpperCase()==='UTILITY'&&Number.isFinite(age)&&age>=-60000&&age<=86400000;}
export function templateMappingSummary(){return bilingualCatalog.map(t=>({purpose:t.purpose,name:t.name,templateId:t.templateId,languageDisplay:t.languageDisplay,languageCode:t.languageCode,languageVerified:languageReady(t),bodyPositions:t.parameters.length,parameters:t.parameters,header:t.header,body:t.body,dynamicUrl:t.dynamicUrl,button:t.button,statusSnapshot:t.statusSnapshot,snapshotDate:t.snapshotDate,approvalEvidence:t.approvalEvidence,currentApprovalVerified:approvalReady(t),mockOnly:true,readyForMockPayload:languageReady(t)&&approvalReady(t),blockedReason:!languageReady(t)?'Exact provider language code and matching template identity evidence required.':!approvalReady(t)?'Fresh approved Utility template evidence required.':null}));}
export function createBilingualMockAdapter(catalog=bilingualCatalog){
 return function build(purpose,data){
  const t=catalog.find(t=>t.purpose===purpose);if(!t)throw new ApiError(400,'Unknown template purpose');
  if(!languageReady(t))throw new ApiError(409,'Exact submitted language code not verified; template payload blocked');
  if(!approvalReady(t))throw new ApiError(409,'Fresh approved Utility template evidence required; template payload blocked');
  const expected=Array.from(t.body.matchAll(/\{\{(\d+)\}\}/g),m=>Number(m[1]));
  if(expected.length!==t.parameters.length||expected.some((n,i)=>n!==i+1)||t.parameters.some((p,i)=>p.position!==i+1))throw new ApiError(409,'Submitted parameter mapping integrity failure');
  const values=t.parameters.map(p=>{
   const raw=data?.[p.field];if(raw===undefined||raw===null||!String(raw).trim()||/[\x00-\x1f]/.test(String(raw)))throw new ApiError(400,'Missing or invalid '+p.field);
   if(/Count$/.test(p.field)&&(!Number.isInteger(Number(raw))||Number(raw)<1||Number(raw)>(purpose==='attendance'?60:6)))throw new ApiError(400,'Invalid attendee count');
   return String(raw).trim();
  });
  const components=[{type:'body',parameters:values.map(text=>({type:'text',text}))}];
  if(t.button){
   const suffix=data?.urlSuffix;
   if(typeof suffix!=='string'||suffix.length<16||suffix.length>1800||/SAMPLE-NOT-VALID|\{\{|\s|[\x00-\x1f]|^[/\\]|https?:|\.\.|%2e|%2f|%5c/i.test(suffix))throw new ApiError(400,'Usable private URL suffix required; review samples are not access links');
   const prefix=t.dynamicUrl?.split('{{1}}')[0],url=new URL(prefix+suffix),base=new URL(prefix);
   if(url.origin!==base.origin||!url.pathname.startsWith(base.pathname))throw new ApiError(400,'URL must stay within the submitted prefix');
   components.push({type:'button',sub_type:'url',index:'0',parameters:[{type:'text',text:suffix}]});
  }
  return {mock:true,sendAllowed:false,purpose,templateId:t.templateId,name:t.name,language:{code:t.languageCode},components,renderedBody:t.body.replace(/\{\{(\d+)\}\}/g,(_,n)=>values[Number(n)-1])};
 };
}
export const buildBilingualMockPayload=createBilingualMockAdapter();
