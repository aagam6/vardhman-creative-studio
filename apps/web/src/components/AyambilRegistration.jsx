import React, { useEffect, useRef, useState } from 'react';
import { registrationAvailability } from '@/lib/ayambilExpressClient.js';
import { eveningConfig, registrationApi, requestKey, validateBooking } from '@/lib/ayambilRegistration';
import { Link } from 'react-router-dom';
import { ayambilTerms } from '@/lib/ayambilTerms';
import AyambilDigitalPass from './AyambilDigitalPass.jsx';
import './AyambilRegistration.css';
import AyambilInstructions from './AyambilInstructions.jsx';

const emptyAttendee = date => ({ fullName: '', dates: [date] });

export default function AyambilRegistration({ eventDate }) {
  const session = eveningConfig.sessions.find(s => s.date === eventDate);
  const initialBooking = () => ({ contactName: '', mobile: '', eventDate, whatsappConsent: false, termsAccepted: false, attendees: [emptyAttendee(eventDate)] });
  const [booking, setBooking] = useState(initialBooking);
  const [availability, setAvailability] = useState('loading'); const [step, setStep] = useState('details');
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false); const [confirmed, setConfirmed] = useState(false);
  const [receipt, setReceipt] = useState(null); const submission = useRef(null); const locked = useRef(false); const heading = useRef(null);
  const [messagingSetup,setMessagingSetup]=useState(false);
  const check = async () => {
    setAvailability('loading');
    try { const status = await registrationApi('status'); setMessagingSetup(false); setAvailability(registrationAvailability(status)); }
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
  return <section className="ay-registration ay-container" id="ay-registration" aria-labelledby="ay-registration-title">
    <p className="ay-eyebrow">Free Evening Registration · સાંજના કાર્યક્રમ માટે ફ્રી રજિસ્ટ્રેશન</p><h2 id="ay-registration-title" ref={heading} tabIndex={-1}>તમારી વિગતો ભરો / Register for this evening</h2>
    <p className="ay-registration-intro">{session.label} · {session.time} · {session.performer} — <span lang="gu">{session.programme}</span>. This booking is for this evening only. / આ રજિસ્ટ્રેશન આ જ સાંજ માટે છે. સવારના કાર્યક્રમો અને ૪ નવેમ્બર માટે નથી.</p>
    <AyambilInstructions />
    {messagingSetup && step !== 'success' && <p role="status">Registration will open after setup is verified. / જરૂરી તપાસ પૂરી થયા પછી રજિસ્ટ્રેશન શરૂ થશે.</p>}
    {step !== 'success' && availability !== 'open' && <div className="ay-availability" role="status"><p>{availability === 'loading' ? 'Checking availability… / રજિસ્ટ્રેશન ચાલુ છે કે નહીં તે તપાસીએ છીએ…' : availability === 'closed' ? 'Registration is not open yet. / રજિસ્ટ્રેશન હજી શરૂ થયું નથી.' : 'Registration is unavailable. No booking is confirmed. / અત્યારે રજિસ્ટ્રેશન થઈ શકતું નથી. કોઈ રજિસ્ટ્રેશન કન્ફર્મ થયું નથી.'}</p>{availability !== 'loading' && <button type="button" onClick={check}>Check again / ફરી તપાસો</button>}</div>}
    {step === 'details' && <form onSubmit={review}>
      <fieldset disabled={busy || availability !== 'open'}><legend>Booking contact / રજિસ્ટ્રેશન કરનારની વિગતો</legend><div className="ay-form-grid">
        <label>Full name / પૂરું નામ<input autoComplete="name" required minLength={2} maxLength={120} value={booking.contactName} onChange={e => edit({ ...booking, contactName: e.target.value })} /></label>
        <label>WhatsApp number / WhatsApp નંબર<input type="tel" inputMode="tel" autoComplete="tel" placeholder="+91" required value={booking.mobile} onChange={e => edit({ ...booking, mobile: e.target.value })} /><small>Include + and country code (e.g. +91). / દેશનો કોડ લખો, જેમ કે +91. તમારી મંજૂરીથી આ નંબર પર કન્ફર્મેશન અને પાસની લિંક મોકલાશે.</small></label>
        <label>Attendees / કેટલા લોકો આવવાના છે?<select value={booking.attendees.length} onChange={e => edit({ ...booking, attendees: Number(e.target.value) === 1 ? booking.attendees.slice(0, 1) : [booking.attendees[0], booking.attendees[1] || emptyAttendee(eventDate)] })}><option value="1">1 person / ૧ વ્યક્તિ</option><option value="2">2 people / ૨ લોકો</option></select><small>Maximum 2 attendees / એક રજિસ્ટ્રેશનમાં વધુમાં વધુ ૨ લોકોનાં નામ ઉમેરી શકો છો.</small></label>
      </div></fieldset>
      {booking.attendees.map((attendee, index) => <fieldset key={index} disabled={busy || availability !== 'open'}><legend>Attendee / આવનાર વ્યક્તિ {index + 1}</legend>
        <label>Attendee full name / આવનાર વ્યક્તિનું પૂરું નામ<input autoComplete="off" required minLength={2} maxLength={120} value={attendee.fullName} onChange={e => updateAttendee(index, { fullName: e.target.value })} /></label>
        <p>{session.label} · {session.performer} · {session.venue.replace('Chandramauleshwar', 'Chandramaulishwar')}</p>
        {booking.attendees.length > 1 && <button type="button" onClick={() => edit({ ...booking, attendees: booking.attendees.filter((_, i) => i !== index) })}>Remove / નામ કાઢો {index + 1}</button>}
      </fieldset>)}
      <p className="ay-help">We use these details for event registration. / તમારી વિગતો આ કાર્યક્રમના રજિસ્ટ્રેશન માટે રાખવામાં આવે છે. પાસ પર નામ હોય છે, એટલે તેને યોગ્ય વ્યક્તિ સાથે જ શેર કરો.</p>
      <details className="ay-terms" open><summary>Digital Pass — Terms & Conditions / ડિજિટલ પાસ માટેના નિયમો</summary><ol>{ayambilTerms.map(([en, gu]) => <li key={en}><span>{en}</span><span lang="gu">{gu}</span></li>)}</ol><Link to="/privacy">Privacy Policy / પ્રાઇવસી પોલિસી</Link></details>
      <label className="ay-confirm"><input type="checkbox" required disabled={availability !== 'open'} checked={booking.termsAccepted} onChange={e => edit({ ...booking, termsAccepted: e.target.checked })} />I have read and accept the pass terms. / મેં પાસ માટેના નિયમો વાંચ્યા છે અને તે મને મંજૂર છે.</label>
      <label className="ay-confirm"><input type="checkbox" required disabled={availability !== 'open'} checked={booking.whatsappConsent} onChange={e => edit({ ...booking, whatsappConsent: e.target.checked })} />I agree to receive event confirmation and passes on WhatsApp, not marketing. / આ નંબર પર કાર્યક્રમનું કન્ફર્મેશન અને પાસ WhatsApp પર મેળવવા હું રાજી છું. આ મંજૂરી માર્કેટિંગ માટે નથી.</label>
      <div className="ay-form-actions"><button type="submit" className="ay-button" disabled={availability !== 'open'}>Review attendees / વિગતો ચકાસો</button></div>
    </form>}
    {step === 'review' && <div className="ay-review"><h3>Review your booking / તમારી વિગતો ચકાસો</h3><p>{session.label} · {session.time} · {session.performer}</p><p lang="gu">{session.programme}</p><p>{session.venue.replace('Chandramauleshwar', 'Chandramaulishwar')} · {session.address}</p><p>{booking.contactName} · {booking.mobile}</p><p>WhatsApp consent and pass terms: accepted. / WhatsApp પર કન્ફર્મેશન અને પાસ માટેના નિયમો: મંજૂર.</p><ol>{booking.attendees.map((a, i) => <li key={i}><strong>{a.fullName}</strong><span>{session.label} · 8:00 PM IST</span></li>)}</ol>
      <label className="ay-confirm"><input type="checkbox" checked={confirmed} disabled={busy} onChange={e => setConfirmed(e.target.checked)} />I confirm the names and selected evening are correct. / નામ અને પસંદ કરેલો સાંજનો કાર્યક્રમ સાચાં છે.</label>
      <div className="ay-form-actions"><button type="button" disabled={busy} onClick={() => { setStep('details'); setConfirmed(false); }}>Edit details / વિગતો સુધારો</button><button type="button" className="ay-button" disabled={!confirmed || busy} onClick={submit}>{busy ? 'Saving… / રજિસ્ટ્રેશન થઈ રહ્યું છે…' : 'Confirm registration / રજિસ્ટ્રેશન કરો'}</button></div>
    </div>}
    {step === 'success' && receipt && <div className="ay-confirmation"><h3>{receipt.status === 'active' ? 'Registration confirmed / તમારું રજિસ્ટ્રેશન થઈ ગયું છે' : 'Booking cancelled / રજિસ્ટ્રેશન રદ થયું છે'}</h3><p>Booking number / રજિસ્ટ્રેશન નંબર: <strong>{receipt.number}</strong></p><p>WhatsApp confirmation status: <strong>{receipt.whatsapp?.status || 'not queued'}</strong>. Queued means awaiting the provider; it does not mean delivered. Save your PDF while confirmation is pending. / WhatsApp પર મોકલાવાની રાહ હોય તો પણ તમારો પાસ ડાઉનલોડ કરી રાખો.</p><p>Download and save each pass below. / દરેક વ્યક્તિનો ડિજિટલ પાસ ડાઉનલોડ કરી લો.</p>{receipt.attendees.flatMap(a => a.passes.filter(p => p.status !== 'superseded').map(pass => <AyambilDigitalPass key={pass.number} pass={pass} />))}{receipt.downloadKeys && <ul>{receipt.downloadKeys.map((key,index) => <li key={key}><a href={`/500-akhand-ayambil-vijayollas/passes#${key}`} rel="noreferrer">Private pass link / ખાનગી પાસ લિંક — {receipt.attendees[index].fullName}</a></li>)}</ul>}<button type="button" onClick={() => { setReceipt(null); submission.current = null; setBooking(initialBooking()); setStep('details'); setConfirmed(false); check(); }}>Another booking / બીજું રજિસ્ટ્રેશન</button></div>}
    {error && <p className="ay-form-error" role="alert">{error}</p>}
  </section>;
}
