import React from 'react';
import { Helmet } from 'react-helmet';
import { ArrowLeft, ShieldCheck, Mail, Phone, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { contactConfig } from '@/lib/contactConfig';
import EventFooter from '@/components/EventFooter.jsx';

export default function PrivacyPolicyPage() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy & Terms - Param Vir Chakra Shaurya Gatha</title>
        <meta name="description" content="Official Privacy Policy and Terms & Conditions for Param Vir Chakra – Shaurya Gatha event organised by Shri Vardhman Shwetambar Murtipujak Jain Sangh." />
      </Helmet>

      <main className="min-h-screen bg-[#050b14] text-white relative py-12 px-5 lg:px-8">
        {/* Decorative background glow */}
        <div className="absolute left-1/4 top-1/4 -z-10 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ff9933]/5 blur-[120px] pointer-events-none" />
        <div className="absolute right-1/4 bottom-1/4 -z-10 h-[400px] w-[400px] translate-x-1/2 translate-y-1/2 rounded-full bg-[#138808]/5 blur-[120px] pointer-events-none" />

        <div className="mx-auto max-w-4xl">
          {/* Back Button */}
          <Link 
            to="/param-vir-chakra" 
            className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-white/10 hover:border-white/20 mb-8"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Event
          </Link>

          {/* Plaque Header */}
          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#0c1a2e]/60 p-8 md:p-12 shadow-[0_30px_70px_rgba(0,0,0,0.5)] backdrop-blur-2xl mb-8">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#ff9933] via-white to-[#138808]" />
            <div className="flex justify-center mb-6">
              <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#ff9933]/10 border border-[#ff9933]/30 text-[#ff9933]">
                <ShieldCheck className="h-8 w-8 stroke-[1.8]" />
              </span>
            </div>
            <h1 className="text-center font-serif text-3xl font-bold tracking-tight text-white md:text-5xl">Privacy Policy & Terms</h1>
            <p className="text-center text-sm font-bold uppercase tracking-[0.2em] text-[#ff9933] mt-3">गोपनीयता नीति एवं नियम-शर्तें</p>
            <p className="text-center text-white/50 text-xs mt-4">Last Updated: July 2026</p>
          </div>

          {/* Content Card */}
          <div className="rounded-3xl border border-white/5 bg-[#0a1120]/40 p-8 md:p-10 space-y-8 backdrop-blur-md">
            <div>
              <h2 className="font-serif text-xl font-bold text-white mb-3">1. Information We Collect</h2>
              <p className="text-white/70 leading-relaxed text-sm">
                When you register for the <strong>Param Vir Chakra – Shaurya Gatha</strong> event via the Google Form, we collect personal information such as:
              </p>
              <ul className="list-disc list-inside text-white/60 text-sm mt-3 space-y-1.5 ml-4">
                <li>Full Name (पूरा नाम)</li>
                <li>WhatsApp Phone Number (व्हाट्सएप नंबर)</li>
                <li>Age & City (आयु और शहर)</li>
                <li>Email Address (ईमेल पता)</li>
              </ul>
            </div>

            <hr className="border-white/5" />

            <div>
              <h2 className="font-serif text-xl font-bold text-white mb-3">2. How We Use Your Information</h2>
              <p className="text-white/70 leading-relaxed text-sm">
                The collected information is used solely for organizing the event and managing entry. Specifically:
              </p>
              <ul className="list-disc list-inside text-white/60 text-sm mt-3 space-y-1.5 ml-4">
                <li>To verify your registration details.</li>
                <li>To send entry passes and confirmation messages via WhatsApp.</li>
                <li>To provide important event updates and schedules.</li>
              </ul>
            </div>

            <hr className="border-white/5" />

            <div>
              <h2 className="font-serif text-xl font-bold text-white mb-3">3. Data Protection & Sharing</h2>
              <p className="text-white/70 leading-relaxed text-sm">
                We value your trust. We do not sell, rent, trade, or share your personal information with any third-party marketing companies or external entities. Your data remains strictly confidential and secure under the event organizing committee.
              </p>
            </div>

            <hr className="border-white/5" />

            <div>
              <h2 className="font-serif text-xl font-bold text-white mb-3">4. Terms & Conditions (नियम और शर्तें)</h2>
              <p className="text-white/70 leading-relaxed text-sm mb-4">
                By registering for the event, you agree to follow and abide by these official terms and conditions:
              </p>
              <ol className="list-decimal list-inside text-white/60 text-sm space-y-3.5 ml-2 leading-relaxed">
                <li>Registration is completely FREE but advance registration is mandatory.</li>
                <li>Seats are limited and registrations will be confirmed on a first-come, first-served basis.</li>
                <li>After successful registration, participants will receive a WhatsApp message containing the Pass Collection details.</li>
                <li>Participants must visit the designated Pass Collection Centre to collect their Official Physical Entry Pass before the event.</li>
                <li>Only participants carrying a valid Physical Entry Pass will be allowed entry into Dinesh Hall.</li>
                <li>Participants must provide accurate information. Incorrect or misleading information may result in cancellation of registration.</li>
                <li>The organisers reserve the right to approve, reject, or cancel any registration without assigning any reason.</li>
                <li>The event schedule, venue, speakers, or programme may change due to unavoidable circumstances.</li>
                <li><strong>Photography & Media Consent:</strong> Photography and videography may be conducted during the event. By registering, participants consent to the use of their photographs and videos for promotional and documentation purposes.</li>
                <li>By submitting the registration form, you confirm that you have read, understood, and agreed to all the above Terms & Conditions.</li>
              </ol>
            </div>

            <hr className="border-white/5" />

            <div>
              <h2 className="font-serif text-xl font-bold text-white mb-3">5. Contact & Support</h2>
              <p className="text-white/70 leading-relaxed text-sm mb-4">
                If you have questions regarding your registration, entry passes, or privacy details, please contact:
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <a href={`tel:${contactConfig.contactPhone.replace(/\s+/g, '')}`} className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 flex items-start gap-4 hover:bg-white/5 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#ff9933]">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#138808]/10 text-[#138808] border border-[#138808]/20">
                    <Phone className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs uppercase text-white/50 font-bold tracking-wider">Call / Support</p>
                    <p className="text-sm font-bold text-white mt-1">{contactConfig.contactPhone}</p>
                  </div>
                </a>

                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ff9933]/10 text-[#ff9933] border border-[#ff9933]/20">
                    <Clock className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs uppercase text-white/50 font-bold tracking-wider">Timings</p>
                    <p className="text-sm font-bold text-white mt-1">Mon to Sat (10 am to 6 pm)</p>
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-white/5" />

            <div className="text-center pt-4">
              <p className="text-xs text-white/40">
                Organised with pride by <strong>Shri Vardhman Shwetambar Murtipujak Jain Sangh</strong>, Usmanpura, Ahmedabad.
              </p>
            </div>
          </div>
        </div>
      </main>
      <EventFooter />
    </>
  );
}
