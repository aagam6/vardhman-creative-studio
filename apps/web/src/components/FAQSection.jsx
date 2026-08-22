import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, HelpCircle } from 'lucide-react';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "What is your typical project turnaround time?",
      answer: "Turnaround times depend on the project's scale. Visual identity packages usually take 1-2 weeks, custom web design and development takes 3-4 weeks, and cinematic video editing projects are completed within 7-10 days."
    },
    {
      question: "Do you work with remote clients?",
      answer: "Yes, absolutely! We partner with brands and businesses globally. We manage project updates, design revisions, and communications seamlessly via Zoom, WhatsApp, and email."
    },
    {
      question: "How does your pricing structure work?",
      answer: "We believe in transparency. We provide fixed-price proposals based on your project description. There are no hidden fees. For ongoing support, we also offer custom monthly retainers."
    },
    {
      question: "Will I have complete ownership of the final assets?",
      answer: "Yes, 100%. Upon project completion and final payment, all intellectual property, source files, codebase repositories, and high-resolution design exports belong entirely to you."
    }
  ];

  return (
    <section id="faq" className="py-24 md:py-32 relative z-10 bg-background text-left border-t border-white/5">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-purple-500 mb-3">Questions & Answers</p>
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={index}
                className="overflow-hidden rounded-2xl border border-white/5 bg-[#070d17]/50 backdrop-blur-md transition-all duration-300 hover:border-white/10"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left text-white focus:outline-none"
                >
                  <span className="flex items-center gap-3 font-semibold text-sm sm:text-base pr-4">
                    <HelpCircle className="h-5 w-5 text-purple-500 shrink-0" />
                    {faq.question}
                  </span>
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/5 text-purple-400">
                    {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="p-6 pt-0 border-t border-white/5 text-xs sm:text-sm text-gray-400 font-light leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
