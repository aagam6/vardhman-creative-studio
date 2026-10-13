import React from 'react';
import AyambilBookProgramme, { OfficialCredits } from '@/components/AyambilBookProgramme.jsx';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { CalendarDays, Clock, ArrowDown } from 'lucide-react';
import { ayambilProgramme } from '@/lib/ayambilProgramme';
import { contactConfig } from '@/lib/contactConfig';
import AyambilRegistration from '@/components/AyambilRegistration.jsx';
import { AyambilFooter, PerformerPortrait, VenueCard, MananBeneficiaries } from '@/components/AyambilEventDetails.jsx';
import './AyambilPage.css';
import './AyambilEveningPage.css';

export default function AyambilEveningPage({ eventDate }) {
  const event = ayambilProgramme.find(e => e.date === eventDate);
  return <div className="ay-page ay-evening-page"><Helmet><title>{event.performer} — {event.titleEn} | {event.displayDate}</title><meta name="description" content={event.description + ' ' + event.displayDate + ', ' + event.time + ', ' + event.venue + '. Free evening registration.'} /><link rel="canonical" href={contactConfig.orgWebsite + '/500-akhand-ayambil-vijayollas/' + event.slug} /><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Serif+Gujarati:wght@400;500;600;700&display=swap" /><meta property="og:title" content={event.performer + ' — ' + event.displayDate} /><meta property="og:image" content={contactConfig.orgWebsite + event.brochure} /></Helmet>
    <a className="ay-skip" href="#ay-registration">Skip to registration / ફોર્મ પર જાઓ</a>
    <div className="ay-announcement">Free evening presentation · <span lang="gu">સાંજનો કાર્યક્રમ · ફ્રી રજિસ્ટ્રેશન</span></div>
    <header className="ay-header ay-container"><Link to="/500-akhand-ayambil-vijayollas">← Three-day celebration / બધા કાર્યક્રમો</Link><Link to="/" className="ay-brand"><img src="/assets/logo.png" alt="" width="36" height="36" /><span>VARDHMAN<small>CREATIVE STUDIO</small></span></Link></header>
    <main><section className="ay-evening-hero ay-container" aria-labelledby="ay-evening-title"><div><p className="ay-eyebrow">500 Akhand Ayambil Tap · વિજયોત્સવ</p><p lang="gu" className="ay-identity-gu">૫૦૦ અખંડ આયંબિલ તપનો વિજયોત્સવ</p><div className="ay-evening-artist"><PerformerPortrait event={event} /><p>{event.category}<br /><span lang="gu">સાંજના કાર્યક્રમો</span></p></div><h1 id="ay-evening-title">{event.performer}<span lang="gu" className="ay-gujarati">{event.title}</span></h1><p className="ay-programme-english">{event.titleEn}</p><p>{event.description}</p><p lang="gu">{event.descriptionGu}</p><div className="ay-facts"><span><CalendarDays size={18} aria-hidden="true" />{event.weekday}, {event.displayDate}</span><span><Clock size={18} aria-hidden="true" />{event.time} IST · સાંજે ૮ વાગ્યે</span></div><a className="ay-button" href="#ay-registration">Free Registration / ફ્રી રજિસ્ટ્રેશન <ArrowDown size={18} aria-hidden="true" /></a><p className="ay-help">Maximum 2 attendees · એક રજિસ્ટ્રેશનમાં વધુમાં વધુ ૨ લોકો.</p></div><figure className="ay-evening-poster"><a href={event.brochure} target="_blank" rel="noopener noreferrer" aria-label={'Open original poster for ' + event.performer + ' (opens in a new tab)'}><img src={event.brochure} alt={'Original Day ' + event.day + ' poster, including morning and evening programmes'} width="950" height="950" /></a><figcaption>Original programme poster / મૂળ કાર્યક્રમ પત્રિકા</figcaption></figure></section>
    {eventDate === '2026-11-02' && <div className="ay-container"><MananBeneficiaries /><OfficialCredits /></div>}
    {eventDate === '2026-11-03' && <AyambilBookProgramme />}
    <AyambilRegistration key={eventDate} eventDate={eventDate} />
    <section className="ay-dedicated-location ay-container" aria-labelledby="ay-location-title"><p className="ay-eyebrow">Plan your visit / લોકેશન જુઓ</p><h2 id="ay-location-title">Place of Celebration / <span lang="gu">કાર્યક્રમનું સ્થળ</span></h2><VenueCard event={event} /></section>
    </main><AyambilFooter /></div>;
}
