import React from 'react';
import { motion } from 'framer-motion';

const AboutSection = () => {
  return (
    <section className="py-24 md:py-32 relative z-10 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <h2 className="text-sm font-bold tracking-widest uppercase text-primary mb-8">
            Vardhman Creative Studio
          </h2>
          <p className="text-2xl md:text-4xl lg:text-5xl font-medium leading-tight text-foreground/90">
            We craft stories that don't just look good — they connect, inspire, and leave a lasting impression. Every frame we create is designed to elevate brands and captivate audiences.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;