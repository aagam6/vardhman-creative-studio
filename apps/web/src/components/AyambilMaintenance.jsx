import React,{useEffect,useState} from 'react';
export default function AyambilMaintenance({maintenance}){
 const [now,setNow]=useState(Date.now());useEffect(()=>{const timer=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(timer);},[]);
 const remaining=Math.max(0,Math.ceil((Date.parse(maintenance.estimatedEnd)-now)/1000));
 return <div className="ay-availability" role="status"><h3>Booking under maintenance</h3><p>અત્યારે બુકિંગ થોડા સમય માટે બંધ છે. આપના અગાઉના બુકિંગ અને પાસ સુરક્ષિત છે.</p>{remaining>0?<p>અંદાજિત સમય: <strong>{Math.floor(remaining/60)}:{String(remaining%60).padStart(2,'0')}</strong></p>:<p>છેલ્લી તપાસ ચાલુ છે. બુકિંગ ફરી ચાલુ થાય ત્યાં સુધી રાહ જુઓ.</p>}<p>તપાસ પૂર્ણ થયા પછી બુકિંગ ફરી શરૂ થશે. આ પેજ આપમેળે સ્થિતિ તપાસશે.</p></div>;
}
