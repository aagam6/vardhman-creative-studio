export function updhanAdminOverview(summary){
 if(!summary)return null;
 const counts=summary.counts||{},messages=summary.messages||{};
 const n=v=>Number.isFinite(Number(v))?Number(v):0;
 return {total:Object.values(counts).reduce((a,v)=>a+n(v),0),today:summary.activity?.newToday??null,review:n(counts.received)+n(counts.under_review),approved:n(counts.approved),waiting:n(counts.waitlisted),queued:n(messages.queued)+n(messages.preparing),delivery:n(messages.submitted),sending:n(messages.sending),failed:n(messages.failed),uncertain:n(messages.uncertain),trash:n(counts.trashed)};
}
