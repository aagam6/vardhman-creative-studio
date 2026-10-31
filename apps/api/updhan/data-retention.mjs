export function retentionExpiry({retentionUntil,photoRetentionDays},now=new Date()){
 if(retentionUntil){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(retentionUntil))throw Error('Invalid retention date');
  const end=new Date(retentionUntil+'T23:59:59.999+05:30');
  if(!Number.isFinite(end.getTime())||end<=now)throw Error('Retention date has expired');
  return end;
 }
 if(!Number.isInteger(photoRetentionDays)||photoRetentionDays<1||photoRetentionDays>365)throw Error('Reviewed retention required');
 return new Date(now.getTime()+photoRetentionDays*86400000);
}
