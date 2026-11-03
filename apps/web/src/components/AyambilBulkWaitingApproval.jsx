import React, {useEffect, useRef, useState} from 'react';
import {collectWaitingApprovalPlan, waitingApprovalPlan, approveWaitingPlan} from '@/lib/ayambilWaitingApproval.js';
import {registrationApi} from '@/lib/ayambilRegistration';

export default function AyambilBulkWaitingApproval({items, selectedIds, filters, disabled, onRunningChange, onChanged}) {
  const [plan,setPlan]=useState(null),[results,setResults]=useState([]),[error,setError]=useState(''),[running,setRunning]=useState(false),[finished,setFinished]=useState(false);
  const lock=useRef(false),consumed=useRef(false),stop=useRef(false),dialog=useRef(null);
  useEffect(()=>{if(plan)dialog.current?.focus();},[plan]);
  useEffect(()=>()=>{stop.current=true;},[]);
  const review=async all=>{
    if(lock.current)return;lock.current=true;consumed.current=false;setPlan(null);setError('');setResults([]);setFinished(false);onRunningChange(true);
    try{setPlan(all?await collectWaitingApprovalPlan(registrationApi,filters):waitingApprovalPlan(items.filter(b=>selectedIds.includes(b.id))));}
    catch(e){setError(e.message);}finally{lock.current=false;onRunningChange(false);}
  };
  const approve=async()=>{
    if(lock.current||consumed.current)return;lock.current=true;consumed.current=true;stop.current=false;setRunning(true);onRunningChange(true);setError('');
    try{const outcome=await approveWaitingPlan(registrationApi,plan,setResults,()=>stop.current);setResults(outcome.results);setFinished(true);}
    finally{lock.current=false;setRunning(false);onRunningChange(false);await onChanged();}
  };
  const selected=items.filter(b=>selectedIds.includes(b.id));
  return <section className="ay-bulk-waiting" aria-label="Bulk waiting approval">
    <strong>Waiting group approval</strong><p>Approve whole families using the existing capacity-checked transaction. Approval creates passes and one approval/combined-pass notification intent; delivery is handled by the configured sender. This does not send Entry timing or YouTube notices.</p>
    <div className="ay-form-actions"><button type="button" disabled={disabled||!selected.length||selected.some(b=>b.status!=='waiting')} onClick={()=>review(false)}>Review selected waiting groups ({selected.filter(b=>b.status==='waiting').length})</button>
    <button type="button" disabled={disabled||!filters.date||filters.status!=='waiting'} onClick={()=>review(true)}>Review all filtered waiting · all pages</button></div>
    <p>Select one evening and Waiting, then select groups or review all pages. The all-pages review uses the applied evening/search and includes every waiting group, regardless of message filters. Each group is atomic; the whole batch is not one transaction.</p>
    {error&&<p role="alert">{error}</p>}
    {plan&&<section role="dialog" aria-modal="false" aria-labelledby="ay-bulk-approval-title" tabIndex={-1} ref={dialog}>
      <h3 id="ay-bulk-approval-title">Review bulk approval · {plan.eventDate==='2026-11-03'?'Sairam · 3 Nov':'Manan · 2 Nov'}</h3>
      <p><strong>{plan.items.length} groups · {plan.persons} persons</strong>. Fixed list captured for this action. Every group is rechecked on the server; no capacity bypass or partial family approval. Stops at the first blocked/unconfirmed result without automatic retry.</p>
      <details><summary>Selected waiting references</summary><ul>{plan.items.map(b=><li key={b.id}>{b.number} · {b.contactName} · {b.persons} persons</li>)}</ul></details>
      {!finished&&<button type="button" disabled={running||disabled} onClick={approve}>Approve {plan.items.length} whole waiting groups</button>}
      {running&&<button type="button" onClick={()=>{stop.current=true;}}>Stop after current group</button>}
      <p role="status">{results.filter(r=>r.state==='approved').length} approvals confirmed · {results.filter(r=>r.state==='blocked').length} blocked · {results.filter(r=>r.state==='unconfirmed').length} unconfirmed · {plan.items.length-results.length} not attempted{running?' · approving sequentially…':''}</p>
      {results.some(r=>r.state!=='approved')&&<p role="alert">Batch stopped. A browser timeout is not proof of failure. Check refreshed booking status before a new approval action.</p>}
      {results.length>0&&<details><summary>Approval results</summary><ul>{results.map(r=><li key={r.id}>{r.number} · {r.state}{r.bookingNumber?` · ${r.bookingNumber}`:''}{r.reason?` · ${r.reason}`:''}</li>)}</ul></details>}
      <button type="button" disabled={running} onClick={()=>{setPlan(null);setResults([]);}}>Close review</button>
    </section>}
  </section>;
}
