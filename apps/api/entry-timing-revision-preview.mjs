// Pure local compatibility preview. Not wired into runtime, Prepare, or dispatch.
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {createBilingualMockAdapter} from './bilingual-template-adapter.mjs';
export const entryRevision=JSON.parse(readFileSync(new URL('./template-revisions/entry-timing-20261028.json',import.meta.url),'utf8'));
const digest=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
export const entryRevisionDefinitionHash='4ec8dc5f63a5ab8844f16791b040c762e126d6192263b26e93a1049ae7625164';
// Pure transition plan only. A future authorized transaction must compare/lock
// the exact old hash and repeat these checks; this function never updates a row.
export function planEntryRevisionTransition(input){
 const result=previewEntryTiming(input),d=input.draft;
 if(!result.compatible||!result.providerRevisionVerified)return {allowed:false,reason:result.reason||'provider_revision_not_verified',writes:0};
 if(typeof d.revisionHash!=='string'||!/^[a-f0-9]{64}$/.test(d.revisionHash))return {allowed:false,reason:'exact_previous_revision_hash_required',writes:0};
 return {allowed:true,writes:0,sendAllowed:false,expectedPreviousHash:d.revisionHash,targetDefinitionHash:entryRevisionDefinitionHash,preserve:['id','subject','round','existingCombinedToken','scheduledAt'],requiresAuthorizedAtomicCompareAndSwap:true};
}
export function previewEntryTiming({draft,booking,attendees,existingCombinedToken,verifyExistingCapability,now=Date.now(),providerDefinition}){
 const fail=reason=>({compatible:false,sendAllowed:false,reason,providerCalls:0});
 if(draft?.purpose!=='entry_timing'||draft.state!=='held'||draft.attempts!==0||draft.providerId||draft.claimId||draft.providerReferencePresent||draft.claimPresent)return fail('draft_not_held_unattempted_unclaimed');
 if(booking?.status!=='active'||booking.consent!==true||draft.subject!==booking.id)return fail('booking_inactive_unconsented_or_wrong_subject');
 if(!Array.isArray(attendees))return fail('current_attendees_required');
 const valid=attendees.filter(a=>a.bookingId===booking.id&&a.status==='active'&&a.pass?.status==='active'&&!a.pass.trashedAt&&a.pass.capabilityValid===true);
 if(!valid.length||valid.length>6||new Set(valid.map(a=>a.id)).size!==valid.length||new Set(valid.map(a=>a.pass.number)).size!==valid.length)return fail('invalid_current_pass_set');
 if(attendees.some(a=>a.bookingId===booking.id&&a.status==='active'&&!valid.includes(a)))return fail('active_attendee_without_valid_pass');
 try{if(typeof verifyExistingCapability!=='function'||verifyExistingCapability(existingCombinedToken,now)!==booking.id)return fail('capability_binding_invalid');}catch{return fail('capability_unavailable');}
 const t=entryRevision;
 if(JSON.stringify(t.parameters)!==JSON.stringify(['contactName','eventLabel','eventDate','bookingReference','attendeeCount'].map((field,i)=>({position:i+1,field}))))return fail('local_revision_parameter_integrity_failure');
 const mock={...t,languageCodeEvidence:{verified:true,templateId:t.templateId,name:t.name,code:t.languageCode},approvalEvidence:{verified:true,templateId:t.templateId,status:'APPROVED',category:'UTILITY',observedAt:new Date(now).toISOString()}};
 // Fresh timestamps above are synthetic mock evidence, never provider approval.
 let payload;try{payload=createBilingualMockAdapter([mock])('entry_timing',{contactName:booking.contactName,eventLabel:booking.eventLabel,eventDate:booking.eventDate,bookingReference:booking.number,attendeeCount:valid.length,urlSuffix:existingCombinedToken});}catch{return fail('invalid_mock_mapping_values');}
 const expected={name:t.name,metaTemplateId:t.templateId,languageCode:t.languageCode,category:'UTILITY',header:t.header,body:t.body,footer:t.footer,button:t.button,dynamicUrl:t.dynamicUrl};
 if(digest(expected)!==entryRevisionDefinitionHash)return fail('local_revision_snapshot_integrity_failure');
 const matched=providerDefinition?.status==='APPROVED'&&digest(providerDefinition.definition)===digest(expected)&&Number.isFinite(Date.parse(providerDefinition.observedAt))&&now-Date.parse(providerDefinition.observedAt)>=0&&now-Date.parse(providerDefinition.observedAt)<=86400000;
 return {compatible:true,sendAllowed:false,providerCalls:0,payload,validPersons:valid.length,revision:t.revision,definitionHash:digest(expected),providerRevisionVerified:matched,requiresAuditedDraftRefresh:!!draft.revisionHash,blockingReasons:[...(!matched?['current_provider_revision_not_verified']:[]),...(draft.revisionHash?['frozen_draft_requires_explicit_audited_refresh']:[])],note:'Local mock only; no queue writes, new capability, schedule change, or transport.'};
}
