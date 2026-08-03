import React, { memo } from 'react';
import PvcMedalSvg from './PvcMedalSvg.jsx';

const PassCard = memo(({ 
  name = "", 
  mobile = "", 
  city = "", 
  passNumber = "", 
  scale = 1, 
  activeSide = "both" // "both", "front", "back"
}) => {
  // Format mobile to show only last 4 digits
  const formatMobile = (mob) => {
    if (!mob) return '';
    const clean = mob.toString().replace(/\D/g, '');
    if (clean.length <= 4) return clean;
    return `XXXXXX${clean.slice(-4)}`;
  };

  const formattedMobile = formatMobile(mobile);

  // Standard dimensions for each side (1080x1920 px)
  const cardStyle = {
    width: '1080px',
    height: '1920px',
    transform: scale !== 1 ? `scale(${scale})` : undefined,
    transformOrigin: 'top left',
  };

  // Premium design assets and styles
  const outerBorderGrad = "linear-gradient(135deg, #8a5c1e 0%, #fadc96 25%, #4e320d 50%, #fad88d 75%, #2a1602 100%)";
  const goldTextGrad = "linear-gradient(to bottom, #ffffff 0%, #ffeab3 20%, #e6be75 55%, #c59b4c 85%, #835b12 100%)";
  const titleGoldGrad = "linear-gradient(to bottom, #ffffff 0%, #ffeaa7 15%, #d4af37 50%, #aa7c11 85%, #6a4b02 100%)";
  const tricolorSmokeGrad = "linear-gradient(135deg, rgba(255, 153, 51, 0.08) 0%, rgba(255, 255, 255, 0.05) 50%, rgba(19, 136, 8, 0.08) 100%)";

  // Waving Indian Flag Overlay (SVG Path)
  const FlagOverlay = () => (
    <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0 mix-blend-overlay">
      <svg width="100%" height="100%" viewBox="0 0 1080 1920" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 100 Q 270 200, 540 100 T 1080 100 L 1080 600 Q 810 500, 540 600 T 0 600 Z" fill="#FF9933" />
        <path d="M0 600 Q 270 500, 540 600 T 1080 600 L 1080 1100 Q 810 1200, 540 1100 T 0 1100 Z" fill="#FFFFFF" />
        <path d="M0 1100 Q 270 1200, 540 1100 T 1080 1100 L 1080 1600 Q 810 1500, 540 1600 T 0 1600 Z" fill="#138808" />
      </svg>
    </div>
  );

  // Subtle Ashoka Chakra Watermark
  const AshokaChakraWatermark = ({ className }) => (
    <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="90" stroke="currentColor" strokeWidth="2.5" strokeDasharray="3 3" />
      <circle cx="100" cy="100" r="82" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="100" cy="100" r="16" stroke="currentColor" strokeWidth="2.5" />
      {Array.from({ length: 24 }).map((_, i) => (
        <line 
          key={i} 
          x1="100" 
          y1="100" 
          x2={100 + 82 * Math.cos((i * 15 * Math.PI) / 180)} 
          y2={100 + 82 * Math.sin((i * 15 * Math.PI) / 180)} 
          stroke="currentColor" 
          strokeWidth="1.2" 
        />
      ))}
    </svg>
  );

  // Gold themed QR Code SVG
  const GoldQrCode = () => (
    <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer borders and positioning boxes */}
      <path d="M5 5h30v30H5V5zm6 6v18h18V11H11zm70-6h15v15h-6V11H81V5zm0 15h15v15h-6V26H81v-6zM5 65h30v30H5V65zm6 6v18h18V71H11z" fill="#e6be75" />
      <path d="M17 17h6v6h-6v-6zm54-12h6v6h-6V5zm0 16h6v6h-6v-6zM17 77h6v6h-6v-6z" fill="#e6be75" />
      {/* QR Code matrix pattern */}
      <path d="M42 5h6v12h-6V5zm12 0h6v6h-6V5zm12 0h6v6h-6V5zm-24 12h6v6h-6v-6zm12 0h6v6h-6v-6zm12 0h6v6h-6v-6zm-24 12h6v6h-6v-6zm12 0h6v6h-6v-6zm12 0h6v6h-6v-6z" fill="#e6be75" fillOpacity="0.8" />
      <path d="M5 42h12v6H5v-6zm18 0h12v6H23v-6zm18 0h12v6H41v-6zm18 0h12v6H59v-6zm18 0h18v6H77v-6z" fill="#e6be75" fillOpacity="0.8" />
      <path d="M42 54h6v12h-6V54zm12 0h6v6h-6v-6zm12 0h6v6h-6v-6zm-24 12h6v6h-6v-6zm12 0h6v6h-6v-6zm12 0h6v6h-6v-6zm-24 12h6v6h-6v-6zm12 0h6v6h-6v-6zm12 0h6v6h-6v-6z" fill="#e6be75" fillOpacity="0.8" />
    </svg>
  );

  const showFront = activeSide === "both" || activeSide === "front";
  const showBack = activeSide === "both" || activeSide === "back";

  return (
    <div className={`flex flex-col xl:flex-row gap-12 items-center justify-center ${scale !== 1 ? 'overflow-visible' : ''}`}>
      
      {/* ================================= FRONT SIDE ================================= */}
      {showFront && (
        <div 
          id={`pass-front-${passNumber}`}
          className="relative text-white flex flex-col items-center justify-between p-11 overflow-hidden select-none shrink-0"
          style={{
            ...cardStyle,
            backgroundImage: "url('/assets/param-vir-chakra-hero.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundColor: '#02050a'
          }}
        >
          {/* Saffron-White-Green tricolor soft ambient lighting overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#02050a]/96 via-[#02050a]/92 to-[#02050a]/96 pointer-events-none z-0" />
          <div className="absolute inset-0 bg-[#02050a]/40 pointer-events-none z-0" />
          
          {/* Tricolor smoke / soft glows */}
          <div className="absolute top-0 inset-x-0 h-[400px] bg-gradient-to-b from-[#ff9933]/6 to-transparent pointer-events-none z-0 blur-3xl" />
          <div className="absolute bottom-0 inset-x-0 h-[400px] bg-gradient-to-t from-[#138808]/6 to-transparent pointer-events-none z-0 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_60%)] pointer-events-none z-0" />

          {/* Sandstone & waving flag subtle overlays */}
          <FlagOverlay />
          
          {/* Subtle Ashoka Chakra Watermark on background */}
          <AshokaChakraWatermark className="absolute right-[-80px] top-[20%] w-[380px] h-[380px] text-white/[0.025] pointer-events-none z-0" />
          <AshokaChakraWatermark className="absolute left-[-100px] bottom-[20%] w-[420px] h-[420px] text-white/[0.025] pointer-events-none z-0" />

          {/* Luxury Gold/Bronze Border Frame */}
          <div 
            className="absolute inset-6 pointer-events-none z-10 border-[6px]"
            style={{ borderImage: `${outerBorderGrad} 1` }}
          />
          
          {/* Inner thin frame */}
          <div 
            className="absolute inset-9 pointer-events-none z-10 border border-opacity-30" 
            style={{ borderColor: 'rgba(250,216,141,0.2)' }}
          />

          {/* Ornate Corners */}
          <div className="absolute top-8 left-8 w-12 h-12 border-t-[3px] border-l-[3px] z-10" style={{ borderColor: '#fadc96' }} />
          <div className="absolute top-8 right-8 w-12 h-12 border-t-[3px] border-r-[3px] z-10" style={{ borderColor: '#fadc96' }} />
          <div className="absolute bottom-8 left-8 w-12 h-12 border-b-[3px] border-l-[3px] z-10" style={{ borderColor: '#fadc96' }} />
          <div className="absolute bottom-8 right-8 w-12 h-12 border-b-[3px] border-r-[3px] z-10" style={{ borderColor: '#fadc96' }} />

          {/* Front Content Container */}
          <div className="w-full h-full flex flex-col justify-between items-center relative z-20 pt-2">
            
            {/* 1. TOP HEADER SECTION */}
            <div className="w-full flex flex-col items-center">
              <h1 className="font-serif text-[18px] tracking-[0.18em] font-semibold text-[#fadc96] uppercase text-center leading-tight">
                श्री वर्धमान श्वेतांबर मूर्तिपूजक जैन संघ
              </h1>
              <p className="font-sans text-[11px] tracking-[0.3em] text-[#fffae8]/60 uppercase mt-1 text-center">
                उस्मानपुरा, अहमदाबाद
              </p>
              
              {/* National Emblem Inspired Divider */}
              <div className="flex items-center gap-3 w-48 mt-3 text-[#fadc96]/40">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#fadc96]/40" />
                <svg className="w-4 h-4 text-[#fadc96]/80" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 0 L12 7 L19 10 L12 13 L10 20 L8 13 L1 10 L8 7 Z" />
                </svg>
                <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#fadc96]/40" />
              </div>
            </div>

            {/* 2. HERO: LARGE REALISTIC MEDAL & CALLIGRAPHY */}
            <div className="flex flex-col items-center w-full mt-1.5">
              {/* Medal Container (200px Height) */}
              <div className="relative flex items-center justify-center h-[210px] w-[210px] mb-1">
                <div className="absolute inset-0 rounded-full bg-orange-600/[0.04] blur-3xl pointer-events-none" />
                <PvcMedalSvg className="h-[200px] w-[200px] drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]" />
              </div>

              {/* Embossed Gold Foil Title Calligraphy */}
              <h2 
                className="font-serif text-[52px] font-extrabold tracking-[0.06em] leading-none text-center select-none"
                style={{
                  background: titleGoldGrad,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: 'drop-shadow(1px 2px 2px rgba(0,0,0,0.85)) drop-shadow(0px 6px 12px rgba(0,0,0,0.5))',
                }}
              >
                परमवीर चक्र
              </h2>

              {/* Subtitle "शौर्यगाथा" (White + Saffron combination) */}
              <div className="flex items-center justify-center gap-3.5 mt-2 w-full">
                <div className="h-[1.5px] w-14 bg-gradient-to-r from-[#ff9933]/50 to-transparent" />
                <h3 
                  className="font-serif text-[30px] font-extrabold tracking-[0.25em] leading-none uppercase text-center"
                  style={{
                    background: "linear-gradient(to right, #ffffff 0%, #ffdfad 50%, #ff9933 100%)",
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    filter: 'drop-shadow(1px 2px 2px rgba(0,0,0,0.8))',
                  }}
                >
                  शौर्यगाथा
                </h3>
                <div className="h-[1.5px] w-14 bg-gradient-to-l from-[#138808]/50 to-transparent" />
              </div>

              {/* Dedication Tagline */}
              <p className="text-[11.5px] uppercase tracking-[0.26em] text-[#fffae8]/85 text-center font-semibold mt-3">
                भारत के सच्चे वीरों को समर्पित एक ऐतिहासिक राष्ट्रभक्ति अनुभव
              </p>
            </div>

            {/* 3. DETAILS SECTION (G20 style card layouts) */}
            <div className="w-full flex flex-col gap-3.5 px-4 my-1">
              
              {/* Grid 1: आशीर्वाद & शास्त्रज्ञ (Side-by-side cards) */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="rounded-xl border border-[#fadc96]/15 bg-[#070d18]/90 p-3.5 text-left shadow-lg relative">
                  <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#fadc96]/30 rounded-tl-md" />
                  <p className="text-[9.5px] uppercase tracking-[0.15em] text-[#fadc96] font-bold">आशीर्वाद (Blessings)</p>
                  <p className="text-[9px] font-sans text-white/40 mt-0.5">गच्छाधिपति परम पूज्य आचार्यदेव</p>
                  <p className="text-[13.5px] font-serif font-bold text-[#fffae8] mt-0.5 leading-tight truncate">
                    श्री नरदेवसागरसूरीश्वरजी महाराज
                  </p>
                </div>
                
                <div className="rounded-xl border border-[#fadc96]/15 bg-[#070d18]/90 p-3.5 text-left shadow-lg relative">
                  <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#fadc96]/30 rounded-tl-md" />
                  <p className="text-[9.5px] uppercase tracking-[0.15em] text-[#fadc96] font-bold">शास्त्रज्ञ (Presence)</p>
                  <p className="text-[9px] font-sans text-white/40 mt-0.5">पूज्य मुनि श्री</p>
                  <p className="text-[13.5px] font-serif font-bold text-[#fffae8] mt-0.5 leading-tight truncate">
                    अर्हमचंद्रसागरजी महाराज
                  </p>
                </div>
              </div>

              {/* Card 2: प्रेरणा (Full Width) */}
              <div className="rounded-xl border border-[#fadc96]/15 bg-[#070d18]/90 p-3.5 text-left shadow-lg relative">
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#fadc96]/30 rounded-tl-md" />
                <p className="text-[9.5px] uppercase tracking-[0.15em] text-[#fadc96] font-bold">प्रेरणा (Inspiration)</p>
                <p className="text-[9px] font-sans text-white/45 mt-0.5">
                  परम पूज्य आचार्यदेव श्री जिन-हेमचंद्रसागरसूरिजी महाराज के शिष्यरत्न
                </p>
                <div className="grid grid-cols-2 gap-3 mt-1.5 pt-1.5 border-t border-white/5">
                  <p className="text-[12.5px] font-serif font-bold text-white leading-tight">
                    प.पू. आचार्यदेव श्री सम्यकचंद्रसागरसूरिजी म.सा.
                  </p>
                  <p className="text-[12.5px] font-serif font-bold text-white leading-tight border-l border-white/10 pl-2">
                    प.पू. आचार्यदेव श्री तारकचंद्रसागरसूरिजी म.सा.
                  </p>
                </div>
              </div>

              {/* Grid 3: Speakers & Book Launch */}
              <div className="grid grid-cols-12 gap-3.5">
                {/* Speaker Card (Col 7) */}
                <div className="col-span-7 rounded-xl border border-[#fadc96]/15 bg-[#070d18]/90 p-3.5 text-left shadow-lg relative">
                  <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#fadc96]/30 rounded-tl-md" />
                  <p className="text-[9.5px] uppercase tracking-[0.15em] text-[#fadc96] font-bold">मुख्य वक्ता (Speakers)</p>
                  <div className="mt-1">
                    <p className="text-[13.5px] font-serif font-bold text-white leading-snug">श्री हर्षल पुष्कर्णा</p>
                    <p className="text-[9px] font-sans text-white/40">प्रख्यात लेखक, पत्रकार एवं वक्ता</p>
                  </div>
                  <div className="mt-1.5 pt-1.5 border-t border-white/5">
                    <p className="text-[13.5px] font-serif font-bold text-[#fffae8] leading-snug">प.पू. मुनि श्री श्रमणचंद्रसागरजी महाराज</p>
                    <p className="text-[9px] font-sans text-white/40">विश्व रिकॉर्ड धारक</p>
                  </div>
                </div>

                {/* Book Launch Card (Col 5) - Saffron/Bronze theme */}
                <div className="col-span-5 rounded-xl border border-[#7c521f]/35 bg-gradient-to-br from-[#180e05] to-[#080401] p-3.5 text-left shadow-lg flex flex-col justify-between relative">
                  <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#ff9933]/30 rounded-tl-md" />
                  <p className="text-[9px] uppercase tracking-[0.15em] text-[#ff9933] font-bold">भव्य विमोचन</p>
                  <div className="my-1.5">
                    <p className="text-[14px] font-serif font-extrabold text-[#fadc96] leading-tight">"आर्यावर्त का गौरव"</p>
                    <p className="text-[9px] font-sans text-white/45 mt-0.5 leading-snug">ऐतिहासिक साहित्यिक महाकृति</p>
                  </div>
                </div>
              </div>

              {/* Grid 4: Event details card */}
              <div className="rounded-xl border border-[#fadc96]/15 bg-[#070d18]/90 p-3.5 text-left shadow-lg grid grid-cols-3 gap-2 relative">
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#fadc96]/30 rounded-tl-md" />
                <div>
                  <p className="text-[8.5px] uppercase tracking-[0.15em] text-white/40">📅 दिनांक (Date)</p>
                  <p className="text-[13.5px] font-serif font-bold text-white mt-0.5">09 अगस्त 2026</p>
                  <p className="text-[9px] font-sans text-[#ff9933] font-semibold">रविवार / Sunday</p>
                </div>
                <div className="border-l border-white/10 pl-2">
                  <p className="text-[8.5px] uppercase tracking-[0.15em] text-white/40">🕘 समय (Time)</p>
                  <p className="text-[13.5px] font-serif font-bold text-white mt-0.5">प्रातः 9:00 बजे</p>
                  <p className="text-[9px] font-sans text-white/45">Reporting Time</p>
                </div>
                <div className="border-l border-white/10 pl-2">
                  <p className="text-[8.5px] uppercase tracking-[0.15em] text-white/40">📍 स्थान (Venue)</p>
                  <p className="text-[13.5px] font-serif font-bold text-[#fadc96] mt-0.5 truncate">दिनेश हॉल</p>
                  <p className="text-[9px] font-sans text-white/45 truncate">नवरंगपुरा, अहमदाबाद</p>
                </div>
              </div>

            </div>

            {/* 4. PREMIUM PARTICIPANT IDENTITY CARD */}
            <div 
              className="w-full rounded-2xl border border-[#7c521f]/50 bg-gradient-to-r from-[#110903] via-[#211508] to-[#110903] p-5 my-1 flex items-center justify-between relative shadow-2xl"
              style={{ boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}
            >
              {/* Inner frame lines */}
              <div className="absolute inset-0.5 rounded-[14px] border border-white/5 pointer-events-none" />
              
              {/* Left Column values */}
              <div className="flex-1 flex flex-col gap-3 text-left min-w-0 pr-4">
                <div>
                  <p className="text-[8.5px] uppercase tracking-[0.15em] text-white/40 font-bold">NAME</p>
                  <p className="text-[20px] font-serif font-bold text-white truncate mt-0.5">
                    {name || 'Guest Participant'}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[8.5px] uppercase tracking-[0.15em] text-white/40 font-bold">WHATSAPP</p>
                    <p className="text-[13.5px] font-sans font-medium text-white/80 mt-0.5">
                      {formattedMobile || 'XXXXXX----'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[8.5px] uppercase tracking-[0.15em] text-white/40 font-bold">CITY</p>
                    <p className="text-[13.5px] font-sans font-medium text-white/80 mt-0.5 truncate">
                      {city || 'Ahmedabad'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 border-t border-white/5 pt-2">
                  <div>
                    <p className="text-[8.5px] uppercase tracking-[0.15em] text-white/40 font-bold">ENTRY TYPE</p>
                    <p className="text-[12.5px] font-sans font-bold text-white mt-0.5">ONLINE PASS</p>
                  </div>
                  <div>
                    <p className="text-[8.5px] uppercase tracking-[0.15em] text-white/40 font-bold">STATUS</p>
                    <p className="text-[12.5px] font-sans font-bold text-green-400 mt-0.5">VERIFIED</p>
                  </div>
                </div>

                <div className="mt-1">
                  <p className="text-[8.5px] uppercase tracking-[0.15em] text-white/40 font-bold">PASS NUMBER</p>
                  <p className="text-[18px] font-mono font-bold text-[#fadc96] mt-0.5">
                    {passNumber || 'PVC-2026-XXXXXX'}
                  </p>
                </div>
              </div>

              {/* Right Column: QR Code & Hologram */}
              <div className="shrink-0 flex flex-col items-center gap-3">
                {/* Gold rounded luxury frame QR code */}
                <div className="h-28 w-28 bg-[#040810] border border-[#fadc96]/35 rounded-2xl p-2.5 flex items-center justify-center shadow-2xl relative overflow-hidden">
                  <GoldQrCode />
                </div>

                {/* Verified Badge Stamp */}
                <div className="flex items-center gap-1.5 border border-dashed border-[#138808]/40 bg-[#138808]/10 px-2.5 py-1 rounded-md">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#138808] animate-pulse" />
                  <span className="text-[8px] font-mono font-extrabold uppercase tracking-widest text-green-400">VERIFIED ENTRY</span>
                </div>
              </div>
            </div>

            {/* 5. BRANDING (Designed & Developed by VCS) */}
            <div className="w-full flex flex-col items-center border-t border-white/5 pt-3.5 mt-1 text-center">
              <p className="text-[10px] font-sans font-bold tracking-[0.18em] text-white/35 uppercase">
                Designed & Developed by <span className="text-[#fadc96]/70">Vardhman Creative Studio®</span>
              </p>
              <p className="text-[8px] font-sans tracking-[0.25em] text-white/20 uppercase mt-0.5">
                AI Creative Technology Partner <span className="mx-1.5">•</span> www.vardhmancreativestudio.com
              </p>
            </div>

          </div>
        </div>
      )}

      {/* ================================= BACK SIDE ================================= */}
      {showBack && (
        <div 
          id={`pass-back-${passNumber}`}
          className="relative text-white flex flex-col items-center justify-between p-11 overflow-hidden select-none shrink-0"
          style={{
            ...cardStyle,
            backgroundImage: "url('/assets/param-vir-chakra-hero.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundColor: '#02050a'
          }}
        >
          {/* Backdrop Overlays */}
          <div className="absolute inset-0 bg-[#02050a]/96 pointer-events-none z-0" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(50,25,80,0.12)_0%,transparent_75%)] pointer-events-none z-0" />
          
          <FlagOverlay />
          
          {/* Watermarks */}
          <AshokaChakraWatermark className="absolute right-[-80px] top-[20%] w-[380px] h-[380px] text-white/[0.025] pointer-events-none z-0" />
          <AshokaChakraWatermark className="absolute left-[-100px] bottom-[20%] w-[420px] h-[420px] text-white/[0.025] pointer-events-none z-0" />

          {/* Border Frame */}
          <div 
            className="absolute inset-6 pointer-events-none z-10 border-[6px]"
            style={{ borderImage: `${outerBorderGrad} 1` }}
          />
          
          {/* Inner thin frame */}
          <div 
            className="absolute inset-9 pointer-events-none z-10 border border-opacity-30" 
            style={{ borderColor: 'rgba(250,216,141,0.2)' }}
          />

          {/* Corners */}
          <div className="absolute top-8 left-8 w-12 h-12 border-t-[3px] border-l-[3px] z-10" style={{ borderColor: '#fadc96' }} />
          <div className="absolute top-8 right-8 w-12 h-12 border-t-[3px] border-r-[3px] z-10" style={{ borderColor: '#fadc96' }} />
          <div className="absolute bottom-8 left-8 w-12 h-12 border-b-[3px] border-l-[3px] z-10" style={{ borderColor: '#fadc96' }} />
          <div className="absolute bottom-8 right-8 w-12 h-12 border-b-[3px] border-r-[3px] z-10" style={{ borderColor: '#fadc96' }} />

          {/* Back Content Container */}
          <div className="w-full h-full flex flex-col justify-between items-center relative z-20 pt-4">
            
            {/* Header */}
            <div className="text-center flex flex-col items-center">
              <h2 
                className="font-serif text-[38px] font-bold tracking-[0.1em] text-[#fadc96]"
                style={{
                  background: goldTextGrad,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: 'drop-shadow(1px 2px 2px rgba(0,0,0,0.8))',
                }}
              >
                आवश्यक निर्देश
              </h2>
              <p className="text-[12px] uppercase tracking-[0.25em] text-white/40 mt-0.5">Important Guidelines</p>
              <div className="w-40 h-[1px] bg-gradient-to-r from-transparent via-[#fadc96]/30 to-transparent mt-3" />
            </div>

            {/* Guidelines list with bronze circles */}
            <div className="w-full flex-1 flex flex-col justify-center gap-5 px-6 my-4">
              {[
                "प्रवेश एवं बैठने की व्यवस्था \"प्रथम आओ, प्रथम स्थान पाओ\" (First Come, First Seat) के आधार पर होगी।",
                "प्रातः 9:00 बजे के पश्चात किसी भी परिस्थिति में प्रवेश नहीं दिया जाएगा।",
                "यह पास केवल एक व्यक्ति के लिए मान्य है तथा हस्तांतरणीय (Non-Transferable) नहीं है।",
                "कृपया अपना मोबाइल फोन साइलेंट अथवा स्विच ऑफ रखें।",
                "कार्यक्रम के दौरान अनावश्यक आवागमन न करें।",
                "आयोजकों एवं स्वयंसेवकों के निर्देशों का पालन करना अनिवार्य है।"
              ].map((instruction, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fadc96]/10 border border-[#fadc96]/35 text-[#fadc96] text-[16px] font-bold font-mono mt-0.5 shadow-lg">
                    {idx + 1}
                  </span>
                  <p className="text-[18px] font-serif font-semibold text-white/95 leading-normal text-left">
                    {instruction}
                  </p>
                </div>
              ))}
            </div>

            {/* Bottom Souvenir Note */}
            <div 
              className="w-full rounded-2xl border border-[#7c521f]/35 bg-gradient-to-br from-[#140b03] to-[#070401] p-5 text-center my-2 shadow-lg relative"
            >
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#fadc96]/30 rounded-tl-md" />
              <p className="font-serif text-[18px] font-bold text-[#fadc96] tracking-[0.08em]">
                * स्मरणीय अनुरोध *
              </p>
              <p className="text-[15px] font-serif text-[#fffae8]/90 leading-relaxed mt-2">
                इस ऐतिहासिक क्षण की मधुर स्मृति के रूप में इस डिजिटल पास को अपने पास सुरक्षित रखें।
              </p>
            </div>

            {/* Back Branding Footer */}
            <div className="w-full flex flex-col items-center border-t border-white/5 pt-3.5 mt-1 text-center">
              <p className="text-[10px] font-sans font-bold tracking-[0.18em] text-white/35 uppercase">
                Designed & Developed by <span className="text-[#fadc96]/70">Vardhman Creative Studio®</span>
              </p>
              <p className="text-[8px] font-sans tracking-[0.25em] text-white/20 uppercase mt-0.5">
                www.vardhmancreativestudio.com
              </p>
            </div>

          </div>
        </div>
      )}

    </div>
  );
});

PassCard.displayName = 'PassCard';

export default PassCard;
