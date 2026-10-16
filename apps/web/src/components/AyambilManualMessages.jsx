import AyambilMessageIdentity from './AyambilMessageIdentity.jsx';
import React,{useRef,useState} from 'react';
import {registrationApi} from '@/lib/ayambilRegistration';
import {manualSendFailureNotice} from '@/lib/ayambilManualSendNotice';
export default function AyambilManualMessages({messages,busy,onRefresh,onError}) {
 const [selected,setSelected]=useState(null),[sending,setSending]=useState(false),[notice,setNotice]=useState('');
 const locked=useRef(false);
 const [reviewedLegacy,setReviewedLegacy]=useState(false);
 const eligible=messages.filter(m=>m.booking_id&&m.status==='queued'&&m.attempts===0&&['confirmation','pass','reminder'].includes(m.notification_type)&&!m.canVerifyProviderStatus);
 const send=async()=>{
  if(!selected||locked.current)return;
  locked.current=true;setSending(true);const job=selected;setSelected(null);setNotice('');
  try{const result=await registrationApi('admin/messages/send-selected',{method:'POST',body:{id:job.id,bookingId:job.booking_id,type:job.notification_type,...(reviewedLegacy?{reviewedLegacy:true}:{})}});setNotice(result.reason==='duplicate_confirmation'?'This booking already has a confirmation attempt. The duplicate was cancelled; no new message was sent.':`Message status: ${result.status}. Only delivered/read proves delivery.`);}
  catch(error){onError(manualSendFailureNotice(error));}
  finally{await onRefresh();locked.current=false;setSending(false);}
 };
 return <section aria-label="Manual WhatsApp sending"><h2>Send a selected message</h2><p>Manual sending requires approved queue ownership and templates. No automatic sends. The server checks consent, booking validity, prior attempts and cutover eligibility.</p>{!eligible.length&&<p>No unattempted booking messages loaded. Refresh message status to check. Attempted or uncertain jobs cannot be resent here.</p>}{eligible.map(m=><div key={m.id}><span><strong>{m.notification_type==='pass'?'Booking passes · one link':m.notification_type==='confirmation'?'Booking confirmation':'Event reminder'}</strong><AyambilMessageIdentity message={m}/><small>Message reference: {m.id}</small>{!m.manualSendingAvailable&&<small style={{display:'block',marginTop:8}}>Sending disabled: production manual approval, template policy and verified queue ownership are required.</small>}</span><button type="button" disabled={busy||sending||!m.manualSendingAvailable} onClick={()=>{setReviewedLegacy(false);setSelected(m);}}>Review & send</button></div>)}{selected&&<div className="ay-admin-confirm" role="group" aria-label="Confirm selected WhatsApp message"><AyambilMessageIdentity message={selected}/><p>Send this {selected.notification_type} message to the saved, consented booking contact? Message: {selected.id}</p><label><input type="checkbox" checked={reviewedLegacy} onChange={e=>setReviewedLegacy(e.target.checked)} /> I reviewed this exact older message and its booking contact. Allow sending before the activation boundary only if unattempted. Sending or uncertain jobs remain blocked.</label><button type="button" disabled={sending} onClick={send}>Confirm send this message</button><button type="button" onClick={()=>setSelected(null)}>Cancel</button></div>}<p role="status">{sending?'Submitting selected message…':notice}</p></section>;
}
