import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { ArrowDown, ArrowUpRight, CalendarDays, MapPin, Menu, X, Share2, Download, Plus, Check, ArrowUp } from 'lucide-react';
import './UpdhanPage.css';
import UpdhanParticipation from '@/components/UpdhanParticipation';

const canonical = 'https://vardhmancreativestudio.com/vijaypataka-updhan-mahotsav';
const imageSource = 'https://commons.wikimedia.org/wiki/File:Mount_Abu,_Jain_temple_in_the_Fortress_of_Achalgarh_-_DPLA_-_cb6cb9086878c8a597703300a0158b33.jpg';
const startDate = Date.parse('2027-04-27T00:00:00+05:30');
const endDate = Date.parse('2027-06-15T00:00:00+05:30');
const faqs = [
  ['महोत्सव कब और कहाँ है?', 'विजयपताका – उपधान – महोत्सव 27 अप्रैल 2027 से 14 जून 2027 तक अचलगढ़, राजस्थान में आयोजित होगा। कार्यक्रम का पूरा पता अभी नहीं मिला है।'],
  ['इस यात्रा में क्या विशेष है?', 'कार्यक्रम में प्रभु-प्रार्थना, यंत्र-मंत्र साधना और उपधान-उपासना होगी। रोज़ के कार्यक्रम की पूरी जानकारी मिलने पर यहाँ जोड़ेंगे।'],
  ['पंजीकरण कैसे करें?', 'पंजीकरण का लिंक और संपर्क नंबर अभी नहीं मिले हैं। मिलते ही यहाँ जोड़ देंगे।'],
  ['क्या पूरे समय रहना ज़रूरी है?', 'कितने दिन रहना है, कौन भाग ले सकता है और क्या नियम हैं—यह जानकारी आयोजक से मिलनी बाकी है। यहाँ दी गई तारीखें पूरे महोत्सव की हैं।'],
  ['रहने, खाने और शुल्क की क्या व्यवस्था है?', 'रहने, खाने, शुल्क और पहुँचने की जानकारी अभी नहीं मिली है। यात्रा की बुकिंग करने से पहले आयोजक की जानकारी देख लें।'],
  ['महोत्सव के आयोजक कौन हैं?', 'श्री राजनगर जैन धार्मिक परीक्षा ट्रस्ट, अहमदाबाद। लाभार्थियों और पावन सान्निध्य की जानकारी इसी पेज पर दी गई है।'],
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

export default function UpdhanPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [shareStatus, setShareStatus] = useState('');
  useEffect(() => { const timer = window.setInterval(() => setNow(Date.now()), 30000); return () => window.clearInterval(timer); }, []);
  useEffect(() => { if (!shareStatus) return undefined; const timer = window.setTimeout(() => setShareStatus(''), 5000); return () => window.clearTimeout(timer); }, [shareStatus]);
  const countdown = getCountdown(now);
  const closeMenu = () => setMenuOpen(false);
  async function shareEvent() {
    const data = { title: 'विजयपताका – उपधान – महोत्सव', text: '27 अप्रैल — 14 जून 2027 | अचलगढ़, राजस्थान। एक यात्रा… स्वयं से स्वयं तक।', url: window.location.href.split('#')[0] };
    try {
      if (navigator.share) { await navigator.share(data); setShareStatus('साझा किया गया'); }
      else { await navigator.clipboard.writeText(`${data.title}\n${data.text}\n${data.url}`); setShareStatus('लिंक कॉपी हो गया'); }
    } catch (error) { if (error.name !== 'AbortError') setShareStatus('ब्राउज़र के address bar से लिंक कॉपी करें।'); }
  }
  function downloadCalendar() {
    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Vardhman Creative Studio//Vijaypataka//HI', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT', 'UID:vijaypataka-updhan-2027@vardhmancreativestudio.com', `DTSTAMP:${stamp}`, 'DTSTART;VALUE=DATE:20270427', 'DTEND;VALUE=DATE:20270615', 'SUMMARY:विजयपताका – उपधान – महोत्सव', 'LOCATION:अचलगढ़\\, राजस्थान', 'DESCRIPTION:27 अप्रैल से 14 जून 2027 तक। विस्तृत कार्यक्रम और पंजीकरण की जानकारी आयोजक से पुष्टि करें।', `URL:${canonical}`, 'END:VEVENT', 'END:VCALENDAR'];
    const bytes = new TextEncoder().encode(lines.join('\r\n') + '\r\n');
    const folded = [];
    // RFC 5545 limits each physical content line to 75 octets; preserve UTF-8 characters.
    let current = ''; let length = 0;
    for (const line of new TextDecoder().decode(bytes).split('\r\n')) {
      current = ''; length = 0;
      for (const char of line) { const size = new TextEncoder().encode(char).length; if (length + size > 75) { folded.push(current); current = ' '; length = 1; } current += char; length += size; }
      folded.push(current);
    }
    const url = URL.createObjectURL(new Blob([folded.join('\r\n')], { type: 'text/calendar;charset=utf-8' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'vijaypataka-updhan-2027.ics'; document.body.appendChild(anchor); anchor.click(); anchor.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <div className="vp-page" lang="hi">
      <Helmet>
        <title>विजयपताका – उपधान – महोत्सव | अचलगढ़ 2027</title>
        <meta name="description" content="27 अप्रैल से 14 जून 2027। अचलगढ़, राजस्थान में विजयपताका – उपधान – महोत्सव। पावन सान्निध्य, साधना, कार्यक्रम विवरण एवं आयोजक की जानकारी।" />
        <meta name="theme-color" content="#59241e" />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <meta property="og:locale" content="hi_IN" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="विजयपताका – उपधान – महोत्सव | 27 अप्रैल — 14 जून 2027" />
        <meta name="twitter:description" content="अचलगढ़, राजस्थान में उपधान की पावन साधना। कार्यक्रम, गुरु भगवंतों का सान्निध्य, वीडियो और पंजीकरण की जानकारी।" />
        <meta name="twitter:image" content="https://vardhmancreativestudio.com/assets/achalgarh-heritage.jpg" />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content="विजयपताका – उपधान – महोत्सव 2027" />
        <meta property="og:description" content="एक यात्रा… स्वयं से स्वयं तक। 27 अप्रैल — 14 जून 2027 · अचलगढ़, राजस्थान।" />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content="https://vardhmancreativestudio.com/assets/achalgarh-heritage.jpg" />
        <meta property="og:image:alt" content="अचलगढ़ के जैन मंदिर का ऐतिहासिक चित्र" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify({ '@context': 'https://schema.org', '@type': 'Event', name: 'विजयपताका – उपधान – महोत्सव', startDate: '2027-04-27', endDate: '2027-06-14', eventStatus: 'https://schema.org/EventScheduled', eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode', location: { '@type': 'Place', name: 'अचलगढ़, राजस्थान', address: { '@type': 'PostalAddress', addressLocality: 'अचलगढ़', addressRegion: 'राजस्थान', addressCountry: 'IN' } }, organizer: { '@type': 'Organization', name: 'श्री राजनगर जैन धार्मिक परीक्षा ट्रस्ट, अहमदाबाद' }, url: canonical, description: 'प्रभु-प्रार्थना, यंत्र-मंत्र साधना एवं उपधान-उपासना की आध्यात्मिक यात्रा।' })}</script>
      </Helmet>
      <Helmet>
        <script type="application/ld+json">{JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map(([question, answer]) => ({ '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer } })) })}</script>
        <script type="application/ld+json">{JSON.stringify({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Vardhman Creative Studio', item: 'https://vardhmancreativestudio.com/' }, { '@type': 'ListItem', position: 2, name: 'विजयपताका – उपधान – महोत्सव', item: canonical }] })}</script>
      </Helmet>
      <a className="vp-skip" href="#main">मुख्य जानकारी पर जाएँ</a>
      <div className="vp-topline"><span>॥ श्री वीतरागाय नमः ॥</span><span>अचलगढ़ · राजस्थान · 2027</span></div>
      <header className="vp-header">
        <a href="#top" className="vp-brand" onClick={closeMenu}><span className="vp-seal">श्री</span><span>विजयपताका<small>उपधान महोत्सव</small></span></a>
        <nav className={menuOpen ? 'vp-nav is-open' : 'vp-nav'} aria-label="महोत्सव नेविगेशन" id="vp-navigation"><a href="#journey" onClick={closeMenu}>परिचय</a><a href="#blessings" onClick={closeMenu}>पावन सान्निध्य</a><a href="#sadhana" onClick={closeMenu}>साधना</a><a href="#video" onClick={closeMenu}>वीडियो</a><a href="#registration" onClick={closeMenu}>पंजीकरण</a><a href="#faq" onClick={closeMenu}>प्रश्नोत्तर</a></nav>
        <a className="vp-header-cta" href="#details">कार्यक्रम विवरण <ArrowUpRight size={15} /></a>
        <button className="vp-menu" aria-label={menuOpen ? 'मेन्यू बंद करें' : 'मेन्यू खोलें'} aria-expanded={menuOpen} aria-controls="vp-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
      </header>
      <main id="main">
        <section className="vp-hero" id="top">
          <div className="vp-hero-copy"><p className="vp-kicker"><span />एक यात्रा… स्वयं से स्वयं तक।</p><p className="vp-invocation">विमला चलने… गढ़ गिरनार…<br />आबू पर… जिनवर जुहार…</p><h1>विजयपताका<small>उपधान महोत्सव</small></h1><div className="vp-hero-location"><MapPin size={16} />अचलगढ़, राजस्थान</div><p className="vp-hero-description">इस बार गर्मियों की छुट्टियों में सिर्फ़ जगह नहीं,<br />जीवन का अनुभव बदलें।</p><a href="#blessings" className="vp-btn">कार्यक्रम के बारे में जानें <ArrowDown size={17} /></a><p className="vp-reel">A journey from <s>Reel</s> to <i>Real.</i></p></div>
          <figure className="vp-hero-art"><div className="vp-photo-frame"><img src="/assets/achalgarh-heritage.jpg" alt="अचलगढ़ की पहाड़ी पर स्थित जैन मंदिर का ऐतिहासिक चित्र" width="800" height="645" fetchPriority="high" /><div className="vp-photo-caption"><span>उपधान की साधना, अचलगढ़ में</span><strong>अचलगढ़</strong><small>अरावली की ऊँचाइयों में</small></div></div><figcaption>अचलगढ़ का जैन मंदिर · ऐतिहासिक चित्र, 1872–73 <a href={imageSource} target="_blank" rel="noopener noreferrer" aria-label="ऐतिहासिक चित्र का स्रोत">चित्र स्रोत <ArrowUpRight size={11} /></a></figcaption><div className="vp-year-stamp" aria-hidden="true">27.04<br /><span>2027</span></div></figure>
        </section>
        <section className="vp-event-strip" aria-label="तिथि और स्थान"><div><span className="vp-strip-label">महोत्सव की शुरुआत</span><strong>27 अप्रैल <span>2027</span></strong></div><span className="vp-strip-rule" aria-hidden="true" /><div><span className="vp-strip-label">महोत्सव का समापन</span><strong>14 जून <span>2027</span></strong></div><div className="vp-strip-place"><MapPin size={23} strokeWidth={1.3} /><span>अचलगढ़<small>राजस्थान</small></span></div><button onClick={downloadCalendar} className="vp-calendar-button"><CalendarDays size={18} />कैलेंडर में जोड़ें <Download size={14} /></button></section>
        <section id="journey" className="vp-section vp-intro"><div><p className="vp-kicker">खुद के लिए कुछ समय</p><h2>दुनिया से जुड़े हैं।<br /><em>खुद से कितने?</em></h2><span className="vp-section-number" aria-hidden="true">01 / भीतर की यात्रा</span></div><div className="vp-prose"><p>सुबह आँख खुलते ही मोबाइल। दिनभर भागदौड़, काम का दबाव, रिश्तों का तनाव और भविष्य की चिंता। रात को नींद तो आती है… लेकिन मन शांत नहीं होता।</p><p>कभी तुलना, कभी असफलता का डर। इसी भागदौड़ में हम अपनी आत्मा की आवाज़ सुनना भूल गए।</p><p className="vp-prose-lead">इस बार गर्मियों की छुट्टियाँ कुछ अलग हों।<br />यह है… एक यात्रा, स्वयं से स्वयं तक।</p></div></section>
        <section id="blessings" className="vp-blessings"><div className="vp-section"><div className="vp-section-heading"><p className="vp-kicker">गुरु भगवंतों का आशीर्वाद</p><h2>गुरु भगवंतों का<br /><em>साथ और मार्गदर्शन।</em></h2><p>पूज्य गुरु भगवंतों के साथ उपधान की साधना करने का अवसर।</p></div><div className="vp-saints"><article className="vp-saints-main"><p className="vp-saint-label">पावन निश्रामंगल में</p><p className="vp-honor">अयोध्यापुरुषतीर्थ प्रेरक बंधुबेलडी</p><h3>प.पू. आ.दे. श्री<br /><span>जिन-हेमचंद्रसागरसूरिमहाराज</span></h3><h3>पू. आ. दे. श्री<br /><span>विरागचंद्रसागरसूरिमहाराज</span></h3><p className="vp-sangh">आदि विशाल श्रमणवृंद</p><div className="vp-sadhvis"><p>पू. सा. राजयशाश्रीजी म. आदि</p><small>विशाल श्रमणीवृंद</small></div></article><article className="vp-saints-inspired"><p className="vp-saint-label">पावन प्रेरणामंगल में</p><div><p className="vp-honor">वर्धमान तपोनिधि</p><h3>पू. आ. श्री<br /><span>सम्यकचंद्रसागरसूरिमहाराज</span></h3></div><div><p className="vp-honor">युवा साहित्यसर्जक</p><h3>पू. आ. श्री<br /><span>तारकचंद्रसागरसूरिमहाराज</span></h3></div></article></div></div></section>
        <section id="sadhana" className="vp-section vp-sadhana"><div className="vp-sadhana-heading"><div><p className="vp-kicker">उपधान की साधना</p><h2>भागदौड़ से दूर।<br /><em>खुद के करीब।</em></h2></div><p>यह सिर्फ़ कोई आयोजन नहीं…<br />स्वयं को जानने का अवसर है।</p></div><div className="vp-practice-list">{practices.map(([number, title, subtitle, text]) => <article key={number}><span className="vp-practice-number">{number}</span><h3>{title}<small>{subtitle}</small></h3><p>{text}</p></article>)}</div><div className="vp-divine"><span>New Divine Connection.</span><span>New Vibrations.</span><span>New Revelation.</span><span>New Inspiration.</span></div></section>
        <section className="vp-place"><div className="vp-section vp-place-inner"><div className="vp-place-title"><p className="vp-kicker">अरावली की गोद में</p><h2>अचल<span>गढ़।</span></h2><span>राजस्थान</span></div><div className="vp-place-copy"><p>जहाँ प्रकृति देगी शीतलता…<br />पर्वत देगा Adventure…<br />मन पाएगा Inspiration…</p><h3>और आत्मा पाएगी<br />उपधान की साधना।</h3><a href="https://www.google.com/maps/search/?api=1&query=Achalgarh+Rajasthan" target="_blank" rel="noopener noreferrer">अचलगढ़ का नक्शा देखें <ArrowUpRight size={17} /></a><small>यह अचलगढ़ का नक्शा है। कार्यक्रम का पूरा पता अभी नहीं मिला है।</small></div></div></section>
        <UpdhanParticipation />
        <section id="details" className="vp-section vp-details"><div><p className="vp-kicker">कार्यक्रम की जानकारी</p><h2>तारीख याद रखें।<br /><em>यात्रा की तैयारी करें।</em></h2><p className="vp-details-date">27 अप्रैल — 14 जून 2027</p><p>अचलगढ़, राजस्थान</p><div className="vp-countdown">{now < startDate ? <><p>कार्यक्रम शुरू होने में बाकी</p><div>{countdown.map((value, index) => <span key={index}><strong>{String(value).padStart(2, '0')}</strong><small>{['दिन', 'घंटे', 'मिनट'][index]}</small></span>)}</div><small>भारतीय समय के अनुसार</small></> : <p>{now < endDate ? 'महोत्सव चल रहा है।' : 'महोत्सव की तारीखें पूरी हो चुकी हैं।'}</p>}</div><div className="vp-actions"><button className="vp-btn" onClick={downloadCalendar}><CalendarDays size={17} />तारीख सुरक्षित करें</button><button className="vp-btn vp-btn-outline" onClick={shareEvent}>{shareStatus === 'लिंक कॉपी हो गया' ? <Check size={17} /> : <Share2 size={17} />}साझा करें</button></div><p className="vp-share-status" role="status">{shareStatus}</p></div><aside className="vp-information"><span className="vp-information-index">ज़रूरी जानकारी</span><h3>आने से पहले<br />क्या जानना ज़रूरी है?</h3><dl><div><dt>तिथि और स्थान</dt><dd>27 अप्रैल — 14 जून 2027<br />अचलगढ़, राजस्थान</dd></div><div><dt>पंजीकरण और संपर्क</dt><dd>लिंक और संपर्क नंबर अभी नहीं मिले हैं।</dd></div><div><dt>रहने, खाने और शुल्क की जानकारी</dt><dd>जानकारी मिलने पर यहाँ बताएँगे।</dd></div><div><dt>कौन जुड़ सकता है और क्या नियम हैं</dt><dd>नियम मिलने पर यहाँ बताएँगे।</dd></div></dl><p>कार्यक्रम की पूरी जानकारी मिलने पर यहाँ जोड़ेंगे।</p></aside></section>
        <section id="faq" className="vp-section vp-faq"><div><p className="vp-kicker">आपके प्रश्न</p><h2>कार्यक्रम से पहले<br /><em>ये बातें जान लें।</em></h2><p>आपके सवालों के आसान जवाब।</p></div><div className="vp-faq-list">{faqs.map(([question, answer]) => <details key={question}><summary>{question}<Plus size={18} aria-hidden="true" /></summary><p>{answer}</p></details>)}</div></section>
        <section className="vp-patrons vp-section"><div><p className="vp-kicker">लाभार्थी</p><h3>Shilpaben Vijaybhai Kothari</h3><p>Aaryaman एवं Abhishri Kothari</p><div className="vp-patron-companies"><span>Viji Finance Limited</span><p>Shri Vijaybhai Nageenchand Kothari<br />Charitable Trust, Indore</p></div></div><div><p className="vp-kicker">आयोजक</p><h3>श्री राजनगर जैन धार्मिक<br />परीक्षा ट्रस्ट, अहमदाबाद।</h3><p>विजयपताका – उपधान – महोत्सव, 2027</p></div></section>
        <section className="vp-closing"><p>कुछ यात्राएँ तस्वीरों में नहीं रहतीं…</p><h2>वो… <em>जीवन में</em> रह जाती हैं।</h2><a href="#top" aria-label="पेज के आरंभ पर जाएँ"><ArrowUp size={19} /></a></section>
      </main>
      <footer className="vp-footer"><a className="vp-brand" href="#top"><span className="vp-seal">श्री</span><span>विजयपताका<small>उपधान महोत्सव · 2027</small></span></a><p>अचलगढ़, राजस्थान<br />27 अप्रैल — 14 जून 2027</p><a href="/">प्रस्तुति: Vardhman Creative Studio <ArrowUpRight size={13} /></a></footer>
      <div className="vp-mobile-bar"><a href="#details">कार्यक्रम विवरण <ArrowUpRight size={15} /></a><button onClick={shareEvent} aria-label="महोत्सव साझा करें"><Share2 size={17} /></button></div>
    </div>
  );
}
