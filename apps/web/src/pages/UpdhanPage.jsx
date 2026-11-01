import React, { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import {Link} from 'react-router-dom';
import './UpdhanDesign.css';
import UpdhanParticipation,{UpdhanTrailer} from '@/components/UpdhanParticipation';
import UpdhanMeasurement,{trackUpdhanClick} from '@/components/UpdhanMeasurement';
import UpdhanProgrammeSections,{UpdhanProgrammeNav} from '@/components/UpdhanProgrammeSections';
import {UpdhanStillFigure,UpdhanVideoGallery} from '@/components/UpdhanMedia';
import {videoStills} from '@/lib/updhanVideoStills';
import {updhanApplicationPath} from '@/lib/updhanMarketing';
import {UpdhanLanguageProvider,UpdhanLanguageButtons,useUpdhanLanguage,localizeUpdhanTree} from '@/components/UpdhanLanguage';

const canonical = 'https://vardhmancreativestudio.com/vijaypataka-updhan-mahotsav';
const startDate = Date.parse('2027-04-25T00:00:00+05:30');
const endDate = Date.parse('2027-06-15T00:00:00+05:30');
const faqs=[
 ['उपधान कहाँ है?','अचलगढ़, राजस्थान में। प्रथम प्रवेश रविवार, 25 अप्रैल 2027 और मालारोपण सोमवार, 14 जून 2027 है।'],
 ['फॉर्म कैसे भरें?','आवेदन फॉर्म खोलें, अपनी जानकारी और फोटो जोड़ें, फिर जानकारी जाँचकर आवेदन भेजें।'],
 ['फॉर्म भरने के बाद क्या होगा?','आपको पंजीकरण नंबर मिलेगा। टीम आवेदन की समीक्षा करेगी और प्रवेश की सूचना अलग से देगी।'],
 ['जानकारी के लिए किससे बात करें?','आशीषभाई उदाणी · +91 97277 14008'],
];
const practices = [
  ['01', 'प्रभु-प्रार्थना', 'दिन का आरंभ, प्रभु के साथ।', 'हर दिन प्रार्थना से जुड़ेगा। रोज़ की भागदौड़ से कुछ समय निकालकर प्रभु से जुड़ने का अवसर।'],
  ['02', 'यंत्र-मंत्र साधना', 'मन को एक दिशा।', 'यंत्र-मंत्र साधना से जुड़ें और अपने मन को समय दें।'],
  ['03', 'उपधान-उपासना', 'स्वयं के और करीब।', 'उपधान की साधना करें और खुद को जानने के लिए समय निकालें।'],
];

function getCountdown(now) {
  const left = Math.max(0, startDate - now);
  return [Math.floor(left / 86400000), Math.floor(left / 3600000) % 24, Math.floor(left / 60000) % 60];
}

export default function UpdhanPage(){return <UpdhanLanguageProvider><UpdhanPageContent /></UpdhanLanguageProvider>;}
function UpdhanPageContent() {
  const {language,t}=useUpdhanLanguage();
  const applicationPath=updhanApplicationPath(window.location.href);
  const [menuOpen, setMenuOpen] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [shareStatus, setShareStatus] = useState('');
  const hero=useRef(null);
  const [heroVisible,setHeroVisible]=useState(true);
  useEffect(()=>{if(!hero.current||!window.IntersectionObserver)return;const observer=new IntersectionObserver(([entry])=>setHeroVisible(entry.isIntersecting));observer.observe(hero.current);return()=>observer.disconnect();},[]);
  useEffect(()=>{const id=window.location.hash.slice(1);if(['top','journey','blessings','sadhana','video','registration','details','faq','options','daily','prepare','rules','stay','after-applying','gallery','darshan'].includes(id))document.getElementById(id)?.scrollIntoView();},[]);
  useEffect(() => { const timer = window.setInterval(() => setNow(Date.now()), 30000); return () => window.clearInterval(timer); }, []);
  useEffect(() => { if (!shareStatus) return undefined; const timer = window.setTimeout(() => setShareStatus(''), 5000); return () => window.clearTimeout(timer); }, [shareStatus]);
  const countdown = getCountdown(now);
  const visibleFaqs=faqs.filter(([question],index,all)=>all.findIndex(([q])=>t(q)===t(question))===index);
  const closeMenu = () => setMenuOpen(false);
  async function shareEvent() {
    const data = { title: t('विजयपताका – उपधान – महोत्सव'), text: `${t('25 अप्रैल — 14 जून 2027')} | ${t('अचलगढ़, राजस्थान')} · ${t('एक यात्रा… स्वयं से स्वयं तक।')}`, url: canonical };
    try {
      if (navigator.share) { await navigator.share(data); setShareStatus('साझा किया गया'); }
      else { await navigator.clipboard.writeText(`${data.title}\n${data.text}\n${data.url}`); setShareStatus('लिंक कॉपी हो गया'); }
    } catch (error) { if (error.name !== 'AbortError') setShareStatus('ब्राउज़र के address bar से लिंक कॉपी करें।'); }
  }
  return (
    localizeUpdhanTree(<div className="vp-page" lang={language} onClickCapture={trackUpdhanClick}>
      <Helmet>
        <html lang={language} />
        <title>विजयपताका – उपधान – महोत्सव | अचलगढ़ 2027</title>
        <meta name="description" content="25 अप्रैल से 14 जून 2027। अचलगढ़, राजस्थान में विजयपताका – उपधान – महोत्सव। पावन सान्निध्य, साधना, कार्यक्रम विवरण एवं आयोजक की जानकारी।" />
        <meta name="theme-color" content="#183e35" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="author" content="Vardhman Creative Studio" />
        <meta property="og:locale" content={{hi:'hi_IN',en:'en_IN',gu:'gu_IN'}[language]} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="विजयपताका – उपधान – महोत्सव | 25 अप्रैल — 14 जून 2027" />
        <meta name="twitter:description" content="अचलगढ़, राजस्थान में उपधान की पावन साधना। कार्यक्रम, गुरु भगवंतों का सान्निध्य, वीडियो और पंजीकरण की जानकारी।" />
        <meta name="twitter:image" content="https://vardhmancreativestudio.com/assets/updhan-video/temple-03m48s.webp" />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content="विजयपताका – उपधान – महोत्सव 2027" />
        <meta property="og:description" content="एक यात्रा… स्वयं से स्वयं तक। 25 अप्रैल — 14 जून 2027 · अचलगढ़, राजस्थान।" />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content="https://vardhmancreativestudio.com/assets/updhan-video/temple-03m48s.webp" />
        <meta property="og:image:alt" content="अचलगढ़ के जिनालय का सामने से दृश्य" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify({ '@context': 'https://schema.org', '@type': 'Event', name: t('विजयपताका – उपधान – महोत्सव'), startDate: '2027-04-25', endDate: '2027-06-14', eventStatus: 'https://schema.org/EventScheduled', inLanguage: ['gu','hi','en'], eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode', location: { '@type': 'Place', name: t('अचलगढ़, राजस्थान'), address: { '@type': 'PostalAddress', addressLocality: 'अचलगढ़', addressRegion: 'राजस्थान', addressCountry: 'IN' } }, url: canonical, description: t('प्रभु-प्रार्थना, यंत्र-मंत्र साधना एवं उपधान-उपासना की आध्यात्मिक यात्रा।') })}</script>
      </Helmet>
      <Helmet>
        <script type="application/ld+json">{JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', inLanguage:language, mainEntity: visibleFaqs.map(([question, answer]) => ({ '@type': 'Question', name: t(question), acceptedAnswer: { '@type': 'Answer', text: t(answer) } })) })}</script>
        <script type="application/ld+json">{JSON.stringify({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Vardhman Creative Studio', item: 'https://vardhmancreativestudio.com/' }, { '@type': 'ListItem', position: 2, name: t('विजयपताका – उपधान – महोत्सव'), item: canonical }] })}</script>
      </Helmet>
      <a className="vp-skip" href="#main">मुख्य जानकारी पर जाएँ</a>
      <div className="vp-utility"><div className="vp-topline"><span>॥ श्री वीतरागाय नमः ॥</span><span>अचलगढ़ · राजस्थान · 2027</span></div>
      <UpdhanLanguageButtons /></div>
      <header className="vp-header">
        <a href="#top" className="vp-brand" onClick={closeMenu}><span>विजयपताका<small>उपधान महोत्सव</small></span></a>
        <nav className={menuOpen ? 'vp-nav is-open' : 'vp-nav'} aria-label="महोत्सव नेविगेशन" id="vp-navigation"><a href="#journey" onClick={closeMenu}>परिचय</a><a href="#blessings" onClick={closeMenu}>पावन सान्निध्य</a><a href="#sadhana" onClick={closeMenu}>साधना</a><a href="#video" onClick={closeMenu}>वीडियो</a><a href="#registration" onClick={closeMenu}>पंजीकरण</a><a href="#faq" onClick={closeMenu}>प्रश्नोत्तर</a></nav>
        <Link className="vp-header-cta" to={applicationPath}>आवेदन फॉर्म देखें</Link>
        <button data-updhan-track="menu_toggle" className="vp-menu" aria-label={menuOpen ? 'मेन्यू बंद करें' : 'मेन्यू खोलें'} aria-expanded={menuOpen} aria-controls="vp-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? t('बंद करें') : t('मेन्यू')}</button>
      </header>
      <main id="main">
        <section className="vp-hero" id="top" ref={hero}>
          <div className="vp-hero-copy"><p className="vp-kicker"><span />शिखर से भीतर की ओर…</p><h1>विजयपताका<small>उपधान महोत्सव</small></h1><p className="vp-hero-date">25 अप्रैल — 14 जून 2027<small>रविवार प्रथम प्रवेश · सोमवार मालारोपण</small></p><div className="vp-hero-location">अचलगढ़, राजस्थान</div><div className="vp-hero-actions"><Link data-updhan-track="hero_apply" to={applicationPath} className="vp-btn">आवेदन फॉर्म देखें</Link><a data-updhan-track="darshan" href="#gallery" className="vp-text-link">तीर्थ दर्शन</a></div></div>
          <UpdhanStillFigure still={videoStills.aerial} priority className="vp-hero-art" />
        </section>
        <section className="vp-event-strip" aria-label="तिथि और स्थान"><div><span className="vp-strip-label">उपधान की शुरुआत</span><strong>25 अप्रैल <span>2027</span></strong><small>रविवार</small></div><span className="vp-strip-rule" aria-hidden="true" /><div><span className="vp-strip-label">मालारोपण</span><strong>14 जून <span>2027</span></strong><small>सोमवार</small></div><div className="vp-strip-place"><span>अचलगढ़<small>राजस्थान</small></span></div></section>
        <UpdhanTrailer />
        <section className="vp-benefactor-top vp-section"><p className="vp-kicker">संपूर्ण लाभार्थी</p><h2>शिल्पाबेन विजयभाई कोठारी</h2><p>आर्यमन · अभिश्री कोठारी</p><div><span>विजी फाइनेंस लिमिटेड</span><span>श्री विजयभाई नगीनचंद कोठारी चैरिटेबल ट्रस्ट, इंदौर</span></div></section>
        <UpdhanProgrammeNav />

        <section id="journey" className="vp-section vp-intro"><div><p className="vp-kicker">खुद के लिए कुछ समय</p><h2>दुनिया से जुड़े हैं।<br /><em>खुद से कितने?</em></h2><span className="vp-section-number">विमला चलने… गढ़ गिरनार… आबू पर… जिनवर जुहार…</span></div><div className="vp-prose"><p className="vp-prose-lead">रोज़ की भागदौड़ से थोड़ा विराम लें। प्रकृति और गुरु भगवंतों के साथ अपने लिए समय निकालें।</p><details className="vp-story-details"><summary>और पढ़ें</summary><p>सुबह आँख खुलते ही मोबाइल। दिनभर भागदौड़, काम का दबाव, रिश्तों का तनाव और भविष्य की चिंता। रात को नींद तो आती है… लेकिन मन शांत नहीं होता।</p><p>कभी तुलना, कभी असफलता का डर। इसी भागदौड़ में हम अपनी आत्मा की आवाज़ सुनना भूल गए।</p></details></div></section>

        <section id="blessings" className="vp-blessings"><div className="vp-section"><div className="vp-section-heading"><p className="vp-kicker">गुरु भगवंतों का आशीर्वाद</p><h2>गुरु भगवंतों का<br /><em>साथ और मार्गदर्शन।</em></h2><p>पूज्य गुरु भगवंतों के साथ उपधान की साधना करने का अवसर।</p></div><div className="vp-saints"><article className="vp-saints-main"><p className="vp-saint-label">पावन निश्रामंगल</p><p className="vp-honor">अयोध्यापुरमतीर्थ प्रेरक बंधुबेलडी</p><h3>प.पू. आ.दे. श्री<br /><span>जिन-हेमचंद्रसागरसूरिमहाराज</span></h3><h3>पू. आ. दे. श्री<br /><span>विरागचंद्रसागरसूरिमहाराज</span></h3><p className="vp-sangh">आदि विशाल श्रमणवृंद</p><div className="vp-sadhvis"><p>पू. सा. राजयशाश्रीजी म. आदि</p><small>विशाल श्रमणीवृंद</small></div></article><article className="vp-saints-inspired"><p className="vp-saint-label">पावन प्रेरणामंगल</p><div><p className="vp-honor">वर्धमान तपोनिधि</p><h3>पू. आ. श्री<br /><span>सम्यकचंद्रसागरसूरिमहाराज</span></h3></div><div><p className="vp-honor">युवा साहित्यसर्जक</p><h3>पू. आ. श्री<br /><span>तारकचंद्रसागरसूरिमहाराज</span></h3></div></article></div></div></section>
        <section id="sadhana" className="vp-section vp-sadhana"><div className="vp-sadhana-heading"><div><p className="vp-kicker">उपधान की साधना</p><h2>भागदौड़ से दूर।<br /><em>खुद के करीब।</em></h2></div><p>यह सिर्फ़ कोई आयोजन नहीं…<br />स्वयं को जानने का अवसर है।</p></div><div className="vp-practice-list">{practices.map(([number, title, subtitle, text]) => <article key={number}><span className="vp-practice-number">{number}</span><h3>{title}<small>{subtitle}</small></h3><p>{text}</p></article>)}</div><div className="vp-divine"><span>New Divine Connection.</span><span>New Vibrations.</span><span>New Revelation.</span><span>New Inspiration.</span></div></section>
        <section className="vp-place"><div className="vp-section vp-place-inner"><div className="vp-place-title"><p className="vp-kicker">अरावली की गोद में</p><h2>अचलगढ़</h2><span>राजस्थान</span></div><div className="vp-place-copy"><p>पहाड़ों की शांति। खुला आसमान।<br />और खुद के साथ कुछ समय।</p><h3>और आत्मा पाएगी<br />उपधान की साधना।</h3><a data-updhan-track="map" href="https://maps.app.goo.gl/JGXG1nPSfkm47vMLA" target="_blank" rel="noopener noreferrer">अचलगढ़ का नक्शा देखें </a></div></div></section>
        <UpdhanVideoGallery />
        <section className="vp-section vp-journey"><p className="vp-kicker">Welcome to Achalgarh</p><h2>एक बेहतर अनुभव।<br/><em>भीतर की एक नई यात्रा।</em></h2><p>Best Facility and Better Inner Journey.</p><div className="vp-journey-grid">{[["Nature","Beautiful mode"],["Mountain","Adventure mode"],["Mind","Inspire mode"],["Yantra–Mantra","Energy mode"],["Updhan Tap","Spiritual mode"]].map(([title,body])=><article key={title}><h3>{title}</h3><p>{body}</p></article>)}</div><strong>A Journey from Reel to Real.</strong><p>Real Experience · Real Transformation</p></section><UpdhanParticipation />
        <UpdhanProgrammeSections />
        <section id="details" className="vp-section vp-details"><div><p className="vp-kicker">कार्यक्रम की जानकारी</p><h2>तारीख याद रखें।<br /><em>यात्रा की तैयारी करें।</em></h2><p className="vp-details-date">25 अप्रैल — 14 जून 2027</p><p>अचलगढ़, राजस्थान</p><div className="vp-countdown">{now < startDate ? <><p>कार्यक्रम शुरू होने में बाकी</p><div>{countdown.map((value, index) => <span key={index}><strong>{String(value).padStart(2, '0')}</strong><small>{['दिन', 'घंटे', 'मिनट'][index]}</small></span>)}</div><small>भारतीय समय के अनुसार</small></> : <p>{now < endDate ? 'महोत्सव चल रहा है।' : 'महोत्सव की तारीखें पूरी हो चुकी हैं।'}</p>}</div><div className="vp-actions"><button data-updhan-track="share" className="vp-btn vp-btn-outline" onClick={shareEvent}>साझा करें</button></div><p className="vp-share-status" role="status">{shareStatus}</p></div><aside className="vp-information"><span className="vp-information-index">ज़रूरी जानकारी</span><h3>आने से पहले<br />क्या जानना ज़रूरी है?</h3><dl><div><dt>तिथि और स्थान</dt><dd>25 अप्रैल — 14 जून 2027<br />अचलगढ़, राजस्थान</dd></div><div><dt>पंजीकरण सहायता</dt><dd>आशीषभाई उदाणी<br/><a data-updhan-track="contact_call" href="tel:+919727714008">+91 97277 14008</a></dd></div></dl><p>फॉर्म भरने या कार्यक्रम की जानकारी के लिए संपर्क करें।</p></aside></section>
        <section id="faq" className="vp-section vp-faq"><div><p className="vp-kicker">आपके प्रश्न</p><h2>कार्यक्रम से पहले<br /><em>ये बातें जान लें।</em></h2><p>आपके सवालों के आसान जवाब।</p></div><div className="vp-faq-list">{visibleFaqs.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div></section>
        <section className="vp-patrons vp-section"><div><p className="vp-kicker">लाभार्थी</p><h3>शिल्पाबेन विजयभाई कोठारी</h3><p>आर्यमन · अभिश्री कोठारी</p><div className="vp-patron-companies"><span>विजी फाइनेंस लिमिटेड</span><p>श्री विजयभाई नगीनचंद कोठारी<br />चैरिटेबल ट्रस्ट, इंदौर</p></div></div><div><div className="vp-inviter"><p className="vp-kicker">निमंत्रक</p><p>श्रीमंत शेठ श्री अचलसीजी अमरसींजी जैन श्वे. पेढी, अचलगढ़ (ता. आबू, राजस्थान)</p></div></div></section>
        <section className="vp-section vp-organizer"><p className="vp-kicker">आयोजक</p><h2>શ્રી પ્રહલાદ પ્લોટ જૈન યુવક મંડળ</h2><p>રાજકોટ</p></section><section className="vp-closing"><p>कुछ यात्राएँ तस्वीरों में नहीं रहतीं…</p><h2>वो… <em>जीवन में</em> रह जाती हैं।</h2><a href="#top" aria-label="पेज के आरंभ पर जाएँ">ऊपर जाएँ</a></section>
      </main>
      <UpdhanMeasurement />
      <footer className="vp-footer"><a className="vp-brand" href="#top"><span>विजयपताका<small>उपधान महोत्सव · 2027</small></span></a><p>अचलगढ़, राजस्थान<br />25 अप्रैल — 14 जून 2027</p><a href="/">प्रस्तुति: Vardhman Creative Studio </a></footer>
      <nav aria-label="त्वरित नेविगेशन" className={heroVisible?'vp-mobile-bar is-hidden':'vp-mobile-bar'}><a data-updhan-track="darshan" href="#gallery">दर्शन</a><a href="#options">साधना</a><a href="#rules">नियम</a><Link data-updhan-track="mobile_apply" className="vp-mobile-apply" to={applicationPath}>आवेदन</Link></nav>
    </div>,language)
  );
}
