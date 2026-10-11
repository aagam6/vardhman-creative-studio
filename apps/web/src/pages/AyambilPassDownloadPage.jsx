import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { registrationApi } from '@/lib/ayambilRegistration';
import { validatePassDownload } from '@/lib/ayambilApiResponse';
import AyambilDigitalPass from '@/components/AyambilDigitalPass.jsx';
import { AyambilFooter } from '@/components/AyambilEventDetails.jsx';
import './AyambilPage.css';
import '@/components/AyambilRegistration.css';
export default function AyambilPassDownloadPage() {
  const [passes,setPasses]=useState([]); const [error,setError]=useState(''); const [busy,setBusy]=useState(true);
  const [key,setKey]=useState(()=>window.location.hash.slice(1));
  useEffect(()=>{
    const receive=()=>{if(window.location.hash){setKey(window.location.hash.slice(1));window.history.replaceState(null,'',window.location.pathname);}};
    receive();window.addEventListener('hashchange',receive);
    return()=>window.removeEventListener('hashchange',receive);
  },[]);
  useEffect(()=>{
    let mounted=true;
    setBusy(true);setPasses([]);setError('');
    const unavailable='This private download link is unavailable or expired. Ask the organizer for help. / આ લિંક અત્યારે કામ કરતી નથી. મદદ માટે આયોજકને પૂછો.';
    if (!/^[a-zA-Z0-9]{64}$/.test(key)) { setError(unavailable); setBusy(false); return; }
    registrationApi('pass-download',{method:'POST',body:{key}})
      .then(data=>{const issued=validatePassDownload(data); if(mounted)setPasses(issued);})
      .catch(()=>{if(mounted){setPasses([]);setError(unavailable);}})
      .finally(()=>{if(mounted)setBusy(false);});
    return()=>{mounted=false;};
  },[key]);
  return <div className="ay-page"><Helmet><title>Download event pass | Vardhman Creative Studio</title><meta name="robots" content="noindex,nofollow" /><meta name="referrer" content="no-referrer" /></Helmet><main className="ay-container ay-registration"><h1>Your evening pass / તમારો ડિજિટલ પાસ</h1><p>Save your PDF. This private link grants access to one attendee's pass; share it only with that attendee. / પાસ ડાઉનલોડ કરી લો. આ ખાનગી લિંક ફક્ત આ પાસ પર નામ લખેલી વ્યક્તિ સાથે શેર કરો.</p>{busy&&<p role="status">Loading pass… / પાસ લોડ થઈ રહ્યો છે…</p>}{error&&<p role="alert">{error}</p>}{!busy&&!error&&passes.length===0&&<p role="status">No pass is available for this link. / આ લિંક માટે પાસ મળ્યો નથી.</p>}{passes.map(pass=><AyambilDigitalPass key={pass.number} pass={pass}/>)}<Link to="/500-akhand-ayambil-vijayollas">Event information / કાર્યક્રમની વિગતો</Link></main><AyambilFooter /></div>;
}
