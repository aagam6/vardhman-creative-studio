import {createBilingualMockAdapter} from './bilingual-template-adapter.mjs';
import {dueReminderSession} from './reminder-schedule.mjs';

export function reminderPayload({session,source,build=createBilingualMockAdapter()}){
 // One scheduled reminder job uses the reviewed bilingual entry-timing template.
 // It is not a second entry campaign or a second provider submission.
 return {...build('entry_timing',{...source,eventLabel:session.performer,eventDate:session.label}),purpose:'reminder',to:source.mobile};
}
export function assertReminderWindow(eventDate,now){
 if(dueReminderSession(now)?.date!==eventDate)throw Error('Reminder outside previous-day 18:00 IST window');
}
export const reminderSchedule=Object.freeze({time:'18:00',timezone:'Asia/Kolkata',daysBefore:1,purpose:'reminder',template:'ayambil_entry_timing_bilingual',language:'en',separateEntryNotice:false,events:[{eventDate:'2026-11-02',startsAt:'2026-11-01T12:30:00.000Z'},{eventDate:'2026-11-03',startsAt:'2026-11-02T12:30:00.000Z'}]});
