import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';

const ORDER_URL =
  'https://wa.me/919426056930?text=' +
  encodeURIComponent('नमस्ते, मुझे आर्यावर्त का गौरव पुस्तक की एक प्रति ऑर्डर करनी है।');

const styles = `
.ary-page{--navy:#174b32;--navy2:#087a43;--gold:#e87512;--gold2:#f6a34d;--ivory:#fffdf8;--ink:#20251f;background:var(--ivory);color:var(--ink);font-family:inherit;overflow:hidden}
.ary-page *{box-sizing:border-box}
.ary-wrap{width:min(1120px,calc(100% - 40px));margin:auto}
.ary-top{background:var(--navy);color:#f8f1e3;padding:14px 0;font-size:13px;letter-spacing:.08em}
.ary-top .ary-wrap{display:flex;justify-content:space-between;gap:16px;align-items:center}
.ary-hero{background:linear-gradient(180deg,#f07b16 0%,#fffdf8 27%,#fffdf8 72%,#078b48 100%);color:#20251f;padding:72px 0 82px;position:relative}
.ary-hero:after{content:"";position:absolute;inset:auto 0 0;height:5px;background:linear-gradient(90deg,transparent,var(--gold),transparent)}
.ary-hero-grid{display:grid;grid-template-columns:1.05fr .95fr;gap:58px;align-items:center}
.ary-kicker{color:#a64d0a;font-size:13px;letter-spacing:.17em;text-transform:uppercase;font-weight:700}
.ary-hero h1{font-size:clamp(42px,6vw,76px);line-height:1.12;margin:18px 0;color:#174b32;font-weight:800}
.ary-hero h1 span{display:block;color:#087a43}
.ary-lead{font-size:clamp(17px,2vw,21px);line-height:1.8;color:#42483f;max-width:620px}
.ary-price{display:flex;align-items:center;gap:15px;margin:28px 0}
.ary-price strong{font-size:34px;color:#087a43}
.ary-price span{color:#4d554b;font-size:14px}
.ary-btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;border:1px solid var(--gold);border-radius:999px;padding:15px 26px;background:linear-gradient(135deg,#d7b66e,#a77d36);color:#172235!important;text-decoration:none;font-weight:800;box-shadow:0 12px 28px #0003;transition:transform .2s,filter .2s}
.ary-btn:hover{transform:translateY(-2px);filter:brightness(1.06)}
.ary-note{font-size:12px;color:#cbd4df;margin-top:14px}
.ary-cover-frame{max-width:410px;margin:auto;padding:15px;background:linear-gradient(145deg,#f07b16,#fffdf8 38%,#078b48);border-radius:10px;box-shadow:0 22px 55px #174b3226;transform:rotate(1deg)}
.ary-cover-frame img{display:block;width:100%;height:auto;border:1px solid #fff9}
.ary-section{padding:76px 0}
.ary-section h2{font-size:clamp(29px,4vw,44px);line-height:1.25;color:var(--navy);margin:10px 0 18px}
.ary-center{text-align:center}
.ary-sub{max-width:760px;margin:0 auto;color:#526071;line-height:1.85;font-size:17px}
.ary-letter-row{display:flex;justify-content:center;flex-wrap:wrap;gap:12px;margin:30px 0}
.ary-letter{min-width:66px;padding:12px 15px;border:1px solid #b9d8c4;border-radius:12px;background:#fff;color:var(--navy);font-size:26px;font-weight:800;box-shadow:0 5px 16px #14243a0c}
.ary-feature-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:38px}
.ary-feature{background:white;border:1px solid #e8dfce;border-radius:18px;padding:25px;box-shadow:0 12px 32px #14243a0a}
.ary-feature b{display:block;color:#d8660c;font-size:13px;letter-spacing:.12em;margin-bottom:12px}
.ary-feature h3{font-size:20px;color:var(--navy);margin:0 0 10px}
.ary-feature p{color:#5c6674;line-height:1.8;margin:0;font-size:15px}
.ary-timeline{background:#f5f2e9}
.ary-timeline-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:20px;margin-top:34px}
.ary-timeline-card{background:#fff;border-radius:16px;padding:26px;border-left:4px solid var(--gold)}
.ary-timeline-card small{color:#98743b;font-weight:800;letter-spacing:.1em}
.ary-timeline-card h3{color:var(--navy);font-size:21px;margin:8px 0}
.ary-timeline-card p{color:#5c6674;line-height:1.8;margin:0}
.ary-oxford{background:var(--navy);color:white}
.ary-oxford h2{color:#f5e9ce}
.ary-oxford .ary-sub{color:#d4dce6}
.ary-oxford-pill{display:inline-block;margin-top:24px;border:1px solid #b99659;color:#f1dcae;border-radius:999px;padding:12px 20px;font-weight:700;letter-spacing:.04em}
.ary-order{background:linear-gradient(180deg,#174b32,#087a43);color:white;padding:76px 0;text-align:center}
.ary-order h2{color:#f7e8c5;font-size:clamp(32px,4vw,48px);margin:10px 0}
.ary-order p{color:#e0e5ec;line-height:1.8;font-size:17px}
.ary-order .ary-price{justify-content:center}
.ary-contact{font-size:14px;color:#d4dce6;margin-top:20px}
.ary-footer{background:#174b32;color:#aeb8c5;text-align:center;padding:22px;font-size:12px}
.ary-page a:focus-visible{outline:3px solid #e5cf9d;outline-offset:3px}
@media(max-width:760px){.ary-hero{padding:48px 0 60px}.ary-hero-grid{grid-template-columns:1fr;gap:36px}.ary-hero-copy{text-align:center}.ary-lead{margin:auto}.ary-price{justify-content:center}.ary-cover-frame{max-width:300px}.ary-section{padding:54px 0}.ary-feature-grid,.ary-timeline-grid{grid-template-columns:1fr}.ary-top .ary-wrap{justify-content:center;text-align:center}.ary-top .ary-top-right{display:none}}
`;

export default function AryavartPage() {
  useEffect(() => {
    document.title = 'आर्यावर्त का गौरव | एक अद्वितीय साहित्यिक कृति';
    const description = 'आर्यावर्त का गौरव — पाँच ओष्ठ्य वर्णों प, फ, ब, भ और म के प्रयोग के बिना रचित अनूठी पुस्तक। मूल्य ₹300। WhatsApp पर अपनी प्रति ऑर्डर करें।';
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.content = description;
    return () => {};
  }, []);

  return (
    <main className="ary-page">
      <Helmet>
        <html lang="hi" />
        <meta property="og:title" content="आर्यावर्त का गौरव" />
        <meta property="og:description" content="पाँच ओष्ठ्य वर्णों के प्रयोग के बिना रचित एक अनूठी साहित्यिक कृति।" />
        <meta property="og:type" content="product" />
      </Helmet>
      <style>{styles}</style>
      <div className="ary-top">
        <div className="ary-wrap">
          <span>॥ श्री वीतरागाय नमः ॥</span>
          <span className="ary-top-right">VARDHMAN CREATIVE STUDIO</span>
        </div>
      </div>

      <section className="ary-hero">
        <div className="ary-wrap ary-hero-grid">
          <div className="ary-hero-copy">
            <div className="ary-kicker">A remarkable literary creation</div>
            <h1>आर्यावर्त <span>का गौरव</span></h1>
            <p className="ary-lead">
              पाँच ओष्ठ्य वर्णों के प्रयोग के बिना रचित एक अनूठी पुस्तक —
              भाषाई कौशल, एकाग्रता और आध्यात्मिक साधना का अद्भुत संगम।
            </p>
            <div className="ary-price"><strong>₹300</strong><span>प्रति पुस्तक</span></div>
            <a className="ary-btn" href={ORDER_URL} target="_blank" rel="noopener noreferrer">
              WhatsApp पर पुस्तक ऑर्डर करें <span aria-hidden="true">↗</span>
            </a>
            <div className="ary-note">ऑर्डर के लिए WhatsApp: +91 94260 56930</div>
          </div>
          <div className="ary-cover-frame">
            <img
              src="/images/aryavart-ka-gaurav-cover.png"
              alt="आर्यावर्त का गौरव पुस्तक का वास्तविक मुखपृष्ठ"
              loading="eager"
            />
          </div>
        </div>
      </section>

      <section className="ary-section ary-center">
        <div className="ary-wrap">
          <div className="ary-kicker" style={{color:'#9b783e'}}>The unique concept</div>
          <h2>पाँच वर्णों के बिना रची गई अनूठी कृति</h2>
          <p className="ary-sub">
            इस पुस्तक की विशेषता है कि इसे हिंदी के पाँच ओष्ठ्य वर्णों —
            प, फ, ब, भ और म — का प्रयोग किए बिना लिखा गया है।
          </p>
          <div className="ary-letter-row" aria-label="वर्जित वर्ण">
            {['प','फ','ब','भ','म'].map(letter => <span className="ary-letter" key={letter}>{letter}</span>)}
          </div>
          <p className="ary-sub">पुस्तक के मुखपृष्ठ पर इसे विश्व में सर्वप्रथम पाँच ओष्ठ्य व्यंजनों के प्रयोग के बिना प्रकाशित पुस्तक के रूप में प्रस्तुत किया गया है।</p>
        </div>
      </section>

      <section className="ary-section ary-center" style={{background:'#fffdf8'}}>
        <div className="ary-wrap">
          <div className="ary-kicker" style={{color:'#a64d0a'}}>Inside the book</div>
          <h2>पुस्तक की एक झलक</h2>
          <p className="ary-sub">पुस्तक के वास्तविक पृष्ठों और इसकी विशिष्ट प्रस्तुति को करीब से देखिए।</p>
          <div style={{maxWidth:460,margin:'30px auto 0',padding:10,background:'linear-gradient(180deg,#f07b16,#fffdf8 45%,#078b48)',borderRadius:12,boxShadow:'0 12px 35px #174b321c'}}>
            <img src="/images/aryavart-ka-gaurav-inside-page.png" alt="आर्यावर्त का गौरव पुस्तक का वास्तविक अंदरूनी पृष्ठ" style={{display:'block',width:'100%',height:'auto',borderRadius:5}} loading="lazy" />
          </div>
        </div>
      </section>

      <section className="ary-section" style={{background:'#f1ebdf'}}>
        <div className="ary-wrap">
          <div className="ary-center">
            <div className="ary-kicker" style={{color:'#9b783e'}}>A legacy of language & discipline</div>
            <h2>इतिहास, साधना और साहित्य</h2>
            <p className="ary-sub">लगभग 350 वर्ष पुरानी भाषाई परंपरा से प्रेरित यह कृति एक असाधारण साधना की कहानी कहती है।</p>
          </div>
          <div className="ary-feature-grid">
            <article className="ary-feature">
              <b>01 · HISTORICAL INSPIRATION</b>
              <h3>350 वर्षों की परंपरा</h3>
              <p>पूज्य उपाध्याय श्री यशोविजयजी महाराज साहब की ऐतिहासिक भाषाई साधना से प्रेरित परंपरा।</p>
            </article>
            <article className="ary-feature">
              <b>02 · JAMNAGAR · 12 OCT 2025</b>
              <h3>100 मिनट का प्रवचन</h3>
              <p>पूज्य मुनि श्री श्रमणचंद्रसागरजी महाराज साहेब ने ‘आर्यावर्त की गरिमा’ विषय पर पाँच ओष्ठ्य वर्णों के बिना हिंदी प्रवचन दिया।</p>
            </article>
            <article className="ary-feature">
              <b>03 · RECOGNITION</b>
              <h3>India Book of Records</h3>
              <p>इस 100 मिनट की भाषाई उपलब्धि को India Book of Records में दर्ज किया गया।</p>
            </article>
          </div>
        </div>
      </section>

      <section className="ary-section ary-timeline">
        <div className="ary-wrap">
          <div className="ary-center">
            <div className="ary-kicker" style={{color:'#9b783e'}}>From a historic practice to a book</div>
            <h2>एक साधना, पुस्तक के रूप में</h2>
          </div>
          <div className="ary-timeline-grid">
            <article className="ary-timeline-card">
              <small>THE BOOK</small>
              <h3>आर्यावर्त का गौरव</h3>
              <p>मुनिश्री श्रमणचंद्रसागर ‘यशोनंदन’ द्वारा रचित यह पुस्तक पाँचों ओष्ठ्य वर्णों के प्रयोग के बिना लिखी गई है।</p>
            </article>
            <article className="ary-timeline-card">
              <small>OXFORD UNIVERSITY</small>
              <h3>अंतरराष्ट्रीय पहचान</h3>
              <p>‘आर्यावर्त का गौरव’ अब ऑक्सफोर्ड यूनिवर्सिटी की लाइब्रेरी में उपलब्ध है और उसके ऑनलाइन कैटलॉग में सूचीबद्ध है।</p>
            </article>
          </div>
        </div>
      </section>

      <section className="ary-section ary-oxford">
        <div className="ary-wrap ary-center">
          <div className="ary-kicker">International catalogue recognition</div>
          <h2>ऑक्सफोर्ड यूनिवर्सिटी तक पहुँची ‘आर्यावर्त का गौरव’</h2>
          <p className="ary-sub">
            भारतीय ज्ञान और साहित्य की यह अनूठी कृति अब ऑक्सफोर्ड यूनिवर्सिटी की
            लाइब्रेरी में भी उपलब्ध है और उसके आधिकारिक ऑनलाइन कैटलॉग में दर्ज है।
          </p>
          <span className="ary-oxford-pill">OXFORD UNIVERSITY · ONLINE CATALOGUE</span>
        </div>
      </section>

      <section className="ary-order" id="order">
        <div className="ary-wrap">
          <div className="ary-kicker">Bring this unique work to your bookshelf</div>
          <h2>इस अनूठी कृति को<br/>अपने पुस्तकालय का हिस्सा बनाइए</h2>
          <p>‘आर्यावर्त का गौरव’ की अपनी प्रति आज ही ऑर्डर करें।</p>
          <div className="ary-price"><strong>₹300</strong><span>प्रति पुस्तक</span></div>
          <a className="ary-btn" href={ORDER_URL} target="_blank" rel="noopener noreferrer">
            अभी WhatsApp पर ऑर्डर करें <span aria-hidden="true">↗</span>
          </a>
          <div className="ary-contact">WhatsApp Order: +91 94260 56930</div>
        </div>
      </section>
      <footer className="ary-footer">© Vardhman Creative Studio · आर्यावर्त का गौरव</footer>
    </main>
  );
}
