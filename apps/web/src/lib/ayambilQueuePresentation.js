export function queueNeedsReview(m){return ['uncertain','failed','preparing','sending'].includes(m.status)||(m.status==='queued'&&m.attempts>0);}
export function queueSummary(messages){return {loaded:messages.length,queued:messages.filter(m=>m.status==='queued'&&m.attempts===0).length,delivered:messages.filter(m=>['delivered','read'].includes(m.status)).length,review:messages.filter(queueNeedsReview).length};}
export function queueExplanation(m){
 if(m.status==='read')return 'Recipient read confirmed by provider.';
 if(m.status==='delivered')return 'Delivery confirmed by provider.';
 if(m.status==='uncertain')return 'Acceptance unknown. Reconcile with the provider; do not retry.';
 if(m.status==='accepted'||m.status==='sent')return 'Submitted to provider. Delivery is not confirmed yet.';
 if(m.status==='cancelled')return 'Cancelled. This message will not be sent.';
 if(m.status==='failed')return 'Failed. Review the failure before any further action.';
 if(m.status==='queued'&&m.attempts===0)return 'Waiting in queue. Not submitted to the provider.';
 return 'Prior processing or incomplete status. Operator review required; do not retry blindly.';
}
