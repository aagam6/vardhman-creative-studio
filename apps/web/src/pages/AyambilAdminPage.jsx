import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { ayambilApi, eveningConfig, registrationApi, downloadCsv } from '@/lib/ayambilRegistration';
import AyambilDigitalPass from '@/components/AyambilDigitalPass.jsx';
import './AyambilPage.css';
import '@/components/AyambilRegistration.css';

export default function AyambilAdminPage() {
  const [authenticated, setAuthenticated] = useState(false); const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [filters, setFilters] = useState({ search: '', date: '', status: '' }); const [items, setItems] = useState([]);
  const [page, setPage] = useState(1); const [hasMore, setHasMore] = useState(false); const [busy, setBusy] = useState(false);
  const [error, setError] = useState(''); const [pending, setPending] = useState(null); const [notice, setNotice] = useState('');
  const [integration,setIntegration]=useState(null); const [reissuedLink,setReissuedLink]=useState("");
  const clearAdmin = () => { setAuthenticated(false); setItems([]); setPending(null); setReissuedLink(""); };
  const signOut = async () => { setBusy(true); try { await ayambilApi.logout(); clearAdmin(); } catch { setError("Sign-out could not be confirmed. Retry before leaving this device."); } finally { setBusy(false); } };
  useEffect(() => { let mounted = true; ayambilApi.restore().then(() => { if (mounted) setAuthenticated(true); }).catch(failure => { if (mounted && failure.status !== 401) setError("Session could not be restored. Sign in or retry when the API is available."); }); return () => { mounted = false; }; }, []);
  const login = async event => {
    event.preventDefault(); setBusy(true); setError('');
    try { await ayambilApi.login(credentials.email, credentials.password); setCredentials({ email: '', password: '' }); setAuthenticated(true); }
    catch { clearAdmin(); setError('Sign-in failed. Check your credentials, enabled administrator account and backend availability.'); }
    finally { setBusy(false); }
  };
  const load = async targetPage => {
    setBusy(true); setError('');
    try { const result = await registrationApi('admin/bookings', { query: { ...filters, page: targetPage } }); setIntegration(result.integration); setItems(result.items); setPage(result.page); setHasMore(result.hasMore); }
    catch (failure) { if (failure.status === 401 || failure.status === 403) clearAdmin(); setError('Unable to load registrations. Check your access and try again.'); }
    finally { setBusy(false); }
  };
  useEffect(() => { if (authenticated) load(1); }, [authenticated]); // Filters are applied with Search, not on every keystroke.
  const change = async () => {
    setBusy(true); setError('');
    try { const changed = await registrationApi(pending.action === 'whatsapp-retry' ? 'admin/whatsapp-retry' : 'admin/change', { method: 'POST', body: pending }); setNotice(`Booking ${pending.action === 'whatsapp-retry' ? 'WhatsApp confirmation queued' : pending.action === 'reissue' ? 'pass reissued; the previous pass is superseded' : pending.action === 'cancel' ? 'cancelled' : 'restored'}.`); setPending(null); setReissuedLink(changed.downloadKey ? `/500-akhand-ayambil-vijayollas/passes#${encodeURIComponent(changed.downloadKey)}` : ""); await load(page); }
    catch { setError('The update could not be confirmed. Reload registrations before retrying.'); }
    finally { setBusy(false); }
  };
  const exportList = async () => {
    setBusy(true); setError('');
    try {
      const rows = [['Booking number', 'Contact name', 'Mobile', 'Attendee name', 'Evening dates', 'Registration status', 'Current pass number', 'Pass status', 'Registered at']];
      let next = 1; let more = true;
      while (more) {
        const result = await registrationApi('admin/bookings', { query: { ...filters, page: next } });
        result.items.forEach(b => b.attendees.filter(a => !filters.date || a.dates.includes(filters.date)).forEach(a => {
          const pass = a.passes.find(p => p.status !== 'superseded');
          rows.push([b.number, b.contactName, b.mobile, a.fullName, a.dates.join(' / '), a.status, pass?.number || '', pass?.status || '', b.created]);
        })); more = result.hasMore; next++;
      }
      downloadCsv(rows); setNotice('Filtered attendee list downloaded. It contains private contact details; store it securely.');
    } catch { setError('Export failed. No complete attendee list was downloaded.'); }
    finally { setBusy(false); }
  };
  return <div className="ay-page ay-admin"><Helmet><title>Ayambil registration management | Vardhman Creative Studio</title><meta name="robots" content="noindex,nofollow" /></Helmet>
    <header className="ay-container ay-header"><Link to="/500-akhand-ayambil-vijayollas">← Event page</Link><strong>Registration management</strong>{authenticated && <button type="button" onClick={signOut}>Sign out</button>}</header>
    <main className="ay-container ay-registration"><h1>Evening registrations</h1><p>2–3 November 2026 · Authorized administrators only</p>
      {!authenticated ? <form onSubmit={login}><fieldset disabled={busy}><legend>Administrator sign-in</legend><label>Email<input type="email" autoComplete="username" required value={credentials.email} onChange={e => setCredentials({ ...credentials, email: e.target.value })} /></label><label>Password<input type="password" autoComplete="current-password" required value={credentials.password} onChange={e => setCredentials({ ...credentials, password: e.target.value })} /></label><button type="submit">{busy ? 'Signing in…' : 'Sign in'}</button></fieldset><p className="ay-help">An enabled event administrator account must be provisioned securely in the MySQL backend. No default account is provided.</p></form> : <>
        <form className="ay-admin-filters" onSubmit={e => { e.preventDefault(); load(1); }}><label>Search contact, attendee or booking<input value={filters.search} maxLength={120} onChange={e => setFilters({ ...filters, search: e.target.value })} /></label><label>Evening date<select value={filters.date} onChange={e => setFilters({ ...filters, date: e.target.value })}><option value="">Both evenings</option>{eveningConfig.sessions.map(s => <option value={s.date} key={s.date}>{s.label}</option>)}</select></label><label>Status<select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}><option value="">All statuses</option><option value="active">Active</option><option value="cancelled">Cancelled</option></select></label><button type="submit" disabled={busy}>Search</button><button type="button" onClick={exportList} disabled={busy}>Export filtered attendees</button></form>
        {integration && <p role="status">WhatsApp sending is disabled. Integration: {integration.ready ? 'Configured and deployment marked verified' : `Setup required: ${integration.missing.join(', ') || 'verify account endpoint and approved template mappings'}`}. Delivery status comes from authenticated provider status lookup.</p>}
        {reissuedLink && <p><a href={reissuedLink} rel="noreferrer">Open reissued attendee pass — keep this private link secure</a></p>}
        <p role="status">{busy ? 'Working…' : notice}</p>
        {!items.length && !busy && <p>No matching registrations loaded.</p>}
        {items.map(b => <article className="ay-admin-booking" key={b.id}><h2>{b.number}</h2><p>{b.contactName} · {b.mobile}</p><p>Status: {b.status} · Registered {b.created}</p><p>WhatsApp: {b.whatsapp?.status || 'legacy booking — no consent recorded'} · Attempts: {b.whatsapp?.attempts || 0}</p>{b.whatsapp?.failure && <p>{b.whatsapp.failure}</p>}{b.whatsapp?.providerRef && <p>Provider reference: {b.whatsapp.providerRef}</p>}{b.whatsapp && <details><summary>WhatsApp history and timestamps</summary><p>Attempted: {b.whatsapp.attemptedAt || '—'} · Accepted: {b.whatsapp.acceptedAt || '—'} · Delivered/read: {b.whatsapp.deliveredAt || '—'}</p>{b.whatsapp.history?.map((entry,i) => <p key={i}>{entry.at} · {entry.providerRef || 'No provider reference'} · {entry.failure}</p>)}</details>}{b.whatsapp?.status === 'failed' && <button type="button" disabled={busy || b.status !== 'active'} onClick={() => setPending({ action: 'whatsapp-retry', bookingId: b.id })}>Retry failed WhatsApp confirmation</button>}<button type="button" disabled={busy} onClick={() => setPending({ action: b.status === 'active' ? 'cancel' : 'restore', bookingId: b.id })}>{b.status === 'active' ? 'Cancel booking' : 'Restore booking'}</button>
          {b.attendees.filter(a => !filters.date || a.dates.includes(filters.date)).map(a => <section key={a.id} className="ay-admin-attendee"><h3>{a.fullName}</h3><p>{a.dates.join(' / ')} · {a.status}</p>{a.passes.filter(p => p.status !== 'superseded').map(p => <AyambilDigitalPass key={p.number} pass={p} />)}<button type="button" disabled={busy || b.status !== 'active'} onClick={() => setPending({ action: 'reissue', bookingId: b.id, attendeeId: a.id })}>Reissue attendee pass</button><details><summary>Pass history</summary>{a.passes.map(p => <p key={p.number}>{p.number} · {p.status}</p>)}</details></section>)}
        </article>)}
        <div className="ay-form-actions"><button type="button" disabled={page <= 1 || busy} onClick={() => load(page - 1)}>Previous</button><span>Page {page}</span><button type="button" disabled={!hasMore || busy} onClick={() => load(page + 1)}>Next</button></div>
        {pending && <section className="ay-admin-confirm" aria-labelledby="ay-admin-confirm-heading"><h2 id="ay-admin-confirm-heading">Confirm {pending.action}</h2><p>{pending.action === 'whatsapp-retry' ? 'Retry this confirmed failed confirmation? The same booking and passes will be reused. Queued does not mean delivered.' : pending.action === 'reissue' ? 'A new number will be issued. The previous pass will remain in history as superseded. Previously downloaded files cannot be recalled.' : pending.action === 'cancel' ? 'Cancel this booking and all attendee passes? Previously downloaded files cannot be recalled.' : 'Restore this booking and its latest attendee passes?'}</p><button type="button" disabled={busy} onClick={change}>Confirm {pending.action}</button><button type="button" disabled={busy} onClick={() => setPending(null)}>Keep unchanged</button></section>}
      </>}
      {error && <p role="alert" className="ay-form-error">{error}</p>}
    </main></div>;
}
