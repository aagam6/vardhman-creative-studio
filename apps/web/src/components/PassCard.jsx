import React, { memo } from 'react';

const PassCard = memo(({ 
  name = "", 
  mobile = "", 
  city = "", 
  passNumber = "", 
  scale = 1, 
  activeSide = "both", // "both", "front", "back"
  previewMode = false // When true, enables premium micro-animations
}) => {
  // Format mobile to show only last 4 digits
  const formatMobile = (mob) => {
    if (!mob) return '';
    const clean = mob.toString().replace(/\D/g, '');
    if (clean.length <= 4) return clean;
    return `XXXXXX${clean.slice(-4)}`;
  };

  const formattedMobile = formatMobile(mobile);

  // Landscape card sizing (2000 x 1200 px / Aspect Ratio 5:3)
  const cardStyle = {
    width: '2000px',
    height: '1200px',
    transform: scale !== 1 ? `scale(${scale})` : undefined,
    transformOrigin: 'top left',
  };

  // Luxury Gradients and Styles matching the website theme (Midnight Navy, Slate, Gold Foil)
  const outerBorderGrad = "linear-gradient(135deg, #a37029 0%, #fad88d 25%, #4e320d 50%, #fadc96 75%, #2a1602 100%)";
  const goldTextGrad = "linear-gradient(to bottom, #ffffff 0%, #ffeab3 25%, #e6be75 60%, #c59b4c 85%, #835b12 100%)";
  const titleGoldGrad = "linear-gradient(to bottom, #ffffff 0%, #ffeaa7 15%, #d4af37 50%, #aa7c11 85%, #6a4b02 100%)";

  // Waving Tricolor Gradient Beams (representing national pride elegantly in landscape)
  const TricolorBeams = () => (
    <div className="absolute inset-0 pointer-events-none z-0 mix-blend-color-dodge opacity-[0.09]">
      <svg width="100%" height="100%" viewBox="0 0 2000 1200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M-200 0 Q 500 450, 2200 100 L 2200 450 Q 500 900, -200 450 Z" fill="url(#saffronBeam)" />
        <path d="M-200 350 Q 500 800, 2200 450 L 2200 800 Q 500 1250, -200 800 Z" fill="url(#whiteBeam)" />
        <path d="M-200 700 Q 500 1150, 2200 800 L 2200 1250 Q 500 1700, -200 1250 Z" fill="url(#greenBeam)" />
        <defs>
          <linearGradient id="saffronBeam" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FF9933" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#FF9933" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="whiteBeam" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="greenBeam" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#138808" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#138808" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );

  // Large Ashoka Chakra Watermark behind the title
  const GiantAshokaChakra = () => (
    <svg className="absolute w-[850px] h-[850px] text-[#fad88d]/[0.025] pointer-events-none z-0" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="90" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
      <circle cx="100" cy="100" r="82" stroke="currentColor" strokeWidth="0.8" />
      <circle cx="100" cy="100" r="16" stroke="currentColor" strokeWidth="1.5" />
      {Array.from({ length: 24 }).map((_, i) => (
        <line 
          key={i} 
          x1="100" 
          y1="100" 
          x2={100 + 82 * Math.cos((i * 15 * Math.PI) / 180)} 
          y2={100 + 82 * Math.sin((i * 15 * Math.PI) / 180)} 
          stroke="currentColor" 
          strokeWidth="0.6" 
        />
      ))}
    </svg>
  );

  const showFront = activeSide === "both" || activeSide === "front";
  const showBack = activeSide === "both" || activeSide === "back";

  return (
    <div className={`flex flex-col gap-12 items-center justify-center ${scale !== 1 ? 'overflow-visible' : ''}`}>
      
      {/* Inject custom micro-animations tag if in preview mode */}
      {previewMode && (
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes titleShine {
            0% { background-position: -200% center; }
            100% { background-position: 200% center; }
          }
          .animate-title-shine {
            background: linear-gradient(90deg, #754f15 0%, #fad88d 25%, #ffffff 50%, #fad88d 75%, #754f15 100%);
            background-size: 200% auto;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: titleShine 6s linear infinite;
          }
          @keyframes medalGlow {
            0%, 100% { filter: drop-shadow(0 4px 12px rgba(0,0,0,0.6)) drop-shadow(0 0 15px rgba(250,216,141,0.2)); transform: scale(1); }
            50% { filter: drop-shadow(0 8px 25px rgba(0,0,0,0.75)) drop-shadow(0 0 30px rgba(250,216,141,0.5)); transform: scale(1.02); }
          }
          .animate-medal-glow {
            animation: medalGlow 4s ease-in-out infinite;
          }
          @keyframes beacon {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 1; }
          }
          .animate-beacon {
            animation: beacon 2.5s ease-in-out infinite;
          }
        `}} />
      )}

      {/* ================================= FRONT SIDE ================================= */}
      {showFront && (
        <div 
          id={`pass-front-${passNumber}`}
          className="pvc-pass-card-bg relative text-white flex flex-col items-center justify-between p-12 overflow-hidden select-none shrink-0"
          style={{
            ...cardStyle,
            backgroundColor: '#040d1c',
            backgroundImage: 'radial-gradient(circle at center, #0c2547 0%, #040d1c 100%)'
          }}
        >
          {/* Subtle noise and sandstone textures representing National War Memorial */}
          <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_center,#fff_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none z-0" />
          <div className="absolute inset-0 bg-gradient-to-tr from-[#138808]/4 via-transparent to-[#ff9933]/4 pointer-events-none z-0" />
          
          <TricolorBeams />
          
          {/* Giant Ashoka Chakra Watermark behind the title */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 opacity-[0.85]">
            <GiantAshokaChakra />
          </div>

          {/* Luxury Gold/Bronze Border Frame (Government Invitation Style) */}
          <div 
            className="absolute inset-7 pointer-events-none z-10 border-[6px]"
            style={{ borderImage: `${outerBorderGrad} 1` }}
          />
          
          {/* Inner thin frame */}
          <div 
            className="absolute inset-10 pointer-events-none z-10 border border-opacity-25" 
            style={{ borderColor: 'rgba(250,216,141,0.25)' }}
          />

          {/* Corner Ornaments */}
          <div className="absolute top-9 left-9 w-12 h-12 border-t-2 border-l-2 z-10" style={{ borderColor: '#fad88d' }} />
          <div className="absolute top-9 right-9 w-12 h-12 border-t-2 border-r-2 z-10" style={{ borderColor: '#fad88d' }} />
          <div className="absolute bottom-9 left-9 w-12 h-12 border-b-2 border-l-2 z-10" style={{ borderColor: '#fad88d' }} />
          <div className="absolute bottom-9 right-9 w-12 h-12 border-b-2 border-r-2 z-10" style={{ borderColor: '#fad88d' }} />

          {/* Front Content Container */}
          <div className="w-full h-full flex flex-col justify-between items-center relative z-20">
            
            {/* 1. TOP HEADER SECTION */}
            <div className="w-full flex flex-col items-center">
              <h1 className="font-serif text-[32px] tracking-[0.24em] font-bold text-[#fad88d] uppercase text-center leading-tight">
                श्री वर्धमान श्वेतांबर मूर्तिपूजक जैन संघ
              </h1>
              <p className="font-sans text-[16px] tracking-[0.4em] text-white/55 uppercase mt-1 text-center">
                उस्मानपुरा, अहमदाबाद
              </p>
              
              {/* National Theme Star Divider */}
              <div className="flex items-center gap-3 w-72 mt-3.5 text-[#fad88d]/30">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#fad88d]/35" />
                <svg className="w-4.5 h-4.5 text-[#fad88d]/80" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 0 L12 7 L19 10 L12 13 L10 20 L8 13 L1 10 L8 7 Z" />
                </svg>
                <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#fad88d]/35" />
              </div>
            </div>

            {/* 2. MIDDLE GRID: Left (Medal & Title), Center (Guru Panel), Right (Speakers & Event Details) */}
            <div className="w-full grid grid-cols-12 gap-6 items-center my-4 px-2">
              
              {/* LEFT COLUMN: HERO (PVC Medal & Calligraphy) */}
              <div className="col-span-4 flex flex-col items-center border-r border-white/10 pr-4 h-[490px] justify-center text-center">
                {/* 260px Massive Realistic PNG Medal centerpiece */}
                <div className={`relative flex items-center justify-center h-[270px] w-[270px] mb-3.5 ${previewMode ? 'animate-medal-glow' : 'drop-shadow-[0_12px_24px_rgba(0,0,0,0.65)]'}`}>
                  <div className="absolute inset-0 rounded-full bg-orange-600/[0.03] blur-3xl pointer-events-none" />
                  <img src="/assets/PVC.png" className="h-[260px] w-[260px] object-contain" alt="Param Vir Chakra Medal" />
                </div>

                {/* Embossed Gold Foil Hindi Calligraphy */}
                <h2 
                  className={`font-serif text-[54px] font-extrabold tracking-[0.06em] leading-none text-center select-none ${previewMode ? 'animate-title-shine' : ''}`}
                  style={!previewMode ? {
                    background: titleGoldGrad,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    filter: 'drop-shadow(1px 2px 2px rgba(0,0,0,0.85)) drop-shadow(0px 5px 10px rgba(0,0,0,0.5))',
                  } : undefined}
                >
                  परमवीर चक्र
                </h2>

                {/* Subtitle "शौर्यगाथा" (Saffron Gradient) */}
                <div className="flex items-center justify-center gap-3.5 mt-2.5 w-full">
                  <div className="h-[1.5px] w-12 bg-gradient-to-r from-[#ff9933]/50 to-transparent" />
                  <h3 
                    className="font-serif text-[32px] font-extrabold tracking-[0.25em] leading-none uppercase text-center"
                    style={{
                      background: "linear-gradient(to right, #ffffff 20%, #ffe0b3 50%, #ff9933 100%)",
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      filter: 'drop-shadow(1px 2px 2px rgba(0,0,0,0.8))',
                    }}
                  >
                    शौर्यगाथा
                  </h3>
                  <div className="h-[1.5px] w-12 bg-gradient-to-l from-[#138808]/50 to-transparent" />
                </div>

                <p className="text-[11.5px] uppercase tracking-[0.18em] text-white/50 text-center font-bold mt-3 leading-snug">
                  भारत के वीरों को समर्पित राष्ट्रभक्ति अनुभव
                </p>
              </div>

              {/* CENTER COLUMN: GURUJI SECTION (Translucent Glassmorphism Card matching site) */}
              <div className="col-span-4 flex flex-col gap-3 border-r border-white/10 px-4 h-[490px] justify-between text-left">
                <div className="rounded-2xl border border-white/10 bg-[#0e1c33]/70 backdrop-blur-md p-6 flex flex-col justify-between h-full relative shadow-xl">
                  <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#fad88d]/30 rounded-tl-md" />
                  
                  {/* आशीर्वाद */}
                  <div>
                    <p className="text-[13px] uppercase tracking-[0.15em] text-[#fad88d] font-bold">आशीर्वाद (Blessings)</p>
                    <p className="text-[12px] font-sans text-white/40 mt-0.5">गच्छाधिपति परम पूज्य आचार्यदेव</p>
                    <p className="text-[22px] font-serif font-bold text-white mt-0.5 leading-snug">
                      श्री नरदेवसागरसूरीश्वरजी महाराज
                    </p>
                  </div>
                  
                  <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent my-1" />

                  {/* प्रेरणा */}
                  <div>
                    <p className="text-[13px] uppercase tracking-[0.15em] text-[#fad88d] font-bold">प्रेरणा (Inspiration)</p>
                    <p className="text-[12px] font-sans text-white/40 mt-0.5">
                      आचार्यदेव श्री जिन-हेमचंद्रसागरसूरिजी महाराज के शिष्यरत्न
                    </p>
                    <p className="text-[19px] font-serif font-bold text-white mt-1 leading-snug">
                      आचार्यदेव श्री सम्यकचंद्रसागरसूरिजी महाराज
                    </p>
                    <p className="text-[12.5px] font-sans text-white/30 my-0.5 text-center font-bold">तथा</p>
                    <p className="text-[19px] font-serif font-bold text-white leading-snug">
                      आचार्यदेव श्री तारकचंद्रसागरसूरिजी महाराज
                    </p>
                  </div>

                  <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent my-1" />

                  {/* शास्त्रज्ञ */}
                  <div>
                    <p className="text-[13px] uppercase tracking-[0.15em] text-[#fad88d] font-bold">शास्त्रज्ञ (Special Presence)</p>
                    <p className="text-[12px] font-sans text-white/40 mt-0.5">पूज्य मुनि श्री</p>
                    <p className="text-[22px] font-serif font-bold text-white mt-0.5 leading-snug">
                      अर्हमचंद्रसागरजी महाराज
                    </p>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: SPEAKERS, BOOK LAUNCH & EVENT DETAILS */}
              <div className="col-span-4 flex flex-col gap-3 pl-4 h-[490px] justify-between text-left">
                
                {/* Speakers Card */}
                <div className="rounded-2xl border border-white/10 bg-[#0e1c33]/70 backdrop-blur-md p-5 relative shadow-xl">
                  <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#fad88d]/30 rounded-tl-md" />
                  <p className="text-[13px] uppercase tracking-[0.15em] text-[#fad88d] font-bold mb-2">मुख्य वक्ता (Speakers)</p>
                  <div className="flex flex-col gap-3">
                    <div>
                      <p className="text-[22px] font-serif font-bold text-white">श्री हर्षल पुष्कर्णा</p>
                      <p className="text-[13px] font-sans text-white/40 leading-snug">प्रख्यात लेखक, पत्रकार, वक्ता एवं विश्व रिकॉर्ड धारक</p>
                    </div>
                    <div className="border-t border-white/10 pt-2">
                      <p className="text-[20px] font-serif font-bold text-white">पूज्य मुनि श्री श्रमणचंद्रसागरजी महाराज</p>
                      <p className="text-[13px] font-sans text-white/40">परम देशभक्त राष्ट्र-संत</p>
                    </div>
                  </div>
                </div>

                {/* Book Launch Badge & Details Card */}
                <div className="rounded-2xl border border-[#7c521f]/30 bg-gradient-to-br from-[#1c1208] to-[#0c0803] p-5 flex flex-col gap-1 relative shadow-xl">
                  <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#ff9933]/30 rounded-tl-md" />
                  <p className="text-[12px] uppercase tracking-[0.15em] text-[#ff9933] font-bold">भव्य विमोचन (Book Launch)</p>
                  <p className="text-[24px] font-serif font-extrabold text-[#fad88d] leading-tight">"आर्यावर्त का गौरव"</p>
                  <p className="text-[13px] font-sans text-white/50">ऐतिहासिक साहित्यिक महाकृति का भव्य विमोचन</p>
                </div>

                {/* Event Details Card */}
                <div className="rounded-2xl border border-white/10 bg-[#0e1c33]/70 backdrop-blur-md p-4 grid grid-cols-3 gap-2 relative shadow-xl">
                  <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#fad88d]/30 rounded-tl-md" />
                  <div>
                    <p className="text-[12px] uppercase tracking-[0.12em] text-white/40">📅 दिनांक</p>
                    <p className="text-[16px] font-serif font-bold text-white mt-0.5">09 अगस्त 2026</p>
                    <p className="text-[11px] font-sans text-[#ff9933] font-bold">रविवार</p>
                  </div>
                  <div className="border-l border-white/10 pl-2">
                    <p className="text-[12px] uppercase tracking-[0.12em] text-white/40">🕘 समय</p>
                    <p className="text-[16px] font-serif font-bold text-white mt-0.5">प्रातः 9:00 बजे</p>
                    <p className="text-[11.5px] font-sans text-white/45">Reporting</p>
                  </div>
                  <div className="border-l border-white/10 pl-2">
                    <p className="text-[12px] uppercase tracking-[0.12em] text-white/40">📍 स्थान</p>
                    <p className="text-[16px] font-serif font-bold text-[#fad88d] mt-0.5 truncate">दिनेश हॉल</p>
                    <p className="text-[11.5px] font-sans text-white/45 truncate">अमदावाद</p>
                  </div>
                </div>

              </div>

            </div>

            {/* 3. BOTTOM PANEL: Grounded Identity Strip (No QR Code) */}
            <div 
              className="w-full rounded-2xl border border-[#7c521f]/45 bg-[#061229] p-6 flex items-center justify-between relative shadow-2xl"
              style={{ 
                boxShadow: '0 15px 35px rgba(0,0,0,0.5)',
                backgroundImage: 'linear-gradient(to right, #050f24 0%, #0d1e3d 50%, #050f24 100%)'
              }}
            >
              {/* Inner frame lines */}
              <div className="absolute inset-0.5 rounded-[14px] border border-white/5 pointer-events-none" />
              
              {/* Left Column: Organizer Details */}
              <div className="text-left border-r border-[#7c521f]/35 pr-8 shrink-0">
                <p className="text-[12px] uppercase tracking-[0.15em] text-[#fad88d] font-bold">आयोजक (Organiser)</p>
                <p className="text-[21px] font-serif font-bold text-white mt-0.5 max-w-[320px]">
                  श्री वर्धमान श्वेतांबर मूर्तिपूजक जैन संघ
                </p>
                <p className="text-[14px] font-sans text-white/45">उस्मानपुरा, अहमदाबाद</p>
              </div>

              {/* Center Column: Participant Details Grid */}
              <div className="flex-1 grid grid-cols-4 gap-6 px-8 text-left">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.12em] text-white/40 font-bold">PARTICIPANT NAME</p>
                  <p className="text-[26px] font-serif font-bold text-white truncate mt-0.5">
                    {name || 'Guest Participant'}
                  </p>
                </div>
                
                <div>
                  <p className="text-[11px] uppercase tracking-[0.12em] text-white/40 font-bold">WHATSAPP NUMBER</p>
                  <p className="text-[18px] font-sans font-semibold text-white/90 mt-0.5">
                    {formattedMobile || 'XXXXXX----'}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] uppercase tracking-[0.12em] text-white/40 font-bold">CITY</p>
                  <p className="text-[18px] font-sans font-semibold text-white/90 mt-0.5 truncate">
                    {city || 'Ahmedabad'}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] uppercase tracking-[0.12em] text-[#ff9933] font-bold">ENTRY TYPE</p>
                  <p className="text-[18px] font-sans font-extrabold text-white mt-0.5">ONLINE ENTRY PASS</p>
                </div>
              </div>

              {/* Right Column: Unique Pass Number Badge (No QR Code, clean layout) */}
              <div className="shrink-0 flex flex-col gap-1 text-right border-l border-[#7c521f]/35 pl-8">
                <p className="text-[10px] uppercase tracking-[0.12em] text-white/40 font-bold">UNIQUE DIGITAL PASS</p>
                <p className="text-[22px] font-mono font-bold text-[#fad88d]">
                  {passNumber || 'PVC-2026-XXXXXX'}
                </p>
                {/* Verified Badge Stamp */}
                <div className="flex items-center gap-1.5 border border-[#138808]/40 bg-[#138808]/10 px-2.5 py-0.5 rounded-md self-end mt-0.5">
                  <div className={`h-1.5 w-1.5 rounded-full bg-green-500 ${previewMode ? 'animate-beacon' : ''}`} />
                  <span className="text-[8px] font-mono font-extrabold uppercase tracking-widest text-green-400">VERIFIED VIP</span>
                </div>
              </div>
            </div>

            {/* 4. BRANDING FOOTER (Designed & Developed by VCS) */}
            <div className="w-full flex flex-col items-center border-t border-white/5 pt-3 mt-1 text-center">
              <p className="text-[12px] font-sans font-bold tracking-[0.18em] text-white/30 uppercase">
                Designed & Developed by <span className="text-[#fad88d]/60">Vardhman Creative Studio®</span>
              </p>
              <p className="text-[10px] font-sans tracking-[0.22em] text-white/20 uppercase mt-0.5">
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
          className="pvc-pass-card-bg relative text-white flex flex-col items-center justify-between p-12 overflow-hidden select-none shrink-0"
          style={{
            ...cardStyle,
            backgroundColor: '#040d1c',
            backgroundImage: 'radial-gradient(circle at center, #0c2547 0%, #040d1c 100%)'
          }}
        >
          {/* Backdrop Overlays */}
          <div className="absolute inset-0 bg-[#030814]/90 pointer-events-none z-0" />
          <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_center,#fff_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none z-0" />
          
          <TricolorBeams />
          
          {/* Watermarks */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 opacity-[0.85]">
            <GiantAshokaChakra />
          </div>

          {/* Border Frame */}
          <div 
            className="absolute inset-7 pointer-events-none z-10 border-[6px]"
            style={{ borderImage: `${outerBorderGrad} 1` }}
          />
          
          {/* Inner thin frame */}
          <div 
            className="absolute inset-10 pointer-events-none z-10 border border-opacity-20" 
            style={{ borderColor: 'rgba(250,216,141,0.25)' }}
          />

          {/* Corners */}
          <div className="absolute top-9 left-9 w-12 h-12 border-t-2 border-l-2 z-10" style={{ borderColor: '#fad88d' }} />
          <div className="absolute top-9 right-9 w-12 h-12 border-t-2 border-r-2 z-10" style={{ borderColor: '#fad88d' }} />
          <div className="absolute bottom-9 left-9 w-12 h-12 border-b-2 border-l-2 z-10" style={{ borderColor: '#fad88d' }} />
          <div className="absolute bottom-9 right-9 w-12 h-12 border-b-2 border-r-2 z-10" style={{ borderColor: '#fad88d' }} />

          {/* Back Content Container */}
          <div className="w-full h-full flex flex-col justify-between items-center relative z-20">
            
            {/* Header */}
            <div className="text-center flex flex-col items-center">
              <h2 
                className="font-serif text-[38px] font-bold tracking-[0.12em] text-[#fad88d]"
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
              <p className="text-[12px] uppercase tracking-[0.22em] text-white/40 mt-1">Important Guidelines</p>
              <div className="w-48 h-[1px] bg-gradient-to-r from-transparent via-[#fad88d]/30 to-transparent mt-3" />
            </div>

            {/* Translucent Guidelines list inside card elements (2 columns) */}
            <div className="w-full grid grid-cols-2 gap-x-6 gap-y-4 px-8 my-4">
              {[
                { hi: "प्रवेश एवं बैठने की व्यवस्था \"प्रथम आओ, प्रथम स्थान पाओ\" (First Come, First Seat) के आधार पर होगी।", en: "Seating is strictly first-come, first-served. Kindly arrive early." },
                { hi: "प्रातः 9:00 बजे के पश्चात किसी भी परिस्थिति में प्रवेश नहीं दिया जाएगा।", en: "No entry will be permitted after 09:00 AM under any circumstances." },
                { hi: "यह पास केवल एक व्यक्ति के लिए मान्य है तथा हस्तांतरणीय (Non-Transferable) नहीं है।", en: "This pass is valid for one person and is non-transferable." },
                { hi: "कृपया अपना मोबाइल फोन साइलेंट अथवा स्विच ऑफ रखें।", en: "Kindly keep your mobile device in silent or switched off mode." },
                { hi: "कार्यक्रम के दौरान अनावश्यक आवागमन न करें।", en: "Avoid moving inside the auditorium during the program." },
                { hi: "आयोजकों एवं स्वयंसेवकों के निर्देशों का पालन करना अनिवार्य है।", en: "Strict compliance with volunteer team instructions is mandatory." }
              ].map((item, idx) => (
                <div 
                  key={idx} 
                  className="flex items-start gap-4 rounded-xl border border-white/10 bg-[#0e1c33]/70 backdrop-blur-md p-4 shadow-md relative"
                >
                  <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-[#fad88d]/20 rounded-tl-md" />
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fad88d]/10 border border-[#fad88d]/30 text-[#fad88d] text-[15px] font-bold font-mono mt-0.5 shadow-lg">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="text-[19px] font-serif font-semibold text-white/95 leading-snug text-left">
                      {item.hi}
                    </p>
                    <p className="text-[12px] font-sans text-white/40 text-left mt-1 tracking-wide">
                      {item.en}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Souvenir Note */}
            <div 
              className="w-full max-w-[1700px] rounded-xl border border-[#7c521f]/35 bg-gradient-to-br from-[#1c1208] to-[#0c0803] p-5 text-center my-1 shadow-lg relative"
            >
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#fad88d]/20 rounded-tl-md" />
              <p className="font-serif text-[20px] font-bold text-[#fad88d] tracking-[0.08em]">
                * स्मरणीय अनुरोध *
              </p>
              <p className="text-[17px] font-serif text-white/80 leading-relaxed mt-2">
                इस ऐतिहासिक क्षण की मधुर स्मृति के रूप में इस डिजिटल पास को अपने पास सुरक्षित रखें।
              </p>
            </div>

            {/* Back Branding Footer */}
            <div className="w-full flex flex-col items-center border-t border-white/5 pt-3 mt-1 text-center">
              <p className="text-[10px] font-sans font-bold tracking-[0.18em] text-white/30 uppercase">
                Designed & Developed by <span className="text-[#fad88d]/60">Vardhman Creative Studio®</span>
              </p>
              <p className="text-[8.5px] font-sans tracking-[0.22em] text-white/20 uppercase mt-0.5">
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
