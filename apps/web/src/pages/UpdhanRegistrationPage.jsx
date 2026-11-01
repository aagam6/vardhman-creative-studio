import React from 'react';
import UpdhanSeoHead from '@/components/UpdhanSeoHead';
import {Link} from 'react-router-dom';
import UpdhanRegistration from '@/components/UpdhanRegistration';
import UpdhanMeasurement,{trackUpdhanClick} from '@/components/UpdhanMeasurement';
import {UpdhanLanguageProvider,UpdhanLanguageButtons,useUpdhanLanguage,localizeUpdhanTree} from '@/components/UpdhanLanguage';
import './UpdhanDesign.css';
import './UpdhanPaperForm.css';

export default function UpdhanRegistrationPage(){return <UpdhanLanguageProvider><RegistrationContent /></UpdhanLanguageProvider>;}
function RegistrationContent(){
 const {language}=useUpdhanLanguage();
 return localizeUpdhanTree(<div className="vp-page vp-form-page" lang={language} onClickCapture={trackUpdhanClick}>
  <UpdhanSeoHead registration/>
  <a className="vp-skip" href="#application">मुख्य जानकारी पर जाएँ</a>
  <div className="vp-utility"><div className="vp-topline"><span>॥ श्री वीतरागाय नमः ॥</span><span>अचलगढ़ · राजस्थान · 2027</span></div><UpdhanLanguageButtons/></div>
  <header className="vp-header"><Link className="vp-brand" to="/vijaypataka-updhan-mahotsav"><span>विजयपताका<small>उपधान महोत्सव · 2027</small></span></Link><Link data-updhan-track="back_programme" className="vp-back-link" to="/vijaypataka-updhan-mahotsav">कार्यक्रम की जानकारी</Link></header>
  <main id="application" className="vp-application-layout">
   <section className="vp-paper-intro"><div><p className="vp-kicker">विजयपताका · उपधान महोत्सव 2027</p><h1>{language==='en'?'Your spiritual journey begins here':language==='gu'?'સાધનાની યાત્રાનું પ્રથમ પગલું':'साधना की यात्रा का पहला कदम'}</h1><p className="vp-paper-lead">25 अप्रैल — 12 जून 2027<br/>अचलगढ़, राजस्थान</p><div className="vp-paper-facts"><span>{language==='en'?'Stay & meals · Free':language==='gu'?'આવાસ અને ભોજન · નિઃશુલ્ક':'आवास और भोजन · निःशुल्क'}</span><span>{language==='en'?'Photo · Up to 2 MB':language==='gu'?'ફોટો · 2 MB સુધી':'फोटो · अधिकतम 2 MB'}</span></div><a data-updhan-track="form_anchor" className="vp-btn" href="#registration-sheet">{language==='en'?'Fill application':language==='gu'?'ફોર્મ ભરો':'फॉर्म भरें'}</a><details className="vp-form-before"><summary>भरने से पहले</summary><ul><li>अपना फोटो तैयार रखें — JPG, PNG या WEBP, अधिकतम 2 MB।</li><li>मोबाइल नंबर और पता तैयार रखें।</li><li>रिफ्रेश करने पर बिना भेजी जानकारी मिट जाएगी।</li></ul><p>आवेदन प्राप्त होना प्रवेश की स्वीकृति नहीं है।</p></details></div><figure><img src="/assets/updhan-video/aerial-03m45s.webp" alt={language==='en'?'Achalgarh among the hills':language==='gu'?'પહાડીઓ વચ્ચે અચલગઢ':'पहाड़ियों के बीच अचलगढ़'} width="1920" height="1080"/><figcaption>{language==='en'?'Achalgarh, Rajasthan':language==='gu'?'અચલગઢ, રાજસ્થાન':'अचलगढ़, राजस्थान'}</figcaption></figure></section>
   <div id="registration-sheet"><UpdhanRegistration/></div>
  </main>
  <UpdhanMeasurement/>
  <footer className="vp-footer"><Link to="/vijaypataka-updhan-mahotsav">कार्यक्रम की जानकारी पर वापस जाएँ</Link><p>Vardhman Creative Studio</p></footer>
 </div>,language);
}
