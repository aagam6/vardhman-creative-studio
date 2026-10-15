import {randomUUID} from 'node:crypto';

// Never log URLs, query parameters, bodies, cookies, IPs or provider payloads.
export function requestLogging(req,res,next) {
 const started=performance.now();const requestId=randomUUID();
 res.set('X-Request-Id',requestId);
 let recorded=false;
 const record=aborted=>{
  if(recorded)return;recorded=true;
  const endpoint=typeof req.route?.path==='string'?req.route.path:'unmatched';
  const method=['GET','POST','HEAD','OPTIONS','PUT','PATCH','DELETE'].includes(req.method)?req.method:'OTHER';
  console.log(JSON.stringify({operation:'api.request',requestId:res.getHeader('X-Request-Id')||requestId,method,endpoint,status:aborted?499:res.statusCode,durationMs:Math.round(performance.now()-started),...(aborted?{aborted:true}:{})}));
 };
 res.once('finish',()=>record(false));
 res.once('close',()=>record(!res.writableFinished));
 next();
}
