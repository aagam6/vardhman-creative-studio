import React from 'react';
import { motion } from 'framer-motion';

const HoverCard = ({ 
  children, 
  className = '',
  glowEffect = false 
}) => {
  return (
    <motion.div
      className={`${className} transition-all duration-300`}
      whileHover={{ 
        scale: 1.02,
        y: -4,
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20,
      }}
    >
      <div className={`h-full ${glowEffect ? 'hover:premium-glow' : ''}`}>
        {children}
      </div>
    </motion.div>
  );
};

export default HoverCard;