import {admissionGate,occupied} from './admission.mjs';
import {updhanReference} from '../../web/src/lib/updhanReference.js';
import {randomUUID, createHash} from 'node:crypto';
import {validateApplication} from '../../web/src/lib/updhanRegistration.js';
import {UpdhanError} from './errors.mjs';
import {sanitizeAttribution} from '../../web/src/lib/updhanMarketing.js';
const digest=value=>createHash('sha256').update(value).digest('hex');
// Explicit dependency injection only. No env loading, connection creation or migration.
// No environment loading, migration, connection creation or startup work. Caller supplies an audited pool.
// Event-row lock serializes approvals, registration and settings without touching Ayambil.
export function createUpdhanProductionRepository({pool,databaseName,outbox,privacyVersion,photoRetentionDays,attributionConsentVersion}) {
 if(!/^(u531246927_vcs|updhan_local_[a-z0-9_]+)$/.test(databaseName||'')||!outbox?.enqueue||!Number.isInteger(photoRetentionDays)||photoRetentionDays<1||photoRetentionDays>365||pool?.pool?.config?.connectionConfig?.database!==databaseName)throw Error('Explicit matching pool, retention and encrypted outbox required');
 const allowDraftOptions=false;
 return {async register({key,data,photoKey,photoHash,photoBytes,attribution}) {
  if(!/^[a-f0-9-]{36}$/i.test(key||'')||!data||!Array.isArray(data.companions)||Object.keys(validateApplication(data,photoKey)).length||!/^[a-f0-9]{64}$/.test(photoKey||'')||!/^[a-f0-9]{64}$/.test(photoHash||'')||!Number.isInteger(photoBytes)||photoBytes<1||photoBytes>2097152)throw new UpdhanError(400,'Invalid application');
  const requestHash=digest(JSON.stringify(data)+photoHash), connection=await pool.getConnection();
  try {
   const [[db]]=await connection.query('SELECT DATABASE() AS name');if(db.name!==databaseName)throw new Error('Disposable database mismatch');
   await connection.query('SET TRANSACTION ISOLATION LEVEL READ COMMITTED');await connection.beginTransaction();
   const [[retry]]=await connection.execute('SELECT id,reference,status,request_hash FROM updhan_applications WHERE request_key = ?',[key]);
   if(retry){if(retry.request_hash!==requestHash)throw new UpdhanError(409,'Request key conflict');await connection.commit();return {id:retry.id,reference:retry.reference,status:retry.status};}
   const [[event]]=await connection.execute('SELECT * FROM updhan_events WHERE id = ? FOR UPDATE',['achalgarh-2027']);
   if(!event?.registration_open||!event.rules_version)throw new UpdhanError(503,'Registration is closed');
   if(typeof privacyVersion!=='string'||!privacyVersion.trim()||privacyVersion.length>40)throw new UpdhanError(503,'Approved privacy version required');
   const [[option]]=await connection.execute(`SELECT * FROM updhan_options WHERE event_id = ? AND label = ? ${allowDraftOptions?'':'AND approved = TRUE'} LOCK IN SHARE MODE`,[event.id,data.category]);
   if(!option||(!allowDraftOptions&&(!option.starts_on||!option.ends_on))||(option.starts_on&&option.ends_on&&(option.ends_on<option.starts_on||option.starts_on<event.starts_on||option.ends_on>event.ends_on)))throw new UpdhanError(503,'Option not approved');
   const gate=await admissionGate(connection,event.id,option.id),used=await occupied(connection,event.id,option.id);
   const status=gate.waiting||used.total>=gate.settings.capacity?'waitlisted':'received';
   const id=randomUUID(),reference=updhanReference(event.next_registration_number);
   await connection.execute('UPDATE updhan_events SET next_registration_number=next_registration_number+1 WHERE id=?',[event.id]);
   const {health,companions,...applicant}=data;
   applicant.whatsappE164=(data.code==='other'?data.customCode:data.code)+data.whatsapp;
   await connection.execute('INSERT INTO updhan_applications (id,request_key,request_hash,reference,event_id,option_snapshot,applicant,health,status) VALUES (?,?,?,?,?,?,?,?,?)',[id,key,requestHash,reference,event.id,JSON.stringify({id:option.id,label:option.label,startsOn:option.starts_on,endsOn:option.ends_on,approved:!!option.approved}),JSON.stringify(applicant),health||null,status]);
   for(const c of companions)await connection.execute('INSERT INTO updhan_companions (application_id,name,form_number) VALUES (?,?,?)',[id,c.name,c.number||null]);
   await connection.execute('INSERT INTO updhan_consents (application_id,rules_version,privacy_version,whatsapp) VALUES (?,?,?,?)',[id,event.rules_version,privacyVersion,!!data.whatsappConsent]);
   await connection.execute('INSERT INTO updhan_photos (application_id,object_key,sha256,mime,bytes,expires_at) VALUES (?,?,?,?,?,DATE_ADD(UTC_TIMESTAMP(), INTERVAL ? DAY))',[id,photoKey,photoHash,'image/jpeg',photoBytes,photoRetentionDays]);
   await connection.execute('INSERT INTO updhan_audit (application_id,actor,action,new_status) VALUES (?,?,?,?)',[id,'applicant','received',status]);
   if(data.whatsappConsent)await outbox.enqueue(connection,{applicationId:id,name:data.name,reference,to:applicant.whatsappE164});
   const campaign=attributionConsentVersion?sanitizeAttribution(attribution):null;if(campaign)await connection.execute('INSERT INTO updhan_attribution (application_id,first_touch,last_touch,consent_version) VALUES (?,?,?,?)',[id,JSON.stringify(campaign.firstTouch),JSON.stringify(campaign.lastTouch),attributionConsentVersion]);
   await connection.commit();return {id,reference,status};
  }catch(error){
   await connection.rollback();
   if(error.code==='ER_DUP_ENTRY'){
    const [[existing]]=await connection.execute('SELECT id,reference,status,request_hash FROM updhan_applications WHERE request_key = ?',[key]);
    if(existing){if(existing.request_hash!==requestHash)throw new UpdhanError(409,'Request key conflict');return {id:existing.id,reference:existing.reference,status:existing.status};}
   }throw error;
  }finally{connection.release();}
 }};
}
