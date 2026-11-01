import {readFile,writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {UPDHAN_URL,updhanFaqs,updhanPublicSummary} from '../src/lib/updhanMarketing.js';
import {programmeSections,programmeText,preparationItems,rulesItems,applicationProcess,programmePhoto} from '../src/lib/updhanProgramme.js';
const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
export function renderUpdhanPublic(html){
 const title='Vijaypataka Updhan Mahotsav 2027 | Achalgarh';
 const description='Vijaypataka Updhan Mahotsav, Achalgarh: 25 April–14 June 2027. Programme information and registration updates. Check the application form for current availability.';
 const schemas=[{'@context':'https://schema.org','@type':'Event',name:updhanPublicSummary.name,url:UPDHAN_URL,startDate:updhanPublicSummary.startDate,endDate:updhanPublicSummary.endDate,eventAttendanceMode:'https://schema.org/OfflineEventAttendanceMode',location:{'@type':'Place',name:'Achalgarh, Rajasthan',address:{'@type':'PostalAddress',addressLocality:'Achalgarh',addressRegion:'Rajasthan',addressCountry:'IN'}}},{'@context':'https://schema.org','@type':'FAQPage',mainEntity:updhanFaqs.map(([q,a])=>({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:a}}))}];
 const guide=[[programmeSections.prepare,preparationItems],[programmeSections.rules,rulesItems],[programmeSections.process,applicationProcess]].map(([title,items])=>`<section><h2>${escape(programmeText(title,'gu'))}</h2>${items.map(([heading,body])=>`<h3>${escape(programmeText(heading,'gu'))}</h3><p>${escape(programmeText(body,'gu'))}</p>`).join('')}</section>`).join('');
 const body=`<article lang="gu"><h1>${escape(updhanPublicSummary.name)}</h1><p>25 April–14 June 2027 · Achalgarh, Rajasthan, India</p><p>નોંધણીની હાલની સ્થિતિ અરજી ફોર્મ પર જુઓ. Check the application form for current availability.</p>${guide}${updhanFaqs.map(([q,a])=>`<section><h2>${escape(q)}</h2><p>${escape(a)}</p></section>`).join('')}<a href="/updhan-facts.md">Public programme facts</a></article>`;
 return html.replace(/<title>[\s\S]*?<\/title>/i,`<title>${title}</title>`)
 .replace(/<meta\b[^>]*(?:name=["']description["']|property=["']og:[^"']+["']|name=["']twitter:[^"']+["'])[^>]*>/gi,'')
 .replace(/<link\b[^>]*rel=["']canonical["'][^>]*>/gi,'')
 .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,tag=>/fbq\(|connect\.facebook\.net/.test(tag)?'':tag)
 .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi,tag=>/facebook\.com\/tr/.test(tag)?'':tag)
 .replace('</head>',`<meta name="description" content="${escape(description)}"><link rel="canonical" href="${UPDHAN_URL}"><meta property="og:title" content="${title}"><meta property="og:description" content="${escape(description)}"><meta property="og:url" content="${UPDHAN_URL}"><meta property="og:type" content="website"><meta property="og:image" content="https://vardhmancreativestudio.com${programmePhoto.src}"><script type="application/ld+json">${JSON.stringify(schemas).replaceAll('<','\\u003c')}</script></head>`)
 .replace(/<div id="root">[\s\S]*?<\/div>/,`<div id="root">${body}</div>`);
}
export async function generateUpdhanPublic(root){const file=path.join(root,'index.html');const html=await readFile(file,'utf8');const target=path.join(root,'vijaypataka-updhan-mahotsav');await mkdir(target,{recursive:true});await writeFile(path.join(target,'index.html'),renderUpdhanPublic(html));}
