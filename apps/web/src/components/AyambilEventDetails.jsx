import {ayambilWhatsAppLink} from '@/lib/ayambilWhatsAppContact';
import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowUpRight } from 'lucide-react';
import { mananBeneficiaries, organisers } from '@/lib/ayambilOfficialCredits';
import { ayambilProgramme } from '@/lib/ayambilProgramme';
import { contactConfig } from '@/lib/contactConfig';
import AyambilInstructions from './AyambilInstructions.jsx';

export function PerformerPortrait({ event }) {
  return event.portrait ? <div className={`ay-artist-photo ay-portrait-frame${event.slug === 'manan-sanghvi' ? ' ay-portrait-manan' : ''}`}><img src={event.portrait} alt={`${event.performer}, ${event.category} performer`} width="240" height="300" loading="lazy" /></div> : <div className="ay-artist-photo ay-artist-photo-pending"><span>Artist photograph</span><small lang="gu">કલાકારનો ફોટો મળવાનો બાકી છે</small><span className="sr-only">{event.performer}: verified portrait required</span></div>;
}
export function MananBeneficiaries() {
  return <aside className="ay-manan-beneficiaries" aria-label="Manan Sanghvi evening beneficiaries"><h3 lang="gu">લાભાર્થી</h3><ul>{mananBeneficiaries.map(name => <li key={name} lang="gu">{name}</li>)}</ul></aside>;
}
export function SairamBeneficiaries() {
  return <aside className="ay-manan-beneficiaries" aria-label="Sairam Dave evening beneficiaries"><h3 lang="gu">લાભાર્થી</h3><ul>{organisers.map(name => <li key={name} lang="gu">{name}</li>)}</ul></aside>;
}
export function Directions({ event }) {
  return event.mapsUrl && <a className="ay-button ay-button-outline" href={event.mapsUrl} target="_blank" rel="noopener noreferrer" aria-label={`Get directions to ${event.venue} for ${event.performer} (opens in a new tab)`}><MapPin size={18} aria-hidden="true" /><span>Get Directions <span lang="gu">/ લોકેશન જુઓ</span></span><ArrowUpRight size={16} aria-hidden="true" /></a>;
}
export function VenueCard({ event }) {
  return <article className="ay-location-card"><p className="ay-eyebrow">{event.weekday} · {event.displayDate} · {event.time} IST</p><p>{event.performer || 'Parna Mahotsav'}</p><h3><MapPin size={20} aria-hidden="true" />{event.venue}</h3>{event.venueGu && <p lang="gu">{event.venueGu}</p>}<p>{event.address}</p>{event.addressGu && <p lang="gu">{event.addressGu}</p>}{event.venueNote && <p className="ay-venue-note">{event.venueNote}</p>}<Directions event={event} /></article>;
}
export function EveningRegistrationChoices() {
  return <section className="ay-evening-selection" id="ay-registration" aria-labelledby="ay-choice-title"><div className="ay-container"><p className="ay-eyebrow">Evening Presentations <span lang="gu">· સાંજના કાર્યક્રમો</span></p><h2 id="ay-choice-title">Free Evening Registration</h2><p className="ay-section-gu" lang="gu">સાંજના કાર્યક્રમ માટે ફ્રી રજિસ્ટ્રેશન</p><p>Choose the evening you wish to attend. Each evening has its own registration and digital passes. Registration is free.</p><p lang="gu">તમારે જે સાંજના કાર્યક્રમમાં આવવું હોય તે પસંદ કરો. બંને દિવસ માટે અલગ રજિસ્ટ્રેશન કરવાનું રહેશે. રજિસ્ટ્રેશન ફ્રી છે.</p><div className="ay-choice-grid">{ayambilProgramme.filter(e => e.performer).map(event => <article key={event.date} className="ay-choice-card"><div className="ay-choice-meta"><time dateTime={event.date}>{event.displayDate}</time><span>Free · ફ્રી</span></div><div className="ay-choice-artist"><PerformerPortrait event={event} /><div><h3>{event.performer}</h3><p lang="gu" className="ay-gujarati">{event.title}</p><p>{event.category} · {event.time} IST</p></div></div><p>{event.venue}<br /><span lang="gu">{event.venueGu}</span></p><p className="ay-choice-address">{event.address}</p>{event.date === '2026-11-02' && <MananBeneficiaries />}{event.date === '2026-11-03' && <SairamBeneficiaries />}<Link className="ay-button" to={`/500-akhand-ayambil-vijayollas/${event.slug}`}><span>Register for {event.day === '01' ? '2' : '3'} November<br /><span lang="gu">{event.day === '01' ? '૨' : '૩'} નવેમ્બર માટે રજિસ્ટ્રેશન</span></span><ArrowUpRight size={20} aria-hidden="true" /></Link><Directions event={event} /></article>)}</div><AyambilInstructions /><p className="ay-selection-note">One evening per booking · <span lang="gu">એક રજિસ્ટ્રેશન એક સાંજ માટે. સવારના કાર્યક્રમો અને ૪ નવેમ્બર માટે આ ફોર્મ નથી.</span></p></div></section>;
}
export function AyambilFooter() {
  return <footer className="ay-event-footer"><div className="ay-container"><div className="ay-footer-top"><Link to="/" className="ay-brand"><img src="/assets/logo.png" alt="" width="48" height="48" /><span>VARDHMAN<small>CREATIVE STUDIO</small></span></Link><p><strong lang="gu">વિજયોત્સવ</strong><br />500 Akhand Ayambil Tap<br />2–4 November 2026 · Ahmedabad</p><nav aria-label="Event footer"><a href={ayambilWhatsAppLink()} target="_blank" rel="noopener noreferrer">WhatsApp programme support</a><Link to="/500-akhand-ayambil-vijayollas">Celebration / કાર્યક્રમ</Link><Link to="/500-akhand-ayambil-vijayollas#ay-programme">Programmes / કાર્યક્રમો</Link>{ayambilProgramme.filter(e => e.performer).map(e => <React.Fragment key={e.date}><Link to={`/500-akhand-ayambil-vijayollas/${e.slug}`}>{e.performer} · {e.displayDate}</Link><a href={e.mapsUrl} target="_blank" rel="noopener noreferrer">{e.venue} · લોકેશન જુઓ</a></React.Fragment>)}<Link to="/privacy">Privacy Policy / પ્રાઇવસી પોલિસી</Link><Link to="/terms">Terms of Service</Link>{contactConfig.orgSocials.map((url, index) => <a key={url} href={url} target="_blank" rel="noopener noreferrer">{new URL(url).hostname.replace('www.', '')}<span className="sr-only"> social link {index + 1} (opens in a new tab)</span></a>)}</nav></div><p className="ay-copyright">© {new Date().getFullYear()} Vardhman Creative Studio. All rights reserved.</p></div></footer>;
}
