import {normalizeMobile,normalizeName,potentialDuplicates} from './booking-review-analysis.mjs';
const parse=v=>typeof v==='string'?JSON.parse(v):v;
const scope=bookings=>JSON.stringify(bookings.map(b=>({id:b.id,eventDate:b.eventDate,mobile:normalizeMobile(b.mobile),names:b.names})).sort((a,b)=>a.id.localeCompare(b.id)));

// Contact-event holds are review reasons, never automatic booking/pass changes.
export function attendanceEligibility({bookings,reviews,eventDate,mobile}){
 const contact=normalizeMobile(mobile),items=bookings.filter(b=>b.eventDate===eventDate&&normalizeMobile(b.mobile)===contact);
 const related=reviews.filter(r=>r.event_date===eventDate&&(r.contact_key===contact||parse(r.snapshot||[]).some(b=>normalizeMobile(b.mobile)===contact)));
 const repeated=items.some(b=>new Set(b.names.map(normalizeName)).size!==b.names.length);
 const duplicate=related.filter(r=>r.purpose==='duplicate');
 const unresolvedReview=duplicate.some(r=>parse(r.decision)?.action!=='reviewed');
 const resolvedCurrent=duplicate.some(r=>parse(r.decision)?.action==='reviewed'&&scope(parse(r.snapshot))===scope(items));
 const reasons=[];
 if(!items.length)reasons.push('no_active_confirmed_booking');
 if(repeated)reasons.push('repeated_name_hold');
 if(unresolvedReview||potentialDuplicates(items).length&&!resolvedCurrent)reasons.push('unresolved_duplicate_review');
 if(related.some(r=>r.purpose==='attendance'&&r.response))reasons.push('already_responded');
 if(items.length>10||items.reduce((n,b)=>n+b.names.length,0)>60)reasons.push('contact_scope_too_large');
 return {eligible:reasons.length===0,reasons,bookingIds:items.map(b=>b.id).sort()};
}
export async function lockAttendanceEvent(db,eventDate){
 const [rows]=await db.execute('SELECT event_date FROM ayambil_booking_controls WHERE event_date=? FOR UPDATE',[eventDate]);
 if(rows.length!==1)throw Error('Attendance event unavailable');
}
export async function loadAttendanceEligibility(db,{eventDate,mobile}){
 const contact=normalizeMobile(mobile);
 const [rows]=await db.execute("SELECT b.id,b.number,b.mobile,b.event_date,a.full_name FROM ayambil_bookings b JOIN ayambil_attendees a ON a.booking_id=b.id WHERE b.event_date=? AND REGEXP_REPLACE(b.mobile,'[^0-9]','')=? AND b.status='active' AND a.status='active' AND EXISTS(SELECT 1 FROM ayambil_passes p WHERE p.attendee_id=a.id AND p.status='active' AND p.trashed_at IS NULL) ORDER BY b.id,a.ordinal",[eventDate,contact]);
 const map=new Map();for(const r of rows){if(!map.has(r.id))map.set(r.id,{id:r.id,number:r.number,mobile:r.mobile,eventDate:r.event_date,names:[]});map.get(r.id).names.push(r.full_name);}
 const [reviews]=await db.execute("SELECT purpose,event_date,contact_key,snapshot,response,decision FROM ayambil_family_reviews WHERE event_date=? AND (contact_key=? OR REGEXP_REPLACE(JSON_UNQUOTE(JSON_EXTRACT(snapshot,'$[0].mobile')),'[^0-9]','')=?)",[eventDate,contact,contact]);
 const bookings=[...map.values()];return {...attendanceEligibility({bookings,reviews,eventDate,mobile}),bookings};
}
export function assertAttendanceEligible(result){if(!result.eligible)throw Error('Attendance held: '+result.reasons.join(', '));}
