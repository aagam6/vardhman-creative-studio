import React from 'react';
import AyambilBookProgramme, { OfficialCredits } from '@/components/AyambilBookProgramme.jsx';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { CalendarDays, Clock, ArrowDown } from 'lucide-react';
import { ayambilProgramme } from '@/lib/ayambilProgramme';
import { contactConfig } from '@/lib/contactConfig';
import AyambilRegistration from '@/components/AyambilRegistration.jsx';
import { AyambilFooter, VenueCard, MananBeneficiaries } from '@/components/AyambilEventDetails.jsx';
import './AyambilPage.css';
import './AyambilEveningPage.css';

export default function AyambilEveningPage({ eventDate }) {
  const event = ayambilProgramme.find(e => e.date === eventDate);
  return <div className="ay-page ay-evening-page"><Helmet><title>{event.performer} — {event.titleEn} | {event.displayDate}</title><meta name="description" content={event.description + ' ' + event.displayDate + ', ' + event.time + ', ' + event.venue + '. Free evening registration.'} /><link rel="canonical" href={contactConfig.orgWebsite + '/500-akhand-ayambil-vijayollas/' + event.slug} /><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Serif+Gujarati:wght@400;500;600;700&display=swap" /><meta property="og:title" content={event.performer + ' — ' + event.displayDate} /><meta property="og:image" content={contactConfig.orgWebsite + event.portrait} /><meta property="og:description" content={event.description} /><meta property="og:url" content={contactConfig.orgWebsite + "/500-akhand-ayambil-vijayollas/" + event.slug} /><meta property="og:type" content="website" /><meta name="twitter:card" content="summary_large_image" /><meta name="twitter:title" content={event.performer + " — " + event.titleEn} /><meta name="twitter:description" content={event.description} /><meta name="twitter:image" content={contactConfig.orgWebsite + event.portrait} /></Helmet>
    <a className="ay-skip" href="#ay-registration">Skip to registration / ફોર્મ પર જાઓ</a>
    <div className="ay-announcement">Free evening presentation · <span lang="gu">સાંજનો કાર્યક્રમ · ફ્રી રજિસ્ટ્રેશન</span></div>
    <header className="ay-header ay-container"><Link to="/500-akhand-ayambil-vijayollas">← Three-day celebration / બધા કાર્યક્રમો</Link><Link to="/" className="ay-brand"><img src="/assets/logo.png" alt="" width="36" height="36" /><span>VARDHMAN<small>CREATIVE STUDIO</small></span></Link></header>
    <main><section className="ay-evening-hero ay-container" aria-labelledby="ay-evening-title"><div><p className="ay-eyebrow">500 Akhand Ayambil Tap · વિજયોત્સવ</p><p lang="gu" className="ay-identity-gu">૫૦૦ અખંડ આયંબિલ તપનો વિજયોત્સવ</p><p className="ay-evening-category">{event.category} · Evening presentation</p><h1 id="ay-evening-title">{event.performer}<span lang="gu" className="ay-gujarati">{event.title}</span></h1><p className="ay-programme-english">{event.titleEn}</p><p>{event.description}</p><p lang="gu">{event.descriptionGu}</p><div className="ay-facts"><span><CalendarDays size={18} aria-hidden="true" />{event.weekday}, {event.displayDate}</span><span><Clock size={18} aria-hidden="true" />{event.time} IST · સાંજે ૮ વાગ્યે</span></div><a className="ay-button" href="#ay-registration">Free Registration / ફ્રી રજિસ્ટ્રેશન <ArrowDown size={18} aria-hidden="true" /></a><p className="ay-help">Up to 6 passes per booking.</p></div><figure className="ay-evening-poster ay-evening-portrait"><img src={event.portrait} alt={event.performer} width="950" height="950" fetchPriority="high" /><figcaption><span>{event.performer}</span><a href={event.brochure} target="_blank" rel="noopener noreferrer">View programme brochure ↗</a></figcaption></figure></section>
    {eventDate === '2026-11-02' && <div className="ay-container"><MananBeneficiaries /><OfficialCredits /></div>}
    {eventDate === '2026-11-03' && <AyambilBookProgramme />}
    <AyambilRegistration key={eventDate} eventDate={eventDate} />
    <section className="ay-dedicated-location ay-container" aria-labelledby="ay-location-title"><p className="ay-eyebrow">Plan your visit / લોકેશન જુઓ</p><h2 id="ay-location-title">Place of Celebration / <span lang="gu">કાર્યક્રમનું સ્થળ</span></h2><VenueCard event={event} /></section>
    </main><AyambilFooter /></div>;
}
