import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const directory=path.dirname(fileURLToPath(import.meta.url));
export default defineConfig({root:path.join(directory,'staging'),publicDir:path.join(directory,'public'),resolve:{alias:{'@':path.join(directory,'src')}},plugins:[react(),{
 name:'reject-ordinary-site-modules',
 generateBundle(){for(const id of this.getModuleIds())if(/(?:HomePage|UpdhanPage|LeadCaptureSection|ComingSoonPage|pocketbaseClient|ServicesPage|AboutPage)\.(?:jsx|js)$/.test(id))this.error('Ordinary website module entered staging bundle');}
}],build:{outDir:path.resolve(directory,'../../dist/apps/web'),emptyOutDir:true,target:'es2022'}});
