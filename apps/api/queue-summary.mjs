export function queueSummary(jobs) {
  const counts={};let attempts=0;
  for(const job of jobs){counts[job.status]=(counts[job.status]||0)+1;attempts+=Number(job.attempts)||0;}
  const status=!jobs.length?'no messages queued':Object.entries(counts).map(([state,n])=>`${state}: ${n}`).join(', ');
  return {status,attempts,history:jobs.map(j=>({at:j.updated_at,type:j.notification_type,status:j.status,attempts:Number(j.attempts)||0})),counts};
}
