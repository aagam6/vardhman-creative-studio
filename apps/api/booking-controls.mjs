import {assertControlsConfiguration,assertControlsReady} from './booking-controls-policy.mjs';
import {normalizeMobile,potentialDuplicates} from './booking-review-analysis.mjs';
import {normalizeName} from './booking-review-analysis.mjs';
import {createControlsDashboard} from './booking-controls-dashboard.mjs';
import {attendanceEligibility} from './attendance-eligibility.mjs';
import {randomUUID,randomBytes,createHash} from 'node:crypto';
import {ApiError,bookingInput} from './config.mjs';
const hash=s=>createHash('sha256').update(s).digest('hex');
const parse=x=>typeof x==='string'?JSON.parse(x):x;
export const waitingNotice='તમારું રજિસ્ટ્રેશન વેઇટિંગમાં છે. મંજૂરી મળ્યા બાદ WhatsApp દ્વારા જાણ કરવામાં આવશે.';
export {normalizeName,normalizeMobile,potentialDuplicates} from './booking-review-analysis.mjs';
export function assertLocalControls(config){
 if(config.disposable!==true||config.database?.host!=='127.0.0.1'||!/^ayambil_test_[a-z0-9_]+$/.test(config.database?.database||'')||!/^http:\/\/127\.0\.0\.1:\d+$/.test(config.origin)||config.whatsappEnabled===true)throw Error('Booking controls require explicit disposable loopback MySQL and disabled WhatsApp');
}
export function attachBookingControls(base,pool,config){
 assertControlsConfiguration(config,pool);
 const production=config.disposable!==true;
 const query=async(db,sql,args=[])=> (await db.execute(sql,args))[0];
 const one=async(db,sql,args=[])=> (await query(db,sql,args))[0];
 const tx=async fn=>{const db=await pool.getConnection();try{await db.query('SET TRANSACTION ISOLATION LEVEL READ COMMITTED');await db.beginTransaction();const result=await fn(db);await db.commit();return result;}catch(e){await db.rollback();throw e;}finally{db.release();}};
 const audit=(db,actor,subject,action,detail={})=>query(db,'INSERT INTO ayambil_control_audit VALUES(?,?,?,?,?,UTC_TIMESTAMP(3))',[randomUUID(),actor?.admin_id||'family',subject,action,JSON.stringify(detail)]);
 const intentContext=body=>({contactName:body.contactName,mobile:body.mobile,eventDate:body.eventDate,attendees:body.attendees,attendeeCount:body.attendees.length});
 const intent=async(db,subject,purpose,context={},bookingId=null,round='initial')=>{if(!production)return;await query(db,'INSERT IGNORE INTO ayambil_notification_intents(id,dedupe_hash,booking_id,subject,purpose,review_round,context,created_at) VALUES(?,?,?,?,?,?,?,UTC_TIMESTAMP(3))',[randomUUID(),hash(purpose+':'+subject+':'+round),bookingId,subject,purpose,round,JSON.stringify({...context,sendingDisabled:true})]);};
 const preview=(db,subject,kind,body)=>query(db,'INSERT IGNORE INTO ayambil_notification_previews VALUES(?,?,?,?,UTC_TIMESTAMP(3))',[hash(kind+':'+subject),subject,kind,JSON.stringify({mock:true,sendingDisabled:true,...body})]);
 const count=async(db,date)=>Number((await one(db,"SELECT COUNT(*) n FROM ayambil_passes p JOIN ayambil_attendees a ON a.id=p.attendee_id JOIN ayambil_bookings b ON b.id=a.booking_id WHERE b.event_date=? AND b.status='active' AND a.status='active' AND p.status='active' AND p.trashed_at IS NULL",[date])).n);
 const control=async(db,date)=>{if(!await assertControlsReady(db,config))throw new ApiError(503,'Booking controls are not activated or ready');const c=await one(db,'SELECT * FROM ayambil_booking_controls WHERE event_date=? FOR UPDATE',[date]);if(!c)throw new ApiError(503,'Event controls unavailable');return c;};
 const waitingReceipt=row=>{const b=parse(row.payload);return {number:row.number,status:'waiting',eventDate:row.event_date,notice:waitingNotice,attendees:b.attendees.map(a=>({...a,status:'waiting',passes:[]}))};};
 const register=base.register.bind(base);
 base.register=async input=>{const body=bookingInput(input),payloadHash=hash(JSON.stringify(body));return tx(async db=>{
  const c=await control(db,body.eventDate);
  const previous=await one(db,'SELECT * FROM ayambil_waiting WHERE request_hash=? FOR UPDATE',[hash(body.requestKey)]);
  if(previous){if(previous.payload_hash!==payloadHash)throw new ApiError(409,'Submission identifier conflict');return previous.status==='waiting'?waitingReceipt(previous):register(body,db);}
  const saved=await one(db,'SELECT booking_id FROM ayambil_idempotency WHERE key_hash=?',[hash(body.requestKey)]);if(saved?.booking_id)return register(body,db);
  const setting=await one(db,'SELECT registration_open'+(config.maintenanceSchemaEnabled?',maintenance_active':'')+' FROM ayambil_settings WHERE id=1');if(!config.registrationOpen||!setting?.registration_open||setting.maintenance_active||c.mode==='closed')throw new ApiError(403,'આ સાંજનું રજિસ્ટ્રેશન હાલમાં બંધ છે.');
  if(c.mode==='waiting'||await count(db,body.eventDate)+body.attendees.length>c.capacity){
   const row={id:randomUUID(),number:'WAIT26-'+randomUUID().replaceAll('-','').toUpperCase(),payload:body,event_date:body.eventDate};
   await query(db,'INSERT INTO ayambil_waiting(id,number,request_hash,payload_hash,event_date,payload,created_at) VALUES(?,?,?,?,?,?,UTC_TIMESTAMP(3))',[row.id,row.number,hash(body.requestKey),payloadHash,body.eventDate,JSON.stringify(body)]);
   await intent(db,row.id,'waiting_received',{waitingReference:row.number,...intentContext(body)});await preview(db,row.id,'waiting_ack',{text:waitingNotice,templateApprovalRequired:true});await audit(db,null,row.id,'waiting_created');return waitingReceipt(row);
  }const receipt=await register(body,db);if(production){const saved=await one(db,'SELECT booking_id FROM ayambil_idempotency WHERE key_hash=?',[hash(body.requestKey)]);await intent(db,saved.booking_id,'booking_confirmed',{bookingReference:receipt.number,...intentContext(body)},saved.booking_id);}return receipt;
 });};
 async function snapshots(db=pool){
  const rows=await query(db,"SELECT b.id,b.number,b.mobile,b.contact_name,b.event_date,a.full_name FROM ayambil_bookings b JOIN ayambil_attendees a ON a.booking_id=b.id WHERE b.status='active' AND a.status='active' AND EXISTS (SELECT 1 FROM ayambil_passes p WHERE p.attendee_id=a.id AND p.status='active' AND p.trashed_at IS NULL) ORDER BY b.id,a.ordinal");
  const map=new Map();for(const r of rows){if(!map.has(r.id))map.set(r.id,{id:r.id,number:r.number,mobile:r.mobile,contactName:r.contact_name,eventDate:r.event_date,names:[]});map.get(r.id).names.push(r.full_name);}return [...map.values()];
 }
 const controls={localOnly:!production,
  async availability(){if(!await assertControlsReady(pool,config))throw new ApiError(503,'Booking controls are not activated or ready');const rows=await query(pool,'SELECT * FROM ayambil_booking_controls');return Promise.all(rows.map(async c=>({...c,activePersons:await count(pool,c.event_date),approvalBlockedReason:c.approval_capacity_configured?null:'Approval capacity not configured'})));},
  async update(actor,input){if(!['open','waiting','closed'].includes(input.mode)||!Number.isSafeInteger(input.capacity)||input.capacity<0||input.capacity>1000000||!Number.isInteger(input.version))throw new ApiError(400,'Invalid booking controls');return tx(async db=>{const c=await control(db,input.eventDate);if(c.version!==input.version)throw new ApiError(409,'Controls changed; refresh first');await query(db,'UPDATE ayambil_booking_controls SET mode=?,capacity=?,approval_capacity_configured=TRUE,version=version+1 WHERE event_date=?',[input.mode,input.capacity,input.eventDate]);await audit(db,actor,input.eventDate,'controls_updated',{before:c,after:input});return {ok:true};});},
  async waiting(){const rows=await query(pool,'SELECT * FROM ayambil_waiting ORDER BY created_at,id');return rows.map(r=>({id:r.id,...waitingReceipt(r),status:r.status,created:r.created_at,contactName:parse(r.payload).contactName,mobile:parse(r.payload).mobile,groupSize:parse(r.payload).attendees.length,bookingId:r.booking_id}));},
  async approve(actor,id){return tx(async db=>{
   const found=await one(db,'SELECT event_date FROM ayambil_waiting WHERE id=?',[id]);if(!found)throw new ApiError(404,'Waiting booking unavailable');
   const c=await control(db,found.event_date),row=await one(db,'SELECT * FROM ayambil_waiting WHERE id=? FOR UPDATE',[id]),body=parse(row.payload);
   if(row.status==='approved')return register(body,db);
   if(!c.approval_capacity_configured)throw new ApiError(409,'Approval capacity not configured');
   if(await count(db,row.event_date)+body.attendees.length>c.capacity)throw new ApiError(409,'Insufficient capacity for the entire group');
   const receipt=await register(body,db);const saved=await one(db,'SELECT booking_id FROM ayambil_idempotency WHERE key_hash=?',[hash(body.requestKey)]);
   await query(db,"UPDATE ayambil_waiting SET status='approved',booking_id=?,approved_at=UTC_TIMESTAMP(3) WHERE id=?",[saved.booking_id,id]);
   await intent(db,saved.booking_id,'waiting_approved',{bookingReference:receipt.number,...intentContext(body)},saved.booking_id);await preview(db,id,'waiting_approved',{text:'તમારું વેઇટિંગ રજિસ્ટ્રેશન મંજૂર થયું છે. તમારા પાસ હવે ઉપલબ્ધ છે.',templateApprovalRequired:true,bookingNumber:receipt.number});
   await audit(db,actor,id,'waiting_approved',{bookingId:saved.booking_id});return receipt;
  });},
  async duplicates(){const bookings=await snapshots();return {bookings,pairs:potentialDuplicates(bookings)};},
  async createReview(actor,{purpose,bookingIds,round='initial',unansweredOnly=false}){if(!/^[a-zA-Z0-9_-]{1,64}$/.test(round)||!['duplicate','attendance'].includes(purpose)||!Array.isArray(bookingIds)||bookingIds.length<1||bookingIds.length>10||new Set(bookingIds).size!==bookingIds.length)throw new ApiError(400,'Invalid family review');return tx(async db=>{
   // Event first, like registration/approval, serializes contact-event preparation.
   const event=await one(db,'SELECT event_date FROM ayambil_bookings WHERE id=?',[bookingIds[0]]);if(!event)throw new ApiError(400,'Same-event family bookings required');await control(db,event.event_date);
   // Lock source bookings to capture a consistent, active snapshot. No mutation.
   for(const id of [...bookingIds].sort())await query(db,'SELECT id FROM ayambil_bookings WHERE id=? FOR UPDATE',[id]);
   const all=await snapshots(db);let items=bookingIds.map(id=>all.find(b=>b.id===id));if(items.some(x=>!x)||new Set(items.map(x=>x.eventDate)).size!==1||new Set(items.map(x=>normalizeMobile(x.mobile))).size!==1)throw new ApiError(400,'Same-event family bookings required');
   if(purpose==='attendance'&&items.length!==1)throw new ApiError(400,'Choose one confirmed contact');
   if(purpose==='attendance'){const contact=normalizeMobile(items[0].mobile),date=items[0].eventDate;items=all.filter(b=>b.eventDate===date&&normalizeMobile(b.mobile)===contact);if(items.length>10)throw new ApiError(409,'More than 10 related bookings require organiser follow-up');}if(purpose==='duplicate'&&(items.length<2||!potentialDuplicates(items).length))throw new ApiError(400,'Overlapping names required for duplicate review');
   const contactKey=normalizeMobile(items[0].mobile),communicationKey=hash(purpose+':'+items[0].eventDate+':'+contactKey+':'+round);
   // Event lock serializes concurrent create requests with the same purpose/round.
   await control(db,items[0].eventDate);
   if(purpose==='attendance'&&unansweredOnly){const answered=await one(db,"SELECT id FROM ayambil_family_reviews WHERE purpose='attendance' AND event_date=? AND response IS NOT NULL AND (contact_key=? OR REGEXP_REPLACE(JSON_UNQUOTE(JSON_EXTRACT(snapshot,'$[0].mobile')),'[^0-9]','')=?) LIMIT 1",[items[0].eventDate,contactKey,contactKey]);if(answered)throw new ApiError(409,'This contact has already answered; excluded from unanswered follow-up');}
   if(purpose==='attendance'){const reviews=await query(db,'SELECT purpose,event_date,contact_key,snapshot,response,decision FROM ayambil_family_reviews WHERE event_date=?',[items[0].eventDate]);const eligibility=attendanceEligibility({bookings:all,reviews,eventDate:items[0].eventDate,mobile:items[0].mobile});if(!eligibility.eligible)throw new ApiError(409,'Attendance held: '+eligibility.reasons.join(', '));}
   const prior=await one(db,'SELECT id FROM ayambil_family_reviews WHERE communication_key=?',[communicationKey]);if(prior)return {id:prior.id,reused:true};
   const id=randomUUID();await query(db,'INSERT INTO ayambil_family_reviews(id,purpose,event_date,snapshot,review_round,contact_key,communication_key,created_at) VALUES(?,?,?,?,?,?,?,UTC_TIMESTAMP(3))',[id,purpose,items[0].eventDate,JSON.stringify(items),round,contactKey,communicationKey]);await intent(db,id,purpose==='duplicate'?'booking_verify':'attendance',{bookingIds:items.map(b=>b.id),contactKey,round},null,round);await audit(db,actor,id,'review_created',{purpose,bookingIds,round,sendingDisabled:true});return {id};
  });},
  async link(actor,id){return tx(async db=>{const r=await one(db,'SELECT * FROM ayambil_family_reviews WHERE id=? FOR UPDATE',[id]);if(!r||r.response||r.decision)throw new ApiError(409,'Review unavailable or already answered');const token=randomBytes(32).toString('hex');await query(db,'UPDATE ayambil_family_reviews SET token_hash=?,expires_at=DATE_ADD(UTC_TIMESTAMP(3),INTERVAL 7 DAY) WHERE id=?',[hash(token),id]);await audit(db,actor,id,'link_replaced');return {path:'/500-akhand-ayambil-vijayollas/respond#'+token,expiresInDays:7};});},
  async revoke(actor,id){await query(pool,'UPDATE ayambil_family_reviews SET token_hash=NULL WHERE id=?',[id]);await audit(pool,actor,id,'link_revoked');return {ok:true};},
  async family(token){if(!/^[a-f0-9]{64}$/.test(token||''))throw new ApiError(404,'Private link unavailable');const r=await one(pool,'SELECT * FROM ayambil_family_reviews WHERE token_hash=? AND expires_at>UTC_TIMESTAMP(3)',[hash(token)]);if(!r)throw new ApiError(404,'Private link expired or revoked');return {id:r.id,purpose:r.purpose,eventDate:r.event_date,bookings:parse(r.snapshot).map(({id,number,names})=>({id,number,names})),response:parse(r.response),closed:!!r.decision};},
  async respond(token,input){return tx(async db=>{
   if(!/^[a-f0-9]{64}$/.test(token||''))throw new ApiError(404,'Private link unavailable');const r=await one(db,'SELECT * FROM ayambil_family_reviews WHERE token_hash=? AND expires_at>UTC_TIMESTAMP(3) FOR UPDATE',[hash(token)]);if(!r||r.decision)throw new ApiError(404,'Private review unavailable');
   const maximum=r.purpose==='attendance'?Math.min(60,parse(r.snapshot).reduce((n,b)=>n+b.names.length,0)):6;
   if(!['yes','no'].includes(input.attending)||!Array.isArray(input.names)||input.names.length>maximum||input.count!==input.names.length||(input.attending==='yes'&&!input.names.length)||(input.attending==='no'&&input.names.length)||input.names.some(n=>typeof n!=='string'||n.trim().length<2||n.trim().length>120||/[\x00-\x1f<>]/.test(n)))throw new ApiError(400,'Enter matching names and a count within the registered family scope');
   const names=input.names.map(n=>n.trim().replace(/\s+/g,' '));if(new Set(names.map(normalizeName)).size!==names.length)throw new ApiError(400,'Repeated participant name; contact organiser');
   const selected=input.finalBookingId||null;if(selected&&!parse(r.snapshot).some(b=>b.id===selected))throw new ApiError(400,'Invalid final booking');
   const response={attending:input.attending,names,count:names.length,finalBookingId:selected},digest=hash(JSON.stringify(response));
   if(r.response){if(r.response_hash!==digest)throw new ApiError(409,'Response already saved; ask organiser for correction');return {ok:true,proposal:parse(r.response),bookingChanges:0};}
   await query(db,'UPDATE ayambil_family_reviews SET response=?,response_hash=? WHERE id=?',[JSON.stringify(response),digest,r.id]);await audit(db,null,r.id,'family_proposal_saved',response);return {ok:true,proposal:response,bookingChanges:0};
  });},
  async review(actor,{id,action,note}){if(!['reviewed','follow_up'].includes(action)||typeof note!=='string'||!note.trim()||note.length>1000)throw new ApiError(400,'Review action and note required');return tx(async db=>{const r=await one(db,'SELECT * FROM ayambil_family_reviews WHERE id=? FOR UPDATE',[id]);if(!r?.response||r.decision)throw new ApiError(409,'No pending proposal');const decision={action,note:note.trim(),actor:actor.admin_id};await query(db,'UPDATE ayambil_family_reviews SET decision=? WHERE id=?',[JSON.stringify(decision),id]);await audit(db,actor,id,'admin_review',decision);return {ok:true,bookingChanges:0};});},
  async prepareFollowUp(actor,{bookingIds,round}){
   if(!Array.isArray(bookingIds)||bookingIds.length<1||bookingIds.length>20)throw new ApiError(400,'Select 1–20 local contacts');
   const results=[];for(const id of bookingIds){try{const review=await this.createReview(actor,{purpose:'attendance',bookingIds:[id],round,unansweredOnly:true});await preview(pool,review.id,'attendance_invitation',{round,text:'આપ કાર્યક્રમમાં આવવાના છો? કેટલા સભ્યો આવશે?',templateApprovalRequired:true});results.push({bookingId:id,...review});}catch(e){if(e.status!==409)throw e;results.push({bookingId:id,excluded:true,reason:e.message});}}return {items:results,messagesSent:0,mock:true};
  },
  async workspace(){const reviews=await query(pool,'SELECT id,purpose,event_date,snapshot,response,decision,created_at,expires_at FROM ayambil_family_reviews ORDER BY created_at DESC');return {controls:await this.availability(),waiting:await this.waiting(),...await this.duplicates(),reviews:reviews.map(r=>({...r,snapshot:parse(r.snapshot),response:parse(r.response),decision:parse(r.decision)})),audit:await query(pool,'SELECT * FROM ayambil_control_audit ORDER BY created_at DESC,id DESC LIMIT 200'),previews:await query(pool,'SELECT subject,kind,body,created_at FROM ayambil_notification_previews ORDER BY created_at DESC'),localOnly:!production,messagesSent:0};}
 };
 const originalOverview=base.overview.bind(base);
 base.overview=async()=>({...await originalOverview(),bookingControlsAvailable:true,localOnly:!production});
 const originalStatus=base.status.bind(base);
 base.status=async()=>({...await originalStatus(),events:await controls.availability()});
 const originalReady=base.ready.bind(base);
 base.ready=async()=>{if(!await originalReady())return false;return assertControlsReady(pool,config);};
 controls.dashboard=createControlsDashboard(pool,controls);
 base.bookingControls=controls;return base;
}
