import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, X } from 'lucide-react';

export default function PortfolioSection() {
  const [filter, setFilter] = useState('all');
  const [selectedProject, setSelectedProject] = useState(null);

  const categories = [
    { id: 'all', label: 'All Projects' },
    { id: 'video', label: 'Cinematic Video' },
    { id: 'branding', label: 'Visual Identity' },
    { id: 'web', label: 'Web Design' }
  ];

  const projects = [
    {
      title: 'Param Vir Chakra - Shaurya Gatha',
      category: 'web',
      image: 'https://vardhmancreativestudio.com/assets/param-vir-chakra-live.jpg',
      link: '/param-vir-chakra',
      description: 'Web development, offline pass generator, and live stream routing for a mega patriotic event.'
    },
    {
      title: 'Acadexa',
      category: 'web',
      image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80',
      link: 'https://acadexa.in',
      description: 'Manage attendance, fees, exams, communication, and school operations from one smart ERP platform.'
    },
    {
      title: 'Vardhman Flow',
      category: 'web',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
      link: 'https://vardhmanflow.com',
      description: 'The most powerful WhatsApp marketing platform. Scale your business with automated campaigns, advanced analytics, and seamless API integration.'
    },
    {
      title: 'Zenith Premium Branding',
      category: 'branding',
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
      link: '#',
      description: 'Corporate logo, luxury print collateral, and complete brand identity system.'
    },
    {
      title: 'Elevate Brand Film',
      category: 'video',
      image: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=800&q=80',
      link: '#',
      description: 'Cinematic promotional video and motion graphic spots for tech enterprise platforms.'
    },
    {
      title: 'Genesis Soundscape Promo',
      category: 'video',
      image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
      link: '#',
      description: 'Dynamic audiovisual experience combining studio recordings with motion mapping.'
    }
  ];

  const filteredProjects = filter === 'all' 
    ? projects 
    : projects.filter(p => p.category === filter);

  const handleCardClick = (e, project) => {
    if (project.link === '#') {
      e.preventDefault();
      setSelectedProject(project);
    }
  };

  return (
    <section id="portfolio" className="py-24 md:py-32 relative z-10 bg-black/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="text-left">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-purple-500 mb-3">Portfolio</p>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-white leading-tight">Featured Creations</h2>
          </div>

          {/* Filter Categories Menu */}
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setFilter(c.id)}
                className={`px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 border ${
                  filter === c.id
                    ? 'bg-purple-600 border-purple-600 text-white shadow-[0_4px_20px_rgba(168,85,247,0.3)]'
                    : 'border-white/10 text-gray-400 hover:border-white/30 hover:text-white'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Project Grid Container */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((p) => (
              <motion.article
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                key={p.title}
                className="relative overflow-hidden rounded-3xl border border-white/5 bg-[#0a0f18] shadow-xl group hover:border-purple-500/30 transition-all duration-500 flex flex-col h-full cursor-pointer"
                onClick={(e) => handleCardClick(e, p)}
              >
                {/* Image Container with Hover Zoom */}
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <img
                    src={p.image}
                    alt={p.title}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                  
                  {/* Action Icon overlay */}
                  <a
                    href={p.link}
                    target={p.link.startsWith('http') ? '_blank' : undefined}
                    rel={p.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                    onClick={(e) => handleCardClick(e, p)}
                    className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 border border-white/10 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 hover:bg-purple-600 hover:border-purple-600"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                </div>

                {/* Content description */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div className="text-left">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-purple-400">
                      {p.category === 'web' ? 'Web Design' : p.category === 'video' ? 'Cinematic Video' : 'Visual Identity'}
                    </span>
                    <h3 className="mt-2 text-xl font-bold text-white transition-colors group-hover:text-purple-400">
                      {p.title}
                    </h3>
                    <p className="mt-3 text-sm text-gray-400 leading-relaxed font-light">
                      {p.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-5 border-t border-white/5 flex items-center justify-between">
                    <a
                      href={p.link}
                      target={p.link.startsWith('http') ? '_blank' : undefined}
                      rel={p.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                      onClick={(e) => handleCardClick(e, p)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-white/75 group-hover:text-white transition-colors"
                    >
                      Explore Project <span className="inline-block transform transition-transform group-hover:translate-x-1 group-hover:-translate-y-0.5">→</span>
                    </a>
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Project Detail Modal Overlay */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md text-left">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#070d17] p-6 sm:p-10 shadow-2xl backdrop-blur-2xl"
            >
              {/* Subtle top indicator */}
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500" />
              
              {/* Close Button */}
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-5 right-5 p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-purple-400">
                {selectedProject.category === 'web' ? 'Web Design & Code' : selectedProject.category === 'video' ? 'Cinematic Video' : 'Visual Identity & Branding'}
              </span>
              
              <h3 className="mt-2 text-2xl sm:text-3xl font-bold text-white font-serif tracking-tight pr-8">
                {selectedProject.title}
              </h3>

              {/* Project Image */}
              <div className="mt-6 aspect-video w-full overflow-hidden rounded-2xl border border-white/5 shadow-inner">
                <img 
                  src={selectedProject.image} 
                  alt={selectedProject.title} 
                  className="h-full w-full object-cover" 
                />
              </div>

              <p className="mt-6 text-sm sm:text-base text-gray-300 leading-relaxed font-light">
                {selectedProject.description}
              </p>

              {/* Action Buttons */}
              <div className="mt-8 pt-6 border-t border-white/5 flex flex-wrap gap-3">
                <a
                  href="#contact"
                  onClick={() => {
                    setSelectedProject(null);
                    setTimeout(() => {
                      const el = document.getElementById('contact');
                      if (el) {
                        const offset = 80;
                        const bodyRect = document.body.getBoundingClientRect().top;
                        const elementRect = el.getBoundingClientRect().top;
                        const elementPosition = elementRect - bodyRect;
                        const offsetPosition = elementPosition - offset;
                        window.scrollTo({
                          top: offsetPosition,
                          behavior: 'smooth'
                        });
                      }
                    }, 100);
                  }}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs uppercase tracking-wider px-6 transition-all duration-300"
                >
                  Start Similar Project
                </a>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider px-6 transition-all duration-300"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
