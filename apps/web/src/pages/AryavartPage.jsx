import React from 'react';
import { Helmet } from 'react-helmet';
import { contactConfig } from '@/lib/contactConfig';

const ARYAVART_URL = `${contactConfig.orgWebsite}/aryavart-ka-gaurav`;
const ARYAVART_IMAGE = `${contactConfig.orgWebsite}/assets/aryavart-ka-gaurav-cover.png`;
const ARYAVART_TITLE = 'आर्यावर्त का गौरव | मुनिश्री श्रमणचंद्रसागरजी महाराज साहेब ‘यशोनंदन’';
const ARYAVART_DESCRIPTION = 'पाँच ओष्ठ्य वर्ण प, फ, ब, भ और म का प्रयोग किए बिना रची गई 100-पृष्ठों की सचित्र हिंदी पुस्तक। लेखक, पुस्तक विवरण, ₹300 मूल्य और प्राप्ति स्थान देखें।';
const ARYAVART_BOOK_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Book',
  name: 'आर्यावर्त का गौरव',
  alternateName: 'Aryavart Ka Gaurav',
  author: { '@type': 'Person', name: 'मुनिश्री श्रमणचंद्रसागरजी महाराज साहेब ‘यशोनंदन’' },
  publisher: { '@type': 'Organization', name: 'Fiesta Designs, राजकोट' },
  inLanguage: 'hi',
  datePublished: '2026-08',
  numberOfPages: 100,
  image: ARYAVART_IMAGE,
  description: ARYAVART_DESCRIPTION,
  offers: { '@type': 'Offer', price: '300', priceCurrency: 'INR', url: ARYAVART_URL },
};

const ORDER_URL =
  'https://wa.me/919426056930?text=' +
  encodeURIComponent(
    'नमस्ते, मुझे आर्यावर्त का गौरव पुस्तक की एक प्रति ऑर्डर करनी है। पुस्तक का मूल्य ₹300 है। कृपया ऑर्डर की प्रक्रिया बताएं।'
  );

const style = `
.ary-page {
  --paper: #f8f6f0;
  --white: #fffefa;
  --ink: #282722;
  --muted: #68665e;
  --rule: #d8d3c8;
  --green: #244536;
  --saffron: #ae682b;
  background: var(--paper);
  color: var(--ink);
  font-family: "Noto Serif Devanagari", "Noto Sans Devanagari", "Nirmala UI", Mangal, serif;
  letter-spacing: 0 !important;
  word-spacing: normal !important;
  font-kerning: normal;
  text-rendering: optimizeLegibility;
  overflow: clip;
}
.ary-page, .ary-page * { box-sizing: border-box; letter-spacing: 0 !important; word-spacing: normal !important; }
.ary-page h1, .ary-page h2, .ary-page h3, .ary-page p, .ary-page figure { margin-top: 0; }
.ary-page h1, .ary-page h2, .ary-page h3 { font-family: inherit; }
.ary-wrap { width: min(1080px, calc(100% - 72px)); margin-inline: auto; }
.ary-header { border-top: 6px solid transparent; border-image: linear-gradient(90deg, #ed7a20 0 33.33%, #fffefa 33.33% 66.66%, #18834a 66.66% 100%) 1; background: var(--paper); }
.ary-header-line { min-height: 76px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--rule); }
.ary-brand { color: var(--green); font-size: 25px; font-weight: 750; line-height: 1.35; }
.ary-brand small { margin-left: 13px; padding-left: 13px; border-left: 1px solid #c9c1b2; color: var(--muted); font: 12px/1.4 "Outfit", "Inter", sans-serif; }
.ary-head-note { color: var(--muted); font-size: 14px; }
.ary-nav-band { background: var(--green); }
.ary-nav { display: flex; align-items: center; gap: clamp(22px, 4vw, 48px); min-height: 51px; }
.ary-nav a { position: relative; color: #f8f6f0; text-decoration: none; font-size: 17px; }
.ary-nav a::after { position: absolute; right: 0; bottom: -7px; left: 0; height: 1px; background: #e7c58f; content: ""; transform: scaleX(0); transform-origin: left; transition: transform .2s ease; }
.ary-nav a:hover { color: #f3d9ae; }
.ary-nav a:hover::after { transform: scaleX(1); }
.ary-hero { padding: 54px 0 46px; background: var(--white); border-bottom: 1px solid var(--rule); }
.ary-hero-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(300px, 370px); align-items: center; gap: clamp(42px, 8vw, 96px); }
.ary-hero-copy { animation: ary-arrive .55s ease-out both; }
.ary-kicker { margin: 0 0 14px; color: var(--saffron); font-size: 14px; line-height: 1.6; }
.ary-title { max-width: 700px; margin: 0; color: var(--green); font-size: clamp(56px, 7vw, 82px); font-weight: 600; line-height: 1.38; }
.ary-title span { display: inline; color: #916022; white-space: nowrap; }
.ary-subtitle { margin: 11px 0 0; color: #383831; font-size: 22px; font-weight: 600; line-height: 1.7; }
.ary-author-line { margin: 3px 0 0; color: var(--saffron); font-size: 16px; font-weight: 700; line-height: 1.7; }
.ary-description { max-width: 650px; margin: 13px 0 0; color: #55544e; font-size: 17px; line-height: 1.9; }
.ary-book-buy { display: flex; align-items: center; flex-wrap: wrap; gap: 18px; margin-top: 24px; }
.ary-price { color: var(--ink); font-size: 22px; font-weight: 700; white-space: nowrap; }
.ary-price small { font-size: 13px; font-weight: 500; }
.ary-order { display: inline-flex; min-height: 50px; align-items: center; padding: 0 19px; border: 1px solid var(--green); background: var(--green); color: white !important; text-decoration: none !important; font-size: 15px; font-weight: 650; transition: background .15s, color .15s; }
.ary-order:hover { background: transparent; color: var(--green) !important; }
.ary-cover { margin: 0; animation: ary-arrive .65s .08s ease-out both; }
.ary-cover img { display: block; width: 100%; height: auto; }
.ary-specs { background: #efede6; border-bottom: 1px solid var(--rule); }
.ary-specs-row { display: grid; grid-template-columns: repeat(4, 1fr); }
.ary-spec { padding: 17px 17px; border-left: 1px solid var(--rule); }
.ary-spec:first-child { padding-left: 0; border-left: 0; }
.ary-spec-label { display: block; color: var(--muted); font-size: 14px; }
.ary-spec-value { display: block; margin-top: 5px; color: var(--ink); font-size: 16px; font-weight: 650; line-height: 1.65; }
.ary-block { padding: 60px 0; border-bottom: 1px solid var(--rule); }
.ary-block-head { display: grid; grid-template-columns: 290px minmax(0, 1fr); align-items: start; gap: 52px; }
.ary-heading { margin: 0; color: var(--green); font-size: clamp(31px, 3.8vw, 42px); font-weight: 600; line-height: 1.55; }
.ary-copy { margin: 0; color: #55544e; font-size: 17px; line-height: 1.9; }
.ary-letters { display: flex; align-items: center; flex-wrap: wrap; gap: 9px; width: fit-content; max-width: 100%; margin-top: 20px; padding: 14px 18px; border-left: 3px solid #c89a55; background: var(--green); color: #fffefa; font-size: 24px; }
.ary-letters span { min-width: 30px; text-align: center; font-weight: 700; }
.ary-letters small { margin-left: 9px; color: #f0e9dc; font-size: 14px; line-height: 1.5; }
.ary-history { background: var(--white); }
.ary-history-head { display: grid; grid-template-columns: minmax(0, .85fr) minmax(0, 1.15fr); align-items: end; gap: 48px; margin-bottom: 34px; }
.ary-history-head .ary-heading { max-width: 520px; }
.ary-history-intro { max-width: 680px; margin: 0; color: var(--muted); font-size: 16px; line-height: 1.85; }
.ary-events { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); border-top: 1px solid var(--rule); }
.ary-event { position: relative; display: block; padding: 23px 24px 0 0; }
.ary-event::before { position: absolute; top: -6px; left: 0; width: 11px; height: 11px; border: 2px solid var(--white); border-radius: 50%; background: var(--saffron); content: ""; }
.ary-event + .ary-event { padding-left: 24px; border-left: 1px solid var(--rule); }
.ary-event + .ary-event::before { left: 24px; }
.ary-event time { display: block; margin-bottom: 10px; color: var(--saffron); font-size: 14px; line-height: 1.7; }
.ary-event h3 { margin: 0 0 7px; color: var(--ink); font-size: 18px; font-weight: 700; line-height: 1.65; }
.ary-event p { margin: 0; color: var(--muted); font-size: 15px; line-height: 1.8; }
.ary-name-highlight { color: var(--green); font-size: 1.3em; font-weight: 800; background: none; padding: 0; border: 0; border-radius: 0; text-decoration: none; }
.ary-history-intro .ary-name-highlight { color: var(--green); font-size: 1.3em; font-weight: 800; background: none; padding: 0; border: 0; border-radius: 0; text-decoration: none; }
.ary-record { background: var(--paper); color: var(--ink); }
.ary-record .ary-heading { color: var(--green); font-size: clamp(32px, 3.8vw, 40px); }
.ary-record .ary-copy { color: var(--muted); }
.ary-record strong { color: var(--ink); }
.ary-details { background: var(--white); }
.ary-detail-list { display: grid; grid-template-columns: 270px minmax(0,1fr); }
.ary-detail-row { display: contents; }
.ary-detail-row dt, .ary-detail-row dd { margin: 0; padding: 13px 0; border-bottom: 1px solid var(--rule); font-size: 15px; line-height: 1.75; }
.ary-detail-row dt { color: var(--muted); }
.ary-detail-row dd { color: var(--ink); font-weight: 600; }
.ary-outlets { background: var(--white); }
.ary-outlets-heading { margin-bottom: 10px; }
.ary-outlets-intro { max-width: 700px; margin: 0 0 24px; color: var(--muted); font-size: 16px; line-height: 1.8; }
.ary-outlet-list { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); border-top: 1px solid var(--rule); border-bottom: 1px solid var(--rule); }
.ary-outlet { min-width: 0; padding: 18px 17px 21px 0; }
.ary-outlet + .ary-outlet { padding-left: 17px; border-left: 1px solid var(--rule); }
.ary-outlet-number { display: block; margin-bottom: 11px; color: var(--saffron); font: 600 14px/1.5 "Outfit", "Inter", sans-serif; }
.ary-outlet h3 { margin: 0; color: var(--ink); font-size: 17px; font-weight: 700; line-height: 1.65; }
.ary-outlet p { margin: 10px 0 0; color: var(--muted); font-size: 14px; line-height: 1.85; overflow-wrap: anywhere; }
.ary-outlet a { color: var(--green); font-weight: 700; text-decoration-color: #a7a296; text-underline-offset: 3px; }
.ary-order-section { background: #efede6; border-bottom: 1px solid var(--rule); }
.ary-order-layout { display: flex; align-items: center; justify-content: space-between; gap: 24px; }
.ary-order-layout .ary-heading { font-size: 31px; }
.ary-order-layout p { margin: 6px 0 0; color: var(--muted); font-size: 15px; line-height: 1.75; }
.ary-footer { padding: 18px 0; background: var(--paper); color: var(--muted); font-size: 12px; }
.ary-footer-line { display: flex; justify-content: space-between; gap: 14px; }
.ary-page a:focus-visible { outline: 2px solid var(--saffron); outline-offset: 3px; }
@keyframes ary-arrive { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@media(max-width: 760px) {
  .ary-wrap { width: calc(100% - 36px); }
  .ary-header { border-top-width: 4px; }
  .ary-header-line { min-height: 60px; }
  .ary-brand { font-size: 19px; }
  .ary-brand small { margin-left: 7px; padding-left: 8px; font-size: 10px; }
  .ary-head-note { font-size: 11px; }
  .ary-nav { flex-wrap: wrap; gap: 9px 18px; min-height: 0; padding-block: 12px; overflow: visible; white-space: normal; }
  .ary-nav a { font-size: 14px; }
  .ary-hero { padding: 35px 0 29px; }
  .ary-hero-grid { grid-template-columns: 1fr; gap: 23px; }
  .ary-kicker { margin-bottom: 9px; font-size: 12px; }
  .ary-title { font-size: clamp(43px, 12vw, 55px); line-height: 1.45; }
  .ary-subtitle { margin-top: 6px; font-size: 18px; }
  .ary-author-line { margin-top: 2px; font-size: 14px; }
  .ary-description { margin-top: 10px; font-size: 14px; line-height: 1.85; }
  .ary-book-buy { margin-top: 17px; gap: 10px 14px; }
  .ary-order { min-height: 46px; padding-inline: 14px; font-size: 13px; }
  .ary-price { font-size: 19px; }
  .ary-price small { font-size: 11px; }
  .ary-cover { width: min(78%, 290px); margin-inline: auto; }
  .ary-specs-row { grid-template-columns: 1fr 1fr; }
  .ary-spec { padding: 12px 10px; border-bottom: 1px solid var(--rule); }
  .ary-spec-label { font-size: 13px; }
  .ary-spec-value { font-size: 15px; }
  .ary-spec:nth-child(odd) { padding-left: 0; border-left: 0; }
  .ary-spec:nth-last-child(-n+2) { border-bottom: 0; }
  .ary-block { padding: 43px 0; }
  .ary-block-head { grid-template-columns: 1fr; gap: 11px; }
  .ary-heading { font-size: 30px; line-height: 1.5; }
  .ary-copy { font-size: 15px; line-height: 1.85; }
  .ary-letters { gap: 7px; margin-top: 15px; padding: 12px 13px; font-size: 21px; }
  .ary-letters span { min-width: 25px; }
  .ary-letters small { flex-basis: 100%; margin: 2px 0 0; font-size: 13px; }
  .ary-history-head { grid-template-columns: 1fr; gap: 10px; margin-bottom: 23px; }
  .ary-history-intro { margin: 0; font-size: 14px; }
  .ary-events { grid-template-columns: 1fr; gap: 0; margin-left: 5px; padding-left: 22px; border-top: 0; border-left: 1px solid var(--rule); }
  .ary-event, .ary-event + .ary-event { padding: 0 0 23px; border-left: 0; }
  .ary-event::before, .ary-event + .ary-event::before { top: 3px; left: -29px; }
  .ary-event time { margin-bottom: 5px; font-size: 13px; }
  .ary-event h3 { font-size: 16px; }
  .ary-event p { font-size: 14px; }
  .ary-record .ary-heading { font-size: 30px; }
  .ary-detail-list { grid-template-columns: 105px minmax(0,1fr); }
  .ary-detail-row dt, .ary-detail-row dd { padding: 10px 0; font-size: 13px; overflow-wrap: anywhere; }
  .ary-outlets-intro { margin: 0 0 17px; font-size: 14px; }
  .ary-outlet-list { grid-template-columns: 1fr; }
  .ary-outlet, .ary-outlet + .ary-outlet { padding: 16px 0 18px; border-left: 0; }
  .ary-outlet + .ary-outlet { border-top: 1px solid var(--rule); }
  .ary-outlet-number { margin-bottom: 7px; }
  .ary-outlet h3 { font-size: 16px; }
  .ary-outlet p { margin-top: 7px; font-size: 14px; }
  .ary-order-layout { align-items: flex-start; flex-direction: column; gap: 15px; }
  .ary-order-layout .ary-heading { font-size: 27px; }
  .ary-order-layout p { font-size: 14px; }
  .ary-footer-line { flex-direction: column; gap: 5px; }
}
@media(min-width: 761px) and (max-width: 1000px) {
  .ary-title { font-size: clamp(36px, 5vw, 48px); }
  .ary-outlet-list { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .ary-outlet:nth-child(3) { padding-left: 0; border-left: 0; border-top: 1px solid var(--rule); }
  .ary-outlet:nth-child(4) { border-top: 1px solid var(--rule); }
}
@media (prefers-reduced-motion: reduce) { .ary-hero-copy, .ary-cover { animation: none; } .ary-nav a::after { transition: none; } }
`;

const institutions = [
  {
    name: 'श्री अरविंदभाई मणियार जनकल्याण ट्रस्ट',
    details: <>‘अमर निवास’, 14 पंचवटी प्लॉट, राजकोट – 360001, गुजरात<br /><a href="tel:+919426056930">+91 94260 56930</a></>,
  },
  {
    name: 'नवचेतन स्कूलिंग सिस्टम',
    details: <>अंबिका टाउनशिप, गीतांजलि पार्क, मवडी, राजकोट, गुजरात<br />समय: सुबह 10 से शाम 5 बजे</>,
  },
  {
    name: 'श्री राजनगर जैन पाठशाला',
    details: <>जैनम बी. शाह · 75, लावण्य सोसायटी, जीव राज मेहता हॉस्पिटल के निकट, वासना, अहमदाबाद – 380007<br /><a href="tel:+919429201809">+91 94292 01809</a></>,
  },
  {
    name: 'श्री हेमंत जैन',
    details: <>पाटन, गुजरात<br /><a href="tel:+919423779698">+91 94237 79698</a></>,
  },
];

export default function AryavartPage() {
  return (
    <main className="ary-page">
      <Helmet>
        <html lang="hi" />
        <title>{ARYAVART_TITLE}</title>
        <meta name="description" content={ARYAVART_DESCRIPTION} />
        <link rel="canonical" href={ARYAVART_URL} />
        <meta property="og:site_name" content={contactConfig.orgName} />
        <meta property="og:title" content={ARYAVART_TITLE} />
        <meta property="og:description" content={ARYAVART_DESCRIPTION} />
        <meta property="og:url" content={ARYAVART_URL} />
        <meta property="og:type" content="book" />
        <meta property="og:locale" content="hi_IN" />
        <meta property="og:image" content={ARYAVART_IMAGE} />
        <meta property="og:image:secure_url" content={ARYAVART_IMAGE} />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="537" />
        <meta property="og:image:height" content="826" />
        <meta property="og:image:alt" content="आर्यावर्त का गौरव पुस्तक का वास्तविक मुखपृष्ठ" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={ARYAVART_TITLE} />
        <meta name="twitter:description" content={ARYAVART_DESCRIPTION} />
        <meta name="twitter:image" content={ARYAVART_IMAGE} />
        <meta name="twitter:image:alt" content="आर्यावर्त का गौरव पुस्तक का वास्तविक मुखपृष्ठ" />
        <script type="application/ld+json">{JSON.stringify(ARYAVART_BOOK_SCHEMA)}</script>
      </Helmet>
      <style>{style}</style>

      <header className="ary-header">
        <div className="ary-wrap ary-header-line"><div className="ary-brand">वर्धमान <small>CREATIVE STUDIO</small></div><div className="ary-head-note">॥ श्री वीतरागाय नमः ॥</div></div>
        <div className="ary-nav-band"><nav className="ary-wrap ary-nav" aria-label="पृष्ठ के भाग"><a href="#parichay">परिचय</a><a href="#pustak">पुस्तक के बारे में</a><a href="#vivaran">विवरण</a><a href="#prapti">प्राप्ति स्थान</a><a href="#order">ऑर्डर</a></nav></div>
      </header>

      <section className="ary-hero" id="parichay">
        <div className="ary-wrap ary-hero-grid">
          <div>
            <p className="ary-kicker">एक अनूठा हिंदी साहित्यिक प्रयोग</p>
            <h1 className="ary-title">आर्यावर्त <span>का गौरव</span></h1>
            <p className="ary-subtitle">पाँच ओष्ठ्य वर्णों के बिना रची गई पुस्तक</p>
            <p className="ary-author-line">लेखक · मुनिश्री श्रमणचंद्रसागरजी महाराज साहेब ‘यशोनंदन’</p>
            <p className="ary-description"><strong>प, फ, ब, भ और म</strong>—हिंदी के रोज़मर्रा के पाँच वर्ण। इस पूरी कृति में इनका प्रयोग नहीं किया गया। इसी कठिन नियम के भीतर प्रवचन, चिंतन और जीवन से जुड़े विचार सरल भाषा में रखे गए हैं।</p>
            <div className="ary-book-buy"><span className="ary-price">₹300 <small>प्रति पुस्तक</small></span><a className="ary-order" href={ORDER_URL} target="_blank" rel="noopener noreferrer">WhatsApp पर ऑर्डर करें ↗</a></div>
          </div>
          <figure className="ary-cover"><img src="/assets/aryavart-ka-gaurav-cover.png" alt="आर्यावर्त का गौरव पुस्तक का मुखपृष्ठ" loading="eager" /></figure>
        </div>
      </section>

      <section className="ary-specs" aria-label="पुस्तक की संक्षिप्त जानकारी"><div className="ary-wrap ary-specs-row">
        <div className="ary-spec"><span className="ary-spec-label">लेखक</span><span className="ary-spec-value">मुनिश्री श्रमणचंद्रसागरजी महाराज साहेब</span></div>
        <div className="ary-spec"><span className="ary-spec-label">आवृत्ति</span><span className="ary-spec-value">अगस्त 2026</span></div>
        <div className="ary-spec"><span className="ary-spec-label">पृष्ठ</span><span className="ary-spec-value">100 · चित्र सहित</span></div>
        <div className="ary-spec"><span className="ary-spec-label">आकार</span><span className="ary-spec-value">22 cm</span></div>
      </div></section>

      <section className="ary-block" id="pustak">
        <div className="ary-wrap ary-block-head">
          <h2 className="ary-heading">वर्णों की मर्यादा में<br />विचारों की पूरी दुनिया</h2>
          <div><p className="ary-copy">पाँच आम वर्णों से बचकर लिखना, हर वाक्य को नए ढंग से गढ़ने की माँग करता है। इस पुस्तक में वही भाषाई चुनौती प्रवचन और चिंतन के साथ चलती है। विषयों में संस्कृति, शिक्षा, संत-परंपरा, इतिहास और जीवन-मूल्य आते हैं।</p><div className="ary-letters" aria-label="प्रयोग से बाहर रखे गए वर्ण"><span>प</span><span>फ</span><span>ब</span><span>भ</span><span>म</span><small>इन पाँच वर्णों का प्रयोग नहीं</small></div></div>
        </div>
      </section>

      <section className="ary-block ary-history">
        <div className="ary-wrap">
          <div className="ary-history-head"><h2 className="ary-heading">इस पुस्तक के पीछे की कहानी</h2><p className="ary-history-intro">पूज्य उपाध्याय <strong className="ary-name-highlight">श्री यशोविजयजी महाराज साहब</strong> की पुरानी भाषाई साधना से प्रेरित यह प्रयोग, जामनगर में दिए गए प्रवचन से पुस्तक तक पहुँचा।</p></div>
          <div className="ary-events">
            <article className="ary-event"><time>लगभग 350 वर्ष पूर्व</time><h3>भाषाई साधना की प्रेरणा</h3><p><strong className="ary-name-highlight">श्री यशोविजयजी महाराज साहब</strong> की ओष्ठ्य-वर्ण रहित रचना ने इस परंपरा का मार्ग दिखाया।</p></article>
            <article className="ary-event"><time>12 अक्टूबर 2025 · जामनगर</time><h3>‘आर्यावर्त की गरिमा’ पर 100 मिनट का प्रवचन</h3><p>मुनिश्री श्रमणचंद्रसागरजी महाराज साहेब ने पाँच ओष्ठ्य वर्णों के बिना हिंदी प्रवचन दिया। इस उपलब्धि को India Book of Records में दर्ज किया गया।</p></article>
            <article className="ary-event"><time>अगस्त 2026</time><h3>पुस्तक का प्रथम संस्करण</h3><p>भाषाई प्रयोग और प्रवचन अब 100 पृष्ठों की सचित्र पुस्तक में उपलब्ध हैं।</p></article>
          </div>
        </div>
      </section>

      <section className="ary-block ary-record">
        <div className="ary-wrap ary-block-head"><h2 className="ary-heading">ऑक्सफोर्ड<br />कैटलॉग में सूचीबद्ध</h2><p className="ary-copy">‘आर्यावर्त का गौरव’ Oxford University Library के ऑनलाइन कैटलॉग में दर्ज है। कैटलॉग में शीर्षक, लेखक और पुस्तक का bibliographic विवरण मिलता है।</p></div>
      </section>

      <section className="ary-block ary-details" id="vivaran">
        <div className="ary-wrap ary-block-head"><h2 className="ary-heading">प्रकाशन विवरण</h2><dl className="ary-detail-list">
          <div className="ary-detail-row"><dt>शीर्षक</dt><dd>आर्यावर्त का गौरव</dd></div>
          <div className="ary-detail-row"><dt>लेखक</dt><dd>मुनिश्री श्रमणचंद्रसागरजी महाराज साहेब ‘यशोनंदन’</dd></div>
          <div className="ary-detail-row"><dt>कॉपीराइट</dt><dd>मुनिश्री श्रमणचंद्रसागरजी महाराज साहेब ‘यशोनंदन’</dd></div>
          <div className="ary-detail-row"><dt>भाषा</dt><dd>हिंदी</dd></div>
          <div className="ary-detail-row"><dt>आवृत्ति / वर्ष</dt><dd>प्रथम आवृत्ति · अगस्त 2026</dd></div>
          <div className="ary-detail-row"><dt>पृष्ठ / आकार</dt><dd>100 पृष्ठ, सचित्र · 22 cm</dd></div>
          <div className="ary-detail-row"><dt>प्रकाशक</dt><dd><strong>Fiesta Designs</strong>, राजकोट</dd></div>
          <div className="ary-detail-row"><dt>मूल्य</dt><dd>₹300</dd></div>
        </dl></div>
      </section>

      <section className="ary-block ary-outlets" id="prapti">
        <div className="ary-wrap"><h2 className="ary-heading ary-outlets-heading">पुस्तक प्राप्ति के स्थान</h2><p className="ary-outlets-intro">राजकोट, अहमदाबाद और पाटन में पुस्तक प्राप्ति के लिए नीचे दिए स्थानों से संपर्क करें।</p><div className="ary-outlet-list">{institutions.map((place, index) => <article className="ary-outlet" key={place.name}><span className="ary-outlet-number">0{index + 1}</span><h3>{place.name}</h3><p>{place.details}</p></article>)}</div></div>
      </section>

      <section className="ary-block ary-order-section" id="order"><div className="ary-wrap ary-order-layout"><div><h2 className="ary-heading">अपनी प्रति के लिए संपर्क करें</h2><p>उपलब्धता और ऑर्डर की जानकारी WhatsApp पर लें।</p></div><div className="ary-book-buy"><span className="ary-price">₹300</span><a className="ary-order" href={ORDER_URL} target="_blank" rel="noopener noreferrer">WhatsApp पर ऑर्डर ↗</a></div></div></section>
      <footer className="ary-wrap ary-footer"><div className="ary-footer-line"><span>© Vardhman Creative Studio</span><span>आर्यावर्त का गौरव</span></div></footer>
    </main>
  );
}
