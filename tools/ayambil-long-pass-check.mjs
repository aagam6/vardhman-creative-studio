// Local synthetic UI/PDF check. Requires the isolated fixture on port 3005.
// No live backend, database, messages or private attendee records.
import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.AYAMBIL_PLAYWRIGHT_MODULE || 'playwright');
const directory=process.env.AYAMBIL_ARTIFACT_DIRECTORY || '.ayambil-runtime/long-pass';await mkdir(directory,{recursive:true});
const previewOrigin=process.env.AYAMBIL_PREVIEW_ORIGIN || 'http://127.0.0.1:3005';
if(new URL(previewOrigin).hostname!=='127.0.0.1')throw Error('Only loopback fixtures are permitted');
const browser=await chromium.launch({headless:true,executablePath:process.env.AYAMBIL_CHROME_PATH});
try {
 const page=await browser.newPage();
 await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
 const errors=[];page.on('pageerror',error=>errors.push(error.name));
 for(const [name,key,performer] of [['manan','a','Manan Sanghvi'],['sairam','b','Sairam Dave']]) {
  await page.goto('about:blank'); await page.goto(previewOrigin+'/500-akhand-ayambil-vijayollas/passes#'+key.repeat(64));
  await page.locator('.ay-digital-pass').waitFor();
  if(!await page.locator('.ay-digital-pass').innerText().then(text=>text.includes(performer)))throw Error('Wrong performer');
  for(const width of [320,360,390,430,768,1024,1366,1920]){
   await page.setViewportSize({width,height:1000});
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
   if(overflow)throw Error('Horizontal overflow at '+width);
   await page.screenshot({path:`${directory}/${name}-${width}.png`,fullPage:true});
  }
  console.log(await page.evaluate(()=>{const clone=document.querySelector(".ay-digital-pass").cloneNode(true);clone.classList.add("ay-pdf-render");document.body.appendChild(clone);const sizes=[...clone.children].map(e=>({class:e.className,height:e.getBoundingClientRect().height,font:getComputedStyle(e).fontSize}));const result={width:clone.scrollWidth,height:clone.scrollHeight,sizes};clone.remove();return result;}));
  const pdf=await page.evaluate(async()=>{
   const {createPassPdf}=await import('/src/components/AyambilDigitalPass.jsx');
   const file=await createPassPdf(document.querySelector('.ay-digital-pass'),'SYNTHETIC');
   return Array.from(new Uint8Array(await file.arrayBuffer()));
  });
  await writeFile(`${directory}/${name}.pdf`,Buffer.from(pdf));
  const download=page.waitForEvent('download');await page.getByRole('button',{name:'Download PDF / પાસ ડાઉનલોડ કરો',exact:true}).click();
  await (await download).saveAs(`${directory}/${name}-download.pdf`);
  // Instrument only the PDF frame's print call. A native dialog is not verified.
  await page.evaluate(()=>{window.__printCalls=0;const append=document.body.appendChild.bind(document.body);document.body.appendChild=function(node){if(node.tagName==='IFRAME'){const original=node.onload;node.onload=()=>{node.contentWindow.print=()=>{window.__printCalls++;};original();};}return append(node);};});
  await page.getByRole('button',{name:'Print / પ્રિન્ટ',exact:true}).click();
  await page.waitForFunction(()=>window.__printCalls===1);
  console.log(name+': synthetic UI at 8 widths, PDF generation/download and instrumented print call completed');
 }
 if(errors.length)throw Error('Page runtime errors: '+errors.join(','));
} finally {await browser.close();}
