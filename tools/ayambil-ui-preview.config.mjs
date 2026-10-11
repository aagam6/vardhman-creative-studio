// Isolated loopback UI fixtures. No database, provider or production flags.
import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import {createRequire} from 'node:module';

import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
const require=createRequire(import.meta.url);
const config=require('../apps/pocketbase/pb_hooks/ayambil/config.json');

export default defineConfig({root:path.resolve('apps/web'),plugins:[react(),{
  name:'synthetic-ui-fixtures',configureServer(server){server.middlewares.use('/api/ayambil',async(req,res,next)=>{
    if(!['/status','/register','/pass-download'].includes(req.url?.split('?')[0]))return next();
    res.setHeader('Content-Type','application/json');res.setHeader('Cache-Control','no-store');
    if(req.url.startsWith('/status'))return res.end(JSON.stringify({ready:true,open:false,whatsapp:'disabled'}));
    if(req.url.startsWith('/register')){res.statusCode=403;return res.end(JSON.stringify({error:'Registration closed'}));}
    if(req.url.startsWith('/pass-download')){
      let text='';for await(const chunk of req){text+=chunk;if(text.length>20000){res.statusCode=413;return res.end('{}');}}
      let key;try{key=JSON.parse(text).key;}catch{res.statusCode=400;return res.end('{}');}
      const date=key==='a'.repeat(64)?'2026-11-02':key==='b'.repeat(64)?'2026-11-03':null;
      if(!date){res.statusCode=404;return res.end(JSON.stringify({error:'Synthetic pass unavailable'}));}
      return res.end(JSON.stringify({passes:[{eventName:config.eventName,attendeeName:'Synthetic Gujarati Test / પરીક્ષણ માટેનું લાંબું નામ',number:'SYNTHETIC-ONLY-'+date.replaceAll('-',''),status:'active',issuedAt:'2026-10-11T00:00:00Z',sessions:[config.sessions.find(s=>s.date===date)]}]}));
    }
  });}
}],css:{postcss:{plugins:[tailwindcss({config:path.resolve('apps/web/tailwind.config.js')}),autoprefixer()]}},resolve:{alias:{'@':path.resolve('apps/web/src')}},optimizeDeps:{esbuildOptions:{target:'esnext'}},server:{host:'127.0.0.1',port:3005,strictPort:true}});
