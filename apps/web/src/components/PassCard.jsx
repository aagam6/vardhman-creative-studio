import React from 'react';
import PvcMedalSvg from './PvcMedalSvg.jsx';

export default function PassCard({ name = "", mobile = "", city = "", passNumber = "", scale = 1, previewMode = false }) {
  // Format mobile to show only last 4 digits
  const formatMobile = (mob) => {
    if (!mob) return '';
    const clean = mob.toString().replace(/\D/g, '');
    if (clean.length <= 4) return clean;
    return `XXXXXX${clean.slice(-4)}`;
  };

  const formattedMobile = formatMobile(mobile);

  // Styling dimensions
  const cardStyle = {
    width: '1080px',
    height: '1920px',
    transform: scale !== 1 ? `scale(${scale})` : undefined,
    transformOrigin: 'top left',
  };

  // Border/frame styling
  const outerBorderGrad = "linear-gradient(135deg, #a37636 0%, #e7c27d 25%, #8c5d26 50%, #f6dfab 75%, #5d3910 100%)";
  const goldTextGrad = "linear-gradient(135deg, #ffffff 0%, #f5d493 30%, #cca353 70%, #f3d18c 100%)";

  return (
    <div className={`flex flex-col md:flex-row gap-8 items-center ${scale !== 1 ? 'overflow-visible' : ''}`}>
      {/* ================================= FRONT SIDE ================================= */}
      <div 
        id={`pass-front-${passNumber}`}
        className="relative bg-[#040810] text-white flex flex-col items-center justify-between p-12 overflow-hidden select-none shrink-0"
        style={cardStyle}
      >
        {/* Soft Background Radial Light */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(110,60,30,0.15)_0%,transparent_70%)] pointer-events-none z-0" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(60,30,90,0.12)_0%,transparent_60%)] pointer-events-none z-0" />
        
        {/* Subtle Background Texture Overlay */}
        <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0" />
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none z-0" />

        {/* Outer Premium Border Frame */}
        <div 
          className="absolute inset-6 pointer-events-none z-10 border-[6px]"
          style={{ borderImage: `${outerBorderGrad} 1` }}
        />
        
        {/* Inner thin border frame */}
        <div 
          className="absolute inset-9 pointer-events-none z-10 border border-opacity-30" 
          style={{ borderColor: 'rgba(231,194,125,0.25)' }}
        />

        {/* Diagonal Corner Ornaments */}
        <div className="absolute top-8 left-8 w-12 h-12 border-t-[3px] border-l-[3px] z-10" style={{ borderColor: '#e7c27d' }} />
        <div className="absolute top-8 right-8 w-12 h-12 border-t-[3px] border-r-[3px] z-10" style={{ borderColor: '#e7c27d' }} />
        <div className="absolute bottom-8 left-8 w-12 h-12 border-b-[3px] border-l-[3px] z-10" style={{ borderColor: '#e7c27d' }} />
        <div className="absolute bottom-8 right-8 w-12 h-12 border-b-[3px] border-r-[3px] z-10" style={{ borderColor: '#e7c27d' }} />

        {/* Content Container */}
        <div className="w-full h-full flex flex-col justify-between items-center text-center relative z-20 pt-8 pb-8 px-6">
          {/* Header */}
          <div className="flex flex-col items-center">
            <p className="font-serif text-[22px] tracking-[0.15em] font-semibold text-[#e7c27d] uppercase">
              श्री वर्धमान श्वेतांबर मूर्तिपूजक जैन संघ
            </p>
            <p className="font-sans text-[15px] tracking-[0.25em] text-white/60 uppercase mt-2">
              उस्मानपुरा, अहमदाबाद
            </p>
            
            {/* Divider */}
            <div className="w-48 h-[1px] bg-gradient-to-r from-transparent via-[#e7c27d]/40 to-transparent mt-5" />
          </div>

          {/* Medal Logo Space */}
          <div className="my-2 relative flex items-center justify-center">
            <div className="absolute w-44 h-44 rounded-full bg-orange-600/5 blur-2xl pointer-events-none" />
            <PvcMedalSvg className="h-[270px] w-[270px]" />
          </div>

          {/* Event Title */}
          <div className="flex flex-col items-center">
            <h2 className="font-serif text-[56px] font-extrabold tracking-[0.08em] uppercase text-gradient leading-tight">
              परमवीर चक्र
            </h2>
            <h3 className="font-serif text-[38px] font-bold tracking-[0.2em] text-[#e7c27d] uppercase mt-2">
              शौर्यगाथा
            </h3>
            <p className="text-[14px] uppercase tracking-[0.35em] text-white/50 mt-4">
              Collector's Invitation Pass
            </p>
          </div>

          {/* Dynamic Registration details block */}
          <div 
            className="w-full max-w-[800px] rounded-2xl bg-[#081224]/80 border border-[#e7c27d]/20 p-8 my-4 backdrop-blur-md relative"
            style={{ boxShadow: '0 15px 35px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)' }}
          >
            {/* Soft inner glow border */}
            <div className="absolute inset-0.5 rounded-[14px] border border-white/5 pointer-events-none" />
            
            <div className="grid grid-cols-2 gap-y-6 gap-x-4 text-left">
              <div>
                <p className="text-[12px] uppercase tracking-[0.2em] text-white/40">Participant Name</p>
                <p className="text-[28px] font-serif font-bold text-white tracking-wide mt-1 truncate">
                  {name || 'Guest Participant'}
                </p>
              </div>
              
              <div className="text-right">
                <p className="text-[12px] uppercase tracking-[0.2em] text-white/40">Pass Number</p>
                <p className="text-[28px] font-mono font-bold text-[#e7c27d] tracking-wider mt-1">
                  {passNumber || 'PVC-2026-XXXXXX'}
                </p>
              </div>

              <div>
                <p className="text-[12px] uppercase tracking-[0.2em] text-white/40">WhatsApp Number</p>
                <p className="text-[24px] font-sans font-medium text-white/90 mt-1">
                  {formattedMobile || 'XXXXXX----'}
                </p>
              </div>

              <div className="text-right">
                <p className="text-[12px] uppercase tracking-[0.2em] text-white/40">City</p>
                <p className="text-[24px] font-sans font-medium text-white/90 mt-1 truncate">
                  {city || 'Ahmedabad'}
                </p>
              </div>
            </div>
          </div>

          {/* Event Schedule Grid */}
          <div className="w-full max-w-[800px] grid grid-cols-3 gap-4 border-t border-b border-[#e7c27d]/15 py-6 my-2">
            <div className="text-left border-r border-[#e7c27d]/15 pr-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">Date & Day</p>
              <p className="text-[22px] font-serif font-bold text-white mt-1">9 August 2026</p>
              <p className="text-[13px] font-sans text-[#ff9933]/90 mt-0.5">Sunday / रविवार</p>
            </div>

            <div className="text-center px-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">Reporting Time</p>
              <p className="text-[22px] font-serif font-bold text-white mt-1">09:00 AM</p>
              <p className="text-[13px] font-sans text-white/60 mt-0.5">Sharp / सुबह 9:00 बजे</p>
            </div>

            <div className="text-right border-l border-[#e7c27d]/15 pl-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">Venue</p>
              <p className="text-[22px] font-serif font-bold text-[#e7c27d] mt-1">Dinesh Hall</p>
              <p className="text-[13px] font-sans text-[#138808] mt-0.5">Usmanpura, Ahmedabad</p>
            </div>
          </div>

          {/* Speaker Details */}
          <div className="flex flex-col items-center mt-2">
            <p className="text-[11px] uppercase tracking-[0.25em] text-[#e7c27d]/80 font-bold">Featured Speakers / वक्तागण</p>
            <p className="text-[18px] font-serif font-semibold text-white/95 mt-1.5">
              Shri Harshal Pushkarna <span className="text-white/40 mx-2">|</span> Pujya Muni Shri Shramanchandrasagarji Maharaj
            </p>
          </div>

          {/* Footer message / Short notice */}
          <div className="mt-4">
            <p className="text-[12px] text-white/45 uppercase tracking-[0.15em] leading-relaxed max-w-[700px]">
              * Mandatory: Present this Digital Pass (QR/Barcode or pass number) on your mobile screen for event entry. Seating is limited.
            </p>
          </div>
        </div>
      </div>

      {/* ================================= BACK SIDE ================================= */}
      <div 
        id={`pass-back-${passNumber}`}
        className="relative bg-[#040810] text-white flex flex-col items-center justify-between p-12 overflow-hidden select-none shrink-0"
        style={cardStyle}
      >
        {/* Soft Background Radial Light */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(60,30,90,0.12)_0%,transparent_70%)] pointer-events-none z-0" />
        
        {/* Subtle Background Texture Overlay */}
        <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0" />

        {/* Outer Premium Border Frame */}
        <div 
          className="absolute inset-6 pointer-events-none z-10 border-[6px]"
          style={{ borderImage: `${outerBorderGrad} 1` }}
        />
        
        {/* Inner thin border frame */}
        <div 
          className="absolute inset-9 pointer-events-none z-10 border border-opacity-30" 
          style={{ borderColor: 'rgba(231,194,125,0.25)' }}
        />

        {/* Corner Ornaments */}
        <div className="absolute top-8 left-8 w-12 h-12 border-t-[3px] border-l-[3px] z-10" style={{ borderColor: '#e7c27d' }} />
        <div className="absolute top-8 right-8 w-12 h-12 border-t-[3px] border-r-[3px] z-10" style={{ borderColor: '#e7c27d' }} />
        <div className="absolute bottom-8 left-8 w-12 h-12 border-b-[3px] border-l-[3px] z-10" style={{ borderColor: '#e7c27d' }} />
        <div className="absolute bottom-8 right-8 w-12 h-12 border-b-[3px] border-r-[3px] z-10" style={{ borderColor: '#e7c27d' }} />

        {/* Content Container */}
        <div className="w-full h-full flex flex-col justify-between items-center relative z-20 pt-10 pb-8 px-8">
          
          {/* Header */}
          <div className="text-center flex flex-col items-center">
            <h2 className="font-serif text-[42px] font-bold tracking-[0.1em] text-[#e7c27d] uppercase">
              आवश्यक निर्देश
            </h2>
            <p className="text-[13px] uppercase tracking-[0.3em] text-white/50 mt-1">Important Instructions</p>
            <div className="w-40 h-[1px] bg-gradient-to-r from-transparent via-[#e7c27d]/40 to-transparent mt-4" />
          </div>

          {/* Instructions List Box */}
          <div className="w-full max-w-[860px] flex-1 flex flex-col justify-center my-6">
            <ul className="space-y-6 text-left">
              {[
                { hi: "प्रवेश एवं बैठने की व्यवस्था \"प्रथम आओ, प्रथम स्थान पाओ\" (First Come, First Seat) के आधार पर होगी।", en: "Seating is strictly on a first-come, first-served basis. Please arrive early." },
                { hi: "प्रातः 9:00 बजे के पश्चात किसी भी परिस्थिति में प्रवेश नहीं दिया जाएगा।", en: "Entry will strictly close at 09:00 AM. Latecomers will not be admitted under any circumstances." },
                { hi: "यह पास केवल एक व्यक्ति के लिए मान्य है तथा हस्तांतरणीय (Non-Transferable) नहीं है।", en: "This digital entry pass is valid for one person only and is strictly non-transferable." },
                { hi: "कृपया अपना मोबाइल फोन साइलेंट अथवा स्विच ऑफ रखें।", en: "Please keep your mobile phones silent or switched off throughout the program." },
                { hi: "कार्यक्रम के दौरान अनावश्यक आवागमन से बचें।", en: "Please avoid unnecessary movement inside the auditorium during presentations." },
                { hi: "आयोजकों एवं स्वयंसेवकों के निर्देशों का पालन करना अनिवार्य है।", en: "Adherence to all guidelines and organizer/volunteer directives is mandatory." }
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e7c27d]/10 border border-[#e7c27d]/30 text-[#e7c27d] text-[15px] font-bold mt-1 font-mono">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="text-[20px] font-serif font-semibold text-white/95 leading-snug">
                      {item.hi}
                    </p>
                    <p className="text-[13px] font-sans text-white/50 tracking-wide mt-1">
                      {item.en}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Bottom Box (Memorial/Memento Note) */}
          <div 
            className="w-full max-w-[800px] rounded-2xl border border-[#e7c27d]/20 bg-[#0c1322] p-8 text-center"
            style={{ boxShadow: '0 10px 25px rgba(0,0,0,0.4)' }}
          >
            <p className="font-serif text-[26px] font-bold text-[#e7c27d] tracking-[0.05em]">
              स्मरणीय अनुरोध
            </p>
            <p className="text-[13px] uppercase tracking-[0.2em] text-white/40 mt-1">Token of Remembrance</p>
            
            <p className="text-[18px] font-serif text-white/80 leading-relaxed mt-4">
              इस ऐतिहासिक क्षण की मधुर स्मृति के रूप में इस पास को अपने पास सुरक्षित रखें।
            </p>
            <p className="text-[12px] font-sans text-white/40 mt-1.5">
              Keep this pass as a souvenir of this historic event celebrating our national heroes.
            </p>
          </div>

          {/* Footer Logo/Aesthetic */}
          <div className="flex flex-col items-center mt-6">
            <p className="text-[14px] uppercase tracking-[0.2em] text-[#e7c27d]/50 font-bold">VARDHMAN CREATIVE STUDIO</p>
            <p className="text-[11px] font-mono text-white/30 tracking-wider mt-1">PVC-SG-2026-TICKET-BACK</p>
          </div>

        </div>
      </div>
    </div>
  );
}
