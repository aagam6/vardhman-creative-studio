import test from 'node:test';
import assert from 'node:assert/strict';
import {jsPDF} from 'jspdf';
import {passPage, passImagePlacement, assemblePassPdf, assertPassContentFits} from '../src/lib/ayambilPassLayout.js';
import {digitalPassTerms, passCredits} from '../src/lib/ayambilPassPresentation.js';
import {readFileSync} from 'node:fs';

test('actual PDF has exactly two 205 by 120 mm landscape pages',()=>{
 const image='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR4nGP4DwQACfsD/fteaysAAAAASUVORK5CYII=';
 const pdf=assemblePassPdf(jsPDF,[{image,ratio:120/205},{image,ratio:120/205}]);
 assert.equal(pdf.getNumberOfPages(),2);
 for(let page=1;page<=2;page++){
  pdf.setPage(page);assert.ok(Math.abs(pdf.internal.pageSize.getWidth()-205)<0.001);assert.ok(Math.abs(pdf.internal.pageSize.getHeight()-120)<0.001);
 }
 assert.equal(passPage.captureWidth,1000);
 const placement=passImagePlacement(120/205); assert.equal(placement.width,205); assert.equal(placement.x,0); assert.equal(placement.y,0); assert.ok(Math.abs(placement.height-120)<0.001);
 assert.throws(()=>assemblePassPdf(jsPDF,[]),/Invalid pass layout/);
});

test('fixed export checks real block overflow, not a long name character limit',()=>{
 const bounds={bottom:512,right:1000};
 const block={scrollHeight:120,clientHeight:136,scrollWidth:500,clientWidth:500,getBoundingClientRect:()=>({bottom:330,right:600})};
 const side={scrollHeight:508,clientHeight:508,scrollWidth:996,clientWidth:996,getBoundingClientRect:()=>bounds,querySelectorAll:()=>[block]};
 assert.doesNotThrow(()=>assertPassContentFits(side));
 block.scrollHeight=160;assert.throws(()=>assertPassContentFits(side),/readable/);
 block.scrollHeight=120;block.getBoundingClientRect=()=>({bottom:520,right:600});assert.throws(()=>assertPassContentFits(side),/readable/);
});

test('both reverse sides preserve bilingual terms and approved date-specific credits',()=>{
 assert.equal(digitalPassTerms.length,8);assert.ok(digitalPassTerms.every(([en,gu])=>en&&gu));
 for(const date of ['2026-11-02','2026-11-03']){const credits=passCredits({sessions:[{date}]});assert.ok(credits.labharthi.length&&credits.aayojak.length&&credits.nimantrak.length);}
 const source=readFileSync(new URL('../src/components/AyambilDigitalPass.jsx',import.meta.url),'utf8');
 assert.match(source,/aria-label="Digital pass front"/);assert.match(source,/aria-label="Digital pass reverse"/);
 assert.match(source,/digitalPassTerms\.map/);assert.match(source,/<Credits pass=\{pass\}/);assert.match(source,/assemblePassPdf\(jsPDF, images\)/);
 assert.doesNotMatch(source,/downloadKey|QR/);
});

test('compact cards retain explicit destructive confirmation and private contact disclosure',()=>{
 const source=readFileSync(new URL('../src/pages/AyambilAdminPage.jsx',import.meta.url),'utf8');
 assert.match(source,/className="ay-booking-attendees"/);assert.match(source,/Preview & download digital pass/);
 assert.match(source,/Contact details & queue history/);assert.match(source,/b\.attendees\.length/);
 assert.match(source,/onClick=\{\(\) => setPending/);assert.match(source,/onClick=\{change\}/);assert.match(source,/Keep unchanged/);
 assert.match(source,/b\.whatsapp\?\.attempts \?\? '—'/);assert.doesNotMatch(source,/b\.contactName\} · \{b\.mobile/);
 const css=readFileSync(new URL('../src/components/AyambilDigitalPass.css',import.meta.url),'utf8');
 assert.match(css,/not\(\.ay-pdf-render\)/);assert.match(css,/size:205mm 120mm/);
 const legacyCss=readFileSync(new URL('../src/components/AyambilRegistration.css',import.meta.url),'utf8');
 assert.doesNotMatch(legacyCss,/90mm 200mm|width:340px|width:82mm/);
});
