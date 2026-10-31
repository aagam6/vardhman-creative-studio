import {randomBytes,createHash} from 'node:crypto';
import {mkdir,writeFile,unlink,readdir,lstat,realpath,open} from 'node:fs/promises';
import {resolve,sep} from 'node:path';

const inside=(value,parent)=>value.toLowerCase()===parent.toLowerCase()||value.toLowerCase().startsWith(parent.toLowerCase()+sep);
// Never mount this directory with express.static. All keys are opaque and
// paths are checked both lexically and after resolving directory junctions.
export function privatePhotoStore({directory,publicDirectory}) {
 const root=resolve(directory),pub=resolve(publicDirectory);let canonicalRoot;
 if(inside(root,pub))throw new Error('Photo storage must be outside public directory');
 const path=key=>{if(!/^[a-f0-9]{64}$/.test(key))throw new Error('Invalid photo key');return resolve(root,key);};
 async function verifyRoot(){
  await mkdir(root,{recursive:true,mode:0o700});
  const [actual,publicPath]=await Promise.all([realpath(root),realpath(pub).catch(e=>{if(e.code==='ENOENT')return pub;throw e;})]);
  if(inside(actual,publicPath)||canonicalRoot&&actual.toLowerCase()!==canonicalRoot.toLowerCase())throw new Error('Private storage path changed or resolves into public storage');
  canonicalRoot=actual;
 }
 async function regular(target){const item=await lstat(target);if(!item.isFile()||item.isSymbolicLink())throw new Error('Private object is not a regular file');return item;}
 return {
  async verifyWritable(){await verifyRoot();const probe=resolve(root,'.updhan-preflight-'+randomBytes(16).toString('hex'));await writeFile(probe,'private-storage-preflight',{mode:0o600,flag:'wx'});await unlink(probe);return {private:true,writable:true};},
  async stage(preparedJpeg){
   if(!Buffer.isBuffer(preparedJpeg)||preparedJpeg.length>2097152||preparedJpeg[0]!==255||preparedJpeg[1]!==216||preparedJpeg[2]!==255)throw new Error('Invalid prepared JPEG');
   await verifyRoot();const key=randomBytes(32).toString('hex');await writeFile(path(key),preparedJpeg,{flag:'wx',mode:0o600});
   return {key,hash:createHash('sha256').update(preparedJpeg).digest('hex'),bytes:preparedJpeg.length};
  },
  read(key){const target=path(key);return (async()=>{await verifyRoot();const before=await regular(target),file=await open(target,'r');try{const after=await file.stat();if(before.ino!==after.ino||before.dev!==after.dev||!after.isFile()||after.size>2097152)throw new Error('Private object changed');return await file.readFile();}finally{await file.close();}})();},
  async remove(key){const target=path(key);await verifyRoot();try{await regular(target);await unlink(target);}catch(e){if(e.code!=='ENOENT')throw e;}},
  async objects(){
   await verifyRoot();const names=await readdir(root),items=[];
   for(const key of names.filter(k=>/^[a-f0-9]{64}$/.test(k))){try{const item=await lstat(path(key));if(item.isFile()&&!item.isSymbolicLink())items.push({key,modifiedAt:item.mtimeMs});}catch(e){if(e.code!=='ENOENT')throw e;}}
   return items;
  },
 };
}
