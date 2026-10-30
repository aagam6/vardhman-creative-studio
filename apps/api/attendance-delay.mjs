export const ATTENDANCE_DELAY_MS=48*3600000;
const time=value=>value instanceof Date?value.getTime():typeof value==='string'?Date.parse(/[zZ]|[+-]\d\d:\d\d$/.test(value)?value:value.replace(' ','T')+'Z'):NaN;
export function attendanceDelay(bookings,now=Date.now(),finalCutoff=null){
 if(finalCutoff!==null){
  const cutoff=typeof finalCutoff==='string'&&/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(finalCutoff)?Date.parse(finalCutoff):NaN;
  // Only the explicitly closed registration/approval cohort gets the delay
  // exception. Missing timestamps and a newly expanded family fail closed.
  const admitted=bookings.flatMap(b=>[b.createdAt,...(b.approvedAt?[b.approvedAt]:[])]).map(time);
  const ready=Number.isFinite(cutoff)&&new Date(now).getTime()>=cutoff&&bookings.length>0&&admitted.length>0&&admitted.every(t=>Number.isFinite(t)&&t<=cutoff);
  return {dueAt:Number.isFinite(cutoff)?new Date(cutoff).toISOString():null,ready,reason:ready?null:'outside_final_attendance_cutoff'};
 }
 const starts=bookings.flatMap(b=>[b.createdAt,b.approvedAt,b.confirmationAttemptAt]).filter(Boolean).map(time);
 if(!starts.length)return {dueAt:null,ready:true};
 if(starts.some(t=>!Number.isFinite(t)))return {dueAt:null,ready:false};
 const dueAt=Math.max(...starts)+ATTENDANCE_DELAY_MS;
 return {dueAt:new Date(dueAt).toISOString(),ready:new Date(now).getTime()>=dueAt};
}
