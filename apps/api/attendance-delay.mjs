export const ATTENDANCE_DELAY_MS=48*3600000;
const time=value=>value instanceof Date?value.getTime():typeof value==='string'?Date.parse(/[zZ]|[+-]\d\d:\d\d$/.test(value)?value:value.replace(' ','T')+'Z'):NaN;
export function attendanceDelay(bookings,now=Date.now()){
 const starts=bookings.flatMap(b=>[b.createdAt,b.approvedAt,b.confirmationAttemptAt]).filter(Boolean).map(time);
 if(!starts.length)return {dueAt:null,ready:true};
 if(starts.some(t=>!Number.isFinite(t)))return {dueAt:null,ready:false};
 const dueAt=Math.max(...starts)+ATTENDANCE_DELAY_MS;
 return {dueAt:new Date(dueAt).toISOString(),ready:new Date(now).getTime()>=dueAt};
}
