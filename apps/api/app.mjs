import {templateMappingSummary,buildBilingualMockPayload} from './bilingual-template-adapter.mjs';
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {requestLogging} from './request-logging.mjs';
import express from 'express';
import {publicSeo} from './public-seo.mjs';
import {randomUUID} from 'node:crypto';
import {attendeeContext} from './notification-context.mjs';
import {normalizePhone} from './vardhmanflow.mjs';

import {ApiError,programme} from './config.mjs';
import {hash,rateHash} from './security.mjs';
const cookieName='__Host-ayambil';
export function createApp({leadRouter,legacyLeadRouter,store,config,staticDirectory,flow,queue,notifications,testRecipient,isInitialized=()=>true,getQueueWorkerStatus=()=>({enabled:false,active:false}),getNotificationWorkerStatus=()=>({enabled:false,active:false})}) {
  const app=express();app.disable('x-powered-by');app.set('trust proxy',false);
  // Also protect early failures and other API namespaces, before routing/auth.
  app.use(['/api','/hcgi/platform','/admin/ayambil','/500-akhand-ayambil-vijayollas/passes','/500-akhand-ayambil-vijayollas/respond'],(req,res,next)=>{
    res.set({'Cache-Control':'private, no-store, max-age=0, must-revalidate','CDN-Cache-Control':'no-store','Surrogate-Control':'no-store','Pragma':'no-cache','Expires':'0'});next();
  });
  app.use('/api/ayambil',requestLogging);
  app.use('/api/ayambil',(req,res,next)=>{if(config.bookingControls&&req.method!=='GET'&&/^(\/admin\/messages\/|\/admin\/whatsapp-retry)/.test(req.path))return res.status(403).json({error:'Messaging operations disabled during booking-controls release',errorCode:'BOOKING_CONTROLS_SEND_DISABLED'});next();});
  const testSendingAvailable = config.stagingBuild === true && config.origin === 'https://white-reindeer-590806.hostingersite.com' && Boolean(testRecipient && queue && flow);
  const testOnly = (req,res,next) => testSendingAvailable ? next() : res.status(403).json({error:'Test sending is available only on authorized staging',errorCode:'STAGING_TEST_ONLY'});
  const api=express.Router();
  api.use((req,res,next)=>{res.set({'Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff'});next();});
  api.use((req,res,next)=>{if(!isInitialized())return res.status(503).json({ready:false,open:false,whatsapp:'disabled',error:'API initialization unavailable'});next();});
  api.use(express.json({limit:'32kb'}));
  // No CORS wildcard. Mutating browser requests require the exact configured
  // origin; admin mutations additionally require session-bound CSRF proof.
  api.use((req,res,next)=>{if(req.headers.origin&&req.headers.origin!==config.origin)return next(new ApiError(403,'Origin not allowed'));if(req.method==='POST'&&req.headers.origin!==config.origin)return next(new ApiError(403,'Exact site origin required'));next();});
  const route=fn=>async(req,res,next)=>{try{await fn(req,res);}catch(error){next(error);}};
  const token=req=>{const match=(req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith(cookieName+'='));return match?match.slice(cookieName.length+1):'';};
  const admin=async(req,res,next)=>{try{req.actor=await store.session(token(req));if(req.method==='POST'&&hash(String(req.headers['x-csrf-token']||''))!==req.actor.csrf_hash)throw new ApiError(403,'Session confirmation required');next();}catch(error){next(error);}};
  const limited=(operation,max)=>async(req,res,next)=>{try{const bucket=rateHash(config.rateSecret,operation+':'+req.socket.remoteAddress);if(!await store.limit(bucket,max))throw new ApiError(429,'Too many requests');next();}catch(error){next(error);}};
  if(notifications){
   api.get('/admin/notification-outbox',admin,route(async(req,res)=>res.json({dispatchEnabled:config.notificationDispatch===true,owner:await notifications.owner(),transactionalWorker:getNotificationWorkerStatus(),...await notifications.list(req.query.page||1),intents:await notifications.intents(req.query.page||1)})));
   api.post('/admin/notification-outbox/notice',admin,limited('notification-notice',4),route(async(req,res)=>res.json(await notifications.prepareEntryNotice(req.body,req.actor))));
   api.post('/admin/notification-outbox/prepare',admin,limited('notification-prepare',10),route(async(req,res)=>res.json({id:await notifications.enqueueHeldIntent(req.body.id,{token:req.body.token}),sent:false})));
   api.post('/admin/notification-outbox/prepare-subject',admin,limited('notification-prepare',10),route(async(req,res)=>{if(!req.body||Object.keys(req.body).some(k=>!['purpose','subject'].includes(k)))throw new ApiError(400,'Only exact notification purpose and subject permitted');res.json(await notifications.prepareSubject(req.body,req.actor,store.bookingControls));}));
   api.post('/admin/notification-outbox/owner',admin,route(async(req,res)=>res.json(await notifications.handover(req.body,req.actor))));
   api.post('/admin/notification-outbox/reconcile',admin,limited('notification-status',10),route(async(req,res)=>res.json(await notifications.reconcile(req.body.id,req.actor))));
   api.post('/admin/notification-outbox/send',admin,limited('notification-dispatch',4),route(async(req,res)=>{if(config.notificationDispatch!==true)throw new ApiError(403,'Notification dispatch disabled');if(req.body.confirmation!=='SEND ONE REVIEWED MESSAGE')throw new ApiError(400,'Exact single-message confirmation required');res.json(await notifications.runOne(req.body.id,{ownershipVersion:req.body.version,actor:req.actor.admin_id}));}));
  }
  api.get('/health',route(async(req,res)=>{try{if(!await store.ready())throw new Error();res.json({ready:true});}catch{res.status(503).json({ready:false});}}));
  api.get('/status',route(async(req,res)=>{try{res.json(await store.status());}catch{res.status(503).json({ready:false,open:false,whatsapp:'disabled'});}}));
  // Feature is absent unless explicitly enabled by the guarded store.
  if(store.bookingControls){
    const controls=store.bookingControls;
    api.get('/booking-availability',route(async(req,res)=>res.json({events:await controls.availability()})));
    api.get('/admin/booking-controls/templates',admin,route(async(req,res)=>res.json({items:templateMappingSummary(),sendingDisabled:true})));
    api.post('/admin/booking-controls/template-preview',admin,route(async(req,res)=>res.json(buildBilingualMockPayload(req.body.purpose,req.body.data))));
    api.get('/admin/booking-controls/dashboard',admin,route(async(req,res)=>res.json(await controls.dashboard(req.query))));
    api.get('/admin/booking-controls',admin,route(async(req,res)=>res.json(config.disposable?await controls.workspace():await controls.dashboard(req.query))));
    for(const [path,handler] of [
      ['event',b=>controls.update(b.actor,b.body)],['approve',b=>controls.approve(b.actor,b.body.id)],
      ['review-create',b=>controls.createReview(b.actor,b.body)],['review-link',b=>controls.link(b.actor,b.body.id)],
      ['review-revoke',b=>controls.revoke(b.actor,b.body.id)],['follow-up-preview',b=>controls.prepareFollowUp(b.actor,b.body)],['review-decision',b=>controls.review(b.actor,b.body)]
    ])api.post('/admin/booking-controls/'+path,admin,route(async(req,res)=>res.json(await handler(req))));
    api.get('/family-review',limited('family-review',30),route(async(req,res)=>res.json(await controls.family(req.headers['x-review-token']))));
    api.post('/family-review',limited('family-review-response',10),route(async(req,res)=>res.json(await controls.respond(req.headers['x-review-token'],req.body))));
  }
  api.post('/register',limited('register',10),route(async(req,res)=>res.json(await store.register(req.body))));
  api.post('/pass-download',limited('download',30),route(async(req,res)=>res.json(await store.download(req.body?.key))));
  api.post('/booking-pass-download',limited('download',30),route(async(req,res)=>res.json(await store.downloadBooking(req.body?.key))));
  api.post('/admin/login',limited('login',5),route(async(req,res)=>{
    if(typeof req.body?.email!=='string'||req.body.email.length>254||typeof req.body.password!=='string'||req.body.password.length>256)throw new ApiError(400,'Invalid sign-in');
    const session=await store.login(req.body.email.trim().toLowerCase(),req.body.password);
    res.cookie(cookieName,session.token,{secure:true,httpOnly:true,sameSite:'strict',path:'/',maxAge:8*3600000});res.json({authenticated:true,csrfToken:session.csrf});
  }));
  api.get('/admin/session',admin,route(async(req,res)=>res.json({authenticated:true})));
  api.post('/admin/session',route(async(req,res)=>res.json(await store.restoreSession(token(req)))));
  api.post('/admin/logout',route(async(req,res)=>{await store.logout(token(req));res.clearCookie(cookieName,{secure:true,httpOnly:true,sameSite:'strict',path:'/'});res.json({authenticated:false});}));
  api.get('/admin/trash',admin,route(async(req,res)=>res.json(await store.trash(req.query))));
  api.get('/admin/trash/empty-preview',admin,route(async(req,res)=>res.json(await store.localTrashPurge.preview())));
  api.post('/admin/trash/empty',admin,route(async(req,res)=>res.json(await store.localTrashPurge.empty(req.actor,req.body))));
  api.get('/admin/overview',admin,route(async(req,res)=>res.json(await store.overview())));
  api.get('/admin/bookings',admin,route(async(req,res)=>{
    const requestId=res.getHeader('X-Request-Id')||randomUUID();res.set('X-Request-Id',requestId);
    try {res.json(await store.list(req.query));}
    catch(error){
      const stage=['bookings.filters','bookings.select','bookings.hydrate'].includes(error.ayambilStage)?error.ayambilStage:'bookings.response';
      const code=error.message==='Queue limit reached.'?'LOCAL_POOL_QUEUE_LIMIT':error.errno===1267?'ER_CANT_AGGREGATE_2COLLATIONS':['ER_CANT_AGGREGATE_2COLLATIONS','ER_CANT_AGGREGATE_3COLLATIONS','ER_CANT_AGGREGATE_NCOLLATIONS','ER_BAD_FIELD_ERROR','ER_NO_SUCH_TABLE','ER_WRONG_ARGUMENTS','ER_PARSE_ERROR','ER_TABLEACCESS_DENIED_ERROR','ER_TRUNCATED_WRONG_VALUE','ER_UNKNOWN_ERROR','ER_TOO_MANY_USER_CONNECTIONS','ER_CON_COUNT_ERROR','ER_MAX_PREPARED_STMT_COUNT_REACHED','ER_QUERY_INTERRUPTED','ER_STATEMENT_TIMEOUT','ER_ACCESS_DENIED_ERROR','PROTOCOL_CONNECTION_LOST','ECONNREFUSED','ECONNRESET','ETIMEDOUT'].includes(error.code)?error.code:'unclassified';
      const errno=Number.isInteger(error.errno)&&error.errno>=0&&error.errno<=65535?error.errno:null;
      const sqlState=typeof error.sqlState==='string'&&/^[A-Z0-9]{5}$/.test(error.sqlState)?error.sqlState:null;
      const category=['TypeError','RangeError','SyntaxError','Error'].includes(error.name)?error.name:'other';
      console.error(JSON.stringify({operation:'admin.bookings',requestId,stage,code,errno,sqlState,category}));throw error;
    }
  }));
  api.post('/admin/change',admin,route(async(req,res)=>{
    const requestId=res.getHeader('X-Request-Id')||randomUUID();res.set('X-Request-Id',requestId);
    try { res.json(await store.change(req.actor,req.body)); }
    catch(error) {
      const stage=['change.transaction','change.lock','change.booking','change.attendees','change.passes','change.audit','change.response'].includes(error.ayambilStage)?error.ayambilStage:'change.unknown';
      const errno=Number.isInteger(error.errno)&&error.errno>=0&&error.errno<=65535?error.errno:null;
      const sqlState=typeof error.sqlState==='string'&&/^[A-Z0-9]{5}$/.test(error.sqlState)?error.sqlState:null;
      const code=['ER_CANT_AGGREGATE_2COLLATIONS','ER_BAD_FIELD_ERROR','ER_NO_SUCH_TABLE','ER_PARSE_ERROR','ER_TABLEACCESS_DENIED_ERROR','ER_DUP_ENTRY','ER_ROW_IS_REFERENCED_2','ER_NO_REFERENCED_ROW_2','ER_CHECK_CONSTRAINT_VIOLATED','ER_LOCK_DEADLOCK','ER_LOCK_WAIT_TIMEOUT','ER_WRONG_ARGUMENTS'].includes(error.code)?error.code:'unclassified';
      console.error(JSON.stringify({operation:'admin.change',requestId,stage,code,errno,sqlState}));throw error;
    }
  }));
  api.post('/admin/whatsapp-retry',admin,(req,res)=>res.status(403).json({error:'WhatsApp sending and retries disabled'}));
  api.get('/admin/whatsapp',admin,route(async(req,res)=>{const worker=getQueueWorkerStatus();res.json({...(flow?flow.configuration():{ready:false,configured:false,sending:false,missing:['VARDHMAN_FLOW_API_KEY','VARDHMAN_FLOW_API_SECRET']}),testSendingAvailable,worker:{enabled:worker.enabled===true,active:worker.active===true,reminder:worker.reminder || {enabled:false,active:false}}});}));
  api.get('/admin/messages',admin,route(async(req,res)=>res.json({items:queue?await queue.list():[]})));
  api.get('/admin/messages/batch-preview',admin,route(async(req,res)=>{
   if(!queue)throw new ApiError(403,'Manual sending disabled');
   if(!['true','false',undefined].includes(req.query.reviewedLegacy))throw new ApiError(400,'Explicit review must be boolean');
   res.json(await queue.previewBatch({type:req.query.type,date:req.query.date,reviewedLegacy:req.query.reviewedLegacy==='true'}));
  }));
  api.post('/admin/messages/reminder',admin,limited('flow-reminder',5),route(async(req,res)=>{if(!queue||typeof req.body?.bookingId!=='string'||req.body.bookingId.length!==36)throw new ApiError(400,'Messaging configuration and booking required');await store.enqueueReminder(queue,req.body.bookingId);res.json({queued:true,delivered:false});}));
  api.post('/admin/messages/process',admin,limited('flow-process',5),route(async(req,res)=>{if(config.normalProcessingApproved!==true)throw new ApiError(403,'Normal message processing requires separate approval');if(!queue)throw new ApiError(503,'Messaging configuration required');res.json(await queue.runOne());}));
  api.post('/admin/messages/process-test',admin,testOnly,limited('flow-test-process',2),route(async(req,res)=>res.json(await queue.runTest(req.body?.id))));
  api.post('/admin/messages/send-selected',admin,limited('flow-manual-send',5),route(async(req,res)=>{
   if(!queue)throw new ApiError(403,'Manual sending disabled');
   if(!req.body||Object.keys(req.body).some(key=>!['id','bookingId','type','reviewedLegacy'].includes(key)))throw new ApiError(400,'Only exact message identifiers and explicit legacy review allowed');
   res.json(await queue.runSelected(req.body,req.actor));
  }));
  api.post('/admin/messages/status',admin,route(async(req,res)=>{if(!queue||typeof req.body?.id!=='string'||req.body.id.length>36)throw new ApiError(400,'Message identifier required');res.json(await queue.reconcile(req.body.id));}));
  api.post('/admin/messages/test',admin,testOnly,limited('flow-test',2),route(async(req,res)=>{
    if(typeof req.body?.requestKey!=='string'||!/^[a-f0-9]{64}$/.test(req.body.requestKey))throw new ApiError(400,'Valid test request identifier required');
    const session=programme.sessions.find(s=>s.date===req.body.eventDate);if(!session)throw new ApiError(400,'Approved evening required');
    if(!flow)throw new ApiError(503,'Provider configuration required');
    const context=flow.compatibilityContext?.(session.date)||attendeeContext(session,'Authorized operator test',normalizePhone(testRecipient));
    await flow.prepare('test',context);
    // Compatibility experiment is one durable job, even across page reloads.
    const id=await store.enqueueTest(queue,{type:'test',dedupe:context.compatibilityTest===true?'staging-body-compatibility-v1':req.body.requestKey,context});
    res.json({queued:true,delivered:false,id});
  }));
  api.post('/admin/whatsapp/inspect',admin,limited('flow-inspect',5),route(async(req,res)=>{if(!flow)throw new ApiError(503,'Provider configuration required');res.json(await flow.inspect({templateDefinitions:true}));}));
  api.use((req,res)=>res.status(404).json({error:'API operation unavailable'}));
  api.use((error,req,res,next)=>{void next;const status=error instanceof ApiError?error.status:error.type==='entity.parse.failed'?400:error.type==='entity.too.large'?413:503;
    if(status>=500){
      const requestId=res.getHeader('X-Request-Id')||randomUUID();res.set('X-Request-Id',requestId);
      const operation=['/admin/session','/admin/change','/admin/logout','/admin/bookings','/admin/overview','/register','/pass-download'].includes(req.path)?req.path:'other';
      const errno=Number.isInteger(error.errno)&&error.errno>=0&&error.errno<=65535?error.errno:null;
      const sqlState=typeof error.sqlState==='string'&&/^[A-Z0-9]{5}$/.test(error.sqlState)?error.sqlState:null;
      console.error(JSON.stringify({operation:'api.failure',endpoint:operation,requestId,errno,sqlState}));
    }
    res.status(status).json({error:error instanceof ApiError?error.message:status===400?'Invalid JSON':'API unavailable'});});
  app.use('/api/ayambil',api);
  // Other API namespaces must never serve index.html or accidentally proxy the
  // unrelated existing /hcgi/platform lead backend.
  if(leadRouter)app.use('/api/leads',leadRouter);
  if(legacyLeadRouter)app.use('/hcgi/platform/api/collections/leads/records',legacyLeadRouter);
  app.use('/api',(req,res)=>res.set('Cache-Control','no-store').status(404).json({error:'API unavailable'}));
  app.use('/hcgi/platform',(req,res)=>res.set('Cache-Control','no-store').status(503).json({error:'Legacy backend routing requires separate configuration'}));
  app.use(['/admin/ayambil','/500-akhand-ayambil-vijayollas/passes','/500-akhand-ayambil-vijayollas/respond'],(req,res,next)=>{res.set({'Cache-Control':'no-store','Referrer-Policy':'no-referrer'});next();});
  app.get('/500-akhand-ayambil-vijayollas/respond',async(req,res,next)=>{try{const html=await readFile(join(staticDirectory,'index.html'),'utf8');res.set('X-Robots-Tag','noindex, nofollow').type('html').send(html.replace(/<!-- Meta Pixel Code -->[\s\S]*?<!-- End Meta Pixel Code -->/g,'').replace(/<noscript>[\s\S]*?<\/noscript>/g,''));}catch(e){next(e);}});
  app.use(publicSeo);
  for(const route of ['/500-akhand-ayambil-vijayollas','/500-akhand-ayambil-vijayollas/manan-sanghvi','/500-akhand-ayambil-vijayollas/sairam-dave']) app.get(route,(req,res)=>res.sendFile(route.slice(1)+'/index.html',{root:staticDirectory}));
  app.use(express.static(staticDirectory,{index:false}));
  app.get('/{*path}',(req,res)=>res.sendFile('index.html',{root:staticDirectory}));
  return app;
}
