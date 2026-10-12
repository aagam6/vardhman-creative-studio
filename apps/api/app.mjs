import express from 'express';
import {randomUUID} from 'node:crypto';
import {attendeeContext} from './notification-context.mjs';
import {normalizePhone} from './vardhmanflow.mjs';

import {ApiError,programme} from './config.mjs';
import {hash,rateHash} from './security.mjs';
const cookieName='__Host-ayambil';
export function createApp({leadRouter,legacyLeadRouter,store,config,staticDirectory,flow,queue,testRecipient,isInitialized=()=>true}) {
  const app=express();app.disable('x-powered-by');app.set('trust proxy',false);
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
  api.get('/health',route(async(req,res)=>{try{if(!await store.ready())throw new Error();res.json({ready:true});}catch{res.status(503).json({ready:false});}}));
  api.get('/status',route(async(req,res)=>{try{res.json(await store.status());}catch{res.status(503).json({ready:false,open:false,whatsapp:'disabled'});}}));
  api.post('/register',limited('register',10),route(async(req,res)=>res.json(await store.register(req.body))));
  api.post('/pass-download',limited('download',30),route(async(req,res)=>res.json(await store.download(req.body?.key))));
  api.post('/admin/login',limited('login',5),route(async(req,res)=>{
    if(typeof req.body?.email!=='string'||req.body.email.length>254||typeof req.body.password!=='string'||req.body.password.length>256)throw new ApiError(400,'Invalid sign-in');
    const session=await store.login(req.body.email.trim().toLowerCase(),req.body.password);
    res.cookie(cookieName,session.token,{secure:true,httpOnly:true,sameSite:'strict',path:'/',maxAge:8*3600000});res.json({authenticated:true,csrfToken:session.csrf});
  }));
  api.get('/admin/session',admin,route(async(req,res)=>res.json({authenticated:true})));
  api.post('/admin/session',route(async(req,res)=>res.json(await store.restoreSession(token(req)))));
  api.post('/admin/logout',admin,route(async(req,res)=>{await store.logout(token(req));res.clearCookie(cookieName,{secure:true,httpOnly:true,sameSite:'strict',path:'/'});res.json({authenticated:false});}));
  api.get('/admin/bookings',admin,route(async(req,res)=>{
    const requestId=randomUUID();res.set('X-Request-Id',requestId);
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
  api.post('/admin/change',admin,route(async(req,res)=>res.json(await store.change(req.actor,req.body))));
  api.post('/admin/whatsapp-retry',admin,(req,res)=>res.status(403).json({error:'WhatsApp sending and retries disabled'}));
  api.get('/admin/whatsapp',admin,route(async(req,res)=>res.json(flow?flow.configuration():{ready:false,configured:false,sending:false,missing:['VARDHMAN_FLOW_API_KEY','VARDHMAN_FLOW_API_SECRET']})));
  api.get('/admin/messages',admin,route(async(req,res)=>res.json({items:queue?await queue.list():[]})));
  api.post('/admin/messages/reminder',admin,limited('flow-reminder',5),route(async(req,res)=>{if(!queue||typeof req.body?.bookingId!=='string'||req.body.bookingId.length!==36)throw new ApiError(400,'Messaging configuration and booking required');await store.enqueueReminder(queue,req.body.bookingId);res.json({queued:true,delivered:false});}));
  api.post('/admin/messages/process',admin,limited('flow-process',5),route(async(req,res)=>{if(config.normalProcessingApproved!==true)throw new ApiError(403,'Normal message processing requires separate approval');if(!queue)throw new ApiError(503,'Messaging configuration required');res.json(await queue.runOne());}));
  api.post('/admin/messages/process-test',admin,limited('flow-test-process',2),route(async(req,res)=>{if(!queue||!testRecipient)throw new ApiError(503,'Authorized test configuration required');res.json(await queue.runTest(req.body?.id));}));
  api.post('/admin/messages/status',admin,route(async(req,res)=>{if(!queue||typeof req.body?.id!=='string'||req.body.id.length>36)throw new ApiError(400,'Message identifier required');res.json(await queue.reconcile(req.body.id));}));
  api.post('/admin/messages/test',admin,limited('flow-test',2),route(async(req,res)=>{
    if(!queue||!testRecipient||typeof req.body?.requestKey!=='string'||!/^[a-f0-9]{64}$/.test(req.body.requestKey))throw new ApiError(503,'Configured authorized test recipient and request identifier required');
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
  api.use((error,req,res,next)=>{void next;const status=error instanceof ApiError?error.status:error.type==='entity.parse.failed'?400:error.type==='entity.too.large'?413:503;res.status(status).json({error:error instanceof ApiError?error.message:status===400?'Invalid JSON':'API unavailable'});});
  app.use('/api/ayambil',api);
  // Other API namespaces must never serve index.html or accidentally proxy the
  // unrelated existing /hcgi/platform lead backend.
  if(leadRouter)app.use('/api/leads',leadRouter);
  if(legacyLeadRouter)app.use('/hcgi/platform/api/collections/leads/records',legacyLeadRouter);
  app.use('/api',(req,res)=>res.set('Cache-Control','no-store').status(404).json({error:'API unavailable'}));
  app.use('/hcgi/platform',(req,res)=>res.set('Cache-Control','no-store').status(503).json({error:'Legacy backend routing requires separate configuration'}));
  app.use(['/admin/ayambil','/500-akhand-ayambil-vijayollas/passes'],(req,res,next)=>{res.set({'Cache-Control':'no-store','Referrer-Policy':'no-referrer'});next();});
  app.use(express.static(staticDirectory,{index:false}));
  app.get('/{*path}',(req,res)=>res.sendFile('index.html',{root:staticDirectory}));
  return app;
}
