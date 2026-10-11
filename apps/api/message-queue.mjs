import {createCipheriv,createDecipheriv,randomBytes,randomUUID} from 'node:crypto';
import {hash} from './security.mjs';
import {ApiError} from './config.mjs';
import {transaction} from './store.mjs';
export function queueCrypto(secret){if(!/^[a-f0-9]{64}$/.test(secret||''))throw Error('Queue encryption key required');const key=Buffer.from(secret,'hex');return {
 seal(value){const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',key,iv);const ciphertext=Buffer.concat([cipher.update(JSON.stringify(value),'utf8'),cipher.final()]);return [iv,cipher.getAuthTag(),ciphertext].map(b=>b.toString('base64')).join('.');},
 open(value){const [iv,tag,data]=value.split('.').map(s=>Buffer.from(s,'base64'));const decipher=createDecipheriv('aes-256-gcm',key,iv);decipher.setAuthTag(tag);return JSON.parse(Buffer.concat([decipher.update(data),decipher.final()]).toString('utf8'));}
};}
export function createMessageQueue(pool,flow,env){const enabled=env.AYAMBIL_WHATSAPP_ENABLED==='true';const crypto=enabled?queueCrypto(env.AYAMBIL_QUEUE_ENCRYPTION_KEY):null;
 return {
 async enqueue(db,{bookingId=null,type,dedupe,context}){if(!enabled)throw new ApiError(503,'WhatsApp configuration required');if(!['confirmation','admin','pass','reminder','test'].includes(type)||typeof dedupe!=='string'||!dedupe)throw new ApiError(400,'Invalid notification');const payload=crypto.seal(context);await db.execute('INSERT INTO ayambil_message_queue(id,dedupe_hash,booking_id,notification_type,payload,next_attempt_at,updated_at) VALUES(?,?,?,?,?,UTC_TIMESTAMP(3),UTC_TIMESTAMP(3)) ON DUPLICATE KEY UPDATE dedupe_hash=dedupe_hash',[randomUUID(),hash(type+':'+dedupe),bookingId,type,payload]);},
 async list(){const [rows]=await pool.query('SELECT id,notification_type,status,attempts,updated_at,error_code FROM ayambil_message_queue ORDER BY updated_at DESC LIMIT 50');return rows;},
 async runOne(){if(!enabled)throw new ApiError(503,'WhatsApp sending not configured');
  const job=await transaction(pool,async db=>{const [rows]=await db.query("SELECT * FROM ayambil_message_queue WHERE status='queued' AND next_attempt_at<=UTC_TIMESTAMP(3) ORDER BY next_attempt_at LIMIT 1 FOR UPDATE");if(!rows.length)return null;await db.execute("UPDATE ayambil_message_queue SET status='preparing',attempts=attempts+1,updated_at=UTC_TIMESTAMP(3) WHERE id=?",[rows[0].id]);return rows[0];});
  if(!job)return {processed:false};
  let prepared;
  try {
   const context=crypto.open(job.payload);
   if(context.passLink){
    const key=new URL(context.passLink).hash.slice(1);
    if(!/^[a-f0-9]{64}$/.test(key))throw Error('Invalid pass capability');
    const [passes]=await pool.execute("SELECT p.id FROM ayambil_capabilities c JOIN ayambil_passes p ON p.id=c.pass_id JOIN ayambil_attendees a ON a.id=p.attendee_id WHERE c.key_hash=? AND c.revoked_at IS NULL AND c.expires_at>UTC_TIMESTAMP(3) AND p.status='active' AND a.status='active'",[hash(key)]);
    if(!passes.length){await pool.execute("UPDATE ayambil_message_queue SET status='cancelled',payload='',updated_at=UTC_TIMESTAMP(3) WHERE id=?",[job.id]);return {processed:true,status:'cancelled'};}
   }
   if(job.booking_id){const [rows]=await pool.execute('SELECT status,whatsapp_consent FROM ayambil_bookings WHERE id=?',[job.booking_id]);if(rows.length!==1||rows[0].status!=='active'||!rows[0].whatsapp_consent){await pool.execute("UPDATE ayambil_message_queue SET status='cancelled',payload='',updated_at=UTC_TIMESTAMP(3) WHERE id=?",[job.id]);return {processed:true,status:'cancelled'};}}
   prepared=await flow.prepare(job.notification_type,context);
  }catch{await pool.execute("UPDATE ayambil_message_queue SET status=?,error_code='preflight_failed',next_attempt_at=DATE_ADD(UTC_TIMESTAMP(3),INTERVAL 5 MINUTE),updated_at=UTC_TIMESTAMP(3) WHERE id=?",[job.attempts>=2?'failed':'queued',job.id]);return {processed:true,status:'preflight_failed'};}
  // Commit intent BEFORE network send: crash/timeout is uncertain, never blind retry.
  await pool.execute("UPDATE ayambil_message_queue SET status='sending',updated_at=UTC_TIMESTAMP(3) WHERE id=?",[job.id]);
  try{const result=await flow.sendPrepared(prepared);await pool.execute('UPDATE ayambil_message_queue SET status=?,provider_id=?,payload=\'\',updated_at=UTC_TIMESTAMP(3) WHERE id=?',[result.status,result.id,job.id]);return {processed:true,status:result.status};}
  catch{await pool.execute("UPDATE ayambil_message_queue SET status='uncertain',error_code='acceptance_unknown',updated_at=UTC_TIMESTAMP(3) WHERE id=?",[job.id]);return {processed:true,status:'uncertain'};}
 },
 async reconcile(id){const [rows]=await pool.execute('SELECT provider_id,status FROM ayambil_message_queue WHERE id=?',[id]);if(!rows[0]?.provider_id)throw new ApiError(409,'No provider reference; manual reconciliation required');const result=await flow.messageStatus(rows[0].provider_id);const ranks={accepted:0,sent:1,delivered:2,read:3};if(result.status==='failed'&&['delivered','read'].includes(rows[0].status))return {status:rows[0].status};if(result.status!=='failed'&&(ranks[result.status]??-1)<(ranks[rows[0].status]??-1))return {status:rows[0].status};await pool.execute('UPDATE ayambil_message_queue SET status=?,updated_at=UTC_TIMESTAMP(3) WHERE id=?',[result.status,id]);return {status:result.status};}
 };
}
