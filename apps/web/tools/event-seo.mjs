import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {ayambilProgramme} from '../src/lib/ayambilProgramme.js';
const origin='https://vardhmancreativestudio.com',base='/500-akhand-ayambil-vijayollas';
const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
export async function generateEventSeo(directory){
 const source=await readFile(directory+'/index.html','utf8');
 const pages=[{path:base,title:'500 Akhand Ayambil Tap — વિજયોત્સવ | 2–4 November 2026',description:'Celebrate 500 Akhand Ayambil Tap Vijayollas in Ahmedabad, 2–4 November 2026. Free evening registration for Manan Sanghvi and Sairam Dave.',image:'/assets/ayambil/invitation-20261013.jpeg'},...ayambilProgramme.filter(e=>e.performer).map(e=>({path:base+'/'+e.slug,title:e.performer+' — '+e.titleEn+' | '+e.displayDate,description:e.description+' '+e.displayDate+', '+e.time+' IST, '+e.venue+', Ahmedabad. Free evening registration.',image:e.portrait}))];
 for(const page of pages){
  const image=origin+page.image,url=origin+page.path;
  const tags=`<title>${escape(page.title)}</title><meta name="description" content="${escape(page.description)}"><link rel="canonical" href="${url}"><meta property="og:title" content="${escape(page.title)}"><meta property="og:description" content="${escape(page.description)}"><meta property="og:url" content="${url}"><meta property="og:type" content="website"><meta property="og:site_name" content="Vardhman Creative Studio"><meta property="og:image" content="${image}"><meta property="og:image:secure_url" content="${image}"><meta property="og:image:alt" content="${escape(page.title)}"><meta property="og:image:type" content="${page.image.endsWith('.png')?'image/png':'image/jpeg'}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escape(page.title)}"><meta name="twitter:description" content="${escape(page.description)}"><meta name="twitter:image" content="${image}">`;
  const summary=page.path===base?`<div id="ay-seo-summary"><h1>500 Akhand Ayambil Tap Vijayollas</h1><p>2–4 November 2026 · Ahmedabad. ૫૦૦ અખંડ આયંબિલનો વિજયોત્સવ.</p><p>Free evening registration: <a href="${base}/manan-sanghvi">2 November — Manan Sanghvi</a> · <a href="${base}/sairam-dave">3 November — Sairam Dave</a>.</p><p>4 November: Samaiyu and Parna Mahotsav at 8:00 AM.</p></div>`:'';
  const html=source.replace(/<title>[\s\S]*?<\/title>/g,'').replace(/<link\b[^>]*rel="canonical"[^>]*>/g,'').replace(/<meta\s+(?:property="og:[^"]*"|name="twitter:[^"]*"|name="description")[^>]*>/g,'').replace('</head>',tags.replace('<link rel="canonical"','<link data-react-helmet="true" rel="canonical"')+'</head>').replace('<div id="root"></div>',`<div id="root">${summary}</div>`);
  await mkdir(directory+page.path,{recursive:true});await writeFile(directory+page.path+'/index.html',html);
 }
}
