// Offline/read-only. Never contacts a service, queries SQL, imports or prints records.
import {readFileSync,realpathSync,statSync} from 'node:fs';
import {dirname,resolve,relative,isAbsolute,sep} from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
export const sourceFields=Object.freeze({
 leads:['name','email','company','message'],
 ayambil_admins:['email','enabled'],
 ayambil_bookings:['number','contact_name','mobile','request_hash','payload_hash','status','event_date','whatsapp_consent','consent_at','terms_version','terms_accepted_at'],
 ayambil_attendees:['booking','full_name','dates','status'],
 ayambil_passes:['attendee','number','snapshot','status','download_key','download_hash','download_expires'],
 ayambil_audit:['actor','booking','action'],
 ayambil_messages:['booking','status','provider_ref','failure','provider_history','attempts','attempted_at','accepted_at','delivered_at','download_hash','download_key','download_expires','provider']
});
export const relationTargets={ayambil_attendees:{booking:'ayambil_bookings'},ayambil_passes:{attendee:'ayambil_attendees'},ayambil_audit:{actor:'ayambil_admins',booking:'ayambil_bookings'},ayambil_messages:{booking:'ayambil_bookings'}};
export function expectedFieldTypes(collection,key){if(relationTargets[collection]?.[key])return ['relation'];if(['enabled','whatsapp_consent'].includes(key))return ['bool'];if(key==='attempts')return ['number'];if(['snapshot','provider_history'].includes(key))return ['json'];if(['status','event_date','dates'].includes(key))return ['select'];if(collection==='ayambil_passes'&&key==='download_expires')return ['date'];if(key==='email')return ['email','text'];return ['text'];}
const names=Object.keys(sourceFields),system=['id','created','updated','collectionId','collectionName'];
const digest=data=>createHash('sha256').update(data).digest('hex');
export class ExportPreflightError extends Error{constructor(report){super('Private source export is incomplete or incompatible; inspect aggregate findings');this.report=report;}}
export function inspectLegacyExport(value,{exportRoot}={}){
 const report={counts:{},duplicateIdentities:0,brokenRelationships:0,unknownFields:0,unknownCollections:0,missingSchemas:0,missingFields:0,invalidRecords:0,invalidFiles:0,filesReferenced:0,filesVerified:0,messageCounts:{queued:0,attempted:0,uncertain:0,providerReferenced:0},compatibility:{nonHexPassTokens:0,multiEveningAttendees:0},issues:[],sourceInventoryVerified:false,migrationReady:false};
 const issue=code=>{if(!report.issues.includes(code))report.issues.push(code);};
 const schema=Array.isArray(value?.schema)?value.schema:[],collections=value?.collections;
 const metadata=value?.metadata;
 if(value?.formatVersion!==1||typeof metadata?.sourceInstance!=='string'||!metadata.sourceInstance.trim()||!Number.isFinite(Date.parse(metadata?.capturedAt))||metadata?.schemaComplete!==true||metadata?.recordsComplete!==true||metadata?.filesComplete!==true)issue('export_provenance_or_completeness_missing');
 if(!collections||typeof collections!=='object'||Array.isArray(collections))issue('collections_missing');
 const schemas=new Map(),maps=new Map();
 for(const entry of schema){if(!entry||typeof entry.name!=='string'||schemas.has(entry.name)){report.missingSchemas++;issue('invalid_or_duplicate_schema');continue;}schemas.set(entry.name,entry);}
 for(const name of new Set([...schemas.keys(),...Object.keys(collections||{})]))if(!names.includes(name)){report.unknownCollections++;issue('unmapped_collection');}
 for(const name of names){
  const entry=schemas.get(name),fields=Array.isArray(entry?.fields)?entry.fields:[];
  const allowed=new Set([...sourceFields[name],...system,...(name==='ayambil_admins'?['password','tokenKey','emailVisibility','verified']:[])]);
  if(!entry||typeof entry.id!=='string'||!entry.id||!Array.isArray(entry.fields)){report.missingSchemas++;issue('required_schema_missing');}
  const fieldNames=new Set();
  for(const field of fields){if(typeof field?.name!=='string'||typeof field.type!=='string'||fieldNames.has(field.name)){report.missingSchemas++;issue('invalid_field_definition');continue;}fieldNames.add(field.name);if(sourceFields[name].includes(field.name)&&!expectedFieldTypes(name,field.name).includes(field.type)){report.missingSchemas++;issue('field_type_incompatible');}const target=relationTargets[name]?.[field.name];if(target&&field.collectionId!==schemas.get(target)?.id){report.brokenRelationships++;issue('schema_relation_target_invalid');}if(!allowed.has(field.name)){report.unknownFields++;issue('unmapped_schema_field');}}
  for(const key of sourceFields[name])if(!fieldNames.has(key)){report.missingFields++;issue('required_schema_field_missing');}
  const rows=collections?.[name];if(!Array.isArray(rows)){issue('required_records_missing');maps.set(name,new Map());report.counts[name]=null;continue;}
  report.counts[name]=rows.length;if(metadata?.recordCounts?.[name]!==rows.length)issue('record_count_mismatch');
  const map=new Map();maps.set(name,map);
  for(const row of rows){
   if(!row||typeof row!=='object'||Array.isArray(row)||typeof row.id!=='string'||!row.id){report.invalidRecords++;issue('invalid_record_identity');continue;}
   if(map.has(row.id)){report.duplicateIdentities++;issue('duplicate_identity');}else map.set(row.id,row);
   for(const key of [...sourceFields[name],'created','updated'])if(!Object.hasOwn(row,key)){report.missingFields++;issue('required_record_field_missing');}
   for(const key of Object.keys(row))if(!allowed.has(key)&&!fieldNames.has(key)){report.unknownFields++;issue('unmapped_record_field');}
   if(!Number.isFinite(Date.parse(row.created))||!Number.isFinite(Date.parse(row.updated))){report.invalidRecords++;issue('invalid_record_timestamp');}
  }
 }
 const relation=(row,key,target)=>{if(typeof row[key]!=='string'||!maps.get(target)?.has(row[key])){report.brokenRelationships++;issue('broken_relationship');return null;}return maps.get(target).get(row[key]);};
 const unique=(rows,key)=>{const seen=new Set();for(const row of rows){if(typeof row[key]!=='string'||!row[key]){report.invalidRecords++;issue('required_identity_value_missing');}else if(seen.has(row[key])){report.duplicateIdentities++;issue('duplicate_business_identity');}seen.add(row[key]);}};
 for(const name of ['ayambil_bookings','ayambil_passes'])unique(maps.get(name).values(),'number');
 unique(maps.get('ayambil_bookings').values(),'request_hash');
 for(const row of maps.get('ayambil_bookings').values())if(!['active','cancelled'].includes(row.status)||row.whatsapp_consent!==true||!['2026-11-02','2026-11-03'].includes(row.event_date)||!['request_hash','payload_hash'].every(k=>/^[a-f0-9]{64}$/.test(row[k]))||!Number.isFinite(Date.parse(row.consent_at))||!Number.isFinite(Date.parse(row.terms_accepted_at))||typeof row.terms_version!=='string'||!row.terms_version){report.invalidRecords++;issue('booking_validation_or_consent_missing');}
 for(const row of maps.get('ayambil_admins').values())if(typeof row.email!=='string'||!/^\S+@\S+\.\S+$/.test(row.email)||typeof row.enabled!=='boolean'){report.invalidRecords++;issue('admin_identity_invalid');}
 const bookingCounts=new Map();
 for(const row of maps.get('ayambil_attendees').values()){
  const booking=relation(row,'booking','ayambil_bookings');bookingCounts.set(row.booking,(bookingCounts.get(row.booking)||0)+1);
  if(!Array.isArray(row.dates)||row.dates.length!==1){report.compatibility.multiEveningAttendees++;issue('attendee_evening_incompatible');}else if(booking&&row.dates[0]!==booking.event_date){report.invalidRecords++;issue('attendee_evening_mismatch');}
  if(!['active','cancelled'].includes(row.status)||typeof row.full_name!=='string'||!row.full_name.trim()){report.invalidRecords++;issue('attendee_invalid');}
 }
 for(const booking of maps.get('ayambil_bookings').values())if(!bookingCounts.has(booking.id)||(bookingCounts.get(booking.id)||0)>2){report.invalidRecords++;issue('attendee_count_incompatible');}
 const currentPasses=new Set(),capabilities=new Set();
 for(const row of maps.get('ayambil_passes').values()){
  const attendee=relation(row,'attendee','ayambil_attendees');
  if(!['active','cancelled','superseded'].includes(row.status)||!row.snapshot||typeof row.snapshot!=='object'||row.snapshot.number!==row.number||row.snapshot.attendeeName!==attendee?.full_name||!Array.isArray(row.snapshot.sessions)||row.snapshot.sessions.length!==1||row.snapshot.sessions[0].date!==attendee?.dates?.[0]){report.invalidRecords++;issue('pass_snapshot_incompatible');}
  if(row.status!=='superseded'){if(currentPasses.has(row.attendee)){report.duplicateIdentities++;issue('multiple_current_passes');}currentPasses.add(row.attendee);}
  if(row.download_key||row.download_hash){if(!/^[A-Za-z0-9]{64}$/.test(row.download_key)||digest(row.download_key)!==row.download_hash||!Number.isFinite(Date.parse(row.download_expires))){report.invalidRecords++;issue('capability_invalid_or_missing');}else if(!/^[a-f0-9]{64}$/.test(row.download_key)){report.compatibility.nonHexPassTokens++;}if(capabilities.has(row.download_hash)){report.duplicateIdentities++;issue('duplicate_capability');}capabilities.add(row.download_hash);}else if(row.status==='active'){report.missingFields++;issue('active_capability_missing');}
 }
 for(const row of maps.get('ayambil_audit').values()){relation(row,'booking','ayambil_bookings');relation(row,'actor','ayambil_admins');}
 for(const row of maps.get('ayambil_messages').values()){
  relation(row,'booking','ayambil_bookings');if(row.status==='queued')report.messageCounts.queued++;
  if(!Number.isInteger(row.attempts)||row.attempts<0||!['queued','sending','accepted','sent','delivered','read','failed','uncertain','cancelled'].includes(row.status)){report.invalidRecords++;issue('message_status_invalid');}
  if(row.attempts>0)report.messageCounts.attempted++;
  if(['sending','uncertain'].includes(row.status))report.messageCounts.uncertain++;
  if(row.provider_ref)report.messageCounts.providerReferenced++;
  if(row.attempts>0&&!Number.isFinite(Date.parse(row.attempted_at))){report.invalidRecords++;issue('attempt_provenance_missing');}
  if(row.provider_history!==null&&!Array.isArray(row.provider_history)){report.invalidRecords++;issue('provider_history_invalid');}
  if(['accepted','sent','delivered','read'].includes(row.status)&&(!row.provider_ref||row.provider!=='vardhmanflow')){report.invalidRecords++;issue('provider_reference_missing_or_unmapped');}
 }
 const manifest=Array.isArray(value?.files)?value.files:[];if(!Array.isArray(value?.files))issue('file_manifest_missing');const used=new Set();
 for(const [name,entry] of schemas){for(const field of Array.isArray(entry.fields)?entry.fields:[]){if(field.type!=='file')continue;for(const row of maps.get(name)?.values()||[]){if(!Object.hasOwn(row,field.name)){report.invalidFiles++;issue('file_field_missing');continue;}const stored=row[field.name];const files=typeof stored==='string'?(stored?[stored]:[]):stored;if(!Array.isArray(files)){report.invalidFiles++;issue('file_reference_invalid');continue;}
  for(const filename of files){report.filesReferenced++;const hits=manifest.map((file,index)=>({file,index})).filter(({file})=>file.collection===name&&file.recordId===row.id&&file.field===field.name&&file.filename===filename);if(typeof filename!=='string'||hits.length!==1||used.has(hits[0]?.index)){report.invalidFiles++;issue('file_manifest_reference_missing_or_duplicate');continue;}const {file,index}=hits[0];used.add(index);
   try{if(!exportRoot||typeof file.path!=='string'||!/^files[\\\\/]/.test(file.path)||isAbsolute(file.path)||!/^([a-f0-9]{64})$/.test(file.sha256)||!Number.isSafeInteger(file.size)||file.size<0)throw Error();const root=realpathSync(exportRoot),filesRoot=realpathSync(resolve(root,'files')),filesRel=relative(root,filesRoot),path=realpathSync(resolve(root,file.path)),rel=relative(filesRoot,path);if(!filesRel||filesRel==='..'||filesRel.startsWith('..'+sep)||isAbsolute(filesRel)||!rel||rel==='..'||rel.startsWith('..'+sep)||isAbsolute(rel)||!statSync(path).isFile())throw Error();const bytes=readFileSync(path);if(bytes.length!==file.size||digest(bytes)!==file.sha256)throw Error();report.filesVerified++;}catch{report.invalidFiles++;issue('file_bytes_missing_unsafe_or_mismatched');}
  }
 }}}
 if(used.size!==manifest.length)issue('unmapped_file_manifest_entry');
 report.filesPresent=report.filesReferenced>0;report.adminsRequireSecureReenrolment=(report.counts.ayambil_admins||0)>0;report.uncertainOrAttemptedMessages=[...maps.get('ayambil_messages').values()].filter(row=>row.attempts>0||['sending','uncertain'].includes(row.status)).length;report.sourceInventoryVerified=report.issues.length===0;
 if(report.issues.length)throw new ExportPreflightError(report);return report;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){try{if(process.argv.length!==3)throw Error();const path=resolve(process.argv[2]);console.log(JSON.stringify(inspectLegacyExport(JSON.parse(readFileSync(path,'utf8')),{exportRoot:dirname(path)})));}catch(error){console.error(JSON.stringify(error instanceof ExportPreflightError?error.report:{migrationReady:false,issues:['export_unreadable_or_invalid']}));process.exitCode=1;}}