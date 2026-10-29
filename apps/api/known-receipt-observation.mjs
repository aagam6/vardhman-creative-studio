// Known persisted receipts only. No message POST, queue state update or retry.
export async function observeKnownReceipts(pool,provider,{after='',limit=20,ids}={}){
 if(typeof after!=='string'||after.length>200||!Number.isInteger(limit)||limit<1||limit>20)throw Error('Bounded receipt cursor required');
 let rows;
 if(ids!==undefined){
  if(after||limit!==20||!Array.isArray(ids)||ids.length<1||ids.length>20||ids.some(id=>typeof id!=='string'||!/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/.test(id))||new Set(ids).size!==ids.length)throw Error('1–20 distinct saved provider UUIDs required; do not mix cursor and IDs');
  [rows]=await pool.execute("SELECT provider_id FROM (SELECT provider_id FROM ayambil_notification_outbox WHERE provider_id IS NOT NULL UNION SELECT provider_id FROM ayambil_message_queue WHERE provider_id IS NOT NULL) receipts WHERE provider_id IN ("+ids.map(()=>'?').join(',')+") ORDER BY provider_id",ids);
  if(rows.length!==ids.length)throw Error('Every receipt ID must exist in retained notification history');
 }else [rows]=await pool.execute("SELECT provider_id FROM (SELECT provider_id FROM ayambil_notification_outbox WHERE provider_id IS NOT NULL AND state IN ('accepted','sent') UNION SELECT provider_id FROM ayambil_message_queue WHERE provider_id IS NOT NULL AND status IN ('accepted','sent')) receipts WHERE provider_id>? ORDER BY provider_id LIMIT ?",[after,limit+1]);
 const items=[];let next=after,stopped=false;
 for(const row of rows.slice(0,ids?20:limit)){try{const result=await provider.status(row.provider_id);items.push({providerId:row.provider_id,status:result.status,observedAt:new Date().toISOString()});next=row.provider_id;}catch(e){items.push({providerId:row.provider_id,status:'unpolled',code:/^(PROVIDER_[A-Z0-9_]+|LOCAL_FLOW_BUDGET)$/.test(e.code||'')?e.code:'STATUS_UNAVAILABLE'});stopped=true;break;}}
 return {items,next,hasMore:stopped||!ids&&rows.length>limit,stopped,newSubmissions:0,writes:0};
}
