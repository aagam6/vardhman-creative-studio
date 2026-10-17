import React from 'react';
import {contactConfig} from '@/lib/contactConfig';
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
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Last Updated: 17 October 2026</span>
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
                  Project inquiry details are used to process your creative project request. Event registration details are used as described in the event section below. Specifically, we use your info to send quotation proposals, coordinate scheduling and design revisions, and transmit final project deliverables. We do not use your information for spam or unsolicited marketing list-building.
                </p>
              </div>

              <hr className="border-white/5" />

              <div>
                <h2 className="text-xl font-bold text-white mb-4">3. Data Access and Service Providers</h2>
                <p className="text-sm text-gray-400 leading-relaxed font-light">
                  Access to registration and project information is limited to the people and service providers who need it to operate the website, manage registrations or deliver the requested service. Hosting and WhatsApp messaging providers may process relevant information for these purposes. No website or transmission method can guarantee absolute security.
                </p>
              </div>

              <hr className="border-white/5" />

              <div>
                <h2 className="text-xl font-bold text-white mb-4">4. Cookies and Analytics</h2>
                <p className="text-sm text-gray-400 leading-relaxed font-light">
                  The website uses session cookies for administrator sign-in. Google Analytics measures public page visits, registration steps, successful bookings and help WhatsApp button clicks, with the programme date and pass count. It may use cookies and browser/device identifiers under Google's privacy policy. Our analytics integration excludes administrator and private pass pages, removes URL query parameters and fragments, and does not send booking names, phone numbers, booking numbers or pass numbers. Advertising personalization and Google signals are disabled. You can manage cookies through your browser settings.
                </p>
              </div>

              <hr className="border-white/5" />

              <div>
                <h2 className="text-xl font-bold text-white mb-4" lang="gu">૫૦૦ આયંબિલ કાર્યક્રમનું રજિસ્ટ્રેશન</h2>
                <div lang="gu" className="text-sm text-gray-300 leading-loose space-y-4">
                  <p>ફોર્મમાં તમારું નામ, WhatsApp નંબર, પસંદ કરેલી સાંજ અને સાથે આવનાર લોકોનાં નામ લેવામાં આવે છે. તમે કામ અને કાર્યક્રમની જાણ ક્યાંથી થઈ તે પણ આપી શકો છો; આ બે વિગતો આપવી જરૂરી નથી.</p>
                  <p>આ માહિતી રજિસ્ટ્રેશન તપાસવા, દરેક વ્યક્તિનો પાસ બનાવવા, પ્રવેશ ગોઠવવા અને તમારી મંજૂરીથી WhatsApp પર કન્ફર્મેશન, પાસ અથવા કાર્યક્રમની જરૂરી માહિતી મોકલવા વપરાય છે. WhatsAppની મંજૂરી અલગ જાહેરાતો મોકલવાની મંજૂરી નથી.</p>
                  <p>આયોજકો અને અધિકૃત વ્યવસ્થાપકો રજિસ્ટ્રેશન તથા પાસની વિગતો જોઈ શકે છે. WhatsApp સેવા માટે નંબર અને સંદેશની જરૂરી વિગતો messaging provider અને WhatsApp/Meta સુધી જાય છે. એક ફોર્મમાં બીજા લોકોનાં નામ આપતાં પહેલાં તેમની મંજૂરી લો.</p>
                  <p>પાસ, સંદેશની સ્થિતિ અને રજિસ્ટ્રેશનના ફેરફારોની નોંધ કાર્યક્રમનું સંચાલન અને સમસ્યાઓ તપાસવા માટે રાખવામાં આવે છે. તમારી માહિતી સુધારવા કે કાઢવાની વિનંતી માટે નીચે આપેલા contact પર સંપર્ક કરો. માત્ર booking cancel કરવાથી તેની બધી નોંધો આપમેળે delete થતી નથી.</p>
                  <p>કાર્યક્રમ દરમિયાન ફોટા અને વિડિયો લેવામાં આવી શકે છે. રજિસ્ટ્રેશનના નિયમોમાં જણાવ્યા મુજબ તેનો ઉપયોગ કાર્યક્રમના પ્રચાર અને નોંધ માટે થઈ શકે છે. આ અંગે પ્રશ્ન હોય તો આયોજકોનો સંપર્ક કરો.</p>
                  <p>તમારો પાસ ફક્ત જેનું નામ લખેલું હોય તે વ્યક્તિ સાથે શેર કરો. પાસની ખાનગી download link જાહેરમાં મૂકશો નહીં.</p>
                </div>
              </div>
              <hr className="border-white/5" />
              <div>
                <h2 className="text-xl font-bold text-white mb-4">6. Contact Support</h2>
                <p className="text-sm text-gray-400 leading-relaxed font-light mb-6">
                  For questions regarding this policy or to request data removal, please contact our support desk:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <Mail className="w-5 h-5 text-purple-400" />
                    <span className="text-xs sm:text-sm text-gray-300">{contactConfig.supportEmail}</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <Phone className="w-5 h-5 text-purple-400" />
                    <span className="text-xs sm:text-sm text-gray-300">{contactConfig.contactPhone}</span>
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
