
import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';

const ORDER_URL =
  'https://wa.me/919426056930?text=' +
  encodeURIComponent(
    'नमस्ते, मुझे आर्यावर्त का गौरव पुस्तक की एक प्रति ऑर्डर करनी है। पुस्तक का मूल्य ₹300 है। कृपया ऑर्डर की प्रक्रिया बताएं।'
  );

const styles = `
.ary-page {
  --saffron: #ed7815;
  --green: #087c43;
  --deep-green: #124b32;
  --gold: #bd9140;
  --gold-light: #f0dba9;
  --ivory: #fffdf7;
  --ink: #252b25;
  background: var(--ivory);
  color: var(--ink);
  font-family: inherit;
  overflow: hidden;
}

.ary-page * {
  box-sizing: border-box;
}

.ary-wrap {
  width: min(1120px, calc(100% - 40px));
  margin: auto;
}

.ary-top {
  background: var(--deep-green);
  color: white;
  padding: 13px 0;
  font-size: 13px;
  letter-spacing: .08em;
}

.ary-top .ary-wrap {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ary-hero {
  background:
    linear-gradient(
      180deg,
      #ed7815 0%,
      #fffdf7 19%,
      #fffdf7 83%,
      #078c49 100%
    );
  padding: 75px 0 85px;
}

.ary-hero-grid {
  display: grid;
  grid-template-columns: 1.1fr .9fr;
  gap: 55px;
  align-items: center;
}

.ary-kicker {
  color: #a95813;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: .12em;
  margin-bottom: 17px;
}

.ary-hero h1 {
  font-size: clamp(42px, 6vw, 76px);
  line-height: 1.16;
  color: var(--deep-green);
  margin: 0 0 23px;
  font-weight: 800;
}

.ary-hero h1 span {
  display: block;
  color: var(--green);
}

.ary-lead {
  font-size: 19px;
  line-height: 1.9;
  color: #424b40;
  max-width: 590px;
}

.ary-hero-highlight {
  margin-top: 22px;
  padding-left: 17px;
  border-left: 3px solid var(--gold);
  color: #705323;
  font-size: 16px;
  line-height: 1.8;
}

.ary-cover-frame {
  max-width: 390px;
  margin: auto;
  padding: 11px;
  background: linear-gradient(
    145deg,
    var(--saffron),
    white 45%,
    var(--green)
  );
  border-radius: 10px;
  box-shadow: 0 25px 55px #173c2928;
}

.ary-cover-frame img {
  display: block;
  width: 100%;
  height: auto;
  border: 1px solid #ffffff;
}

.ary-btn {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  padding: 16px 28px;
  border-radius: 50px;
  background: linear-gradient(135deg, #e6bd6d, #bd9140);
  color: #172c21 !important;
  text-decoration: none !important;
  font-weight: 800;
  font-size: 16px;
  border: 1px solid #d29a36;
  box-shadow: 0 10px 25px #0002;
  transition: .2s ease;
}

.ary-btn:hover {
  transform: translateY(-3px);
  filter: brightness(1.06);
}

.ary-hero .ary-btn {
  margin-top: 27px;
}

.ary-note {
  margin-top: 15px;
  font-size: 13px;
  color: #425b47;
}

.ary-section {
  padding: 78px 0;
}

.ary-center {
  text-align: center;
}

.ary-section h2 {
  font-size: clamp(29px, 4vw, 43px);
  color: var(--deep-green);
  line-height: 1.35;
  margin: 10px 0 20px;
}

.ary-sub {
  max-width: 790px;
  margin: auto;
  color: #555f55;
  font-size: 17px;
  line-height: 1.95;
}

.ary-letter-row {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 13px;
  margin: 32px 0;
}

.ary-letter {
  width: 65px;
  height: 65px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  color: var(--deep-green);
  border: 1px solid #d8c49b;
  border-radius: 12px;
  font-size: 28px;
  font-weight: 800;
  box-shadow: 0 5px 16px #0000000c;
}

.ary-meaning {
  background: #f4efe3;
}

.ary-feature-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 40px;
}

.ary-feature {
  background: white;
  border: 1px solid #e9dfcb;
  border-radius: 16px;
  padding: 28px 24px;
  box-shadow: 0 12px 30px #173c2910;
}

.ary-feature-number {
  color: var(--saffron);
  font-size: 13px;
  font-weight: 800;
  letter-spacing: .1em;
}

.ary-feature h3 {
  color: var(--deep-green);
  font-size: 21px;
  line-height: 1.5;
  margin: 14px 0 12px;
}

.ary-feature p {
  color: #586258;
  font-size: 15px;
  line-height: 1.9;
  margin: 0;
}

.ary-inside {
  background: #fffdf7;
}

.ary-inside-frame {
  max-width: 440px;
  margin: 35px auto 0;
  padding: 9px;
  background: linear-gradient(
    180deg,
    var(--saffron),
    white 50%,
    var(--green)
  );
  border-radius: 10px;
  box-shadow: 0 15px 40px #00000018;
}

.ary-inside-frame img {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 4px;
}

.ary-oxford {
  background: var(--deep-green);
  color: white;
}

.ary-oxford h2 {
  color: var(--gold-light);
}

.ary-oxford .ary-sub {
  color: #e6eee6;
}

.ary-oxford-tag {
  display: inline-block;
  border: 1px solid #c7a45f;
  color: var(--gold-light);
  border-radius: 50px;
  padding: 12px 22px;
  margin-top: 25px;
  font-weight: 700;
  letter-spacing: .04em;
}

.ary-order {
  background: linear-gradient(
    145deg,
    #103d2b,
    #087c43
  );
  padding: 85px 20px;
  text-align: center;
  color: white;
}

.ary-order .ary-kicker {
  color: #f3c779;
}

.ary-order h2 {
  color: #fff4d9;
  font-size: clamp(31px, 4.5vw, 48px);
  line-height: 1.4;
  margin: 12px 0 18px;
}

.ary-order-description {
  color: #f1f5ee;
  font-size: 17px;
  line-height: 1.8;
}

.ary-price {
  margin: 30px auto;
  display: flex;
  justify-content: center;
  align-items: baseline;
  gap: 12px;
}

.ary-price strong {
  font-size: clamp(42px, 6vw, 58px);
  line-height: 1.2;
  color: #fff3d5;
  font-weight: 900;
  text-shadow: 0 2px 12px #0003;
}

.ary-price span {
  font-size: 16px;
  color: #ffffff;
  font-weight: 600;
}

.ary-order .ary-btn {
  margin-top: 5px;
  min-width: 280px;
}

.ary-contact {
  color: #ffffff;
  font-size: 15px;
  margin-top: 22px;
}

.ary-footer {
  background: #0b3022;
  color: #e7e7d9;
  padding: 22px;
  text-align: center;
  font-size: 13px;
}

.ary-page a:focus-visible {
  outline: 3px solid #f0dba9;
  outline-offset: 4px;
}

@media (max-width: 760px) {
  .ary-wrap {
    width: min(100% - 30px, 560px);
  }

  .ary-hero {
    padding: 48px 0 60px;
  }

  .ary-hero-grid {
    grid-template-columns: 1fr;
    gap: 35px;
  }

  .ary-hero-copy {
    text-align: center;
  }

  .ary-lead {
    font-size: 17px;
  }

  .ary-hero-highlight {
    text-align: left;
  }

  .ary-cover-frame {
    max-width: 290px;
  }

  .ary-section {
    padding: 55px 0;
  }

  .ary-feature-grid {
    grid-template-columns: 1fr;
  }

  .ary-letter {
    width: 55px;
    height: 55px;
  }

  .ary-order {
    padding: 60px 15px;
  }

  .ary-order .ary-btn {
    min-width: 0;
    width: 100%;
    max-width: 340px;
  }

  .ary-top .ary-wrap {
    justify-content: center;
    text-align: center;
  }

  .ary-top-brand {
    display: none;
  }
}
`;

export default function AryavartPage() {
  useEffect(() => {
    document.title =
      'आर्यावर्त का गौरव | पाँच ओष्ठ्य वर्णों के बिना रचित अनूठी पुस्तक';

    const description =
      'आर्यावर्त का गौरव — प, फ, ब, भ और म पाँच ओष्ठ्य वर्णों के प्रयोग के बिना रचित अनूठी पुस्तक। जामनगर के 100 मिनट के ऐतिहासिक प्रवचन और Oxford University Library में स्थान प्राप्त इस कृति को ₹300 में ऑर्डर करें।';

    let meta = document.querySelector(
      'meta[name="description"]'
    );

    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }

    meta.content = description;
  }, []);

  return (
    <main className="ary-page">
      <Helmet>
        <html lang="hi" />
        <meta
          property="og:title"
          content="आर्यावर्त का गौरव"
        />
        <meta
          property="og:description"
          content="पाँच ओष्ठ्य वर्णों के प्रयोग के बिना रचित एक अनूठी साहित्यिक कृति।"
        />
        <meta property="og:type" content="product" />
      </Helmet>

      <style>{styles}</style>

      {/* Header */}
      <header className="ary-top">
        <div className="ary-wrap">
          <span>॥ श्री वीतरागाय नमः ॥</span>
          <span className="ary-top-brand">
            VARDHMAN CREATIVE STUDIO
          </span>
        </div>
      </header>

      {/* Hero */}
      <section className="ary-hero">
        <div className="ary-wrap ary-hero-grid">
          <div className="ary-hero-copy">
            <div className="ary-kicker">
              350 वर्षों की ऐतिहासिक भाषाई परंपरा
            </div>

            <h1>
              आर्यावर्त
              <span>का गौरव</span>
            </h1>

            <p className="ary-lead">
              350 वर्षों बाद पुनः साकार हुई एक अद्भुत
              भाषाई साधना — पाँच ओष्ठ्य वर्णों के प्रयोग
              के बिना रची गई एक विलक्षण साहित्यिक कृति।
            </p>

            <div className="ary-hero-highlight">
              प, फ, ब, भ और म — इन पाँच वर्णों का
              प्रयोग किए बिना रचित अनूठी पुस्तक।
            </div>

            <a
              className="ary-btn"
              href={ORDER_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              पुस्तक ऑर्डर करें ↗
            </a>

            <div className="ary-note">
              पुस्तक मूल्य: ₹300 | WhatsApp: +91 94260 56930
            </div>
          </div>

          <div className="ary-cover-frame">
            <img
              src="/assets/aryavart-ka-gaurav-cover.png"
              alt="आर्यावर्त का गौरव पुस्तक का वास्तविक मुखपृष्ठ"
              loading="eager"
            />
          </div>
        </div>
      </section>

      {/* Unique concept */}
      <section className="ary-section ary-center">
        <div className="ary-wrap">
          <div className="ary-kicker">
            एक विलक्षण साहित्यिक प्रयोग
          </div>

          <h2>
            पाँच ओष्ठ्य वर्णों के बिना रचित अनूठी कृति
          </h2>

          <p className="ary-sub">
            हिंदी भाषा के पाँच ओष्ठ्य व्यंजन — प, फ, ब,
            भ और म — सामान्य लेखन में सहज रूप से प्रयुक्त
            होते हैं। लेकिन इन पाँचों वर्णों का प्रयोग
            किए बिना एक संपूर्ण पुस्तक की रचना करना
            असाधारण भाषाई कौशल, एकाग्रता और साधना
            का परिचायक है।
          </p>

          <div className="ary-letter-row">
            {['प', 'फ', 'ब', 'भ', 'म'].map(letter => (
              <span className="ary-letter" key={letter}>
                {letter}
              </span>
            ))}
          </div>

          <p className="ary-sub">
            'आर्यावर्त का गौरव' इसी अनूठे भाषाई
            प्रयोग का साहित्यिक स्वरूप है।
          </p>
        </div>
      </section>

      {/* History */}
      <section className="ary-section ary-meaning">
        <div className="ary-wrap">
          <div className="ary-center">
            <div className="ary-kicker">
              इतिहास से वर्तमान तक
            </div>

            <h2>
              350 वर्षों की प्रेरणा, एक अद्भुत पुनर्साधना
            </h2>

            <p className="ary-sub">
              लगभग 350 वर्ष पूर्व पूज्य उपाध्याय
              श्री यशोविजयजी महाराज साहब की
              ऐतिहासिक भाषाई साधना ने एक विलक्षण
              परंपरा का परिचय दिया। उसी ऐतिहासिक
              प्रेरणा को आगे बढ़ाते हुए पूज्य मुनि
              श्री श्रमणचंद्रसागरजी महाराज साहेब ने
              इस भाषाई साधना को पुनः साकार किया।
            </p>
          </div>

          <div className="ary-feature-grid">
            <article className="ary-feature">
              <div className="ary-feature-number">
                ऐतिहासिक प्रेरणा
              </div>
              <h3>
                पूज्य उपाध्याय श्री यशोविजयजी महाराज साहब
              </h3>
              <p>
                लगभग 350 वर्ष पुरानी भाषाई साधना,
                जिसने इस अद्भुत साहित्यिक परंपरा
                की प्रेरणा दी।
              </p>
            </article>

            <article className="ary-feature">
              <div className="ary-feature-number">
                जामनगर · 12 अक्टूबर 2025
              </div>
              <h3>
                100 मिनट का ऐतिहासिक प्रवचन
              </h3>
              <p>
                पूज्य मुनि श्री श्रमणचंद्रसागरजी
                महाराज साहेब ने 'आर्यावर्त की गरिमा'
                विषय पर पाँच ओष्ठ्य वर्णों के बिना
                हिंदी प्रवचन दिया।
              </p>
            </article>

            <article className="ary-feature">
              <div className="ary-feature-number">
                राष्ट्रीय अभिलेख
              </div>
              <h3>
                India Book of Records
              </h3>
              <p>
                12 अक्टूबर 2025 को प्रस्तुत इस
                100 मिनट की भाषाई उपलब्धि को
                India Book of Records में दर्ज किया गया।
              </p>
            </article>
          </div>

          <div className="ary-center" style={{marginTop: 35}}>
            <p className="ary-sub">
              इस ऐतिहासिक आयोजन में ISOBJG Management
              की भूमिका और सहयोग का विशेष उल्लेख।
            </p>
          </div>
        </div>
      </section>

      {/* Book inside */}
      <section className="ary-section ary-inside ary-center">
        <div className="ary-wrap">
          <div className="ary-kicker">
            पुस्तक के भीतर एक झलक
          </div>

          <h2>
            शब्द-साधना का अद्भुत साहित्यिक स्वरूप
          </h2>

          <p className="ary-sub">
            इस पुस्तक के पृष्ठों में भाषाई अनुशासन,
            साहित्यिक चिंतन और आध्यात्मिक दृष्टि
            का अनूठा समन्वय देखने को मिलता है।
          </p>

          <div className="ary-inside-frame">
            <img
              src="/assets/aryavart-ka-gaurav-inside-page.png"
              alt="आर्यावर्त का गौरव पुस्तक का वास्तविक अंदरूनी पृष्ठ"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* Oxford */}
      <section className="ary-section ary-oxford ary-center">
        <div className="ary-wrap">
          <div className="ary-kicker">
            अंतरराष्ट्रीय साहित्यिक पहचान
          </div>

          <h2>
            'आर्यावर्त का गौरव' अब ऑक्सफोर्ड यूनिवर्सिटी की
            लाइब्रेरी में भी उपलब्ध है!
          </h2>

          <p className="ary-sub">
            भारतीय भाषाई साधना और साहित्य की यह
            अनूठी कृति ऑक्सफोर्ड यूनिवर्सिटी की
            लाइब्रेरी में स्थान प्राप्त कर चुकी है
            और वहाँ के Online Catalogue में
            'आर्यावर्त का गौरव' के नाम से सूचीबद्ध है।
          </p>

          <div className="ary-oxford-tag">
            UNIVERSITY OF OXFORD · ONLINE CATALOGUE
          </div>
        </div>
      </section>

      {/* Final order */}
      <section className="ary-order" id="order">
        <div className="ary-wrap">
          <div className="ary-kicker">
            एक अनूठी कृति, आपके संग्रह के लिए
          </div>

          <h2>
            इस अनूठी कृति को अपने
            <br />
            पुस्तकालय का हिस्सा बनाइए
          </h2>

          <p className="ary-order-description">
            'आर्यावर्त का गौरव' की अपनी प्रति
            आज ही ऑर्डर करें।
          </p>

          <div className="ary-price">
            <strong>₹300</strong>
            <span>प्रति पुस्तक</span>
          </div>

          <a
            className="ary-btn"
            href={ORDER_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>अभी WhatsApp पर ऑर्डर करें</span>
            <span aria-hidden="true">↗</span>
          </a>

          <div className="ary-contact">
            WhatsApp Order: +91 94260 56930
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="ary-footer">
        © Vardhman Creative Studio · आर्यावर्त का गौरव
      </footer>
    </main>
  );
}
