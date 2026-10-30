import React,{useEffect,useRef,useState} from 'react';
import {registrationApi} from '@/lib/ayambilRegistration';
import {reviewedNotificationBatch,runNotificationBatch,shouldPauseNotificationOwner} from '@/lib/notificationReviewedBatch';
const storageKey='ayambil-reviewed-notification-progress-v1';
export default function NotificationReviewedBatch({onFinished,onBusy,externalBusy=false}){
 const [ids,setIds]=useState(''),[preview,setPreview]=useState(null),[busy,setBusy]=useState(false),[confirmed,setConfirmed]=useState(false),[error,setError]=useState(''),[results,setResults]=useState([]);const stop=useRef(false),lock=useRef(false);
 useEffect(()=>()=>{stop.current=true;},[]);
 useEffect(()=>{onBusy?.(busy);},[busy,onBusy]);
 const save=async(item,result)=>{const entry={id:item.id,purpose:item.purpose,round:item.round,...result,observedAt:new Date().toISOString()};setResults(r=>[...r,entry]);let previous=[];try{previous=JSON.parse(localStorage.getItem(storageKey)||'[]');}catch{throw Error('Local progress unavailable; reconcile before continuing');}localStorage.setItem(storageKey,JSON.stringify([...previous,entry].slice(-2000)));};
 async function review(){if(lock.current||externalBusy)return;lock.current=true;setBusy(true);setError('');setPreview(null);setConfirmed(false);try{
  const selected=ids.trim().split(/\s+/);if(!selected.length||selected.length>20||new Set(selected).size!==selected.length||selected.some(x=>!/^[a-f0-9-]{36}$/.test(x)))throw Error('Enter 1–20 distinct outbox IDs, one per line.');
  const found=[];let owner;
  for(let page=1;page<=100;page++){const data=await registrationApi('admin/notification-outbox',{query:{page}});if(!data.dispatchEnabled)throw Error('Dispatch is OFF. No batch can start.');if(owner&&(owner.version!==data.owner.version||owner.owner!==data.owner.owner))throw Error('Ownership changed while reviewing.');owner=data.owner;found.push(...data.items.filter(i=>selected.includes(i.id)));if(found.length===selected.length||!data.hasMore)break;}
  if(found.length!==selected.length)throw Error('Some IDs are unavailable. No send was attempted.');
  setPreview(reviewedNotificationBatch(selected.map(id=>found.find(i=>i.id===id)),owner));setResults([]);
 }catch(e){setError(e.message);}finally{setBusy(false);lock.current=false;}}
 async function send(){if(lock.current||externalBusy||!preview||!confirmed)return;lock.current=true;setBusy(true);setError('');stop.current=false;
  let outcome;
  try{outcome=await runNotificationBatch({preview,request:registrationApi,shouldStop:()=>stop.current,onResult:save});}
  catch{setError('Progress or transport could not be confirmed. Stop and reconcile durable outbox; do not retry blindly.');}
  finally{
   // Foreground batch owns only this reviewed revision. Never take over a changed owner.
   try{const data=await registrationApi('admin/notification-outbox');if(data.owner.owner==='bilingual'&&data.owner.version===preview.version&&shouldPauseNotificationOwner(outcome,data.transactionalWorker))await registrationApi('admin/notification-outbox/owner',{method:'POST',body:{owner:'paused',version:preview.version}});}catch{setError('Batch stopped; owner state could not be confirmed. Verify owner and dispatch before continuing.');}
   setPreview(null);setConfirmed(false);setBusy(false);lock.current=false;onFinished?.();
  }
 }
 return <details><summary>Reviewed foreground notification batch · no automatic resume</summary><p>Only exact, never-attempted outbox IDs of one purpose/round. Maximum 20 per action, sequential with 17-second spacing; existing server rate limits, current eligibility and durable dedup still apply. No worker, legacy queue or campaign backlog is activated. Keep this page open. Any unconfirmed result stops the batch. Errors/stops pause the owner. Successful completion preserves a verified active transactional worker; otherwise the owner pauses.</p><label>Reviewed outbox IDs (one per line)<textarea aria-label="Reviewed outbox IDs (one per line)" rows={4} value={ids} disabled={busy} onChange={e=>{setIds(e.target.value);setPreview(null);setConfirmed(false);}}/></label><button disabled={busy||externalBusy} onClick={review}>Review exact notification IDs · no send</button>{preview&&<><p>{preview.items.length} messages · {preview.items[0].purpose} · round {preview.items[0].round} · owner revision {preview.version}</p><label><input type="checkbox" checked={confirmed} disabled={busy} onChange={e=>setConfirmed(e.target.checked)}/>I reviewed this exact audience and authorize this bounded batch.</label><button disabled={busy||externalBusy||!confirmed} onClick={send}>Send reviewed notification batch once</button></>}<button disabled={!busy} onClick={()=>{stop.current=true;}}>Stop after current request · no retry</button>{error&&<p role="alert">{error}</p>}<ol aria-label="Foreground batch progress">{results.map((r,i)=><li key={i}>{r.id} · {r.status}{r.httpStatus?` · HTTP ${r.httpStatus}`:''}{r.requestId?` · Reference ${r.requestId}`:''}</li>)}</ol><p>Saved progress contains IDs/status only, never phone numbers, links, tokens or payloads. Refresh does not resume sending; re-audit durable state first.</p></details>;
}
