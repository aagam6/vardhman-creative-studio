import React from 'react';
import { Helmet } from 'react-helmet';
import AgencyNavbar from '@/components/AgencyNavbar.jsx';
import AgencyHero from '@/components/AgencyHero.jsx';
import AboutSection from '@/components/AboutSection.jsx';
import ServicesSection from '@/components/ServicesSection.jsx';
import PortfolioSection from '@/components/PortfolioSection.jsx';
import ContactFormSection from '@/components/ContactFormSection.jsx';
import FooterSection from '@/components/FooterSection.jsx';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-purple-500/30 selection:text-purple-200">
      <Helmet>
        <title>Vardhman Creative Studio | Premium Creative Agency Ahmedabad</title>
        <meta 
          name="description" 
          content="Vardhman Creative Studio is a premier creative design agency in Ahmedabad, Gujarat, India. We deliver cinematic video production, corporate branding, web design, and high-end digital campaigns." 
        />
      </Helmet>

      {/* Navigation Header */}
      <AgencyNavbar />

      {/* Hero Section */}
      <AgencyHero />

      {/* About Section */}
      <AboutSection />

      {/* Services Section */}
      <ServicesSection />

      {/* Portfolio/Work Section */}
      <PortfolioSection />

      {/* Contact Section */}
      <ContactFormSection />

      {/* Footer Section */}
      <FooterSection />
    </div>
  );
}