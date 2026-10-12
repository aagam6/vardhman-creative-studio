import express from 'express';
import {randomUUID} from 'node:crypto';
import {rateHash} from './security.mjs';
export function validateLead(body){
 if(!body||typeof body!=='object'||Array.isArray(body)||Object.keys(body).some(key=>!['name','email','company','message'].includes(key)))throw Error('Invalid lead');
 const value={};for(const [key,max] of [['name',120],['email',254],['company',200],['message',4000]]){const field=body[key]??'';if(typeof field!=='string'||field.length>max||/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(field))throw Error('Invalid lead');value[key]=field.trim();}
 if(!value.name||!/^\S+@\S+\.\S+$/.test(value.email))throw Error('Invalid lead');return value;
}
export function createLeadRouter({pool,store,config,legacy=false,isInitialized=()=>true}){
 const router=express.Router();
 router.use((req,res,next)=>{res.set({'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});next();});
 router.get('/health',async(req,res)=>{
  if(!isInitialized())return res.status(503).json({ready:false});
  try{await pool.execute('SELECT id,name,email,company,message,created_at FROM vcs_leads WHERE 1=0');res.json({ready:true});}
  catch{res.status(503).json({ready:false});}
 });
 router.use((req,res,next)=>{if(req.headers.origin!==config.origin)return res.status(403).json({error:'Exact site origin required'});if(!isInitialized())return res.status(503).json({error:'Lead service unavailable'});next();});
 router.use(express.json({limit:'16kb'}));
 router.post('/',async(req,res)=>{
  let value;try{value=validateLead(req.body);}catch{return res.status(400).json({error:'Check name, email and field lengths'});}
  try{
   if(!await store.limit(rateHash(config.rateSecret,'lead-create:'+req.socket.remoteAddress),5))return res.status(429).json({error:'Too many requests'});
   const id=randomUUID(),created=new Date();
   await pool.execute('INSERT INTO vcs_leads(id,name,email,company,message,created_at) VALUES(?,?,?,?,?,?)',[id,value.name,value.email,value.company,value.message,created]);
   // Legacy SDK callers consume only success; return their record-shaped contract.
   res.status(legacy?200:201).json(legacy?{id,collectionName:'leads',...value,created:created.toISOString(),updated:created.toISOString()}:{id,created:true});
  }catch{res.status(503).json({error:'Lead service unavailable'});}
 });
 router.use((req,res)=>res.status(404).json({error:'Lead API operation unavailable'}));
 router.use((error,req,res,next)=>{void req;void next;res.status(error.type==='entity.too.large'?413:400).json({error:'Invalid request'});});
 return router;
}