import {attendeeContext,notificationTemplates} from './notification-context.mjs';
import {dueReminderSession} from './reminder-schedule.mjs';

export function reminderPayload({session,source}){
 const context=attendeeContext(session,source.contactName,source.mobile);
 return {purpose:'reminder',name:notificationTemplates.reminder.name,language:{code:'en'},to:source.mobile,components:[{type:'body',parameters:notificationTemplates.reminder.fields.map(field=>({type:'text',text:context[field]}))}]};
}
export function assertReminderWindow(eventDate,now){
 if(dueReminderSession(now)?.date!==eventDate)throw Error('Reminder outside previous-day 18:00 IST window');
}
export const reminderSchedule=Object.freeze({time:'18:00',timezone:'Asia/Kolkata',daysBefore:1,events:[{eventDate:'2026-11-02',startsAt:'2026-11-01T12:30:00.000Z'},{eventDate:'2026-11-03',startsAt:'2026-11-02T12:30:00.000Z'}]});
