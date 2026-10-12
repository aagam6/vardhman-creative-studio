import {createMessageQueue} from './message-queue.mjs';
import {fileURLToPath} from 'node:url';
import mysql from 'mysql2/promise';
import {configuration} from './config.mjs';
import {createStore} from './store.mjs';
import {createApp} from './app.mjs';
import {createLeadRouter} from './leads.mjs';
import {createFlow} from './vardhmanflow.mjs';
import {hostingerBootstrap} from './hostinger-bootstrap.mjs';
import {startupDiagnostic} from './startup-diagnostics.mjs';

// Canonical entry point: apps/api/server.mjs. No automatic schema changes.
let stage='configuration';
try {
  const config=configuration(process.env);
  stage='port';
  const port=Number(process.env.PORT);
  if(!Number.isInteger(port)||port<1||port>65535)throw new Error('Valid platform PORT required');
  stage='pool';const pool=mysql.createPool(config.database);
  stage='messaging';
  const flow=createFlow(process.env);
  const queue=process.env.AYAMBIL_WHATSAPP_ENABLED==='true'?createMessageQueue(pool,flow,process.env):null;
  const store=createStore(pool,config,{queue,adminRecipients:(process.env.AYAMBIL_WHATSAPP_ADMIN_RECIPIENTS||'').split(',').map(s=>s.trim()).filter(Boolean)});
  stage='application';let initialized=false;
  const app=createApp({leadRouter:createLeadRouter({pool,store,config,isInitialized:()=>initialized}),legacyLeadRouter:createLeadRouter({pool,store,config,legacy:true,isInitialized:()=>initialized}),store,config,flow,queue,isInitialized:()=>initialized,testRecipient:process.env.AYAMBIL_STAGING_BUILD==='true'&&config.origin==='https://white-reindeer-590806.hostingersite.com'?process.env.AYAMBIL_WHATSAPP_TEST_RECIPIENT:undefined,staticDirectory:fileURLToPath(new URL('../../dist/apps/web',import.meta.url))});
  const host=process.env.AYAMBIL_LISTEN_HOST || '0.0.0.0';
  if(!['0.0.0.0','127.0.0.1'].includes(host))throw new Error('Unsupported listen host');
  stage='listener';const server=app.listen(port,host);
  server.on('error',()=>{console.error('Ayambil listener failed. Verify platform listener configuration.');process.exitCode=1;});
  // Listen synchronously before any database or password-hashing work. Fail closed.
  void (async()=>{let initializationStage='bootstrap';try{
    const bootstrap=await hostingerBootstrap(pool,process.env);
    initializationStage='queue-schema';if(queue){const [versions]=await pool.query('SELECT version FROM ayambil_schema_version WHERE version=2');if(!versions.length)throw Error();}
    initializationStage='readiness';
    if(!await store.ready())throw Error();
    initialized=true;
    console.log(bootstrap.requested?'Ayambil initialization verified; remove stored bootstrap approval and password variables.':'Ayambil API readiness verified.');
  }catch(error){console.error('Ayambil initialization unavailable. '+startupDiagnostic(initializationStage,error));}})();
  for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>server.close(()=>pool.end().finally(()=>process.exit(0))));
} catch(error) {
  // Driver errors can contain connection/user details; never print them.
  console.error('Ayambil API startup failed. '+startupDiagnostic(stage,error));process.exitCode=1;
}
