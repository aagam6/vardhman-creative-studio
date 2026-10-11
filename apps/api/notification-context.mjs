import {ApiError,programme} from './config.mjs';
export const notificationTemplates=Object.freeze({
 confirmation:{name:'ayambil_registration_confirm',fields:['attendeeName','programme','eventDate','venue','venueLocationUrl']},
 pass:{name:'ayambil_pass_ready',fields:['attendeeName','programme','eventDate','venue','venueLocationUrl','passLink']},
 reminder:{name:'ayambil_event_reminder',fields:['attendeeName','programme','eventDate','venue','venueLocationUrl']}
});
// Saved snapshots are authoritative; never borrow another evening's URL/details.
export function attendeeContext(session,attendeeName,to){
 const expected=programme.sessions.find(s=>s.date===session?.date);
 if(!expected||['performer','programme','venue','mapsUrl'].some(key=>session[key]!==expected[key])||typeof attendeeName!=='string'||!attendeeName.trim())throw new ApiError(503,'Reviewed attendee event snapshot required');
 let url;try{url=new URL(session.mapsUrl);}catch{throw new ApiError(503,'Venue location URL required');}
 if(url.protocol!=='https:'||url.hostname!=='maps.app.goo.gl')throw new ApiError(503,'Reviewed venue location URL required');
 return {to,attendeeName,eventName:programme.eventName,eventDate:session.date,time:session.time,performer:session.performer,programme:session.programme,venue:session.venue,venueLocationUrl:session.mapsUrl};
}
