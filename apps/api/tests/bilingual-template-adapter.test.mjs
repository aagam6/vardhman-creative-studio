import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {bilingualCatalog,createBilingualMockAdapter,buildBilingualMockPayload} from '../bilingual-template-adapter.mjs';
const data={contactName:'Synthetic Person',eventLabel:'Synthetic Event',bookingReference:'BOOK26-FIXTURE',waitingReference:'WAIT26-FIXTURE',eventDate:'2 November 2026',attendeeCount:6,approvedAttendeeCount:6,urlSuffix:'respond#'+'a'.repeat(64)};
test('six separate submitted mappings have exact sequence/count and no inferred provider language code',()=>{
 const counts={booking_confirmed:10,waiting_received:10,waiting_approved:10,booking_verify:6,attendance:10,entry_timing:8};assert.equal(bilingualCatalog.length,6);
 for(const t of bilingualCatalog){assert.equal(t.parameters.length,counts[t.purpose]);assert.deepEqual(Array.from(t.body.matchAll(/\{\{(\d+)\}\}/g),m=>Number(m[1])),Array.from({length:counts[t.purpose]},(_,i)=>i+1));if(!t.languageCode)assert.throws(()=>buildBilingualMockPayload(t.purpose,data),/language code not verified/);}
});
test('mock adapter preserves all repeated fields, exact attendance ordering, purpose, language and URL suffix',()=>{
 // Explicit artificial language fixture tests propagation; it is NOT the submitted language code.
 const catalog=structuredClone(bilingualCatalog).map(t=>({...t,languageCode:'fixture-language',languageCodeEvidence:{verified:true,code:'fixture-language',templateId:t.templateId,name:t.name,source:'unit fixture only'},approvalEvidence:{verified:true,templateId:t.templateId,status:'APPROVED',category:'UTILITY',observedAt:new Date().toISOString(),source:'unit fixture only'}}));const build=createBilingualMockAdapter(catalog);
 const attendance=build('attendance',data);assert.equal(attendance.name,'ayambil_attendance_bilingual');assert.deepEqual(attendance.components[0].parameters.map(p=>p.text),['Synthetic Person','BOOK26-FIXTURE','Synthetic Event','6','2 November 2026','Synthetic Person','BOOK26-FIXTURE','6','Synthetic Event','2 November 2026']);assert.deepEqual(attendance.language,{code:'fixture-language'});assert.equal(attendance.sendAllowed,false);assert.equal(attendance.components[1].parameters[0].text,data.urlSuffix);
 for(const t of catalog){const p=build(t.purpose,data);for(const field of new Set(t.parameters.map(p=>p.field))){const occurrences=p.components[0].parameters.filter((_,i)=>t.parameters[i].field===field);assert.equal(new Set(occurrences.map(v=>v.text)).size,1);}for(const field of new Set(t.parameters.map(p=>p.field)))assert.throws(()=>build(t.purpose,{...data,[field]:undefined}),/Missing/);if(t.button)for(const urlSuffix of ['passes#SAMPLE-NOT-VALID','https://other.invalid/a','../escape','/outside','%2e%2e/escape'])assert.throws(()=>build(t.purpose,{...data,urlSuffix}));}
 assert.throws(()=>build('unrelated-purpose',data),/Unknown/);assert.throws(()=>build('attendance',{...data,attendeeCount:61}),/Invalid attendee/);
 const wrongLanguage=structuredClone(catalog);wrongLanguage[0].languageCodeEvidence.templateId='another-template';assert.throws(()=>createBilingualMockAdapter(wrongLanguage)(wrongLanguage[0].purpose,data),/language code not verified/);
 for(const patch of [{status:'PENDING'},{status:'REJECTED'},{status:'PAUSED'},{category:'MARKETING'},{verified:false},{templateId:'wrong'},{observedAt:'2000-01-01T00:00:00Z'}]){const denied=structuredClone(catalog);denied[0].approvalEvidence={...denied[0].approvalEvidence,...patch};assert.throws(()=>createBilingualMockAdapter(denied)(denied[0].purpose,data),/approved Utility/);}
});

test('six provider-preview verified codes build only mock payloads; missing or mismatched language evidence blocks',()=>{
 // Keep the recorded provider snapshot, with a fresh approval-time fixture so this test is deterministic after expiry.
 const catalog=structuredClone(bilingualCatalog).map(t=>({...t,approvalEvidence:{...t.approvalEvidence,observedAt:new Date().toISOString()}})),build=createBilingualMockAdapter(catalog);
 for(const t of catalog){assert.equal(t.languageCode,'en');assert.equal(t.languageCodeEvidence.sourceType,'provider_template_preview_field');assert.equal(t.languageCodeEvidence.templateId,t.templateId);assert.equal(t.languageCodeEvidence.name,t.name);const p=build(t.purpose,data);assert.equal(p.name,t.name);assert.equal(p.templateId,t.templateId);assert.equal(p.language.code,'en');assert.equal(p.components[0].parameters.length,t.parameters.length);assert.equal(p.sendAllowed,false);if(t.button)assert.equal(p.components[1].parameters[0].text,data.urlSuffix);
  for(const patch of [{languageCode:null},{languageCode:'en_US'},{languageCodeEvidence:null},{languageCodeEvidence:{...t.languageCodeEvidence,verified:false}},{languageCodeEvidence:{...t.languageCodeEvidence,name:'another_template'}}]){const denied=catalog.map(x=>x===t?{...t,...patch}:x);assert.throws(()=>createBilingualMockAdapter(denied)(t.purpose,data),/language code not verified/);}
 }
});
