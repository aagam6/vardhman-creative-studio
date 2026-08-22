import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Film, BookOpen, Sparkles, Palette, ArrowRight, Settings } from 'lucide-react';
import AgencyNavbar from '@/components/AgencyNavbar.jsx';
import FooterSection from '@/components/FooterSection.jsx';

export default function ServicesPage() {
  const detailedServices = [
    {
      icon: Film,
      title: 'Cinematic Video Production',
      description: 'We script, direct, shoot, and edit stunning video content that grabs attention. From YouTube video edits, promotional clips, to full-length event broadcasts, we handle the entire pipeline.',
      details: ['Scripting & Storyboarding', 'Multi-camera Shoot Direction', 'Post-production Editing & VFX', 'Motion Graphics Overlay']
    },
    {
      icon: Palette,
      title: 'Visual Identity & Branding',
      description: 'We develop cohesive brand assets that convey luxury, authority, and identity. We design logos, print collateral, packaging, and corporate stationery systems.',
      details: ['Logo & Typography Design', 'Complete Brand Style Guides', 'Packaging & Box Layouts', 'Marketing Banners & Collateral']
    },
    {
      icon: Settings,
      title: 'Web Design & Development',
      description: 'We build custom interactive platforms, web tools, and websites that load fast, look modern, and capture high-intent leads. (e.g. Pass generators, platform portals).',
      details: ['React & Custom Frameworks', 'Responsive Mobile-first Design', 'Custom Form & Lead Ingestion', 'Search Engine Optimization (SEO)']
    },
    {
      icon: Sparkles,
      title: 'Creative Launch Campaigns',
      description: 'We construct integrated creative media campaigns to successfully launch books, events, or SaaS platforms. We build everything from the live stream redirect routes to online assets.',
      details: ['Mega Event Digital Setup', 'Live Stream System Routing', 'Helpline & WhatsApp Integration', 'Social Media Graphics & Copy']
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-purple-500/30 selection:text-purple-200">
      <Helmet>
        <title>Our Services | Vardhman Creative Studio</title>
        <meta 
          name="description" 
          content="Explore the premium creative and design services offered by Vardhman Creative Studio. We offer video production, graphic design, web development, and digital marketing." 
        />
      </Helmet>

      <AgencyNavbar />

      {/* Hero Header */}
      <section className="relative pt-32 pb-20 bg-gradient-to-b from-[#0a0f18]/90 to-background overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(168,85,247,0.1),transparent_50%)]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold tracking-wider uppercase mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              What We Deliver
            </span>
            <h1 className="font-serif text-4xl sm:text-6xl font-bold text-white mb-6 tracking-tight">
              Our Professional<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300">
                Creative Services.
              </span>
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
              Tailored design and video production solutions built to elevate your brand value and optimize business communication.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Breakdown Section */}
      <section className="py-16 md:py-24 bg-background relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {detailedServices.map((service, index) => {
              const ServiceIcon = service.icon;
              return (
                <div 
                  key={index} 
                  className="p-8 sm:p-12 rounded-[2rem] border border-white/10 bg-[#070d19]/80 shadow-2xl backdrop-blur-md text-left flex flex-col lg:flex-row gap-8 items-start lg:items-center hover:border-purple-500/30 transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500" />
                  
                  {/* Left part: Icon & info */}
                  <div className="flex-1 space-y-4">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/10">
                      <ServiceIcon className="h-6 w-6" />
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white font-serif">{service.title}</h2>
                    <p className="text-gray-400 font-light leading-relaxed text-sm sm:text-base">
                      {service.description}
                    </p>
                  </div>

                  {/* Right part: Bullets list */}
                  <div className="w-full lg:w-[350px] shrink-0 p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-4">Core Deliverables</h3>
                    <ul className="space-y-3">
                      {service.details.map((detail, idx) => (
                        <li key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm text-gray-300 font-light">
                          <ArrowRight className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
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
