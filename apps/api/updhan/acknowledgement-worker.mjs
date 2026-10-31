// Persistence contract: claim must commit a single-job lease; intent must commit
// BEFORE POST; terminal/uncertain jobs are never claimable. No scheduler starts
// here. The production repository must implement the reviewed schema contract.
export function createAcknowledgementWorker({repository,provider,enabled=false}){
 return {async process(id){
  if(!enabled)return {state:'disabled'};
  const job=await repository.claimAcknowledgement(id);if(!job)return {state:'not_claimed'};
  if(job.type!=='application_received'||job.whatsappConsent!==true||['cancelled','trashed','rejected'].includes(job.applicationStatus))throw Error('Acknowledgement not eligible');
  let payload;try{payload=await provider.prepare({name:job.name,reference:job.reference,to:job.to});}catch(error){if(error.code==='shared_rate_budget_unavailable'&&repository.deferPreflight){await repository.deferPreflight(job);return {state:'deferred'};}await repository.finish(job,{state:'failed',failureCode:error.code||'preflight_failed'});return {state:'failed'};}
  await repository.commitIntent(job);
  let outcome;try{outcome=await provider.sendPrepared(payload);}catch(error){outcome={state:error.rejected?'failed':'uncertain',failureCode:error.code||'acceptance_unknown'};}
  // If this persistence step fails after POST, the durable intent remains and
  // recovery must mark it uncertain; do not issue another send.
  await repository.finish(job,outcome);return outcome;
 },async reconcile(id){if(!enabled)return {state:'disabled'};const job=await repository.reconcilable(id);if(!job?.providerReference)return {state:'manual_reconciliation_required'};const result=await provider.status(job.providerReference);await repository.recordDelivery(job,result);return result;}};
}
