import {ApiError} from './config.mjs';
import {observeKnownReceipts} from './known-receipt-observation.mjs';
import {entryPriorBlocksSql,entryFollowupAction} from './entry-followup-policy.mjs';
import {entryRevisionDefinitionHash} from './entry-timing-revision-preview.mjs';
// Production-capable durable sender. No import-time network, migration or worker.
import {randomUUID,randomBytes,createHash} from 'node:crypto';
import {bookingPassToken} from './booking-pass-link.mjs';
import {queueCrypto} from './message-queue.mjs';
import {createBilingualMockAdapter,bilingualCatalog} from './bilingual-template-adapter.mjs';
import {nextDeliveryStatus} from './delivery-status-policy.mjs';
import {loadAttendanceEligibility,lockAttendanceEvent,assertAttendanceEligible} from './attendance-eligibility.mjs';
import {combinedPassPayload} from './combined-pass-notification.mjs';
import {reminderPayload,assertReminderWindow} from './notification-reminders.mjs';
import {dueReminderSession} from './reminder-schedule.mjs';
import {createLegacyHistoryReconciliation} from './legacy-history-reconciliation.mjs';
const eligibilityReasons=new Map([['Notification source unavailable','source_unavailable'],['Waiting transition no longer eligible','waiting_transition_changed'],['Waiting WhatsApp consent required','consent_missing'],['Active booking required','booking_inactive_or_no_consent'],['Active passes required','no_active_passes'],['Legacy confirmation already attempted','prior_legacy_confirmation'],['Confirmed notification held for duplicate/name review','duplicate_or_name_hold']]);
const purposeNeedsPass=p=>['booking_confirmed','waiting_approved','pass_link'].includes(p);
const digest=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
export function createProductionNotificationSender({pool,config,key,provider,catalog=bilingualCatalog,now=()=>new Date()}){
 const actual=pool?.pool?.config?.connectionConfig;
 if(config.notificationService!==true||!config.bookingControls||!actual||actual.host!==config.database.host||actual.database!==config.database.database||(config.database.port&&actual.port!==config.database.port)||!['127.0.0.1','localhost'].includes(actual.host)||!/^https:\/\//.test(config.origin)&&!config.disposable)throw Error('Explicit notification service and matching pool/origin required');
 if(!config.disposable&&(config.origin!=='https://vardhmancreativestudio.com'||config.bookingControlsProduction!==true||actual.database.startsWith('ayambil_test_')))throw Error('Explicit canonical production mode required');
 const crypto=queueCrypto(key),build=createBilingualMockAdapter(catalog);
 const legacyHistory=createLegacyHistoryReconciliation({pool,crypto});
 const one=async(db,sql,args=[])=> (await db.execute(sql,args))[0][0];
 const tx=async fn=>{const db=await pool.getConnection();try{await db.query('SET TRANSACTION ISOLATION LEVEL READ COMMITTED');await db.beginTransaction();const r=await fn(db);await db.commit();return r;}catch(e){await db.rollback();throw e;}finally{db.release();}};
 async function lockSourceEvent(db,purpose,subject){
  let meta;if(['booking_verify','attendance'].includes(purpose))meta=await one(db,'SELECT event_date FROM ayambil_family_reviews WHERE id=?',[subject]);
  else if(['waiting_received','waiting_approved'].includes(purpose))meta=await one(db,'SELECT event_date FROM ayambil_waiting WHERE id=? OR booking_id=?',[subject,subject]);
  else meta=await one(db,'SELECT event_date FROM ayambil_bookings WHERE id=?',[subject]);
  if(!meta)throw Error('Notification source unavailable');await lockAttendanceEvent(db,meta.event_date);
 }
 async function source(db,purpose,subject,token,{reviewSnapshot=null}={}){
  if(!/^[a-f0-9-]{36}$/.test(subject))throw Error('Invalid subject');
  await lockSourceEvent(db,purpose,subject);
  let b,w,review;
  if(purpose==='waiting_received'||purpose==='waiting_approved'){
   w=await one(db,'SELECT * FROM ayambil_waiting WHERE id=? OR booking_id=? FOR UPDATE',[subject,subject]);
   if(!w||(purpose==='waiting_received'?w.status!=='waiting':w.status!=='approved'))throw Error('Waiting transition no longer eligible');
   if(purpose==='waiting_received'){const p=typeof w.payload==='string'?JSON.parse(w.payload):w.payload;if(p.whatsappConsent!==true)throw Error('Waiting WhatsApp consent required');return {canonicalSubject:w.id,mobile:p.mobile,eventDate:w.event_date,contactName:p.contactName,waitingReference:w.number,attendeeCount:p.attendees.length,identity:[w.number,w.status,p]};}
  }
  if(['booking_verify','attendance'].includes(purpose)){
   review=await one(db,'SELECT * FROM ayambil_family_reviews WHERE id=? FOR UPDATE',[subject]);
   if(!review||review.decision||review.purpose!==(purpose==='booking_verify'?'duplicate':'attendance')||review.response||!review.token_hash||review.token_hash!==createHash('sha256').update(token||'').digest('hex')||Date.parse(review.expires_at+'Z')<=Date.now())throw Error('Review link expired, revoked or answered');
   if(purpose==='attendance'){const answered=await one(db,"SELECT id FROM ayambil_family_reviews WHERE purpose='attendance' AND event_date=? AND contact_key=? AND response IS NOT NULL LIMIT 1",[review.event_date,review.contact_key]);if(answered)throw Error('Contact already answered');}
   const snapshots=reviewSnapshot||(typeof review.snapshot==='string'?JSON.parse(review.snapshot):review.snapshot);
   if(purpose==='attendance'){const eligibility=await loadAttendanceEligibility(db,{eventDate:review.event_date,mobile:review.contact_key||snapshots[0]?.mobile,now:now(),finalCutoff:config.attendanceFinalCutoff});assertAttendanceEligible(eligibility);if(JSON.stringify(eligibility.bookingIds)!==JSON.stringify(snapshots.map(b=>b.id).sort()))throw Error('Attendance contact snapshot stale');}
   const books=[];
   for(const snap of snapshots){const saved=await booking(db,snap.id);if(saved.mobile!==snap.mobile||saved.names.join('\n')!==snap.names.join('\n'))throw Error('Review snapshot stale');books.push(saved);}
   const first=books[0];if(!first)throw Error('Empty review');
   return {...first,bookingReference:books.map(x=>x.bookingReference).join(', '),attendeeCount:books.reduce((n,x)=>n+x.names.length,0),urlSuffix:'respond#'+token,contactUnit:review.contact_key,sourceRound:review.review_round,identity:books.map(x=>x.identity)};
  }
  b=await booking(db,w?.booking_id||subject);
  return {...b,canonicalSubject:w?.booking_id||subject};
 }
 async function booking(db,id){
  const b=await one(db,'SELECT * FROM ayambil_bookings WHERE id=? FOR UPDATE',[id]);
  if(!b||b.status!=='active'||!b.whatsapp_consent)throw Error('Active booking required');
  const [rows]=await db.execute("SELECT a.full_name,p.number,p.snapshot FROM ayambil_attendees a JOIN ayambil_passes p ON p.attendee_id=a.id JOIN ayambil_capabilities c ON c.pass_id=p.id AND c.revoked_at IS NULL AND c.expires_at>UTC_TIMESTAMP(3) WHERE a.booking_id=? AND a.status='active' AND p.status='active' AND p.trashed_at IS NULL ORDER BY a.ordinal,p.number",[id]);
  if(!rows.length)throw Error('Active passes required');
  // A prior provider submission or uncertain attempt makes a new initial confirmation unsafe.
  const prior=await one(db,"SELECT id FROM ayambil_message_queue WHERE booking_id=? AND notification_type='confirmation' AND (attempts>0 OR provider_id IS NOT NULL OR status IN ('preparing','sending','uncertain','accepted','sent','delivered','read')) LIMIT 1",[id]);
  const passPrior=await one(db,"SELECT id FROM ayambil_message_queue WHERE booking_id=? AND notification_type='pass' AND (attempts>0 OR provider_id IS NOT NULL OR status IN ('preparing','sending','uncertain','accepted','sent','delivered','read')) LIMIT 1",[id]);
  const corrected=async job=>{if(!job)return false;const audits=await one(db,"SELECT detail FROM ayambil_notification_audit WHERE action='contact_country_corrected' AND BINARY JSON_UNQUOTE(JSON_EXTRACT(detail,'$.bookingId'))=BINARY ? ORDER BY created_at DESC LIMIT 1",[id]);const a=typeof audits?.detail==='string'?JSON.parse(audits.detail):audits?.detail,verified=a?.legacy?.find(j=>j.id===job.id);if(a?.newMobile!==b.mobile||!verified)return false;const [history]=await db.execute("SELECT id,provider_id FROM ayambil_message_queue WHERE booking_id=? AND notification_type=? AND (attempts>0 OR provider_id IS NOT NULL OR status IN ('preparing','sending','uncertain','accepted','sent','delivered','read'))",[id,verified.purpose]);return history.length>0&&history.every(j=>a.legacy.some(v=>v.id===j.id&&v.providerId===j.provider_id));};
  return {mobile:b.mobile,eventDate:b.event_date,contactName:b.contact_name,bookingReference:b.number,attendeeCount:rows.length,approvedAttendeeCount:rows.length,names:rows.map(x=>x.full_name),legacyConfirmation:!!prior&&!await corrected(prior),legacyPass:!!passPrior&&!await corrected(passPrior),identity:[b.id,b.status,rows]};
 }
 async function envelope(db,input,{ownOutboxId=null,scheduledPreview=false,reviewSnapshot=null}={}){
  if(input.followupOf){
   const round='response-followup-'+(config.attendanceFinalCutoff||'').slice(0,10).replaceAll('-','');
   if(input.purpose!=='attendance'||!config.attendanceFinalCutoff||input.round!==round)throw Error('Reviewed final Attendance follow-up required');
   const prior=await one(db,'SELECT * FROM ayambil_notification_outbox WHERE id=?',[input.followupOf]);
   if(!prior||prior.purpose!=='attendance'||prior.round_name!=='initial'||prior.subject!==input.subject||!prior.provider_id||prior.attempts<1||!['delivered','read'].includes(prior.state))throw Error('Delivered initial Attendance required; pending or uncertain cannot be followed up');
   const original=crypto.open(prior.envelope);
   if(original.followupOf||original.token!==input.token)throw Error('Original private response link required');
  }
  const s=await source(db,input.purpose,input.subject,input.token,{reviewSnapshot});
  if(['reminder','entry_timing'].includes(input.purpose)){
   if(!scheduledPreview)assertReminderWindow(s.eventDate,now());
   const prior=await one(db,"SELECT id FROM ayambil_message_queue WHERE booking_id=? AND notification_type='reminder' AND (attempts>0 OR provider_id IS NOT NULL OR status IN ('preparing','sending','uncertain','accepted','sent','delivered','read','failed')) LIMIT 1",[s.canonicalSubject||input.subject]);
   if(prior)throw Error('Legacy reminder already attempted');
   const notice=await one(db,`SELECT n.id FROM ayambil_notification_outbox n WHERE n.subject=? AND n.purpose IN ('reminder','entry_timing') AND (n.attempts>0 OR n.provider_id IS NOT NULL OR n.state IN ('processing','uncertain','accepted','sent','delivered','read','failed')) AND (? IS NULL OR n.id<>?) AND ${input.purpose==='reminder'?entryPriorBlocksSql('n'):'TRUE'} LIMIT 1`,[s.canonicalSubject||input.subject,ownOutboxId,ownOutboxId]);
   if(notice)throw Error('Reminder or entry notice already attempted');
  }
  if(['booking_confirmed','waiting_approved'].includes(input.purpose)&&s.legacyConfirmation)throw Error('Legacy confirmation already attempted');
  if(purposeNeedsPass(input.purpose)||['reminder','entry_timing'].includes(input.purpose)){const eligibility=await loadAttendanceEligibility(db,{eventDate:s.eventDate,mobile:s.mobile});if(eligibility.reasons.some(r=>['unresolved_duplicate_review','repeated_name_hold'].includes(r)))throw Error('Confirmed notification held for duplicate/name review');}
  if(input.purpose==='pass_link'){
   if(s.legacyPass)throw Error('Legacy pass link already attempted');
   const modern=await one(db,"SELECT id FROM ayambil_notification_outbox WHERE subject=? AND purpose IN ('booking_confirmed','waiting_approved') AND (attempts>0 OR provider_id IS NOT NULL OR state IN ('processing','uncertain','accepted','sent','delivered','read')) LIMIT 1",[s.canonicalSubject||input.subject]);if(modern)throw Error('Combined pass CTA already submitted or uncertain');
  }
  const event=await one(db,'SELECT snapshot FROM ayambil_events WHERE event_date=?',[s.eventDate]);
  const session=typeof event?.snapshot==='string'?JSON.parse(event.snapshot):event?.snapshot;if(!session)throw Error('Event unavailable');
  const passSubject=(purposeNeedsPass(input.purpose)||['reminder','entry_timing'].includes(input.purpose)&&catalog.find(t=>t.purpose==='entry_timing')?.button)?(input.purpose==='waiting_approved'?(await one(db,'SELECT booking_id FROM ayambil_waiting WHERE id=? OR booking_id=?',[input.subject,input.subject]))?.booking_id:input.subject):null;
  const data={...s,eventLabel:session.performer,eventDate:session.label,urlSuffix:s.urlSuffix||(passSubject?(['reminder','entry_timing'].includes(input.purpose)?'':'passes#')+bookingPassToken(key,passSubject,session):undefined)};
  const payload=input.purpose==='reminder'?reminderPayload({session,source:{...s,urlSuffix:data.urlSuffix},build}):input.purpose==='pass_link'?combinedPassPayload({session,source:s,subject:passSubject,key,origin:config.origin}):build(input.purpose,data);return {s,payload:{...payload,to:s.mobile},hash:digest([s.identity,s.mobile,payload])};
 }
 async function attendanceRepairPlan(db,id){
  const meta=await one(db,'SELECT purpose,subject FROM ayambil_notification_outbox WHERE id=?',[id]);
  if(!meta||meta.purpose!=='attendance')throw Error('Attendance draft required');
  await lockSourceEvent(db,'attendance',meta.subject);
  const row=await one(db,'SELECT * FROM ayambil_notification_outbox WHERE id=? FOR UPDATE',[id]);
  if(row.state!=='blocked'||row.attempts!==0||row.provider_id||row.claim_id)throw Error('Blocked zero-attempt unclaimed draft required');
  const input=crypto.open(row.envelope),r=await one(db,'SELECT * FROM ayambil_family_reviews WHERE id=? FOR UPDATE',[row.subject]);
  if(input.purpose!=='attendance'||input.subject!==row.subject||input.round!==row.round_name||!r||r.purpose!=='attendance'||r.response||r.decision||!r.token_hash||r.token_hash!==createHash('sha256').update(input.token||'').digest('hex')||Date.parse(r.expires_at+'Z')<=Date.now())throw Error('Existing unanswered valid private link required');
  const prior=await one(db,"SELECT o.id FROM ayambil_notification_outbox o JOIN ayambil_family_reviews r ON r.id=o.subject WHERE o.purpose='attendance' AND r.event_date=? AND r.contact_key=? AND o.id<>? AND (o.attempts>0 OR o.provider_id IS NOT NULL OR o.state IN ('processing','uncertain','accepted','sent','delivered','read','failed')) LIMIT 1",[r.event_date,r.contact_key,id]);
  if(prior)throw Error('Attendance already attempted; no repair or resend');
  const eligible=await loadAttendanceEligibility(db,{eventDate:r.event_date,mobile:r.contact_key,now:now(),finalCutoff:config.attendanceFinalCutoff});assertAttendanceEligible(eligible);
  const snapshot=[];for(const id of eligible.bookingIds){const b=await booking(db,id);snapshot.push({id,number:b.bookingReference,mobile:b.mobile,contactName:b.contactName,eventDate:b.eventDate,names:b.names});}
  const oldSnapshot=typeof r.snapshot==='string'?JSON.parse(r.snapshot):r.snapshot;
  let reason='historical_eligibility_changed';try{const old=await envelope(db,input,{ownOutboxId:id});if(old.hash!==row.revision_hash)reason='payload_revision_changed';}catch(error){reason=({'Attendance contact snapshot stale':'contact_scope_changed','Review snapshot stale':'participant_snapshot_changed','Stale revision':'payload_revision_changed'})[error.message]||'source_previously_ineligible';}
  const current=await envelope(db,input,{ownOutboxId:id,reviewSnapshot:snapshot});
  return {row,r,input,snapshot,revision:current.hash,snapshotHash:digest(oldSnapshot),targetSnapshotHash:digest(snapshot),reason};
 }
 const lockName='ayambil-dispatch-'+digest(actual.database).slice(0,32);
 async function withLease(fn){const db=await pool.getConnection();try{const [[r]]=await db.query('SELECT GET_LOCK(?,0) acquired',[lockName]);if(r.acquired!==1){const error=Error('Dispatch busy; no retry was performed');error.code='DISPATCH_BUSY';throw error;}try{return await fn();}finally{await db.query('SELECT RELEASE_LOCK(?)',[lockName]);}}finally{db.release();}}
 async function gate(db,version,ownClaim=null){const c=await one(db,'SELECT * FROM ayambil_notification_owner WHERE id=1 FOR UPDATE');if(!c||c.owner!=='bilingual'||c.version!==version)throw Error('Paused or stale queue ownership');const inFlight=await one(db,"SELECT id FROM ayambil_message_queue WHERE status IN ('preparing','sending','uncertain') LIMIT 1");if(inFlight)throw Error('Legacy queue requires reconciliation');const modern=await one(db,"SELECT id FROM ayambil_notification_outbox WHERE state IN ('processing','uncertain')"+(ownClaim?' AND id<>?':'')+' LIMIT 1',ownClaim?[ownClaim]:[]);if(modern)throw Error('Notification queue requires reconciliation');}
 async function persist(db,input,round){
  const e=await envelope(db,input);if(e.s.sourceRound&&e.s.sourceRound!==round&&!input.followupOf)throw Error('Review round mismatch');
  const unit=['booking_verify','attendance'].includes(input.purpose)?[e.s.eventDate,e.s.contactUnit]:e.s.canonicalSubject||input.subject;
  const dedupe=digest([['booking_confirmed','waiting_approved'].includes(input.purpose)?'admission_confirmation':input.purpose,unit,round]);
  const previous=await one(db,'SELECT id,revision_hash FROM ayambil_notification_outbox WHERE dedupe_hash=? FOR UPDATE',[dedupe]);
  if(previous){if(previous.revision_hash!==e.hash)throw Error('Existing intent revision conflict');return previous.id;}
  const id=randomUUID();await db.execute('INSERT INTO ayambil_notification_outbox(id,dedupe_hash,revision_hash,purpose,subject,round_name,envelope,created_at,updated_at) VALUES(?,?,?,?,?,?,?,UTC_TIMESTAMP(3),UTC_TIMESTAMP(3))',[id,dedupe,e.hash,input.purpose,e.s.canonicalSubject||input.subject,round,crypto.seal(input)]);await db.execute('INSERT INTO ayambil_notification_audit VALUES(?,?,?,?,UTC_TIMESTAMP(3))',[randomUUID(),'system','prepared',JSON.stringify({id,purpose:input.purpose})]);return id;
 }
 return {
  legacyHistory,
  async ready(){const state=await this.owner();if(!state||!['paused','bilingual'].includes(state.owner)||!Number.isSafeInteger(state.version))throw Error('Notification owner schema unavailable');await pool.query('SELECT provider_id,state FROM ayambil_notification_outbox LIMIT 0');await pool.query('SELECT actor,action,detail FROM ayambil_notification_audit LIMIT 0');await this.recover();return true;},
  async owner(){return one(pool,'SELECT owner,version FROM ayambil_notification_owner WHERE id=1');},
  async reconcileUncertainFailure(id,actor){
   if(!actor?.admin_id||!/^[a-f0-9-]{36}$/.test(id||'')||typeof provider.recipientReceipts!=='function')throw Error('Exact authenticated uncertainty reconciliation required');
   const row=await one(pool,'SELECT * FROM ayambil_notification_outbox WHERE id=?',[id]);
   if(!row||!['attendance','reminder'].includes(row.purpose)||row.state!=='uncertain'||row.attempts!==1||row.provider_id||!row.claim_id)throw Error('Single uncertain supported attempt without provider reference required');
   const input=crypto.open(row.envelope);let mobile;
   if(input.subject!==row.subject||input.purpose!==row.purpose)throw Error('Original recipient context unavailable');
   if(row.purpose==='attendance'){
    const review=await one(pool,'SELECT * FROM ayambil_family_reviews WHERE id=?',[row.subject]);
    if(!review)throw Error('Original recipient context unavailable');
    const snapshots=typeof review.snapshot==='string'?JSON.parse(review.snapshot):review.snapshot;
    mobile=snapshots?.[0]?.mobile;if(!mobile||snapshots.some(b=>b.mobile!==mobile))throw Error('Exact original contact required');
   }else{
    // Rebuild only for identity verification, never submit. The original frozen
    // hash binds contact, passes and approved payload even outside the send window.
    const original=await tx(db=>envelope(db,input,{ownOutboxId:id,scheduledPreview:true}));
    if(original.hash!==row.revision_hash)throw Error('Original reminder context changed; manual review required');
    mobile=original.s.mobile;
   }
   const claim=await one(pool,"SELECT created_at FROM ayambil_notification_audit WHERE action='claim_committed' AND BINARY JSON_UNQUOTE(JSON_EXTRACT(detail,'$.id'))=BINARY ? ORDER BY created_at DESC LIMIT 1",[id]);
   const started=Date.parse(claim?.created_at+'Z');if(!Number.isFinite(started))throw Error('Claim timestamp unavailable');
   const receipts=await provider.recipientReceipts(mobile),name=catalog.find(t=>t.purpose===(row.purpose==='reminder'?'entry_timing':'attendance'))?.name;
   const matches=receipts.filter(r=>r.template===name&&r.status==='failed'&&typeof r.createdAt==='string'&&/(?:Z|[+-]\d\d:\d\d)$/.test(r.createdAt)&&Date.parse(r.createdAt)>=started-1000&&Date.parse(r.createdAt)<=started+15000);
   if(matches.length!==1)throw Error('Exactly one provider failure matching original contact, template and claim window required');
   const receipt=matches[0],status=await provider.status(receipt.id);if(status.status!=='failed')throw Error('Authenticated provider terminal failure not confirmed');
   return withLease(()=>tx(async db=>{if(row.purpose==='reminder')await lockSourceEvent(db,row.purpose,row.subject);const current=await one(db,'SELECT * FROM ayambil_notification_outbox WHERE id=? FOR UPDATE',[id]);
    if(current.state!=='uncertain'||current.attempts!==1||current.provider_id||current.claim_id!==row.claim_id||current.envelope!==row.envelope)throw Error('Uncertain attempt changed');
    if(row.purpose==='reminder'&&(await envelope(db,input,{ownOutboxId:id,scheduledPreview:true})).hash!==current.revision_hash)throw Error('Original reminder context changed; manual review required');
    if(await one(db,'SELECT id FROM ayambil_notification_outbox WHERE provider_id=? AND id<>? LIMIT 1',[receipt.id,id]))throw Error('Provider reference already associated');
    await db.execute("UPDATE ayambil_notification_outbox SET state='failed',provider_id=?,error_code='provider_failure_reconciled',last_checked_at=UTC_TIMESTAMP(3),updated_at=UTC_TIMESTAMP(3) WHERE id=?",[receipt.id,id]);
    await db.execute('INSERT INTO ayambil_notification_audit VALUES(?,?,?,?,UTC_TIMESTAMP(3))',[randomUUID(),actor.admin_id,'uncertain_failure_reconciled',JSON.stringify({id,previous:'uncertain',state:'failed',providerId:receipt.id,source:'authenticated_recipient_history_and_status',noResend:true})]);
    return {id,state:'failed',providerReferencePresent:true,sent:false,providerSubmissions:0};
   }));
  },
  async correctContactCountry({id,expectedMobile,newMobile,version},actor){
   if(!actor?.admin_id||!/^[a-f0-9-]{36}$/.test(id||'')||!/^\+[1-9]\d{10,12}$/.test(expectedMobile||'')||!/^\+91[6-9]\d{9}$/.test(newMobile||'')||expectedMobile===newMobile||expectedMobile.slice(-10)!==newMobile.slice(-10))throw new ApiError(409,'Reviewed same local number and corrected Indian country code required');
   if(typeof provider.recipientHistory!=='function')throw new ApiError(409,'Authenticated recipient history verification required');
   const oldHistory=await provider.recipientHistory(expectedMobile),newHistory=await provider.recipientHistory(newMobile);
   if(!Array.isArray(oldHistory.ids)||(newHistory.total!==0&&newHistory.nonTemplateOnly!==true))throw new ApiError(409,'Corrected recipient already has provider history; separate purpose review required');
   return withLease(()=>tx(async db=>{await lockSourceEvent(db,'booking_confirmed',id);await gate(db,version);const b=await one(db,'SELECT * FROM ayambil_bookings WHERE id=? FOR UPDATE',[id]);
    if(!b||b.mobile!==expectedMobile||b.status!=='active'||!b.whatsapp_consent)throw new ApiError(409,'Canonical contact changed or booking ineligible');
    const attempted=await one(db,"SELECT id FROM ayambil_notification_outbox WHERE subject=? AND purpose IN ('booking_confirmed','waiting_approved','pass_link') AND (attempts>0 OR provider_id IS NOT NULL OR state IN ('processing','uncertain','accepted','sent','delivered','read','failed')) LIMIT 1",[id]);if(attempted)throw new ApiError(409,'Existing modern admission submission requires separate recipient review');
    await booking(db,id);
    const [legacy]=await db.execute("SELECT id,notification_type,status,attempts,provider_id,payload FROM ayambil_message_queue WHERE booking_id=? AND notification_type IN ('confirmation','pass') AND (attempts>0 OR provider_id IS NOT NULL OR status IN ('preparing','sending','uncertain','accepted','sent','delivered','read','failed')) FOR UPDATE",[id]);
    if(legacy.some(j=>['preparing','sending','uncertain'].includes(j.status)))throw new ApiError(409,'Legacy acceptance unresolved');
    for(const j of legacy){if(j.payload){let context;try{context=crypto.open(j.payload);}catch{throw new ApiError(409,'Prior recipient evidence unavailable');}if(String(context.to||'').replace(/\D/g,'')!==expectedMobile.replace(/\D/g,''))throw new ApiError(409,'Prior provider recipient does not match reviewed wrong country code');}else if(!j.provider_id||!oldHistory.ids.includes(j.provider_id))throw new ApiError(409,'Prior recipient receipt evidence unavailable');}
    const [oldReviews]=await db.execute("SELECT id,expires_at FROM ayambil_family_reviews WHERE event_date=? AND response IS NULL AND decision IS NULL AND REGEXP_REPLACE(contact_key,'[^0-9]','')=? AND EXISTS(SELECT 1 FROM JSON_TABLE(snapshot,'$[*]' COLUMNS(booking_id VARCHAR(36) PATH '$.id')) j WHERE j.booking_id=?) FOR UPDATE",[b.event_date,expectedMobile.replace(/\D/g,''),id]);
    const [updated]=await db.execute('UPDATE ayambil_bookings SET mobile=? WHERE id=? AND mobile=?',[newMobile,id,expectedMobile]);if(updated.affectedRows!==1)throw new ApiError(409,'Contact revision conflict');
    for(const r of oldReviews)await db.execute('UPDATE ayambil_family_reviews SET expires_at=UTC_TIMESTAMP(3) WHERE id=? AND response IS NULL AND decision IS NULL',[r.id]);
    // Original queue/receipts remain immutable. Only exact proven wrong-recipient
    // legacy IDs are distinguished from a submission to the corrected contact.
    await db.execute('INSERT INTO ayambil_notification_audit VALUES(?,?,?,?,UTC_TIMESTAMP(3))',[randomUUID(),actor.admin_id,'contact_country_corrected',JSON.stringify({bookingId:id,previousMobile:expectedMobile,newMobile,reviewedNewRecipientNonTemplateIds:newHistory.ids,revokedUnansweredReviews:oldReviews.map(r=>({id:r.id,previousExpiry:r.expires_at})),legacy:legacy.map(j=>({id:j.id,purpose:j.notification_type,providerId:j.provider_id,state:j.status}))})]);
    return {corrected:true,bookingId:id,sent:false,passesUnchanged:true,legacyHistoryPreserved:true};
   }));
  },
  async previewAttendanceRepair(id,actor){
   if(!actor?.admin_id||!/^[a-f0-9-]{36}$/.test(id||''))throw Error('Exact draft and administrator required');
   await provider.validate('attendance');
   return tx(async db=>{const p=await attendanceRepairPlan(db,id);return {id,reason:p.reason,previousHash:p.row.revision_hash,snapshotHash:p.snapshotHash,targetHash:p.revision,targetSnapshotHash:p.targetSnapshotHash,bookingCount:p.snapshot.length,persons:p.snapshot.reduce((n,b)=>n+b.names.length,0),sent:false};});
  },
  async repairAttendanceDraft({id,previousHash,snapshotHash,targetHash,targetSnapshotHash,version},actor){
   if(!actor?.admin_id||!/^[a-f0-9-]{36}$/.test(id||'')||[previousHash,snapshotHash,targetHash,targetSnapshotHash].some(h=>!/^[a-f0-9]{64}$/.test(h||'')))throw Error('Exact reviewed repair required');
   await provider.validate('attendance');
   return withLease(()=>tx(async db=>{const p=await attendanceRepairPlan(db,id);await gate(db,version);
    if(p.row.revision_hash!==previousHash||p.snapshotHash!==snapshotHash||p.revision!==targetHash||p.targetSnapshotHash!==targetSnapshotHash)throw Error('Attendance source changed; review again');
    const [review]=await db.execute('UPDATE ayambil_family_reviews SET snapshot=? WHERE id=? AND response IS NULL AND decision IS NULL',[JSON.stringify(p.snapshot),p.r.id]);if(review.affectedRows!==1)throw Error('Review changed');
    const e=await envelope(db,p.input,{ownOutboxId:id});if(e.hash!==targetHash)throw Error('Repair revision changed');
    const [updated]=await db.execute("UPDATE ayambil_notification_outbox SET revision_hash=?,state='held',error_code=NULL,updated_at=UTC_TIMESTAMP(3) WHERE id=? AND state='blocked' AND attempts=0 AND provider_id IS NULL AND claim_id IS NULL AND revision_hash=?",[targetHash,id,previousHash]);if(updated.affectedRows!==1)throw Error('Draft changed');
    await db.execute('INSERT INTO ayambil_notification_audit VALUES(?,?,?,?,UTC_TIMESTAMP(3))',[randomUUID(),actor.admin_id,'attendance_draft_repaired',JSON.stringify({id,reviewId:p.r.id,reason:p.reason,previousHash,targetHash,snapshotHash,targetSnapshotHash})]);
    return {id,state:'held',sent:false,linksUnchanged:true};
   }));
  },
  async authorizeEntryFollowup(id,actor){
   if(!actor?.admin_id||!/^[-a-f0-9]{36}$/.test(id)||catalog.find(t=>t.purpose==='entry_timing')?.parameters.length!==5)throw Error('Administrator and reviewed five-field revision required');
   await provider.validate('entry_timing');
   return withLease(()=>tx(async db=>{
    const meta=await one(db,'SELECT subject FROM ayambil_notification_outbox WHERE id=?',[id]);if(!meta)throw Error('Prior entry receipt unavailable');
    await lockSourceEvent(db,'entry_timing',meta.subject);
    const old=await one(db,'SELECT * FROM ayambil_notification_outbox WHERE id=? FOR UPDATE',[id]);
    if(old.purpose!=='entry_timing'||!['delivered','read'].includes(old.state)||!old.provider_id||old.attempts<1)throw Error('Exact delivered prior Entry timing receipt required');
    const b=await booking(db,old.subject),session=dueReminderSession(new Date(Date.parse(b.eventDate+'T00:00:00+05:30')-6*3600000));
    const scheduledAt=new Date(Date.parse(b.eventDate+'T00:00:00+05:30')-6*3600000).toISOString();
    if(!session||new Date(now()).getTime()>=Date.parse(b.eventDate+'T00:00:00+05:30'))throw Error('Future/current scheduled event window required');
    const prior=await one(db,"SELECT id FROM ayambil_notification_audit WHERE action=? AND BINARY JSON_UNQUOTE(JSON_EXTRACT(detail,'$.subject'))=BINARY ? AND JSON_UNQUOTE(JSON_EXTRACT(detail,'$.definitionHash'))=? LIMIT 1",[entryFollowupAction,old.subject,entryRevisionDefinitionHash]);
    if(!prior)await db.execute('INSERT INTO ayambil_notification_audit VALUES(?,?,?,?,UTC_TIMESTAMP(3))',[randomUUID(),actor.admin_id,entryFollowupAction,JSON.stringify({oldId:old.id,subject:old.subject,oldHash:old.revision_hash,providerId:old.provider_id,definitionHash:entryRevisionDefinitionHash,purpose:'reminder',scheduledAt})]);
    return {authorized:true,unchanged:!!prior,oldId:id,scheduledAt,sent:false,historyPreserved:true};
   }));
  },
  async handover({owner,version},actor){if(!actor?.admin_id||!['paused','bilingual'].includes(owner))throw Error('Admin and supported owner required');return withLease(()=>tx(async db=>{const c=await one(db,'SELECT * FROM ayambil_notification_owner WHERE id=1 FOR UPDATE');if(c.version!==version)throw Error('Stale ownership revision');if(owner==='bilingual'){const legacy=await one(db,"SELECT id FROM ayambil_message_queue WHERE status IN ('preparing','sending','uncertain') LIMIT 1");const modern=await one(db,"SELECT id FROM ayambil_notification_outbox WHERE state IN ('processing','uncertain') LIMIT 1");if(legacy||modern)throw Error('In-flight or uncertain jobs block activation');}await db.execute('UPDATE ayambil_notification_owner SET owner=?,version=version+1 WHERE id=1',[owner]);await db.execute('INSERT INTO ayambil_notification_audit VALUES(?,?,?,?,UTC_TIMESTAMP(3))',[randomUUID(),actor.admin_id,'owner_changed',JSON.stringify({owner,version:version+1})]);return {owner,version:version+1};}));},
  async reconcile(id,actor){if(!actor?.admin_id)throw Error('Administrator required');const row=await one(pool,'SELECT id,state,provider_id FROM ayambil_notification_outbox WHERE id=?',[id]);if(!row?.provider_id||!['accepted','sent','delivered','read','failed','uncertain'].includes(row.state))throw Error('Known provider reference required; no resend');const result=await provider.status(row.provider_id);return tx(async db=>{const current=await one(db,'SELECT * FROM ayambil_notification_outbox WHERE id=? FOR UPDATE',[id]);if(current.provider_id!==row.provider_id)throw Error('Provider reference changed');const state=nextDeliveryStatus(current.state,result.status);await db.execute('UPDATE ayambil_notification_outbox SET last_checked_at=UTC_TIMESTAMP(3) WHERE id=?',[id]);if(state!==current.state){await db.execute('UPDATE ayambil_notification_outbox SET state=?,updated_at=UTC_TIMESTAMP(3) WHERE id=?',[state,id]);await db.execute('INSERT INTO ayambil_notification_audit VALUES(?,?,?,?,UTC_TIMESTAMP(3))',[randomUUID(),actor.admin_id,'status_reconciled',JSON.stringify({id,previous:current.state,state})]);}return {status:state};});},
  async prepareEntryNotice({bookingIds,round},actor){
   if(!actor?.admin_id||!Array.isArray(bookingIds)||!bookingIds.length||bookingIds.length>20||new Set(bookingIds).size!==bookingIds.length||!/^[a-zA-Z0-9_-]{1,64}$/.test(round||''))throw Error('Select 1-20 distinct bookings and an explicit notice round');
   const items=[];for(const id of bookingIds){const outbox=await this.enqueue({purpose:'entry_timing',subject:id,round});items.push(outbox);}
   await pool.execute('INSERT INTO ayambil_notification_audit VALUES(?,?,?,?,UTC_TIMESTAMP(3))',[randomUUID(),actor.admin_id,'notice_prepared',JSON.stringify({ids:items,round})]);return {ids:items,sent:false};
  },
  async enqueueHeldIntent(id,{token}={}){
   const row=await one(pool,"SELECT * FROM ayambil_notification_intents WHERE id=? AND state='held'",[id]);
   if(!row)throw Error('Held intent required');
   // Re-read authoritative source instead of trusting stored recipient/attendee context.
   try{return await this.enqueue({purpose:row.purpose,subject:row.subject,round:row.review_round,token});}catch(error){const reason=eligibilityReasons.get(error?.message);if(reason){error.code='NOTIFICATION_INELIGIBLE';error.holdReason=reason;}throw error;}
  },
  async prepareSubject({purpose,subject},actor,controls){
   if(purpose==='attendance_followup'){
    if(!actor?.admin_id||!/^[a-f0-9-]{36}$/.test(subject||'')||!config.attendanceFinalCutoff)throw Error('Reviewed final Attendance follow-up required');
    await provider.validate('attendance');
    return tx(async db=>{
     const original=await one(db,"SELECT * FROM ayambil_notification_outbox WHERE id=? AND purpose='attendance' AND round_name='initial'",[subject]);
     if(!original)throw Error('Exact original initial Attendance outbox required');
     const input=crypto.open(original.envelope),round='response-followup-'+config.attendanceFinalCutoff.slice(0,10).replaceAll('-','');
     const id=await persist(db,{...input,round,followupOf:subject},round);
     await db.execute('INSERT INTO ayambil_notification_audit VALUES(?,?,?,?,UTC_TIMESTAMP(3))',[randomUUID(),actor.admin_id,'attendance_followup_prepared',JSON.stringify({id,initialId:subject,round,cutoff:config.attendanceFinalCutoff})]);
     return {id,sent:false};
    });
   }
   if(!actor?.admin_id||!['booking_confirmed','waiting_received','waiting_approved','pass_link','attendance','reminder'].includes(purpose)||!/^[a-f0-9-]{36}$/.test(subject||''))throw Error('Reviewed notification subject required');
   if(purpose!=='attendance')return {id:await this.enqueue({purpose,subject,round:'initial'}),sent:false};
   await provider.validate('attendance');
   const review=await controls.createReview(actor,{purpose:'attendance',bookingIds:[subject],round:'initial',unansweredOnly:true});
   const id=await tx(async db=>{
    const meta=await one(db,'SELECT event_date FROM ayambil_family_reviews WHERE id=?',[review.id]);if(!meta)throw Error('Review unavailable');await lockAttendanceEvent(db,meta.event_date);
    const r=await one(db,'SELECT * FROM ayambil_family_reviews WHERE id=? FOR UPDATE',[review.id]);
    if(!r||r.response||r.decision)throw Error('Review answered or unavailable');
    const old=await one(db,"SELECT id FROM ayambil_notification_outbox WHERE purpose='attendance' AND subject=?",[review.id]);if(old)return old.id;
    // Never replace a previously issued link. Its escrow must be supplied through
    // the existing intent preparation route if it is not already encrypted here.
    if(r.token_hash||r.expires_at)throw Error('Existing private link requires original secure escrow; no link replaced');
    const token=randomBytes(32).toString('hex');await db.execute('UPDATE ayambil_family_reviews SET token_hash=?,expires_at=DATE_ADD(UTC_TIMESTAMP(3),INTERVAL 7 DAY) WHERE id=?',[createHash('sha256').update(token).digest('hex'),review.id]);
    await db.execute('INSERT INTO ayambil_control_audit VALUES(?,?,?,?,?,UTC_TIMESTAMP(3))',[randomUUID(),actor.admin_id,review.id,'initial_link_created',JSON.stringify({purpose:'attendance',encryptedOutbox:true})]);
    // Initial token and encrypted envelope commit together; a failed preparation
    // rolls the token back, so no unrecoverable active link can be orphaned.
    return persist(db,{purpose:'attendance',subject:review.id,round:'initial',token},'initial');
   });return {id,sent:false};
  },
  async reviewSelection({subjects,purpose},actor){
   if(!actor?.admin_id||!Array.isArray(subjects)||subjects.length<1||subjects.length>20||new Set(subjects).size!==subjects.length||subjects.some(id=>!/^[a-f0-9-]{36}$/.test(id))||!['booking_confirmed','waiting_received','waiting_approved','pass_link','reminder'].includes(purpose))throw Error('Select 1–20 distinct registrations and an exact supported message type');
   const items=[];
   for(const subject of subjects){
    try{const e=await tx(db=>envelope(db,{purpose,subject,round:'initial'}));const [old]=await pool.execute("SELECT id,state,attempts,provider_id,purpose,round_name FROM ayambil_notification_outbox WHERE subject=? AND (purpose=? OR ? IN ('booking_confirmed','waiting_approved','pass_link') AND purpose IN ('booking_confirmed','waiting_approved')) ORDER BY created_at LIMIT 1",[e.s.canonicalSubject||subject,purpose,purpose]);
     const existing=old[0],eligible=!existing||existing.purpose===purpose&&['held','ready'].includes(existing.state)&&existing.attempts===0&&!existing.provider_id;
     items.push({subject,contactName:e.s.contactName,purpose,eligible,reason:eligible?'ready_for_preparation':'already_recorded_no_resend',existing:existing?{id:existing.id,state:existing.state,attempts:existing.attempts}:null});
    }catch(error){const reason=eligibilityReasons.get(error.message)||({'Legacy pass link already attempted':'prior_legacy_pass','Combined pass CTA already submitted or uncertain':'pass_cta_already_submitted','Legacy reminder already attempted':'prior_legacy_reminder','Reminder outside previous-day 18:00 IST window':'reminder_not_due'})[error.message]||'eligibility_requires_review';items.push({subject,purpose,eligible:false,reason});}
   }
   return {items,sent:false};
  },
  async enqueue(input){
   await provider.validate(input.purpose);
   if(!['pass_link','reminder'].includes(input.purpose)&&!catalog.some(t=>t.purpose===input.purpose)||!['booking_confirmed','waiting_received','waiting_approved','booking_verify','attendance','entry_timing','pass_link','reminder'].includes(input.purpose))throw Error('Unknown purpose');
   const round=input.round||'initial';if(!/^[a-zA-Z0-9_-]{1,64}$/.test(round))throw Error('Invalid round');
   if(['booking_confirmed','waiting_received','waiting_approved','pass_link','reminder'].includes(input.purpose)&&round!=='initial')throw Error('Initial transactional message cannot be repeated');
   return tx(db=>persist(db,input,round));
  },
  async runOne(id,{ownershipVersion,actor='worker',automaticSince=null,automaticReminder=false}={}){
   if(config.notificationDispatch!==true)throw Error('Notification dispatch disabled');
   return withLease(async()=>{
   const candidate=await one(pool,'SELECT purpose,subject FROM ayambil_notification_outbox WHERE id=?',[id]);if(!candidate)return {status:'not_claimed'};
   if(automaticReminder&&candidate.purpose!=='reminder')throw Error('Reminder purpose required');
   if(automaticSince){
    if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(automaticSince))throw Error('Exact automatic cutoff required');
    if(!['booking_confirmed','waiting_received','waiting_approved'].includes(candidate.purpose))throw Error('Automatic transactional purpose required');
    const intent=await one(pool,"SELECT id FROM ayambil_notification_intents WHERE subject=? AND purpose=? AND review_round='initial' AND created_at>? LIMIT 1",[candidate.subject,candidate.purpose,automaticSince.replace('T',' ').replace('Z','')]);
    if(!intent)throw Error('Outside automatic activation boundary');
   }
   // Durable pacing is shared by foreground and worker, inside the same lease.
   // A deferred job has never been claimed/submitted and may be selected later.
   const recent=await one(pool,"SELECT id FROM ayambil_notification_audit WHERE action='claim_committed' AND created_at>DATE_SUB(UTC_TIMESTAMP(3),INTERVAL 17 SECOND) LIMIT 1");
   if(recent)return {status:'deferred'};
   try{await provider.validate(candidate.purpose);}catch{await pool.execute("UPDATE ayambil_notification_outbox SET state='blocked',error_code='provider_preflight' WHERE id=? AND state IN ('held','ready')",[id]);return {status:'blocked'};}
   let claimed;
   const lockEvent=db=>lockSourceEvent(db,candidate.purpose,candidate.subject);
   await tx(async db=>{await lockEvent(db);const row=await one(db,'SELECT * FROM ayambil_notification_outbox WHERE id=? FOR UPDATE',[id]);if(!row||!['held','ready'].includes(row.state))return;await gate(db,ownershipVersion);
    let e;try{e=await envelope(db,crypto.open(row.envelope),{ownOutboxId:id});if(e.hash!==row.revision_hash)throw Error('Stale revision');}catch{await db.execute("UPDATE ayambil_notification_outbox SET state='blocked',error_code='eligibility_or_mapping',updated_at=UTC_TIMESTAMP(3) WHERE id=?",[id]);return;}
    const claim=randomUUID();await db.execute("UPDATE ayambil_notification_outbox SET state='processing',claim_id=?,attempts=attempts+1,updated_at=UTC_TIMESTAMP(3) WHERE id=?",[claim,id]);await db.execute('INSERT INTO ayambil_notification_audit VALUES(?,?,?,?,UTC_TIMESTAMP(3))',[randomUUID(),actor,'claim_committed',JSON.stringify({id})]);claimed={claim,payload:e.payload};
   });
   if(!claimed)return {status:'not_claimed'};
   // Re-read after durable claiming, immediately before the provider boundary.
   {
    try{await tx(async db=>{await lockEvent(db);const row=await one(db,'SELECT * FROM ayambil_notification_outbox WHERE id=? FOR UPDATE',[id]);if(!row||row.state!=='processing'||row.claim_id!==claimed.claim)throw Error('Stale claim');await gate(db,ownershipVersion,id);const current=await envelope(db,crypto.open(row.envelope),{ownOutboxId:id});if(current.hash!==row.revision_hash)throw Error('Stale revision');claimed.payload=current.payload;});}
    catch{await pool.execute("UPDATE ayambil_notification_outbox SET state='blocked',error_code='eligibility_changed_before_submit',updated_at=UTC_TIMESTAMP(3) WHERE id=? AND claim_id=? AND state='processing'",[id,claimed.claim]);return {status:'blocked'};}
   }
   let result;try{result=await provider.submit(claimed.payload);}catch{result={status:'uncertain'};}

   const validId=typeof result?.providerId==='string'&&/^[^\s\x00-\x1f\x7f]{1,200}$/.test(result.providerId);
   const status=validId&&['accepted','sent','delivered','read'].includes(result.status)?result.status:result?.status==='rejected'?'failed':result?.status==='rate_limited'?'failed':'uncertain';
   try{await pool.execute('UPDATE ayambil_notification_outbox SET state=?,provider_id=?,error_code=?,updated_at=UTC_TIMESTAMP(3) WHERE id=? AND claim_id=? AND state=\'processing\'',[status,validId?result.providerId:null,result?.status==='rate_limited'?'rate_limited':null,id,claimed.claim]);}catch{await pool.execute("UPDATE ayambil_notification_outbox SET state='uncertain',error_code='receipt_persist_failed' WHERE id=? AND claim_id=?",[id,claimed.claim]);return {status:'uncertain'};}
   return {status};
   }).catch(error=>{if(error?.code==='DISPATCH_BUSY')return {status:'deferred'};throw error;});
  },
  async reconcileNext(){const row=await one(pool,"SELECT id FROM ayambil_notification_outbox WHERE state IN ('accepted','sent') AND provider_id IS NOT NULL AND (last_checked_at IS NULL OR last_checked_at<DATE_SUB(UTC_TIMESTAMP(3),INTERVAL 1 MINUTE)) ORDER BY COALESCE(last_checked_at,created_at),id LIMIT 1");return row?this.reconcile(row.id,{admin_id:'scheduler'}):{processed:false};},
  async recover(){await pool.execute("UPDATE ayambil_notification_outbox SET state='uncertain',error_code='interrupted_claim',updated_at=UTC_TIMESTAMP(3) WHERE state='processing' AND updated_at<DATE_SUB(UTC_TIMESTAMP(3),INTERVAL 5 MINUTE)");},
  async pending(since,{excludeIntentIds=[]}={}){
   if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(since||''))throw Error('Explicit activation cutoff required');
   if(!Array.isArray(excludeIntentIds)||excludeIntentIds.length>1000||excludeIntentIds.some(id=>!/^[-a-f0-9]{36}$/.test(id)))throw Error('Invalid held-intent exclusion');
   const exclude=excludeIntentIds.length?' AND i.id NOT IN ('+excludeIntentIds.map(()=>'?').join(',')+')':'';
   const [r]=await pool.execute("SELECT i.id,o.id outbox_id FROM ayambil_notification_intents i LEFT JOIN ayambil_notification_outbox o ON o.subject=i.subject AND (o.purpose=i.purpose OR o.purpose IN ('booking_confirmed','waiting_approved') AND i.purpose IN ('booking_confirmed','waiting_approved')) WHERE i.state='held' AND i.review_round='initial' AND i.purpose IN ('booking_confirmed','waiting_received','waiting_approved') AND i.created_at>? AND (o.id IS NULL OR o.purpose=i.purpose AND o.state IN ('held','ready') AND o.attempts=0 AND o.provider_id IS NULL)"+exclude+" ORDER BY i.created_at,i.id LIMIT 1",[since.replace('T',' ').replace('Z',''),...excludeIntentIds]);return r;
  },
  async nextReminder({excludeSubjects=[]}={}){
   const due=dueReminderSession(now());if(!due)return null;
   if(!Array.isArray(excludeSubjects)||excludeSubjects.length>2000||excludeSubjects.some(id=>!/^[-a-f0-9]{36}$/.test(id)))throw Error('Invalid reminder exclusion');
   const extra=excludeSubjects.length?' AND b.id NOT IN ('+excludeSubjects.map(()=>'?').join(',')+')':'';
   const [rows]=await pool.execute(`SELECT b.id,o.id outbox_id FROM ayambil_bookings b LEFT JOIN ayambil_notification_outbox o ON o.subject=b.id AND o.purpose='reminder' WHERE b.event_date=? AND b.status='active' AND b.whatsapp_consent=1 AND EXISTS(SELECT 1 FROM ayambil_attendees a JOIN ayambil_passes p ON p.attendee_id=a.id WHERE a.booking_id=b.id AND a.status='active' AND p.status='active' AND p.trashed_at IS NULL) AND NOT EXISTS(SELECT 1 FROM ayambil_message_queue q WHERE q.booking_id=b.id AND q.notification_type='reminder' AND (q.attempts>0 OR q.provider_id IS NOT NULL OR q.status IN ('preparing','sending','uncertain','accepted','sent','delivered','read','failed'))) AND NOT EXISTS(SELECT 1 FROM ayambil_notification_outbox n WHERE n.subject=b.id AND n.purpose IN ('reminder','entry_timing') AND (n.attempts>0 OR n.provider_id IS NOT NULL OR n.state IN ('processing','uncertain','accepted','sent','delivered','read','failed')) AND ${entryPriorBlocksSql('n')}) AND (o.id IS NULL OR o.state IN ('held','ready') AND o.attempts=0 AND o.provider_id IS NULL)`+extra+" ORDER BY b.created_at,b.id LIMIT 1",[due.date,...excludeSubjects]);
   return rows[0]||null;
  },
  async previewEntryRevision(ids){
   if(!Array.isArray(ids)||ids.length<1||ids.length>20||new Set(ids).size!==ids.length||ids.some(id=>!/^[-a-f0-9]{36}$/.test(id)))throw Error('Exact held entry IDs required');
   if(catalog.find(t=>t.purpose==='entry_timing')?.parameters.length!==5)throw Error('New reviewed entry revision must be explicitly selected');
   await provider.validate('entry_timing');const items=[];
   for(const id of ids){try{const item=await tx(async db=>{const row=await one(db,'SELECT * FROM ayambil_notification_outbox WHERE id=? FOR UPDATE',[id]);if(!row||!['entry_timing','reminder'].includes(row.purpose)||row.state!=='held'||row.attempts!==0||row.provider_id||row.claim_id)throw Error('Held zero-attempt unclaimed scheduled notice required');const input=crypto.open(row.envelope);if(input.purpose!==row.purpose||input.subject!==row.subject||(input.round||'initial')!==row.round_name)throw Error('Envelope binding mismatch');const e=await envelope(db,input,{ownOutboxId:id,scheduledPreview:true});return {id,purpose:row.purpose,compatible:true,validPersons:e.s.attendeeCount,previousHash:row.revision_hash,targetHash:e.hash,requiresRefresh:row.revision_hash!==e.hash};});items.push(item);}catch{items.push({id,compatible:false,reason:'source_or_revision_requires_review'});}}
   return {items,sendAllowed:false,writes:0};
  },
  async refreshEntryRevision(ids,actor){
   if(!actor?.admin_id)throw Error('Administrator required');const preview=await this.previewEntryRevision(ids);
   if(preview.items.some(i=>!i.compatible))throw Error('All held notices must pass current no-send preview');
   return tx(async db=>{const refreshed=[];for(const item of [...preview.items].sort((a,b)=>a.id.localeCompare(b.id))){const meta=await one(db,'SELECT purpose,subject FROM ayambil_notification_outbox WHERE id=?',[item.id]);await lockSourceEvent(db,meta.purpose,meta.subject);const row=await one(db,'SELECT * FROM ayambil_notification_outbox WHERE id=? FOR UPDATE',[item.id]);if(row.state!=='held'||row.attempts!==0||row.provider_id||row.claim_id||row.revision_hash!==item.previousHash)throw Error('Held notice changed; no refresh applied');const e=await envelope(db,crypto.open(row.envelope),{ownOutboxId:row.id,scheduledPreview:true});if(e.hash!==item.targetHash)throw Error('Current source changed; no refresh applied');if(row.revision_hash!==e.hash){const [r]=await db.execute("UPDATE ayambil_notification_outbox SET revision_hash=? WHERE id=? AND revision_hash=? AND state='held' AND attempts=0 AND provider_id IS NULL AND claim_id IS NULL",[e.hash,row.id,row.revision_hash]);if(r.affectedRows!==1)throw Error('Revision conflict');await db.execute('INSERT INTO ayambil_notification_audit VALUES(?,?,?,?,UTC_TIMESTAMP(3))',[randomUUID(),actor.admin_id,'entry_revision_refreshed',JSON.stringify({id:row.id,oldHash:row.revision_hash,newHash:e.hash,definition:'meta-2026-10-28-five-body-pass-button'})]);}refreshed.push({id:row.id,changed:row.revision_hash!==e.hash});}return {items:refreshed,sent:false};});
  },
  async observeReceipts(input){return observeKnownReceipts(pool,provider,input);},
  async nextAttendance(since,{excludeSubjects=[]}={}){
   if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(since||'')||!Array.isArray(excludeSubjects)||excludeSubjects.length>2000||excludeSubjects.some(id=>!/^[-a-f0-9]{36}$/.test(id)))throw Error('Reviewed attendance cutoff/exclusions required');
   const [prepared]=await pool.execute("SELECT b.id,b.event_date,b.mobile,o.id outbox_id FROM ayambil_notification_outbox o JOIN ayambil_family_reviews r ON r.id=o.subject JOIN ayambil_bookings b ON b.id=JSON_UNQUOTE(JSON_EXTRACT(r.snapshot,'$[0].id')) WHERE o.purpose='attendance' AND o.state IN ('held','ready') AND o.attempts=0 AND o.provider_id IS NULL AND o.claim_id IS NULL AND r.response IS NULL AND r.decision IS NULL AND r.created_at>? ORDER BY o.created_at LIMIT 20",[since.replace('T',' ').replace('Z','')]);
   for(const row of prepared){if(excludeSubjects.includes(row.id))continue;const eligibility=await loadAttendanceEligibility(pool,{eventDate:row.event_date,mobile:row.mobile,now:now(),finalCutoff:config.attendanceFinalCutoff});if(eligibility.eligible)return row;}
   const extra=excludeSubjects.length?' AND b.id NOT IN ('+excludeSubjects.map(()=>'?').join(',')+')':'';
   const [rows]=await pool.execute("SELECT b.id,b.event_date,b.mobile FROM ayambil_bookings b WHERE b.status='active' AND b.whatsapp_consent=1 AND (b.created_at>? OR EXISTS(SELECT 1 FROM ayambil_waiting w WHERE w.booking_id=b.id AND w.approved_at>?)) AND b.created_at<=DATE_SUB(UTC_TIMESTAMP(3),INTERVAL 48 HOUR) AND NOT EXISTS(SELECT 1 FROM ayambil_family_reviews r WHERE r.purpose='attendance' AND r.event_date=b.event_date AND r.contact_key=REGEXP_REPLACE(b.mobile,'[^0-9]','')) AND EXISTS(SELECT 1 FROM ayambil_notification_outbox o WHERE o.subject=b.id AND o.purpose IN ('booking_confirmed','waiting_approved') AND o.provider_id IS NOT NULL AND o.state IN ('accepted','sent','delivered','read'))"+extra+" ORDER BY b.created_at,b.id LIMIT 20",[since.replace('T',' ').replace('Z',''),since.replace('T',' ').replace('Z',''),...excludeSubjects]);
   for(const row of rows){const eligibility=await loadAttendanceEligibility(pool,{eventDate:row.event_date,mobile:row.mobile,now:now(),finalCutoff:config.attendanceFinalCutoff});if(eligibility.eligible)return row;}
   return null;
  },
  async list(page=1){page=Number(page);if(!Number.isInteger(page)||page<1||page>100000)throw Error('Invalid page');const [r]=await pool.query('SELECT id,purpose,round_name,state,attempts,provider_id,error_code,created_at FROM ayambil_notification_outbox ORDER BY created_at DESC,id LIMIT 21 OFFSET ?',[20*(page-1)]);return {items:r.slice(0,20),hasMore:r.length>20,page};},
  async pendingAudit(){
   // Read-only source validation. Never refresh provider evidence, prepare,
   // claim, reconcile receipts, or modify a queued record from this audit.
   const [rows]=await pool.query("SELECT id,purpose,subject,round_name,state,attempts,provider_id,claim_id,error_code,envelope,revision_hash,created_at FROM ayambil_notification_outbox WHERE state IN ('held','ready','processing','uncertain') ORDER BY created_at,id LIMIT 1001");
   if(rows.length>1000)throw Error('Pending audit exceeds bounded scope');
   const items=[];
   const reasons={'Active booking required':'booking_inactive_or_no_consent','Active passes required':'no_active_passes','Notification source unavailable':'source_unavailable','Waiting transition no longer eligible':'waiting_transition_changed','Waiting WhatsApp consent required':'consent_missing','Legacy confirmation already attempted':'prior_legacy_confirmation','Confirmed notification held for duplicate/name review':'duplicate_or_name_hold','Legacy pass link already attempted':'prior_legacy_pass','Combined pass CTA already submitted or uncertain':'combined_pass_cta_already_attempted','Legacy reminder already attempted':'prior_legacy_reminder','Reminder or entry notice already attempted':'prior_reminder_or_entry_attempt','Reminder outside previous-day 18:00 IST window':'scheduled_window_not_due','Review snapshot stale':'review_snapshot_stale','Attendance contact snapshot stale':'attendance_contact_snapshot_stale','Contact already answered':'contact_already_answered','Existing intent revision conflict':'source_revision_changed'};
   for(const row of rows){
    let reason=row.state==='uncertain'?'acceptance_uncertain':row.state==='processing'?'in_flight':row.attempts||row.provider_id||row.claim_id?'prior_attempt_or_claim':null;
    if(!reason)try{
     const input=crypto.open(row.envelope);
     reason=await tx(async db=>{
      if(['attendance','booking_verify'].includes(row.purpose)){
       const review=await one(db,'SELECT response,decision,token_hash,expires_at FROM ayambil_family_reviews WHERE id=?',[row.subject]);
       if(!review)return 'review_unavailable';if(review.response)return 'review_already_answered';if(review.decision)return 'review_decided';
       if(!review.token_hash||review.token_hash!==createHash('sha256').update(input.token||'').digest('hex'))return 'review_link_revoked';
       if(Date.parse(review.expires_at+'Z')<=Date.now())return 'review_link_expired';
      }
      const current=await envelope(db,input,{ownOutboxId:row.id});
      if(current.hash!==row.revision_hash)return 'source_revision_changed';
      return 'source_eligible_requires_provider_preflight';
     });
    }catch(e){reason=reasons[e.message]||(/approved Utility|language code|parameter mapping|private URL/.test(e.message)?'template_or_mapping_preflight_required':'source_review_required');}
    items.push({id:row.id,purpose:row.purpose,subject:row.subject,round:row.round_name,state:row.state,attempts:Number(row.attempts),providerReferencePresent:Boolean(row.provider_id),claimPresent:Boolean(row.claim_id),errorCode:row.error_code,createdAt:row.created_at,reason});
   }
   const byReason={},byPurpose={},byState={};for(const i of items){byReason[i.reason]=(byReason[i.reason]||0)+1;byPurpose[i.purpose]=(byPurpose[i.purpose]||0)+1;byState[i.state]=(byState[i.state]||0)+1;}
   return {items,total:items.length,byReason,byPurpose,byState,noSend:true,providerCalls:0,sourceChecksOnly:true};
  },
  async intents(page=1){page=Number(page);if(!Number.isInteger(page)||page<1||page>100000)throw Error('Invalid page');const [r]=await pool.query("SELECT i.id,i.subject,i.purpose,i.review_round,i.state,i.created_at FROM ayambil_notification_intents i ORDER BY i.created_at DESC,i.id LIMIT 20 OFFSET ?",[20*(page-1)]);return r;}

 };
}
