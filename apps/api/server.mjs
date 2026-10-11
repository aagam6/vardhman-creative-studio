import {createMessageQueue} from './message-queue.mjs';
import {fileURLToPath} from 'node:url';
import mysql from 'mysql2/promise';
import {configuration} from './config.mjs';
import {createStore} from './store.mjs';
import {createApp} from './app.mjs';
import {createFlow} from './vardhmanflow.mjs';
// Canonical entry point: apps/api/server.mjs. No automatic schema changes.
try {
  const config=configuration(process.env);
  const port=Number(process.env.PORT);
  if(!Number.isInteger(port)||port<1||port>65535)throw new Error('Valid platform PORT required');
  const pool=mysql.createPool(config.database);
  const flow=createFlow(process.env);
  const queue=process.env.AYAMBIL_WHATSAPP_ENABLED==='true'?createMessageQueue(pool,flow,process.env):null;
  if(queue){const [versions]=await pool.query('SELECT version FROM ayambil_schema_version WHERE version=2');if(!versions.length)throw Error('Queue migration required');}
  const store=createStore(pool,config,{queue,adminRecipients:(process.env.AYAMBIL_WHATSAPP_ADMIN_RECIPIENTS||'').split(',').map(s=>s.trim()).filter(Boolean)});
  if(!await store.ready())throw new Error('Database schema or event configuration is not ready');
  const app=createApp({store,config,flow,queue,testRecipient:process.env.AYAMBIL_WHATSAPP_TEST_RECIPIENT,staticDirectory:fileURLToPath(new URL('../../dist/apps/web',import.meta.url))});
  const host=process.env.AYAMBIL_LISTEN_HOST || '0.0.0.0';
  if(!['0.0.0.0','127.0.0.1'].includes(host))throw new Error('Unsupported listen host');
  const server=app.listen(port,host);
  for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>server.close(()=>pool.end().finally(()=>process.exit(0))));
} catch {
  // Driver errors can contain connection/user details; never print them.
  console.error('Ayambil API startup failed. Verify server configuration and reviewed schema.');process.exitCode=1;
}
