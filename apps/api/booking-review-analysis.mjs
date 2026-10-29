import {duplicateReviewState} from './duplicate-review-state.mjs';
export const normalizeName=s=>String(s).normalize('NFKC').replace(/[\u200b-\u200d\ufeff]/g,'').toLocaleLowerCase('en').replace(/[^\p{L}\p{M}\p{N}]+/gu,' ').trim().replace(/\s+/g,' ');
export const normalizeMobile=s=>String(s).replace(/[^0-9]/g,'');
export function nameReviewReasons(name){
 const n=normalizeName(name),reasons=[];
 if(/\b(test|demo|sample|synthetic|fixture|local|asdf|unknown|xxx)\b|પરીક્ષણ|ટેસ્ટ|ડેમો|નમૂના/i.test(n))reasons.push('Test-like wording');
 if(!n||n.length<2||/^\d+$/.test(n)||/^(.)\1{3,}$/u.test(n))reasons.push('Unusual name pattern');
 return reasons;
}
export function potentialDuplicates(bookings){
 const groups=new Map(),pairs=[];
 for(const b of bookings){const key=b.eventDate+':'+normalizeMobile(b.mobile);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(b);}
 for(const items of groups.values())for(let i=0;i<items.length;i++)for(let j=i+1;j<items.length;j++){
  const left=new Set(items[i].names.map(normalizeName)),right=new Set(items[j].names.map(normalizeName));
  const overlap=[...right].filter(n=>n&&left.has(n));if(!overlap.length)continue;
  const relation=overlap.length===left.size&&overlap.length===right.size?'exact':overlap.length===left.size||overlap.length===right.size?'subset':'partial';
  pairs.push({bookingIds:[items[i].id,items[j].id],eventDate:items[i].eventDate,overlap,relation,reason:'same mobile, same evening, overlapping normalized names; potential only'});
 }return pairs;
}
export function duplicateGroups(bookings){
 const pairs=potentialDuplicates(bookings),parent=new Map();
 const find=x=>{if(!parent.has(x))parent.set(x,x);if(parent.get(x)!==x)parent.set(x,find(parent.get(x)));return parent.get(x);};
 for(const p of pairs)parent.set(find(p.bookingIds[1]),find(p.bookingIds[0]));
 const map=new Map();for(const id of parent.keys()){const root=find(id);if(!map.has(root))map.set(root,[]);map.get(root).push(id);}
 return [...map.values()].map(ids=>{const related=bookings.filter(b=>ids.includes(b.id));return {id:[...ids].sort()[0],eventDate:related[0].eventDate,mobile:related[0].mobile,bookingIds:ids,bookingCount:ids.length,bookings:related,overlaps:pairs.filter(p=>ids.includes(p.bookingIds[0]))};});
}
export const kpiDefinitions={waitingBookings:'Pending waiting forms only; approved waiting records excluded.',waitingPersons:'Sum of names in pending waiting forms; one group can contain 1–6 persons.',uniqueWaitingMobiles:'Distinct normalized mobile numbers among pending waiting forms in the selected scope. Across both events the same mobile counts once.',potentialDuplicateGroups:'Current unresolved overlapping-booking groups only. Reviewed/applied scopes and manually cancelled overlaps remain in history.',potentialDuplicateBookings:'Distinct confirmed bookings affected by potential overlapping-name groups in the selected scope.',duplicateAwaitingResponse:'Unanswered reviews that still overlap current active bookings; historical cancelled/resolved scopes excluded.',duplicateAwaitingAdmin:'Duplicate responses without a recorded admin decision.',attendanceYes:'Contact-event units with a latest saved Yes response, not booking forms.',attendanceNo:'Contact-event units with a latest saved No response; historical proposals leave passes valid; applied final No responses cancel their scoped passes.',attendanceUnanswered:'Active confirmed contact-event units without any attendance response. Same mobile on two events counts twice.',confirmedAttendingPersons:'Historical self-reported Yes counts. Compare currentAttendingPersons for names still holding current valid passes.',currentAttendingPersons:'Latest Yes response names intersected with current valid participants.',staleAttendanceResponses:'Yes responses whose reported participant count no longer matches current valid attendees.',responseCoverage:'Answered contact-event units divided by active confirmed plus applied-response contact-event units. Search/date scope applies server-side.'};
export function attendanceContacts(bookings,reviews){
 const contacts=new Map();for(const b of bookings){const key=b.eventDate+':'+normalizeMobile(b.mobile);if(!contacts.has(key))contacts.set(key,{key,eventDate:b.eventDate,mobile:b.mobile,contactName:b.contactName,bookings:[],names:[],registeredPersons:0});const c=contacts.get(key);c.bookings.push(b);c.names.push(...b.names);c.registeredPersons+=b.names.length;}
 for(const r of reviews.filter(r=>r.purpose==='attendance'&&r.response?.attending==='no'&&r.decision?.action==='applied')){const b=r.snapshot[0],key=r.event_date+':'+normalizeMobile(b.mobile);if(!contacts.has(key))contacts.set(key,{key,eventDate:r.event_date,mobile:b.mobile,contactName:b.contactName,bookings:[],names:[],registeredPersons:0});}
 for(const c of contacts.values()){
  const matching=reviews.filter(r=>r.purpose==='attendance'&&r.event_date===c.eventDate&&(r.contact_key===normalizeMobile(c.mobile)||r.snapshot.some(b=>normalizeMobile(b.mobile)===normalizeMobile(c.mobile))));
  const answered=matching.filter(r=>r.response).sort((a,b)=>String(b.created_at).localeCompare(String(a.created_at))||b.id.localeCompare(a.id));
  c.latestResponse=answered[0]?.response||null;c.review=matching.sort((a,b)=>String(b.created_at).localeCompare(String(a.created_at))||b.id.localeCompare(a.id))[0]||null;c.answer=c.latestResponse?.attending||'unanswered';
  const responseNames=new Set((c.latestResponse?.names||[]).map(normalizeName));c.currentAttendingPersons=c.answer==='yes'?c.names.filter(n=>responseNames.has(normalizeName(n))).length:0;c.responseScopeChanged=c.answer==='yes'&&Array.isArray(c.latestResponse?.names)&&c.currentAttendingPersons!==c.latestResponse.count;
 }return [...contacts.values()];
}
export function scopedKpis(bookings,waiting,reviews){
 const pending=waiting.filter(w=>w.status==='waiting'),contacts=attendanceContacts(bookings,reviews),answered=contacts.filter(c=>c.latestResponse),duplicateState=duplicateReviewState(bookings,reviews),openReviews=duplicateState.dispositions.filter(d=>d.open).map(d=>d.review);
 return {waitingBookings:pending.length,waitingPersons:pending.reduce((n,w)=>n+w.groupSize,0),uniqueWaitingMobiles:new Set(pending.map(w=>normalizeMobile(w.mobile))).size,potentialDuplicateGroups:duplicateState.groups.length,potentialDuplicateBookings:new Set(duplicateState.groups.flatMap(g=>g.bookingIds)).size,nameReviewBookings:bookings.filter(b=>b.names.some(n=>nameReviewReasons(n).length)).length,duplicateAwaitingResponse:openReviews.filter(r=>!r.response&&!r.decision).length,duplicateAwaitingAdmin:openReviews.filter(r=>r.response&&!r.decision).length,attendanceYes:contacts.filter(c=>c.answer==='yes').length,attendanceNo:contacts.filter(c=>c.answer==='no').length,attendanceUnanswered:contacts.filter(c=>c.answer==='unanswered').length,confirmedAttendingPersons:contacts.reduce((n,c)=>n+(c.answer==='yes'?c.latestResponse.count:0),0),currentAttendingPersons:contacts.reduce((n,c)=>n+c.currentAttendingPersons,0),staleAttendanceResponses:contacts.filter(c=>c.responseScopeChanged).length,answeredContacts:answered.length,confirmedContacts:contacts.length,responseCoverage:contacts.length?Math.round(1000*answered.length/contacts.length)/10:0};
}
