// PC-only synthetic MySQL preview. No .env reads, provider imports or workers.
import express from 'express';
import {randomBytes,timingSafeEqual,createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {createServer} from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import {startBookingFixture,fixtureInput} from './booking-controls-fixture.mjs';
import {createApp} from '../apps/api/app.mjs';
import {bookingPassToken} from '../apps/api/booking-pass-link.mjs';
import {programme} from '../apps/api/config.mjs';
const port=process.argv.includes('--direct-responses')?3140:3138,f=await startBookingFixture(port),origin=f.config.origin;
f.config.directFamilyResponses=process.argv.includes('--direct-responses');
const key=randomBytes(32).toString('hex'),cookie=randomBytes(32).toString('hex');
const names=['સ્થાનિક પરિવાર એક','સ્થાનિક પરિવાર બે','સ્થાનિક પરિવાર ત્રણ','સ્થાનિક પરિવાર ચાર','સ્થાનિક પરિવાર પાંચ'];
const update=async(date,mode,capacity)=>{const c=(await f.store.bookingControls.availability()).find(x=>x.event_date===date);await f.store.bookingControls.update(f.actor,{eventDate:date,mode,capacity,version:c.version});};
await update('2026-11-02','open',1800);
const seedExisting=await f.store.register(fixtureInput(names));await f.store.register(fixtureInput([...names,'સ્થાનિક પરિવાર છ']));
await update('2026-11-02','open',1800);await update('2026-11-03','waiting',20);await f.store.register(fixtureInput(['LOCAL Waiting Guest','સ્થાનિક સાથી'],'2026-11-03'));

// Deliberate synthetic exact/subset/partial families and 520 distinct contacts for pagination.
const demoNames=['આરવ શાહ','કિરણ શાહ','મયૂર શાહ','દીપા શાહ','રૂપા શાહ'];
await f.store.register(fixtureInput(demoNames,'2026-11-02','+12025550001'));
await f.store.register(fixtureInput(demoNames.slice(0,4),'2026-11-02','+12025550001'));
await f.store.register(fixtureInput(['અનિલ મહેતા','ભાવના મહેતા'],'2026-11-02','+12025550002'));
await f.store.register(fixtureInput(['અનિલ મહેતા','ભાવના મહેતા'],'2026-11-02','+12025550002'));
await f.store.register(fixtureInput(['ભાવના મહેતા','ચેતન મહેતા'],'2026-11-02','+12025550002'));
for(let offset=0;offset<520;offset+=10)await Promise.all(Array.from({length:Math.min(10,520-offset)},(_,i)=>f.store.register(fixtureInput(['Fixture Guest '+String(offset+i).padStart(3,'0')],'2026-11-02','+1202'+String(5600000+offset+i)))));
await f.store.register(fixtureInput(['શ્રીમતી ચંદ્રિકાબેન મહેન્દ્રકુમાર શાંતિલાલ વિજયકુમાર શાહ','શ્રી જયંતિલાલ ચંદુલાલ પ્રવીણકુમાર મણિલાલ સંઘવી'],'2026-11-02','+12025550888'));
const seeded=(await f.store.bookingControls.duplicates()).bookings;
for(const [index,attending] of [[0,'yes'],[1,'no']]){const b=seeded.find(b=>b.mobile==='+1202'+String(5600000+index));const review=await f.store.bookingControls.createReview(f.actor,{purpose:'attendance',bookingIds:[b.id],round:'initial'});const link=await f.store.bookingControls.link(f.actor,review.id);await f.store.bookingControls.respond(link.path.split('#')[1],{attending,names:attending==='yes'?b.names:[],count:attending==='yes'?b.names.length:0});}

const responseBooking=seeded.find(b=>b.mobile==='+12025550888');const responseReview=await f.store.bookingControls.createReview(f.actor,{purpose:'attendance',bookingIds:[responseBooking.id],round:'visual'});const responseLink=await f.store.bookingControls.link(f.actor,responseReview.id);
const gate=express();gate.use(express.json({limit:'32kb'}));gate.use((req,res,next)=>{
 res.set({'Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self' ws://127.0.0.1:"+port+"; img-src 'self' data: blob:; font-src 'self' data:; frame-ancestors 'none'; base-uri 'none'; form-action 'self'"});
 if(req.headers.host!==`127.0.0.1:${port}`||req.method!=='GET'&&req.headers.origin!==origin)return res.sendStatus(403);
 next();
});
gate.post('/api/local-fixture/login',(req,res)=>{
 const entered=String(req.body.key||'');if(entered.length!==key.length||!timingSafeEqual(Buffer.from(entered),Buffer.from(key)))return res.sendStatus(403);
 res.cookie('ayambil_local_fixture',cookie,{httpOnly:true,sameSite:'strict',path:'/',maxAge:8*3600000});res.json({csrfToken:f.session.csrf,localOnly:true});
});
gate.get('/api/local-fixture/session',(req,res)=>req.headers.cookie?.split(';').some(x=>x.trim()==='ayambil_local_fixture='+cookie)?res.json({csrfToken:f.session.csrf,localOnly:true}):res.sendStatus(401));
// Read-only invariants for this synthetic fixture, authenticated by the local cookie.
gate.get('/api/local-fixture/invariants',async(req,res)=>{
 if(!req.headers.cookie?.split(';').some(x=>x.trim()==='ayambil_local_fixture='+cookie))return res.sendStatus(401);
 const [[counts]]=await f.pool.query("SELECT (SELECT COUNT(*) FROM ayambil_bookings) bookings,(SELECT COUNT(*) FROM ayambil_attendees) attendees,(SELECT COUNT(*) FROM ayambil_passes WHERE status='active') activePasses,(SELECT COUNT(*) FROM ayambil_passes WHERE trashed_at IS NOT NULL) trash,(SELECT COUNT(*) FROM ayambil_message_queue) queueRows,(SELECT COALESCE(SUM(attempts),0) FROM ayambil_message_queue) sendAttempts,(SELECT COUNT(*) FROM ayambil_message_queue WHERE provider_id IS NOT NULL) providerIds");
 const [passes]=await f.pool.query('SELECT number,snapshot,status,trashed_at FROM ayambil_passes ORDER BY number');
 const old=(await f.store.bookingControls.duplicates()).bookings.find(b=>b.number===seedExisting.number);
 const single=await f.store.download(seedExisting.downloadKeys[0]),combined=await f.store.downloadBooking(bookingPassToken(f.fixtureQueueKey,old.id,programme.sessions[0]));
 res.json({localOnly:true,database:f.databaseName,counts,providerCalls:f.telemetry.providerCalls,noSendGuard:true,seedOldLinks:{singleValid:single.passes.length===1,combinedValid:combined.passes.length===5},passFingerprints:passes.map(p=>({number:p.number,sha256:createHash('sha256').update(JSON.stringify(p)).digest('hex')}))});
});

gate.use((req,res,next)=>{
 if(req.url.startsWith('/api/')){
  // No send/retry/process/status-reconciliation or old-data mutation route exists in this preview.
  const path=req.url.split('?')[0];const get=['/api/ayambil/status','/api/ayambil/health','/api/ayambil/booking-availability','/api/ayambil/admin/booking-controls','/api/ayambil/admin/booking-controls/dashboard','/api/ayambil/admin/booking-controls/templates','/api/ayambil/admin/overview','/api/ayambil/admin/whatsapp','/api/ayambil/admin/messages','/api/ayambil/admin/messages/batch-preview','/api/ayambil/admin/trash','/api/ayambil/admin/trash/empty-preview','/api/ayambil/admin/session','/api/ayambil/admin/bookings','/api/ayambil/family-review'];
  const post=['/api/ayambil/register','/api/ayambil/pass-download','/api/ayambil/booking-pass-download','/api/ayambil/family-review','/api/ayambil/admin/session','/api/ayambil/admin/logout',...['event','approve','review-create','review-link','review-revoke','review-decision','follow-up-preview','template-preview'].map(x=>'/api/ayambil/admin/booking-controls/'+x)];
  if(!(req.method==='GET'?get:post).includes(path))return res.status(403).json({error:'Local preview: message operations, Trash deletion and existing booking mutations disabled'});
  const authenticated=req.headers.cookie?.split(';').some(x=>x.trim()==='ayambil_local_fixture='+cookie);
  if(authenticated)req.headers.cookie='__Host-ayambil='+f.session.token;else delete req.headers.cookie;
  return api(req,res,next);
 }next();
});
gate.get('/local/booking-controls/family',(req,res)=>res.redirect(307,'/500-akhand-ayambil-vijayollas/respond'));
gate.get(['/local/booking-controls','/local/booking-controls/'],(req,res)=>res.redirect(307,'/admin/ayambil'));
const api=createApp({store:f.store,config:f.config,staticDirectory:resolve('dist/apps/web')});
const vite=await createServer({configFile:false,envFile:false,root:resolve('apps/web'),esbuild:{target:'esnext'},optimizeDeps:{esbuildOptions:{target:'esnext'}},resolve:{alias:{'@':resolve('apps/web/src')}},css:{postcss:{plugins:[tailwindcss({config:resolve('apps/web/tailwind.config.js'),content:[resolve('apps/web/src/**/*.{js,jsx}'),resolve('apps/web/index.html')]}),autoprefixer()]}},server:{host:'127.0.0.1',port,strictPort:true},plugins:[react(),{name:'local-booking-controls',transformIndexHtml(html){return html.replace(/<!-- Meta Pixel Code -->[\s\S]*?<!-- End Meta Pixel Code -->/g,'').replace(/<noscript>[\s\S]*?<\/noscript>/g,'');},configureServer(server){server.middlewares.use(gate);}}]});
await vite.listen();console.log(`LOCAL SYNTHETIC MYSQL ONLY — messaging disabled\nAdmin: ${origin}/admin/ayambil#${key}\nPublic: ${origin}/500-akhand-ayambil-vijayollas/sairam-dave#ay-registration\nResponse: ${origin}${responseLink.path}\nEngine: ${f.databaseName}`);
async function close(){await vite.close();await f.close();process.exit(0);}process.on('SIGINT',close);process.on('SIGTERM',close);
