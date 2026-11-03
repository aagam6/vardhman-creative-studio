import {liveUpdateDefinition,buildLiveUpdateMock} from './registered-live-update-preview.mjs';
import {programme} from './config.mjs';
export const LIVE_UPDATE_PURPOSE='registered_event_live_update';
export function liveUpdateScope({eventDate,mobile,videoId,now=new Date()}){
 if(!/^[-_a-zA-Z0-9]{11}$/.test(videoId||''))throw Error('Exact YouTube video ID required');
 const digits=String(mobile||'').replace(/[+\s()-]/g,'');
 const canonical=/^[6-9]\d{9}$/.test(digits)?'91'+digits:digits;
 if(!/^[1-9]\d{7,14}$/.test(canonical))throw Error('Valid canonical recipient required');
 const today=new Date(new Date(now).getTime()+19800000).toISOString().slice(0,10);
 if(eventDate!==today)throw Error('Live update requires the current event day');
 return [eventDate,canonical,videoId];
}
export function liveUpdatePayload({source,session,videoId,now}){
 liveUpdateScope({eventDate:source.eventDate,mobile:source.mobile,videoId,now});
 const expected=programme.sessions.find(s=>s.date===source.eventDate);
 if(!expected||['date','performer','label','time','venue','mapsUrl'].some(k=>session?.[k]!==expected[k]))throw Error('Reviewed live event snapshot required');
 const map=new URL(session.mapsUrl);if(map.protocol!=='https:'||map.hostname!=='maps.app.goo.gl')throw Error('Reviewed venue location required');
 const p=buildLiveUpdateMock({contactName:source.contactName,bookingReference:source.bookingReference,eventLabel:session.performer,eventDate:session.label,eventTime:session.time,venue:session.venue+' · '+session.mapsUrl,videoId});
 return {purpose:LIVE_UPDATE_PURPOSE,to:source.mobile,name:liveUpdateDefinition.name,language:p.language,components:p.components};
}
export function assertNoLiveUpdateReceipt(receipts){
 if(!Array.isArray(receipts)||receipts.some(r=>!r?.id||typeof r.status!=='string'))throw Error('Complete live-update provider history required');
 if(receipts.some(r=>r.template===liveUpdateDefinition.name))throw Error('Prior live update recorded; no resend');
}
