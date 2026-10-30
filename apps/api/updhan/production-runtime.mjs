import express from 'express';
import mysql from 'mysql2/promise';
import {isAbsolute,resolve} from 'node:path';
import {createRequire} from 'node:module';
import {createUpdhanProductionService} from './production-service.mjs';
import {createUpdhanSharedAdminRouter} from './shared-admin-router.mjs';
import {privatePhotoStore} from './private-photos.mjs';
import {createPhotoDecoder} from './photo-validation.mjs';
import {verifyUpdhanRuntime} from './runtime-preflight.mjs';
const require=createRequire(import.meta.url);
// Explicit composition, disabled by default. No DB environment fallback, schema
// changes, worker, provider call or Ayambil readiness dependency.
export function createUpdhanRuntime({env,staticDirectory}){
 const router=express.Router();let pool,identityPool,ready;
 const unavailable=(req,res)=>res.status(503).set('Cache-Control','no-store').json({error:'Updhan is not active',registrationOpen:false});
 const close=async()=>{await Promise.allSettled([pool?.end(),identityPool?.end()]);};
 router.use((req,res,next)=>{res.set({'Cache-Control':'private, no-store','CDN-Cache-Control':'no-store','Referrer-Policy':'no-referrer'});next();});
 if(env.UPDHAN_ENABLED!=='true'){router.use(unavailable);return {router,close,enabled:false};}
 try{
  const databaseName=env.UPDHAN_DB_NAME,port=Number(env.UPDHAN_DB_PORT),retention=Number(env.UPDHAN_PHOTO_RETENTION_DAYS);
  if(databaseName!=='u531246927_vcs'||!env.UPDHAN_DB_HOST||!Number.isInteger(port)||port<1||port>65535||!env.UPDHAN_DB_USER||!env.UPDHAN_DB_PASSWORD||!env.UPDHAN_IDENTITY_DB_USER||!env.UPDHAN_IDENTITY_DB_PASSWORD||env.UPDHAN_DB_USER===env.UPDHAN_IDENTITY_DB_USER||!isAbsolute(env.UPDHAN_PRIVATE_PHOTO_DIR||'')||!/^https:\/\/[^/]+$/.test(env.UPDHAN_SITE_ORIGIN||'')||!Number.isInteger(retention)||retention<1||retention>365||!env.UPDHAN_PRIVACY_VERSION)throw Error('Explicit reviewed configuration required');
  const common={host:env.UPDHAN_DB_HOST,port,database:databaseName,dateStrings:true,timezone:'Z',connectTimeout:8000,waitForConnections:true,queueLimit:10};
  pool=mysql.createPool({...common,user:env.UPDHAN_DB_USER,password:env.UPDHAN_DB_PASSWORD,connectionLimit:4});
  identityPool=mysql.createPool({...common,user:env.UPDHAN_IDENTITY_DB_USER,password:env.UPDHAN_IDENTITY_DB_PASSWORD,connectionLimit:2});
  const photos=privatePhotoStore({directory:resolve(env.UPDHAN_PRIVATE_PHOTO_DIR),publicDirectory:staticDirectory});
  const service=createUpdhanProductionService({pool,databaseName,photos,decodePhoto:createPhotoDecoder(require('sharp')),encryptionKey:env.UPDHAN_QUEUE_ENCRYPTION_KEY,keyVersion:env.UPDHAN_QUEUE_KEY_VERSION||'v1',privacyVersion:env.UPDHAN_PRIVACY_VERSION,photoRetentionDays:retention,attributionConsentVersion:env.UPDHAN_ATTRIBUTION_CONSENT_VERSION});
  const api=createUpdhanSharedAdminRouter({identityPool,service,pool,origin:env.UPDHAN_SITE_ORIGIN,rateSecret:env.UPDHAN_RATE_LIMIT_SECRET});
  router.use(async(req,res,next)=>{try{ready ||= verifyUpdhanRuntime({pool,identityPool,databaseName});await ready;next();}catch{unavailable(req,res);}});
  router.use(api);return {router,close,enabled:true};
 }catch{void close();router.use(unavailable);return {router,close,enabled:false};}
}
