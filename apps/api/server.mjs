import {fileURLToPath} from 'node:url';
import mysql from 'mysql2/promise';
import {configuration} from './config.mjs';
import {createStore} from './store.mjs';
import {createApp} from './app.mjs';
// Canonical entry point: apps/api/server.mjs. No automatic schema changes.
try {
  const config=configuration(process.env);
  const port=Number(process.env.PORT);
  if(!Number.isInteger(port)||port<1||port>65535)throw new Error('Valid platform PORT required');
  const pool=mysql.createPool(config.database);
  const store=createStore(pool,config);
  if(!await store.ready())throw new Error('Database schema or event configuration is not ready');
  const app=createApp({store,config,staticDirectory:fileURLToPath(new URL('../../dist/apps/web',import.meta.url))});
  const host=process.env.AYAMBIL_LISTEN_HOST || '0.0.0.0';
  if(!['0.0.0.0','127.0.0.1'].includes(host))throw new Error('Unsupported listen host');
  const server=app.listen(port,host);
  for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>server.close(()=>pool.end().finally(()=>process.exit(0))));
} catch {
  // Driver errors can contain connection/user details; never print them.
  console.error('Ayambil API startup failed. Verify server configuration and reviewed schema.');process.exitCode=1;
}
