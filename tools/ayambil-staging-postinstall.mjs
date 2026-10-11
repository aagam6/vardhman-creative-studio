import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
export async function stagingInstallBuild(env=process.env,run=spawnSync){
 if(env.AYAMBIL_STAGING_BUILD!=='true')return 0;
 try{
  // A blocked dependency install script must fail honestly, not produce a partial build.
  const esbuild=await import('esbuild');await esbuild.transform('const staging = true;',{});
  if(!env.npm_execpath)throw Error('npm lifecycle required');
  const result=run(process.execPath,[env.npm_execpath,'run','build:ayambil-staging','--prefix','apps/web'],{cwd:fileURLToPath(new URL('../',import.meta.url)),env,stdio:'inherit'});
  if(result.error||result.status!==0)throw Error('Build failed');
  return 0;
 }catch{
  console.error('Ayambil staging install build failed. Verify build/dev dependencies and permitted esbuild install scripts; do not deploy a partial build.');return 1;
 }
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))process.exitCode=await stagingInstallBuild();
