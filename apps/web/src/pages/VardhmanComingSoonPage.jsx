import React from 'react';
import { Helmet } from 'react-helmet';
import HomeLiveBanner from '@/components/HomeLiveBanner.jsx';
import HeroSection from '@/components/HeroSection.jsx';
import AboutSection from '@/components/AboutSection.jsx';
import ServicesSection from '@/components/ServicesSection.jsx';
import LeadCaptureSection from '@/components/LeadCaptureSection.jsx';
import FooterSection from '@/components/FooterSection.jsx';

const VardhmanComingSoonPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-primary-foreground">
      <Helmet>
        <title>Vardhman Creative Studio | Official Live & Coming Soon</title>
        <meta name="description" content="Cinematic storytelling that transforms brands into experiences. Watch the official Param Vir Chakra Shaurya Gatha live stream and join the waitlist." />
      </Helmet>

      {/* Top Live Announcement Banner */}
      <HomeLiveBanner />

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