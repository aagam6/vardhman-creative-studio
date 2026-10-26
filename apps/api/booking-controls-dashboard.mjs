import {ApiError} from './config.mjs';
import {normalizeName,normalizeMobile,duplicateGroups,nameReviewReasons,attendanceContacts,scopedKpis,kpiDefinitions} from './booking-review-analysis.mjs';
import {attendanceEligibility} from './attendance-eligibility.mjs';
const parse=v=>typeof v==='string'?JSON.parse(v):v;
export function createControlsDashboard(pool,controls){
 const query=async(sql,args=[])=> (await pool.execute(sql,args))[0];
 return async function dashboard(input={}){
  const date=String(input.date||''),search=String(input.search||'').trim(),view=String(input.view||'waiting'),page=Number(input.page||1),status=String(input.status||'');
  if(!['','2026-11-02','2026-11-03'].includes(date)||search.length>120||!['bookings','waiting','duplicates','attendance','settings'].includes(view)||!Number.isInteger(page)||page<1||page>100000||!['','waiting','approved','exact','subset','partial','name','awaiting_response','awaiting_admin','reviewed','follow_up','yes','no','unanswered','all'].includes(status))throw new ApiError(400,'Invalid control dashboard filters');
  // Derive cross-booking groups server-side from lightweight names/contact rows.
  // Only a bounded page of cards is returned; existing booking/pass hydration stays paginated.
  const {bookings:all}=await controls.duplicates();
  const term=normalizeName(search),phone=normalizeMobile(search);
  const matches=b=>!term||normalizeName([b.number,b.contactName,...b.names].join(' ')).includes(term)||(phone.length>=3&&normalizeMobile(b.mobile).includes(phone));
  const eventMatch=b=>!date||b.eventDate===date;
  // Contact search expands to related bookings in that same family/event so an overlap is not hidden by one matching name.
  const keys=new Set(all.filter(matches).map(b=>b.eventDate+':'+normalizeMobile(b.mobile)));
  const bookings=all.filter(b=>eventMatch(b)&&keys.has(b.eventDate+':'+normalizeMobile(b.mobile)));
  const rawWaiting=await controls.waiting(),waiting=rawWaiting.filter(w=>eventMatch(w)&&matches({number:w.number,contactName:w.contactName,mobile:w.mobile,names:w.attendees.map(a=>a.fullName)}));
  const rawReviews=await query('SELECT id,purpose,event_date,snapshot,response,decision,created_at,expires_at,contact_key,review_round FROM ayambil_family_reviews ORDER BY created_at DESC,id DESC');
  const reviews=rawReviews.map(r=>({...r,snapshot:parse(r.snapshot),response:parse(r.response),decision:parse(r.decision)})).filter(r=>(!date||r.event_date===date)&&(!term||r.snapshot.some(b=>matches(b)||keys.has(b.eventDate+':'+normalizeMobile(b.mobile)))));
  const totals=scopedKpis(bookings,waiting,reviews),dates=date?[date]:['2026-11-02','2026-11-03'];
  const evenings=dates.map(eventDate=>({eventDate,...scopedKpis(bookings.filter(b=>b.eventDate===eventDate),waiting.filter(w=>w.eventDate===eventDate),reviews.filter(r=>r.event_date===eventDate))}));
  let items=[];
  if(view==='waiting')items=waiting.filter(w=>status==='all'||w.status===(status==='approved'?'approved':'waiting')).map(w=>({...w,bookingNumber:all.find(b=>b.id===w.bookingId)?.number||null}));
  if(view==='duplicates'){
   const groups=duplicateGroups(bookings).map(g=>({...g,type:'potential',relations:[...new Set(g.overlaps.map(p=>p.relation))],bookings:g.bookings.slice(0,10),truncated:g.bookings.length>10}));
   const names=bookings.filter(b=>b.names.some(n=>nameReviewReasons(n).length)).map(b=>({id:'name:'+b.id,type:'name',eventDate:b.eventDate,mobile:b.mobile,bookingIds:[b.id],bookingCount:1,bookings:[b],flaggedNames:b.names.map(name=>({name,reasons:nameReviewReasons(name)})).filter(x=>x.reasons.length)}));
   items=status==='name'?names:groups.filter(g=>!['exact','subset','partial'].includes(status)||g.relations.includes(status));
   if(!status||status==='all')items=[...items,...names];
  }
  const contacts=attendanceContacts(bookings,reviews).map(c=>({...c,eligibility:attendanceEligibility({bookings,reviews,eventDate:c.eventDate,mobile:c.mobile})}));
  const attendanceSafety=dates.map(eventDate=>{const units=contacts.filter(c=>c.eventDate===eventDate);return {eventDate,contacts:units.length,eligible:units.filter(c=>c.eligibility.eligible).length,held:units.filter(c=>!c.eligibility.eligible).length,unresolvedDuplicate:units.filter(c=>c.eligibility.reasons.includes('unresolved_duplicate_review')).length,repeatedName:units.filter(c=>c.eligibility.reasons.includes('repeated_name_hold')).length};});
  if(view==='attendance')items=contacts.filter(c=>!['yes','no','unanswered'].includes(status)||c.answer===status).map(c=>({...c,bookings:c.bookings.slice(0,10),review:c.review?{...c.review,snapshot:c.review.snapshot.slice(0,10)}:null}));
  if(view==='duplicates'&&['awaiting_response','awaiting_admin','reviewed','follow_up'].includes(status))items=[];
  const pageSize=20,total=items.length;items=items.slice((page-1)*pageSize,page*pageSize);
  const pagedReviews=reviews.filter(r=>r.purpose==='duplicate').filter(r=>status==='awaiting_response'?!r.response&&!r.decision:status==='awaiting_admin'?r.response&&!r.decision:status==='reviewed'||status==='follow_up'?r.decision?.action===status:true);
  const reviewTotal=pagedReviews.length;
  const subjects=items.flatMap(i=>[i.id,i.review?.id,...(i.bookingIds||[])]).concat(pagedReviews.slice((page-1)*pageSize,page*pageSize).map(r=>r.id)).filter(Boolean);
  let audit=[];if(subjects.length){audit=await query('SELECT * FROM ayambil_control_audit WHERE subject IN ('+subjects.map(()=>'?').join(',')+') ORDER BY created_at DESC,id DESC LIMIT 100',subjects);}
  const previews=await query('SELECT subject,kind,body,created_at FROM ayambil_notification_previews ORDER BY created_at DESC LIMIT 20');
  const settings=await controls.availability();
  return {localOnly:controls.localOnly,messagesSendingEnabled:false,attendanceSafety,scope:{date,search,view,status},page,pageSize,total,hasMore:page*pageSize<total,items,kpis:{totals,evenings,definitions:kpiDefinitions},controls:settings.map(c=>({...c,availableSeats:Math.max(0,c.capacity-c.activePersons),overCapacity:Math.max(0,c.activePersons-c.capacity)})),reviews:view==='duplicates'?pagedReviews.slice((page-1)*pageSize,page*pageSize):[],reviewTotal,reviewHasMore:page*pageSize<reviewTotal,audit,previews};
 };
}
