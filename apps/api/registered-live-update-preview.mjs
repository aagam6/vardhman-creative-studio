// Pure local review only: no database, environment, transport or worker imports.
import {createHash} from 'node:crypto';
export const liveUpdateDefinition=Object.freeze({
 name:'ayambil_registered_event_live_update_bilingual',metaTemplateId:'3229049627294144',language:'en',category:'UTILITY',header:'',
 body:'નમસ્તે / Hello {{1}},\n*આપની નોંધણી સંબંધિત માહિતી / Your booking update:*\n\n🎟 નોંધણી નંબર / Booking reference: {{2}}\nકાર્યક્રમ / Event: {{3}}\n📅 તારીખ / Date: {{4}}\n🕗 સમય / Time: {{5}} IST\n📍 સ્થળ / Venue: {{6}}\n\n*કાર્યક્રમનું YouTube લાઇવ પ્રસારણ નીચેના બટન પરથી જુઓ.*\n*Watch the event’s YouTube live broadcast using the button below.*',
 footer:'Vardhman Creative Studio',button:'લાઇવ જુઓ | Watch live',dynamicUrl:'https://www.youtube.com/live/{{1}}',
 fields:['contactName','bookingReference','eventLabel','eventDate','eventTime','venue']
});
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
export const liveUpdateDefinitionHash=hash(liveUpdateDefinition);
const uuid=x=>typeof x==='string'&&/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i.test(x);
const phone=x=>{const d=String(x||'').replace(/[+\s()-]/g,'');const v=/^[6-9]\d{9}$/.test(d)?'91'+d:d;if(!/^[1-9]\d{7,14}$/.test(v))throw Error('Invalid canonical recipient');return v;};
const video=x=>{if(typeof x!=='string'||!/^[-_a-zA-Z0-9]{11}$/.test(x))throw Error('Exact YouTube video ID required');return x;};
export function verifyLiveUpdateDefinition({templates,channel,configuredChannelId,reviewedSnapshot,now=Date.now()}){
 const issues=[],expected=liveUpdateDefinition;
 if(!channel?.id||channel.id!==configuredChannelId||channel.isActive!==true||channel.healthStatus!=='healthy')issues.push('channel');
 const matches=Array.isArray(templates)?templates.filter(t=>t?.name===expected.name&&t.language==='en'):[];const t=matches[0];
 if(matches.length!==1)issues.push('template.unique');
 if(!uuid(t?.id)||templates?.filter(x=>x.id===t.id).length!==1)issues.push('provider.uuid');
 if(t?.status!=='APPROVED')issues.push('status');if(String(t?.category).toUpperCase()!=='UTILITY')issues.push('category');
 let source='unverified';
 if(t&&Object.hasOwn(t,'components')){
  const c=t.components,of=k=>Array.isArray(c)?c.filter(x=>String(x.type).toUpperCase()===k):[];
  if(!Array.isArray(c)||c.some(x=>!['BODY','HEADER','FOOTER','BUTTONS'].includes(String(x.type).toUpperCase())))issues.push('components');
  if(of('HEADER').length!==0)issues.push('HEADER');
  if(of('BODY').length!==1||of('BODY')[0]?.text!==expected.body)issues.push('BODY');
  if(of('FOOTER').length!==1||of('FOOTER')[0]?.text!==expected.footer)issues.push('FOOTER');
  const buttons=of('BUTTONS');const b=buttons[0]?.buttons;
  if(buttons.length!==1||!Array.isArray(b)||b.length!==1||String(b[0]?.type).toUpperCase()!=='URL'||b[0]?.text!==expected.button||b[0]?.url!==expected.dynamicUrl)issues.push('CTA');
  source='authenticated_provider_components';
 }else{
  const e=reviewedSnapshot,age=now-Date.parse(e?.observedAt);
  if(e?.verified!==true||e.metaTemplateId!==expected.metaTemplateId||e.definitionHash!==liveUpdateDefinitionHash||hash(e.definition)!==liveUpdateDefinitionHash||e.status!=='APPROVED'||e.source!=='authenticated_meta_and_flow_review'||!Number.isFinite(age)||age<0||age>86400000)issues.push('reviewed_snapshot_missing_or_stale');
  source='reviewed_hash_pinned_snapshot';
 }
 return {verified:issues.length===0,issues,source,providerComponentsVerified:source==='authenticated_provider_components'&&issues.length===0,providerTemplateId:uuid(t?.id)?t.id:null,metaTemplateId:expected.metaTemplateId,language:t?.language==='en'?'en':null,definitionHash:liveUpdateDefinitionHash,sendAllowed:false};
}
export function buildLiveUpdateMock(data){
 const values=liveUpdateDefinition.fields.map(f=>{const v=data?.[f];if(typeof v!=='string'||!v.trim()||v.length>1024||/[\x00-\x1f]/.test(v))throw Error('Missing or invalid '+f);return v.trim();});
 if(/SAMPLE-NOT-VALID/.test(data.bookingReference))throw Error('Sample reference is not a recipient booking');
 const suffix=video(data.videoId);
 return {mock:true,sendAllowed:false,name:liveUpdateDefinition.name,language:{code:'en'},metaTemplateId:liveUpdateDefinition.metaTemplateId,
  components:[{type:'body',parameters:values.map(text=>({type:'text',text}))},{type:'button',sub_type:'url',index:'0',parameters:[{type:'text',text:suffix}]}],
  renderedBody:liveUpdateDefinition.body.replace(/\{\{(\d+)\}\}/g,(_,n)=>values[Number(n)-1]),url:'https://www.youtube.com/live/'+suffix};
}
export function planLiveUpdateAudience({bookings,prior=[],eventDate,videoId}){
 video(videoId);if(!/^\d{4}-\d{2}-\d{2}$/.test(eventDate)||!Array.isArray(bookings)||!Array.isArray(prior))throw Error('Exact fixed audience inputs required');
 const contacts=new Map(),excluded=[];
 for(const b of bookings){let mobile;try{mobile=phone(b.mobile);}catch{excluded.push({id:b.id,reason:'invalid_mobile'});continue;}
  const reason=b.eventDate!==eventDate?'different_event':b.status!=='active'?'not_confirmed':b.consent!==true?'no_consent':!Number.isInteger(b.validPersons)||b.validPersons<1?'no_valid_passes':b.duplicateHold||b.nameHold?'review_hold':null;
  if(reason){excluded.push({id:b.id,reason});continue;}const key=hash(['registered_event_live_update',eventDate,mobile,videoId]);
  if(prior.some(p=>p.dedupeKey===key&&(p.attempts>0||p.providerId||p.claimId||['processing','uncertain','accepted','sent','delivered','read','failed'].includes(p.state)))){excluded.push({id:b.id,reason:'prior_submission_or_uncertainty'});continue;}
  const group=contacts.get(key)||{dedupeKey:key,mobile,eventDate,videoId,round:'live-'+videoId,bookingIds:[]};group.bookingIds.push(b.id);contacts.set(key,group);
 }
 return {localOnly:true,sendAllowed:false,writes:0,providerCalls:0,recipients:[...contacts.values()].map(g=>({...g,bookingIds:[...new Set(g.bookingIds)].sort()})),excluded};
}
