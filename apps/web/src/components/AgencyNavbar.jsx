import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function AgencyNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', href: '/', isHash: true, targetId: '#home' },
    { label: 'About', href: '/about', isHash: false },
    { label: 'Services', href: '/services', isHash: false },
    { label: 'Portfolio', href: '/#portfolio', isHash: true, targetId: '#portfolio' },
    { label: 'Contact', href: '/#contact', isHash: true, targetId: '#contact' },
  ];

  const handleLinkClick = (e, link) => {
    const isHomePage = location.pathname === '/' || location.pathname === '';
    
    if (link.isHash) {
      if (isHomePage) {
        e.preventDefault();
        setMenuOpen(false);
        const element = document.querySelector(link.targetId);
        if (element) {
          const offset = 80;
          const bodyRect = document.body.getBoundingClientRect().top;
          const elementRect = element.getBoundingClientRect().top;
          const elementPosition = elementRect - bodyRect;
          const offsetPosition = elementPosition - offset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      } else {
        // Allow normal navigation by letting React Router change the path to /#hash
        setMenuOpen(false);
      }
    } else {
      setMenuOpen(false);
    }
  };

  const handleLogoClick = (e) => {
    const isHomePage = location.pathname === '/' || location.pathname === '';
    if (isHomePage) {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
    setMenuOpen(false);
  };

  return (
    <nav className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-black/85 backdrop-blur-md border-b border-white/5 py-4' 
        : 'bg-transparent py-6'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo / Brand Name (Two line layout aligned perfectly) */}
        <Link 
          to="/" 
          onClick={handleLogoClick}
          className="flex flex-col items-center leading-[1.1] group text-center"
        >
          <span className="text-xl font-black tracking-[0.16em] text-white uppercase transition-opacity duration-300 group-hover:opacity-85">
            Vardhman
          </span>
          <span className="text-[9px] font-bold tracking-[0.24em] text-gray-400 uppercase mt-0.5">
            Creative Studio
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              onClick={(e) => handleLinkClick(e, link)}
              className="text-[13px] font-semibold uppercase tracking-wider text-gray-400 hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop CTA Button */}
        <div className="hidden md:block">
          <Button
            size="sm"
            onClick={(e) => handleLinkClick(e, { href: '/#contact', isHash: true, targetId: '#contact' })}
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-full text-xs font-bold uppercase tracking-wider px-6"
          >
            Let's Talk <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Mobile Menu Trigger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          className="md:hidden text-white hover:text-purple-500 transition-colors focus:outline-none"
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 top-[65px] z-40 bg-black/95 backdrop-blur-lg border-t border-white/5 md:hidden animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] gap-8 px-6 text-center">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                onClick={(e) => handleLinkClick(e, link)}
                className="text-xl font-bold uppercase tracking-widest text-gray-300 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Button
              size="lg"
              onClick={(e) => handleLinkClick(e, { href: '/#contact', isHash: true, targetId: '#contact' })}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-full text-sm font-bold uppercase tracking-wider mt-4"
            >
              Let's Talk <ArrowUpRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
