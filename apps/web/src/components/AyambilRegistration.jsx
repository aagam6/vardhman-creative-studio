import React, { useEffect, useRef, useState } from 'react';
import { registrationAvailability } from '@/lib/ayambilExpressClient.js';
import { eveningConfig, registrationApi, requestKey, validateBooking } from '@/lib/ayambilRegistration';
import { Link } from 'react-router-dom';
import { ayambilTerms } from '@/lib/ayambilTerms';
import AyambilDigitalPass from './AyambilDigitalPass.jsx';
import './AyambilRegistration.css';


const emptyAttendee = date => ({ fullName: '', dates: [date] });

export default function AyambilRegistration({ eventDate }) {
  const session = eveningConfig.sessions.find(s => s.date === eventDate);
  const initialBooking = () => ({ contactName: '', occupation: '', referralSource: '', mobile: '', eventDate, whatsappConsent: false, termsAccepted: false, attendees: [emptyAttendee(eventDate)] });
  const [booking, setBooking] = useState(initialBooking);
  const [availability, setAvailability] = useState('loading'); const [step, setStep] = useState('details');
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false); const [confirmed, setConfirmed] = useState(false);
  const [receipt, setReceipt] = useState(null); const submission = useRef(null); const locked = useRef(false); const heading = useRef(null);
  const check = async () => {
    setAvailability('loading');
    try { const status = await registrationApi('status'); setAvailability(registrationAvailability(status)); }
    catch { setAvailability('unavailable'); }
  };
  useEffect(() => { check(); }, []);
  useEffect(() => { if (step !== 'details') heading.current?.focus(); }, [step]);
  const edit = next => { setBooking(next); submission.current = null; setConfirmed(false); setError(''); };
  const updateAttendee = (index, patch) => edit({ ...booking, attendees: booking.attendees.map((a, i) => i === index ? { ...a, ...patch } : a) });
  const review = event => { event.preventDefault(); const problem = validateBooking(booking); if (problem) { setError(problem); return; } setError(''); setStep('review'); };
  const submit = async () => {
    if (!confirmed || locked.current) return;
    const problem = validateBooking(booking); if (problem) { setError(problem); return; }
    locked.current = true; setBusy(true); setError('');
    if (!submission.current) submission.current = { ...booking, requestKey: requestKey() };
    try {
      const saved = await registrationApi('register', { method: 'POST', body: submission.current });
      if (!saved?.number || !Array.isArray(saved.attendees) || saved.attendees.length !== booking.attendees.length || saved.attendees.some(a => !Array.isArray(a.passes) || !a.passes.length)) throw new Error('Incomplete response');
      setReceipt(saved); setStep('success');
    } catch { setError('Registration could not be confirmed. Retry with these same details. / રજિસ્ટ્રેશન કન્ફર્મ થઈ શક્યું નથી. આ જ વિગતો સાથે ફરી પ્રયાસ કરો. કન્ફર્મેશન ન મળે ત્યાં સુધી બીજું રજિસ્ટ્રેશન શરૂ ન કરો.'); }
    finally { locked.current = false; setBusy(false); }
  };
  return <section className="ay-registration ay-container ay-guest-reservation" id="ay-registration" aria-labelledby="ay-registration-title">
    <header className="ay-registration-heading"><p className="ay-eyebrow">FREE EVENING REGISTRATION</p><h2 id="ay-registration-title" ref={heading} tabIndex={-1}>Reserve your evening pass</h2><p className="ay-registration-intro">An evening to remember. Reserve complimentary passes for up to two guests.</p></header>
    <div className="ay-registration-event"><div><strong>{session.performer}</strong><span lang="gu">{session.programme}</span></div><div><strong>{session.label} · {session.time}</strong><span>{session.venue.replace('Chandramauleshwar', 'Chandramaulishwar')}</span></div></div>
    <p className="ay-help">Your pass covers this evening only. Morning programmes and 4 November are separate.</p>
    <ol className="ay-registration-progress" aria-label="Registration steps">{[['details','Your details'],['review','Review booking'],['success','Save your pass']].map(([key,label],index) => <li key={key} aria-current={step===key ? 'step' : undefined}><span>{index+1}</span>{label}</li>)}</ol>

    {step !== 'success' && availability !== 'open' && <div className="ay-availability" role="status"><p>{availability === 'loading' ? 'Checking availability… / રજિસ્ટ્રેશન ચાલુ છે કે નહીં તે તપાસીએ છીએ…' : availability === 'closed' ? 'Registration is not open yet. / રજિસ્ટ્રેશન હજી શરૂ થયું નથી.' : 'Registration is unavailable. No booking is confirmed. / અત્યારે રજિસ્ટ્રેશન થઈ શકતું નથી. કોઈ રજિસ્ટ્રેશન કન્ફર્મ થયું નથી.'}</p>{availability !== 'loading' && <button type="button" onClick={check}>Check again / ફરી તપાસો</button>}</div>}
    {step === 'details' && <form onSubmit={review}>
      <fieldset disabled={busy || availability !== 'open'}><legend>Contact details</legend><div className="ay-form-grid">
        <label>Full name<input autoComplete="name" required minLength={2} maxLength={120} value={booking.contactName} onChange={e => edit({ ...booking, contactName: e.target.value })} /></label>
        <label>Mobile Number (WhatsApp)<input type="tel" inputMode="tel" autoComplete="tel" placeholder="+91" required value={booking.mobile} onChange={e => edit({ ...booking, mobile: e.target.value })} /><small>Please enter your active WhatsApp mobile number. Your registration confirmation and event pass will be sent to this number. Include your country code, e.g. +91.</small></label>
        <label>Number of Passes Required<select value={booking.attendees.length} onChange={e => edit({ ...booking, attendees: Number(e.target.value) === 1 ? booking.attendees.slice(0, 1) : [booking.attendees[0], booking.attendees[1] || emptyAttendee(eventDate)] })}><option value="1">1 pass</option><option value="2">2 passes</option></select><small>Up to two guests per booking.</small></label>
        <label>Occupation<input autoComplete="organization-title" maxLength={120} value={booking.occupation} onChange={e=>edit({...booking,occupation:e.target.value})}/><small>Optional</small></label>
        <label>How did you hear about this event?<select value={booking.referralSource} onChange={e=>edit({...booking,referralSource:e.target.value})}><option value="">Select an option (optional)</option><option>WhatsApp</option><option>Friends or family</option><option>Jain Sangh / community</option><option>Social media</option><option>Invitation brochure</option><option>Other</option></select></label>
      </div></fieldset>
      {booking.attendees.map((attendee, index) => <fieldset key={index} disabled={busy || availability !== 'open'}><legend>{index === 0 ? 'Primary participant' : 'Names of Additional Participants'}</legend>
        <label>Name on the pass<input autoComplete="off" required minLength={2} maxLength={120} value={attendee.fullName} onChange={e => updateAttendee(index, { fullName: e.target.value })} /></label>
        <p>{session.label} · {session.performer} · {session.venue.replace('Chandramauleshwar', 'Chandramaulishwar')}</p>
        {booking.attendees.length > 1 && <button type="button" onClick={() => edit({ ...booking, attendees: booking.attendees.filter((_, i) => i !== index) })}>Remove guest {index + 1}</button>}
      </fieldset>)}
      <p className="ay-help">Your details are used for this event. Each pass belongs to the named guest; share it only with them.</p>
      <details className="ay-terms"><summary>Terms & Conditions</summary><ol>{ayambilTerms.map(([en]) => <li key={en}><span>{en}</span></li>)}</ol><Link to="/privacy">Privacy policy</Link></details>
      <label className="ay-confirm"><input type="checkbox" required disabled={availability !== 'open'} checked={booking.termsAccepted} onChange={e => edit({ ...booking, termsAccepted: e.target.checked })} />By submitting this form, I confirm that I have read, understood, and agreed to all the Terms & Conditions.</label>
      <label className="ay-confirm"><input type="checkbox" required disabled={availability !== 'open'} checked={booking.whatsappConsent} onChange={e => edit({ ...booking, whatsappConsent: e.target.checked })} />I agree to receive event confirmation and passes on WhatsApp. This does not include marketing.</label>
      <div className="ay-form-actions"><button type="submit" className="ay-button" disabled={availability !== 'open'}>Review your booking</button></div>
    </form>}
    {step === 'review' && <div className="ay-review"><h3>Review your booking</h3><p>{session.label} · {session.time} · {session.performer}</p><p lang="gu">{session.programme}</p><p>{session.venue.replace('Chandramauleshwar', 'Chandramaulishwar')} · {session.address}</p><p>{booking.contactName} · {booking.mobile}</p><p>Occupation: {booking.occupation || "Not specified"} · Heard about the event: {booking.referralSource || "Not specified"}</p><p>WhatsApp consent and Terms & Conditions accepted.</p><ol>{booking.attendees.map((a, i) => <li key={i}><strong>{a.fullName}</strong><span>{session.label} · 8:00 PM IST</span></li>)}</ol>
      <label className="ay-confirm"><input type="checkbox" checked={confirmed} disabled={busy} onChange={e => setConfirmed(e.target.checked)} />I confirm the guest names and evening are correct.</label>
      <div className="ay-form-actions"><button type="button" disabled={busy} onClick={() => { setStep('details'); setConfirmed(false); }}>Edit details</button><button type="button" className="ay-button" disabled={!confirmed || busy} onClick={submit}>{busy ? 'Reserving your passes…' : 'Confirm reservation'}</button></div>
    </div>}
    {step === 'success' && receipt && <div className="ay-confirmation"><h3>{receipt.status === 'active' ? 'Registration confirmed / તમારું રજિસ્ટ્રેશન થઈ ગયું છે' : 'Booking cancelled / રજિસ્ટ્રેશન રદ થયું છે'}</h3><p>Booking number / રજિસ્ટ્રેશન નંબર: <strong>{receipt.number}</strong></p><p>WhatsApp confirmation status: <strong>{receipt.whatsapp?.status || 'not queued'}</strong>. Queued means awaiting the provider; it does not mean delivered. Save your PDF while confirmation is pending. / WhatsApp પર મોકલાવાની રાહ હોય તો પણ તમારો પાસ ડાઉનલોડ કરી રાખો.</p><p>Download and save each pass below. / દરેક વ્યક્તિનો ડિજિટલ પાસ ડાઉનલોડ કરી લો.</p>{receipt.attendees.flatMap(a => a.passes.filter(p => p.status !== 'superseded').map(pass => <AyambilDigitalPass key={pass.number} pass={pass} />))}<button type="button" onClick={() => { setReceipt(null); submission.current = null; setBooking(initialBooking()); setStep('details'); setConfirmed(false); check(); }}>Another booking / બીજું રજિસ્ટ્રેશન</button></div>}
    {error && <p className="ay-form-error" role="alert">{error}</p>}
  </section>;
}
