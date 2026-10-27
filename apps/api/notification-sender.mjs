// Production-capable durable sender. No import-time network, migration or worker.
import {randomUUID,randomBytes,createHash} from 'node:crypto';
import {bookingPassToken} from './booking-pass-link.mjs';
import {queueCrypto} from './message-queue.mjs';
import {createBilingualMockAdapter,bilingualCatalog} from './bilingual-template-adapter.mjs';
import {nextDeliveryStatus} from './delivery-status-policy.mjs';
import {loadAttendanceEligibility,lockAttendanceEvent,assertAttendanceEligible} from './attendance-eligibility.mjs';
import {combinedPassPayload} from './combined-pass-notification.mjs';
const purposeNeedsPass=p=>['booking_confirmed','waiting_approved','pass_link'].includes(p);
const digest=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
export function createProductionNotificationSender({pool,config,key,provider,catalog=bilingualCatalog}){
 const actual=pool?.pool?.config?.connectionConfig;
 if(config.notificationService!==true||!config.bookingControls||!actual||actual.host!==config.database.host||actual.database!==config.database.database||(config.database.port&&actual.port!==config.database.port)||!['127.0.0.1','localhost'].includes(actual.host)||!/^https:\/\//.test(config.origin)&&!config.disposable)throw Error('Explicit notification service and matching pool/origin required');
 if(!config.disposable&&(config.origin!=='https://vardhmancreativestudio.com'||config.bookingControlsProduction!==true||actual.database.startsWith('ayambil_test_')))throw Error('Explicit canonical production mode required');
 const crypto=queueCrypto(key),build=createBilingualMockAdapter(catalog);
 const one=async(db,sql,args=[])=> (await db.execute(sql,args))[0][0];
 const tx=async fn=>{const db=await pool.getConnection();try{await db.query('SET TRANSACTION ISOLATION LEVEL READ COMMITTED');await db.beginTransaction();const r=await fn(db);await db.commit();return r;}catch(e){await db.rollback();throw e;}finally{db.release();}};
 async function lockSourceEvent(db,purpose,subject){
  let meta;if(['booking_verify','attendance'].includes(purpose))meta=await one(db,'SELECT event_date FROM ayambil_family_reviews WHERE id=?',[subject]);
  else if(['waiting_received','waiting_approved'].includes(purpose))meta=await one(db,'SELECT event_date FROM ayambil_waiting WHERE id=? OR booking_id=?',[subject,subject]);
  else meta=await one(db,'SELECT event_date FROM ayambil_bookings WHERE id=?',[subject]);
  if(!meta)throw Error('Notification source unavailable');await lockAttendanceEvent(db,meta.event_date);
 }
 async function source(db,purpose,subject,token){
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
   const snapshots=typeof review.snapshot==='string'?JSON.parse(review.snapshot):review.snapshot;
   if(purpose==='attendance'){const eligibility=await loadAttendanceEligibility(db,{eventDate:review.event_date,mobile:review.contact_key||snapshots[0]?.mobile});assertAttendanceEligible(eligibility);if(JSON.stringify(eligibility.bookingIds)!==JSON.stringify(snapshots.map(b=>b.id).sort()))throw Error('Attendance contact snapshot stale');}
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
  return {mobile:b.mobile,eventDate:b.event_date,contactName:b.contact_name,bookingReference:b.number,attendeeCount:rows.length,approvedAttendeeCount:rows.length,names:rows.map(x=>x.full_name),legacyConfirmation:!!prior,legacyPass:!!passPrior,identity:[b.id,b.status,rows]};
 }
 async function envelope(db,input){
  const s=await source(db,input.purpose,input.subject,input.token);
  if(['booking_confirmed','waiting_approved'].includes(input.purpose)&&s.legacyConfirmation)throw Error('Legacy confirmation already attempted');
  if(purposeNeedsPass(input.purpose)){const eligibility=await loadAttendanceEligibility(db,{eventDate:s.eventDate,mobile:s.mobile});if(eligibility.reasons.some(r=>['unresolved_duplicate_review','repeated_name_hold'].includes(r)))throw Error('Confirmed notification held for duplicate/name review');}
  if(input.purpose==='pass_link'){
   if(s.legacyPass)throw Error('Legacy pass link already attempted');
   const modern=await one(db,"SELECT id FROM ayambil_notification_outbox WHERE subject=? AND purpose IN ('booking_confirmed','waiting_approved') AND (attempts>0 OR provider_id IS NOT NULL OR state IN ('processing','uncertain','accepted','sent','delivered','read')) LIMIT 1",[s.canonicalSubject||input.subject]);if(modern)throw Error('Combined pass CTA already submitted or uncertain');
  }
  const event=await one(db,'SELECT snapshot FROM ayambil_events WHERE event_date=?',[s.eventDate]);
  const session=typeof event?.snapshot==='string'?JSON.parse(event.snapshot):event?.snapshot;if(!session)throw Error('Event unavailable');
  const passSubject=purposeNeedsPass(input.purpose)?(input.purpose==='waiting_approved'?(await one(db,'SELECT booking_id FROM ayambil_waiting WHERE id=? OR booking_id=?',[input.subject,input.subject]))?.booking_id:input.subject):null;
  const data={...s,eventLabel:session.performer,eventDate:session.label,urlSuffix:s.urlSuffix||(passSubject?'passes#'+bookingPassToken(key,passSubject,session):undefined)};
  const payload=input.purpose==='pass_link'?combinedPassPayload({session,source:s,subject:passSubject,key,origin:config.origin}):build(input.purpose,data);return {s,payload:{...payload,to:s.mobile},hash:digest([s.identity,s.mobile,payload])};
 }
 const lockName='ayambil-dispatch-'+digest(actual.database).slice(0,32);
 async function withLease(fn){const db=await pool.getConnection();try{const [[r]]=await db.query('SELECT GET_LOCK(?,0) acquired',[lockName]);if(r.acquired!==1){const error=Error('Dispatch busy; no retry was performed');error.code='DISPATCH_BUSY';throw error;}try{return await fn();}finally{await db.query('SELECT RELEASE_LOCK(?)',[lockName]);}}finally{db.release();}}
 async function gate(db,version,ownClaim=null){const c=await one(db,'SELECT * FROM ayambil_notification_owner WHERE id=1 FOR UPDATE');if(!c||c.owner!=='bilingual'||c.version!==version)throw Error('Paused or stale queue ownership');const inFlight=await one(db,"SELECT id FROM ayambil_message_queue WHERE status IN ('preparing','sending','uncertain') LIMIT 1");if(inFlight)throw Error('Legacy queue requires reconciliation');const modern=await one(db,"SELECT id FROM ayambil_notification_outbox WHERE state IN ('processing','uncertain')"+(ownClaim?' AND id<>?':'')+' LIMIT 1',ownClaim?[ownClaim]:[]);if(modern)throw Error('Notification queue requires reconciliation');}
 async function persist(db,input,round){
  const e=await envelope(db,input);if(e.s.sourceRound&&e.s.sourceRound!==round)throw Error('Review round mismatch');
  const unit=['booking_verify','attendance'].includes(input.purpose)?[e.s.eventDate,e.s.contactUnit]:e.s.canonicalSubject||input.subject;
  const dedupe=digest([['booking_confirmed','waiting_approved'].includes(input.purpose)?'admission_confirmation':input.purpose,unit,round]);
  const previous=await one(db,'SELECT id,revision_hash FROM ayambil_notification_outbox WHERE dedupe_hash=? FOR UPDATE',[dedupe]);
  if(previous){if(previous.revision_hash!==e.hash)throw Error('Existing intent revision conflict');return previous.id;}
  const id=randomUUID();await db.execute('INSERT INTO ayambil_notification_outbox(id,dedupe_hash,revision_hash,purpose,subject,round_name,envelope,created_at,updated_at) VALUES(?,?,?,?,?,?,?,UTC_TIMESTAMP(3),UTC_TIMESTAMP(3))',[id,dedupe,e.hash,input.purpose,e.s.canonicalSubject||input.subject,round,crypto.seal(input)]);await db.execute('INSERT INTO ayambil_notification_audit VALUES(?,?,?,?,UTC_TIMESTAMP(3))',[randomUUID(),'system','prepared',JSON.stringify({id,purpose:input.purpose})]);return id;
 }
 return {
  async ready(){const state=await this.owner();if(!state||!['paused','bilingual'].includes(state.owner)||!Number.isSafeInteger(state.version))throw Error('Notification owner schema unavailable');await pool.query('SELECT provider_id,state FROM ayambil_notification_outbox LIMIT 0');await pool.query('SELECT actor,action,detail FROM ayambil_notification_audit LIMIT 0');await this.recover();return true;},
  async owner(){return one(pool,'SELECT owner,version FROM ayambil_notification_owner WHERE id=1');},
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
   return this.enqueue({purpose:row.purpose,subject:row.subject,round:row.review_round,token});
  },
  async prepareSubject({purpose,subject},actor,controls){
   if(!actor?.admin_id||!['booking_confirmed','waiting_received','pass_link','attendance'].includes(purpose)||!/^[a-f0-9-]{36}$/.test(subject||''))throw Error('Reviewed notification subject required');
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
  async enqueue(input){
   await provider.validate(input.purpose);
   if(input.purpose!=='pass_link'&&!catalog.some(t=>t.purpose===input.purpose)||!['booking_confirmed','waiting_received','waiting_approved','booking_verify','attendance','entry_timing','pass_link'].includes(input.purpose))throw Error('Unknown purpose');
   const round=input.round||'initial';if(!/^[a-zA-Z0-9_-]{1,64}$/.test(round))throw Error('Invalid round');
   if(['booking_confirmed','waiting_received','waiting_approved','pass_link'].includes(input.purpose)&&round!=='initial')throw Error('Initial transactional message cannot be repeated');
   return tx(db=>persist(db,input,round));
  },
  async runOne(id,{ownershipVersion,actor='worker',automaticSince=null}={}){
   if(config.notificationDispatch!==true)throw Error('Notification dispatch disabled');
   return withLease(async()=>{
   const candidate=await one(pool,'SELECT purpose,subject FROM ayambil_notification_outbox WHERE id=?',[id]);if(!candidate)return {status:'not_claimed'};
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
    let e;try{e=await envelope(db,crypto.open(row.envelope));if(e.hash!==row.revision_hash)throw Error('Stale revision');}catch{await db.execute("UPDATE ayambil_notification_outbox SET state='blocked',error_code='eligibility_or_mapping',updated_at=UTC_TIMESTAMP(3) WHERE id=?",[id]);return;}
    const claim=randomUUID();await db.execute("UPDATE ayambil_notification_outbox SET state='processing',claim_id=?,attempts=attempts+1,updated_at=UTC_TIMESTAMP(3) WHERE id=?",[claim,id]);await db.execute('INSERT INTO ayambil_notification_audit VALUES(?,?,?,?,UTC_TIMESTAMP(3))',[randomUUID(),actor,'claim_committed',JSON.stringify({id})]);claimed={claim,payload:e.payload};
   });
   if(!claimed)return {status:'not_claimed'};
   // Re-read after durable claiming, immediately before the provider boundary.
   {
    try{await tx(async db=>{await lockEvent(db);const row=await one(db,'SELECT * FROM ayambil_notification_outbox WHERE id=? FOR UPDATE',[id]);if(!row||row.state!=='processing'||row.claim_id!==claimed.claim)throw Error('Stale claim');await gate(db,ownershipVersion,id);const current=await envelope(db,crypto.open(row.envelope));if(current.hash!==row.revision_hash)throw Error('Stale revision');claimed.payload=current.payload;});}
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
  async pending(since){
   if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(since||''))throw Error('Explicit activation cutoff required');
   const [r]=await pool.execute("SELECT i.id,o.id outbox_id FROM ayambil_notification_intents i LEFT JOIN ayambil_notification_outbox o ON o.subject=i.subject AND (o.purpose=i.purpose OR o.purpose IN ('booking_confirmed','waiting_approved') AND i.purpose IN ('booking_confirmed','waiting_approved')) WHERE i.state='held' AND i.review_round='initial' AND i.purpose IN ('booking_confirmed','waiting_received','waiting_approved') AND i.created_at>? AND (o.id IS NULL OR o.purpose=i.purpose AND o.state IN ('held','ready') AND o.attempts=0 AND o.provider_id IS NULL) ORDER BY i.created_at,i.id LIMIT 1",[since.replace('T',' ').replace('Z','')]);return r;
  },
  async list(page=1){page=Number(page);if(!Number.isInteger(page)||page<1||page>100000)throw Error('Invalid page');const [r]=await pool.query('SELECT id,purpose,round_name,state,attempts,provider_id,error_code,created_at FROM ayambil_notification_outbox ORDER BY created_at DESC,id LIMIT 21 OFFSET ?',[20*(page-1)]);return {items:r.slice(0,20),hasMore:r.length>20,page};},
  async intents(page=1){page=Number(page);if(!Number.isInteger(page)||page<1||page>100000)throw Error('Invalid page');const [r]=await pool.query("SELECT i.id,i.subject,i.purpose,i.review_round,i.state,i.created_at FROM ayambil_notification_intents i ORDER BY i.created_at DESC,i.id LIMIT 20 OFFSET ?",[20*(page-1)]);return r;}

 };
}
