import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Sparkles, Trophy, Eye, Target } from 'lucide-react';
import AgencyNavbar from '@/components/AgencyNavbar.jsx';
import FooterSection from '@/components/FooterSection.jsx';

export default function AboutPage() {
  const values = [
    {
      icon: Eye,
      title: 'Our Vision',
      description: 'To become a global leader in cinematic storytelling, bridging creative art and modern technology to transform how brands speak.'
    },
    {
      icon: Target,
      title: 'Our Mission',
      description: 'To deliver exceptionally crafted visual media, website designs, and digital marketing workflows that resonate with target audiences.'
    },
    {
      icon: Trophy,
      title: 'Our Craftsmanship',
      description: 'We believe that detail is everything. Every transition, every line of copy, and every pixel is meticulously engineered for impact.'
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-purple-500/30 selection:text-purple-200">
      <Helmet>
        <title>About Us | Vardhman Creative Studio</title>
        <meta 
          name="description" 
          content="Learn more about Vardhman Creative Studio. We are a creative team based in Ahmedabad dedicated to producing cinematic visual campaigns and designs." 
        />
      </Helmet>

      <AgencyNavbar />

      {/* Hero Header */}
      <section className="relative pt-32 pb-20 bg-gradient-to-b from-[#0a0f18]/90 to-background overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(168,85,247,0.1),transparent_50%)]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold tracking-wider uppercase mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              About Our Studio
            </span>
            <h1 className="font-serif text-4xl sm:text-6xl font-bold text-white mb-6 tracking-tight">
              Crafting Stories That<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300">
                Elevate Brands.
              </span>
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
              We are a team of authors, visual designers, filmmakers, and developers working together to craft high-impact solutions from our studio in Ahmedabad.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main content body */}
      <section className="py-16 md:py-24 bg-background relative z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            
            {/* Left Story Text */}
            <div className="text-left space-y-6">
              <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white">Who We Are</h2>
              <p className="text-gray-400 leading-relaxed font-light">
                At Vardhman Creative Studio, we believe that design and video should do more than just look beautiful. They should tell an authentic story, capture the heart of the audience, and leave a permanent stamp of authority.
              </p>
              <p className="text-gray-400 leading-relaxed font-light">
                Whether launching campaigns like the mega-scale <strong>Param Vir Chakra – Shaurya Gatha</strong> or deploying core utility products like <strong>Acadexa</strong> and <strong>Vardhman Flow</strong>, our work combines cinematic beauty with strategic market execution.
              </p>
            </div>

            {/* Right Brand graphic / quote */}
            <div className="relative p-8 rounded-3xl border border-white/10 bg-[#070d19]/80 shadow-2xl backdrop-blur-md text-left">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500" />
              <p className="text-purple-400 font-serif text-5xl">“</p>
              <p className="text-white/90 text-lg font-medium leading-relaxed italic -mt-4">
                We bridge the gap between imagination and execution, helping national brands, local leaders, and startups express their true character.
              </p>
              <p className="mt-6 text-xs font-bold uppercase tracking-wider text-gray-500">
                — Creative Director, Vardhman
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Grid */}
      <section className="py-20 bg-black/60 relative z-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((v, i) => {
              const ValueIcon = v.icon;
              return (
                <div key={i} className="p-8 rounded-2xl border border-white/5 bg-[#0a0f18]/60 text-left hover:border-purple-500/30 transition-all duration-300">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/10 mb-6">
                    <ValueIcon className="h-6 w-6" />
                  </span>
                  <h3 className="text-xl font-bold text-white mb-3">{v.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed font-light">{v.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
}
