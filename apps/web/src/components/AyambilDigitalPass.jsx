import React, { useEffect, useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { canSharePdf, copyPassDetails, passSummary } from '@/lib/ayambilPassUtils';
import { digitalPassTerms, passCredits } from '@/lib/ayambilPassPresentation';
import { passPage, passImagePlacement } from '@/lib/ayambilPassLayout';
import './AyambilDigitalPass.css';

function Credits({ pass }) {
  const credits = passCredits(pass);
  return <dl className="ay-pass-credits">{[['labharthi', 'લાભાર્થીઓ', 'Beneficiaries'], ['aayojak', 'આયોજકો', 'Organisers'], ['nimantrak', 'નિમંત્રકો', 'Inviting Organisations']].map(([key, gu, en]) => <div key={key}><dt><span lang="gu">{gu}</span><small>{en}</small></dt><dd>{(Array.isArray(credits[key]) ? credits[key].map(name => <span className="ay-credit-name" lang="gu" key={name}>{name}</span>) : credits[key]) || <span className="ay-pass-pending">Name awaiting approval / <span lang="gu">નામ કન્ફર્મ કરવાનું બાકી છે</span></span>}</dd></div>)}</dl>;
}

export async function createPassPdf(element, number) {
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
  let image, ratio;
  try {
    await document.fonts.ready;
    ratio = capture.scrollHeight / capture.scrollWidth;
    image = await toPng(capture, { pixelRatio: 3, backgroundColor: '#faf7ef', cacheBust: false, width: passPage.captureWidth, style: { position: 'static', left: '0', top: '0', margin: '0' } });
  } finally { holder.remove(); }
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({ unit: 'mm', orientation: 'portrait', format: [passPage.width, passPage.height] });
  const placement = passImagePlacement(ratio);
  pdf.addImage(image, 'PNG', placement.x, placement.y, placement.width, placement.height, undefined, "FAST");
  return new File([pdf.output('blob')], `${number}.pdf`, { type: 'application/pdf' });
}
export function saveFile(file) {
  const url = URL.createObjectURL(file); const anchor = document.createElement('a');
  anchor.href = url; anchor.download = file.name; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function AyambilDigitalPass({ pass }) {
  const ref = useRef(null); const [file, setFile] = useState(null); const [fileUrl, setFileUrl] = useState(''); const [busy, setBusy] = useState(false); const [message, setMessage] = useState('');
  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file); setFileUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  const active = pass.status === 'active';
  const download = async () => {
    setBusy(true); setMessage('');
    try { const pdf = await createPassPdf(ref.current, pass.number); setFile(pdf); saveFile(pdf); }
    catch (error) { setMessage(error.message === 'Pass content exceeds readable print size' ? 'Pass content is too long for a readable PDF. Contact the organisers for an authorised correction. / વાંચી શકાય તેવા PDF માટે પાસનું લખાણ ખૂબ લાંબું છે. અધિકૃત સુધારા માટે આયોજકોનો સંપર્ક કરો.' : 'PDF could not be prepared. Retry or contact the organisers. / PDF તૈયાર થઈ શક્યો નથી. ફરી પ્રયાસ કરો અથવા આયોજકોનો સંપર્ક કરો.'); }
    finally { setBusy(false); }
  };
  const print = async () => {
    setBusy(true); setMessage('');
    try {
      // Print the same custom-size PDF used by Download, avoiding ancestor layout
      // and mobile media queries changing physical print dimensions.
      const pdf = await createPassPdf(ref.current, pass.number); setFile(pdf);
      const url = URL.createObjectURL(pdf); const frame = document.createElement('iframe');
      frame.style.cssText = 'position:fixed;width:1px;height:1px;bottom:0;left:0;border:0';
      frame.title = 'Print attendee pass'; frame.src = url;
      frame.onload = () => { try { frame.contentWindow.focus(); frame.contentWindow.print(); } catch { setMessage('Open the prepared PDF and print at actual size, 90 × 200 mm.'); } };
      document.body.appendChild(frame);
      setTimeout(() => { frame.remove(); URL.revokeObjectURL(url); }, 60000);
    } catch (error) { setMessage(error.message === 'Pass content exceeds readable print size' ? 'Pass content is too long to print readably. Contact the organisers for an authorised correction. / વાંચી શકાય તેવી પ્રિન્ટ માટે પાસનું લખાણ ખૂબ લાંબું છે. અધિકૃત સુધારા માટે આયોજકોનો સંપર્ક કરો.' : 'Print could not be prepared. Retry downloading the PDF.'); }
    finally { setBusy(false); }
  };
  const shareFile = async () => {
    try { await navigator.share({ files: [file], title: '500 Akhand Ayambil Tap · વિજયોત્સવ' }); }
    catch (error) { if (error.name !== 'AbortError') setMessage('File sharing is unavailable. Download the PDF and attach it in WhatsApp. / PDF ડાઉનલોડ કરીને WhatsAppમાં જોડો.'); }
  };
  const summary = passSummary({ ...pass, eventName: '500 Akhand Ayambil Tap · વિજયોત્સવ' });
  const copy = async () => {
    setMessage(await copyPassDetails(navigator, summary) ? 'Pass details copied. / પાસની વિગતો કોપી થઈ ગઈ.' : 'Clipboard unavailable. Copy the details below. / નીચે આપેલી વિગતો કોપી કરો.');
  };
  const canShareFile = active && canSharePdf(navigator, file);
  return <article className="ay-pass-wrapper">
    <div className="ay-digital-pass" ref={ref}>
      <div className="ay-pass-brand"><img src="/assets/logo.png" width="44" height="44" alt="" /><span>VARDHMAN CREATIVE STUDIO<small>DIGITAL PASS · ડિજિટલ પાસ</small></span></div>
      <div className="ay-pass-heading"><p className="ay-pass-english">500 Akhand Ayambil Tap</p><h3 lang="gu">વિજયોત્સવ</h3></div>
      <p className="ay-pass-registration">FREE EVENING REGISTRATION / રજિસ્ટ્રેશન</p>
      <div className="ay-pass-attendee"><span lang="gu">લાભાર્થીનું નામ <small>/ Attendee Name</small></span><strong>{pass.attendeeName}</strong><span>પાસ નંબર / Pass number</span><b>{pass.number}</b></div>
      {pass.sessions.map(session => <div className="ay-pass-programme" key={session.date}><p>{session.performer}</p><p lang="gu">{session.programme}</p><small>{session.date === '2026-11-02' ? 'Bhakti Sandhya' : 'Special presentation'}</small></div>)}
      {pass.sessions.map(session => <section className="ay-pass-visit" key={session.date}><h4>{session.label} · {session.time}</h4><strong>{session.venue.replace('Chandramauleshwar', 'Chandramaulishwar')}</strong><p>{session.address}</p></section>)}
      <Credits pass={pass} />
      <p className="ay-pass-status">{active ? 'For the evening shown above. / ઉપર લખેલા સાંજના કાર્યક્રમ માટે.' : `Pass ${pass.status} — not valid for attendance.`}</p>
      <section className="ay-pass-rules" aria-label="Pass terms and organiser information"><h4>Pass Terms & Conditions <span lang="gu">પાસ માટેના નિયમો</span></h4><ol>{digitalPassTerms.map(([en, gu]) => <li key={en}><span>{en}</span><span lang="gu">{gu}</span></li>)}</ol></section>
      <small>Morning programmes and 4 November are outside this registration. / સવારના કાર્યક્રમો અને ૪ નવેમ્બર માટે આ પાસ નથી. Issued {new Date(pass.issuedAt).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}.</small>
    </div>
    <div className="ay-pass-actions">
      <button type="button" disabled={busy || !active} onClick={download}>{busy ? 'Preparing PDF… / PDF તૈયાર થઈ રહ્યો છે…' : 'Download PDF / પાસ ડાઉનલોડ કરો'}</button>
      {fileUrl && active && <a href={fileUrl} download={file.name}>Save prepared PDF</a>}
      <button type="button" disabled={busy || !active} onClick={print}>Print / પ્રિન્ટ</button>
      {canShareFile && <button type="button" onClick={shareFile}>Share PDF…</button>}
      {active && <a href={`https://wa.me/?text=${encodeURIComponent(summary)}`} target="_blank" rel="noopener noreferrer">WhatsApp / WhatsApp પર શેર કરો</a>}
      <button type="button" onClick={copy}>Copy pass details / વિગતો કોપી કરો</button>
    </div>
    <p className="ay-help">WhatsApp opens a draft for you to send. Attach the downloaded PDF; nothing is sent automatically. / WhatsApp પર મોકલવા માટે તમે જાતે Send દબાવો. ડાઉનલોડ કરેલો PDF જોડો.</p>
    <p role="status">{message}</p>
    {message.startsWith('Clipboard') && <textarea readOnly aria-label="Pass details to copy" value={summary} />}
  </article>;
}
