// Real PocketBase integration tests; isolated disposable database, no production access.
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { randomBytes, createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, cpSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const binary = process.env.AYAMBIL_TEST_BINARY || path.join(root, '.ayambil-runtime', 'pocketbase.exe');
const db = mkdtempSync(path.join(root, '.ayambil-runtime', 'integration-'));
// Only the isolated test copy permits bookings without live messaging credentials.
// No test bypass exists in the deployed hooks or public status endpoint.
const testHooks = path.join(db,'test-hooks'); cpSync(path.join(root,'apps/pocketbase/pb_hooks'),testHooks,{recursive:true});
const testService = path.join(testHooks,'ayambil/service.cjs');
const gating = "if (!require('./messaging.cjs').settings(k => $os.getenv(k)).ready) throw new ForbiddenError('Backend and WhatsApp deployment verification is required before registration opens.');";
const source = readFileSync(testService,'utf8'); assert.ok(source.includes(gating)); writeFileSync(testService,source.replace(gating,'/* Test fixture only: provider calls are mocked separately. */'));
// Authenticated test-only route in the disposable hook copy; never shipped.
writeFileSync(path.join(testHooks,'flow-fixture.pb.js'),`
routerAdd('POST','/api/test/flow',e=>{
 const values={AYAMBIL_FLOW_API_KEY:'test-only',AYAMBIL_FLOW_API_SECRET:'test-only',AYAMBIL_FLOW_CHANNEL_ID:'test-channel',AYAMBIL_FLOW_API_PREFIX:'/api/v1',AYAMBIL_FLOW_TEMPLATE_02:'event_02',AYAMBIL_FLOW_TEMPLATE_03:'event_03',AYAMBIL_FLOW_LANGUAGE_02:'en',AYAMBIL_FLOW_LANGUAGE_03:'en',AYAMBIL_FLOW_PARAMETERS_02:'["confirmationDetails"]',AYAMBIL_FLOW_PARAMETERS_03:'["confirmationDetails"]',AYAMBIL_PUBLIC_SITE_URL:'https://example.invalid',AYAMBIL_DEPLOYMENT_VERIFIED:'true',AYAMBIL_FLOW_TEMPLATES_VERIFIED:'true'};
 const env=key=>values[key]||'';
 const messaging=require(__hooks+'/ayambil/messaging.cjs');
 const send=options=>{
  if(options.url.endsWith('/account'))return {statusCode:200,json:{success:true,data:{channel:{id:'test-channel',isActive:true,healthStatus:'healthy'}}}};
  if(options.url.includes('/templates?'))return {statusCode:200,json:{success:true,data:['02','03'].map(day=>({name:'event_'+day,language:'en',status:'APPROVED',components:[{type:'BODY',text:'Registration confirmed: {{1}}'}]}))}};
  if(options.url.includes('/messages/status/'))return {statusCode:200,json:{success:true,data:{id:decodeURIComponent(options.url.split('/').pop()),status:'delivered',deliveredAt:'2026-10-10T12:00:00Z'}}};
  const body=JSON.parse(options.body);
  if(!body.to||!body.templateName||body.messaging_product)throw new Error('Invalid provider payload');
  return {statusCode:200,json:{success:true,data:{messageId:'fixture-'+$security.randomString(20),status:'sent'}}};
 };
 messaging.process(e.app,send,env);messaging.poll(e.app,send,env);
 return e.json(200,{mockProvider:true});
},$apis.requireAuth('_superusers'));
`);
const flags = ['--automigrate=false', `--dir=${db}`, `--hooksDir=${testHooks}`, `--migrationsDir=${path.join(root, 'apps/pocketbase/pb_migrations')}`];
const password = randomBytes(32).toString('hex'); const email = 'integration@example.invalid';
const setup = spawnSync(binary, ['superuser', 'upsert', email, password, ...flags], { encoding: 'utf8', windowsHide: true });
assert.equal(setup.status, 0, 'Local test superuser provisioning failed');
const port = 18091; const base = `http://127.0.0.1:${port}`;
let logs = ''; const server = spawn(binary, ['serve', `--http=127.0.0.1:${port}`, ...flags], { env: { ...process.env, AYAMBIL_REGISTRATION_OPEN: 'true' }, windowsHide: true });
server.stdout.on('data', data => { logs += data; }); server.stderr.on('data', data => { logs += data; });
let passed = 0;
async function call(route, { method = 'GET', body, token, headers = {} } = {}) {
  const response = await fetch(base + route, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: token } : {}), ...headers }, ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(15000) });
  const text = await response.text(); let data; try { data = JSON.parse(text); } catch { data = {}; }
  return { status: response.status, data, contentType: response.headers.get('content-type'), cacheControl: response.headers.get('cache-control') };
}
const key = () => randomBytes(32).toString('hex');
const booking = (attendees = [{ fullName: 'Test Attendee', dates: ['2026-11-02'] }]) => ({ contactName: 'Test Contact', mobile: '+919876543210', attendees, eventDate: attendees[0]?.dates[0] || '2026-11-02', whatsappConsent: true, termsAccepted: true, requestKey: key() });
function check(label, action) { action(); passed++; console.log('PASS ' + label); }

try {
  let healthy = false;
  for (let i = 0; i < 50; i++) { try { const response = await call('/api/health'); if (response.status === 200) { healthy = true; break; } } catch {} await delay(100); }
  assert.ok(healthy, 'Local PocketBase failed to start');
  const health = await call('/api/health');
  check('isolated health returns JSON and expected health message',()=>{assert.equal(health.status,200);assert.match(health.contentType,/application\/json/);assert.equal(health.data.message,'API is healthy.');});
  const su = await call('/api/collections/_superusers/auth-with-password', { method: 'POST', body: { identity: email, password } });
  assert.equal(su.status, 200); const superToken = su.data.token;
  const staff = await call('/api/collections/ayambil_admins/records', { method: 'POST', token: superToken, body: { email: 'staff@example.invalid', password, passwordConfirm: password, enabled: true } });
  assert.equal(staff.status, 200);
  const auth = await call('/api/collections/ayambil_admins/auth-with-password', { method: 'POST', body: { identity: 'staff@example.invalid', password } });
  assert.equal(auth.status, 200); const adminToken = auth.data.token;
  const status = await call('/api/ayambil/status'); check('backend configured but registration closed without verified WhatsApp', () => assert.deepEqual(status.data, { ready: true, open: false, whatsapp: 'setup_required' }));
  const one = booking(); const saved = await call('/api/ayambil/register', { method: 'POST', body: one });
  check('single-evening database registration and server-issued pass', () => { assert.equal(saved.status, 200); assert.equal(saved.data.attendees.length, 1); const pass = saved.data.attendees[0].passes[0]; assert.equal(pass.attendeeName, 'Test Attendee'); assert.equal(pass.status, 'active'); assert.match(pass.number, /^AYV26-/); assert.deepEqual(pass.sessions.map(s => s.date), ['2026-11-02']); assert.equal(pass.sessions[0].venue, 'Shri Chandramauleshwar Hall'); });
  check('public confirmation hides internal IDs and booking contact', () => { assert.equal(saved.data.id, undefined); assert.equal(saved.data.mobile, undefined); assert.equal(saved.data.attendees[0].id, undefined); });
  const retry = await call('/api/ayambil/register', { method: 'POST', body: one });
  check('same request retries return same booking and pass', () => assert.deepEqual(retry.data, saved.data));
  const conflict = await call('/api/ayambil/register', { method: 'POST', body: { ...one, contactName: 'Changed Contact' } });
  check('same key with changed payload rejected', () => assert.equal(conflict.status, 400));
  const combined = await call('/api/ayambil/register', { method: 'POST', body: booking([{ fullName: 'Combined Attendee', dates: ['2026-11-03'] }]) });
  check('separate 3 November pass with verified Tagore venue', () => { assert.equal(combined.status, 200); const sessions = combined.data.attendees[0].passes[0].sessions; assert.equal(sessions.length, 1); assert.equal(sessions[0].venue, 'Tagore Hall'); });
  const multi = await call('/api/ayambil/register', { method: 'POST', body: booking([{ fullName: 'First Attendee', dates: ['2026-11-02'] }, { fullName: 'Second Attendee', dates: ['2026-11-02'] }]) });
  check('multiple attendees within one evening with unique passes', () => { assert.equal(multi.status, 200); assert.equal(multi.data.attendees.length, 2); assert.equal(new Set(multi.data.attendees.map(a => a.passes[0].number)).size, 2); });
  check('same mobile permits additional legitimate bookings', () => assert.notEqual(combined.data.number, saved.data.number));
  const concurrentBody = booking(); const concurrent = await Promise.all(Array.from({ length: 4 }, () => call('/api/ayambil/register', { method: 'POST', body: concurrentBody })));
  check('concurrent retries create one consistent booking', () => { assert.ok(concurrent.every(r => r.status === 200)); assert.equal(new Set(concurrent.map(r => r.data.number)).size, 1); });
  for (const dates of [['2026-11-04'], [], ['2026-11-02', '2026-11-02'], ['2026-11-02-morning']]) {
    const invalid = await call('/api/ayambil/register', { method: 'POST', body: booking([{ fullName: 'Invalid Attendee', dates }]) });
    check('reject invalid dates ' + JSON.stringify(dates), () => assert.equal(invalid.status, 400));
  }
  const badName = await call('/api/ayambil/register', { method: 'POST', body: { ...booking(), contactName: '<script>' } });
  check('server rejects markup names', () => assert.equal(badName.status, 400));
  const badMobile = await call('/api/ayambil/register', { method: 'POST', body: { ...booking(), mobile: 'abc' } });
  check('server rejects invalid mobile', () => assert.equal(badMobile.status, 400));
  const invalidPartial = await call('/api/ayambil/register', { method: 'POST', body: booking([{ fullName: 'Valid First', dates: ['2026-11-02'] }, { fullName: '', dates: ['2026-11-03'] }]) });
  check('mixed invalid booking rejected before persistence', () => assert.equal(invalidPartial.status, 400));
  const publicAdmin = await call('/api/ayambil/admin/bookings'); check('anonymous admin list rejected', () => assert.equal(publicAdmin.status, 401));
  const publicChange = await call('/api/ayambil/admin/change', { method: 'POST', body: { action: 'cancel', bookingId: 'not-a-record' } }); check('anonymous admin mutation rejected', () => assert.equal(publicChange.status, 401));
  const publicRecords = await call('/api/collections/ayambil_attendees/records'); check('private attendee collection locked to public', () => { assert.equal(publicRecords.data.totalItems, 0); });
  const publicCreate = await call('/api/collections/ayambil_bookings/records', { method: 'POST', body: { contact_name: 'Bypass Test' } }); check('public direct record creation denied', () => assert.equal(publicCreate.status, 403));
  const list = await call('/api/ayambil/admin/bookings?search=Test%20Attendee', { token: adminToken });
  check('authenticated attendee search', () => { assert.equal(list.status, 200); assert.equal(list.data.items.length, 2); });
  const b = list.data.items.find(b => b.number === saved.data.number); assert.ok(b);
  for (const termsAccepted of [false,undefined,'true']) { const result=await call('/api/ayambil/register',{method:'POST',body:{...booking(),termsAccepted}}); check('pass terms required with boolean acceptance',()=>assert.equal(result.status,400)); }
  const third=await call('/api/ayambil/register',{method:'POST',body:booking(['First Test','Second Test','Third Test'].map(fullName=>({fullName,dates:['2026-11-02']})))});check('direct API rejects third attendee',()=>assert.equal(third.status,400));
  const missingConsent = await call('/api/ayambil/register',{method:'POST',body:{...booking(),whatsappConsent:false}});
  check('explicit WhatsApp consent is mandatory',()=>assert.equal(missingConsent.status,400));
  const wrongEvening = await call('/api/ayambil/register',{method:'POST',body:booking([{fullName:'First Attendee',dates:['2026-11-02']},{fullName:'Second Attendee',dates:['2026-11-03']}])});
  check('mixed evenings rejected within a booking',()=>assert.equal(wrongEvening.status,400));
  const combinedRejected = await call('/api/ayambil/register',{method:'POST',body:booking([{fullName:'Combined Attendee',dates:['2026-11-02','2026-11-03']}])});
  check('combined registration rejected',()=>assert.equal(combinedRejected.status,400));
  const messageRows = await call('/api/collections/ayambil_messages/records?filter='+encodeURIComponent(`booking="${b.id}"`),{token:superToken});
  check('registration creates exactly one durable queued confirmation',()=>{assert.equal(messageRows.data.totalItems,1);assert.equal(messageRows.data.items[0].status,'queued');});
  const message = messageRows.data.items[0];const downloadKey=key();
  await call(`/api/collections/ayambil_messages/records/${message.id}`,{method:'PATCH',token:superToken,body:{download_hash:createHash('sha256').update(downloadKey).digest('hex'),download_key:downloadKey,provider_ref:'flow-test',provider:'vardhmanflow'}});
  const legacy = await call('/api/ayambil/pass-download',{method:'POST',body:{key:downloadKey}});
  check('legacy booking capability is denied',()=>assert.equal(legacy.status,404));
  const passRecords = await call('/api/collections/ayambil_passes/records?perPage=100',{token:superToken});
  for (const attendee of multi.data.attendees) {
    const multiPass = passRecords.data.items.find(p=>p.number===attendee.passes[0].number);
    const attendeeKey=key();
    await call(`/api/collections/ayambil_passes/records/${multiPass.id}`,{method:'PATCH',token:superToken,body:{download_hash:createHash('sha256').update(attendeeKey).digest('hex'),download_key:attendeeKey,download_expires:new Date(Date.now()+86400000).toISOString()}});
    const own = await call('/api/ayambil/pass-download',{method:'POST',body:{key:attendeeKey,bookingId:b.id}});
    check('multi-attendee capability returns only '+attendee.fullName,()=>{assert.equal(own.status,200);assert.equal(own.data.passes.length,1);assert.equal(own.data.passes[0].attendeeName,attendee.fullName);assert.equal(own.cacheControl,'no-store');});
  }
  const passRecord = passRecords.data.items.find(p=>p.number===saved.data.attendees[0].passes[0].number);
  const expiry = new Date(Date.now()+86400000).toISOString();
  await call(`/api/collections/ayambil_passes/records/${passRecord.id}`,{method:'PATCH',token:superToken,body:{download_hash:createHash('sha256').update(downloadKey).digest('hex'),download_key:downloadKey,download_expires:expiry}});
  const downloads=await call('/api/ayambil/pass-download',{method:'POST',body:{key:downloadKey}});
  check('private pass download returns only matching saved passes',()=>{assert.equal(downloads.status,200);assert.equal(downloads.data.passes[0].sessions[0].date,'2026-11-02');assert.equal(downloads.data.mobile,undefined);});
  const invalidDownload=await call('/api/ayambil/pass-download',{method:'POST',body:{key:key()}});check('invalid download capability rejected',()=>assert.equal(invalidDownload.status,404));
  const missingDownload=await call('/api/ayambil/pass-download',{method:'POST',body:{}});check('missing pass capability denied',()=>assert.equal(missingDownload.status,404));
  await call(`/api/collections/ayambil_passes/records/${passRecord.id}`,{method:'PATCH',token:superToken,body:{download_expires:'2020-01-01T00:00:00.000Z'}});
  const expiredDownload=await call('/api/ayambil/pass-download',{method:'POST',body:{key:downloadKey}});check('expired private download rejected without expiring the pass',()=>assert.equal(expiredDownload.status,404));
  await call(`/api/collections/ayambil_passes/records/${passRecord.id}`,{method:'PATCH',token:superToken,body:{download_expires:expiry}});
  const unsigned=await call('/api/ayambil/whatsapp-webhook',{method:'POST',body:{entry:[]}});check('undocumented webhook endpoint is absent',()=>assert.equal(unsigned.status,404));
  const mocked=await call('/api/test/flow',{method:'POST',token:superToken,body:{}});
  check('VardhmanFlow worker and polling execute in real PocketBase with mock HTTP',()=>assert.equal(mocked.status,200));
  const deliveredRows=await call('/api/collections/ayambil_messages/records?filter='+encodeURIComponent(`booking="${b.id}"`),{token:superToken});
  check('provider status lookup persists confirmed delivery and namespace',()=>{assert.equal(deliveredRows.data.items[0].status,'delivered');assert.equal(deliveredRows.data.items[0].provider,'vardhmanflow');assert.ok(deliveredRows.data.items[0].provider_ref.startsWith('fixture-'));});
  const unauthorizedRetry=await call('/api/ayambil/admin/whatsapp-retry',{method:'POST',body:{bookingId:b.id}});check('unauthorized WhatsApp retry blocked',()=>assert.equal(unauthorizedRetry.status,401));
  const noRetry=await call('/api/ayambil/admin/whatsapp-retry',{method:'POST',token:adminToken,body:{bookingId:b.id}});check('delivered message cannot be resent by retry',()=>assert.equal(noRetry.status,400));
  await call(`/api/collections/ayambil_messages/records/${message.id}`,{method:'PATCH',token:superToken,body:{status:'failed'}});
  const messageRetry=await call('/api/ayambil/admin/whatsapp-retry',{method:'POST',token:adminToken,body:{bookingId:b.id}});
  check('authorized failed-message retry queues same booking and passes',()=>assert.equal(messageRetry.status,200));
  const repeatedMessageRetry=await call('/api/ayambil/admin/whatsapp-retry',{method:'POST',token:adminToken,body:{bookingId:b.id}});check('repeated retry does not enqueue duplicates',()=>assert.equal(repeatedMessageRetry.status,400));
  const afterMessageRetry = await call('/api/ayambil/admin/bookings?search='+encodeURIComponent(saved.data.number),{token:adminToken});
  check('message retry preserves original booking and unique pass',()=>{assert.equal(afterMessageRetry.data.items.length,1);assert.equal(afterMessageRetry.data.items[0].attendees[0].passes.length,1);assert.equal(afterMessageRetry.data.items[0].attendees[0].passes[0].number,saved.data.attendees[0].passes[0].number);});
  const cancel = await call('/api/ayambil/admin/change', { method: 'POST', token: adminToken, body: { action: 'cancel', bookingId: b.id } });
  check('cancellation updates booking attendee and pass atomically', () => { assert.equal(cancel.status, 200); assert.equal(cancel.data.status, 'cancelled'); assert.equal(cancel.data.attendees[0].status, 'cancelled'); assert.equal(cancel.data.attendees[0].passes[0].status, 'cancelled'); });
  const cancelledDownload=await call('/api/ayambil/pass-download',{method:'POST',body:{key:downloadKey}});check('cancelled booking blocks private pass download',()=>assert.equal(cancelledDownload.status,404));
  const blocked = await call('/api/ayambil/admin/change', { method: 'POST', token: adminToken, body: { action: 'reissue', bookingId: b.id, attendeeId: b.attendees[0].id } });
  check('cancelled booking cannot issue active pass', () => assert.equal(blocked.status, 400));
  const restore = await call('/api/ayambil/admin/change', { method: 'POST', token: adminToken, body: { action: 'restore', bookingId: b.id } });
  check('restoration reactivates latest pass', () => { assert.equal(restore.status, 200); assert.equal(restore.data.attendees[0].passes[0].status, 'active'); });
  const reissue = await call('/api/ayambil/admin/change', { method: 'POST', token: adminToken, body: { action: 'reissue', bookingId: b.id, attendeeId: b.attendees[0].id } });
  const supersededDownload=await call('/api/ayambil/pass-download',{method:'POST',body:{key:downloadKey}});
  check('reissue invalidates superseded private key',()=>assert.equal(supersededDownload.status,404));
  const reissuedRecords = await call('/api/collections/ayambil_passes/records?perPage=100',{token:superToken});
  const newPass = reissuedRecords.data.items.find(p=>p.number===reissue.data.attendees[0].passes.find(p=>p.status==='active').number);
  const newKey=key();
  await call(`/api/collections/ayambil_passes/records/${newPass.id}`,{method:'PATCH',token:superToken,body:{download_hash:createHash('sha256').update(newKey).digest('hex'),download_key:newKey,download_expires:expiry}});
  const reissuedDownload=await call('/api/ayambil/pass-download',{method:'POST',body:{key:newKey}});
  check('new reissued key returns only new active pass and no-store',()=>{assert.equal(reissuedDownload.status,200);assert.equal(reissuedDownload.data.passes[0].number,newPass.number);assert.equal(reissuedDownload.data.passes.length,1);assert.equal(reissuedDownload.cacheControl,'no-store');});
  check('reissue supersedes old number and retains history', () => { assert.equal(reissue.status, 200); assert.equal(reissue.data.attendees[0].passes.length, 2); assert.equal(reissue.data.attendees[0].passes.filter(p => p.status === 'active').length, 1); assert.notEqual(reissue.data.attendees[0].passes.find(p => p.status === 'active').number, saved.data.attendees[0].passes[0].number); });
  const dateList = await call('/api/ayambil/admin/bookings?date=2026-11-03&status=active', { token: adminToken });
  check('date and status filters', () => { assert.equal(dateList.status, 200); assert.equal(dateList.data.items.length, 1); });
  const directUpdate = await call(`/api/collections/ayambil_passes/records/${b.attendees[0].id}`, { method: 'PATCH', token: adminToken, body: { status: 'active' } });
  check('regular administrator cannot bypass pass mutation endpoint', () => assert.notEqual(directUpdate.status, 200));
  const disable = await call(`/api/collections/ayambil_admins/records/${staff.data.id}`, { method: 'PATCH', token: superToken, body: { enabled: false } }); assert.equal(disable.status, 200);
  const disabled = await call('/api/ayambil/admin/bookings', { token: adminToken }); check('disabled administrator token rejected', () => assert.ok([401,403].includes(disabled.status)));
  const collectionList = await call('/api/collections', { token: superToken });
  const passCollection = collectionList.data.items.find(c => c.name === 'ayambil_passes');
  const forcedFailureSchema = await call(`/api/collections/${passCollection.id}`, { method: 'PATCH', token: superToken, body: { fields: passCollection.fields.map(f => f.name === 'number' ? { ...f, pattern: '^FORCE_FAILURE$' } : f) } });
  assert.equal(forcedFailureSchema.status, 200);
  const rollbackBody = booking([{ fullName: 'Rollback Attendee', dates: ['2026-11-02'] }]);
  const rollback = await call('/api/ayambil/register', { method: 'POST', body: rollbackBody });
  const afterRollback = await call('/api/collections/ayambil_attendees/records?filter=full_name%3D%22Rollback%20Attendee%22', { token: superToken });
  check('pass-save failure rolls back booking and attendee transaction', () => { assert.notEqual(rollback.status, 200); assert.equal(afterRollback.data.totalItems, 0); });
  const restoredSchema = await call(`/api/collections/${passCollection.id}`, { method: 'PATCH', token: superToken, body: { fields: passCollection.fields } }); assert.equal(restoredSchema.status, 200);
  const recovered = await call('/api/ayambil/register', { method: 'POST', body: rollbackBody });
  check('failed transaction can retry same submission successfully', () => { assert.equal(recovered.status, 200); assert.equal(recovered.data.attendees[0].passes.length, 1); });
  check('no QR verification or check-in collections', () => assert.ok(!collectionList.data.items.some(c => /qr|check.?in|verif/i.test(c.name))));
  const config = JSON.parse(readFileSync(path.join(root, 'apps/pocketbase/pb_hooks/ayambil/config.json'), 'utf8'));
  check('no invented capacity closing date or expiry', () => { assert.equal(config.capacity, null); assert.equal(config.closingDate, null); assert.equal(config.passExpiry, null); });
  console.log(`\n${passed} real PocketBase integration checks passed.`);
} catch (error) {
  // Do not dump auth tokens, request bodies, credentials or PocketBase logs.
  console.error('Integration test failed:', error.message);
  process.exitCode = 1;
} finally { server.kill(); }




