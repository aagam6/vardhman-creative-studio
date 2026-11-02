// Bounded preparation only; every record retains the existing one-record guards.
export async function prepareReviewedLateReminders(service,subjects,actor){
 if(!actor?.admin_id||!Array.isArray(subjects)||subjects.length<1||subjects.length>20||new Set(subjects).size!==subjects.length||subjects.some(x=>typeof x!=='string'||!/^[a-f0-9-]{36}$/.test(x)))throw Error('Select 1–20 distinct reviewed booking IDs');
 const held=new Map([['Confirmed notification held for duplicate/name review','duplicate_or_name_hold'],['Recipient reminder already recorded; no resend','provider_prior_reminder'],['Legacy reminder already attempted','legacy_prior_reminder'],['Reminder or entry notice already attempted','prior_reminder_or_entry'],['Active booking required','inactive_or_no_consent'],['Active passes required','no_valid_passes'],['Existing intent revision conflict','source_revision_changed']]);
 const items=[];let stopped=false;
 for(const subject of subjects){try{const result=await service.prepareLateReminder(subject,actor);items.push({subject,status:'prepared',id:result.id,expiresAt:result.expiresAt});}catch(error){const reason=held.get(error.message);items.push({subject,status:reason?'held':'stopped',reason:reason||(error.code==='DISPATCH_BUSY'?'lease_busy':error.code==='PROVIDER_HTTP_429'?'rate_limited':'review_required')});if(!reason){stopped=true;break;}}}
 return {items,remaining:subjects.slice(items.length),stopped,sent:false,providerSubmissions:0};
}
