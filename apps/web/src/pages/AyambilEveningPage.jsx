import React from 'react';
import {gujaratiEvening} from '@/lib/ayambilGujarati';
import AyambilBookProgramme, { OfficialCredits } from '@/components/AyambilBookProgramme.jsx';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { ArrowDown } from 'lucide-react';
import { ayambilProgramme } from '@/lib/ayambilProgramme';
import { contactConfig } from '@/lib/contactConfig';
import AyambilRegistration from '@/components/AyambilRegistration.jsx';
import { AyambilFooter, VenueCard, MananBeneficiaries } from '@/components/AyambilEventDetails.jsx';
import './AyambilPage.css';
import './AyambilEveningPage.css';

export default function AyambilEveningPage({ eventDate }) {
  const event = gujaratiEvening(ayambilProgramme.find(e => e.date === eventDate));
  return <div className="ay-page ay-evening-page" lang="gu"><Helmet><title>{event.performer} — {event.title} | {event.displayDate}</title><meta name="description" content={event.descriptionGu + ' ' + event.displayDate + ', ' + event.time + ', ' + event.venue + '. Free evening registration.'} /><link rel="canonical" href={contactConfig.orgWebsite + '/500-akhand-ayambil-vijayollas/' + event.slug} /><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+Gujarati:wght@400;500;600;700&display=swap" /><meta property="og:title" content={event.performer + ' — ' + event.displayDate} /><meta property="og:image" content={contactConfig.orgWebsite + event.portrait} /><meta property="og:description" content={event.descriptionGu} /><meta property="og:url" content={contactConfig.orgWebsite + "/500-akhand-ayambil-vijayollas/" + event.slug} /><meta property="og:type" content="website" /><meta name="twitter:card" content="summary_large_image" /><meta name="twitter:title" content={event.performer + " — " + event.title} /><meta name="twitter:description" content={event.descriptionGu} /><meta name="twitter:image" content={contactConfig.orgWebsite + event.portrait} /></Helmet>
    <a className="ay-skip" href="#ay-registration">ફોર્મ પર જાઓ</a>
    <div className="ay-announcement"><span lang="gu">સાંજનો કાર્યક્રમ · ફ્રી રજિસ્ટ્રેશન</span></div>
    <header className="ay-header ay-container"><Link to="/500-akhand-ayambil-vijayollas">← બધા કાર્યક્રમો</Link><Link to="/" className="ay-brand"><img src="/assets/logo.png" alt="" width="36" height="36" /><span>વર્ધમાન<small>ક્રિએટિવ સ્ટુડિયો</small></span></Link></header>
    <main><section className="ay-evening-hero ay-container" aria-labelledby="ay-evening-title"><div><p lang="gu" className="ay-identity-gu">૫૦૦ અખંડ આયંબિલ તપનો વિજયોત્સવ</p><p className="ay-evening-category">{event.category}</p><h1 id="ay-evening-title">{event.performer}<span lang="gu" className="ay-gujarati">{event.title}</span></h1><p lang="gu">{event.descriptionGu}</p><div className="ay-facts"><span>{event.weekday}, {event.displayDate}</span><span>{event.time}</span></div><a className="ay-button" href="#ay-registration">ફ્રી રજિસ્ટ્રેશન કરો <ArrowDown size={18} aria-hidden="true" /></a><p className="ay-help">એક ફોર્મમાં ૬ લોકોના પાસ લઈ શકો છો.</p></div><figure className="ay-evening-poster ay-evening-portrait"><img src={event.portrait} alt={event.performer} width="950" height="950" fetchPriority="high" /><figcaption><span>{event.performer}</span></figcaption></figure></section>
    <AyambilRegistration key={eventDate} eventDate={eventDate} />
    {eventDate === '2026-11-02' && <div className="ay-container"><MananBeneficiaries /><OfficialCredits /></div>}
    {eventDate === '2026-11-03' && <AyambilBookProgramme />}

    <section className="ay-dedicated-location ay-container" aria-labelledby="ay-location-title"><p className="ay-eyebrow">અહીં કેવી રીતે પહોંચવું?</p><h2 id="ay-location-title"><span lang="gu">કાર્યક્રમનું સ્થળ</span></h2><VenueCard event={event} /></section>
    </main><AyambilFooter /></div>;
}
