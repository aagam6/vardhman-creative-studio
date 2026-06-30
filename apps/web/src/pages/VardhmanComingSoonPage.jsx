import React from 'react';
import { Helmet } from 'react-helmet';
import HeroSection from '@/components/HeroSection.jsx';
import AboutSection from '@/components/AboutSection.jsx';
import ServicesSection from '@/components/ServicesSection.jsx';
import LeadCaptureSection from '@/components/LeadCaptureSection.jsx';
import FooterSection from '@/components/FooterSection.jsx';

const VardhmanComingSoonPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-primary-foreground">
      <Helmet>
        <title>Vardhman Creative Studio | Coming Soon</title>
        <meta name="description" content="Cinematic storytelling that transforms brands into experiences. Join the creative waitlist for Vardhman Creative Studio." />
      </Helmet>

      <main>
        <HeroSection />
        <AboutSection />
        <ServicesSection />
        <LeadCaptureSection />
      </main>

      <FooterSection />
    </div>
  );
};

export default VardhmanComingSoonPage;