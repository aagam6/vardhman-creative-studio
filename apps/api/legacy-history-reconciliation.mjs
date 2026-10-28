import {createHash,randomUUID} from 'node:crypto';
import {normalizePhone} from './vardhmanflow.mjs';
import {loadAttendanceEligibility} from './attendance-eligibility.mjs';
import {dueReminderSession} from './reminder-schedule.mjs';

const submitted=new Set(['accepted','sent','delivered','read']);
const attempted=r=>Number(r.attempts)>0||Boolean(r.provider_id)||['preparing','sending','processing','uncertain','failed','preflight_failed',...submitted].includes(r.status||r.state);
export const legacyResolutionAction='legacy_history_superseded';
export function legacyCoverage(row,{modern=[],legacy=[],recipientMatches=true}={}){
 if(!recipientMatches)return {classification:'held',reason:'recipient_or_event_mismatch'};
 if(attempted(row))return {classification:'held',reason:row.status==='uncertain'?'acceptance_uncertain':'prior_attempt_requires_review'};
 const purposes=row.notification_type==='confirmation'?['booking_confirmed','waiting_approved']:row.notification_type==='pass'?['booking_confirmed','waiting_approved','pass_link']:row.notification_type==='reminder'?['reminder']:[];
 const candidates=[...modern.filter(r=>r.subject===row.booking_id&&purposes.includes(r.purpose)).map(r=>({...r,source:'modern',status:r.state})),...legacy.filter(r=>r.id!==row.id&&r.booking_id===row.booking_id&&r.notification_type===row.notification_type).map(r=>({...r,source:'legacy'}))];
 // An explicit accepted provider reference proves coverage, including the combined
 // pass CTA in bilingual confirmations/approvals. Phone alone never proves it.
 const cover=candidates.find(r=>submitted.has(r.status)&&r.provider_id);
 if(cover)return {classification:'covered',reason:cover.source==='modern'&&row.notification_type==='pass'&&cover.purpose!=='pass_link'?'combined_pass_cta_submitted':'equivalent_submitted',coverage:{source:cover.source,id:cover.id,purpose:cover.purpose||cover.notification_type,state:cover.status,providerId:cover.provider_id}};
 if(attempted(row)||candidates.some(attempted))return {classification:'held',reason:candidates.some(r=>r.status==='uncertain')||row.status==='uncertain'?'acceptance_uncertain':'prior_attempt_requires_review'};
 if(row.booking_status!=='active'||!row.whatsapp_consent||!Number(row.valid_passes))return {classification:'held',reason:row.booking_status!=='active'?'booking_not_active':!row.whatsapp_consent?'consent_missing':'no_valid_passes'};
 return {classification:'missing',reason:'never_submitted_requires_current_sender_review'};
}
export function createLegacyHistoryReconciliation({pool,crypto}){
 const query=async(db,sql,args=[])=> (await db.execute(sql,args))[0];
 const digest=row=>createHash('sha256').update(JSON.stringify(row)).digest('hex');
 async function inspect(db,id=null,lock=false){
  const rows=await query(db,`SELECT q.*,b.number bookingReference,b.mobile,b.event_date,b.status booking_status,b.whatsapp_consent,
   (SELECT COUNT(*) FROM ayambil_attendees a JOIN ayambil_passes p ON p.attendee_id=a.id WHERE a.booking_id=b.id AND a.status='active' AND p.status='active' AND p.trashed_at IS NULL AND EXISTS(SELECT 1 FROM ayambil_capabilities c WHERE c.pass_id=p.id AND c.revoked_at IS NULL AND c.expires_at>UTC_TIMESTAMP(3))) valid_passes
   FROM ayambil_message_queue q LEFT JOIN ayambil_bookings b ON CONVERT(b.id USING utf8mb4) COLLATE utf8mb4_unicode_ci=CONVERT(q.booking_id USING utf8mb4) COLLATE utf8mb4_unicode_ci
   WHERE ${id?'q.id=?':"q.status IN ('queued','preparing','sending','uncertain') AND q.booking_id IS NOT NULL AND q.notification_type IN ('confirmation','pass','reminder')"}
   ORDER BY q.id LIMIT 1001${lock?' FOR UPDATE':''}`,id?[id]:[]);
  if(rows.length>1000)throw Error('Legacy audit exceeds bounded scope; pagination required');
  const items=[];
  for(const row of rows){
   const modern=await query(db,'SELECT id,subject,purpose,state,attempts,provider_id FROM ayambil_notification_outbox WHERE subject=?',[row.booking_id]);
   const legacy=await query(db,'SELECT id,booking_id,notification_type,status,attempts,provider_id FROM ayambil_message_queue WHERE booking_id=?',[row.booking_id]);
   let recipientMatches=false;
   try{const context=crypto.open(row.payload);recipientMatches=normalizePhone(context.to)===normalizePhone(row.mobile)&&context.eventDate===row.event_date;}catch{}
   let result=legacyCoverage(row,{modern,legacy,recipientMatches});
   if(result.classification==='missing'){
    if(row.notification_type==='reminder'&&dueReminderSession()?.date!==row.event_date)result={classification:'held',reason:'reminder_not_due'};
    const eligibility=await loadAttendanceEligibility(db,{eventDate:row.event_date,mobile:row.mobile});
    const hold=eligibility.reasons.find(r=>['unresolved_duplicate_review','repeated_name_hold'].includes(r));
    if(hold)result={classification:'held',reason:hold};
   }
   const resolutions=await query(db,"SELECT id,created_at,detail FROM ayambil_notification_audit WHERE action=? AND JSON_UNQUOTE(JSON_EXTRACT(detail,'$.legacyId'))=? ORDER BY created_at LIMIT 1",[legacyResolutionAction,row.id]);
   const original=Object.fromEntries(Object.entries(row).filter(([k])=>!['bookingReference','mobile','event_date','booking_status','whatsapp_consent','valid_passes'].includes(k)));
   items.push({legacyId:row.id,bookingId:row.booking_id,bookingReference:row.bookingReference,eventDate:row.event_date,purpose:row.notification_type,status:row.status,attempts:Number(row.attempts),providerPresent:Boolean(row.provider_id),validPasses:Number(row.valid_passes),...result,resolved:resolutions.length>0,resolution:resolutions[0]||null,legacyFingerprint:digest(original),history:legacy.map(r=>({id:r.id,purpose:r.notification_type,status:r.status,attempts:Number(r.attempts),providerId:r.provider_id}))});
  }
  return items;
 }
 return {
  async list(){const items=await inspect(pool);return {items,counts:{history:items.length,covered:items.filter(x=>x.classification==='covered').length,resolved:items.filter(x=>x.resolved).length,missing:items.filter(x=>x.classification==='missing').length,held:items.filter(x=>x.classification==='held').length,actionable:items.filter(x=>!x.resolved&&x.classification==='missing').length},noSend:true};},
  async resolve(ids,actor){
   if(!actor?.admin_id||!Array.isArray(ids)||!ids.length||ids.length>50||new Set(ids).size!==ids.length||ids.some(id=>!/^[-a-f0-9]{36}$/.test(id)))throw Error('Exact 1–50 distinct reviewed legacy IDs and administrator required');
   const db=await pool.getConnection();
   try{await db.beginTransaction();const results=[];
    for(const id of [...ids].sort()){
     const [item]=await inspect(db,id,true);
     if(!item||item.status!=='queued'||item.attempts!==0||item.providerPresent||item.classification!=='covered')throw Error('Only currently covered, unattempted queued history can be resolved');
     if(item.resolved){results.push({id,resolved:true,unchanged:true});continue;}
     await db.execute('INSERT INTO ayambil_notification_audit(id,actor,action,detail,created_at) VALUES(?,?,?,?,UTC_TIMESTAMP(3))',[randomUUID(),actor.admin_id,legacyResolutionAction,JSON.stringify({legacyId:id,bookingId:item.bookingId,purpose:item.purpose,coverage:item.coverage,legacyFingerprint:item.legacyFingerprint})]);
     results.push({id,resolved:true,legacyFingerprint:item.legacyFingerprint});
    }
    await db.commit();return {items:results,noSend:true,originalQueueUnchanged:true};
   }catch(error){await db.rollback();throw error;}finally{db.release();}
  }
 };
}
