import React from 'react';
import { Helmet } from 'react-helmet';
import { FileText, Mail, Phone, Clock } from 'lucide-react';
import PageTransition from '@/components/PageTransition.jsx';
import AgencyNavbar from '@/components/AgencyNavbar.jsx';
import FooterSection from '@/components/FooterSection.jsx';

export default function AgencyTermsOfServicePage() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background text-foreground selection:bg-purple-500/30 selection:text-purple-200">
        <Helmet>
          <title>Terms of Service | Vardhman Creative Studio</title>
          <meta name="description" content="Terms of Service for Vardhman Creative Studio. Review project engagement terms, payments policies, and project delivery conditions." />
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
                  <FileText className="h-6 w-6" />
                </span>
                <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight">Terms of Service</h1>
              </div>
              <p className="text-gray-400 text-sm font-light">
                Please review our terms of engagement before initiating design, web, or cinematic video production projects with Vardhman Creative Studio.
              </p>
              <div className="flex gap-4 items-center text-xs text-gray-500 mt-6 pt-6 border-t border-white/5">
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Last Updated: August 2026</span>
              </div>
            </div>

            {/* Content Details */}
            <div className="space-y-10 rounded-[2rem] border border-white/5 bg-white/[0.01] p-8 sm:p-12 shadow-xl backdrop-blur-sm">
              <div>
                <h2 className="text-xl font-bold text-white mb-4">1. Project Engagement</h2>
                <p className="text-sm text-gray-400 leading-relaxed font-light">
                  A creative project officially commences once both parties agree on a quote statement and the upfront payment (if applicable) is received. Clients are expected to provide clear media requirements, assets, and timely feedback throughout the production lifecycle.
                </p>
              </div>

              <hr className="border-white/5" />

              <div>
                <h2 className="text-xl font-bold text-white mb-4">2. Revisions and Feedback Limits</h2>
                <p className="text-sm text-gray-400 leading-relaxed font-light">
                  We strive to craft high-quality creations. Our proposals include a standard allocation of design and video cut revisions (typically 2-3 rounds unless specified otherwise). Extensive structural redesigns requested after final sign-off may be billed separately.
                </p>
              </div>

              <hr className="border-white/5" />

              <div>
                <h2 className="text-xl font-bold text-white mb-4">3. Final Delivery and Ownership</h2>
                <p className="text-sm text-gray-400 leading-relaxed font-light">
                  Upon receipt of the final project settlement payment, Vardhman Creative Studio transfers 100% intellectual property ownership of all custom design assets, video final cuts, and codebases to the client. We reserve the right to display the final work in our portfolios unless otherwise agreed under an NDA.
                </p>
              </div>

              <hr className="border-white/5" />

              <div>
                <h2 className="text-xl font-bold text-white mb-4">4. Project Termination</h2>
                <p className="text-sm text-gray-400 leading-relaxed font-light">
                  Either party may terminate the project engagement with written notice if the other party breaches the project agreements. Completed milestones up to the date of termination will be invoiced proportionally.
                </p>
              </div>

              <hr className="border-white/5" />

              <div>
                <h2 className="text-xl font-bold text-white mb-4">5. Governing Law</h2>
                <p className="text-sm text-gray-400 leading-relaxed font-light">
                  These terms are governed and interpreted under the laws of Ahmedabad, Gujarat, India. Any disputes arising out of project deliverables will be subject to local Ahmedabad jurisdiction.
                </p>
              </div>
            </div>
          </div>
        </main>

        <FooterSection />
      </div>
    </PageTransition>
  );
}
