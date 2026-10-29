// Dependency-injected status-only audit. No queue reconciliation or writes.
export async function auditKnownReceipts({records,provider,observe,pace,max=20}){
 if(!Array.isArray(records)||!Number.isInteger(max)||max<1||max>20||typeof observe!=='function'||typeof pace!=='function')throw Error('Bounded read-only audit inputs required');
 const ids=[...new Set(records.map(r=>r.providerId).filter(Boolean))];
 if(ids.some(id=>typeof id!=='string'||id.length>200))throw Error('Invalid provider ID');
 const outcomes=[];
 for(const providerId of ids.slice(0,max)){
  await pace(); // Existing shared budget/cooldown must permit this GET.
  try{const result=await provider.messageStatus(providerId);const row={providerId,status:result.status,observedAt:new Date().toISOString()};await observe(row);outcomes.push(row);}
  catch(e){const row={providerId,status:'unpolled',code:/^(?:PROVIDER_[A-Z0-9_]+|LOCAL_FLOW_BUDGET)$/.test(e.code||'')?e.code:'STATUS_UNAVAILABLE',observedAt:new Date().toISOString()};await observe(row);outcomes.push(row);return {outcomes,stopped:true,remaining:ids.length-outcomes.filter(r=>r.status!=='unpolled').length,newSubmissions:0};}
 }
 return {outcomes,stopped:false,remaining:ids.length-outcomes.length,newSubmissions:0};
}
