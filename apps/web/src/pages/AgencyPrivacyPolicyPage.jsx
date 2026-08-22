import React from 'react';
import { Helmet } from 'react-helmet';
import { ShieldCheck, Mail, Phone, Clock } from 'lucide-react';
import PageTransition from '@/components/PageTransition.jsx';
import AgencyNavbar from '@/components/AgencyNavbar.jsx';
import FooterSection from '@/components/FooterSection.jsx';

export default function AgencyPrivacyPolicyPage() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background text-foreground selection:bg-purple-500/30 selection:text-purple-200">
        <Helmet>
          <title>Privacy Policy | Vardhman Creative Studio</title>
          <meta name="description" content="Privacy Policy for Vardhman Creative Studio. Learn how we handle your personal data and respect your confidentiality." />
        </Helmet>

        <AgencyNavbar />

        <main className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(168,85,247,0.05),transparent_50%)] pointer-events-none" />
          
          <div className="max-w-4xl mx-auto relative z-10 text-left">
            {/* Header Block */}
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#070d19]/80 p-8 sm:p-12 shadow-2xl backdrop-blur-md mb-12">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500" />
              <div className="flex items-center gap-4 mb-6">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/10">
                  <ShieldCheck className="h-6 w-6" />
                </span>
                <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight">Privacy Policy</h1>
              </div>
              <p className="text-gray-400 text-sm font-light">
                Your privacy and confidentiality are of paramount importance to us. This policy outlines how Vardhman Creative Studio collects, uses, and safeguards your data.
              </p>
              <div className="flex gap-4 items-center text-xs text-gray-500 mt-6 pt-6 border-t border-white/5">
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Last Updated: August 2026</span>
              </div>
            </div>

            {/* Content Details */}
            <div className="space-y-10 rounded-[2rem] border border-white/5 bg-white/[0.01] p-8 sm:p-12 shadow-xl backdrop-blur-sm">
              <div>
                <h2 className="text-xl font-bold text-white mb-4">1. Information We Collect</h2>
                <p className="text-sm text-gray-400 leading-relaxed font-light">
                  We collect information when you submit a project inquiry via our contact form or get in touch directly. This may include your name, company name, email address, WhatsApp or phone number, project budget range, and project goals or briefs.
                </p>
              </div>

              <hr className="border-white/5" />

              <div>
                <h2 className="text-xl font-bold text-white mb-4">2. How We Use Your Data</h2>
                <p className="text-sm text-gray-400 leading-relaxed font-light">
                  Any details you share with us are used exclusively to process your creative project request. Specifically, we use your info to send quotation proposals, coordinate scheduling and design revisions, and transmit final project deliverables. We do not use your information for spam or unsolicited marketing list-building.
                </p>
              </div>

              <hr className="border-white/5" />

              <div>
                <h2 className="text-xl font-bold text-white mb-4">3. Absolute Confidentiality Guarantee</h2>
                <p className="text-sm text-gray-400 leading-relaxed font-light">
                  Vardhman Creative Studio guarantees 100% confidentiality for your business plans, digital assets, branding files, and personal contact details. We do not share, sell, distribute, or rent your database records to third-party advertisers or external corporations.
                </p>
              </div>

              <hr className="border-white/5" />

              <div>
                <h2 className="text-xl font-bold text-white mb-4">4. Cookies and Analytics</h2>
                <p className="text-sm text-gray-400 leading-relaxed font-light">
                  Our website uses secure cookies and analytics configurations to monitor load times, track traffic behavior anonymously, and optimize user experience performance.
                </p>
              </div>

              <hr className="border-white/5" />

              <div>
                <h2 className="text-xl font-bold text-white mb-4">5. Contact Support</h2>
                <p className="text-sm text-gray-400 leading-relaxed font-light mb-6">
                  For questions regarding this policy or to request data removal, please contact our support desk:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <Mail className="w-5 h-5 text-purple-400" />
                    <span className="text-xs sm:text-sm text-gray-300">support@vardhmancreativestudio.com</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <Phone className="w-5 h-5 text-purple-400" />
                    <span className="text-xs sm:text-sm text-gray-300">+91 79901 06225</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <FooterSection />
      </div>
    </PageTransition>
  );
}
