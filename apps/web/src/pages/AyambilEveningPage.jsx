import React from 'react';
import {gujaratiEvening} from '@/lib/ayambilGujarati';
import AyambilBookProgramme, { OfficialCredits } from '@/components/AyambilBookProgramme.jsx';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';

import { ayambilProgramme } from '@/lib/ayambilProgramme';
import { contactConfig } from '@/lib/contactConfig';
import AyambilRegistration from '@/components/AyambilRegistration.jsx';
import { AyambilFooter, VenueCard, MananBeneficiaries } from '@/components/AyambilEventDetails.jsx';
import './AyambilPage.css';
import './AyambilEveningPage.css';

export default function AyambilEveningPage({ eventDate }) {
  const event = gujaratiEvening(ayambilProgramme.find(e => e.date === eventDate));
  const programmeStory = eventDate === '2026-11-02'
    ? {intro:'ભક્તિ, તપ અને દાદા પ્રત્યેનો ભાવ',description:'૫૦૦ અખંડ આયંબિલ તપના વિજયોત્સવમાં દાદા ઋષભને યાદ કરીએ. મનન સંઘવીની ભક્તિ સંધ્યા સાથે તપની આરાધનાનું બહુમાન કરીએ.',items:[['ભક્તિની ખાસ સાંજ','“એક શામ દાદા ઋષભ કે નામ” — મનન સંઘવી સાથે દાદા પ્રત્યેનો ભાવ વ્યક્ત કરવાનો અવસર.'],['તપસ્વીઓનું બહુમાન','પત્રિકા મુજબ અમદાવાદમાં ૧૦૦ ઓળી કરનાર અને ૫૦૦ સળંગ આયંબિલના તપસ્વીઓનું બહુમાન.'],['૫૦૦મી ધજાનો પ્રસંગ','સિદ્ધાચલ રાજાધિરાજ શ્રી આદીશ્વર દાદાની ૫૦૦મી ધજા નિમિત્તે આ ભક્તિ સંધ્યા.']]}
    : {intro:'મા માટેનો પ્રેમ, આપણા જીવનની વાત',description:'સાંઈરામ દવે સાથે મા, પરિવાર, માતૃભાષા અને આપણા મૂળને યાદ કરતી સાંજ. સરળ વાતો અને હાસ્ય સાથે જીવનના સંસ્કારને માણીએ.',items:[['મારી મા... મારો પ્રાણ','મા પ્રત્યેનો પ્રેમ અને પરિવાર સાથેના સંબંધોને યાદ કરાવતો ખાસ કાર્યક્રમ.'],['માતૃપૂજા પુસ્તકનો આધાર','પત્રિકા મુજબ પૂ.આ.શ્રી હેમચંદ્રસાગરસૂરિ મ. લિખિત “માતૃપૂજા પુસ્તક” પર આધારિત પ્રસ્તુતિ.'],['Be Care foodનું વિમોચન','રાજ ભાસ્કરના પુસ્તકનું વિમોચન — ભોજનનો બગાડ અટકાવવા અને અન્નનું માન રાખવાનો સંદેશ.']]};
  return <div className="ay-page ay-evening-page" lang="gu"><Helmet><title>{event.performer} — {event.title} | {event.displayDate}</title><meta name="description" content={event.descriptionGu + ' ' + event.displayDate + ', ' + event.time + ', ' + event.venue + '. Free evening registration.'} /><link rel="canonical" href={contactConfig.orgWebsite + '/500-akhand-ayambil-vijayollas/' + event.slug} /><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+Gujarati:wght@400;500;600;700&display=swap" /><meta property="og:title" content={event.performer + ' — ' + event.displayDate} /><meta property="og:image" content={contactConfig.orgWebsite + event.portrait} /><meta property="og:description" content={event.descriptionGu} /><meta property="og:url" content={contactConfig.orgWebsite + "/500-akhand-ayambil-vijayollas/" + event.slug} /><meta property="og:type" content="website" /><meta name="twitter:card" content="summary_large_image" /><meta name="twitter:title" content={event.performer + " — " + event.title} /><meta name="twitter:description" content={event.descriptionGu} /><meta name="twitter:image" content={contactConfig.orgWebsite + event.portrait} /></Helmet>
    <a className="ay-skip" href="#ay-registration">ફોર્મ પર જાઓ</a>
    <div className="ay-announcement"><span lang="gu">સાંજનો કાર્યક્રમ · ફ્રી રજિસ્ટ્રેશન</span></div>
    <header className="ay-header ay-container"><Link to="/500-akhand-ayambil-vijayollas">← બધા કાર્યક્રમો</Link><Link to="/" className="ay-brand"><img src="/assets/logo.png" alt="" width="36" height="36" /><span>વર્ધમાન<small>ક્રિએટિવ સ્ટુડિયો</small></span></Link></header>
    <main><section className="ay-evening-hero ay-container" aria-labelledby="ay-evening-title"><div><p lang="gu" className="ay-identity-gu">૫૦૦ અખંડ આયંબિલ તપનો વિજયોત્સવ</p><p className="ay-evening-category">{event.category}</p><h1 id="ay-evening-title">{event.performer}<span lang="gu" className="ay-gujarati">{event.title}</span></h1><p lang="gu">{event.descriptionGu}</p><div className="ay-facts"><span>{event.weekday}, {event.displayDate}</span><span>{event.time}</span><span className="ay-hero-venue">{event.venue}</span></div><a className="ay-button" href="#ay-registration">ફ્રી રજિસ્ટ્રેશન કરો</a><p className="ay-help">એક ફોર્મમાં ૬ લોકોના પાસ લઈ શકો છો.</p><div className="ay-hero-context"><span>આ સાંજની ખાસ વાત</span><p>{programmeStory.intro}</p></div></div><figure className="ay-evening-poster ay-evening-portrait"><img src={event.portrait} alt={event.performer} width="950" height="950" fetchPriority="high" /><figcaption><span>{event.performer}</span></figcaption></figure></section>
    <nav className="ay-evening-nav ay-container" aria-label="પેજના વિભાગો"><a href="#ay-registration">પાસ મેળવો</a><a href="#ay-location-title">સ્થળ જુઓ</a><a href="#ay-evening-help">પાસ વિશે જાણો</a></nav>
    <section className="ay-programme-story ay-container" aria-labelledby="ay-programme-story-title"><div className="ay-programme-story-heading"><p className="ay-eyebrow">કાર્યક્રમ વિશે</p><h2 id="ay-programme-story-title">{programmeStory.intro}</h2><p>{programmeStory.description}</p></div><div className="ay-programme-story-grid">{programmeStory.items.map(([title,text],index)=><article key={title}><span className="ay-story-number">૦{index+1}</span><h3>{title}</h3><p>{text}</p></article>)}</div></section>
    <AyambilRegistration key={eventDate} eventDate={eventDate} />
    {eventDate === '2026-11-02' && <div className="ay-container"><MananBeneficiaries /><OfficialCredits /></div>}
    {eventDate === '2026-11-03' && <AyambilBookProgramme />}

    <section className="ay-dedicated-location ay-container" aria-labelledby="ay-location-title"><p className="ay-eyebrow">અહીં કેવી રીતે પહોંચવું?</p><h2 id="ay-location-title"><span lang="gu">કાર્યક્રમનું સ્થળ</span></h2><VenueCard event={event} /></section>
    <section className="ay-evening-help ay-container" id="ay-evening-help"><p className="ay-eyebrow">તમારા સવાલોના જવાબ</p><h2>પાસ વિશે થોડી માહિતી</h2><details><summary>બંને સાંજ માટે એક જ પાસ ચાલશે?</summary><p>ના. દરેક સાંજ માટે અલગ રજિસ્ટ્રેશન અને અલગ પાસ જોઈએ.</p></details><details><summary>WhatsApp પર પાસ ન આવે તો શું કરવું?</summary><p>રજિસ્ટ્રેશન પછી પેજ પર મળેલો PDF પાસ ડાઉનલોડ કરીને સાચવી લો. WhatsApp સંદેશ આવવામાં સમય લાગી શકે છે.</p></details><details><summary>પ્રવેશ વખતે શું બતાવવું?</summary><p>તમારા નામનો ઇવેન્ટ પાસ અથવા WhatsApp કન્ફર્મેશન સાથે રાખો. બેઠક સ્થળની ક્ષમતા અને આયોજકોની વ્યવસ્થા મુજબ રહેશે.</p></details><details><summary>બીજા લોકોનાં નામ કેવી રીતે ઉમેરવા?</summary><p>પાસની સંખ્યા પસંદ કરો. પહેલો પાસ તમારા નામે બનશે. પછી સાથે આવનાર લોકોનાં પૂરાં નામ લખો.</p></details></section>
    </main><AyambilFooter /></div>;
}
