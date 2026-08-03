import React, { memo } from 'react';

const PassCard = memo(({
  name = '',
  mobile = '',
  city = '',
  passNumber = '',
  scale = 1,
  activeSide = 'both',
}) => {
  const formatMobile = (value) => {
    const digits = String(value || '').replace(/\D/g, '');
    return digits.length > 4 ? `XXXXXX${digits.slice(-4)}` : digits;
  };

  const showFront = activeSide === 'both' || activeSide === 'front';
  const showBack = activeSide === 'both' || activeSide === 'back';

  // 210 x 110 mm @ 300 DPI = 2480 x 1300 pixels
  const cardStyle = {
    width: '2480px',
    height: '1300px',
    transform: scale !== 1 ? `scale(${scale})` : undefined,
    transformOrigin: 'top left',
    background: 'linear-gradient(135deg, #05101a 0%, #000000 100%)',
    boxSizing: 'border-box',
  };

  // Flowing Premium Tricolour Ambient Lighting
  const CinematicBackground = () => (
    <>
      <div className="absolute inset-0 opacity-[0.035] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100\' height=\'100\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />
      <div className="absolute -top-[20%] -left-[10%] h-[1000px] w-[1400px] rounded-full bg-[#ff9933] opacity-[0.08] blur-[160px] mix-blend-screen pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 h-[800px] w-[1800px] -translate-x-1/2 -translate-y-1/2 transform -rotate-12 bg-white opacity-[0.04] blur-[150px] mix-blend-screen pointer-events-none" />
      <div className="absolute -bottom-[20%] -right-[10%] h-[1000px] w-[1400px] rounded-full bg-[#138808] opacity-[0.08] blur-[160px] mix-blend-screen pointer-events-none" />
    </>
  );

  const AshokaWatermark = () => (
    <svg className="absolute left-1/2 top-1/2 h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2 text-[#d5ad5b] opacity-[0.035]" viewBox="0 0 200 200" fill="none" aria-hidden="true">
      <circle cx="100" cy="100" r="75" stroke="currentColor" strokeWidth="3" />
      <circle cx="100" cy="100" r="10" fill="currentColor" />
      {Array.from({ length: 24 }, (_, index) => (
        <path key={index} d="M100 25V88" stroke="currentColor" strokeWidth="2" transform={`rotate(${index * 15} 100 100)`} />
      ))}
    </svg>
  );

  const LuxuryFrame = () => (
    <>
      <div className="absolute inset-[35px] border-[2px] border-[#d5ad5b]/40 pointer-events-none" />
      <div className="absolute inset-[48px] border border-[#d5ad5b]/15 pointer-events-none" />
      <div className="absolute top-[30px] left-[30px] h-14 w-14 border-l-[4px] border-t-[4px] border-[#d5ad5b] pointer-events-none" />
      <div className="absolute top-[30px] right-[30px] h-14 w-14 border-r-[4px] border-t-[4px] border-[#d5ad5b] pointer-events-none" />
      <div className="absolute bottom-[30px] left-[30px] h-14 w-14 border-b-[4px] border-l-[4px] border-[#d5ad5b] pointer-events-none" />
      <div className="absolute bottom-[30px] right-[30px] h-14 w-14 border-b-[4px] border-r-[4px] border-[#d5ad5b] pointer-events-none" />
    </>
  );

  return (
    <div className={`flex flex-col items-center gap-16 ${scale !== 1 ? 'overflow-visible' : ''}`}>
      
      {/* ======================= FRONT SIDE ======================= */}
      {showFront && (
        <section id={`pass-front-${passNumber}`} className="relative shrink-0 overflow-hidden text-white shadow-2xl" style={cardStyle}>
          <CinematicBackground />
          <AshokaWatermark />
          <LuxuryFrame />

          {/* FIX: Using strict Flexbox with fixed % widths so nothing gets pushed out */}
          <div className="relative z-10 flex h-full w-full justify-between gap-6 px-[60px] py-[65px]">
            
            {/* LEFT COLUMN: Visual Hero & Titles (30% Width) */}
            <div className="flex w-[30%] shrink-0 flex-col items-center justify-center border-r border-[#d5ad5b]/20 pr-6 text-center">
              <div className="relative flex h-[280px] w-[280px] items-center justify-center rounded-full bg-gradient-to-tr from-[#0a1118] to-[#1a2333] shadow-[0_20px_40px_rgba(0,0,0,0.8)] border border-[#d5ad5b]/30">
                <img 
                  src="/assets/PVC.png" 
                  className="h-[220px] w-[220px] object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.9)]" 
                  alt="Param Vir Chakra Medal" 
                />
              </div>
              
              <div className="mt-8 flex flex-col items-center">
                <h1 className="font-serif text-[84px] font-extrabold leading-tight text-transparent bg-clip-text bg-gradient-to-b from-[#ffedba] via-[#d4af37] to-[#aa7c11] drop-shadow-[0_4px_6px_rgba(0,0,0,0.6)]">
                  परमवीर चक्र
                </h1>
                
                <div className="mt-3 flex items-center gap-5">
                  <div className="h-[2px] w-10 bg-gradient-to-r from-transparent to-[#d5ad5b]" />
                  <h2 className="font-serif text-[38px] font-bold tracking-[0.2em] text-[#f4db9c] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    शौर्यगाथा
                  </h2>
                  <div className="h-[2px] w-10 bg-gradient-to-l from-transparent to-[#d5ad5b]" />
                </div>

                <h3 className="mt-5 font-serif text-[34px] font-bold italic tracking-wide text-[#e8e4c9]">
                  "आर्यावर्त का गौरव"
                </h3>
                <p className="mt-3 text-[16px] font-bold tracking-[0.4em] uppercase text-[#d5ad5b]/80">
                  Historic Literary Masterpiece
                </p>
              </div>
            </div>

            {/* CENTER COLUMN: Information Panels (48% Width) */}
            <div className="flex w-[48%] shrink-0 flex-col justify-center gap-6 py-2 px-2">
              <div className="text-center">
                <p className="text-[15px] font-bold tracking-[0.3em] text-[#d5ad5b] uppercase">Organised By</p>
                <p className="mt-2 font-serif text-[28px] font-bold text-white tracking-wide">
                  श्री वर्धमान श्वेतांबर मूर्तिपूजक जैन संघ
                </p>
              </div>

              {/* Compact Premium Guruji Panel */}
              <div className="mt-5 flex flex-col items-center rounded-xl border border-[#d5ad5b]/25 bg-white/[0.02] p-6 backdrop-blur-sm text-center">
                <div className="w-full">
                  <p className="text-[13px] font-bold tracking-[0.3em] text-[#d5ad5b]">प्रेरणा</p>
                  <p className="mt-2 font-serif text-[20px] font-semibold text-white/90">
                    परम पूज्य आचार्यदेव श्री जिन-हेमचंद्रसागरसूरिजी महाराज के शिष्यरत्न
                  </p>
                  <div className="mt-2.5 flex flex-col items-center justify-center font-serif text-[22px] font-bold text-[#f4db9c] leading-tight">
                    <span>परम पूज्य आचार्यदेव श्री सम्यकचंद्रसागरसूरिजी महाराज</span>
                    <span className="text-[15px] text-[#d5ad5b]/80 my-0.5 font-sans tracking-wide">तथा</span>
                    <span>परम पूज्य आचार्यदेव श्री तारकचंद्रसागरसूरिजी महाराज</span>
                  </div>
                </div>

                <div className="my-5 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-[#d5ad5b]/40 to-transparent" />
                
                <div className="w-full">
                  <p className="text-[13px] font-bold tracking-[0.3em] text-[#d5ad5b]">शास्त्रज्ञ</p>
                  <p className="mt-1 font-serif text-[24px] font-bold text-[#f4db9c]">पूज्य मुनि श्री अर्हमचंद्रसागरजी महाराज</p>
                </div>
              </div>

              {/* Main Speaker Premium Card */}
              <div className="mt-5 rounded-xl border border-[#d5ad5b]/40 bg-gradient-to-b from-[#1a2333]/80 to-[#0a1118]/80 p-5 text-center shadow-lg">
                <p className="text-[13px] font-bold tracking-[0.3em] text-[#d5ad5b]">मुख्य वक्ता</p>
                <div className="mt-3 flex items-center justify-center gap-6">
                  <div className="flex-1">
                     <p className="font-serif text-[26px] font-bold text-white">श्री हर्षल पुष्कर्णा</p>
                     <p className="mt-1 text-[14px] text-white/60 tracking-widest">प्रख्यात लेखक · पत्रकार · वक्ता</p>
                  </div>
                  <div className="w-[1px] h-14 bg-[#d5ad5b]/30" />
                  <div className="flex-1">
                     <p className="font-serif text-[24px] font-bold text-white leading-snug">पूज्य मुनि श्री श्रमणचंद्रसागरजी महाराज</p>
                     <p className="mt-1 text-[14px] text-white/60 tracking-widest">विश्व रिकॉर्ड धारक</p>
                  </div>
                </div>
              </div>

              {/* Luxury Event Chips - Safe Margins */}
              <div className="mt-5 flex justify-center gap-5">
                <div className="rounded-full border border-[#d5ad5b]/30 bg-black/40 px-6 py-3.5 text-center shadow-md">
                  <p className="text-[20px] font-serif font-extrabold text-[#f4db9c]">09 अगस्त 2026 (रविवार)</p>
                </div>
                <div className="rounded-full border border-[#d5ad5b]/30 bg-black/40 px-6 py-3.5 text-center shadow-md">
                  <p className="text-[20px] font-serif font-extrabold text-[#f4db9c]">प्रातः 9:00 बजे</p>
                </div>
                <div className="rounded-full border border-[#d5ad5b]/30 bg-black/40 px-6 py-3.5 text-center shadow-md">
                  <p className="text-[20px] font-serif font-extrabold text-[#f4db9c]">दिनेश हॉल, अहमदाबाद</p>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Participant ID Card (22% Width) */}
            <div className="flex w-[22%] shrink-0 flex-col items-center justify-center border-l border-[#d5ad5b]/20 pl-6">
              <div className="w-full overflow-hidden rounded-xl border border-[#d5ad5b]/50 bg-gradient-to-b from-[#0e1726] to-[#040a12] shadow-[0_20px_40px_rgba(0,0,0,0.7)]">
                {/* ID Header */}
                <div className="border-b border-[#d5ad5b]/30 bg-[#d5ad5b]/10 py-4.5 text-center">
                  <p className="text-[17px] font-bold tracking-[0.08em] text-[#d5ad5b] uppercase">ONLINE ENTRY PASS</p>
                </div>
                
                {/* ID Body */}
                <div className="flex flex-col gap-6 p-6">
                  <div className="overflow-hidden">
                    <p className="text-[13px] font-bold tracking-[0.15em] text-[#8495a8] uppercase">Participant Name</p>
                    <p className="mt-1 font-serif text-[28px] font-bold leading-tight text-white truncate">
                      {name || 'Guest Participant'}
                    </p>
                  </div>
                  
                  <div className="overflow-hidden">
                    <p className="text-[13px] font-bold tracking-[0.15em] text-[#8495a8] uppercase">Registered Mobile</p>
                    <p className="mt-1 font-mono text-[22px] font-semibold text-white truncate">
                      {formatMobile(mobile) || 'XXXXXX----'}
                    </p>
                  </div>

                  
                  <div className="rounded-lg border border-[#d5ad5b]/30 bg-black/40 p-3 text-center mt-1">
                    <p className="text-[13px] font-bold tracking-[0.15em] text-[#8495a8] uppercase">Official Pass Number</p>
                    <p className="mt-1 font-mono text-[24px] font-bold text-[#f4db9c] truncate">
                      {passNumber || 'PVC-2026-XXXXXX'}
                    </p>
                  </div>
                  
                  {/* Verified Badge */}
                  <div className="mt-1 flex items-center justify-center gap-2 rounded bg-[#138808]/15 py-2.5 border border-[#138808]/30">
                    <svg className="h-5 w-5 text-[#138808]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <p className="text-[14px] font-bold tracking-[0.2em] text-[#138808]">VERIFIED</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Minimalist Footer */}
          <div className="absolute bottom-8 inset-x-0 text-center">
            <p className="text-[12px] font-medium tracking-[0.25em] text-[#8495a8]">
              Designed & Developed by <span className="text-[#d5ad5b]">Vardhman Creative Studio®</span> · Creative Technology Partner · www.vardhmancreativestudio.com
            </p>
          </div>
        </section>
      )}

      {/* ======================= BACK SIDE ======================= */}
      {showBack && (
        <section id={`pass-back-${passNumber}`} className="relative shrink-0 overflow-hidden text-white shadow-2xl" style={cardStyle}>
          <CinematicBackground />
          <AshokaWatermark />
          <LuxuryFrame />

          <div className="relative z-10 flex h-full flex-col px-[140px] py-[120px]">
            {/* Header */}
            <div className="text-center">
              <p className="text-[18px] font-bold tracking-[0.4em] text-[#d5ad5b] uppercase">Official Guidelines</p>
              <h1 className="mt-4 font-serif text-[68px] font-bold tracking-[0.05em] text-white drop-shadow-md">आवश्यक निर्देश</h1>
              <div className="mx-auto mt-5 h-[2px] w-[260px] bg-gradient-to-r from-transparent via-[#d5ad5b] to-transparent" />
            </div>
            
            {/* Instructions Grid */}
            <div className="mt-16 grid flex-1 grid-cols-2 gap-x-24 gap-y-12 px-10">
              {[
                ['01', 'प्रवेश एवं बैठने की व्यवस्था पहले आओ, पहले स्थान पाओ के आधार पर होगी।', 'Seating is strictly first-come, first-served based on arrival.'],
                ['02', 'प्रातः 9:00 बजे के पश्चात सभागार में प्रवेश वर्जित रहेगा।', 'No entry will be permitted inside the auditorium after 09:00 AM.'],
                ['03', 'यह आधिकारिक पास केवल एक व्यक्ति के लिए मान्य है तथा पूर्णतः अहस्तांतरणीय है।', 'This official pass is valid for one person only and is strictly non-transferable.'],
                ['04', 'कार्यक्रम की गरिमा बनाए रखने हेतु कृपया अपना मोबाइल फोन साइलेंट रखें।', 'Kindly keep your mobile device on silent mode to maintain decorum.'],
                ['05', 'समारोह के दौरान अनावश्यक आवागमन से बचें।', 'Avoid any unnecessary movement inside the auditorium during the program.'],
                ['06', 'आयोजकों एवं सुरक्षा स्वयंसेवकों के निर्देशों का पालन करना अनिवार्य है।', 'Compliance with instructions from organisers and security volunteers is mandatory.'],
              ].map(([number, hindi, english]) => (
                <div key={number} className="flex min-w-0 gap-6 border-b border-[#d5ad5b]/20 pb-6">
                  <span className="font-serif text-[40px] font-extrabold text-[#d5ad5b] drop-shadow-sm shrink-0">{number}</span>
                  <div className="mt-1 min-w-0">
                    <p className="font-serif text-[24px] font-semibold leading-snug text-white/95">{hindi}</p>
                    <p className="mt-2 text-[15px] text-[#8495a8]">{english}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="absolute bottom-10 inset-x-0 text-center">
              <p className="text-[13px] font-medium tracking-[0.25em] text-[#8495a8] uppercase">
                Vardhman Creative Studio® · Heritage Digital Pass
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