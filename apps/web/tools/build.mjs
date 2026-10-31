// Portable equivalent of the optional metadata step followed by a required build.
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
const require = createRequire(import.meta.url);
const metadata = spawnSync(process.execPath, ['tools/generate-llms.js'], { stdio: 'inherit' });
if (metadata.status !== 0) console.warn('Optional llms metadata generation failed; continuing with the required Vite build.');
const vite = path.join(path.dirname(require.resolve('vite/package.json')), 'bin/vite.js');
process.env.VITE_UPDHAN_PRODUCTION_API='true';
process.env.VITE_UPDHAN_ANALYTICS_ENABLED='true';
const result = spawnSync(process.execPath, [vite, 'build', '--outDir', '../../dist/apps/web'], { stdio: 'inherit' });
if (result.error) console.error('Vite could not start.');
if(result.status===0){const {generateEventSeo}=await import('./event-seo.mjs');await generateEventSeo(path.resolve('../../dist/apps/web'));const {generateUpdhanPublic}=await import('./generate-updhan-public.mjs');await generateUpdhanPublic(path.resolve('../../dist/apps/web'));const {generateUpdhanAdmin}=await import('./generate-updhan-admin.mjs');await generateUpdhanAdmin(path.resolve('../../dist/apps/web'));}
process.exit(result.status ?? 1);
