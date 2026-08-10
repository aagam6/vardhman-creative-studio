import React from 'react';
import { motion } from 'framer-motion';
import { Play, ChevronRight, Calendar, MapPin, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HomeLiveBanner() {
  return (
    <div className="w-full">
      {/* Top Floating Announcement Strip */}
      <div className="relative z-50 bg-gradient-to-r from-[#1e293b] via-[#0f172a] to-[#1e293b] text-white text-xs font-semibold py-2.5 px-4 shadow-lg overflow-hidden border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#138808]"></span>
            </span>
            <span className="uppercase tracking-widest text-[11px] font-black bg-[#138808]/20 text-[#22c55e] px-2 py-0.5 rounded-full border border-[#138808]/30">
              Event Concluded
            </span>
            <span className="hidden sm:inline text-white/90">
              परमवीर चक्र – शौर्यगाथा कार्यक्रम सफलतापूर्वक संपन्न • Watch Full Live Recording
            </span>
            <span className="sm:hidden text-white/90 truncate">
              परमवीर चक्र – शौर्यगाथा रिकॉर्डिंग देखें
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/pvclive"
              className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#ff9933] to-[#ff5500] text-[#040b14] hover:bg-white hover:text-black px-3.5 py-1 rounded-full text-xs font-bold transition-all duration-300 shadow-sm hover:scale-105"
            >
              <Play className="h-3 w-3 fill-current" /> Watch Recording / रिकॉर्डिंग देखें
            </a>
            <Link
              to="/param-vir-chakra"
              className="hidden md:inline-flex items-center text-white/80 hover:text-white text-xs underline underline-offset-2 transition-colors"
            >
              Event Highlights
            </Link>
          </div>
        </div>
      </div>

      {/* Featured Cinematic Live Stream Card for Home Page */}
      <div className="max-w-5xl mx-auto px-4 pt-12 pb-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-gradient-to-b from-[#0e1626]/90 via-[#070d17]/95 to-[#040810] p-6 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl group hover:border-[#ff9933]/40 transition-all duration-500"
        >
          {/* Subtle Tricolor Ambient Glow */}
          <div className="absolute -top-24 left-1/4 h-48 w-48 rounded-full bg-[#ff9933]/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 right-1/4 h-48 w-48 rounded-full bg-[#138808]/15 blur-3xl pointer-events-none" />
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#ff9933] via-white/40 to-[#138808]" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex-1 text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full bg-[#138808]/15 border border-[#138808]/40 px-3.5 py-1 text-xs font-bold text-[#22c55e] uppercase tracking-widest mb-4">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#22c55e]" />
                <span className="text-white">कार्यक्रम संपन्न • Full Recording Available</span>
              </div>

              {/* Title */}
              <h2 className="font-serif text-2xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
                परमवीर चक्र – शौर्यगाथा
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#ff9933] to-[#ffb854] text-xl sm:text-3xl mt-1">
                  Watch Full Event Recording
                </span>
              </h2>

              <p className="mt-3 text-sm sm:text-[15px] leading-relaxed text-white/70 font-light max-w-xl">
                9 अगस्त 2026 को दिनेश हॉल, अहमदाबाद में आयोजित भव्य राष्ट्रीय कार्यक्रम सफलतापूर्वक संपन्न हुआ। यदि आप उपस्थित नहीं हो सके, तो आप सम्पूर्ण कार्यक्रम और ओजस्वी व्याख्यान की लाइव रिकॉर्डिंग यहाँ देख सकते हैं।
              </p>

              {/* Event Metadata Tags */}
              <div className="mt-5 flex flex-wrap gap-4 text-xs text-white/60 font-medium">
                <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
                  <Calendar className="h-3.5 w-3.5 text-[#ff9933]" /> 9 August 2026 (रविवार)
                </span>
                <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
                  <MapPin className="h-3.5 w-3.5 text-[#138808]" /> Dinesh Hall, Navrangpura, Ahmedabad
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto shrink-0">
              <a
                href="/pvclive"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ff9933] to-[#ff5500] px-7 py-4 text-sm font-bold text-[#040b14] shadow-[0_8px_30px_rgba(255,85,0,0.35)] transition-all duration-300 hover:scale-105 hover:shadow-[0_12px_40px_rgba(255,85,0,0.5)] active:scale-[0.98]"
              >
                <Play className="h-4 w-4 fill-current" /> Watch Full Recording / रिकॉर्डिंग देखें
              </a>

              <Link
                to="/param-vir-chakra"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 px-7 py-3.5 text-sm font-semibold text-white transition-all duration-300"
              >
                Event Highlights <ChevronRight className="h-4 w-4 text-[#ff9933]" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
