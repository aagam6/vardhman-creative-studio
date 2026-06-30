import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Instagram, Linkedin, Twitter, Sparkles, Film, Palette, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient';
import AnimatedHeading from '@/components/AnimatedHeading.jsx';
import AnimatedSection, { AnimatedItem } from '@/components/AnimatedSection.jsx';
import HoverCard from '@/components/HoverCard.jsx';

const ComingSoonPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      await pb.collection('leads').create(formData, { $autoCancel: false });
      toast.success('Thank you for your interest. We will be in touch soon.');
      setFormData({
        name: '',
        email: '',
        company: '',
        message: '',
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const services = [
    {
      icon: Film,
      title: 'Cinematic visuals',
      description: 'Powerful video production that captures attention and tells your story with emotional depth.',
    },
    {
      icon: Sparkles,
      title: 'Brand storytelling',
      description: 'Strategic narratives that connect with your audience and build lasting brand recognition.',
    },
    {
      icon: Palette,
      title: 'Creative experiences',
      description: 'Immersive campaigns and interactive content that engage and inspire action.',
    },
    {
      icon: Zap,
      title: 'Visual design',
      description: 'Bold, memorable design systems that elevate your brand across every touchpoint.',
    },
  ];

  return (
    <>
      <Helmet>
        <title>Vardhman Creative Studio - Something Extraordinary is Coming</title>
        <meta 
          name="description" 
          content="We are crafting powerful visuals, cinematic stories, and creative experiences that elevate your brand. Get early access to Vardhman Creative Studio." 
        />
      </Helmet>

      <div className="min-h-screen bg-background text-foreground">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: 'url(https://images.unsplash.com/photo-1687371804876-0f70072af9aa)',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/90 to-background" />
            <div className="absolute inset-0 cinematic-gradient opacity-60" />
          </div>

          {/* Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="inline-block mb-6"
              >
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
                  <Sparkles className="w-4 h-4" />
                  Coming Soon
                </span>
              </motion.div>

              <h1 
                className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
                style={{ letterSpacing: '-0.02em' }}
              >
                <span className="block">Something Extraordinary</span>
                <span className="block text-gradient">is Coming</span>
              </h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed"
              >
                We are crafting powerful visuals, cinematic stories, and creative experiences that elevate your brand.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <Button 
                  size="lg"
                  className="text-lg px-8 py-6 bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] transition-all duration-200 animate-glow-pulse"
                  onClick={() => {
                    document.getElementById('early-access').scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Get Early Access
                </Button>
              </motion.div>
            </motion.div>
          </div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-6 h-10 border-2 border-primary/30 rounded-full flex items-start justify-center p-2"
            >
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="w-1.5 h-1.5 bg-primary rounded-full"
              />
            </motion.div>
          </motion.div>
        </section>

        {/* About Teaser Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background" />
          
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <AnimatedHeading 
              as="h2"
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight"
              style={{ letterSpacing: '-0.02em' }}
            >
              Vardhman Creative Studio
            </AnimatedHeading>

            <AnimatedSection delay={0.2}>
              <AnimatedItem>
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                  We believe in the power of visual storytelling. Every frame, every word, every experience is crafted to resonate, inspire, and drive meaningful connections between brands and their audiences.
                </p>
              </AnimatedItem>
            </AnimatedSection>
          </div>
        </section>

        {/* Services Preview Section */}
        <section className="py-24 bg-card/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedHeading 
              as="h2"
              className="text-3xl md:text-4xl font-bold text-center mb-16"
              style={{ letterSpacing: '-0.02em' }}
            >
              What we create
            </AnimatedHeading>

            <AnimatedSection stagger={0.15}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {services.map((service, index) => {
                  const Icon = service.icon;
                  return (
                    <AnimatedItem key={index}>
                      <HoverCard glowEffect>
                        <div className="bg-card border border-border rounded-2xl p-8 h-full">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Icon className="w-6 h-6 text-primary" />
                              </div>
                            </div>
                            <div>
                              <h3 className="text-xl font-semibold mb-3 text-card-foreground">
                                {service.title}
                              </h3>
                              <p className="text-muted-foreground leading-relaxed">
                                {service.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      </HoverCard>
                    </AnimatedItem>
                  );
                })}
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Email Lead Capture Section */}
        <section id="early-access" className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 cinematic-gradient opacity-40" />
          
          <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedHeading 
              as="h2"
              className="text-3xl md:text-4xl font-bold text-center mb-6"
              style={{ letterSpacing: '-0.02em' }}
            >
              Get early access
            </AnimatedHeading>

            <AnimatedSection delay={0.2}>
              <AnimatedItem>
                <p className="text-lg text-muted-foreground text-center mb-12">
                  Be among the first to experience our creative services. Share your details and we will reach out when we launch.
                </p>
              </AnimatedItem>

              <AnimatedItem>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Input
                        type="text"
                        name="name"
                        placeholder="Your name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="bg-card border-border text-card-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary transition-all duration-200"
                      />
                    </div>
                    <div>
                      <Input
                        type="email"
                        name="email"
                        placeholder="Your email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="bg-card border-border text-card-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div>
                    <Input
                      type="text"
                      name="company"
                      placeholder="Company name (optional)"
                      value={formData.company}
                      onChange={handleChange}
                      className="bg-card border-border text-card-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary transition-all duration-200"
                    />
                  </div>

                  <div>
                    <Textarea
                      name="message"
                      placeholder="Tell us about your project or interests (optional)"
                      value={formData.message}
                      onChange={handleChange}
                      rows={4}
                      className="bg-card border-border text-card-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary transition-all duration-200 resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Submitting...' : 'Join the Waitlist'}
                  </Button>
                </form>
              </AnimatedItem>
            </AnimatedSection>
          </div>
        </section>

        {/* Footer Section */}
        <footer className="py-12 border-t border-border bg-card/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <span className="text-xl font-bold text-card-foreground">Vardhman Creative Studio</span>
                <p className="text-sm text-muted-foreground mt-1">Crafting extraordinary visual experiences</p>
              </div>

              <div className="flex items-center gap-6">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors duration-200"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors duration-200"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors duration-200"
                  aria-label="Twitter"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
              <p>&copy; 2026 Vardhman Creative Studio. All rights reserved.</p>
              <div className="flex items-center gap-6">
                <a href="#" className="hover:text-primary transition-colors duration-200">
                  Privacy Policy
                </a>
                <a href="#" className="hover:text-primary transition-colors duration-200">
                  Terms of Service
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default ComingSoonPage;