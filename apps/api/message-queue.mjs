import {createCipheriv,createDecipheriv,randomBytes,randomUUID} from 'node:crypto';
import {hash} from './security.mjs';
import {ApiError} from './config.mjs';
import {transaction} from './store.mjs';
import {normalizePhone} from './vardhmanflow.mjs';
export function queueCrypto(secret){if(!/^[a-f0-9]{64}$/.test(secret||''))throw Error('Queue encryption key required');const key=Buffer.from(secret,'hex');return {
 seal(value){const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',key,iv);const ciphertext=Buffer.concat([cipher.update(JSON.stringify(value),'utf8'),cipher.final()]);return [iv,cipher.getAuthTag(),ciphertext].map(b=>b.toString('base64')).join('.');},
 open(value){const [iv,tag,data]=value.split('.').map(s=>Buffer.from(s,'base64'));const decipher=createDecipheriv('aes-256-gcm',key,iv);decipher.setAuthTag(tag);return JSON.parse(Buffer.concat([decipher.update(data),decipher.final()]).toString('utf8'));}
};}
export function canVerifyProviderStatus(row){return typeof row?.provider_id==='string'&&/^[^\s\x00-\x1f\x7f]{1,200}$/.test(row.provider_id)&&['accepted','sent','delivered','read','failed','uncertain'].includes(row.status);}
export function normalQueuePolicy(env){
 if(env.AYAMBIL_WHATSAPP_NORMAL_PROCESSING_APPROVED!=='true'||env.AYAMBIL_WHATSAPP_QUEUE_OWNER!=='express-mysql')throw new ApiError(403,'Express queue ownership and normal processing require explicit approval');
 const cutoff=env.AYAMBIL_WHATSAPP_AUTOMATION_START_AT;
 if(typeof cutoff!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(cutoff)||!Number.isFinite(Date.parse(cutoff))||new Date(cutoff).toISOString()!==cutoff)throw new ApiError(403,'Reviewed automation activation timestamp required');
 return new Date(cutoff).toISOString().replace('T',' ').replace('Z','');
}
export function createMessageQueue(pool,flow,env){const enabled=env.AYAMBIL_WHATSAPP_ENABLED==='true';const crypto=enabled?queueCrypto(env.AYAMBIL_QUEUE_ENCRYPTION_KEY):null;
 return {
 async reconcileFresh(){
  const cutoff=normalQueuePolicy(env);
  const [blocked]=await pool.execute("SELECT q.id FROM ayambil_message_queue q JOIN ayambil_bookings b ON b.id=q.booking_id WHERE b.created_at>=? AND q.notification_type IN ('confirmation','pass','reminder') AND q.status IN ('preparing','sending','uncertain') LIMIT 1",[cutoff]);
  if(blocked.length)return {blocked:true};
  const [rows]=await pool.execute("SELECT q.id,q.status,q.provider_id FROM ayambil_message_queue q JOIN ayambil_bookings b ON b.id=q.booking_id WHERE b.created_at>=? AND q.notification_type IN ('confirmation','pass','reminder') AND q.status IN ('accepted','sent') ORDER BY q.updated_at,q.id LIMIT 10",[cutoff]);
  for(const row of rows){if(!canVerifyProviderStatus(row))return {blocked:true};await this.reconcile(row.id);}
  return {blocked:false};
 },
 async enqueue(db,{bookingId=null,type,dedupe,context}){if(!enabled)throw new ApiError(503,'WhatsApp configuration required');if(!['confirmation','admin','pass','reminder','test'].includes(type)||typeof dedupe!=='string'||!dedupe)throw new ApiError(400,'Invalid notification');const payload=crypto.seal(context);await db.execute('INSERT INTO ayambil_message_queue(id,dedupe_hash,booking_id,notification_type,payload,next_attempt_at,updated_at) VALUES(?,?,?,?,?,UTC_TIMESTAMP(3),UTC_TIMESTAMP(3)) ON DUPLICATE KEY UPDATE dedupe_hash=dedupe_hash',[randomUUID(),hash(type+':'+dedupe),bookingId,type,payload]);},
 async testId(db,dedupe){const [rows]=await db.execute("SELECT id FROM ayambil_message_queue WHERE dedupe_hash=? AND notification_type='test' AND booking_id IS NULL",[hash('test:'+dedupe)]);if(rows.length!==1)throw new ApiError(409,'Test job could not be confirmed');return rows[0].id;},
 async list(){const [rows]=await pool.query('SELECT id,notification_type,status,attempts,updated_at,error_code,provider_id FROM ayambil_message_queue ORDER BY updated_at DESC LIMIT 50');return rows.map(({provider_id,...row})=>({...row,canVerifyProviderStatus:canVerifyProviderStatus({...row,provider_id})}));},
 async runTest(id){if(typeof id!=='string'||! /^[a-f0-9-]{36}$/.test(id))throw new ApiError(400,'Test job identifier required');return this.runOne(id);},
 async runOne(testId=null){if(!enabled)throw new ApiError(503,'WhatsApp sending not configured');
  let cutoff;
  if(testId!==null){
   if(env.AYAMBIL_STAGING_BUILD!=='true'||env.AYAMBIL_SITE_ORIGIN!=='https://white-reindeer-590806.hostingersite.com'||typeof testId!=='string'||!/^[a-f0-9-]{36}$/.test(testId))throw new ApiError(403,'Exact authorized staging test required');
  }else cutoff=normalQueuePolicy(env);
  const job=await transaction(pool,async db=>{const [rows]=testId?await db.execute("SELECT * FROM ayambil_message_queue WHERE id=? AND notification_type='test' AND booking_id IS NULL AND provider_id IS NULL AND attempts=0 AND status='queued' AND next_attempt_at<=UTC_TIMESTAMP(3) LIMIT 1 FOR UPDATE",[testId]):await db.execute("SELECT q.* FROM ayambil_message_queue q JOIN ayambil_bookings b ON b.id=q.booking_id WHERE q.status='queued' AND q.attempts=0 AND q.provider_id IS NULL AND q.notification_type IN ('confirmation','pass','reminder') AND b.status='active' AND b.whatsapp_consent=TRUE AND b.created_at>=? AND q.updated_at>=? AND q.next_attempt_at<=UTC_TIMESTAMP(3) ORDER BY q.next_attempt_at,q.id LIMIT 1 FOR UPDATE",[cutoff,cutoff]);if(!rows.length)return null;await db.execute("UPDATE ayambil_message_queue SET status='preparing',attempts=attempts+1,updated_at=UTC_TIMESTAMP(3) WHERE id=?",[rows[0].id]);return rows[0];});
  if(!job)return {processed:false};
  let prepared;
  try {
   const context=crypto.open(job.payload);
   if(context.compatibilityTest===true&&!testId)throw new ApiError(403,'Compatibility test requires exact test-only processing');
   if(context.passLink){
    const key=new URL(context.passLink).hash.slice(1);
    if(!/^[a-zA-Z0-9]{64}$/.test(key))throw Error('Invalid pass capability');
    const [passes]=await pool.execute("SELECT p.id FROM ayambil_capabilities c JOIN ayambil_passes p ON p.id=c.pass_id JOIN ayambil_attendees a ON a.id=p.attendee_id WHERE c.key_hash=? AND a.booking_id=? AND c.revoked_at IS NULL AND c.expires_at>UTC_TIMESTAMP(3) AND p.status='active' AND a.status='active'",[hash(key),job.booking_id]);
    if(!passes.length){await pool.execute("UPDATE ayambil_message_queue SET status='cancelled',payload='',updated_at=UTC_TIMESTAMP(3) WHERE id=?",[job.id]);return {processed:true,status:'cancelled'};}
   }
   if(job.booking_id){const [rows]=await pool.execute('SELECT status,whatsapp_consent,mobile,event_date FROM ayambil_bookings WHERE id=?',[job.booking_id]);if(rows.length!==1||rows[0].status!=='active'||!rows[0].whatsapp_consent){await pool.execute("UPDATE ayambil_message_queue SET status='cancelled',payload='',updated_at=UTC_TIMESTAMP(3) WHERE id=?",[job.id]);return {processed:true,status:'cancelled'};}if(normalizePhone(context.to)!==normalizePhone(rows[0].mobile)||context.eventDate!==rows[0].event_date)throw new ApiError(409,'Saved booking recipient and evening required');}
   if(testId&&(job.notification_type!=='test'||job.booking_id!==null||context.to!==normalizePhone(env.AYAMBIL_WHATSAPP_TEST_RECIPIENT)))throw new ApiError(409,'Authorized test recipient required');
   prepared=await flow.prepare(job.notification_type,context);
  }catch{await pool.execute("UPDATE ayambil_message_queue SET status='failed',error_code='preflight_failed',updated_at=UTC_TIMESTAMP(3) WHERE id=?",[job.id]);return {processed:true,status:'preflight_failed'};}
  // Commit intent BEFORE network send: crash/timeout is uncertain, never blind retry.
  await pool.execute("UPDATE ayambil_message_queue SET status='sending',updated_at=UTC_TIMESTAMP(3) WHERE id=?",[job.id]);
  try{const result=await flow.sendPrepared(prepared);await pool.execute('UPDATE ayambil_message_queue SET status=?,provider_id=?,payload=\'\',updated_at=UTC_TIMESTAMP(3) WHERE id=?',[result.status,result.id,job.id]);return {processed:true,status:result.status,...(testId?{providerMessageId:result.id}:{})};}
  catch(error){if(error.providerRejected){await pool.execute("UPDATE ayambil_message_queue SET status='failed',error_code=?,updated_at=UTC_TIMESTAMP(3) WHERE id=?",['provider_rejected_'+error.providerRejected,job.id]);return {processed:true,status:'failed',error:error.message};}await pool.execute("UPDATE ayambil_message_queue SET status='uncertain',error_code='acceptance_unknown',updated_at=UTC_TIMESTAMP(3) WHERE id=?",[job.id]);return {processed:true,status:'uncertain'};}
 },
 async reconcile(id){const [rows]=await pool.execute('SELECT provider_id,status FROM ayambil_message_queue WHERE id=?',[id]);if(!canVerifyProviderStatus(rows[0]))throw new ApiError(409,'No reconcilable provider reference; not submitted or manual reconciliation required');const result=await flow.messageStatus(rows[0].provider_id);const ranks={accepted:0,sent:1,delivered:2,read:3};if(result.status==='failed'&&['delivered','read'].includes(rows[0].status))return {status:rows[0].status};if(result.status!=='failed'&&(ranks[result.status]??-1)<(ranks[rows[0].status]??-1))return {status:rows[0].status};await pool.execute('UPDATE ayambil_message_queue SET status=?,updated_at=UTC_TIMESTAMP(3) WHERE id=?',[result.status,id]);return {status:result.status};}
 };
}
