import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AgencyHero() {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 5 + 5,
      delay: Math.random() * 3,
    }));
    setParticles(newParticles);
  }, []);

  const handleScrollTo = (id) => {
    const element = document.querySelector(id);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section id="home" className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden pt-28 pb-16 noise-bg">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-black via-[hsl(270,30%,6%)] to-black" />

      {/* Dark Overlay */}
      <div className="absolute inset-0 z-0 bg-black/80 backdrop-blur-[1px]" />

      {/* Radial Light Falloff */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.9)_100%)]" />

      {/* Floating Particles */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-purple-500/30 blur-[2px]"
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
            }}
            animate={{
              y: [0, -150],
              x: [0, Math.random() * 60 - 30],
              opacity: [0, 0.5, 0],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
        <div className="flex flex-col items-center">
          {/* Badge */}
          <div className="mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              Creative Agency Studio
            </span>
          </div>

          {/* Main Title Heading */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8.5xl font-bold mb-6 leading-[1.15] tracking-[0.05em] text-white">
            We craft stories <br />
            that elevate{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300 drop-shadow-[0_0_15px_rgba(168,85,247,0.35)]">
              Brands.
            </span>
          </h1>

          {/* Subheading text */}
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-10 font-light tracking-wide leading-relaxed">
            Cinematic storytelling, bold visual identity, and immersive web experiences designed to engage audiences and make your brand unforgettable.
          </p>

          {/* CTA Action Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            <Button
              size="lg"
              onClick={() => handleScrollTo('#contact')}
              className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white rounded-full px-10 py-6 text-sm font-bold uppercase tracking-wider"
            >
              Get In Touch <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => handleScrollTo('#portfolio')}
              className="w-full sm:w-auto border-white/20 hover:bg-white/5 text-white rounded-full px-10 py-6 text-sm font-bold uppercase tracking-wider"
            >
              Explore Portfolio
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Bottom Glow Divider */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
    </section>
  );
}
