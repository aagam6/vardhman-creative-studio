import React from 'react';
import {Link} from 'react-router-dom';
import { updhanConfig, getYoutubeEmbedUrl } from '@/lib/updhanConfig';
import {useUpdhanLanguage,localizeUpdhanTree} from './UpdhanLanguage';
import {updhanApplicationPath} from '@/lib/updhanMarketing';

export function UpdhanTrailer() {
  const {language}=useUpdhanLanguage();
  const applicationPath=updhanApplicationPath(window.location.href);
  const videoUrl = getYoutubeEmbedUrl(updhanConfig.youtubeUrl);

  return localizeUpdhanTree(<>
    <section id="video" className="vp-section vp-video-section">

      <div className="vp-video-heading"><div><p className="vp-kicker">अचलगढ़ का परिचय</p><h2>{videoUrl?'अचलगढ़ को करीब से जानें।':'शिखर से भीतर की ओर।'}</h2></div><p>विजयपताका – उपधान – महोत्सव<br />अचलगढ़ · 25 अप्रैल — 14 जून 2027</p></div>
      <div className={videoUrl?'vp-video-player':'vp-video-pending'}>{videoUrl ? <iframe src={videoUrl} title="अचलगढ़ तीर्थ का परिचय · YouTube वीडियो" loading="lazy" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /> : <><span className="vp-pending-label">कार्यक्रम का वीडियो</span><p>प्रकृति, पावन सान्निध्य और उपधान की साधना का परिचय।</p></>}</div>
    {videoUrl&&<p className="vp-video-external"><a href={updhanConfig.youtubeUrl} target="_blank" rel="noopener noreferrer">{language==='gu'?'YouTube પર જુઓ':language==='en'?'Watch on YouTube':'YouTube पर देखें'}</a></p>}</section>

  </>,language);
}

export default function UpdhanParticipation(){const {language}=useUpdhanLanguage();const applicationPath=updhanApplicationPath(window.location.href);return localizeUpdhanTree(<>    <section id="registration" className="vp-registration"><div className="vp-section vp-registration-inner"><div><p className="vp-kicker">पंजीकरण</p><h2>उपधान की इस यात्रा में<br /><em>आपका स्वागत है।</em></h2><p className="vp-registration-help">फॉर्म भरें। आपकी जानकारी देखने के बाद टीम प्रवेश की सूचना देगी।</p></div><div className="vp-application-card"><h3>आवेदन के लिए अलग, सरल फॉर्म।</h3><p>पाँच चरणों में जानकारी भरें। आवेदन प्राप्त होना प्रवेश की स्वीकृति नहीं है।</p><Link data-updhan-track="section_apply" className="vp-btn" to={applicationPath}>आवेदन फॉर्म देखें</Link></div></div></section></>,language);}
