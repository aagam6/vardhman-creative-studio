import {duplicateGroups,normalizeMobile,normalizeName} from './booking-review-analysis.mjs';
const parse=v=>typeof v==='string'?JSON.parse(v):v;
const signature=rows=>JSON.stringify(rows.map(b=>({id:b.id,eventDate:b.eventDate,mobile:normalizeMobile(b.mobile),names:b.names.map(normalizeName).sort()})).sort((a,b)=>a.id.localeCompare(b.id)));
// Compute from current valid bookings; retain every historical review unchanged.
export function duplicateReviewState(bookings,reviews){
 const groups=duplicateGroups(bookings);
 const related=(r,g)=>r.purpose==='duplicate'&&r.event_date===g.eventDate&&(normalizeMobile(r.contact_key||'')===normalizeMobile(g.mobile)||(parse(r.snapshot)||[]).some(b=>g.bookingIds.includes(b.id)));
 const resolved=(r,g)=>['reviewed','applied'].includes(parse(r.decision)?.action)&&signature(parse(r.snapshot)||[])===signature(bookings.filter(b=>b.eventDate===g.eventDate&&normalizeMobile(b.mobile)===normalizeMobile(g.mobile)));
 const unresolved=groups.filter(g=>!reviews.some(r=>related(r,g)&&resolved(r,g)));
 const dispositions=reviews.filter(r=>r.purpose==='duplicate').map(r=>{
  const current=unresolved.filter(g=>related(r,g));
  return {id:r.id,open:current.length>0&&!['reviewed','applied'].includes(parse(r.decision)?.action),reason:!current.length?'resolved_or_no_current_overlap':parse(r.decision)?.action==='applied'?'new_overlap_after_applied_response':'current_overlap',review:r};
 });
 return {groups:unresolved,dispositions};
}
