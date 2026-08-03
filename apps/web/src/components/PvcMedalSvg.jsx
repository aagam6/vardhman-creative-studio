import React from 'react';

export default function PvcMedalSvg({ className = "h-32 w-32" }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 200 320" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Ribbon Gradients */}
        <linearGradient id="ribbonGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#4A1E5C" />
          <stop offset="15%" stopColor="#7E3A9F" />
          <stop offset="50%" stopColor="#B366D9" />
          <stop offset="85%" stopColor="#7E3A9F" />
          <stop offset="100%" stopColor="#4A1E5C" />
        </linearGradient>

        <linearGradient id="ribbonShadow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.4)" />
        </linearGradient>

        {/* Bronze Medal Gradients */}
        <linearGradient id="bronzeLight" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#D4A373" />
          <stop offset="30%" stopColor="#B58250" />
          <stop offset="70%" stopColor="#8C5827" />
          <stop offset="100%" stopColor="#5C3814" />
        </linearGradient>

        <radialGradient id="bronzeRadial" cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
          <stop offset="0%" stopColor="#E9C497" />
          <stop offset="45%" stopColor="#B58250" />
          <stop offset="75%" stopColor="#8C5827" />
          <stop offset="100%" stopColor="#42250B" />
        </radialGradient>

        {/* Gold Accent for State Emblem */}
        <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFE0B2" />
          <stop offset="50%" stopColor="#FFB74D" />
          <stop offset="100%" stopColor="#E65100" />
        </linearGradient>

        {/* Shadow Filters */}
        <filter id="medalDropShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#000" floodOpacity="0.5" />
        </filter>
        
        <filter id="innerShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feComponentTransfer in="SourceAlpha">
            <feFuncA type="linear" slope="0.7"/>
          </feComponentTransfer>
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feOffset dx="0" dy="3"/>
          <feComposite operator="out" in2="SourceGraphic"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.8 0"/>
          <feBlend mode="multiply" in2="SourceGraphic"/>
        </filter>
      </defs>

      {/* 1. Purple Ribbon Section */}
      <g filter="url(#medalDropShadow)">
        {/* Ribbon Loop/Fold */}
        <path 
          d="M60 10 L140 10 L135 110 L65 110 Z" 
          fill="url(#ribbonGrad)" 
        />
        {/* Inner Ribbon Texture Lines */}
        <path d="M70 10 V110 M80 10 V110 M90 10 V110 M100 10 V110 M110 10 V110 M120 10 V110 M130 10 V110" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" />
        {/* Ribbon Shadow Overlay */}
        <path 
          d="M60 10 L140 10 L135 110 L65 110 Z" 
          fill="url(#ribbonShadow)" 
        />
        
        {/* Ribbon Suspension Bar (Bronze metal hanger link) */}
        <rect x="55" y="105" width="90" height="8" rx="2" fill="url(#bronzeLight)" stroke="#5C3814" strokeWidth="1" />
        <rect x="58" y="107" width="84" height="2" fill="rgba(255,255,255,0.2)" />
        
        {/* Triangular Hanger Loop */}
        <path d="M85 113 L100 128 L115 113 Z" fill="url(#bronzeLight)" stroke="#5C3814" strokeWidth="1" />
      </g>

      {/* 2. Medallion (Circular Disc) */}
      <g filter="url(#medalDropShadow)">
        {/* Main Disc Outer Ring */}
        <circle cx="100" cy="205" r="55" fill="url(#bronzeRadial)" stroke="#3E2006" strokeWidth="3" />
        {/* Inner Rim */}
        <circle cx="100" cy="205" r="51" fill="none" stroke="#F1D1A9" strokeWidth="1.2" strokeOpacity="0.4" />
        <circle cx="100" cy="205" r="48" fill="none" stroke="#5C3814" strokeWidth="1" />

        {/* Stars or dots around outer border */}
        {Array.from({ length: 16 }).map((_, i) => {
          const angle = (i * 360) / 16;
          const rad = (angle * Math.PI) / 180;
          const x = 100 + 44 * Math.cos(rad);
          const y = 205 + 44 * Math.sin(rad);
          return <circle key={i} cx={x} cy={y} r="1.5" fill="#4E2E10" />;
        })}

        {/* 3. Replicas of Indra's Vajras (4 Vajras in Cross layout) */}
        {/* Top Vajra */}
        <path 
          d="M93 175 C93 162, 97 155, 100 151 C103 155, 107 162, 107 175 L103 175 C103 182, 97 182, 97 175 Z" 
          fill="url(#bronzeLight)" 
          stroke="#42250B" 
          strokeWidth="0.8" 
        />
        {/* Bottom Vajra */}
        <path 
          d="M93 235 C93 248, 97 255, 100 259 C103 255, 107 248, 107 235 L103 235 C103 228, 97 228, 97 235 Z" 
          fill="url(#bronzeLight)" 
          stroke="#42250B" 
          strokeWidth="0.8" 
        />
        {/* Left Vajra */}
        <path 
          d="M70 202 C57 202, 50 198, 46 195 C50 192, 57 188, 70 188 L70 192 C77 192, 77 198, 70 198 Z" 
          fill="url(#bronzeLight)" 
          stroke="#42250B" 
          strokeWidth="0.8" 
        />
        {/* Right Vajra */}
        <path 
          d="M130 202 C143 202, 150 198, 154 195 C150 192, 143 188, 130 188 L130 192 C123 192, 123 198, 130 198 Z" 
          fill="url(#bronzeLight)" 
          stroke="#42250B" 
          strokeWidth="0.8" 
        />

        {/* Connective center support for Vajras */}
        <circle cx="100" cy="205" r="28" fill="url(#bronzeRadial)" stroke="#42250B" strokeWidth="1" />

        {/* 4. Raised Center circular dome containing State Emblem */}
        <circle cx="100" cy="205" r="20" fill="url(#bronzeLight)" stroke="#3E2006" strokeWidth="1.5" />
        <circle cx="100" cy="205" r="18" fill="none" stroke="#FCDCAE" strokeWidth="0.8" strokeOpacity="0.5" />

        {/* State Emblem of India */}
        <g transform="translate(89, 191) scale(0.18)" fill="#3E2006">
          {/* Base / Abacus */}
          <path d="M22 66 L98 66 L90 73 L30 73 Z" fill="#321A05" />
          <rect x="26" y="58" width="68" height="8" rx="2" fill="#502F10" />
          <circle cx="60" cy="62" r="3" fill="#D4A373" />
          
          {/* Central Lion */}
          <path d="M48 58 C48 50, 44 48, 48 32 C49 27, 45 22, 48 18 C52 14, 55 12, 60 12 C65 12, 68 14, 72 18 C75 22, 71 27, 72 32 C76 48, 72 50, 72 58 Z" fill="#321A05" />
          {/* Left Lion Profile */}
          <path d="M32 58 C32 50, 26 44, 28 32 C30 25, 34 22, 38 22 C42 22, 45 25, 46 29 C46 38, 48 48, 48 58 Z" fill="#241203" />
          {/* Right Lion Profile */}
          <path d="M88 58 C88 50, 94 44, 92 32 C90 25, 86 22, 82 22 C78 22, 75 25, 74 29 C74 38, 72 48, 72 58 Z" fill="#241203" />

          {/* Details & Highlights (Embossed lines) */}
          <path d="M60 15 V45" stroke="#D4A373" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M50 25 Q60 20 70 25" fill="none" stroke="#D4A373" strokeWidth="2" />
          <path d="M52 35 Q60 30 68 35" fill="none" stroke="#D4A373" strokeWidth="2" />
          <path d="M54 45 Q60 40 66 45" fill="none" stroke="#D4A373" strokeWidth="2" />
          
          <path d="M35 30 Q40 25 45 32" fill="none" stroke="#8C5827" strokeWidth="1.5" />
          <path d="M85 30 Q80 25 75 32" fill="none" stroke="#8C5827" strokeWidth="1.5" />
        </g>
      </g>
    </svg>
  );
}
