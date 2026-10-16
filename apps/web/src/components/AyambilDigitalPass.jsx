import React, { useRef, useState } from 'react';
import { toPng } from 'html-to-image';

import { digitalPassTerms, passCredits } from '@/lib/ayambilPassPresentation';
import { passPage, assemblePassPdf, assemblePassCollectionPdf, assertPassContentFits, passLocationUrl } from '@/lib/ayambilPassLayout';
import './AyambilDigitalPass.css';

function Credits({ pass }) {
  const credits = passCredits(pass);
  return <dl className="ay-pass-credits">{[['aayojak', 'આયોજકો', 'Organisers'], ['nimantrak', 'નિમંત્રકો', 'Inviting Organisations']].map(([key, gu, en]) => <div key={key}><dt><span lang="gu">{gu}</span><small>{en}</small></dt><dd>{(Array.isArray(credits[key]) ? credits[key].map(name => <span className="ay-credit-name" lang="gu" key={name}>{name}</span>) : credits[key]) || <span className="ay-pass-pending">Name awaiting approval / <span lang="gu">નામ કન્ફર્મ કરવાનું બાકી છે</span></span>}</dd></div>)}</dl>;
}

async function capturePassImages(element) {
  // Capture the actual server-issued pass: Gujarati text remains intact in the PDF.
  await document.fonts.ready;
  // A stable export width prevents responsive font/line wrapping from changing
  // when html-to-image clones a narrow-screen pass into its SVG document.
  const capture = element.cloneNode(true);
  capture.classList.remove('ay-print-selected');
  capture.classList.add('ay-pdf-render');
  capture.setAttribute('aria-hidden', 'true');
  const holder = document.createElement('div');
  holder.style.cssText = 'position:fixed;left:-10000px;top:0;pointer-events:none';
  holder.appendChild(capture); document.body.appendChild(holder);
  const images = [];
  capture.style.width = `${passPage.captureWidth}px`;
  try {
    await document.fonts.ready;
    for (const side of capture.querySelectorAll('.ay-pass-side')) {
      assertPassContentFits(side);
      const bounds = side.getBoundingClientRect();
      const ratio = bounds.height / bounds.width;
      const image = await toPng(side, { pixelRatio: 2, backgroundColor: getComputedStyle(side).backgroundColor, cacheBust: false });
      const links = [...side.querySelectorAll('.ay-pass-location')].map(anchor=>{const box=anchor.getBoundingClientRect();return {url:anchor.href,x:(box.left-bounds.left)/bounds.width,y:(box.top-bounds.top)/bounds.height,width:box.width/bounds.width,height:box.height/bounds.height};});
      images.push({image, ratio, links});
    }
  } finally { holder.remove(); }
  if (images.length !== 2) throw new Error('Invalid pass layout');
  return images;
}
export async function createPassPdf(element, number) {
  const images = await capturePassImages(element);
  const { jsPDF } = await import('jspdf');
  const pdf = assemblePassPdf(jsPDF, images);
  return new File([pdf.output('blob')], `${number}.pdf`, { type: 'application/pdf' });
}
export async function createPassesPdf(elements, number) {
  if (!elements.length || elements.length > 6) throw new Error('Invalid pass selection');
  const images = [];
  for (const element of elements) images.push(...await capturePassImages(element));
  const { jsPDF } = await import('jspdf');
  const pdf = assemblePassCollectionPdf(jsPDF, images);
  return new File([pdf.output('blob')], `${number}-all-passes.pdf`, { type: 'application/pdf' });
}
export function saveFile(file) {
  const url = URL.createObjectURL(file); const anchor = document.createElement('a');
  anchor.href = url; anchor.download = file.name; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function AyambilDigitalPass({ pass }) {
  const ref = useRef(null); const [busy, setBusy] = useState(false); const [message, setMessage] = useState('');
  const active = pass.status === 'active';
  const theme = pass.sessions[0]?.date === '2026-11-03' ? 'heritage' : 'royal';
  const download = async () => {
    setBusy(true); setMessage('');
    try { const pdf = await createPassPdf(ref.current, pass.number); saveFile(pdf); }
    catch (error) { setMessage(error.message === 'Pass content exceeds readable print size' ? 'Pass content is too long for a readable PDF. Contact the organisers for an authorised correction. / વાંચી શકાય તેવા PDF માટે પાસનું લખાણ ખૂબ લાંબું છે. અધિકૃત સુધારા માટે આયોજકોનો સંપર્ક કરો.' : 'PDF could not be prepared. Retry or contact the organisers. / PDF તૈયાર થઈ શક્યો નથી. ફરી પ્રયાસ કરો અથવા આયોજકોનો સંપર્ક કરો.'); }
    finally { setBusy(false); }
  };
  const print = async () => {
    setBusy(true); setMessage('');
    try {
      // Print the same custom-size PDF used by Download, avoiding ancestor layout
      // and mobile media queries changing physical print dimensions.
      const pdf = await createPassPdf(ref.current, pass.number);
      const url = URL.createObjectURL(pdf); const frame = document.createElement('iframe');
      frame.style.cssText = 'position:fixed;width:1px;height:1px;bottom:0;left:0;border:0';
      frame.title = 'Print attendee pass'; frame.src = url;
      frame.onload = () => { try { frame.contentWindow.focus(); frame.contentWindow.print(); } catch { setMessage('Open the prepared PDF and print at actual size, 205 × 120 mm.'); } };
      document.body.appendChild(frame);
      setTimeout(() => { frame.remove(); URL.revokeObjectURL(url); }, 60000);
    } catch (error) { setMessage(error.message === 'Pass content exceeds readable print size' ? 'Pass content is too long to print readably. Contact the organisers for an authorised correction. / વાંચી શકાય તેવી પ્રિન્ટ માટે પાસનું લખાણ ખૂબ લાંબું છે. અધિકૃત સુધારા માટે આયોજકોનો સંપર્ક કરો.' : 'Print could not be prepared. Retry downloading the PDF.'); }
    finally { setBusy(false); }
  };
  return <article className="ay-pass-wrapper" data-pass-theme={theme}>
    <div className="ay-digital-pass" data-pass-theme={theme} ref={ref}>
      <section className="ay-pass-side ay-pass-front" aria-label="Digital pass front"><div className="ay-pass-brand"><img src="/assets/logo.png" width="44" height="44" alt="" /><span>VARDHMAN CREATIVE STUDIO<small>DIGITAL PASS · ડિજિટલ પાસ</small></span><b className={`ay-pass-validity ${active ? '' : 'ay-pass-invalid'}`}>{active ? 'ACTIVE · EVENING PASS' : `${pass.status.toUpperCase()} · NOT VALID`}</b></div>
      <div className="ay-pass-heading"><p className="ay-pass-english">500 Akhand Ayambil Tap</p><h3 lang="gu">વિજયોત્સવ</h3></div>
      <p className="ay-pass-registration">FREE EVENING REGISTRATION / રજિસ્ટ્રેશન</p>
      <div className="ay-pass-attendee" data-long-name={Array.from(pass.attendeeName || '').length > 28 ? 'true' : undefined}><span lang="gu">ભાગ લેનારનું નામ <small>/ Attendee Name</small></span><strong>{pass.attendeeName}</strong><span>પાસ નંબર / Pass number</span><b>{pass.number}</b></div>
      {pass.sessions.map(session => <div className="ay-pass-programme" key={session.date}><p>{session.performer}</p><p lang="gu">{session.programme}</p><small>{session.date === '2026-11-02' ? 'Bhakti Sandhya' : 'Special presentation'}</small></div>)}
      {pass.sessions.map(session => <section className="ay-pass-visit" key={session.date}><h4>{session.label} · {session.time}</h4><strong>{session.venue.replace('Chandramauleshwar', 'Chandramaulishwar')}</strong><p>{session.address}</p>{passLocationUrl(session.mapsUrl) && <a className="ay-pass-location" href={passLocationUrl(session.mapsUrl)} target="_blank" rel="noopener noreferrer">Open location / સ્થળ જુઓ ↗</a>}</section>)}
      </section><section className="ay-pass-side ay-pass-back" aria-label="Digital pass reverse"><div className="ay-pass-back-title">500 Akhand Ayambil Tap · વિજયોત્સવ <span>PASS INFORMATION</span></div><Credits pass={pass} />
      <p className="ay-pass-status">{active ? 'For the evening shown above. / ઉપર લખેલા સાંજના કાર્યક્રમ માટે.' : `Pass ${pass.status} — not valid for attendance.`}</p>
      <section className="ay-pass-rules" aria-label="Pass terms and organiser information"><h4>Pass Terms & Conditions <span lang="gu">પાસ માટેના નિયમો</span></h4><ol>{digitalPassTerms.map(([en, gu]) => <li key={en}><span>{en}</span><span lang="gu">{gu}</span></li>)}</ol></section>
      <small>Morning programmes and 4 November are outside this registration. / સવારના કાર્યક્રમો અને ૪ નવેમ્બર માટે આ પાસ નથી. Issued {new Date(pass.issuedAt).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}.</small>
    </section></div>
    <div className="ay-pass-actions">
      <button type="button" disabled={busy || !active} onClick={download}>{busy ? 'Preparing PDF…' : 'Download PDF'}</button>
      <button type="button" disabled={busy || !active} onClick={print}>Print</button>
    </div>
    <p role="status">{message}</p>
  </article>;
}
