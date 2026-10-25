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
export const kpiDefinitions={waitingBookings:'Pending waiting forms only; approved waiting records excluded.',waitingPersons:'Sum of names in pending waiting forms; one group can contain 1–6 persons.',uniqueWaitingMobiles:'Distinct normalized mobile numbers among pending waiting forms in the selected scope. Across both events the same mobile counts once.',potentialDuplicateGroups:'Connected overlapping-booking groups within one normalized mobile and event, not a confirmed duplicate count.',potentialDuplicateBookings:'Distinct confirmed bookings affected by potential overlapping-name groups in the selected scope.',duplicateAwaitingResponse:'Open duplicate review requests with no family response; expired links still require organiser follow-up.',duplicateAwaitingAdmin:'Duplicate responses without a recorded admin decision.',attendanceYes:'Contact-event units with a latest saved Yes response, not booking forms.',attendanceNo:'Contact-event units with a latest saved No response; passes remain valid.',attendanceUnanswered:'Active confirmed contact-event units without any attendance response. Same mobile on two events counts twice.',confirmedAttendingPersons:'Sum of latest Yes response counts per contact-event. This is self-reported attendance, not a changed pass count.',responseCoverage:'Answered contact-event units divided by active confirmed contact-event units. Search/date scope applies server-side.'};
export function attendanceContacts(bookings,reviews){
 const contacts=new Map();for(const b of bookings){const key=b.eventDate+':'+normalizeMobile(b.mobile);if(!contacts.has(key))contacts.set(key,{key,eventDate:b.eventDate,mobile:b.mobile,contactName:b.contactName,bookings:[],names:[],registeredPersons:0});const c=contacts.get(key);c.bookings.push(b);c.names.push(...b.names);c.registeredPersons+=b.names.length;}
 for(const c of contacts.values()){
  const matching=reviews.filter(r=>r.purpose==='attendance'&&r.event_date===c.eventDate&&(r.contact_key===normalizeMobile(c.mobile)||r.snapshot.some(b=>normalizeMobile(b.mobile)===normalizeMobile(c.mobile))));
  const answered=matching.filter(r=>r.response).sort((a,b)=>String(b.created_at).localeCompare(String(a.created_at))||b.id.localeCompare(a.id));
  c.latestResponse=answered[0]?.response||null;c.review=matching.sort((a,b)=>String(b.created_at).localeCompare(String(a.created_at))||b.id.localeCompare(a.id))[0]||null;c.answer=c.latestResponse?.attending||'unanswered';
 }return [...contacts.values()];
}
export function scopedKpis(bookings,waiting,reviews){
 const pending=waiting.filter(w=>w.status==='waiting'),contacts=attendanceContacts(bookings,reviews),answered=contacts.filter(c=>c.latestResponse);
 return {waitingBookings:pending.length,waitingPersons:pending.reduce((n,w)=>n+w.groupSize,0),uniqueWaitingMobiles:new Set(pending.map(w=>normalizeMobile(w.mobile))).size,potentialDuplicateGroups:duplicateGroups(bookings).length,potentialDuplicateBookings:new Set(potentialDuplicates(bookings).flatMap(p=>p.bookingIds)).size,nameReviewBookings:bookings.filter(b=>b.names.some(n=>nameReviewReasons(n).length)).length,duplicateAwaitingResponse:reviews.filter(r=>r.purpose==='duplicate'&&!r.response&&!r.decision).length,duplicateAwaitingAdmin:reviews.filter(r=>r.purpose==='duplicate'&&r.response&&!r.decision).length,attendanceYes:contacts.filter(c=>c.answer==='yes').length,attendanceNo:contacts.filter(c=>c.answer==='no').length,attendanceUnanswered:contacts.filter(c=>c.answer==='unanswered').length,confirmedAttendingPersons:contacts.reduce((n,c)=>n+(c.answer==='yes'?c.latestResponse.count:0),0),answeredContacts:answered.length,confirmedContacts:contacts.length,responseCoverage:contacts.length?Math.round(1000*answered.length/contacts.length)/10:0};
}
