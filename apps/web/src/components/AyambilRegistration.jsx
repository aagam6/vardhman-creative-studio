import {withPrimaryParticipant} from '@/lib/ayambilPrimaryParticipant';
import {gujaratiEvening} from '@/lib/ayambilGujarati';
import React, { useEffect, useRef, useState } from 'react';
import { registrationAvailability } from '@/lib/ayambilExpressClient.js';
import { eveningConfig, registrationApi, requestKey, validateBooking } from '@/lib/ayambilRegistration';
import { Link } from 'react-router-dom';
import { ayambilTerms } from '@/lib/ayambilTerms';
import AyambilDigitalPass from './AyambilDigitalPass.jsx';
import './AyambilRegistration.css';


const emptyAttendee = date => ({ fullName: '', dates: [date] });

export default function AyambilRegistration({ eventDate }) {
  const session = gujaratiEvening(eveningConfig.sessions.find(s => s.date === eventDate));
  const initialBooking = () => ({ contactName: '', occupation: '', referralSource: '', mobile: '+91', eventDate, whatsappConsent: false, termsAccepted: false, attendees: [emptyAttendee(eventDate)] });
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
  const edit = next => { setBooking(withPrimaryParticipant(next)); submission.current = null; setConfirmed(false); setError(''); };
  const updateAttendee = (index, patch) => edit({ ...booking, attendees: booking.attendees.map((a, i) => i === index ? { ...a, ...patch } : a) });
  const review = event => { event.preventDefault(); const problem = validateBooking(booking); if (problem) { setError(problem.includes(" / ") ? problem.split(" / ").slice(1).join(" / ") : problem); return; } setError(''); setStep('review'); };
  const submit = async () => {
    if (!confirmed || locked.current) return;
    const problem = validateBooking(booking); if (problem) { setError(problem.includes(" / ") ? problem.split(" / ").slice(1).join(" / ") : problem); return; }
    locked.current = true; setBusy(true); setError('');
    if (!submission.current) submission.current = { ...booking, requestKey: requestKey() };
    try {
      const saved = await registrationApi('register', { method: 'POST', body: submission.current });
      if (!saved?.number || !Array.isArray(saved.attendees) || saved.attendees.length !== booking.attendees.length || saved.attendees.some(a => !Array.isArray(a.passes) || !a.passes.length)) throw new Error('Incomplete response');
      setReceipt(saved); setStep('success');
    } catch { setError('રજિસ્ટ્રેશન કન્ફર્મ થઈ શક્યું નથી. આ જ વિગતો સાથે ફરી પ્રયાસ કરો. કન્ફર્મેશન ન મળે ત્યાં સુધી બીજું રજિસ્ટ્રેશન શરૂ ન કરો.'); }
    finally { locked.current = false; setBusy(false); }
  };
  return <section className="ay-registration ay-container ay-guest-reservation" id="ay-registration" aria-labelledby="ay-registration-title">
    <header className="ay-registration-heading"><p className="ay-eyebrow">સાંજના કાર્યક્રમ માટે ફ્રી રજિસ્ટ્રેશન</p><h2 id="ay-registration-title" ref={heading} tabIndex={-1}>તમારો પાસ અહીં મેળવો</h2><p className="ay-registration-intro">તમારું નામ અને WhatsApp નંબર આપો. એક ફોર્મમાં ૬ લોકોના ફ્રી પાસ લઈ શકો છો.</p></header>
    <div className="ay-registration-event"><div><strong>{session.performer}</strong><span lang="gu">{session.programme}</span></div><div><strong>{session.label} · {session.time}</strong><span>{session.venue.replace('Chandramauleshwar', 'Chandramaulishwar')}</span></div></div>
    <p className="ay-help">આ પાસ પસંદ કરેલી સાંજ માટે છે. સવારના કાર્યક્રમો અને ૪ નવેમ્બર માટે નથી.</p>
    <ol className="ay-registration-progress" aria-label="Registration steps">{[['details','તમારી માહિતી'],['review','માહિતી તપાસો'],['success','પાસ સાચવો']].map(([key,label],index) => <li key={key} aria-current={step===key ? 'step' : undefined}><span>{index+1}</span>{label}</li>)}</ol>

    {step !== 'success' && availability !== 'open' && <div className="ay-availability" role="status"><p>{availability === 'loading' ? 'રજિસ્ટ્રેશન ચાલુ છે કે નહીં તે તપાસીએ છીએ…' : availability === 'closed' ? 'રજિસ્ટ્રેશન હજી શરૂ થયું નથી.' : 'અત્યારે રજિસ્ટ્રેશન થઈ શકતું નથી. થોડી વાર પછી ફરી તપાસો.'}</p>{availability !== 'loading' && <button type="button" onClick={check}>ફરી તપાસો</button>}</div>}
    {step === 'details' && <form onSubmit={review}>
      <fieldset disabled={busy || availability !== 'open'}><legend>તમારી માહિતી</legend><div className="ay-form-grid">
        <label>તમારું પૂરું નામ<input autoComplete="name" required minLength={2} maxLength={120} value={booking.contactName} onChange={e => edit({ ...booking, contactName: e.target.value })} /><small>પહેલો પાસ આ નામે બનશે. પાસની સંખ્યામાં તમારો પાસ પણ ગણાય છે.</small></label>
        <label>WhatsApp મોબાઇલ નંબર<input type="tel" inputMode="tel" autoComplete="tel" placeholder="+91" required value={booking.mobile} onChange={e => edit({ ...booking, mobile: e.target.value })} /><small>તમારો ચાલુ WhatsApp નંબર લખો. કન્ફર્મેશન અને પાસ આ નંબર પર મોકલાશે. દેશનો કોડ પણ લખો, જેમ કે +91.</small></label>
        <label>કેટલા પાસ જોઈએ?<select value={booking.attendees.length} onChange={e => edit({ ...booking, attendees: Array.from({length:Number(e.target.value)},(_,i)=>booking.attendees[i] || emptyAttendee(eventDate)) })}><option value="1">1 પાસ</option><option value="2">2 પાસ</option><option value="3">3 પાસ</option><option value="4">4 પાસ</option><option value="5">5 પાસ</option><option value="6">6 પાસ</option></select><small>દરેક વ્યક્તિ માટે અલગ પાસ મળશે.</small></label>
        <label>તમે શું કરો છો?<select value={booking.occupation} onChange={e=>edit({...booking,occupation:e.target.value})}><option value="">કામ પસંદ કરો (જરૂરી નથી)</option>{["વિદ્યાર્થી","નોકરી","ધંધો / પોતાનું કામ","ઘર સંભાળું છું","નિવૃત્ત","બીજું"].map(value=><option key={value}>{value}</option>)}</select><small>આ માહિતી આપવી જરૂરી નથી</small></label>
        <label>આ કાર્યક્રમ વિશે ક્યાંથી જાણ્યું?<select value={booking.referralSource} onChange={e=>edit({...booking,referralSource:e.target.value})}><option value="">પસંદ કરો (જરૂરી નથી)</option><option>WhatsApp</option><option>મિત્રો કે પરિવાર</option><option>જૈન સંઘ</option><option>સોશિયલ મીડિયા</option><option>કાર્યક્રમની પત્રિકા</option><option>બીજી રીતે</option></select></label>
      </div></fieldset>
      {booking.attendees.map((attendee, index) => index > 0 && <fieldset key={index} disabled={busy || availability !== 'open'}><legend>સાથે આવનાર વ્યક્તિ {index + 1}નું નામ</legend>
        <label>પાસ પર લખવાનું પૂરું નામ<input autoComplete="off" required minLength={2} maxLength={120} value={attendee.fullName} onChange={e => updateAttendee(index, { fullName: e.target.value })} /></label>
        <p>{session.label} · {session.performer} · {session.venue.replace('Chandramauleshwar', 'Chandramaulishwar')}</p>
        {booking.attendees.length > 1 && <button type="button" onClick={() => edit({ ...booking, attendees: booking.attendees.filter((_, i) => i !== index) })}>વ્યક્તિ {index + 1}નું નામ કાઢો</button>}
      </fieldset>)}
      <p className="ay-help">આ માહિતી કાર્યક્રમ માટે છે. પાસ પર જેનું નામ હોય, પાસ તે વ્યક્તિ માટે જ છે.</p>
      <details className="ay-terms"><summary>રજિસ્ટ્રેશનના નિયમો</summary><ol>{ayambilTerms.map(([en,gu]) => <li key={en}><span>{gu}</span></li>)}</ol><Link to="/privacy">તમારી માહિતી કેવી રીતે વાપરીએ છીએ</Link></details>
      <label className="ay-confirm"><input type="checkbox" required disabled={availability !== 'open'} checked={booking.termsAccepted} onChange={e => edit({ ...booking, termsAccepted: e.target.checked })} />મેં રજિસ્ટ્રેશનના બધા નિયમો વાંચ્યા અને સમજ્યા છે. મને તે મંજૂર છે.</label>
      <label className="ay-confirm"><input type="checkbox" required disabled={availability !== 'open'} checked={booking.whatsappConsent} onChange={e => edit({ ...booking, whatsappConsent: e.target.checked })} />મને WhatsApp પર કાર્યક્રમનું કન્ફર્મેશન અને પાસ મોકલી શકો છો. આ મંજૂરી જાહેરાત માટે નથી.</label>
      <div className="ay-form-actions"><button type="submit" className="ay-button" disabled={availability !== 'open'}>માહિતી તપાસો</button></div>
    </form>}
    {step === 'review' && <div className="ay-review"><h3>માહિતી તપાસો</h3><p>{session.label} · {session.time} · {session.performer}</p><p lang="gu">{session.programme}</p><p>{session.venue.replace('Chandramauleshwar', 'Chandramaulishwar')} · {session.address}</p><p>{booking.contactName} · {booking.mobile}</p><p>કામ: {booking.occupation || "આપ્યું નથી"} · કાર્યક્રમની જાણ: {booking.referralSource || "આપ્યું નથી"}</p><p>WhatsApp અને રજિસ્ટ્રેશનના નિયમો માટે મંજૂરી આપી છે.</p><ol>{booking.attendees.map((a, i) => <li key={i}><strong>{a.fullName}</strong><span>{session.label} · સાંજે ૮ વાગ્યે</span></li>)}</ol>
      <label className="ay-confirm"><input type="checkbox" checked={confirmed} disabled={busy} onChange={e => setConfirmed(e.target.checked)} />વ્યક્તિઓનાં નામ અને કાર્યક્રમની તારીખ સાચી છે.</label>
      <div className="ay-form-actions"><button type="button" disabled={busy} onClick={() => { setStep('details'); setConfirmed(false); }}>માહિતી બદલો</button><button type="button" className="ay-button" disabled={!confirmed || busy} onClick={submit}>{busy ? 'પાસ તૈયાર થાય છે…' : 'રજિસ્ટ્રેશન કરો'}</button></div>
    </div>}
    {step === 'success' && receipt && <div className="ay-confirmation"><h3>{receipt.status === 'active' ? 'તમારું રજિસ્ટ્રેશન થઈ ગયું છે' : 'રજિસ્ટ્રેશન રદ થયું છે'}</h3><p>રજિસ્ટ્રેશન નંબર: <strong>{receipt.number}</strong></p><p>WhatsApp પર પાસ આવવામાં સમય લાગી શકે છે. ત્યાં સુધી તમારો પાસ અહીંથી ડાઉનલોડ કરીને સાચવી રાખો.</p><p>નીચેથી દરેક વ્યક્તિનો પાસ ડાઉનલોડ કરી લો.</p>{receipt.attendees.flatMap(a => a.passes.filter(p => p.status !== 'superseded').map(pass => <AyambilDigitalPass key={pass.number} pass={pass} />))}<button type="button" onClick={() => { setReceipt(null); submission.current = null; setBooking(initialBooking()); setStep('details'); setConfirmed(false); check(); }}>બીજું રજિસ્ટ્રેશન</button></div>}
    {error && <p className="ay-form-error" role="alert">{error}</p>}
  </section>;
}
