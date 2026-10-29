import {attendanceDelay} from './attendance-delay.mjs';
import {duplicateReviewState} from './duplicate-review-state.mjs';
import {normalizeMobile,normalizeName} from './booking-review-analysis.mjs';
const parse=v=>typeof v==='string'?JSON.parse(v):v;

// Contact-event holds are review reasons, never automatic booking/pass changes.
export function attendanceEligibility({bookings,reviews,eventDate,mobile,now=Date.now()}){
 const contact=normalizeMobile(mobile),items=bookings.filter(b=>b.eventDate===eventDate&&normalizeMobile(b.mobile)===contact);
 const related=reviews.filter(r=>r.event_date===eventDate&&(r.contact_key===contact||parse(r.snapshot||[]).some(b=>normalizeMobile(b.mobile)===contact)));
 const repeated=items.some(b=>new Set(b.names.map(normalizeName)).size!==b.names.length);
 const unresolvedReview=duplicateReviewState(items,related).groups.length>0;
 const reasons=[];
 if(!items.length)reasons.push('no_active_confirmed_booking');
 if(repeated)reasons.push('repeated_name_hold');
 const delay=attendanceDelay(items,now);if(!delay.ready)reasons.push('attendance_delay_not_due');
 if(unresolvedReview)reasons.push('unresolved_duplicate_review');
 if(related.some(r=>r.purpose==='attendance'&&r.response))reasons.push('already_responded');
 if(items.length>10||items.reduce((n,b)=>n+b.names.length,0)>60)reasons.push('contact_scope_too_large');
 return {eligible:reasons.length===0,reasons,attendanceDueAt:delay.dueAt,bookingIds:items.map(b=>b.id).sort()};
}
export async function lockAttendanceEvent(db,eventDate){
 const [rows]=await db.execute('SELECT event_date FROM ayambil_booking_controls WHERE event_date=? FOR UPDATE',[eventDate]);
 if(rows.length!==1)throw Error('Attendance event unavailable');
}
export async function loadAttendanceEligibility(db,{eventDate,mobile,now=Date.now()}){
 const contact=normalizeMobile(mobile);
 const [rows]=await db.execute("SELECT b.id,b.number,b.mobile,b.event_date,b.created_at,(SELECT MAX(w.approved_at) FROM ayambil_waiting w WHERE w.booking_id=b.id) approved_at,(SELECT MIN(na.created_at) FROM ayambil_notification_audit na JOIN ayambil_notification_outbox no ON JSON_UNQUOTE(JSON_EXTRACT(na.detail,'$.id'))=no.id WHERE no.subject=b.id AND no.purpose IN ('booking_confirmed','waiting_approved') AND no.provider_id IS NOT NULL AND na.action='claim_committed') confirmation_attempt_at,a.full_name FROM ayambil_bookings b JOIN ayambil_attendees a ON a.booking_id=b.id WHERE b.event_date=? AND REGEXP_REPLACE(b.mobile,'[^0-9]','')=? AND b.status='active' AND a.status='active' AND EXISTS(SELECT 1 FROM ayambil_passes p WHERE p.attendee_id=a.id AND p.status='active' AND p.trashed_at IS NULL) ORDER BY b.id,a.ordinal",[eventDate,contact]);
 const map=new Map();for(const r of rows){if(!map.has(r.id))map.set(r.id,{id:r.id,number:r.number,mobile:r.mobile,eventDate:r.event_date,createdAt:r.created_at,approvedAt:r.approved_at,confirmationAttemptAt:r.confirmation_attempt_at,names:[]});map.get(r.id).names.push(r.full_name);}
 const [reviews]=await db.execute("SELECT purpose,event_date,contact_key,snapshot,response,decision FROM ayambil_family_reviews WHERE event_date=? AND (contact_key=? OR REGEXP_REPLACE(JSON_UNQUOTE(JSON_EXTRACT(snapshot,'$[0].mobile')),'[^0-9]','')=?)",[eventDate,contact,contact]);
 const bookings=[...map.values()];return {...attendanceEligibility({bookings,reviews,eventDate,mobile,now}),bookings};
}
export function assertAttendanceEligible(result){if(!result.eligible)throw Error('Attendance held: '+result.reasons.join(', '));}
