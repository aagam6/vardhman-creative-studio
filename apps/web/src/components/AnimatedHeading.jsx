import React from 'react';
import { motion } from 'framer-motion';
import { useScrollAnimation } from '@/hooks/useScrollAnimation.js';

const AnimatedHeading = ({ 
  children, 
  className = '', 
  as = 'h2',
  delay = 0 
}) => {
  const Component = motion[as];
  const [ref, isVisible] = useScrollAnimation({ threshold: 0.2 });
  
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: delay,
      },
    },
  };

  const child = {
    hidden: { 
      opacity: 0, 
      y: 20,
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

  const words = typeof children === 'string' ? children.split(' ') : [];

  return (
    <Component
      ref={ref}
      className={`font-bold tracking-[0.08em] leading-[1.4] py-2 ${className}`}
      variants={container}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
    >
      {typeof children === 'string' ? words.map((word, index) => (
        <motion.span
          key={index}
          variants={child}
          style={{ display: 'inline-block', marginRight: '0.25em' }}
        >
          {word}
        </motion.span>
      )) : children}
    </Component>
  );
};

export default AnimatedHeading;