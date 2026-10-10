import React, {useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import AyambilDigitalPass from '../../apps/web/src/components/AyambilDigitalPass.jsx';
import '../../apps/web/src/pages/AyambilPage.css';
import '../../apps/web/src/components/AyambilRegistration.css';
function Preview(){
 const [pass,setPass]=useState(null),[result,setResult]=useState('Loading hosted test snapshot…');
 useEffect(()=>{fetch('/test-pass.json').then(r=>{if(!r.ok)throw Error();return r.json();}).then(p=>{setPass(p);setResult('Saved hosted test pass loaded.');}).catch(()=>setResult('Run the hosted download test first.'));},[]);
 return <main className="ay-page ay-container ay-registration"><h1>Isolated Supabase PDF test</h1><p>Synthetic data only. The live website remains on PocketBase.</p><p role="status">{result}</p>{pass&&<AyambilDigitalPass pass={pass}/>}</main>;
}
createRoot(document.getElementById('root')).render(<Preview/>);
