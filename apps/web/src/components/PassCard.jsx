import React, { memo } from 'react';

const PassCard = memo(({
  name = '',
  mobile = '',
  passNumber = '',
  scale = 1,
  activeSide = 'both',
}) => {
  const formatMobile = (value) => {
    const digits = String(value || '').replace(/\D/g, '');
    return digits.length > 4 ? `XXXXXX${digits.slice(-4)}` : digits;
  };

  const formattedMobile = formatMobile(mobile);
  const showFront = activeSide === 'both' || activeSide === 'front';
  const showBack = activeSide === 'both' || activeSide === 'back';

  // Digital Pass Dimensions: 2484 x 1128 pixels (Double resolution of 1242x564 for ultra-premium sharp print quality)
  const cardStyle = {
    width: '2484px',
    height: '1128px',
    transform: scale !== 1 ? `scale(${scale})` : undefined,
    transformOrigin: 'top left',
    boxSizing: 'border-box',
  };

  // Flowing Premium Tricolour Ambient Lighting
  const CinematicBackground = () => (
    <>
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100\' height=\'100\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />
      <div className="absolute -top-[20%] -left-[10%] h-[800px] w-[1100px] rounded-full bg-[#ff9933] opacity-[0.06] blur-[140px] mix-blend-screen pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 h-[600px] w-[1400px] -translate-x-1/2 -translate-y-1/2 transform -rotate-12 bg-white opacity-[0.03] blur-[130px] mix-blend-screen pointer-events-none" />
      <div className="absolute -bottom-[20%] -right-[10%] h-[800px] w-[1100px] rounded-full bg-[#138808] opacity-[0.06] blur-[140px] mix-blend-screen pointer-events-none" />
    </>
  );

  const GoldBorderFrame = () => (
    <svg 
      className="absolute inset-6 pointer-events-none z-10" 
      style={{ width: '2436px', height: '1080px' }}
      viewBox="0 0 2436 1080" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect 
        x="5" 
        y="5" 
        width="2426" 
        height="1070" 
        stroke="url(#goldBorderGrad)" 
        strokeWidth="8" 
      />
      <defs>
        <linearGradient id="goldBorderGrad" x1="0" y1="0" x2="2436" y2="1080" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a37029" />
          <stop offset="25%" stopColor="#fad88d" />
          <stop offset="50%" stopColor="#4e320d" />
          <stop offset="75%" stopColor="#fadc96" />
          <stop offset="100%" stopColor="#2a1602" />
        </linearGradient>
      </defs>
    </svg>
  );

  const StateEmblem = () => (
    <img 
      src="/assets/emblem.png" 
      className="h-[150px] w-auto object-contain mx-auto mb-2 shrink-0 drop-shadow-[0_5px_10px_rgba(0,0,0,0.6)]" 
      alt="State Emblem of India" 
    />
  );

  return (
    <div className={`flex flex-col items-center gap-16 ${scale !== 1 ? 'overflow-visible' : ''}`}>
      
      {/* ======================= FRONT SIDE ======================= */}
      {showFront && (
        <section 
          id={`pass-front-${passNumber}`} 
          className="relative shrink-0 overflow-hidden text-white shadow-2xl p-14 flex flex-col justify-between" 
          style={{
            ...cardStyle,
            backgroundColor: '#040812',
            backgroundImage: "url('/assets/param-vir-chakra-hero.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Backdrop blending overlays for dark cinematic feel (optimized to make background details shine) */}
          <div className="absolute inset-0 bg-[#040812]/35 pointer-events-none z-0" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(4,8,18,0.1)_0%,rgba(4,8,18,0.5)_100%)] pointer-events-none z-0" />
          
          <CinematicBackground />
          <GoldBorderFrame />

          {/* Corner Ornaments */}
          <div className="absolute top-10 left-10 w-12 h-12 border-t-[3px] border-l-[3px] z-10" style={{ borderColor: '#fad88d' }} />
          <div className="absolute top-10 right-10 w-12 h-12 border-t-[3px] border-r-[3px] z-10" style={{ borderColor: '#fad88d' }} />
          <div className="absolute bottom-10 left-10 w-12 h-12 border-b-[3px] border-l-[3px] z-10" style={{ borderColor: '#fad88d' }} />
          <div className="absolute bottom-10 right-10 w-12 h-12 border-b-[3px] border-r-[3px] z-10" style={{ borderColor: '#fad88d' }} />

          {/* Saffron White Green tiny flag ribbon centered under top title */}
          <div className="absolute top-[68px] left-[520px] -translate-x-1/2 flex h-[10px] w-[70px] rounded overflow-hidden border border-white/10 shadow-sm z-20">
            <div className="flex-1 bg-[#FF9933]" />
            <div className="flex-1 bg-[#FFFFFF] flex items-center justify-center relative">
              <div className="w-2 h-2 rounded-full border-[0.5px] border-[#000080]" />
            </div>
            <div className="flex-1 bg-[#138808]" />
          </div>

          {/* Absolute floating Medal - Centered vertically relative to the card's height */}
          <div className="absolute top-1/2 -translate-y-1/2 left-[50px] z-20 flex flex-col items-center">
            <img 
              src="/assets/PVC.png" 
              className="h-[430px] w-[220px] object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.95)]" 
              alt="Param Vir Chakra Medal" 
            />
          </div>

          {/* ================= LEFT MAIN INVITATION REGION ================= */}
          <div className="w-[74%] h-full flex flex-col justify-between items-center relative z-20 pr-4">
            
            {/* Title Block - No clipping: proper line-height and padding. Solid gold text to prevent canvas gradients bugs */}
            <div className="w-full flex flex-col items-center text-center">
              <p className="text-[19px] font-display font-extrabold tracking-[0.25em] text-[#fad88d] uppercase leading-[1.45] pt-1 whitespace-nowrap">भारत के वीरों को समर्पित</p>
              
              <h2 className="font-display text-[58px] font-extrabold tracking-normal leading-[1.45] text-[#fad88d] drop-shadow-[0_3px_5px_rgba(0,0,0,0.9)] py-2 mt-1 whitespace-nowrap">
                परमवीर चक्र
              </h2>
              
              <div className="mt-1 flex items-center gap-4 w-full justify-center">
                <div className="h-[1px] w-10 bg-gradient-to-r from-transparent to-[#fad88d]/40" />
                <h3 className="font-display text-[40px] font-extrabold tracking-normal text-[#fffae8] leading-[1.45] py-1.5 whitespace-nowrap">
                  शौर्यगाथा
                </h3>
                <div className="h-[1px] w-10 bg-gradient-to-l from-transparent to-[#fad88d]/40" />
              </div>

              <h4 className="font-display text-[24px] font-bold text-[#fffae8] leading-[1.45] mt-1 drop-shadow-md whitespace-nowrap">
                आर्यावर्त का गौरव
              </h4>
              <p className="text-[15px] font-display font-extrabold tracking-[0.25em] text-[#fad88d]/90 uppercase leading-[1.45] mt-2 whitespace-nowrap">
                HISTORIC LITERARY MASTERPIECE
              </p>
              <p className="text-[17px] font-display text-white/50 leading-[1.45] mt-0.5 pb-1 whitespace-nowrap">
                एक ऐतिहासिक राष्ट्रभक्ति अनुभव
              </p>
            </div>

            {/* Middle Content Stack (Pushed inside pl-[230px] to fully clear the medal on the left) */}
            <div className="w-full pl-[230px] flex flex-col justify-between flex-1 mt-3">
              {/* Inspiration & Speakers horizontal block - Auto-fit box heights around enlarged text sizes */}
              <div className="grid grid-cols-12 gap-5 items-start w-full">
                {/* प्रेरणा (Inspiration) */}
                <div className="col-span-6 rounded-xl border border-white/10 bg-[#060c18]/85 backdrop-blur-md py-4 px-5 shadow-lg relative text-left h-auto">
                  <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-[#fad88d]/30 rounded-tl-sm" />
                  <p className="text-[15px] font-display uppercase tracking-[0.1em] text-[#fad88d] font-bold border-b border-white/5 pb-1 mb-2">प्रेरणा</p>
                  <div className="flex flex-col gap-2.5 text-[20px] text-[#fffae8] font-display font-bold leading-[1.45]">
                    <p>• परम पूज्य आचार्यदेव श्री जिन-हेमचंद्रसागरसूरिजी महाराज के शिष्यरत्न</p>
                    <p>• परम पूज्य आचार्यदेव श्री सम्यकचंद्रसागरसूरिजी महाराज</p>
                    <p>• परम पूज्य आचार्यदेव श्री तारकचंद्रसागरसूरिजी महाराज</p>
                    <p>• पूज्य मुनि श्री अर्हमचंद्रसागरजी महाराज</p>
                  </div>
                </div>

                {/* मुख्य वक्ता (Speakers) */}
                <div className="col-span-6 rounded-xl border border-white/10 bg-[#060c18]/85 backdrop-blur-md py-4 px-5 shadow-lg relative text-left h-auto">
                  <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-[#fad88d]/30 rounded-tl-sm" />
                  <p className="text-[15px] font-display uppercase tracking-[0.1em] text-[#fad88d] font-bold border-b border-white/5 pb-1 mb-2">मुख्य वक्ता</p>
                  <div className="flex flex-col gap-3 text-[20px] text-[#fffae8] font-display font-bold leading-[1.45]">
                    <div>
                      <p className="text-[34px] font-display font-extrabold text-white leading-[1.45]">श्री हर्षल पुष्करणा</p>
                      <p className="text-[20px] text-white/50 font-sans mt-0.5 leading-snug">प्रख्यात लेखक • पत्रकार • वक्ता</p>
                    </div>
                    <div className="border-t border-white/5 pt-2 mt-1">
                      <p className="text-[16px] text-white/45 font-sans leading-tight">विश्व रिकॉर्ड धारक</p>
                      <p className="text-[25px] font-display font-extrabold text-[#f4db9c] leading-[1.45]">पूज्य मुनि श्री श्रमणचंद्रसागरजी महाराज</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* UNIFIED SCHEDULE, VENUE & ORGANIZER DETAILS BLOCK (Side-by-side layout: col-span-8 for details, col-span-4 for organizer) */}
              <div className="grid grid-cols-12 gap-5 w-full mt-3 shrink-0">
                
                {/* Unified Event Details Card (col-span-8) */}
                <div className="col-span-8 rounded-xl border border-[#fad88d]/35 bg-[#060c18]/90 py-4 px-6 text-left shadow-lg relative flex flex-col justify-between h-auto gap-4">
                  <div className="absolute top-0 left-5 -translate-y-1/2 bg-[#a37029] border border-[#fad88d]/40 rounded-full px-4 py-0.5">
                    <span className="text-[12px] uppercase tracking-[0.15em] font-extrabold text-[#fad88d]">कार्यक्रम विवरण (EVENT SCHEDULE)</span>
                  </div>
                  
                  {/* Horizontally structured Date/Time & Venue columns inside the card */}
                  <div className="grid grid-cols-12 gap-4 mt-1">
                    {/* Date/Time detail */}
                    <div className="col-span-5 border-r border-white/10 pr-2">
                      <p className="text-[12px] text-[#fad88d] font-sans uppercase tracking-wider font-bold">DATE & TIME</p>
                      <p className="text-[28px] font-display font-extrabold text-white mt-1 leading-normal">
                        09 अगस्त 2026
                      </p>
                      <p className="text-[20px] text-[#fffae8] font-display mt-0.5 font-bold">
                        रविवार, प्रातः 9:00 बजे
                      </p>
                    </div>
                    
                    {/* Venue detail */}
                    <div className="col-span-7 pl-2">
                      <p className="text-[12px] text-[#fad88d] font-sans uppercase tracking-wider font-bold">VENUE & ENTRY</p>
                      <p className="text-[28px] font-display font-extrabold text-[#fcdcae] mt-1 leading-normal">
                        दिनेश हॉल, नवरंगपुरा
                      </p>
                      <p className="text-[18px] text-[#fad88d] font-sans mt-0.5 font-bold">
                        प्रवेश: केवल आमंत्रण पत्र द्वारा
                      </p>
                    </div>
                  </div>
                </div>

                {/* Organizer Card block (col-span-4 - completely side-by-side with schedule card) */}
                <div className="col-span-4 rounded-xl border border-[#7c521f]/35 bg-[#0f0b06]/95 py-4 px-5 text-center relative shadow-md flex flex-col justify-center h-auto">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#5d3d17] border border-[#fad88d]/40 rounded-full px-5 py-0.5">
                    <span className="text-[12px] uppercase tracking-[0.2em] font-extrabold text-[#fad88d]">Organizer</span>
                  </div>
                  <h4 className="text-[22px] font-display font-extrabold text-[#fffae8] mt-1 leading-relaxed">
                    श्री वर्धमान श्वेतांबर मूर्तिपूजक जैन संघ
                  </h4>
                  <p className="text-[16px] font-sans text-white/45 tracking-wider mt-0.5">
                    — उस्मानपुरा, अहमदाबाद —
                  </p>
                </div>

              </div>

            </div>

            {/* Bottom branding strip */}
            <div className="w-full flex justify-between items-center text-[14px] tracking-wide text-white/30 font-sans border-t border-white/5 pt-3 mt-2">
              <div>
                DESIGNED & DEVELOPED BY <span className="text-[#fad88d]/60 font-bold">Vardhman Creative Studio®</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span>CREATIVE TECHNOLOGY PARTNER</span>
                <span>|</span>
                <span>www.vardhmancreativestudio.com</span>
              </div>
            </div>
          </div>

          {/* ================= RIGHT TICKET STUB (ID CARD) ================= */}
          {/* Perforation vertical border line */}
          <div className="absolute right-[600px] top-8 bottom-8 w-[3px] bg-gradient-to-b from-[#a37029] via-[#fad88d] to-[#2a1602] opacity-80 z-20" />
          <div className="absolute right-[595px] top-8 bottom-8 w-[1.5px] border-l border-dashed border-white/25 z-20" />

          {/* Stub Body */}
          <div className="absolute right-8 top-8 bottom-8 w-[560px] z-20 flex flex-col justify-between py-10 px-10 text-center bg-[#030914]/85 backdrop-blur-md rounded-r-[20px] shrink-0">
            {/* Top State Emblem header */}
            <div className="flex flex-col items-center shrink-0">
              <StateEmblem />
              <h3 className="text-[25px] font-sans font-bold tracking-[0.12em] text-white mt-1 uppercase">
                ONLINE ENTRY PASS
              </h3>
              <p className="text-[15px] font-extrabold tracking-[0.25em] text-[#fad88d] mt-2">
                VERIFIED ENTRY
              </p>
            </div>

            {/* Center Dynamic inputs */}
            <div className="flex flex-col gap-5 my-5 shrink-0">
              {/* Participant */}
              <div className="text-left">
                <p className="text-[15px] font-extrabold tracking-[0.1em] text-[#fad88d] mb-1.5">PARTICIPANT NAME</p>
                <div className="w-full h-[64px] bg-gradient-to-r from-[#fad88d] to-[#b88a3d] rounded-lg flex items-center px-5 shadow-[inset_0_3px_5px_rgba(0,0,0,0.35)]">
                  <span className="text-[23px] font-sans font-extrabold text-[#051020] truncate w-full">
                    {name || 'Guest Participant'}
                  </span>
                </div>
              </div>

              {/* Mobile */}
              <div className="text-left">
                <p className="text-[15px] font-extrabold tracking-[0.1em] text-[#fad88d] mb-1.5">MOBILE NUMBER</p>
                <div className="w-full h-[64px] bg-gradient-to-r from-[#fad88d] to-[#b88a3d] rounded-lg flex items-center px-5 shadow-[inset_0_3px_5px_rgba(0,0,0,0.35)]">
                  <span className="text-[23px] font-sans font-extrabold text-[#051020] tracking-wider">
                    {formattedMobile || 'XXXXXX----'}
                  </span>
                </div>
              </div>

              {/* Pass Number */}
              <div className="text-left">
                <p className="text-[15px] font-extrabold tracking-[0.1em] text-[#fad88d] mb-1.5">PASS NUMBER</p>
                <div className="w-full h-[64px] bg-gradient-to-r from-[#fad88d] to-[#b88a3d] rounded-lg flex items-center px-5 shadow-[inset_0_3px_5px_rgba(0,0,0,0.35)]">
                  <span className="text-[25px] font-mono font-black text-[#051020] tracking-wide">
                    {passNumber || 'PVC-2026-XXXXXX'}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom stub guidelines */}
            <div className="flex flex-col items-center shrink-0">
              <p className="text-[15px] font-extrabold tracking-[0.06em] text-white/50 leading-tight">
                THIS PASS IS NON-TRANSFERABLE
              </p>
              <p className="text-[15px] font-extrabold tracking-[0.06em] text-white/50 leading-tight mt-0.5">
                VALID FOR SINGLE ENTRY ONLY
              </p>
              
              {/* Gold wreath icon / digital pass branding */}
              <div className="flex items-center gap-2 mt-5 pr-3 bg-gradient-to-r from-[#fad88d]/10 to-transparent py-1 px-3 rounded-full border border-[#fad88d]/10">
                <span className="text-[12px] font-sans tracking-[0.1em] text-white/40">DIGITAL ENTRY PASS</span>
                <span className="text-[12px] font-sans text-white/30">|</span>
                <span className="text-[12px] font-sans text-[#fad88d]/80 font-bold uppercase">OFFICIAL</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ======================= BACK SIDE ======================= */}
      {showBack && (
        <section 
          id={`pass-back-${passNumber}`} 
          className="relative shrink-0 overflow-hidden text-white shadow-2xl p-14 flex flex-col justify-between" 
          style={{
            ...cardStyle,
            backgroundColor: '#040d1c',
            backgroundImage: "url('/assets/param-vir-chakra-back.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Semi-transparent overlay behind instructions to ensure 100% legibility */}
          <div className="absolute inset-0 bg-[#030914]/80 pointer-events-none z-0" />
          
          <CinematicBackground />
          <GoldBorderFrame />

          {/* Corner Ornaments */}
          <div className="absolute top-10 left-10 w-12 h-12 border-t-[3px] border-l-[3px] z-10" style={{ borderColor: '#fad88d' }} />
          <div className="absolute top-10 right-10 w-12 h-12 border-t-[3px] border-r-[3px] z-10" style={{ borderColor: '#fad88d' }} />
          <div className="absolute bottom-10 left-10 w-12 h-12 border-b-[3px] border-l-[3px] z-10" style={{ borderColor: '#fad88d' }} />
          <div className="absolute bottom-10 right-10 w-12 h-12 border-b-[3px] border-r-[3px] z-10" style={{ borderColor: '#fad88d' }} />

          {/* Content Container */}
          <div className="w-full h-full flex flex-col justify-between items-center relative z-20">
            
            {/* 1. TOP HEADER SECTION */}
            <div className="w-full flex flex-col items-center">
              <h1 className="font-sans text-[26px] font-extrabold tracking-[0.3em] text-[#fad88d] uppercase text-center leading-tight whitespace-nowrap">
                SHRI VARDHMAN SHWETAMBAR MURTIPUJAK JAIN SANGH
              </h1>
              <div className="w-[160px] h-[1.5px] bg-gradient-to-r from-transparent via-[#fad88d]/30 to-transparent mt-2.5" />
            </div>

            {/* 2. SUB-BANNER: Title Calligraphy centered with subtitle */}
            <div className="w-full flex flex-col items-center mt-1">
              <h2 className="font-display text-[38px] font-bold tracking-normal leading-[1.45] text-[#fad88d] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] text-center py-1 whitespace-nowrap">
                आवश्यक निर्देश
              </h2>
              <p className="text-[14px] font-extrabold tracking-[0.25em] text-white/50 uppercase mt-2 text-center whitespace-nowrap">
                IMPORTANT GUIDELINES FOR YOUR VISIT
              </p>
            </div>
            
            {/* 3. Instructions Grid (100% legible white bold text on dark overlay) */}
            <div className="grid grid-cols-2 gap-x-12 gap-y-6 px-10 my-3 flex-1 w-full items-center">
              {[
                {
                  number: '01',
                  hindi: 'प्रवेश एवं बैठने की व्यवस्था पहले आओ, पहले स्थान पाओ के आधार पर होगी।',
                  english: 'Seating is strictly first-come, first-served.'
                },
                {
                  number: '02',
                  hindi: 'प्रातः 9:00 बजे के पश्चात प्रवेश नहीं दिया जाएगा।',
                  english: 'No entry will be permitted after 09:00 AM.'
                },
                {
                  number: '03',
                  hindi: 'यह पास केवल एक व्यक्ति के लिए मान्य है तथा हस्तांतरणीय नहीं है।',
                  english: 'This pass is valid for one person and is non-transferable.'
                },
                {
                  number: '04',
                  hindi: 'कृपया अपना मोबाइल फोन साइलेंट अथवा स्विच ऑफ रखें।',
                  english: 'Keep your mobile device in silent mode.'
                },
                {
                  number: '05',
                  hindi: 'कार्यक्रम के दौरान अनावश्यक आवागमन न करें।',
                  english: 'Avoid movement inside the auditorium during the program.'
                },
                {
                  number: '06',
                  hindi: 'स्वयंसेवकों एवं आयोजकों के निर्देशों का पालन करना अनिवार्य है।',
                  english: 'Please follow all volunteer and organiser instructions.'
                }
              ].map((item) => (
                <div key={item.number} className="flex min-w-0 gap-6 border-b border-[#fad88d]/15 pb-3 items-start">
                  <span className="font-display text-[38px] font-extrabold text-[#fad88d] drop-shadow-sm shrink-0 leading-none">{item.number}</span>
                  <div className="min-w-0">
                    <p className="font-display text-[21px] font-bold leading-relaxed text-white">{item.hindi}</p>
                    <p className="mt-1.5 text-[21px] text-white/70 font-sans tracking-wide leading-relaxed font-bold">{item.english}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* 4. Bottom courteous request bar */}
            <div className="w-full max-w-[1900px] rounded-lg border border-white/10 bg-[#0e1c33]/80 backdrop-blur-md p-4 text-center mt-1 relative">
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#fad88d]/20 rounded-tl-md" />
              <p className="text-[10px] text-[#fad88d] uppercase tracking-[0.2em] font-sans font-bold">A COURTEOUS REQUEST</p>
              <p className="font-display text-[18px] font-bold text-white mt-1 leading-relaxed">
                कृपया इस डिजिटल पास को कार्यक्रम स्थल पर साथ रखें।
              </p>
            </div>

            {/* Footer branding */}
            <div className="w-full text-center mt-2.5 pt-2 border-t border-white/5">
              <p className="text-[11px] font-sans tracking-[0.2em] text-white/30 uppercase">
                VARDHMAN CREATIVE STUDIO • CREATIVE TECHNOLOGY PARTNER
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
});

PassCard.displayName = 'PassCard';

export default PassCard;