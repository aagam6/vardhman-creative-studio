import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ContactFormSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: 'video',
    budget: 'mid',
    message: ''
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill out all required fields.');
      return;
    }

    setLoading(true);

    // Simulate API lead ingestion
    setTimeout(() => {
      setLoading(false);
      toast.success('Thank you! Your message has been sent successfully. We will contact you soon.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        service: 'video',
        budget: 'mid',
        message: ''
      });
    }, 1500);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <section id="contact" className="py-24 md:py-32 relative z-10 bg-background noise-bg">
      {/* Top Glow Divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-12 lg:gap-16">
          
          {/* Left Column: Contact info & Studio Details */}
          <div className="flex flex-col justify-between text-left">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-purple-500 mb-3">Get In Touch</p>
              <h2 className="font-serif text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight">
                Let's Build Something<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300">
                  Extraordinary.
                </span>
              </h2>
              <p className="mt-6 text-sm sm:text-base text-gray-400 leading-relaxed font-light">
                Have a project in mind, want to request a quote, or just want to chat? Fill out the form, and our creative team will get back to you within 24 hours.
              </p>

              {/* Contact info deck */}
              <div className="mt-8 space-y-5">
                <a href="tel:+917990106225" className="flex items-center gap-4 group">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/10 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
                    <Phone className="h-5 w-5" />
                  </span>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Call Us / WhatsApp</span>
                    <span className="text-sm font-semibold text-white/90 group-hover:text-purple-400 transition-colors">+91 79901 06225</span>
                  </div>
                </a>

                <a href="mailto:vardhmancreativestudio@gmail.com" className="flex items-center gap-4 group">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/10 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
                    <Mail className="h-5 w-5" />
                  </span>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Email Address</span>
                    <span className="text-sm font-semibold text-white/90 group-hover:text-purple-400 transition-colors">vardhmancreativestudio@gmail.com</span>
                  </div>
                </a>
              </div>
            </div>

            {/* Quick trust highlights */}
            <div className="mt-12 pt-8 border-t border-white/5 hidden lg:block">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-4">Why Partner With Us</p>
              <div className="grid grid-cols-2 gap-4">
                <span className="flex items-center gap-2 text-xs text-gray-400 font-light">
                  <CheckCircle2 className="h-4 w-4 text-purple-500" /> Cinematic Quality
                </span>
                <span className="flex items-center gap-2 text-xs text-gray-400 font-light">
                  <CheckCircle2 className="h-4 w-4 text-purple-500" /> Result Oriented
                </span>
                <span className="flex items-center gap-2 text-xs text-gray-400 font-light">
                  <CheckCircle2 className="h-4 w-4 text-purple-500" /> Quick Delivery
                </span>
                <span className="flex items-center gap-2 text-xs text-gray-400 font-light">
                  <CheckCircle2 className="h-4 w-4 text-purple-500" /> Transparent Pricing
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Inquiry Form Card */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#070d19]/80 p-8 sm:p-10 shadow-2xl backdrop-blur-xl"
          >
            {/* Ambient saffron/purple top header bar */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500" />
            
            <form onSubmit={handleSubmit} className="space-y-6 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Name */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-gray-400">Full Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your name"
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-purple-500 focus:bg-white/10 focus:ring-1 focus:ring-purple-500 focus:outline-none transition-all"
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-gray-400">Email Address <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter email address"
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-purple-500 focus:bg-white/10 focus:ring-1 focus:ring-purple-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Phone */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-gray-400">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-purple-500 focus:bg-white/10 focus:ring-1 focus:ring-purple-500 focus:outline-none transition-all"
                  />
                </div>

                {/* Service required */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="service" className="text-xs font-bold uppercase tracking-wider text-gray-400">Service Required</label>
                  <select
                    id="service"
                    name="service"
                    value={formData.service}
                    onChange={handleInputChange}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3.5 text-sm text-white focus:border-purple-500 focus:bg-[#070d19] focus:outline-none transition-all"
                  >
                    <option value="video" className="bg-[#070d19] text-white">Cinematic Video Production</option>
                    <option value="branding" className="bg-[#070d19] text-white">Visual & Brand Identity</option>
                    <option value="web" className="bg-[#070d19] text-white">Web Design & Development</option>
                    <option value="campaign" className="bg-[#070d19] text-white">Creative Launch Campaign</option>
                  </select>
                </div>
              </div>

              {/* Message */}
              <div className="flex flex-col gap-2">
                <label htmlFor="message" className="text-xs font-bold uppercase tracking-wider text-gray-400">Project Description <span className="text-red-500">*</span></label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  placeholder="Tell us about your brand, goals, and project details..."
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-purple-500 focus:bg-white/10 focus:ring-1 focus:ring-purple-500 focus:outline-none transition-all resize-none"
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm uppercase tracking-wider transition-all duration-300 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/35 hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? (
                  <span>Sending Message...</span>
                ) : (
                  <>
                    Send Inquiry <Send className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
