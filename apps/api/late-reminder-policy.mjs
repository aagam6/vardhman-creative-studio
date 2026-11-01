// Explicit one-record catch-up only, on its event day and before entry opens.
export function lateReminderExpiry(eventDate,now){
 if(!/^2026-11-0[23]$/.test(eventDate))throw Error('Supported event required');
 const time=new Date(now).getTime(),start=Date.parse(eventDate+'T00:00:00+05:30'),end=Date.parse(eventDate+'T20:00:00+05:30');
 if(!Number.isFinite(time)||time<start||time>=end)throw Error('Late reminder requires event day before entry opens');
 return new Date(end).toISOString();
}
