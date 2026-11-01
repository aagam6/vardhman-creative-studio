import React,{useState} from 'react';
export default function UpdhanPrivatePhoto({id}){
 const [failed,setFailed]=useState(false),[attempt,setAttempt]=useState(0);
 return <div className="um-private-photo">{failed?<div role="alert"><p>फोटो लोड नहीं हुआ। Session या private storage की जाँच करें।</p><button onClick={()=>{setFailed(false);setAttempt(v=>v+1);}}>फिर लोड करें</button></div>:<img alt="Private applicant photograph" src={`/api/updhan/admin/photo/${encodeURIComponent(id)}?view=${attempt}`} onError={()=>setFailed(true)}/>}</div>;
}
