import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, MapPin, Phone, MessageCircle, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { contactConfig } from '@/lib/contactConfig';
import EventFooter from '@/components/EventFooter.jsx';

// --- CONFIGURATION CONSTANTS (Update here to change details) ---
const collectionCentreName = "To be Announced";
const collectionDate = "To be Announced";
const collectionTime = "To be Announced";
const collectionAddress = "To be Announced";
const googleMapsUrl = ""; // E.g., "https://maps.google.com/..."

export default function PassCollectionPage() {
  // Page animation
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  // Structured schemas using contactConfig
  const schemas = {
    webPage: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Pass Collection | Param Vir Chakra – Shauryagatha",
      "description": "Official Physical Pass Collection information for Param Vir Chakra – Shauryagatha.",
      "url": "https://vardhmancreativestudio.com/pass-collection"
    },
    organization: {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": contactConfig.orgName,
      "url": contactConfig.orgWebsite,
      "logo": contactConfig.orgLogo,
      "description": contactConfig.orgDescription,
      "sameAs": contactConfig.orgSocials
    },
    breadcrumb: {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://vardhmancreativestudio.com/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Param Vir Chakra",
          "item": "https://vardhmancreativestudio.com/param-vir-chakra"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "Pass Collection",
          "item": "https://vardhmancreativestudio.com/pass-collection"
        }
      ]
    }
  };


  return (
    <>
      <Helmet>
        {/* Basic SEO */}
        <title>Pass Collection | Param Vir Chakra – Shauryagatha</title>
        <meta name="description" content="Official Physical Pass Collection information for Param Vir Chakra – Shauryagatha." />
        <link rel="canonical" href="https://vardhmancreativestudio.com/pass-collection" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://vardhmancreativestudio.com/pass-collection" />
        <meta property="og:title" content="Pass Collection | Param Vir Chakra – Shauryagatha" />
        <meta property="og:description" content="Official Physical Pass Collection information for Param Vir Chakra – Shauryagatha." />
        <meta property="og:image" content="https://vardhmancreativestudio.com/assets/param-vir-chakra-og.jpg" />
        <meta property="og:image:alt" content="Param Vir Chakra Shaurya Gatha Pass Collection" />

        {/* Twitter Cards */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Pass Collection | Param Vir Chakra – Shauryagatha" />
        <meta name="twitter:description" content="Official Physical Pass Collection information for Param Vir Chakra – Shauryagatha." />
        <meta name="twitter:image" content="https://vardhmancreativestudio.com/assets/param-vir-chakra-og.jpg" />

        {/* JSON-LD Schemas */}
        <script type="application/ld+json">
          {JSON.stringify(schemas.webPage)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(schemas.organization)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(schemas.breadcrumb)}
        </script>
      </Helmet>

      <main className="min-h-screen bg-[#050b14] text-white relative py-12 px-5 lg:px-8 overflow-hidden">
        {/* Cinematic background light layers */}
        <div className="absolute left-1/4 top-1/4 -z-10 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ff9933]/5 blur-[120px] pointer-events-none" />
        <div className="absolute right-1/4 bottom-1/4 -z-10 h-[400px] w-[400px] translate-x-1/2 translate-y-1/2 rounded-full bg-[#138808]/5 blur-[120px] pointer-events-none" />
        <div className="absolute inset-0 -z-10 opacity-[0.015] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        <div className="mx-auto max-w-4xl relative">
          
          {/* Back Navigation Button */}
          <Link 
            to="/param-vir-chakra" 
            className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-5 py-2.5 text-sm font-bold text-white/90 transition-all hover:bg-white/10 hover:border-white/20 hover:text-white mb-8 focus-visible:ring-2 focus-visible:ring-[#ff9933] outline-none"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Event
          </Link>

          {/* Plaque Header */}
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#0c1a2e]/60 p-8 md:p-12 shadow-[0_30px_70px_rgba(0,0,0,0.5)] backdrop-blur-2xl mb-8 text-center"
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#ff9933] via-white to-[#138808]" />
            <h1 className="font-serif text-3xl font-bold tracking-tight text-white md:text-5xl">Pass Collection Centre</h1>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#ff9933] mt-3">Param Vir Chakra – Shauryagatha</p>
          </motion.div>

          {/* Success Banner Card */}
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="rounded-3xl border border-[#138808]/30 bg-[#138808]/5 p-6 md:p-8 backdrop-blur-md mb-8 flex flex-col md:flex-row items-center gap-6"
          >
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#138808]/15 border border-[#138808]/30 text-[#138808]">
              <CheckCircle2 className="h-7 w-7" />
            </span>
            <div className="text-center md:text-left">
              <h2 className="text-xl font-bold text-white">Registration Successful ✅</h2>
              <p className="mt-2 text-sm text-white/70 leading-relaxed font-light">
                Thank you for registering. Please collect your Official Physical Entry Pass from the collection centre before the event.
              </p>
            </div>
          </motion.div>

          {/* Main Info Section */}
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="grid gap-6 md:grid-cols-3 mb-8"
          >
            {/* Date Card */}
            <div className="rounded-3xl border border-white/5 bg-[#0a1120]/40 p-6 backdrop-blur-md flex flex-col items-center text-center">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ff9933]/10 text-[#ff9933] mb-4">
                <Calendar className="h-5 w-5" />
              </span>
              <p className="text-xs uppercase text-white/50 font-extrabold tracking-wider">Collection Date</p>
              <p className="mt-2 text-md font-bold text-white">{collectionDate}</p>
            </div>

            {/* Time Card */}
            <div className="rounded-3xl border border-white/5 bg-[#0a1120]/40 p-6 backdrop-blur-md flex flex-col items-center text-center">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ff9933]/10 text-[#ff9933] mb-4">
                <Clock className="h-5 w-5" />
              </span>
              <p className="text-xs uppercase text-white/50 font-extrabold tracking-wider">Collection Time</p>
              <p className="mt-2 text-md font-bold text-white">{collectionTime}</p>
            </div>

            {/* Centre Card */}
            <div className="rounded-3xl border border-white/5 bg-[#0a1120]/40 p-6 backdrop-blur-md flex flex-col items-center text-center">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#138808]/10 text-[#138808] mb-4">
                <MapPin className="h-5 w-5" />
              </span>
              <p className="text-xs uppercase text-white/50 font-extrabold tracking-wider">Collection Centre</p>
              <p className="mt-2 text-sm font-bold text-white">{collectionCentreName}</p>
              <p className="mt-1 text-xs text-white/60 font-light">{collectionAddress}</p>
              
              {/* Google Maps Button - Hidden until URL is available */}
              {googleMapsUrl && googleMapsUrl !== '#' && googleMapsUrl.trim() !== "" && (
                <a 
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#138808] px-4 py-2 text-xs font-bold text-white transition-all hover:bg-white hover:text-[#050b14] focus-visible:ring-2 focus-visible:ring-[#ff9933] outline-none"
                >
                  <MapPin className="h-3.5 w-3.5" /> Google Maps
                </a>
              )}
            </div>
          </motion.div>

          {/* Instructions and Notice */}
          <div className="grid gap-6 md:grid-cols-2 mb-8">
            {/* Instructions list */}
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="rounded-3xl border border-white/5 bg-[#0a1120]/40 p-8 backdrop-blur-md"
            >
              <h3 className="font-serif text-lg font-bold text-white mb-5 pb-2 border-b border-white/5">Important Instructions</h3>
              <ul className="space-y-3.5 text-sm text-white/70 font-light list-disc list-inside">
                <li>Bring your Registration Confirmation message.</li>
                <li>Carry a valid Photo ID proof for verification.</li>
                <li>Collect your Physical Pass before the announced deadline.</li>
                <li>One physical entry pass will be issued per registered participant.</li>
                <li><strong>Physical Pass is mandatory</strong> for event entry.</li>
                <li>No digital pass or screenshot will be accepted at Dinesh Hall.</li>
              </ul>
            </motion.div>

            {/* Important Notice */}
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="rounded-3xl border border-white/5 bg-[#0a1120]/40 p-8 backdrop-blur-md flex flex-col justify-between"
            >
              <div>
                <h3 className="font-serif text-lg font-bold text-white mb-5 pb-2 border-b border-white/5 flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-[#ff9933]" /> Important Notice
                </h3>
                <p className="text-sm text-white/75 leading-relaxed font-light">
                  Pass Collection details are announced only through the official website and WhatsApp messages from the organizing committee.
                </p>
                <p className="mt-4 text-sm text-white/60 leading-relaxed font-light">
                  Do not rely on unofficial messages, forwards, or third-party communications regarding the event entry pass.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/5 text-xs text-white/40">
                Organised with pride by Shri Vardhman Shwetambar Murtipujak Jain Sangh.
              </div>
            </motion.div>
          </div>

          {/* Contact Section */}
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="rounded-3xl border border-white/5 bg-[#0a1120]/40 p-8 backdrop-blur-md text-center mb-12"
          >
            <h3 className="font-serif text-2xl font-bold text-white mb-2">Need Help?</h3>
            <p className="text-sm text-white/60 mb-6 font-light">If you have any questions regarding your pass collection, please reach out to us.</p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <a 
                href={`tel:${contactConfig.contactPhone}`}
                className="inline-flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-5 py-3 text-sm font-bold text-white transition-all hover:bg-white/10 hover:border-white/20 focus-visible:ring-2 focus-visible:ring-[#ff9933] outline-none"
              >
                <Phone className="h-4 w-4 text-[#ff9933]" /> Call Support
              </a>
              <a 
                href={`https://wa.me/${contactConfig.contactWhatsApp.replace(/\s+/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#138808]/10 border border-[#138808]/30 px-5 py-3 text-sm font-bold text-white transition-all hover:bg-[#138808]/20 hover:border-[#138808]/40 focus-visible:ring-2 focus-visible:ring-[#ff9933] outline-none"
              >
                <MessageCircle className="h-4 w-4 text-[#138808]" /> WhatsApp Support
              </a>
            </div>
            <p className="mt-4 text-xs text-white/40">Timings: Mon to Sat (10 am to 6 pm)</p>
          </motion.div>

          <EventFooter />

        </div>
      </main>
    </>
  );
}
