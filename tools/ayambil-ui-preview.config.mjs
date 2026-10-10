// Isolated loopback UI fixtures. No database, provider or production flags.
import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import {createRequire} from 'node:module';
import {randomUUID} from 'node:crypto';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
const require=createRequire(import.meta.url);
const config=require('../apps/pocketbase/pb_hooks/ayambil/config.json');
const {validate}=require('../apps/pocketbase/pb_hooks/ayambil/service.cjs');
export default defineConfig({root:path.resolve('apps/web'),plugins:[react(),{
  name:'synthetic-ui-fixtures',configureServer(server){server.middlewares.use('/hcgi/platform/api/ayambil',async(req,res,next)=>{
    if(!['/status','/register'].includes(req.url?.split('?')[0]))return next();
    res.setHeader('Content-Type','application/json');res.setHeader('Cache-Control','no-store');
    if(req.url.startsWith('/status'))return res.end(JSON.stringify({ready:true,open:true,whatsapp:'mock_ui_only'}));
    try{let text='';for await(const chunk of req){text+=chunk;if(text.length>20000)throw Error();}const body=JSON.parse(text);const saved=validate(body);
      if(!saved.contactName.startsWith('Synthetic ')||saved.mobile!=='+12025550123'||saved.attendees.some(a=>!a.fullName.startsWith('Synthetic ')))throw Error();
      res.end(JSON.stringify({number:'SYNTHETIC-UI-'+randomUUID(),status:'active',whatsapp:{status:'disabled'},attendees:saved.attendees.map(a=>({fullName:a.fullName,passes:[{eventName:config.eventName,attendeeName:a.fullName,number:'TEST-ONLY-'+randomUUID(),sessions:config.sessions.filter(s=>s.date===saved.eventDate),issuedAt:new Date().toISOString(),status:'active'}]}))}));
    }catch{res.statusCode=400;res.end(JSON.stringify({message:'Synthetic UI fixture rejected'}));}
  });}
}],css:{postcss:{plugins:[tailwindcss({config:path.resolve('apps/web/tailwind.config.js')}),autoprefixer()]}},resolve:{alias:{'@':path.resolve('apps/web/src')}},define:{'import.meta.env.VITE_AYAMBIL_POCKETBASE_URL':JSON.stringify('/hcgi/platform')},optimizeDeps:{esbuildOptions:{target:'esnext'}},server:{host:'127.0.0.1',port:3005,strictPort:true}});
