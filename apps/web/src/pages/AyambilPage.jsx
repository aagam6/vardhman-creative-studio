import React from 'react';
import AyambilBookProgramme from '@/components/AyambilBookProgramme.jsx';

import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowUpRight, CalendarDays, MapPin, Clock } from 'lucide-react';
import { AyambilFooter, EveningRegistrationChoices, PerformerPortrait, VenueCard, MananBeneficiaries, SairamBeneficiaries } from '@/components/AyambilEventDetails.jsx';
import { contactConfig } from '@/lib/contactConfig';
import { ayambilProgramme, ayambilBrochure } from '@/lib/ayambilProgramme';
import '@/components/AyambilRegistration.css';
import './AyambilPage.css';

const canonical = `${contactConfig.orgWebsite}/500-akhand-ayambil-vijayollas`;
const description = '500 Akhand Ayambil Tap — વિજયોત્સવ, 2–4 November 2026 in Ahmedabad. Explore Bhakti Sandhya with Manan Sanghvi, a special presentation by Sairam Dave, and Parna Mahotsav.';

function Ornament() {
  return <div className="ay-ornament" aria-hidden="true"><span />✧<span /></div>;
}

export default function AyambilPage() {
  const explore = (event) => {
    event.preventDefault();
    const target = document.getElementById('ay-programme');
    target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    target.focus({ preventScroll: true });
    window.history.replaceState(null, '', '#ay-programme');
  };

  return <div className="ay-page" id="ay-top">
    <Helmet>
      <title>500 Akhand Ayambil Tap — વિજયોત્સવ | 2–4 November 2026</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Serif+Gujarati:wght@400;500;600;700&display=swap" />
      <meta property="og:title" content="500 Akhand Ayambil Tap — વિજયોત્સવ" />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={`${contactConfig.orgWebsite}/assets/ayambil/invitation.jpeg`} />
      <meta property="og:image:secure_url" content={`${contactConfig.orgWebsite}/assets/ayambil/invitation.jpeg`} />
      <meta property="og:image:type" content="image/jpeg" />
      <meta property="og:image:width" content="1425" />
      <meta property="og:image:height" content="1425" />
      <meta property="og:image:alt" content="Original Gujarati Vijayollas invitation supplied for the event" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="500 Akhand Ayambil Tap — વિજયોત્સવ" />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${contactConfig.orgWebsite}/assets/ayambil/invitation.jpeg`} />
    </Helmet>
    <a className="ay-skip" href="#ay-main">Skip to event information</a>
    <div className="ay-announcement">A celebration of devotion & perseverance <span>2–4 November 2026 · Ahmedabad</span></div>
    <header className="ay-header ay-container">
      <Link to="/" className="ay-brand"><img src="/assets/logo.png" width="40" height="40" alt="" /><span>VARDHMAN<small>CREATIVE STUDIO</small></span></Link>
      <nav aria-label="Event navigation"><a href="#ay-about">Celebration / ઉજવણી</a><a href="#ay-programme">Programme / કાર્યક્રમ</a><a href="#ay-registration">Register / રજિસ્ટ્રેશન</a><a href="#ay-venues">Venues / સ્થળો <ArrowUpRight size={14} aria-hidden="true" /></a></nav>
    </header>
    <main id="ay-main">
      <section className="ay-hero ay-container" aria-labelledby="ay-heading">
        <div className="ay-hero-copy">
          <p className="ay-eyebrow">A sacred milestone · A shared celebration</p>
          <p className="ay-gujarati ay-invocation" lang="gu">॥ શ્રી વીતરાગાય નમઃ ॥</p>
          <h1 id="ay-heading" className="ay-english-title">500 Akhand Ayambil Tap</h1><p className="ay-official-title" lang="gu">વિજયોત્સવ</p>
          
          <p className="ay-gujarati ay-subtitle" lang="gu">૫૦૦ અખંડ આયંબિલ તપનો વિજયોત્સવ</p>
          <h2 className="ay-hero-statement">A Sacred Milestone.<br />A Celebration of Devotion.</h2>
          <p className="ay-hero-description">Join us for two special evenings of devotion, celebration and memorable presentations marking this important milestone.</p>
          <p lang="gu" className="ay-hero-description">આ ખાસ અવસરની ઉજવણીમાં જોડાઓ. ભક્તિ, આનંદ અને યાદગાર કાર્યક્રમોથી ભરેલી બે ખાસ સાંજ તમારી રાહ જોઈ રહી છે.</p>
          <div className="ay-facts"><span><CalendarDays size={17} aria-hidden="true" />2–4 November 2026</span><span><MapPin size={17} aria-hidden="true" />Ahmedabad, Gujarat</span></div>
          <div className="ay-hero-actions"><a className="ay-button ay-button-outline" href="#ay-programme" onClick={explore}>Explore the Programmes / કાર્યક્રમો જુઓ <ArrowDown size={17} aria-hidden="true" /></a><a className="ay-button" href="#ay-registration">Free Evening Registration / ફ્રી રજિસ્ટ્રેશન</a></div>
        </div>
        <figure className="ay-invitation"><div className="ay-image-frame"><img src="/assets/ayambil/invitation.jpeg" alt="Original Gujarati invitation celebrating the 500 Akhand Ayambil Tap of two Jain Munivars" width="1425" height="1425" fetchPriority="high" /></div><figcaption>THE ORIGINAL INVITATION <span>૫૦૦ અખંડ આયંબિલ · વિજયોત્સવ</span></figcaption></figure>
      </section>
      
      <section className="ay-intro ay-container" id="ay-about" aria-labelledby="ay-about-heading">
        <Ornament /><p className="ay-eyebrow">Faith. Discipline. Devotion.</p>
        <h2 id="ay-about-heading">A journey of tap.<br /><em>A moment of celebration.</em></h2><p lang="gu">બંને પૂજ્ય મુનિવરોના ૫૦૦ અખંડ આયંબિલ તપની ઉજવણીમાં ભક્તિ સંધ્યા, વિશેષ પ્રસ્તુતિ અને પારણાં મહોત્સવ યોજાશે.</p>
        <p>The invitation celebrates 500 uninterrupted Ayambil Tap undertaken by two Jain ascetic monks, Pujya Muni Shri Hemanshchandrasagarji Maharaj and Pujya Muni Shri Devarshichandrasagarji Maharaj. The celebration brings together bhakti, a special presentation and the concluding Parna Mahotsav.</p>
        <p className="ay-gujarati ay-munivars" lang="gu">પૂજ્ય મુનિ શ્રી હેમાંશચંદ્રસાગરજી મહારાજ<br />તથા પૂજ્ય મુનિ શ્રી દેવર્ષિચંદ્રસાગરજી મહારાજ</p>
      </section>
      <section className="ay-performers ay-container" aria-labelledby="ay-performers-heading"><p className="ay-eyebrow">Evenings to come together</p><h2 id="ay-performers-heading">Evening Presentations</h2><p lang="gu">સાંજના કાર્યક્રમો</p><div className="ay-performers-grid">{ayambilProgramme.filter(day => day.performer).map(day => <article key={day.day}><PerformerPortrait event={day} /><div><p className="ay-eyebrow">{day.displayDate} · {day.time}</p><h3>{day.performer}</h3><p className="ay-gujarati" lang="gu">{day.title}</p><p>{day.category}</p>{day.date === '2026-11-02' && <MananBeneficiaries />}{day.date === '2026-11-03' && <SairamBeneficiaries />}</div></article>)}</div></section>
      <AyambilBookProgramme />
      <section className="ay-programme-section" aria-labelledby="ay-programme">
        <div className="ay-container"><div className="ay-section-heading"><div><p className="ay-eyebrow">02 — 04 November · 2026</p><h2 id="ay-programme" tabIndex={-1}>Three days, one sacred celebration.</h2><p lang="gu">ત્રણ દિવસના કાર્યક્રમો</p></div><p>From an evening of devotion<br />to the joy of Parna.</p></div>
          <ol className="ay-timeline">{ayambilProgramme.map(day => <li key={day.date}><span>{day.day}</span><time dateTime={day.date}>{day.displayDate}</time><small>{day.category}</small></li>)}</ol>
          <div className="ay-programme-grid">{ayambilProgramme.map(day => <article key={day.date} className={`ay-programme-card ay-day-${day.day}`}>
            <div className="ay-card-top"><span>DAY {day.day}</span><span>{day.weekday}</span></div>
            <time className="ay-card-date" dateTime={day.date}>{day.displayDate}</time>
            <section className="ay-morning" aria-label={`Day ${day.day} morning programme`}>
              <p className="ay-eyebrow">Morning programme / સવારનો કાર્યક્રમ</p>
              <h3 className="ay-gujarati" lang="gu">{day.morning.title}</h3><p>{day.morning.titleEn}</p>
              <p className="ay-session-time">{day.morning.time || 'Morning · સમય આપેલો નથી'}{day.morning.time && ' · IST'}</p>
              <p lang={day.day !== '03' ? 'gu' : 'en'} className={day.day !== '03' ? 'ay-gujarati' : ''}>{day.morning.details}</p>
              <p><strong>{day.morning.venue || 'Location awaiting confirmation'}</strong>{day.morning.address && <><br />{day.morning.address}</>}</p>
            </section>
            <p className="ay-eyebrow">{day.day === '03' ? 'Concluding morning celebration' : 'Evening programme / સાંજનો કાર્યક્રમ'} · {day.category}</p>
            <h3 className="ay-gujarati" lang="gu">{day.title}</h3><p>{day.titleEn}</p>{day.subtitle && <p className="ay-gujarati" lang="gu">{day.subtitle}</p>}
            {day.performer ? <p className="ay-performer-name">{day.performer}</p> : <p className="ay-performer-name">Both Bal Tapasvi Munivars</p>}
            <p>{day.description}</p><p lang="gu">{day.descriptionGu}</p><div className="ay-card-time"><Clock size={16} aria-hidden="true" /><span>{day.time} <small>{day.day === '03' ? 'Parna Mahotsav' : 'Evening programme'} · IST</small></span></div>
            <div className="ay-card-venue"><MapPin size={17} aria-hidden="true" /><div><strong>{day.venue}</strong><p>{day.address}</p>{day.day === '03' && <small>Verified Parna location; other morning locations unconfirmed.</small>}</div></div>
            <details><summary>Brochure details / પત્રિકાની વિગતો</summary><p>{day.additional}</p><a href={day.brochure} target="_blank" rel="noopener noreferrer">View original Day {day.day} brochure <ArrowUpRight size={14} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a></details>
          </article>)}</div>
        </div>
      </section>
      <section className="ay-venues-section" id="ay-venues" aria-labelledby="ay-venues-heading"><div className="ay-container"><p className="ay-eyebrow">Meet in Ahmedabad</p><h2 id="ay-venues-heading">Places of Celebration / <span lang="gu">કાર્યક્રમના સ્થળો</span></h2><p lang="gu">તમારા કાર્યક્રમનું લોકેશન જુઓ.</p><div className="ay-venue-grid">{ayambilProgramme.map(day => <VenueCard key={day.date} event={day} />)}</div><p className="ay-source-note">Venue details transcribed from the supplied programme brochure. Please confirm the complete Day 3 morning schedule before making travel arrangements. / ૪ નવેમ્બરના સામૈયાનો સમય અને સ્થળ હજી કન્ફર્મ નથી. આવતાં પહેલાં તપાસી લો.</p></div></section>
      <EveningRegistrationChoices />
      
      <section className="ay-brochure ay-container" id="ay-brochure" aria-labelledby="ay-brochure-heading">
        <p className="ay-eyebrow">The complete original invitation</p><h2 id="ay-brochure-heading">Six pages of the celebration</h2>
        <p className="ay-brochure-intro">Read all six original pages. Select a poster to view it in full. / મૂળ પત્રિકાનાં છ પાનાં જુઓ. મોટું જોવા માટે પત્રિકા પર ક્લિક કરો.</p>
        <div className="ay-brochure-grid">{ayambilBrochure.map(image => <figure key={image.src}><a href={image.src} target="_blank" rel="noopener noreferrer" aria-label={`Open ${image.title} original (opens in a new tab)`}><img src={image.src} alt={image.alt} width="1425" height="1425" loading="lazy" decoding="async" /></a><figcaption>{image.title}<ArrowUpRight size={14} aria-hidden="true" /></figcaption></figure>)}</div>
      </section>

      <section className="ay-closing ay-container" aria-labelledby="ay-closing-heading"><Ornament /><p className="ay-eyebrow">With reverence & joy</p><h2 id="ay-closing-heading">Join the celebration.</h2><p lang="gu">આવો, સાથે મળીને ઉજવણી કરીએ.</p><p className="ay-gujarati" lang="gu">આ તપની ઉજવણીમાં જોડાવા પધારજો.</p><p>Come together to honour this spiritual milestone<br />and share in three days of devotion.</p><a className="ay-button ay-button-outline" href="#ay-programme" onClick={explore}>Programme / કાર્યક્રમ જુઓ <ArrowUpRight size={16} aria-hidden="true" /></a><small>2–4 November 2026 · Ahmedabad, Gujarat, India</small></section>
    </main>
    <AyambilFooter />
  </div>;
}
