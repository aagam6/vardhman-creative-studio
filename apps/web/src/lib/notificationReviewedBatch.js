// Explicit foreground operator action only. No worker, resume or retry loop.
export const NOTIFICATION_BATCH_INTERVAL_MS=17000;
const uuid=x=>typeof x==='string'&&/^[a-f0-9-]{36}$/.test(x);
export function reviewedNotificationBatch(items,owner){
 if(owner?.owner!=='bilingual'||!Number.isSafeInteger(owner.version)||!Array.isArray(items)||!items.length||items.length>20)throw Error('Reviewed bilingual owner and 1–20 messages required');
 const purpose=items[0].purpose,seen=new Set();
 for(const i of items){if(!uuid(i.id)||seen.has(i.id)||i.purpose!==purpose||i.round_name!=='initial'||!['held','ready'].includes(i.state)||i.attempts!==0||i.provider_id)throw Error('Only distinct, never-attempted messages of one purpose/round');seen.add(i.id);}
 return {version:owner.version,items:items.map(i=>({id:i.id,purpose:i.purpose,round:i.round_name}))};
}
export async function runNotificationBatch({preview,request,shouldStop,onResult,wait=ms=>new Promise(r=>setTimeout(r,ms))}){
 let submitted=0;
 for(let n=0;n<preview.items.length;n++){
  if(shouldStop())return {submitted,stopped:true};
  const item=preview.items[n];let result;
  try{result=await request('admin/notification-outbox/send',{method:'POST',body:{id:item.id,version:preview.version,confirmation:'SEND ONE REVIEWED MESSAGE'}});}
  catch(e){await onResult(item,{status:'unconfirmed',httpStatus:Number.isInteger(e?.status)?e.status:null,requestId:uuid(e?.requestId)?e.requestId:null});return {submitted,stopped:true};}
  await onResult(item,{status:result?.status||'unconfirmed'});
  if(!['accepted','sent','delivered','read'].includes(result?.status))return {submitted,stopped:true};
  submitted++;
  if(n+1<preview.items.length&&!shouldStop())await wait(NOTIFICATION_BATCH_INTERVAL_MS);
 }
 return {submitted,stopped:false};
}
