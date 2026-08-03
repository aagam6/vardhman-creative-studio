import React, { memo } from 'react';
import PvcMedalSvg from './PvcMedalSvg.jsx';

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

  // Landscape card sizing (2480x1300 px)
  const cardStyle = {
    width: '2480px',
    height: '1300px',
    transform: scale !== 1 ? `scale(${scale})` : undefined,
    transformOrigin: 'top left',
  };

  // Luxury Gradients and Styles
  const outerBorderGrad = "linear-gradient(135deg, #8a5c1e 0%, #fadc96 25%, #4e320d 50%, #fad88d 75%, #2a1602 100%)";
  const goldTextGrad = "linear-gradient(to bottom, #ffffff 0%, #ffeab3 20%, #e6be75 55%, #c59b4c 85%, #835b12 100%)";
  const titleGoldGrad = "linear-gradient(to bottom, #ffffff 0%, #ffeaa7 15%, #d4af37 50%, #aa7c11 85%, #6a4b02 100%)";

  // Waving Tricolor Gradient Beams (representing national pride elegantly in landscape)
  const TricolorBeams = () => (
    <div className="absolute inset-0 pointer-events-none z-0 mix-blend-color-dodge opacity-[0.08]">
      <svg width="100%" height="100%" viewBox="0 0 2480 1300" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M-200 0 Q 600 500, 2680 100 L 2680 500 Q 600 1000, -200 500 Z" fill="url(#saffronBeam)" />
        <path d="M-200 400 Q 600 900, 2680 500 L 2680 900 Q 600 1400, -200 900 Z" fill="url(#whiteBeam)" />
        <path d="M-200 800 Q 600 1300, 2680 900 L 2680 1400 Q 600 1900, -200 1400 Z" fill="url(#greenBeam)" />
        <defs>
          <linearGradient id="saffronBeam" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FF9933" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FF9933" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="whiteBeam" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="greenBeam" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#138808" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#138808" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );

  // Large Ashoka Chakra Watermark behind the title
  const GiantAshokaChakra = () => (
    <svg className="absolute w-[950px] h-[950px] text-white/[0.015] pointer-events-none z-0" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
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

  // Gold themed QR Code SVG
  const GoldQrCode = () => (
    <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer borders and positioning boxes */}
      <path d="M5 5h35v35H5V5zm8 8v19h19V13H13zm64-8h18v18h-8V13H77V5zm0 18h18v18h-8V26H77v-8zM5 60h35v35H5V60zm8 8v19h19V68H13z" fill="#fadc96" />
      <path d="M19 19h7v7h-7v-7zm51-14h7v7h-7V5zm0 18h7v7h-7v-7zM19 74h7v7h-7v-7z" fill="#fadc96" />
      {/* QR Code matrix pattern */}
      <path d="M47 5h7v14h-7V5zm14 0h7v7h-7V5zm14 0h7v7h-7V5zm-28 14h7v7h-7v-7zm14 0h7v7h-7v-7zm14 0h7v7h-7v-7zm-28 14h7v7h-7v-7zm14 0h7v7h-7v-7zm14 0h7v7h-7v-7z" fill="#fadc96" fillOpacity="0.8" />
      <path d="M5 47h14v7H5v-7zm21 0h14v7H26v-7zm21 0h14v7H47v-7zm21 0h14v7H68v-7zm21 0h11v7H89v-7z" fill="#fadc96" fillOpacity="0.8" />
      <path d="M47 60h7v14h-7V60zm14 0h7v7h-7v-7zm14 0h7v7h-7v-7zm-28 14h7v7h-7v-7zm14 0h7v7h-7v-7zm14 0h7v7h-7v-7zm-28 14h7v7h-7v-7zm14 0h7v7h-7v-7zm14 0h7v7h-7v-7z" fill="#fadc96" fillOpacity="0.8" />
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
            0%, 100% { filter: drop-shadow(0 4px 8px rgba(0,0,0,0.6)) drop-shadow(0 0 10px rgba(250,216,141,0.15)); transform: scale(1); }
            50% { filter: drop-shadow(0 8px 20px rgba(0,0,0,0.7)) drop-shadow(0 0 25px rgba(250,216,141,0.45)); transform: scale(1.015); }
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
          className="relative text-white flex flex-col items-center justify-between p-14 overflow-hidden select-none shrink-0"
          style={{
            ...cardStyle,
            backgroundImage: "url('/assets/param-vir-chakra-hero.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundColor: '#02050a'
          }}
        >
          {/* Midnight Navy & Saffron/Green light beams blend overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#02050a]/97 via-[#030814]/94 to-[#02050a]/97 pointer-events-none z-0" />
          
          {/* Subtle National War Memorial inspired stone textures overlay */}
          <div className="absolute inset-0 opacity-[0.012] bg-[radial-gradient(circle_at_center,#fff_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none z-0" />
          <div className="absolute inset-0 bg-gradient-to-tr from-[#138808]/5 via-transparent to-[#ff9933]/5 pointer-events-none z-0" />
          
          <TricolorBeams />
          
          {/* Giant Ashoka Chakra Watermark behind the title */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 opacity-80">
            <GiantAshokaChakra />
          </div>

          {/* Luxury Gold/Bronze Border Frame */}
          <div 
            className="absolute inset-8 pointer-events-none z-10 border-[8px]"
            style={{ borderImage: `${outerBorderGrad} 1` }}
          />
          
          {/* Inner thin frame */}
          <div 
            className="absolute inset-12 pointer-events-none z-10 border border-opacity-25" 
            style={{ borderColor: 'rgba(250,216,141,0.2)' }}
          />

          {/* Ornate Corner Corners */}
          <div className="absolute top-11 left-11 w-16 h-16 border-t-[3px] border-l-[3px] z-10" style={{ borderColor: '#fadc96' }} />
          <div className="absolute top-11 right-11 w-16 h-16 border-t-[3px] border-r-[3px] z-10" style={{ borderColor: '#fadc96' }} />
          <div className="absolute bottom-11 left-11 w-16 h-16 border-b-[3px] border-l-[3px] z-10" style={{ borderColor: '#fadc96' }} />
          <div className="absolute bottom-11 right-11 w-16 h-16 border-b-[3px] border-r-[3px] z-10" style={{ borderColor: '#fadc96' }} />

          {/* Front Content Container */}
          <div className="w-full h-full flex flex-col justify-between items-center relative z-20">
            
            {/* 1. TOP HEADER SECTION */}
            <div className="w-full flex flex-col items-center">
              <h1 className="font-serif text-[28px] tracking-[0.22em] font-semibold text-[#fadc96] uppercase text-center leading-tight">
                श्री वर्धमान श्वेतांबर मूर्तिपूजक जैन संघ
              </h1>
              <p className="font-sans text-[15px] tracking-[0.35em] text-[#fffae8]/60 uppercase mt-1 text-center">
                उस्मानपुरा, अहमदाबाद
              </p>
              
              {/* National Emblem Inspired Divider */}
              <div className="flex items-center gap-3 w-72 mt-4 text-[#fadc96]/35">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#fadc96]/40" />
                <svg className="w-5 h-5 text-[#fadc96]/80" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 0 L12 7 L19 10 L12 13 L10 20 L8 13 L1 10 L8 7 Z" />
                </svg>
                <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#fadc96]/40" />
              </div>
            </div>

            {/* 2. MIDDLE LAYOUT GRID: Left (Medal & Title), Center (Guru Panel), Right (Speakers & Event) */}
            <div className="w-full grid grid-cols-12 gap-8 items-start my-6 px-4">
              
              {/* LEFT COLUMN: HERO (PVC Medal & Calligraphy) */}
              <div className="col-span-4 flex flex-col items-center border-r border-white/5 pr-4 h-[520px] justify-center">
                {/* Medal Container (40% Larger, about 280px Height) */}
                <div className={`relative flex items-center justify-center h-[290px] w-[290px] mb-4 ${previewMode ? 'animate-medal-glow' : 'drop-shadow-[0_12px_24px_rgba(0,0,0,0.65)]'}`}>
                  <div className="absolute inset-0 rounded-full bg-orange-600/[0.05] blur-3xl pointer-events-none" />
                  <PvcMedalSvg className="h-[280px] w-[280px]" />
                </div>

                {/* Embossed Gold Foil Title Calligraphy */}
                <h2 
                  className={`font-serif text-[48px] font-extrabold tracking-[0.06em] leading-none text-center select-none ${previewMode ? 'animate-title-shine' : ''}`}
                  style={!previewMode ? {
                    background: titleGoldGrad,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    filter: 'drop-shadow(1px 2px 2px rgba(0,0,0,0.85)) drop-shadow(0px 6px 12px rgba(0,0,0,0.5))',
                  } : undefined}
                >
                  परमवीर चक्र
                </h2>

                {/* Subtitle "शौर्यगाथा" (White + Saffron combination) */}
                <div className="flex items-center justify-center gap-3.5 mt-2 w-full">
                  <div className="h-[1.5px] w-12 bg-gradient-to-r from-[#ff9933]/65 to-transparent" />
                  <h3 
                    className="font-serif text-[28px] font-extrabold tracking-[0.25em] leading-none uppercase text-center"
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
                  <div className="h-[1.5px] w-12 bg-gradient-to-l from-[#138808]/65 to-transparent" />
                </div>

                <p className="text-[11px] uppercase tracking-[0.2em] text-[#fffae8]/70 text-center font-bold mt-3 leading-snug">
                  भारत के सच्चे वीरों को समर्पित एक ऐतिहासिक राष्ट्रभक्ति अनुभव
                </p>
              </div>

              {/* CENTER COLUMN: GURUJI SECTION (Single elegant premium panel) */}
              <div className="col-span-4 flex flex-col gap-4 border-r border-white/5 px-4 h-[520px] justify-between text-left">
                <div className="rounded-2xl border border-[#fadc96]/15 bg-[#060b14]/90 p-6 flex flex-col gap-4 h-full relative">
                  <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#fadc96]/30 rounded-tl-md" />
                  
                  {/* आशीर्वाद */}
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-[#fadc96] font-bold">आशीर्वाद (Blessings)</p>
                    <p className="text-[11px] font-sans text-white/40 mt-1">गच्छाधिपति परम पूज्य आचार्यदेव</p>
                    <p className="text-[18px] font-serif font-bold text-[#fffae8] mt-0.5 leading-snug">
                      श्री नरदेवसागरसूरीश्वरजी महाराज
                    </p>
                  </div>
                  
                  <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#fadc96]/20 to-transparent my-1" />

                  {/* प्रेरणा */}
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-[#fadc96] font-bold">प्रेरणा (Inspiration)</p>
                    <p className="text-[11px] font-sans text-white/40 mt-1">
                      परम पूज्य आचार्यदेव श्री जिन-हेमचंद्रसागरसूरिजी महाराज के शिष्यरत्न
                    </p>
                    <p className="text-[16px] font-serif font-bold text-[#fffae8] mt-1.5 leading-snug">
                      परम पूज्य आचार्यदेव श्री सम्यकचंद्रसागरसूरिजी महाराज
                    </p>
                    <p className="text-[12px] font-sans text-white/35 my-1 text-center font-bold">तथा</p>
                    <p className="text-[16px] font-serif font-bold text-[#fffae8] leading-snug">
                      परम पूज्य आचार्यदेव श्री तारकचंद्रसागरसूरिजी महाराज
                    </p>
                  </div>

                  <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#fadc96]/20 to-transparent my-1" />

                  {/* शास्त्रज्ञ */}
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-[#fadc96] font-bold">शास्त्रज्ञ (Special Presence)</p>
                    <p className="text-[11px] font-sans text-white/40 mt-1">पूज्य मुनि श्री</p>
                    <p className="text-[18px] font-serif font-bold text-[#fffae8] mt-0.5 leading-snug">
                      अर्हमचंद्रसागरजी महाराज
                    </p>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: SPEAKERS, BOOK LAUNCH & EVENT DETAILS */}
              <div className="col-span-4 flex flex-col gap-4 pl-4 h-[520px] justify-between text-left">
                
                {/* Speakers Card */}
                <div className="rounded-2xl border border-[#fadc96]/15 bg-[#060b14]/90 p-5 relative">
                  <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#fadc96]/30 rounded-tl-md" />
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[#fadc96] font-bold mb-2.5">मुख्य वक्ता (Speakers)</p>
                  <div className="flex flex-col gap-3">
                    <div>
                      <p className="text-[18px] font-serif font-bold text-white">श्री हर्षल पुष्कर्णा</p>
                      <p className="text-[11px] font-sans text-white/40 leading-snug">प्रख्यात लेखक, पत्रकार, वक्ता एवं विश्व रिकॉर्ड धारक</p>
                    </div>
                    <div className="border-t border-white/5 pt-2">
                      <p className="text-[17px] font-serif font-bold text-white">पूज्य मुनि श्री श्रमणचंद्रसागरजी महाराज</p>
                      <p className="text-[11px] font-sans text-white/40">परम देशभक्त राष्ट्र-संत</p>
                    </div>
                  </div>
                </div>

                {/* Book Launch Badge & Details Card */}
                <div className="rounded-2xl border border-[#7c521f]/35 bg-gradient-to-br from-[#180e05] to-[#080401] p-4 flex flex-col gap-1.5 relative">
                  <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#ff9933]/30 rounded-tl-md" />
                  <p className="text-[10px] uppercase tracking-[0.18em] text-[#ff9933] font-bold">भव्य विमोचन (Book Launch)</p>
                  <p className="text-[20px] font-serif font-extrabold text-[#fadc96] leading-tight">"आर्यावर्त का गौरव"</p>
                  <p className="text-[11px] font-sans text-white/50">ऐतिहासिक साहित्यिक महाकृति का भव्य विमोचन</p>
                </div>

                {/* Event Details Card */}
                <div className="rounded-2xl border border-[#fadc96]/15 bg-[#060b14]/90 p-4 grid grid-cols-3 gap-2 relative">
                  <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#fadc96]/30 rounded-tl-md" />
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-white/40">📅 दिनांक</p>
                    <p className="text-[14px] font-serif font-bold text-white mt-0.5">09 अगस्त 2026</p>
                    <p className="text-[9.5px] font-sans text-[#ff9933] font-bold">रविवार</p>
                  </div>
                  <div className="border-l border-white/10 pl-2">
                    <p className="text-[10px] uppercase tracking-[0.15em] text-white/40">🕘 समय</p>
                    <p className="text-[14px] font-serif font-bold text-white mt-0.5">प्रातः 9:00 बजे</p>
                    <p className="text-[9.5px] font-sans text-white/40">Reporting</p>
                  </div>
                  <div className="border-l border-white/10 pl-2">
                    <p className="text-[10px] uppercase tracking-[0.15em] text-white/40">📍 स्थान</p>
                    <p className="text-[14px] font-serif font-bold text-[#fadc96] mt-0.5 truncate">दिनेश हॉल</p>
                    <p className="text-[9.5px] font-sans text-white/40 truncate">नवरंगपुरा, अमदावाद</p>
                  </div>
                </div>

              </div>

            </div>

            {/* 3. BOTTOM PANEL: Organizer & Dynamic Identity Card layout with larger QR */}
            <div 
              className="w-full rounded-2xl border border-[#7c521f]/50 bg-gradient-to-r from-[#110903] via-[#211508] to-[#110903] p-7 flex items-center justify-between relative shadow-2xl"
              style={{ boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}
            >
              {/* Inner frame lines */}
              <div className="absolute inset-0.5 rounded-[14px] border border-white/5 pointer-events-none" />
              
              {/* Left Column: Organizer Details */}
              <div className="text-left border-r border-[#7c521f]/30 pr-8 shrink-0">
                <p className="text-[11px] uppercase tracking-[0.18em] text-[#fadc96] font-bold">आयोजक (Organiser)</p>
                <p className="text-[18px] font-serif font-bold text-white mt-1 max-w-[340px]">
                  श्री वर्धमान श्वेतांबर मूर्तिपूजक जैन संघ
                </p>
                <p className="text-[13px] font-sans text-white/50">उस्मानपुरा, अहमदाबाद</p>
              </div>

              {/* Center Column: Participant Details Grid */}
              <div className="flex-1 grid grid-cols-4 gap-6 px-8 text-left">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-white/40 font-bold">PARTICIPANT NAME</p>
                  <p className="text-[22px] font-serif font-bold text-white truncate mt-1">
                    {name || 'Guest Participant'}
                  </p>
                </div>
                
                <div>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-white/40 font-bold">WHATSAPP NUMBER</p>
                  <p className="text-[16px] font-sans font-semibold text-white/90 mt-1">
                    {formattedMobile || 'XXXXXX----'}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-white/40 font-bold">CITY</p>
                  <p className="text-[16px] font-sans font-semibold text-white/90 mt-1 truncate">
                    {city || 'Ahmedabad'}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-[#ff9933] font-bold">ENTRY TYPE</p>
                  <p className="text-[16px] font-sans font-extrabold text-white mt-1">ONLINE ENTRY PASS</p>
                </div>
              </div>

              {/* Right Column: LARGE QR Code & verified badge */}
              <div className="shrink-0 flex items-center gap-6 border-l border-[#7c521f]/30 pl-8">
                <div className="flex flex-col gap-1.5 text-right">
                  <p className="text-[9px] uppercase tracking-[0.15em] text-white/40 font-bold">UNIQUE DIGITAL PASS</p>
                  <p className="text-[20px] font-mono font-bold text-[#fadc96]">
                    {passNumber || 'PVC-2026-XXXXXX'}
                  </p>
                  {/* Verified Badge Stamp */}
                  <div className="flex items-center gap-1.5 border border-dashed border-[#138808]/50 bg-[#138808]/10 px-2.5 py-1 rounded-md self-end mt-1">
                    <div className={`h-1.5 w-1.5 rounded-full bg-[#138808] ${previewMode ? 'animate-beacon' : ''}`} />
                    <span className="text-[8px] font-mono font-extrabold uppercase tracking-widest text-green-400">VERIFIED VIP</span>
                  </div>
                </div>

                {/* Gold rounded luxury frame QR code (130px size) */}
                <div className="h-[130px] w-[130px] bg-[#03060d] border border-[#fadc96]/45 rounded-2xl p-3 flex items-center justify-center shadow-2xl relative overflow-hidden shrink-0">
                  <GoldQrCode />
                  {/* Subtle hologram glow shine */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
                </div>
              </div>
            </div>

            {/* 4. BRANDING FOOTER (Designed & Developed by VCS) */}
            <div className="w-full flex flex-col items-center border-t border-white/5 pt-4 mt-2 text-center">
              <p className="text-[11px] font-sans font-bold tracking-[0.2em] text-white/35 uppercase">
                Designed & Developed by <span className="text-[#fadc96]/70">Vardhman Creative Studio®</span>
              </p>
              <p className="text-[9px] font-sans tracking-[0.25em] text-white/20 uppercase mt-0.5">
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
          className="relative text-white flex flex-col items-center justify-between p-14 overflow-hidden select-none shrink-0"
          style={{
            ...cardStyle,
            backgroundImage: "url('/assets/param-vir-chakra-hero.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundColor: '#02050a'
          }}
        >
          {/* Backdrop Overlays */}
          <div className="absolute inset-0 bg-[#02050a]/97 pointer-events-none z-0" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(50,25,80,0.12)_0%,transparent_75%)] pointer-events-none z-0" />
          <div className="absolute inset-0 opacity-[0.012] bg-[radial-gradient(circle_at_center,#fff_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none z-0" />
          
          <TricolorBeams />
          
          {/* Watermarks */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 opacity-80">
            <GiantAshokaChakra />
          </div>

          {/* Border Frame */}
          <div 
            className="absolute inset-8 pointer-events-none z-10 border-[8px]"
            style={{ borderImage: `${outerBorderGrad} 1` }}
          />
          
          {/* Inner thin frame */}
          <div 
            className="absolute inset-12 pointer-events-none z-10 border border-opacity-25" 
            style={{ borderColor: 'rgba(250,216,141,0.2)' }}
          />

          {/* Corners */}
          <div className="absolute top-11 left-11 w-16 h-16 border-t-[3px] border-l-[3px] z-10" style={{ borderColor: '#fadc96' }} />
          <div className="absolute top-11 right-11 w-16 h-16 border-t-[3px] border-r-[3px] z-10" style={{ borderColor: '#fadc96' }} />
          <div className="absolute bottom-11 left-11 w-16 h-16 border-b-[3px] border-l-[3px] z-10" style={{ borderColor: '#fadc96' }} />
          <div className="absolute bottom-11 right-11 w-16 h-16 border-b-[3px] border-r-[3px] z-10" style={{ borderColor: '#fadc96' }} />

          {/* Back Content Container */}
          <div className="w-full h-full flex flex-col justify-between items-center relative z-20">
            
            {/* Header */}
            <div className="text-center flex flex-col items-center">
              <h2 
                className="font-serif text-[42px] font-bold tracking-[0.12em] text-[#fadc96]"
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
              <p className="text-[13px] uppercase tracking-[0.25em] text-white/40 mt-1">Important Guidelines</p>
              <div className="w-52 h-[1px] bg-gradient-to-r from-transparent via-[#fadc96]/30 to-transparent mt-3.5" />
            </div>

            {/* Guidelines list with bronze circles inside beautiful card elements (in 2 columns for landscape) */}
            <div className="w-full grid grid-cols-2 gap-x-8 gap-y-6 px-12 my-6">
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
                  className="flex items-start gap-4 rounded-xl border border-white/5 bg-[#060b14]/80 p-4 shadow-md relative"
                >
                  <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-[#fadc96]/20 rounded-tl-md" />
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fadc96]/10 border border-[#fadc96]/35 text-[#fadc96] text-[16px] font-bold font-mono mt-0.5 shadow-lg">
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
              className="w-full max-w-[1800px] rounded-2xl border border-[#7c521f]/35 bg-gradient-to-br from-[#140b03] to-[#070401] p-6 text-center my-2 shadow-lg relative"
            >
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#fadc96]/30 rounded-tl-md" />
              <p className="font-serif text-[20px] font-bold text-[#fadc96] tracking-[0.08em]">
                * स्मरणीय अनुरोध *
              </p>
              <p className="text-[17px] font-serif text-[#fffae8]/90 leading-relaxed mt-2.5">
                इस ऐतिहासिक क्षण की मधुर स्मृति के रूप में इस डिजिटल पास को अपने पास सुरक्षित रखें।
              </p>
            </div>

            {/* Back Branding Footer */}
            <div className="w-full flex flex-col items-center border-t border-white/5 pt-4 mt-2 text-center">
              <p className="text-[11px] font-sans font-bold tracking-[0.2em] text-white/35 uppercase">
                Designed & Developed by <span className="text-[#fadc96]/70">Vardhman Creative Studio®</span>
              </p>
              <p className="text-[9px] font-sans tracking-[0.25em] text-white/20 uppercase mt-0.5">
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
