import { mkdir, readFile, writeFile } from 'node:fs/promises';

const origin = 'https://vardhmancreativestudio.com';
const route = '/aryavart-ka-gaurav';
const title = 'आर्यावर्त का गौरव | मुनिश्री श्रमणचंद्रसागरजी महाराज साहेब ‘यशोनंदन’';
const description = 'पाँच ओष्ठ्य वर्णों के बिना रची गई 100-पृष्ठों की सचित्र हिंदी कृति। ‘आर्यावर्त का गौरव’ के विशेष भाषाई प्रयोग और लेखक के बारे में जानें।';
const imagePath = '/assets/aryavart-ka-gaurav-cover.png';
const image = origin + imagePath;
const url = origin + route;
const book = {
  '@context': 'https://schema.org',
  '@type': 'Book',
  name: 'आर्यावर्त का गौरव',
  alternateName: 'Aryavart Ka Gaurav',
  author: { '@type': 'Person', name: 'मुनिश्री श्रमणचंद्रसागरजी महाराज साहेब ‘यशोनंदन’' },
  publisher: { '@type': 'Organization', name: 'Fiesta Designs, राजकोट' },
  inLanguage: 'hi',
  datePublished: '2026-08',
  numberOfPages: 100,
  image,
  description,
  offers: { '@type': 'Offer', price: '300', priceCurrency: 'INR', url },
};

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('"', '&quot;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;');

export async function generateAryavartSeo(directory) {
  const source = await readFile(`${directory}/index.html`, 'utf8');
  const tags = `<title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(description)}"><link data-react-helmet="true" rel="canonical" href="${url}"><meta property="og:site_name" content="Vardhman Creative Studio"><meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:url" content="${url}"><meta property="og:type" content="book"><meta property="og:locale" content="hi_IN"><meta property="og:image" content="${image}"><meta property="og:image:secure_url" content="${image}"><meta property="og:image:type" content="image/png"><meta property="og:image:width" content="537"><meta property="og:image:height" content="826"><meta property="og:image:alt" content="आर्यावर्त का गौरव पुस्तक का वास्तविक मुखपृष्ठ"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escapeHtml(title)}"><meta name="twitter:description" content="${escapeHtml(description)}"><meta name="twitter:image" content="${image}"><meta name="twitter:image:alt" content="आर्यावर्त का गौरव पुस्तक का वास्तविक मुखपृष्ठ"><script data-react-helmet="true" type="application/ld+json">${JSON.stringify(book).replaceAll('<', '\\u003c')}</script>`;
  const fallback = `<main lang="hi" style="max-width:760px;margin:48px auto;padding:24px;font-family:serif;color:#244d3c"><h1>आर्यावर्त का गौरव</h1><p>${escapeHtml(description)}</p><p>लेखक · मुनिश्री श्रमणचंद्रसागरजी महाराज साहेब ‘यशोनंदन’</p><p>प्रथम आवृत्ति · अगस्त 2026 · 100 पृष्ठ · सचित्र · ₹300</p><img src="${imagePath}" alt="आर्यावर्त का गौरव पुस्तक का वास्तविक मुखपृष्ठ" width="268" height="413"></main>`;
  const html = source
    .replace(/<title>[\s\S]*?<\/title>/g, '')
    .replace(/<link\b[^>]*rel="canonical"[^>]*>/g, '')
    .replace(/<meta\s+(?:property="og:[^"]*"|name="twitter:[^"]*"|name="description")[^>]*>/g, '')
    .replace('</head>', `${tags}</head>`)
    .replace('<html lang="en">', '<html lang="hi">')
    .replace('<div id="root"></div>', `<div id="root">${fallback}</div>`);
  const output = `${directory}${route}/index.html`;
  await mkdir(`${directory}${route}`, { recursive: true });
  await writeFile(output, html);
  return output;
}
