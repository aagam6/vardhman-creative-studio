import React,{useRef,useState} from 'react';
import {registrationApi} from '@/lib/ayambilRegistration';
export default function AyambilManualMessages({messages,busy,onRefresh,onError}) {
 const [selected,setSelected]=useState(null),[sending,setSending]=useState(false),[notice,setNotice]=useState('');
 const locked=useRef(false);
 const eligible=messages.filter(m=>m.manualSendingAvailable&&m.booking_id&&m.status==='queued'&&m.attempts===0&&['confirmation','pass','reminder'].includes(m.notification_type)&&!m.canVerifyProviderStatus);
 const send=async()=>{
  if(!selected||locked.current)return;
  locked.current=true;setSending(true);const job=selected;setSelected(null);setNotice('');
  try{const result=await registrationApi('admin/messages/send-selected',{method:'POST',body:{id:job.id,bookingId:job.booking_id,type:job.notification_type}});setNotice(`Message status: ${result.status}. Only delivered/read proves delivery.`);}
  catch{onError('Send could not be confirmed. Refresh and reconcile provider status before any retry.');}
  finally{await onRefresh();locked.current=false;setSending(false);}
 };
 return <section aria-label="Manual WhatsApp sending"><h2>Send a selected message</h2><p>Manual sending requires approved queue ownership and templates. No automatic sends. The server checks consent, booking validity, prior attempts and cutover eligibility.</p>{!eligible.length&&<p>No eligible messages loaded, or manual sending is disabled.</p>}{eligible.map(m=><div key={m.id}><span>{m.notification_type} · Booking {m.booking_id} · Message {m.id}</span><button type="button" disabled={busy||sending} onClick={()=>setSelected(m)}>Review & send</button></div>)}{selected&&<div className="ay-admin-confirm" role="group" aria-label="Confirm selected WhatsApp message"><p>Send this {selected.notification_type} message to the saved, consented booking contact? Message: {selected.id}</p><button type="button" disabled={sending} onClick={send}>Confirm send this message</button><button type="button" onClick={()=>setSelected(null)}>Cancel</button></div>}<p role="status">{sending?'Submitting selected message…':notice}</p></section>;
}
