// Known persisted receipts only. No message POST, queue state update or retry.
export async function observeKnownReceipts(pool,provider,{after='',limit=20}={}){
 if(typeof after!=='string'||after.length>200||!Number.isInteger(limit)||limit<1||limit>20)throw Error('Bounded receipt cursor required');
 const [rows]=await pool.execute("SELECT provider_id FROM (SELECT provider_id FROM ayambil_notification_outbox WHERE provider_id IS NOT NULL AND state IN ('accepted','sent') UNION SELECT provider_id FROM ayambil_message_queue WHERE provider_id IS NOT NULL AND status IN ('accepted','sent')) receipts WHERE provider_id>? ORDER BY provider_id LIMIT ?",[after,limit+1]);
 const items=[];let next=after,stopped=false;
 for(const row of rows.slice(0,limit)){try{const result=await provider.status(row.provider_id);items.push({providerId:row.provider_id,status:result.status,observedAt:new Date().toISOString()});next=row.provider_id;}catch(e){items.push({providerId:row.provider_id,status:'unpolled',code:/^(PROVIDER_[A-Z0-9_]+|LOCAL_FLOW_BUDGET)$/.test(e.code||'')?e.code:'STATUS_UNAVAILABLE'});stopped=true;break;}}
 return {items,next,hasMore:stopped||rows.length>limit,stopped,newSubmissions:0,writes:0};
}
