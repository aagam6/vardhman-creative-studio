import React from 'react';
import { Helmet } from 'react-helmet';
import PageTransition from '@/components/PageTransition.jsx';
import AgencyNavbar from '@/components/AgencyNavbar.jsx';
import AgencyHero from '@/components/AgencyHero.jsx';
import AboutSection from '@/components/AboutSection.jsx';
import ServicesSection from '@/components/ServicesSection.jsx';
import PortfolioSection from '@/components/PortfolioSection.jsx';
import FAQSection from '@/components/FAQSection.jsx';
import ContactFormSection from '@/components/ContactFormSection.jsx';
import FooterSection from '@/components/FooterSection.jsx';

export default function HomePage() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background text-foreground selection:bg-purple-500/30 selection:text-purple-200">
        <Helmet>
          <title>Vardhman Creative Studio | Video Editing, Graphic Design & Web Agency Ahmedabad</title>
          <meta 
            name="description" 
            content="Vardhman Creative Studio is the best video editing agency, graphic designer, photography studio, and website design services provider in Ranip, New Ranip, and Ahmedabad, Gujarat." 
          />
          <meta 
            name="keywords" 
            content="video editing agency in ahmedabad, graphic designer in ranip ahmedabad, photography studio in new ranip, website design ahmedabad, creative agency ranip, computer services ahmedabad" 
          />
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "Vardhman Creative Studio",
              "image": "https://vardhmancreativestudio.com/assets/logo.png",
              "@id": "https://vardhmancreativestudio.com/#localbusiness",
              "url": "https://vardhmancreativestudio.com",
              "telephone": "+91 79901 06225",
              "priceRange": "$$",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Ranip, New Ranip",
                "addressLocality": "Ahmedabad",
                "addressRegion": "Gujarat",
                "postalCode": "382480",
                "addressCountry": "IN"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": 23.0816021,
                "longitude": 72.5607111
              },
              "openingHoursSpecification": {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": [
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday"
                ],
                "opens": "10:00",
                "closes": "19:00"
              },
              "sameAs": [
                "https://www.instagram.com/vardhmancreativestudio/",
                "https://www.facebook.com/Vardhmancreativestudio",
                "https://www.linkedin.com/company/vardhmancreativestudio",
                "https://www.youtube.com/@vardhmancreativestudio"
              ]
            })}
          </script>
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

        {/* FAQ Section */}
        <FAQSection />

        {/* Contact Section */}
        <ContactFormSection />

        {/* Footer Section */}
        <FooterSection />
      </div>
    </PageTransition>
  );
}