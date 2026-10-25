import {requireQueueOwnership} from './queue-ownership-reconciliation.mjs';
// Local rehearsal only. No provider/network dependency, env reads or startup wiring.
import {randomUUID,createHash} from 'node:crypto';
import {assertLocalControls} from './booking-controls.mjs';
import {bookingPassToken} from './booking-pass-link.mjs';
import {createLocalFlowContract} from './local-flow-contract.mjs';
import {createMessageQueue} from './message-queue.mjs';
import {normalizePhone} from './vardhmanflow.mjs';
import {queueCrypto} from './message-queue.mjs';
import {createBilingualMockAdapter,bilingualCatalog} from './bilingual-template-adapter.mjs';
const purposeNeedsPass=p=>['booking_confirmed','waiting_approved'].includes(p);
const digest=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const mocks=new WeakSet();
export function createInMemoryNotificationProvider(){
 const calls=[],outcomes=[];const provider={calls,outcomes,async submit(payload){calls.push(payload);const result=outcomes.shift()||{status:'accepted',providerId:randomUUID()};if(result instanceof Error)throw result;return result;}};
 mocks.add(provider);return provider;
}
export function createQueueBackedLocalProvider(pool,key){
 const contract=createLocalFlowContract();
 const queue=createMessageQueue(pool,contract.flow,{AYAMBIL_WHATSAPP_NORMAL_PROCESSING_APPROVED:'true',AYAMBIL_WHATSAPP_QUEUE_OWNER:'express-mysql',AYAMBIL_WHATSAPP_AUTOMATION_START_AT:'2026-01-01T00:00:00.000Z',AYAMBIL_LOCAL_PROVIDER_REHEARSAL:'true',AYAMBIL_WHATSAPP_ENABLED:'true',AYAMBIL_QUEUE_ENCRYPTION_KEY:key});
 const provider={calls:contract.requests,responses:contract.responses,queue,async submit(p){
  const payload={to:normalizePhone(p.to),templateName:p.name,language:p.language.code,components:p.components};
  try{const r=await queue.submitLocalBilingualPrepared(payload);return {providerId:r.id,status:r.status==='failed'?'rejected':r.status==='sent'?'accepted':r.status};}
  catch(e){if(e.providerRejected)return {status:e.providerRejected===429?'rate_limited':'rejected'};throw e;}
 }};mocks.add(provider);return provider;
}
export const localSenderSchema=`CREATE TABLE ayambil_local_notification_outbox (
 id CHAR(36) PRIMARY KEY,dedupe_hash CHAR(64) NOT NULL UNIQUE,revision_hash CHAR(64) NOT NULL,
 purpose VARCHAR(40) NOT NULL,subject CHAR(36) NOT NULL,round_name VARCHAR(64) NOT NULL,
 envelope MEDIUMTEXT NOT NULL,state VARCHAR(20) NOT NULL DEFAULT 'held',attempts INT NOT NULL DEFAULT 0,
 claim_id CHAR(36) NULL,provider_id VARCHAR(200) NULL,error_code VARCHAR(40) NULL,
 created_at DATETIME(3) NOT NULL,updated_at DATETIME(3) NOT NULL
) ENGINE=InnoDB`;
export function createLocalNotificationSender({pool,config,key,provider,catalog=bilingualCatalog}){
 assertLocalControls(config);
 const actual=pool?.pool?.config?.connectionConfig;
 if(actual?.host!=='127.0.0.1'||actual.database!==config.database.database||!mocks.has(provider))throw Error('Owned disposable pool and in-memory provider required');
 const crypto=queueCrypto(key),build=createBilingualMockAdapter(catalog);
 const one=async(db,sql,args=[])=> (await db.execute(sql,args))[0][0];
 const tx=async fn=>{const db=await pool.getConnection();try{await db.beginTransaction();const r=await fn(db);await db.commit();return r;}catch(e){await db.rollback();throw e;}finally{db.release();}};
 async function source(db,purpose,subject,token){
  if(!/^[a-f0-9-]{36}$/.test(subject))throw Error('Invalid subject');
  let b,w,review;
  if(purpose==='waiting_received'||purpose==='waiting_approved'){
   w=await one(db,'SELECT * FROM ayambil_waiting WHERE id=? OR booking_id=? FOR UPDATE',[subject,subject]);
   if(!w||(purpose==='waiting_received'?w.status!=='waiting':w.status!=='approved'))throw Error('Waiting transition no longer eligible');
   if(purpose==='waiting_received'){const p=typeof w.payload==='string'?JSON.parse(w.payload):w.payload;return {canonicalSubject:w.id,mobile:p.mobile,eventDate:w.event_date,contactName:p.contactName,waitingReference:w.number,attendeeCount:p.attendees.length,identity:[w.number,w.status,p]};}
  }
  if(['booking_verify','attendance'].includes(purpose)){
   review=await one(db,'SELECT * FROM ayambil_family_reviews WHERE id=? FOR UPDATE',[subject]);
   if(!review||review.decision||review.purpose!==(purpose==='booking_verify'?'duplicate':'attendance')||review.response||!review.token_hash||review.token_hash!==createHash('sha256').update(token||'').digest('hex')||Date.parse(review.expires_at+'Z')<=Date.now())throw Error('Review link expired, revoked or answered');
   if(purpose==='attendance'){const answered=await one(db,"SELECT id FROM ayambil_family_reviews WHERE purpose='attendance' AND event_date=? AND contact_key=? AND response IS NOT NULL LIMIT 1",[review.event_date,review.contact_key]);if(answered)throw Error('Contact already answered');}
   const snapshots=typeof review.snapshot==='string'?JSON.parse(review.snapshot):review.snapshot;
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
  if(!b||b.status!=='active')throw Error('Active booking required');
  const [rows]=await db.execute("SELECT a.full_name,p.number,p.snapshot FROM ayambil_attendees a JOIN ayambil_passes p ON p.attendee_id=a.id JOIN ayambil_capabilities c ON c.pass_id=p.id AND c.revoked_at IS NULL AND c.expires_at>UTC_TIMESTAMP(3) WHERE a.booking_id=? AND a.status='active' AND p.status='active' AND p.trashed_at IS NULL ORDER BY a.ordinal,p.number",[id]);
  if(!rows.length)throw Error('Active passes required');
  // A prior provider submission or uncertain attempt makes a new initial confirmation unsafe.
  const prior=await one(db,"SELECT id FROM ayambil_message_queue WHERE booking_id=? AND notification_type='confirmation' AND (attempts>0 OR provider_id IS NOT NULL OR status IN ('preparing','sending','uncertain','accepted','sent','delivered','read')) LIMIT 1",[id]);
  return {mobile:b.mobile,eventDate:b.event_date,contactName:b.contact_name,bookingReference:b.number,attendeeCount:rows.length,approvedAttendeeCount:rows.length,names:rows.map(x=>x.full_name),legacyConfirmation:!!prior,identity:[b.id,b.status,rows]};
 }
 async function envelope(db,input){
  const s=await source(db,input.purpose,input.subject,input.token);
  if(purposeNeedsPass(input.purpose)&&s.legacyConfirmation)throw Error('Legacy confirmation already attempted');
  const event=await one(db,'SELECT snapshot FROM ayambil_events WHERE event_date=?',[s.eventDate]);
  const session=typeof event?.snapshot==='string'?JSON.parse(event.snapshot):event?.snapshot;if(!session)throw Error('Event unavailable');
  const passSubject=purposeNeedsPass(input.purpose)?(input.purpose==='waiting_approved'?(await one(db,'SELECT booking_id FROM ayambil_waiting WHERE id=? OR booking_id=?',[input.subject,input.subject]))?.booking_id:input.subject):null;
  const data={...s,eventLabel:session.performer,eventDate:session.label,urlSuffix:s.urlSuffix||(passSubject?'passes#'+bookingPassToken(key,passSubject,session):undefined)};
  const payload=build(input.purpose,data);return {s,payload:{...payload,to:s.mobile},hash:digest([s.identity,s.mobile,payload])};
 }
 return {
  async enqueueHeldIntent(id,{token}={}){
   const row=await one(pool,"SELECT * FROM ayambil_notification_intents WHERE id=? AND state='held'",[id]);
   if(!row)throw Error('Held intent required');
   // Re-read authoritative source instead of trusting stored recipient/attendee context.
   return this.enqueue({purpose:row.purpose,subject:row.subject,round:row.review_round,token});
  },
  async enqueue(input){
   if(!catalog.some(t=>t.purpose===input.purpose)||!['booking_confirmed','waiting_received','waiting_approved','booking_verify','attendance','entry_timing'].includes(input.purpose))throw Error('Unknown purpose');
   const round=input.round||'initial';if(!/^[a-zA-Z0-9_-]{1,64}$/.test(round))throw Error('Invalid round');
   if(['booking_confirmed','waiting_received','waiting_approved'].includes(input.purpose)&&round!=='initial')throw Error('Initial transactional message cannot be repeated');
   return tx(async db=>{const e=await envelope(db,input);if(e.s.sourceRound&&e.s.sourceRound!==round)throw Error('Review round mismatch');
    const unit=['booking_verify','attendance'].includes(input.purpose)?[e.s.eventDate,e.s.contactUnit]:e.s.canonicalSubject||input.subject;
    const dedupe=digest([purposeNeedsPass(input.purpose)?'admission_confirmation':input.purpose,unit,round]);
    const previous=await one(db,'SELECT id,revision_hash FROM ayambil_local_notification_outbox WHERE dedupe_hash=? FOR UPDATE',[dedupe]);
    if(previous){if(previous.revision_hash!==e.hash)throw Error('Existing intent revision conflict');return previous.id;}
    const id=randomUUID();await db.execute('INSERT INTO ayambil_local_notification_outbox(id,dedupe_hash,revision_hash,purpose,subject,round_name,envelope,created_at,updated_at) VALUES(?,?,?,?,?,?,?,UTC_TIMESTAMP(3),UTC_TIMESTAMP(3))',[id,dedupe,e.hash,input.purpose,e.s.canonicalSubject||input.subject,round,crypto.seal(input)]);return id;
   });
  },
  async runOne(id,{crashAfterClaim=false,crashAfterProvider=false,ownershipVersion}={}){
   let claimed;
   await tx(async db=>{if(ownershipVersion!==undefined)await requireQueueOwnership(db,'bilingual',ownershipVersion);const row=await one(db,'SELECT * FROM ayambil_local_notification_outbox WHERE id=? FOR UPDATE',[id]);if(!row||!['held','ready'].includes(row.state))return;
    let e;try{e=await envelope(db,crypto.open(row.envelope));if(e.hash!==row.revision_hash)throw Error('Stale revision');}catch{await db.execute("UPDATE ayambil_local_notification_outbox SET state='blocked',error_code='eligibility_or_mapping',updated_at=UTC_TIMESTAMP(3) WHERE id=?",[id]);return;}
    const claim=randomUUID();await db.execute("UPDATE ayambil_local_notification_outbox SET state='processing',claim_id=?,attempts=attempts+1,updated_at=UTC_TIMESTAMP(3) WHERE id=?",[claim,id]);claimed={claim,payload:e.payload};
   });
   if(!claimed)return {status:'not_claimed'};
   if(crashAfterClaim)throw Error('Simulated crash');
   let result;try{result=await provider.submit(claimed.payload);}catch{result={status:'uncertain'};}
   if(crashAfterProvider)throw Error('Simulated crash');
   const validId=typeof result?.providerId==='string'&&/^[a-zA-Z0-9_-]{1,200}$/.test(result.providerId);
   const status=validId&&['accepted','delivered'].includes(result.status)?result.status:result?.status==='rejected'?'failed':result?.status==='rate_limited'?'failed':'uncertain';
   await pool.execute('UPDATE ayambil_local_notification_outbox SET state=?,provider_id=?,error_code=?,updated_at=UTC_TIMESTAMP(3) WHERE id=? AND claim_id=? AND state=\'processing\'',[status,validId?result.providerId:null,result?.status==='rate_limited'?'rate_limited':null,id,claimed.claim]);
   return {status,realProviderCalls:0};
  },
  async recover(){await pool.execute("UPDATE ayambil_local_notification_outbox SET state='uncertain',error_code='interrupted_claim',updated_at=UTC_TIMESTAMP(3) WHERE state='processing' AND updated_at<DATE_SUB(UTC_TIMESTAMP(3),INTERVAL 5 MINUTE)");},
  async list(){const [r]=await pool.execute('SELECT id,purpose,round_name,state,attempts,provider_id,error_code FROM ayambil_local_notification_outbox ORDER BY created_at');return r;}
 };
}
