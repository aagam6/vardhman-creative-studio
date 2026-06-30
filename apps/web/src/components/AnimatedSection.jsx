import React from 'react';
import { motion } from 'framer-motion';
import { useScrollAnimation } from '@/hooks/useScrollAnimation.js';

const AnimatedSection = ({ 
  children, 
  className = '', 
  delay = 0,
  stagger = 0.15 
}) => {
  const [ref, isVisible] = useScrollAnimation({ threshold: 0.1 });

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={container}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
    >
      {children}
    </motion.div>
  );
};

export const AnimatedItem = ({ children, className = '' }) => {
  const item = {
    hidden: { 
      opacity: 0, 
      y: 40,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  return (
    <motion.div className={className} variants={item}>
      {children}
    </motion.div>
  );
};

export default AnimatedSection;