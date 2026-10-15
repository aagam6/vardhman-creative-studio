export const BATCH_INTERVAL_MS = 13000;
export function validateBatchPreview(preview) {
  if(!preview || !Array.isArray(preview.items) || preview.items.length>1000 || typeof preview.reviewedLegacy!=='boolean' || !['2026-11-02','2026-11-03'].includes(preview.date) || !['confirmation','pass','reminder'].includes(preview.type))throw Error('Invalid batch preview');
  const seen=new Set();
  for(const job of preview.items) {
    if(![job.id,job.booking_id].every(id=>typeof id==='string'&&/^[a-f0-9-]{36}$/.test(id)) || seen.has(job.id) || job.notification_type!==preview.type || typeof job.number!=='string' || !/^••••\d{4}$/.test(job.recipientMasked))throw Error('Invalid batch message');
    seen.add(job.id);
  }
  return preview;
}
export async function runReviewedBatch({preview,request,shouldStop,onResult,wait=ms=>new Promise(resolve=>setTimeout(resolve,ms))}) {
  validateBatchPreview(preview);
  let submitted=0;
  for(const job of preview.items) {
    if(shouldStop())return {submitted,stopped:true};
    // Stop/pause never cancels an in-flight provider request or retries it.
    let result;
    try { result=await request('admin/messages/send-selected',{method:'POST',body:{id:job.id,bookingId:job.booking_id,type:job.notification_type,...(preview.reviewedLegacy?{reviewedLegacy:true}:{})}}); }
    catch(error) { onResult(job,{status:'unconfirmed',httpStatus:error?.status});return {submitted,stopped:true}; }
    submitted++;onResult(job,result);
    if(!['accepted','sent','delivered','read'].includes(result?.status))return {submitted,stopped:true};
    if(submitted<preview.items.length&&!shouldStop())await wait(BATCH_INTERVAL_MS);
  }
  return {submitted,stopped:false};
}

export function scopeBatchToBookings(preview,bookingIds) {
 validateBatchPreview(preview);
 const selected=new Set(bookingIds);
 return {...preview,items:preview.items.filter(job=>selected.has(job.booking_id))};
}
