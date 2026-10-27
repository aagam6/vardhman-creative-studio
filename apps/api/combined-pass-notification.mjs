import {attendeeContext,notificationTemplates} from './notification-context.mjs';
import {bookingPassToken} from './booking-pass-link.mjs';
// Existing approved English pass template; one booking-level combined URL.
// This is not a new confirmation and never enters the legacy queue.
export function combinedPassPayload({session,source,subject,key,origin}){
 const context={...attendeeContext(session,source.contactName,source.mobile),passLink:origin+'/500-akhand-ayambil-vijayollas/passes#'+bookingPassToken(key,subject,session)};
 if(!/^https:\/\/vardhmancreativestudio\.com$/.test(origin)&&!/^http:\/\/127\.0\.0\.1:\d+$/.test(origin))throw Error('Canonical pass origin required');
 return {purpose:'pass_link',name:notificationTemplates.pass.name,language:{code:'en'},to:source.mobile,components:[{type:'body',parameters:notificationTemplates.pass.fields.map(field=>({type:'text',text:context[field]}))}]};
}
