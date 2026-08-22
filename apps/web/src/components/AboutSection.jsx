import React from 'react';
import { motion } from 'framer-motion';

const AboutSection = () => {
  return (
    <section className="py-24 md:py-32 relative z-10 bg-background border-t border-white/5">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <span className="text-[10px] font-black tracking-[0.3em] uppercase text-orange-500">
            Vardhman Creative Studio
          </span>
          <p className="text-xl sm:text-3xl font-light leading-relaxed text-white/90 mt-8">
            We craft stories that connect, inspire, and leave a lasting impression. Every frame we create is designed to elevate your brand.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;