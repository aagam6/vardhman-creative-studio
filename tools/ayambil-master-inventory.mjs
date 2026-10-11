import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync,statSync} from 'node:fs';
import {createHash} from 'node:crypto';
const files=execFileSync('git',['ls-files','-z'],{encoding:'utf8'}).split('\0').filter(Boolean);
const textFiles=files.filter(f=>/\.(?:[cm]?js|jsx|ts|tsx|json|html|css|sql|md|toml|yml|txt)$/.test(f)&&!f.includes('package-lock')&&!f.includes('audit-dependencies'));
const texts=new Map(textFiles.map(f=>[f,readFileSync(f,'utf8')]));
const env={};const imports=[];
for(const [file,text] of texts){
 for(const match of text.matchAll(/(?:process\.env|import\.meta\.env|env)\.([A-Z][A-Z0-9_]+)/g)){(env[match[1]]??=[]).push(file);}
 for(const match of text.matchAll(/\b(?:AYAMBIL_|VARDHMAN_FLOW_|DB_|VITE_|PB_|SUPABASE_)[A-Z0-9_]+\b/g)){(env[match[0]]??=[]).push(file);}
 for(const match of text.matchAll(/(?:from\s*|import\s*\(|require\s*\()\s*['"]([^'"]+)['"]/g))imports.push({file,specifier:match[1]});
}
const manifests=files.filter(f=>/(^|\/)package.json$/.test(f));
const dependencies=manifests.flatMap(file=>{const p=JSON.parse(readFileSync(file));return Object.entries({...p.dependencies,...p.devDependencies}).map(([name,version])=>({workspace:file,name,version,importers:[...new Set(imports.filter(i=>i.specifier===name||i.specifier.startsWith(name+'/')).map(i=>i.file))],otherReferences:[...texts].filter(([f,t])=>!f.endsWith('.json')&&t.includes(name)).map(([f])=>f)}));});
const assets=files.filter(f=>/\.(?:png|webp|jpe?g|svg|gif|woff2?|ttf|ico)$/.test(f)).map(path=>({path,bytes:statSync(path).size,sha256:createHash('sha256').update(readFileSync(path)).digest('hex')}));
const groups=new Map();for(const a of assets){if(!groups.has(a.sha256))groups.set(a.sha256,[]);groups.get(a.sha256).push(a.path);}
const routes=[...texts].flatMap(([file,text])=>[...text.matchAll(/(?:path=|api\.(?:get|post)\()\s*['"]([^'"]+)['"]/g)].map(m=>({file,path:m[1]})));
const result={scope:'Tracked file inventory; literal references are candidate evidence, NOT proof of dead code. No secret values collected.',head:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),files:files.map(path=>({path,bytes:statSync(path).size})),routes,environmentNames:Object.fromEntries(Object.entries(env).map(([k,v])=>[k,[...new Set(v)]])),dependencies,assets,duplicateAssetGroups:[...groups.values()].filter(v=>v.length>1),imports};
writeFileSync('docs/ayambil-master-inventory.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({files:files.length,textFiles:texts.size,assets:assets.length,duplicateAssetGroups:result.duplicateAssetGroups.length,dependencies:dependencies.length,environmentNames:Object.keys(env).length,routes:routes.length}));
