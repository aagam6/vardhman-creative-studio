import React from 'react';
import { motion } from 'framer-motion';

const ServiceCard = ({ title, description, icon: Icon }) => {
  return (
    <motion.div
      whileHover={{ 
        scale: 1.03,
        boxShadow: "0 20px 40px rgba(168, 85, 247, 0.15)",
        borderColor: "rgba(168, 85, 247, 0.4)"
      }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="glass-effect rounded-2xl p-8 h-full flex flex-col transition-all duration-350 group relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-350" />
      
      <div className="relative z-10">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors duration-300 group-hover:glow-sm">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-3 tracking-[0.08em]">{title}</h3>
        <p className="text-muted-foreground leading-relaxed flex-grow">{description}</p>
      </div>
    </motion.div>
  );
};

export default ServiceCard;