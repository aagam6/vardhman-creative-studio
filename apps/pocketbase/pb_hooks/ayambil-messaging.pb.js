cronAdd('ayambil_whatsapp_outbox','* * * * *',()=>{
  try { require(__hooks+'/ayambil/messaging.cjs').poll($app,options=>$http.send(options)); } catch { /* Preserve the last confirmed status. */ }
  try { require(__hooks+'/ayambil/messaging.cjs').process($app,options=>$http.send(options)); }
  catch { /* Preserve queued records. Do not log private payloads or provider credentials. */ }
});
routerAdd('POST','/api/ayambil/admin/whatsapp-retry',e=>e.json(200,require(__hooks+'/ayambil/messaging.cjs').retry(e.app,e,e.requestInfo().body)), $apis.requireAuth('ayambil_admins'),$apis.bodyLimit(16384),$apis.skipSuccessActivityLog());
routerAdd('POST','/api/ayambil/pass-download',e=>{
  e.response.header().set('Cache-Control','no-store'); e.response.header().set('Referrer-Policy','no-referrer');
  return e.json(200,require(__hooks+'/ayambil/messaging.cjs').download(e.app,e.requestInfo().body.key));
},$apis.bodyLimit(4096),$apis.skipSuccessActivityLog());
