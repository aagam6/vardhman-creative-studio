import {collectAttendeeCsv} from '@/lib/ayambilAdminExport.js';
import {dashboardMetrics} from '@/lib/ayambilDashboardMetrics.js';
import React, { useEffect, useRef, useState } from 'react';
import { adminTimestamp } from '@/lib/ayambilAdminTime.js';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { ayambilApi, eveningConfig, registrationApi, downloadCsv, requestKey } from '@/lib/ayambilRegistration';
import AyambilDigitalPass from '@/components/AyambilDigitalPass.jsx';
import AyambilManualMessages from '@/components/AyambilManualMessages.jsx';
import './AyambilPage.css';
import '@/components/AyambilRegistration.css';
import './AyambilAdminPage.css';

export default function AyambilAdminPage() {
  const [authenticated, setAuthenticated] = useState(false); const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [filters, setFilters] = useState({ search: '', date: '', status: '' }); const [items, setItems] = useState([]);
  const [page, setPage] = useState(1); const [hasMore, setHasMore] = useState(false); const [busy, setBusy] = useState(false);
  const [error, setError] = useState(''); const [pending, setPending] = useState(null); const [notice, setNotice] = useState('');
  const [messages,setMessages]=useState([]);
  const [testJob,setTestJob]=useState('');
  const [testDate,setTestDate]=useState('2026-11-02');
  const [testKey,setTestKey]=useState(requestKey);
  const messageAction=async (path,body={})=>{setBusy(true);setError('');if(path==='admin/messages/process-test')setTestJob('');try{const result=await registrationApi(path,{method:'POST',body});if(result.id)setTestJob(result.id);setNotice(result.queued?'Test queued; not delivered. Process explicitly to send.':JSON.stringify(result));setMessages((await registrationApi('admin/messages')).items);}catch(failure){setError(failure.message);}finally{setBusy(false);}};
  const [integration,setIntegration]=useState(null); const [reissuedLink,setReissuedLink]=useState("");
  const refreshRef = useRef(null); const appliedFilters = useRef({ search: '', date: '', status: '' });
  const loadingRef = useRef(false); const generation = useRef(0);
  const [lastLoaded, setLastLoaded] = useState('');
  const clearAdmin = () => { generation.current++; loadingRef.current = false; setBusy(false); setAuthenticated(false); setItems([]); setPending(null); setReissuedLink(""); setLastLoaded(''); };
  const signOut = async () => { setBusy(true); try { await ayambilApi.logout(); clearAdmin(); } catch { setError("Sign-out could not be confirmed. Retry before leaving this device."); } finally { setBusy(false); } };
  useEffect(() => { let mounted = true; ayambilApi.restore().then(() => { if (mounted) setAuthenticated(true); }).catch(failure => { if (mounted && failure.status !== 401) setError("Session could not be restored. Sign in or retry when the API is available."); }); return () => { mounted = false; }; }, []);
  const login = async event => {
    event.preventDefault(); setBusy(true); setError('');
    try { await ayambilApi.login(credentials.email, credentials.password); setCredentials({ email: '', password: '' }); setAuthenticated(true); }
    catch { clearAdmin(); setError('Sign-in failed. Check your credentials, enabled administrator account and backend availability.'); }
    finally { setBusy(false); }
  };
  const load = async (targetPage, selectedFilters = filters, quiet = false) => {
    if (quiet && (loadingRef.current || busy || pending || document.hidden)) return;
    loadingRef.current = true;
    const requestGeneration = ++generation.current;
    setBusy(true); setError('');
    try {
      const result = await registrationApi('admin/bookings', { query: { ...selectedFilters, page: targetPage } });
      if (requestGeneration !== generation.current) return;
      appliedFilters.current = { ...selectedFilters };
      setItems(result.items); setPage(result.page); setHasMore(result.hasMore);
      setLastLoaded(new Date().toISOString());
      try { const configuration = await registrationApi('admin/whatsapp'); if (requestGeneration === generation.current) setIntegration(configuration); }
      catch (failure) { if (requestGeneration !== generation.current) return; if (failure.status === 401 || failure.status === 403) clearAdmin(); setError(`WhatsApp configuration could not be loaded: ${failure.message}`); }
    }
    catch (failure) { if (requestGeneration !== generation.current) return; if (failure.status === 401 || failure.status === 403) clearAdmin(); setError(`Unable to load registrations: ${failure.message}`); }
    finally { if (requestGeneration === generation.current) { loadingRef.current = false; setBusy(false); } }
  };
  refreshRef.current = () => load(page, appliedFilters.current, true);
  useEffect(() => { if (authenticated) load(1); }, [authenticated]); // Filters are applied with Search, not on every keystroke.
  useEffect(() => {
    if (!authenticated) return;
    const refresh = () => refreshRef.current?.();
    const timer = window.setInterval(refresh, 60000);
    window.addEventListener('focus', refresh);
    return () => { window.clearInterval(timer); window.removeEventListener('focus', refresh); };
  }, [authenticated]);
  const change = async () => {
    setBusy(true); setError('');
    try { const changed = await registrationApi(pending.action === 'whatsapp-retry' ? 'admin/whatsapp-retry' : 'admin/change', { method: 'POST', body: pending }); setNotice(`Booking ${pending.action === 'whatsapp-retry' ? 'WhatsApp confirmation queued' : pending.action === 'reissue' ? 'pass reissued; the previous pass is superseded' : pending.action === 'cancel' ? 'cancelled' : 'restored'}.`); setPending(null); setReissuedLink(changed.downloadKey ? `/500-akhand-ayambil-vijayollas/passes#${encodeURIComponent(changed.downloadKey)}` : ""); await load(page); }
    catch { setError('The update could not be confirmed. Reload registrations before retrying.'); }
    finally { setBusy(false); }
  };
  const exportList = async () => {
    setBusy(true); setError('');
    try {
      const rows = await collectAttendeeCsv(registrationApi,filters);
      downloadCsv(rows); setNotice('Filtered attendee list downloaded. It contains private contact details; store it securely.');
    } catch (failure) { if([401,403].includes(failure.status))clearAdmin(); setError(`Export failed: ${failure.message}. No complete attendee list was downloaded.`); }
    finally { setBusy(false); }
  };
  const metrics = dashboardMetrics(items);
  return <div className="ay-page ay-admin"><Helmet><title>Ayambil registration management | Vardhman Creative Studio</title><meta name="robots" content="noindex,nofollow" /></Helmet>
    <header className="ay-container ay-header"><Link to="/500-akhand-ayambil-vijayollas">← Event page</Link><strong>Registration management</strong>{authenticated && <button type="button" onClick={signOut}>Sign out</button>}</header>
    <main className="ay-container ay-registration"><div className="ay-admin-title"><span>AYAMBIL · ADMINISTRATION</span><h1>Evening registrations</h1></div><p>2–3 November 2026 · Authorized administrators only</p>
      {authenticated && <section className="ay-kpi-section" aria-label="Registration overview"><p>Current filtered page · {lastLoaded ? `Page ${page}` : 'Awaiting bookings'} · These counts are not event-wide totals.</p><div className="ay-kpi-grid">{[['Bookings',metrics.bookings],['Active bookings',metrics.active],['Active attendees',metrics.attendees],['Cancelled bookings',metrics.cancelled]].map(([label,value]) => <article className="ay-kpi-card" key={label}><span>{label}</span><strong>{lastLoaded ? value : '—'}</strong></article>)}</div></section>}
      {!authenticated ? <form onSubmit={login}><fieldset disabled={busy}><legend>Administrator sign-in</legend><label>Email<input type="email" autoComplete="username" required value={credentials.email} onChange={e => setCredentials({ ...credentials, email: e.target.value })} /></label><label>Password<input type="password" autoComplete="current-password" required value={credentials.password} onChange={e => setCredentials({ ...credentials, password: e.target.value })} /></label><button type="submit">{busy ? 'Signing in…' : 'Sign in'}</button></fieldset><p className="ay-help">An enabled event administrator account must be provisioned securely in the MySQL backend. No default account is provided.</p></form> : <>
        <p role="status">Times shown in IST. {lastLoaded ? `Bookings last refreshed ${adminTimestamp(lastLoaded)}.` : "Bookings have not loaded yet."} Refresh checks run every minute while this page is visible.</p><button type="button" disabled={busy} onClick={() => { const empty = {search:"",date:"",status:""}; setFilters(empty); load(1, empty); }}>Refresh latest bookings (clear filters)</button>
        <form className="ay-admin-filters" onSubmit={e => { e.preventDefault(); load(1); }}><label>Search contact, attendee or booking<input value={filters.search} maxLength={120} onChange={e => setFilters({ ...filters, search: e.target.value })} /></label><label>Evening date<select value={filters.date} onChange={e => setFilters({ ...filters, date: e.target.value })}><option value="">Both evenings</option>{eveningConfig.sessions.map(s => <option value={s.date} key={s.date}>{s.label}</option>)}</select></label><label>Status<select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}><option value="">All statuses</option><option value="active">Active</option><option value="cancelled">Cancelled</option></select></label><button type="submit" disabled={busy}>Search</button><button type="button" onClick={exportList} disabled={busy}>Export filtered attendees</button></form>
        {integration && <section aria-label="WhatsApp integration"><h2>Channel & templates</h2><p role="status">WhatsApp sending: {integration.sending ? 'enabled' : 'not enabled'}. Provider configuration: {integration.configured ? 'present; verify channel and templates' : 'required'}. {(integration.missing || []).join(', ')}</p><button type="button" disabled={busy} onClick={async () => { setBusy(true); setError(''); try { setIntegration(await registrationApi('admin/whatsapp/inspect', {method:'POST',body:{}})); } catch (failure) { setError(failure.message); } finally { setBusy(false); } }}>Verify channel and templates (no message)</button>{integration.accountVerified && <p>Channel healthy. Approved templates: {integration.templates.map(t => `${t.name} (${t.language})${t.verified ? (t.bodySource==='operator_reviewed_snapshot' ? ' — mapping validated against operator-reviewed BODY snapshot (not API BODY)' : ' — provider BODY verified') : t.bodyAvailable ? ' — definition/mapping not verified' : ' — approved; BODY definition unavailable'}`).join('; ')}. Account check does not prove message delivery.</p>}</section>}
        {integration?.testBodyOverride && <p role="status">STAGING compatibility test: BODY metadata unavailable. Only synthetic values will be sent to the server-configured test recipient. Approval is for one explicit test; remove the override afterward.</p>}<section aria-label="WhatsApp message queue"><h2>Message queue</h2><p role="status">Automatic queue worker: {integration?.worker?.active ? "running for approved fresh bookings" : integration?.worker?.enabled ? "paused; operator review required" : "disabled"}. Queued messages are not delivery confirmation.</p><button type="button" disabled={busy} onClick={async()=>{try{setMessages((await registrationApi('admin/messages')).items);}catch(failure){setError(failure.message);}}}>Refresh message status</button>{integration?.testSendingAvailable === true && <><select aria-label="Test evening" value={testDate} onChange={e=>{setTestDate(e.target.value);setTestJob('');setTestKey(requestKey());}}>{eveningConfig.sessions.map(s=><option key={s.date} value={s.date}>{s.label}</option>)}</select><button type="button" disabled={busy} onClick={()=>messageAction('admin/messages/test',{eventDate:testDate,requestKey:testKey})}>Queue authorized test to server-configured recipient</button><button type="button" disabled={busy||!testJob} onClick={()=>messageAction('admin/messages/process-test',{id:testJob})}>Send only this authorized test job</button></>}{messages.map(m=><p key={m.id}>{m.notification_type}: {m.status} · Attempts {m.attempts} {m.canVerifyProviderStatus ? <button type="button" disabled={busy} onClick={()=>messageAction('admin/messages/status',{id:m.id})}>Verify provider status</button> : <span>{m.status==='uncertain' ? 'Acceptance uncertain; manual reconciliation required. Do not retry.' : ['queued','preparing'].includes(m.status) && m.attempts===0 ? 'Not submitted to provider yet; no provider reference available.' : 'Provider reference unavailable; status cannot be reconciled here. Do not retry automatically.'}</span>}</p>)}</section>
        {reissuedLink && <p><a href={reissuedLink} rel="noreferrer">Open reissued attendee pass — keep this private link secure</a></p>}
        <AyambilManualMessages messages={messages} busy={busy} onError={setError} onRefresh={async()=>{try{setMessages((await registrationApi('admin/messages')).items);}catch{setError('Message status unavailable; do not retry sending.');}}}/>
        <p role="status">{busy ? 'Working…' : notice}</p>
        {!items.length && !busy && <p>No matching registrations loaded.</p>}
        {items.map(b => <article className="ay-admin-booking" key={b.id}><div className="ay-booking-heading"><div><span className="ay-card-label">BOOKING</span><h2>{b.number}</h2></div><span className={`ay-booking-status ay-status-${b.status}`}>{b.status}</span></div><div className="ay-booking-meta"><span>{b.contactName}</span><span>{[...new Set(b.attendees.flatMap(a => a.dates))].map(date => eveningConfig.sessions.find(s => s.date === date)?.label || date).join(' / ')}</span><span>{b.attendees.length} attendee{b.attendees.length === 1 ? '' : 's'}</span><span>Registered {adminTimestamp(b.created)}</span></div><p>WhatsApp: {b.whatsapp?.status || 'Queue summary unavailable'} · Processing attempts: {b.whatsapp?.attempts ?? '—'}</p>{b.whatsapp?.failure && <p>{b.whatsapp.failure}</p>}{b.whatsapp?.providerRef && <p>Provider reference: {b.whatsapp.providerRef}</p>}<details className="ay-booking-private"><summary>Contact details & queue history</summary><p>Contact number: {b.mobile}</p>{b.whatsapp && <><p>WhatsApp history and timestamps</p><p>Current queue snapshots; exact delivery timestamps are not recorded here. Processing attempts include preflight checks, not only provider submissions.</p>{b.whatsapp.history?.map((entry,i) => <p key={i}>{adminTimestamp(entry.at)} · {entry.type}: {entry.status} · Attempts: {entry.attempts}</p>)}</>}</details><div className="ay-booking-actions">{b.whatsapp?.status === 'failed' && <button type="button" disabled={busy || b.status !== 'active'} onClick={() => setPending({ action: 'whatsapp-retry', bookingId: b.id })}>Retry failed WhatsApp confirmation</button>}<button type="button" disabled={busy} onClick={() => setPending({ action: b.status === 'active' ? 'cancel' : 'restore', bookingId: b.id })}>{b.status === 'active' ? 'Cancel booking' : 'Restore booking'}</button></div>
          <details className="ay-booking-attendees"><summary>Attendees & passes ({b.attendees.length})</summary>{b.attendees.filter(a => !appliedFilters.current.date || a.dates.includes(appliedFilters.current.date)).map(a => <section key={a.id} className="ay-admin-attendee"><h3>{a.fullName}</h3><p>{a.dates.join(' / ')} · {a.status}</p>{a.passes.filter(p => p.status !== 'superseded').map(p => <details className="ay-admin-pass-preview" key={p.number}><summary>Preview & download digital pass</summary><AyambilDigitalPass pass={p} /></details>)}<button type="button" disabled={busy || b.status !== 'active'} onClick={() => setPending({ action: 'reissue', bookingId: b.id, attendeeId: a.id })}>Reissue attendee pass</button><details><summary>Pass history</summary>{a.passes.map(p => <p key={p.number}>{p.number} · {p.status}</p>)}</details></section>)}</details>
        </article>)}
        <div className="ay-form-actions"><button type="button" disabled={page <= 1 || busy} onClick={() => load(page - 1)}>Previous</button><span>Page {page}</span><button type="button" disabled={!hasMore || busy} onClick={() => load(page + 1)}>Next</button></div>
        {pending && <section className="ay-admin-confirm" aria-labelledby="ay-admin-confirm-heading"><h2 id="ay-admin-confirm-heading">Confirm {pending.action}</h2><p>{pending.action === 'whatsapp-retry' ? 'Retry this confirmed failed confirmation? The same booking and passes will be reused. Queued does not mean delivered.' : pending.action === 'reissue' ? 'A new number will be issued. The previous pass will remain in history as superseded. Previously downloaded files cannot be recalled.' : pending.action === 'cancel' ? 'Cancel this booking and all attendee passes? Previously downloaded files cannot be recalled.' : 'Restore this booking and its latest attendee passes?'}</p><button type="button" disabled={busy} onClick={change}>Confirm {pending.action}</button><button type="button" disabled={busy} onClick={() => setPending(null)}>Keep unchanged</button></section>}
      </>}
      {error && <p role="alert" className="ay-form-error">{error}</p>}
    </main></div>;
}
