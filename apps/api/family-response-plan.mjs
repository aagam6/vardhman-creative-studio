import {ApiError} from './config.mjs';
import {normalizeName} from './booking-review-analysis.mjs';
// Retain existing identities only. Never creates attendees, passes or notifications.
export function familyResponsePlan(snapshot,current,input,purpose){
 const chosen=purpose==='duplicate'?snapshot.filter(b=>b.id===input.finalBookingId):snapshot;
 if(!chosen.length)throw new ApiError(400,'Choose an existing booking');
 const requested=input.names.map(normalizeName);
 if(input.count!==requested.length||new Set(requested).size!==requested.length||!['yes','no'].includes(input.attending)||(input.attending==='no'&&requested.length)||(input.attending==='yes'&&!requested.length))throw new ApiError(400,'Select existing attendees or choose No');
 const allowed=new Set(chosen.flatMap(b=>b.names.map(normalizeName)));
 if(requested.some(n=>!allowed.has(n)))throw new ApiError(400,'New names or additional attendees require a new registration');
 const keep=new Set();
 for(const name of requested){const matches=current.filter(a=>chosen.some(b=>b.id===a.booking_id)&&normalizeName(a.full_name)===name&&a.status==='active'&&Number(a.valid_passes)===1);if(matches.length!==1)throw new ApiError(409,'Attendee details changed or are ambiguous; contact the organiser');keep.add(matches[0].id);}
 return {keepIds:[...keep],cancelIds:current.filter(a=>a.status==='active'&&!keep.has(a.id)).map(a=>a.id)};
}
