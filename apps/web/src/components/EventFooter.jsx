import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Instagram, Facebook, Linkedin, Youtube, Twitter, Phone, Mail, MessageCircle, ChevronRight, Globe } from 'lucide-react';
import { contactConfig } from '@/lib/contactConfig';

export default function EventFooter() {
  const location = useLocation();
  const currentYear = new Date().getFullYear();
  const isParamVirChakraPage = location.pathname === '/param-vir-chakra';

  // Helper to determine if link is active
  const isLinkActive = (path) => {
    return location.pathname === path;
  };

  const getSocialIcon = (url) => {
    if (url.includes('instagram.com')) return <Instagram className="h-5 w-5" />;
    if (url.includes('facebook.com')) return <Facebook className="h-5 w-5" />;
    if (url.includes('linkedin.com')) return <Linkedin className="h-5 w-5" />;
    if (url.includes('youtube.com')) return <Youtube className="h-5 w-5" />;
    if (url.includes('x.com') || url.includes('twitter.com')) return <Twitter className="h-5 w-5" />;
    return <Globe className="h-5 w-5" />;
  };

  const getSocialLabel = (url) => {
    if (url.includes('instagram.com')) return 'Instagram';
    if (url.includes('facebook.com')) return 'Facebook';
    if (url.includes('linkedin.com')) return 'LinkedIn';
    if (url.includes('youtube.com')) return 'YouTube';
    if (url.includes('x.com') || url.includes('twitter.com')) return 'X (Twitter)';
    return 'Social';
  };

  return (
    <footer className="relative overflow-hidden bg-[#050b13] text-white/80 border-t border-white/10 px-5 pt-16 pb-8 lg:px-8 z-10">
      {/* Background glow layers */}
      <div className="absolute left-1/2 bottom-0 -z-10 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-[#ff9933]/5 blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-7xl">
        
        {/* Main 4-Column Grid */}
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4 mb-12">
          
          {/* SECTION 1: Quick Links */}
          <div>
            <h4 className="font-serif text-lg font-bold text-white mb-5 tracking-wide">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              <li>
                {isParamVirChakraPage ? (
                  <a href="#hero" className="flex items-center gap-1.5 hover:text-[#ff9933] transition-colors">
                    <ChevronRight className="h-3 w-3" /> Home
                  </a>
                ) : (
                  <Link to="/param-vir-chakra#hero" className="flex items-center gap-1.5 hover:text-[#ff9933] transition-colors">
                    <ChevronRight className="h-3 w-3" /> Home
                  </Link>
                )}
              </li>
              <li>
                {isParamVirChakraPage ? (
                  <a href="#about" className="flex items-center gap-1.5 hover:text-[#ff9933] transition-colors">
                    <ChevronRight className="h-3 w-3" /> About Event
                  </a>
                ) : (
                  <Link to="/param-vir-chakra#about" className="flex items-center gap-1.5 hover:text-[#ff9933] transition-colors">
                    <ChevronRight className="h-3 w-3" /> About Event
                  </Link>
                )}
              </li>
              <li>
                {isParamVirChakraPage ? (
                  <a href="#registration" className="flex items-center gap-1.5 hover:text-[#ff9933] transition-colors">
                    <ChevronRight className="h-3 w-3" /> Registration
                  </a>
                ) : (
                  <Link to="/param-vir-chakra#registration" className="flex items-center gap-1.5 hover:text-[#ff9933] transition-colors">
                    <ChevronRight className="h-3 w-3" /> Registration
                  </Link>
                )}
              </li>
              <li>
                <Link 
                  to="/pass-collection" 
                  className={`flex items-center gap-1.5 transition-colors ${
                    isLinkActive('/pass-collection') ? 'text-[#ff9933] font-semibold' : 'hover:text-[#ff9933]'
                  }`}
                >
                  <ChevronRight className="h-3 w-3" /> Pass Collection
                </Link>
              </li>
              <li>
                {isParamVirChakraPage ? (
                  <a href="#faq" className="flex items-center gap-1.5 hover:text-[#ff9933] transition-colors">
                    <ChevronRight className="h-3 w-3" /> FAQ
                  </a>
                ) : (
                  <Link to="/param-vir-chakra#faq" className="flex items-center gap-1.5 hover:text-[#ff9933] transition-colors">
                    <ChevronRight className="h-3 w-3" /> FAQ
                  </Link>
                )}
              </li>
            </ul>
          </div>

          {/* SECTION 2: Legal Links */}
          <div>
            <h4 className="font-serif text-lg font-bold text-white mb-5 tracking-wide">Legal</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link 
                  to="/privacy-policy" 
                  className={`flex items-center gap-1.5 transition-colors ${
                    isLinkActive('/privacy-policy') ? 'text-[#ff9933] font-semibold' : 'hover:text-[#ff9933]'
                  }`}
                >
                  <ChevronRight className="h-3 w-3" /> Privacy Policy
                </Link>
              </li>
              <li>
                <Link 
                  to="/privacy-policy#terms" 
                  className="flex items-center gap-1.5 hover:text-[#ff9933] transition-colors"
                >
                  <ChevronRight className="h-3 w-3" /> Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* SECTION 3: Contact */}
          <div>
            <h4 className="font-serif text-lg font-bold text-white mb-5 tracking-wide">Contact</h4>
            <ul className="space-y-4 text-sm">
              <li>
                <a 
                  href={`tel:${contactConfig.contactPhone.replace(/\s+/g, '')}`} 
                  className="flex items-start gap-2.5 hover:text-[#ff9933] transition-colors group"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 border border-white/10 group-hover:border-[#ff9933]/30 transition-colors">
                    <Phone className="h-4 w-4 text-[#ff9933]" />
                  </span>
                  <div>
                    <span className="block text-xs text-white/40 uppercase tracking-wider font-bold">Call Support</span>
                    <span className="font-medium text-white">{contactConfig.contactPhone}</span>
                  </div>
                </a>
              </li>
              <li>
                <a 
                  href={`https://wa.me/${contactConfig.contactWhatsApp.replace(/[^\d+]/g, '')}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-start gap-2.5 hover:text-[#ff9933] transition-colors group"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#138808]/10 border border-[#138808]/20 group-hover:border-[#138808]/40 transition-colors">
                    <MessageCircle className="h-4 w-4 text-[#138808]" />
                  </span>
                  <div>
                    <span className="block text-xs text-white/40 uppercase tracking-wider font-bold">WhatsApp</span>
                    <span className="font-medium text-white">{contactConfig.contactWhatsApp}</span>
                  </div>
                </a>
              </li>
              <li>
                <a 
                  href={`mailto:${contactConfig.supportEmail}`} 
                  className="flex items-start gap-2.5 hover:text-[#ff9933] transition-colors group"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 border border-white/10 group-hover:border-[#ff9933]/30 transition-colors">
                    <Mail className="h-4 w-4 text-[#ff9933]" />
                  </span>
                  <div>
                    <span className="block text-xs text-white/40 uppercase tracking-wider font-bold">Email Us</span>
                    <span className="font-medium text-white break-all">{contactConfig.supportEmail}</span>
                  </div>
                </a>
              </li>
            </ul>
          </div>

          {/* SECTION 4: Follow Us */}
          <div>
            <h4 className="font-serif text-lg font-bold text-white mb-5 tracking-wide">Follow Us</h4>
            <p className="text-xs text-white/50 leading-relaxed mb-4 font-light">
              Follow Vardhman Creative Studio for patriotic events, media design, and updates.
            </p>
            <div className="flex flex-wrap gap-3">
              {contactConfig.orgSocials.map((url, idx) => (
                <a 
                  key={idx} 
                  href={url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label={getSocialLabel(url)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#ff9933]/40 hover:text-white transition-all duration-300 text-white/70 focus-visible:ring-2 focus-visible:ring-[#ff9933] outline-none"
                >
                  {getSocialIcon(url)}
                </a>
              ))}
            </div>
          </div>

        </div>

        {/* BOTTOM AREA */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/40 text-center md:text-left">
          <div>
            <p>Official Event Website: <Link to="/param-vir-chakra" className="text-white/70 hover:text-[#ff9933] transition-colors font-medium">Param Vir Chakra – Shauryagatha</Link></p>
            <p className="mt-1">Copyright © {currentYear} {contactConfig.orgName}. All Rights Reserved.</p>
          </div>
          <div className="md:text-right">
            <p>
              Powered by{' '}
              <a 
                href={contactConfig.orgWebsite} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-white/60 hover:text-[#ff9933] transition-colors font-semibold"
              >
                {contactConfig.orgName}
              </a>
            </p>
          </div>
        </div>

      </div>
    </footer>
  );
}
