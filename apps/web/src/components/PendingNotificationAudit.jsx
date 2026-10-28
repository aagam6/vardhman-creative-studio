import React,{useState} from 'react';
import {registrationApi} from '../lib/ayambilRegistration';
export default function PendingNotificationAudit(){
 const [data,setData]=useState(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
 async function load(){setBusy(true);setError('');try{const r=await registrationApi('admin/notification-outbox',{query:{audit:'pending'}});setData(r.pendingAudit);}catch(e){setError('Read-only audit unavailable. No message was requested. '+e.message);}finally{setBusy(false);}}
 return <details><summary>Modern awaiting records · read-only audit</summary><p>All awaiting records, not just the current page. Source checks only: no provider request, preparation, send, retry or receipt polling. Eligibility can change; a source-eligible result still requires fresh provider checks before sending.</p><button disabled={busy} onClick={load}>Audit modern awaiting records · no send</button>{error&&<p role="alert">{error}</p>}{data&&<><p>{data.total} records · no send requested</p><ul>{Object.entries(data.byReason).map(([reason,count])=><li key={reason}>{reason.replaceAll('_',' ')}: {count}</li>)}</ul><details><summary>Exact record IDs and reasons</summary><ul>{data.items.map(i=><li key={i.id}>{i.purpose} · {i.state} · attempts {i.attempts} · {i.reason.replaceAll('_',' ')}<small> {i.id}</small></li>)}</ul></details></>}</details>;
}
