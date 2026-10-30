import express from 'express';
import {createHash} from 'node:crypto';
import {createSessionStore} from './session-store.mjs';
import {UpdhanError} from './errors.mjs';
// Mount only in an independently reviewed composition. No mock endpoints,
// default identity, environment loading, migration or automatic worker.
export function createUpdhanProductionRouter({service,pool,origin,authenticate,rateSecret,loopbackStaging=false}){
 if(typeof authenticate!=='function'||typeof rateSecret!=='string'||rateSecret.length<32||!/^https:\/\//.test(origin)&&!(loopbackStaging&&/^http:\/\/127\.0\.0\.1:\d+$/.test(origin)))throw Error('Explicit trusted authentication, origin and rate secret required');
 const api=express.Router(),sessions=createSessionStore(pool),cookie=loopbackStaging?'updhan_staging_session':'__Host-updhan';
 const route=fn=>async(req,res,next)=>{try{await fn(req,res,next);}catch(e){next(e);}};
 api.use((req,res,next)=>{res.set({'Cache-Control':'private, no-store','CDN-Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'});if(req.headers.origin&&req.headers.origin!==origin||req.method!=='GET'&&req.headers.origin!==origin)return res.status(403).json({error:'Exact origin required'});next();});
 api.use(route(async(req,res,next)=>{const operation=req.path==='/register'?'register':req.path==='/admin/login'?'login':'admin',key=createHash('sha256').update(rateSecret+operation+req.socket.remoteAddress+Math.floor(Date.now()/60000)).digest('hex');await pool.execute('INSERT INTO updhan_rate_limits(bucket_key,hits,expires_at) VALUES (?,1,DATE_ADD(UTC_TIMESTAMP(),INTERVAL 2 MINUTE)) ON DUPLICATE KEY UPDATE hits=hits+1',[key]);const [[r]]=await pool.execute('SELECT hits FROM updhan_rate_limits WHERE bucket_key=?',[key]);if(r.hits>(operation==='login'?5:operation==='register'?20:180))return res.status(429).set('Retry-After','60').json({error:'Try later'});next();}));
 api.use(express.json({limit:'3mb'}));
 const token=req=>(req.headers.cookie||'').split(';').map(v=>v.trim()).find(v=>v.startsWith(cookie+'='))?.slice(cookie.length+1)||'';
 const admin=route(async(req,res,next)=>{req.session=await sessions.read(token(req),req.method==='GET'?undefined:String(req.headers['x-csrf-token']||''));req.actor=req.session.actor;if(authenticate.revalidate&&!await authenticate.revalidate(req.actor)){await sessions.revoke(token(req));throw new UpdhanError(401,'Administrator sign-in required');}next();});
 api.get('/status',route(async(req,res)=>res.json(await service.status())));
 api.post('/register',route(async(req,res)=>{const {photo,...body}=req.body||{};if(typeof photo?.base64!=='string'||!/^[A-Za-z0-9+/]*={0,2}$/.test(photo.base64))throw new UpdhanError(400,'Invalid photo');res.json(await service.register({...body,photo:{mime:photo.mime,bytes:Buffer.from(photo.base64,'base64')}}));}));
 api.post('/admin/login',route(async(req,res)=>{if(typeof req.body?.email!=='string'||req.body.email.length>254||typeof req.body?.password!=='string'||req.body.password.length>256)throw new UpdhanError(400,'Invalid sign-in');const actor=await authenticate(req.body.email.trim().toLowerCase(),req.body.password);if(!actor?.roles?.includes('updhan_admin'))throw new UpdhanError(401,'Sign-in failed');const s=await sessions.issue(actor);res.cookie(cookie,s.token,{httpOnly:true,secure:!loopbackStaging,sameSite:'strict',path:'/',maxAge:s.lifetimeMs});res.json({authenticated:true,csrfToken:s.csrf});}));
 api.get('/admin/session',admin,(req,res)=>res.json({authenticated:true,csrfToken:req.session.csrf}));
 api.post('/admin/logout',admin,route(async(req,res)=>{await sessions.revoke(token(req));res.clearCookie(cookie,{path:'/',httpOnly:true,secure:!loopbackStaging,sameSite:'strict'});res.json({authenticated:false});}));
 api.get('/admin/applications',admin,route(async(req,res)=>res.json(await service.list(req.actor,req.query))));
 api.get('/admin/summary',admin,route(async(req,res)=>res.json(await service.summary(req.actor))));
 api.get('/admin/application/:id',admin,route(async(req,res)=>res.json(await service.detail(req.actor,req.params.id))));
 api.get('/admin/photo/:id',admin,route(async(req,res)=>res.type('jpeg').send(await service.photo(req.actor,req.params.id))));
 api.get('/admin/health/:id',admin,route(async(req,res)=>res.json(await service.health(req.actor,req.params.id))));
 api.get('/admin/duplicates',admin,route(async(req,res)=>res.json(await service.duplicates(req.actor,req.query))));
 for(const [path,action] of [['change',(a,b)=>service.operations.change(a,b)],['settings',(a,b)=>service.operations.configure(a,b)],['attendance',(a,b)=>service.operations.attendance(a,b)],['duplicate-review',(a,b)=>service.reviewDuplicate(a,b)],['notification-preview',(a,b)=>service.notificationPreview(a,b)],['notification-send-reviewed',(a,b)=>service.sendReviewed(a,b)],['withdraw-consent',(a,b)=>service.withdrawConsent(a,b.id)]])api.post('/admin/'+path,admin,route(async(req,res)=>res.json(await action(req.actor,req.body))));
 // Reviewed-send route is present but service activation defaults off; an exact
 // provider contract, shared budget and separate approval are prerequisites.
 api.use((req,res)=>res.status(404).json({error:'Unknown Updhan route'}));
 api.use((e,req,res,next)=>{void next;const status=e instanceof UpdhanError?e.status:e.type==='entity.too.large'?413:e.type==='entity.parse.failed'?400:503;res.status(status).json({error:e instanceof UpdhanError?e.message:'Updhan unavailable'});});
 return api;
}
