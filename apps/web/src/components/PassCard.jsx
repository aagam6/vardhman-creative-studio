import React from 'react';
import PvcMedalSvg from './PvcMedalSvg.jsx';

export default function PassCard({ name = "", mobile = "", city = "", passNumber = "", scale = 1 }) {
  // Format mobile to show only last 4 digits
  const formatMobile = (mob) => {
    if (!mob) return '';
    const clean = mob.toString().replace(/\D/g, '');
    if (clean.length <= 4) return clean;
    return `XXXXXX${clean.slice(-4)}`;
  };

  const formattedMobile = formatMobile(mobile);

  // Portrait card sizing (1080x1920 px)
  const cardStyle = {
    width: '1080px',
    height: '1920px',
    transform: scale !== 1 ? `scale(${scale})` : undefined,
    transformOrigin: 'top left',
    fontFamily: '"Outfit", "Noto Sans Devanagari", sans-serif',
  };

  // Luxury Gradients and Styles
  const outerBorderGrad = "linear-gradient(135deg, #7c521f 0%, #fadc96 25%, #4a2c07 50%, #fad88d 75%, #301a03 100%)";
  const goldTextGrad = "linear-gradient(to bottom, #ffffff 0%, #fff4db 15%, #dfb361 50%, #b88a38 85%, #754f15 100%)";
  const silverTextGrad = "linear-gradient(to bottom, #ffffff 0%, #eef1f5 35%, #a6b0c2 70%, #545e6f 100%)";
  const bronzeCardGrad = "linear-gradient(135deg, #120b04 0%, #201409 50%, #120b04 100%)";

  return (
    <div className={`flex flex-col xl:flex-row gap-8 items-center ${scale !== 1 ? 'overflow-visible' : ''}`}>
      
      {/* ================================= FRONT SIDE (PORTRAIT 1080x1920) ================================= */}
      <div 
        id={`pass-front-${passNumber}`}
        className="relative text-white flex flex-col items-center justify-between p-10 overflow-hidden select-none shrink-0"
        style={{
          ...cardStyle,
          backgroundImage: "url('/assets/param-vir-chakra-hero.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: '#03060f'
        }}
      >
        {/* Soft Premium Vignette & Backdrop Blend Overlay */}
        <div className="absolute inset-0 bg-[#02050a]/92 pointer-events-none z-0" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(90,45,20,0.18)_0%,transparent_75%)] pointer-events-none z-0" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(50,25,80,0.15)_0%,transparent_60%)] pointer-events-none z-0" />

        {/* Paper Grain Overlay Effect */}
        <div className="absolute inset-0 opacity-[0.015] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none z-0" />

        {/* Luxury Gold/Bronze Border Frame (G20 VIP / Rashtrapati Bhavan style) */}
        <div 
          className="absolute inset-6 pointer-events-none z-10 border-[6px]"
          style={{ borderImage: `${outerBorderGrad} 1` }}
        />
        
        {/* Inner thin frame */}
        <div 
          className="absolute inset-9 pointer-events-none z-10 border border-opacity-30" 
          style={{ borderColor: 'rgba(250,216,141,0.2)' }}
        />

        {/* Corner Ornaments */}
        <div className="absolute top-8 left-8 w-12 h-12 border-t-[3px] border-l-[3px] z-10" style={{ borderColor: '#fadc96' }} />
        <div className="absolute top-8 right-8 w-12 h-12 border-t-[3px] border-r-[3px] z-10" style={{ borderColor: '#fadc96' }} />
        <div className="absolute bottom-8 left-8 w-12 h-12 border-b-[3px] border-l-[3px] z-10" style={{ borderColor: '#fadc96' }} />
        <div className="absolute bottom-8 right-8 w-12 h-12 border-b-[3px] border-r-[3px] z-10" style={{ borderColor: '#fadc96' }} />

        {/* Front Content Container */}
        <div className="w-full h-full flex flex-col justify-between items-center relative z-20 pt-4">
          
          {/* 1. HEADER */}
          <div className="w-full flex flex-col items-center">
            <h1 className="font-serif text-[18px] tracking-[0.18em] font-semibold text-[#fadc96] uppercase text-center leading-tight">
              श्री वर्धमान श्वेतांबर मूर्तिपूजक जैन संघ
            </h1>
            <p className="font-sans text-[11px] tracking-[0.3em] text-[#fffae8]/60 uppercase mt-1 text-center">
              उस्मानपुरा, अहमदाबाद
            </p>
            {/* Elegant Ornamental Divider SVG */}
            <svg className="w-48 h-3 text-[#fadc96]/40 mt-3" viewBox="0 0 100 10" fill="currentColor">
              <path d="M50 0 L52 4 L60 5 L52 6 L50 10 L48 6 L40 5 L48 4 Z M10 5 L40 5 M60 5 L90 5" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>

          {/* 2. HERO: MEDAL & TITLES */}
          <div className="flex flex-col items-center mt-2 w-full">
            {/* Param Vir Chakra Medal */}
            <div className="relative flex items-center justify-center h-[210px] w-[210px] mb-2">
              <div className="absolute inset-0 rounded-full bg-orange-600/5 blur-2xl pointer-events-none" />
              <PvcMedalSvg className="h-[200px] w-[200px]" />
            </div>

            {/* Custom Hindi Calligraphy Style Title */}
            <h2 
              className="font-serif text-[52px] font-extrabold tracking-[0.06em] leading-none text-center select-none"
              style={{
                background: goldTextGrad,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(1px 2px 2px rgba(0,0,0,0.8)) drop-shadow(0px 4px 8px rgba(0,0,0,0.5))',
              }}
            >
              परमवीर चक्र
            </h2>

            {/* Subtitle */}
            <div className="flex items-center justify-center gap-3 mt-1.5 w-full">
              <div className="h-[1px] w-12 bg-gradient-to-r from-[#fadc96]/40 to-transparent" />
              <h3 
                className="font-serif text-[28px] font-bold tracking-[0.2em] leading-none uppercase text-center"
                style={{
                  background: silverTextGrad,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: 'drop-shadow(1px 2px 2px rgba(0,0,0,0.8))',
                }}
              >
                शौर्यगाथा
              </h3>
              <div className="h-[1px] w-12 bg-gradient-to-l from-[#fadc96]/40 to-transparent" />
            </div>

            {/* Tagline */}
            <p className="text-[12px] uppercase tracking-[0.28em] text-[#fffae8]/80 text-center font-medium mt-3">
              भारत के सच्चे वीरों को समर्पित एक ऐतिहासिक राष्ट्रभक्ति अनुभव
            </p>
          </div>

          {/* 3. DETAILS GRID SECTION (Compact & Luxury Cards) */}
          <div className="w-full flex flex-col gap-3.5 px-4 my-2">
            
            {/* Row 1: Blessings & Special Presence (शास्त्रज्ञ) */}
            <div className="grid grid-cols-2 gap-3.5">
              <div className="rounded-xl border border-[#fadc96]/15 bg-[#0a1122]/90 p-3.5 text-left shadow-lg">
                <p className="text-[10px] uppercase tracking-[0.15em] text-[#fadc96] font-bold">आशीर्वाद (Blessings)</p>
                <p className="text-[10px] font-sans text-white/40 mt-0.5">गच्छाधिपति परम पूज्य आचार्यदेव</p>
                <p className="text-[14px] font-serif font-bold text-white mt-0.5 leading-snug truncate">
                  श्री नरदेवसागरसूरीश्वरजी महाराज
                </p>
              </div>
              <div className="rounded-xl border border-[#fadc96]/15 bg-[#0a1122]/90 p-3.5 text-left shadow-lg">
                <p className="text-[10px] uppercase tracking-[0.15em] text-[#fadc96] font-bold">शास्त्रज्ञ (Presence)</p>
                <p className="text-[10px] font-sans text-white/40 mt-0.5">पूज्य मुनि श्री</p>
                <p className="text-[14px] font-serif font-bold text-white mt-0.5 leading-snug truncate">
                  अर्हमचंद्रसागरजी महाराज
                </p>
              </div>
            </div>

            {/* Row 2: Inspiration (प्रेरणा) */}
            <div className="rounded-xl border border-[#fadc96]/15 bg-[#0a1122]/90 p-3.5 text-left shadow-lg relative overflow-hidden">
              <p className="text-[10px] uppercase tracking-[0.15em] text-[#fadc96] font-bold">प्रेरणा (Inspiration)</p>
              <p className="text-[10px] font-sans text-white/45 mt-0.5">
                परम पूज्य आचार्यदेव श्री जिन-हेमचंद्रसागरसूरिजी महाराज के शिष्यरत्न
              </p>
              <div className="grid grid-cols-2 gap-2 mt-1.5">
                <p className="text-[13px] font-serif font-bold text-white leading-tight">
                  प.पू. आचार्यदेव श्री सम्यकचंद्रसागरसूरिजी म.सा.
                </p>
                <p className="text-[13px] font-serif font-bold text-white leading-tight border-l border-white/10 pl-2">
                  प.पू. आचार्यदेव श्री तारकचंद्रसागरसूरिजी म.सा.
                </p>
              </div>
            </div>

            {/* Row 3: Speakers & Book Launch */}
            <div className="grid grid-cols-12 gap-3.5">
              {/* Speaker Card (Col 7) */}
              <div className="col-span-7 rounded-xl border border-[#fadc96]/15 bg-[#0a1122]/90 p-3.5 text-left shadow-lg">
                <p className="text-[10px] uppercase tracking-[0.15em] text-[#fadc96] font-bold">मुख्य वक्ता (Speakers)</p>
                <div className="mt-1">
                  <p className="text-[14px] font-serif font-bold text-white leading-snug">श्री हर्षल पुष्कर्णा</p>
                  <p className="text-[9px] font-sans text-white/40">प्रख्यात लेखक, पत्रकार एवं वक्ता</p>
                </div>
                <div className="mt-1.5 pt-1.5 border-t border-white/5">
                  <p className="text-[14px] font-serif font-bold text-white leading-snug">प.पू. मुनि श्री श्रमणचंद्रसागरजी महाराज</p>
                  <p className="text-[9px] font-sans text-white/40">विश्व रिकॉर्ड धारक</p>
                </div>
              </div>

              {/* Book Launch Card (Col 5) */}
              <div className="col-span-5 rounded-xl border border-[#7c521f]/30 bg-gradient-to-br from-[#1c1209] to-[#0c0602] p-3.5 text-left shadow-lg flex flex-col justify-between">
                <p className="text-[9px] uppercase tracking-[0.15em] text-[#fadc96] font-bold">भव्य विमोचन</p>
                <div>
                  <p className="text-[14px] font-serif font-extrabold text-[#ff9933] leading-tight">"आर्यावर्त का गौरव"</p>
                  <p className="text-[9px] font-sans text-white/50 mt-1 leading-snug">साहित्यिक महाकृति का विमोचन</p>
                </div>
              </div>
            </div>

            {/* Row 4: Event details card */}
            <div className="rounded-xl border border-[#fadc96]/15 bg-[#0a1122]/90 p-3.5 text-left shadow-lg grid grid-cols-3 gap-2">
              <div>
                <p className="text-[9px] uppercase tracking-[0.15em] text-white/40">दिनांक (Date)</p>
                <p className="text-[14px] font-serif font-bold text-white mt-0.5">09 अगस्त 2026</p>
                <p className="text-[10px] font-sans text-[#ff9933] font-medium">रविवार / Sunday</p>
              </div>
              <div className="border-l border-white/10 pl-2">
                <p className="text-[9px] uppercase tracking-[0.15em] text-white/40">समय (Time)</p>
                <p className="text-[14px] font-serif font-bold text-white mt-0.5">प्रातः 9:00 बजे</p>
                <p className="text-[10px] font-sans text-white/45">Reporting Time</p>
              </div>
              <div className="border-l border-white/10 pl-2">
                <p className="text-[9px] uppercase tracking-[0.15em] text-white/40">स्थान (Venue)</p>
                <p className="text-[14px] font-serif font-bold text-[#fadc96] mt-0.5 truncate">दिनेश हॉल</p>
                <p className="text-[10px] font-sans text-white/45 truncate">नवरंगपुरा, अहमदाबाद</p>
              </div>
            </div>

          </div>

          {/* 4. DYNAMIC PARTICIPANT PANEL (Government ID layout) */}
          <div 
            className="w-full rounded-2xl border border-[#7c521f]/40 bg-gradient-to-r from-[#140b03] via-[#241709] to-[#140b03] p-5 my-2 flex items-center justify-between relative shadow-xl"
            style={{ boxShadow: '0 15px 30px rgba(0,0,0,0.5)' }}
          >
            {/* Border Inner Glow */}
            <div className="absolute inset-0.5 rounded-[14px] border border-white/5 pointer-events-none" />
            
            {/* ID details (Col Left) */}
            <div className="flex-1 flex flex-col gap-3.5 text-left min-w-0 pr-4">
              <div>
                <p className="text-[9px] uppercase tracking-[0.15em] text-white/40 font-bold">NAME</p>
                <p className="text-[20px] font-serif font-bold text-white truncate mt-0.5">
                  {name || 'Guest Participant'}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.15em] text-white/40 font-bold">WHATSAPP</p>
                  <p className="text-[14px] font-sans font-medium text-white/80 mt-0.5">
                    {formattedMobile || 'XXXXXX----'}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-[0.15em] text-white/40 font-bold">CITY</p>
                  <p className="text-[14px] font-sans font-medium text-white/80 mt-0.5 truncate">
                    {city || 'Ahmedabad'}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-[9px] uppercase tracking-[0.15em] text-white/40 font-bold">PASS NUMBER</p>
                <p className="text-[18px] font-mono font-bold text-[#fadc96] mt-0.5">
                  {passNumber || 'PVC-2026-XXXXXX'}
                </p>
              </div>
            </div>

            {/* Visual Stamp + Qr Block (Col Right) */}
            <div className="shrink-0 flex flex-col items-center gap-3">
              {/* Gold rounded luxury frame QR code */}
              <div className="h-28 w-28 bg-[#0c1220] border border-[#fadc96]/30 rounded-xl p-2 flex items-center justify-center shadow-inner relative overflow-hidden">
                <svg className="w-full height-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Outer corners */}
                  <path d="M10 10h20v6H16v14h-6V10zm60 0h20v20h-6V16H70v-6zM10 70h6v14h14v6H10V70zm80 0v20H70v-6h14V70h6z" fill="#fadc96" fillOpacity="0.8" />
                  {/* Center QR Noise blocks */}
                  <path d="M22 22h12v12H22V22zm44 0h12v12H66V22zm0 44h12v12H66V66zM22 66h12v12H22V66z" fill="#fadc96" fillOpacity="0.9" />
                  <path d="M42 22h8v8h-8zM42 34h8v8h-8zM54 22h8v8h-8zM34 42h8v8h-8zM22 46h8v8h-8zM46 54h8v8h-8zM54 46h8v8h-8zM46 66h8v8h-8zM58 58h8v8h-8zM34 58h8v8h-8zM54 70h8v8h-8z" fill="#fadc96" fillOpacity="0.75" />
                </svg>
              </div>

              {/* Verified Badge Stamp */}
              <div className="flex items-center gap-1 border border-dashed border-[#138808]/40 bg-[#138808]/5 px-2.5 py-1 rounded-md">
                <div className="h-1.5 w-1.5 rounded-full bg-[#138808] animate-pulse" />
                <span className="text-[8px] font-mono font-extrabold uppercase tracking-widest text-green-400">VERIFIED PASS</span>
              </div>
            </div>
          </div>

          {/* 5. BRANDING (Designed & Developed by VCS) */}
          <div className="w-full flex flex-col items-center border-t border-white/5 pt-3 mt-1 text-center">
            <p className="text-[10px] font-sans font-bold tracking-[0.18em] text-white/30 uppercase">
              Designed & Developed by <span className="text-[#fadc96]/60">Vardhman Creative Studio®</span>
            </p>
            <p className="text-[8px] font-sans tracking-[0.25em] text-white/20 uppercase mt-0.5">
              AI Creative Technology Partner <span className="mx-1.5">•</span> www.vardhmancreativestudio.com
            </p>
          </div>

        </div>
      </div>

      {/* ================================= BACK SIDE (PORTRAIT 1080x1920) ================================= */}
      <div 
        id={`pass-back-${passNumber}`}
        className="relative text-white flex flex-col items-center justify-between p-10 overflow-hidden select-none shrink-0"
        style={{
          ...cardStyle,
          backgroundImage: "url('/assets/param-vir-chakra-hero.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: '#03060f'
        }}
      >
        {/* Backdrop Overlays */}
        <div className="absolute inset-0 bg-[#02050a]/94 pointer-events-none z-0" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(50,25,80,0.12)_0%,transparent_75%)] pointer-events-none z-0" />

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

          {/* Guidelines list */}
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
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fadc96]/10 border border-[#fadc96]/30 text-[#fadc96] text-[16px] font-bold font-mono mt-0.5">
                  {idx + 1}
                </span>
                <p className="text-[18px] font-serif font-semibold text-white/95 leading-normal text-left">
                  {instruction}
                </p>
              </div>
            ))}
          </div>

          {/* Souvenir Note */}
          <div 
            className="w-full rounded-2xl border border-[#7c521f]/30 bg-gradient-to-br from-[#140b03] to-[#0c0602] p-5 text-center my-2 shadow-lg"
          >
            <p className="font-serif text-[18px] font-bold text-[#fadc96] tracking-[0.08em]">
              * स्मरणीय अनुरोध *
            </p>
            <p className="text-[15px] font-serif text-[#fffae8]/90 leading-relaxed mt-2">
              इस ऐतिहासिक क्षण की मधुर स्मृति के रूप में इस डिजिटल पास को अपने पास सुरक्षित रखें।
            </p>
          </div>

          {/* Back Branding Footer */}
          <div className="w-full flex flex-col items-center border-t border-white/5 pt-3 mt-1 text-center">
            <p className="text-[10px] font-sans font-bold tracking-[0.18em] text-white/30 uppercase">
              Designed & Developed by <span className="text-[#fadc96]/60">Vardhman Creative Studio®</span>
            </p>
            <p className="text-[8px] font-sans tracking-[0.25em] text-white/20 uppercase mt-0.5">
              www.vardhmancreativestudio.com
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
