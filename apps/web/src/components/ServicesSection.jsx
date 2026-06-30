import React from 'react';
import { Film, BookOpen, Sparkles, Palette } from 'lucide-react';
import ServiceCard from './ServiceCard.jsx';
import AnimatedSection, { AnimatedItem } from './AnimatedSection.jsx';
import AnimatedHeading from './AnimatedHeading.jsx';

const ServicesSection = () => {
  const services = [
    {
      title: 'Cinematic Visuals',
      description: 'High-impact video production that captures attention and tells your story with emotion and precision.',
      icon: Film
    },
    {
      title: 'Brand Storytelling',
      description: 'Narratives that connect deeply with your audience and build powerful brand identity.',
      icon: BookOpen
    },
    {
      title: 'Creative Experiences',
      description: 'Immersive campaigns and content that engage, inspire, and drive action.',
      icon: Sparkles
    },
    {
      title: 'Visual Design',
      description: 'Bold, memorable designs that elevate your brand across every touchpoint.',
      icon: Palette
    }
  ];

  return (
    <section className="py-32 relative z-10 bg-background noise-bg">
      {/* Top Glow Divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <AnimatedHeading as="h2" className="text-3xl md:text-5xl mb-6">
            Our Expertise
          </AnimatedHeading>
          <AnimatedSection delay={0.2}>
            <AnimatedItem>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto tracking-wide">
                Comprehensive creative solutions designed to make your brand unforgettable.
              </p>
            </AnimatedItem>
          </AnimatedSection>
        </div>

        <AnimatedSection stagger={0.12} className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {services.map((service, index) => (
            <AnimatedItem key={index}>
              <ServiceCard {...service} />
            </AnimatedItem>
          ))}
        </AnimatedSection>
      </div>
      
      {/* Bottom Glow Divider */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
    </section>
  );
};

export default ServicesSection;