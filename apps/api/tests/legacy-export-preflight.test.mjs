import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,mkdirSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {inspectLegacyExport,sourceFields,expectedFieldTypes,relationTargets,ExportPreflightError} from '../tools/legacy-export-preflight.mjs';
const names=Object.keys(sourceFields),stamp='2026-10-12T00:00:00Z';
const fixture=()=>({formatVersion:1,metadata:{sourceInstance:'synthetic-source',capturedAt:stamp,schemaComplete:true,recordsComplete:true,filesComplete:true,recordCounts:Object.fromEntries(names.map(name=>[name,0]))},schema:names.map(name=>({id:name,name,fields:sourceFields[name].map(key=>({name:key,type:expectedFieldTypes(name,key)[0],...(relationTargets[name]?.[key]?{collectionId:relationTargets[name][key]}:{})}))})),collections:Object.fromEntries(names.map(name=>[name,[]])),files:[]});
function add(data,name,fields){const row=Object.fromEntries(sourceFields[name].map(key=>[key,'']));Object.assign(row,{id:'synthetic-id',created:stamp,updated:stamp},fields);data.collections[name].push(row);data.metadata.recordCounts[name]++;return row;}
const rejected=(value,options)=>{try{inspectLegacyExport(value,options);assert.fail('Export accepted');}catch(error){assert.ok(error instanceof ExportPreflightError);assert.doesNotMatch(JSON.stringify(error.report),/private@example|private-file|secret-token|synthetic-id/);return error.report;}};
test('offline empty export requires completeness/counts/schema/manifest and never claims migration ready',()=>{
 const result=inspectLegacyExport(fixture());assert.equal(result.sourceInventoryVerified,true);assert.equal(result.migrationReady,false);assert.equal(result.counts.leads,0);
 for(const key of ['schema','files','metadata']){const data=fixture();delete data[key];assert.ok(rejected(data).issues.length);}
 const data=fixture();data.metadata.recordCounts.leads=1;assert.ok(rejected(data).issues.includes('record_count_mismatch'));
});
test('offline audit reports aggregate duplicates, unknown fields, missing hidden values and broken relationships',()=>{
 const data=fixture();const lead=add(data,'leads',{name:'Synthetic',email:'private@example.invalid',company:'',message:''});add(data,'leads',{...lead});lead.unmapped='secret-token';add(data,'ayambil_attendees',{booking:'missing',dates:['2026-11-02'],status:'active',full_name:'Synthetic'});add(data,'ayambil_passes',{attendee:'missing',number:'SYNTHETIC',status:'active',snapshot:{}});delete data.collections.ayambil_passes[0].download_key;
 const report=rejected(data);assert.equal(report.duplicateIdentities,1);assert.ok(report.unknownFields>0&&report.missingFields>0&&report.brokenRelationships>0);
});
test('private file verification checks actual bytes and rejects missing files, traversal and hashes',()=>{
 const root=mkdtempSync(join(tmpdir(),'legacy-export-files-'));try{
  const data=fixture(),bytes=Buffer.from('Synthetic file');const row=add(data,'leads',{name:'Synthetic',email:'private@example.invalid',company:'',message:'',attachment:['private-file.txt']});data.schema[0].fields.push({name:'attachment',type:'file'});mkdirSync(join(root,'files'));writeFileSync(join(root,'files','fixture.txt'),bytes);data.files=[{collection:'leads',recordId:row.id,field:'attachment',filename:'private-file.txt',path:'files/fixture.txt',size:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')}];
  // File field lacks a destination mapping, so inventory remains fail-closed even with verified bytes.
  assert.equal(rejected(data,{exportRoot:root}).filesVerified,1);
  data.files[0].sha256='0'.repeat(64);assert.ok(rejected(data,{exportRoot:root}).invalidFiles>0);
  data.files[0].path='../outside.txt';assert.ok(rejected(data,{exportRoot:root}).invalidFiles>0);
  data.files=[];assert.ok(rejected(data,{exportRoot:root}).invalidFiles>0);
 }finally{rmSync(root,{recursive:true,force:true});}
});
test('message inventory counts attempted/uncertain once and never exposes provider content',()=>{
 const data=fixture();add(data,'ayambil_messages',{booking:'missing',status:'uncertain',attempts:1,attempted_at:stamp,provider_history:[],provider_ref:'secret-token'});const report=rejected(data);assert.deepEqual(report.messageCounts,{queued:0,attempted:1,uncertain:1,providerReferenced:1});assert.equal(report.uncertainOrAttemptedMessages,1);
});
test('known legacy alphanumeric pass capability is counted without rewriting or bypassing hash checks',()=>{
 const data=fixture();const b=add(data,'ayambil_bookings',{number:'SYNTHETIC-BOOK',status:'active',event_date:'2026-11-02',whatsapp_consent:true,consent_at:stamp,terms_version:'2026-10-10',terms_accepted_at:stamp,request_hash:'a'.repeat(64),payload_hash:'b'.repeat(64)});const a=add(data,'ayambil_attendees',{id:'attendee-id',booking:b.id,status:'active',full_name:'Synthetic',dates:['2026-11-02']});const key='Z'.repeat(64);add(data,'ayambil_passes',{id:'pass-id',attendee:a.id,number:'SYNTHETIC-PASS',status:'active',snapshot:{number:'SYNTHETIC-PASS',attendeeName:'Synthetic',sessions:[{date:'2026-11-02'}]},download_key:key,download_hash:createHash('sha256').update(key).digest('hex'),download_expires:stamp});assert.equal(inspectLegacyExport(data).compatibility.nonHexPassTokens,1);
});