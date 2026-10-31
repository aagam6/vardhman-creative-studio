import express from 'express';
import mysql from 'mysql2/promise';
import {isAbsolute,resolve} from 'node:path';
import {createRequire} from 'node:module';
import {randomUUID} from 'node:crypto';
import {createUpdhanProductionService} from './production-service.mjs';
import {createUpdhanSharedAdminRouter} from './shared-admin-router.mjs';
import {privatePhotoStore} from './private-photos.mjs';
import {createPhotoDecoder} from './photo-validation.mjs';
import {verifyUpdhanRuntime} from './runtime-preflight.mjs';
import {updhanSharedDatabaseConfig,updhanIdentityReader} from './shared-db-config.mjs';
import {createUpdhanProductionSender} from './production-sender.mjs';
const require=createRequire(import.meta.url);
// Explicit composition, disabled by default. No DB environment fallback, schema
// changes, worker, provider call or Ayambil readiness dependency.
export function createUpdhanRuntime({env,staticDirectory,reserveRequestBudget}){
 const router=express.Router();let pool,identityPool,ready,sender,stage='configuration';
 const unavailable=(req,res)=>{const requestId=randomUUID();console.error(JSON.stringify({operation:'updhan.unavailable',requestId,stage}));return res.status(503).set({'Cache-Control':'no-store','X-Request-ID':requestId}).json({error:'Updhan temporarily unavailable',code:'service_unavailable',requestId,registrationOpen:false});};
 const close=async()=>{await sender?.stop();await pool?.end();};
 router.use((req,res,next)=>{res.set({'Cache-Control':'private, no-store','CDN-Cache-Control':'no-store','Referrer-Policy':'no-referrer'});next();});
 if(env.UPDHAN_ENABLED!=='true'){router.use(unavailable);return {router,close,enabled:false};}
 try{
  const config=updhanSharedDatabaseConfig(env),databaseName=config.database,retention=env.UPDHAN_PHOTO_RETENTION_DAYS?Number(env.UPDHAN_PHOTO_RETENTION_DAYS):null;
  if(!isAbsolute(env.UPDHAN_PRIVATE_PHOTO_DIR||'')||!/^https:\/\/[^/]+$/.test(env.UPDHAN_SITE_ORIGIN||'')||(retention!==null&&(!Number.isInteger(retention)||retention<1||retention>365)))throw Error('Explicit reviewed configuration required');
  pool=mysql.createPool(config);
  identityPool=updhanIdentityReader(pool);
  const photos=privatePhotoStore({directory:resolve(env.UPDHAN_PRIVATE_PHOTO_DIR),publicDirectory:staticDirectory});
  const service=createUpdhanProductionService({pool,databaseName,photos,decodePhoto:createPhotoDecoder(require('sharp')),encryptionKey:env.UPDHAN_QUEUE_ENCRYPTION_KEY,keyVersion:env.UPDHAN_QUEUE_KEY_VERSION||'v1',privacyVersion:env.UPDHAN_PRIVACY_VERSION,photoRetentionDays:retention,retentionUntil:env.UPDHAN_DATA_RETENTION_UNTIL,attributionConsentVersion:env.UPDHAN_ATTRIBUTION_CONSENT_VERSION});
  const api=createUpdhanSharedAdminRouter({identityPool,service,pool,origin:env.UPDHAN_SITE_ORIGIN,rateSecret:env.UPDHAN_RATE_LIMIT_SECRET});
  sender=createUpdhanProductionSender({env,pool,repository:service.outbox,reserveRequestBudget});
  service.systemStatus=async()=>({sender:sender.status(),retentionUntil:env.UPDHAN_DATA_RETENTION_UNTIL||null,privacyConfigured:!!env.UPDHAN_PRIVACY_VERSION});
  const initialize=()=>ready ||= (async()=>{stage='database_schema';await verifyUpdhanRuntime({pool,identityPool:pool,databaseName,sharedPrincipal:true});stage='private_storage';await photos.verifyWritable();stage='ready';sender.start();})();
  void initialize().catch(()=>console.error(JSON.stringify({operation:'updhan.preflight_failed',stage})));
  router.use(async(req,res,next)=>{try{await initialize();next();}catch{unavailable(req,res);}});
  router.use(api);return {router,close,enabled:true};
 }catch{void close();router.use(unavailable);return {router,close,enabled:false};}
}
