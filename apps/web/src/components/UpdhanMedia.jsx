import React,{useEffect,useRef,useState} from 'react';
import {useUpdhanLanguage} from './UpdhanLanguage';
import {programmeText} from '@/lib/updhanProgramme';
import {videoStills} from '@/lib/updhanVideoStills';

export function UpdhanStillFigure({still,priority=false,className=''}){
 const {language}=useUpdhanLanguage();const text=value=>programmeText(value,language);
 const [open,setOpen]=useState(false);const dialog=useRef(null);
 useEffect(()=>{if(open&&!dialog.current?.open)dialog.current?.showModal();else if(!open&&dialog.current?.open)dialog.current.close();},[open]);
 const enlarge=text({hi:'पूरा चित्र देखें',en:'View full photograph',gu:'સંપૂર્ણ ચિત્ર જુઓ'});
 return <figure className={`vp-still-figure ${className}`}>
  <button data-updhan-track="gallery_open" type="button" className="vp-still-open" aria-label={`${enlarge}: ${text(still.title)}`} onClick={()=>setOpen(true)}><img src={still.src} width={still.width} height={still.height} alt={text(still.alt)} loading={priority?'eager':'lazy'} fetchPriority={priority?'high':'auto'}/></button>
  <figcaption><strong>{text(still.title)}</strong></figcaption>
  <dialog ref={dialog} className="vp-still-dialog" aria-label={text(still.title)} onCancel={()=>setOpen(false)} onClick={event=>{if(event.target===event.currentTarget)setOpen(false);}}><div className="vp-lightbox-header"><h2>{text(still.title)}</h2><button type="button" autoFocus onClick={()=>setOpen(false)}>{text({hi:'बंद करें',en:'Close',gu:'બંધ કરો'})}</button></div><img src={open?still.src:undefined} width={still.width} height={still.height} alt={text(still.alt)}/></dialog>
 </figure>;
}
export function UpdhanVideoGallery(){const {language}=useUpdhanLanguage();const text=value=>programmeText(value,language);return <section className="vp-section vp-photo-journal" id="gallery"><div className="vp-gallery-heading"><div><p className="vp-kicker">{text({hi:'तीर्थ की झलकियाँ',en:'Glimpses of the tirth',gu:'તીર્થની ઝલક'})}</p><h2>{text({hi:'पर्वत से मंदिर तक।',en:'From the hills to the temple.',gu:'પર્વતથી મંદિર સુધી.'})}</h2></div></div><div className="vp-gallery-grid"><UpdhanStillFigure still={videoStills.temple} className="vp-gallery-panorama"/><UpdhanStillFigure still={videoStills.darshan}/><UpdhanStillFigure still={videoStills.pillars}/><UpdhanStillFigure still={videoStills.mandap}/></div></section>;}
