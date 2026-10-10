import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('.',import.meta.url));
const workspace=fileURLToPath(new URL('../../',import.meta.url));
export default defineConfig({root,publicDir:workspace+'apps/web/public',plugins:[react(),{
 name:'synthetic-hosted-pass',configureServer(server){server.middlewares.use(async(req,res,next)=>{
  if(req.url==='/test-pass.json'){
   try{res.setHeader('Content-Type','application/json');res.setHeader('Cache-Control','no-store');res.end(readFileSync(workspace+'.ayambil-runtime/supabase-test/downloaded-pass.json'));}catch{res.statusCode=404;res.end();}return;
  }
  next();
 });}
 }],build:{target:'es2022'},optimizeDeps:{esbuildOptions:{target:'esnext'}},resolve:{alias:{'@':workspace+'apps/web/src'}},server:{host:'127.0.0.1',port:3004,strictPort:true,fs:{allow:[workspace]}}});
