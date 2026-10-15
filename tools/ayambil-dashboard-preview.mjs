// Synthetic localhost dashboard preview. No database or provider connections.
import {createServer} from 'vite';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import path from 'node:path';
import {readFile} from 'node:fs/promises';
const root=process.cwd();const programme=JSON.parse(await readFile('apps/api/programme.json','utf8'));
const bookings=Array.from({length:4},(_,i)=>({id:`00000000-0000-4000-8000-00000000000${i}`,number:`BOOK26-SYNTHETIC-${i}`,status:i===3?'cancelled':'active',eventDate:programme.sessions[i%2].date,created:'2026-10-15 04:00:00',contactName:['Synthetic Aagam Shah','Synthetic long Gujarati participant name for mobile preview','Synthetic Guest','Cancelled example'][i],mobile:'+12025550123',occupation:'Student',referralSource:'Family',whatsapp:{status:i===1?'failed: 1':'queued: 2',attempts:i===1?1:0,history:[]},attendees:Array.from({length:i===0?6:1},(_,a)=>({id:`attendee-${i}-${a}`,fullName:`Synthetic Participant ${a+1}`,status:i===3?'cancelled':'active',dates:[programme.sessions[i%2].date],passes:[{number:`AYV26-SYNTHETIC-${i}-${a}`,attendeeName:`Synthetic Participant ${a+1}`,status:i===3?'cancelled':'active',sessions:[programme.sessions[i%2]]}]}))}));
const plugin={name:'synthetic-dashboard',configureServer(server){server.middlewares.use('/api/ayambil',async(req,res)=>{
 const url=new URL(req.url,'http://localhost');res.setHeader('Content-Type','application/json');res.setHeader('Cache-Control','no-store');let result;
 if(url.pathname==='/admin/session')result={authenticated:true,csrfToken:'a'.repeat(64)};
 else if(url.pathname==='/admin/bookings')result={items:bookings.filter(b=>(!url.searchParams.get('date')||b.eventDate===url.searchParams.get('date'))&&(!url.searchParams.get('status')||b.status===url.searchParams.get('status'))),page:1,hasMore:false,integration:{ready:false,missing:[]}};
 else if(url.pathname==='/admin/overview')result={scope:'event',totals:{bookings:120,activeBookings:110,cancelledBookings:10,activePasses:400,cancelledPasses:30,pendingMessages:75,failedMessages:3},evenings:[{date:'2026-11-02',bookings:70,activeBookings:65,totalPasses:250,activePasses:230,cancelledPasses:20},{date:'2026-11-03',bookings:50,activeBookings:45,totalPasses:180,activePasses:170,cancelledPasses:10}],activity:[{id:'audit-example',action:'cancel-pass',contactName:'Synthetic Guest',bookingNumber:'BOOK26-SYNTHETIC',actor:'operator@example.invalid',created:'2026-10-15 04:00:00'}]};
 else if(url.pathname==='/admin/whatsapp')result={sending:false,configured:false,missing:[],worker:{enabled:false,active:false}};
 else if(url.pathname==='/admin/messages')result={items:[]};
 else if(url.pathname==='/admin/messages/batch-preview')result={date:url.searchParams.get('date'),type:url.searchParams.get('type'),reviewedLegacy:url.searchParams.get('reviewedLegacy')==='true',items:bookings.filter(b=>b.status==='active').map((b,i)=>({id:`10000000-0000-4000-8000-00000000000${i}`,booking_id:b.id,notification_type:url.searchParams.get('type'),number:b.number,recipientMasked:'••••0123'}))};
 else if(url.pathname==='/admin/change'){let body='';for await(const chunk of req)body+=chunk;const change=JSON.parse(body),booking=bookings.find(b=>b.id===change.bookingId);booking.status=change.action==='cancel'?'cancelled':'active';booking.attendees.forEach(a=>{a.status=booking.status;a.passes.forEach(p=>p.status=booking.status);});result=booking;}
 else if(url.pathname==='/admin/logout')result={authenticated:false};
 else{res.statusCode=403;result={error:'Synthetic preview does not send messages'};}
 res.end(JSON.stringify(result));
 });}};
const server=await createServer({configFile:path.join(root,'apps/web/vite.config.js'),root:path.join(root,'apps/web'),plugins:[plugin],css:{postcss:{plugins:[tailwindcss({config:path.join(root,'apps/web/tailwind.config.js')}),autoprefixer()]}},server:{host:'127.0.0.1',port:3031,strictPort:true}});await server.listen();console.log('Synthetic dashboard: http://127.0.0.1:3031/admin/ayambil');
