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

  // Landscape card sizing
  const cardStyle = {
    width: '2480px',
    height: '1300px',
    transform: scale !== 1 ? `scale(${scale})` : undefined,
    transformOrigin: 'top left',
    fontFamily: '"Outfit", "Noto Sans Devanagari", sans-serif',
  };

  // Luxury Gradients and Styles
  const outerBorderGrad = "linear-gradient(135deg, #8a5a1f 0%, #f7dfaf 25%, #633f11 50%, #f6dfab 75%, #3d2305 100%)";
  const goldTextGrad = "linear-gradient(to bottom, #ffffff 0%, #fff2d1 20%, #e6be75 55%, #c59b4c 85%, #8a621e 100%)";
  const silverTextGrad = "linear-gradient(to bottom, #ffffff 0%, #f1f3f5 30%, #aab2c0 70%, #5d6778 100%)";

  return (
    <div className={`flex flex-col xl:flex-row gap-8 items-center ${scale !== 1 ? 'overflow-visible' : ''}`}>
      
      {/* ================================= FRONT SIDE (LANDSCAPE 2480x1300) ================================= */}
      <div 
        id={`pass-front-${passNumber}`}
        className="relative text-white flex flex-col items-center justify-between p-14 overflow-hidden select-none shrink-0"
        style={{
          ...cardStyle,
          backgroundImage: "url('/assets/param-vir-chakra-hero.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: '#040812'
        }}
      >
        {/* Soft Premium Vignette & Backdrop Filter Overlay to blend the background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#040812]/95 via-[#040812]/80 to-[#040812]/95 pointer-events-none z-0" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(110,60,30,0.15)_0%,transparent_75%)] pointer-events-none z-0" />
        
        {/* Luxury Gold/Bronze Border Frame (Government Style) */}
        <div 
          className="absolute inset-8 pointer-events-none z-10 border-[8px]"
          style={{ borderImage: `${outerBorderGrad} 1` }}
        />
        
        {/* Inner thin frame */}
        <div 
          className="absolute inset-12 pointer-events-none z-10 border border-opacity-30" 
          style={{ borderColor: 'rgba(247,223,175,0.2)' }}
        />

        {/* Ornate Corner Accents */}
        <div className="absolute top-11 left-11 w-16 h-16 border-t-[4px] border-l-[4px] z-10" style={{ borderColor: '#f7dfaf' }} />
        <div className="absolute top-11 right-11 w-16 h-16 border-t-[4px] border-r-[4px] z-10" style={{ borderColor: '#f7dfaf' }} />
        <div className="absolute bottom-11 left-11 w-16 h-16 border-b-[4px] border-l-[4px] z-10" style={{ borderColor: '#f7dfaf' }} />
        <div className="absolute bottom-11 right-11 w-16 h-16 border-b-[4px] border-r-[4px] z-10" style={{ borderColor: '#f7dfaf' }} />

        {/* Front Content Container */}
        <div className="w-full h-full flex flex-col justify-between items-center relative z-20">
          
          {/* 1. TOP HEADER SECTION */}
          <div className="w-full flex flex-col items-center">
            <h1 className="font-serif text-[32px] tracking-[0.2em] font-semibold text-[#e6be75] uppercase text-center leading-tight">
              श्री वर्धमान श्वेतांबर मूर्तिपूजक जैन संघ
            </h1>
            <p className="font-sans text-[18px] tracking-[0.35em] text-[#fffae8]/70 uppercase mt-2 text-center">
              उस्मानपुरा, अहमदाबाद द्वारा आयोजित
            </p>
            {/* Elegant Divider */}
            <div className="w-[600px] h-[1px] bg-gradient-to-r from-transparent via-[#e6be75]/30 to-transparent mt-4" />
          </div>

          {/* 2. MIDDLE BANNER SECTION: Medal + Title Calligraphy */}
          <div className="w-full flex items-center justify-center gap-12 my-2">
            {/* PVC Medal Container */}
            <div className="relative shrink-0 flex items-center justify-center">
              <div className="absolute w-56 h-56 rounded-full bg-orange-600/5 blur-3xl pointer-events-none" />
              <PvcMedalSvg className="h-[260px] w-[260px]" />
            </div>

            {/* Custom Calligraphy Text Title */}
            <div className="flex flex-col text-left">
              <h2 
                className="font-serif text-[96px] font-extrabold tracking-[0.08em] leading-none select-none"
                style={{
                  background: goldTextGrad,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: 'drop-shadow(2px 4px 4px rgba(0,0,0,0.8)) drop-shadow(0px 8px 16px rgba(0,0,0,0.4))',
                }}
              >
                परमवीर चक्र
              </h2>
              <div className="flex items-center gap-6 mt-2">
                <div className="h-[2px] w-24 bg-gradient-to-r from-[#e6be75]/60 to-transparent" />
                <h3 
                  className="font-serif text-[52px] font-bold tracking-[0.25em] leading-none uppercase"
                  style={{
                    background: silverTextGrad,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    filter: 'drop-shadow(2px 3px 3px rgba(0,0,0,0.8))',
                  }}
                >
                  — शौर्यगाथा —
                </h3>
                <div className="h-[2px] w-24 bg-gradient-to-l from-[#e6be75]/60 to-transparent" />
              </div>
            </div>
          </div>

          {/* 3. COLUMNS CONTENT SECTION (TWO-COLUMN GRID Layout) */}
          <div className="w-full grid grid-cols-12 gap-8 px-12 items-start my-2">
            
            {/* COLUMN LEFT: Speakers, Blessings, Inspiration */}
            <div className="col-span-6 flex flex-col gap-6 text-left border-r border-[#e6be75]/15 pr-8 h-[400px] justify-between">
              
              {/* Blessings (आशीर्वाद) */}
              <div>
                <p className="text-[14px] uppercase tracking-[0.2em] text-[#e6be75] font-bold font-accent">आशीर्वाद (Blessings)</p>
                <p className="text-[16px] font-sans text-white/50 mt-1">गच्छाधिपति परम पूज्य आचार्यदेव</p>
                <p className="text-[22px] font-serif font-bold text-[#fffae8] mt-0.5">
                  श्री नरदेवसागरसूरीश्वरजी महाराज
                </p>
              </div>

              {/* Inspiration (प्रेरणा) */}
              <div>
                <p className="text-[14px] uppercase tracking-[0.2em] text-[#e6be75] font-bold font-accent">प्रेरणा (Inspiration)</p>
                <p className="text-[15px] font-sans text-white/50 mt-1">
                  परम पूज्य आचार्यदेव श्री जिन-हेमचंद्रसागरसूरिजी महाराज के शिष्यरत्न
                </p>
                <p className="text-[20px] font-serif font-bold text-[#fffae8] mt-1">
                  परम पूज्य आचार्यदेव श्री सम्यकचंद्रसागरसूरिजी महाराज
                </p>
                <p className="text-[15px] font-sans text-white/40 my-1 text-center max-w-[200px]">तथा</p>
                <p className="text-[20px] font-serif font-bold text-[#fffae8]">
                  परम पूज्य आचार्यदेव श्री तारकचंद्रसागरसूरिजी महाराज
                </p>
              </div>

              {/* Speaker Details */}
              <div>
                <p className="text-[14px] uppercase tracking-[0.2em] text-[#e6be75] font-bold font-accent">मुख्य वक्ता (Main Speakers)</p>
                <p className="text-[24px] font-serif font-bold text-white mt-1">श्री हर्षल पुष्कर्णा</p>
                <p className="text-[14px] font-sans text-white/50 mt-0.5">प्रख्यात लेखक, पत्रकार एवं वक्ता (विश्व रिकॉर्ड धारक)</p>
                <p className="text-[22px] font-serif font-bold text-white mt-2">पूज्य मुनि श्री श्रमणचंद्रसागरजी महाराज</p>
              </div>

            </div>

            {/* COLUMN RIGHT: Special Presence, Book Launch, Event Details */}
            <div className="col-span-6 flex flex-col gap-6 text-left pl-4 h-[400px] justify-between">
              
              {/* Special Presence (शास्त्रज्ञ) */}
              <div>
                <p className="text-[14px] uppercase tracking-[0.2em] text-[#e6be75] font-bold font-accent">शास्त्रज्ञ (Special Presence)</p>
                <p className="text-[22px] font-serif font-bold text-[#fffae8] mt-1">
                  पूज्य मुनि श्री अर्हमचंद्रसागरजी महाराज
                </p>
              </div>

              {/* Book Launch */}
              <div>
                <p className="text-[14px] uppercase tracking-[0.2em] text-[#e6be75] font-bold font-accent">भव्य विमोचन (Book Launch)</p>
                <p className="text-[26px] font-serif font-extrabold text-[#ff9933] mt-1 tracking-wide">
                  "आर्यावर्त का गौरव"
                </p>
                <p className="text-[15px] font-sans text-white/60 mt-0.5">ऐतिहासिक साहित्यिक महाकृति का भव्य विमोचन</p>
              </div>

              {/* Event Details */}
              <div>
                <p className="text-[14px] uppercase tracking-[0.2em] text-[#e6be75] font-bold font-accent">कार्यक्रम विवरण (Event Details)</p>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <p className="text-[18px] font-serif font-bold text-white">09 अगस्त 2026</p>
                    <p className="text-[14px] font-sans text-[#ff9933]/90 mt-0.5">रविवार (Sunday)</p>
                  </div>
                  <div>
                    <p className="text-[18px] font-serif font-bold text-white">प्रातः 9:00 बजे</p>
                    <p className="text-[14px] font-sans text-white/60 mt-0.5">Reporting Time</p>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-[20px] font-serif font-bold text-[#f7dfaf]">दिनेश हॉल (Dinesh Hall)</p>
                  <p className="text-[14px] font-sans text-white/50">नवरंगपुरा, अहमदाबाद (Ahmedabad)</p>
                </div>
              </div>

            </div>

          </div>

          {/* 4. BOTTOM PANEL: Dynamic details inside golden bronze plaque */}
          <div 
            className="w-full rounded-2xl border border-[#8a5a1f]/40 bg-gradient-to-r from-[#170e05] via-[#2f1f0a] to-[#170e05] p-6 mt-4 flex items-center justify-between shadow-2xl relative"
            style={{ boxShadow: '0 20px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)' }}
          >
            <div className="absolute inset-0.5 rounded-[14px] border border-white/5 pointer-events-none" />
            
            {/* Organizer details */}
            <div className="text-left border-r border-[#8a5a1f]/30 pr-6 shrink-0">
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#e6be75]/80 font-bold">आयोजक (Organiser)</p>
              <p className="text-[16px] font-serif font-semibold text-[#fffae8] mt-1 max-w-[320px]">
                श्री वर्धमान श्वेतांबर मूर्तिपूजक जैन संघ
              </p>
              <p className="text-[13px] font-sans text-white/50">उस्मानपुरा, अहमदाबाद</p>
            </div>

            {/* Dynamic Panel Grid */}
            <div className="flex-1 grid grid-cols-4 gap-4 px-6 text-left">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">Participant Name</p>
                <p className="text-[20px] font-serif font-bold text-white mt-1 truncate max-w-[200px]">
                  {name || 'Guest Participant'}
                </p>
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">Mobile (WhatsApp)</p>
                <p className="text-[18px] font-sans font-medium text-white/90 mt-1">
                  {formattedMobile || 'XXXXXX----'}
                </p>
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">City</p>
                <p className="text-[18px] font-sans font-medium text-white/90 mt-1 truncate max-w-[150px]">
                  {city || 'Ahmedabad'}
                </p>
              </div>

              <div className="text-right pr-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">Pass Number</p>
                <p className="text-[22px] font-mono font-bold text-[#fffae8] mt-1">
                  {passNumber || 'PVC-2026-XXXXXX'}
                </p>
              </div>
            </div>
            
            {/* Stamp Style Watermark */}
            <div className="shrink-0 flex flex-col items-center justify-center border-2 border-dashed border-[#e6be75]/20 rounded-xl px-4 py-2 rotate-[-5deg]">
              <span className="text-[10px] font-mono font-bold text-[#e6be75]/40 tracking-widest uppercase">Verified Pass</span>
              <span className="text-[13px] font-serif font-bold text-[#ff9933]/60 mt-0.5">2026 Event</span>
            </div>
          </div>

        </div>
      </div>

      {/* ================================= BACK SIDE (LANDSCAPE 2480x1300) ================================= */}
      <div 
        id={`pass-back-${passNumber}`}
        className="relative text-white flex flex-col items-center justify-between p-14 overflow-hidden select-none shrink-0"
        style={{
          ...cardStyle,
          backgroundImage: "url('/assets/param-vir-chakra-hero.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: '#040812'
        }}
      >
        {/* Soft Background Blend Overlays */}
        <div className="absolute inset-0 bg-[#040812]/95 pointer-events-none z-0" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(60,30,90,0.15)_0%,transparent_75%)] pointer-events-none z-0" />

        {/* Luxury Gold/Bronze Border Frame */}
        <div 
          className="absolute inset-8 pointer-events-none z-10 border-[8px]"
          style={{ borderImage: `${outerBorderGrad} 1` }}
        />
        
        {/* Inner thin frame */}
        <div 
          className="absolute inset-12 pointer-events-none z-10 border border-opacity-30" 
          style={{ borderColor: 'rgba(247,223,175,0.2)' }}
        />

        {/* Ornate Corners */}
        <div className="absolute top-11 left-11 w-16 h-16 border-t-[4px] border-l-[4px] z-10" style={{ borderColor: '#f7dfaf' }} />
        <div className="absolute top-11 right-11 w-16 h-16 border-t-[4px] border-r-[4px] z-10" style={{ borderColor: '#f7dfaf' }} />
        <div className="absolute bottom-11 left-11 w-16 h-16 border-b-[4px] border-l-[4px] z-10" style={{ borderColor: '#f7dfaf' }} />
        <div className="absolute bottom-11 right-11 w-16 h-16 border-b-[4px] border-r-[4px] z-10" style={{ borderColor: '#f7dfaf' }} />

        {/* Back Content Container */}
        <div className="w-full h-full flex flex-col justify-between items-center relative z-20">
          
          {/* Header Title Calligraphy */}
          <div className="text-center flex flex-col items-center">
            <h2 
              className="font-serif text-[48px] font-bold tracking-[0.15em] text-[#e6be75]"
              style={{
                background: goldTextGrad,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(2px 3px 3px rgba(0,0,0,0.8))',
              }}
            >
              आवश्यक सूचनाएँ
            </h2>
            <p className="text-[14px] uppercase tracking-[0.3em] text-white/40 mt-1">Important Entry Instructions</p>
            <div className="w-56 h-[1.5px] bg-gradient-to-r from-transparent via-[#e6be75]/30 to-transparent mt-4" />
          </div>

          {/* Guidelines Matrix List (Two columns of items) */}
          <div className="w-full max-w-[1800px] grid grid-cols-2 gap-x-12 gap-y-6 px-12 my-6">
            
            {/* LEFT COLUMN: Points 1 to 3 */}
            <div className="flex flex-col gap-6">
              {[
                { hi: "प्रवेश एवं बैठने की व्यवस्था \"प्रथम आओ, प्रथम स्थान पाओ\" (First Come, First Seat) के आधार पर होगी।", en: "Seating inside the hall is strictly on a first-come, first-served basis. Please arrive early." },
                { hi: "प्रातः 9:00 बजे के पश्चात किसी भी परिस्थिति में प्रवेश नहीं दिया जाएगा।", en: "Gate check-in closes strictly at 09:00 AM. Late entry will not be permitted under any circumstances." },
                { hi: "यह पास केवल एक व्यक्ति के लिए मान्य है तथा हस्तांतरणीय (Non-Transferable) नहीं है।", en: "This entry pass is valid for one registered individual only and is non-transferable." }
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e6be75]/10 border border-[#e6be75]/30 text-[#e6be75] text-[18px] font-bold mt-1 font-mono">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="text-[22px] font-serif font-semibold text-white/95 leading-snug">
                      {item.hi}
                    </p>
                    <p className="text-[13px] font-sans text-white/45 tracking-wide mt-1.5">
                      {item.en}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* RIGHT COLUMN: Points 4 to 6 */}
            <div className="flex flex-col gap-6">
              {[
                { hi: "कृपया अपना मोबाइल फोन साइलेंट अथवा स्विच ऑफ रखें।", en: "Kindly switch off or silent your mobile phone devices during the complete schedule of the program." },
                { hi: "कार्यक्रम के दौरान अनावश्यक आवागमन से बचें।", en: "Kindly avoid moving inside the auditorium during presentations and speaker addresses." },
                { hi: "आयोजकों एवं स्वयंसेवकों के निर्देशों का पालन करना अनिवार्य है।", en: "It is mandatory to adhere strictly to all directives issued by the volunteers and organizing team." }
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e6be75]/10 border border-[#e6be75]/30 text-[#e6be75] text-[18px] font-bold mt-1 font-mono">
                    {idx + 4}
                  </span>
                  <div>
                    <p className="text-[22px] font-serif font-semibold text-white/95 leading-snug">
                      {item.hi}
                    </p>
                    <p className="text-[13px] font-sans text-white/45 tracking-wide mt-1.5">
                      {item.en}
                    </p>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Bottom Memento Souvenir Card Box */}
          <div 
            className="w-full max-w-[1600px] rounded-2xl border border-[#8a5a1f]/30 bg-gradient-to-r from-[#170e05] via-[#241707] to-[#170e05] p-6 text-center"
            style={{ boxShadow: '0 15px 30px rgba(0,0,0,0.5)' }}
          >
            <p className="font-serif text-[24px] font-bold text-[#e6be75] tracking-[0.1em]">
              * स्मरणीय अनुरोध (souvenir Note) *
            </p>
            <p className="text-[18px] font-serif text-[#fffae8]/90 leading-relaxed mt-2.5">
              इस ऐतिहासिक क्षण की मधुर स्मृति के रूप में इस पास को अपने पास सुरक्षित रखें।
            </p>
            <p className="text-[12px] font-sans text-white/35 mt-1">
              Please preserve this pass as a souvenir of this historic event celebrating the national heroes of India.
            </p>
          </div>

          {/* Souvenir Footer */}
          <div className="flex items-center justify-between w-full px-6 border-t border-white/5 pt-4 mt-4 text-[13px] text-white/30 font-mono">
            <span>Organised by Shri Vardhman Shwetambar Murtipujak Jain Sangh</span>
            <span>PVC-SG-2026-TICKET-BACK</span>
          </div>

        </div>
      </div>
    </div>
  );
}
