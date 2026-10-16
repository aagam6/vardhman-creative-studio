import React,{useEffect,useRef,useState} from 'react';
import AyambilDigitalPass,{createPassesPdf,saveFile} from './AyambilDigitalPass.jsx';
import {downloadableBookingPasses} from '@/lib/ayambilBookingPasses';

export default function AyambilBookingDownload({booking,disabled=false}) {
 const passes=downloadableBookingPasses(booking),holder=useRef(null),running=useRef(false);
 const [preparing,setPreparing]=useState(false),[message,setMessage]=useState('');
 useEffect(()=>{
  if(!preparing || running.current)return;
  running.current=true;
  const elements=[...holder.current.querySelectorAll('.ay-digital-pass')];
  createPassesPdf(elements,booking.number).then(saveFile).catch(()=>setMessage('PDF તૈયાર થઈ શક્યો નથી. ફરી પ્રયાસ કરો. / All passes could not be prepared; no partial file was downloaded.')).finally(()=>{running.current=false;setPreparing(false);});
 },[preparing,booking.number]);
 if(passes.length<2)return null;
 return <div className="ay-booking-download"><button type="button" disabled={disabled||preparing} onClick={()=>{setMessage('');setPreparing(true);}}>{preparing?'Preparing all passes… / PDF તૈયાર થાય છે…':`Download all ${passes.length} passes · બધા પાસ એક PDFમાં`}</button>{message&&<p role="alert">{message}</p>}{preparing&&<div ref={holder} aria-hidden="true" inert="" style={{position:'fixed',left:'-20000px',top:0,width:1000,pointerEvents:'none'}}>{passes.map(pass=><AyambilDigitalPass key={pass.number} pass={pass}/>)}</div>}</div>;
}
