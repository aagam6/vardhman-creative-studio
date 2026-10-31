import {readFile,writeFile,mkdir} from 'node:fs/promises';import path from 'node:path';
export function renderUpdhanAdmin(html){return html
 .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,tag=>/fbq\(|connect\.facebook\.net/.test(tag)?'':tag)
 .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi,tag=>/facebook\.com\/tr/.test(tag)?'':tag)
 .replace(/<title>[\s\S]*?<\/title>/i,'<title>Updhan administration</title>')
 .replace('</head>','<meta name="robots" content="noindex,nofollow"><meta name="referrer" content="no-referrer"></head>');}
export async function generateUpdhanAdmin(root){const html=await readFile(path.join(root,'index.html'),'utf8'),target=path.join(root,'admin/updhan');await mkdir(target,{recursive:true});await writeFile(path.join(target,'index.html'),renderUpdhanAdmin(html));}
