import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import pb from '@/lib/pocketbaseClient';
import AnimatedSection, { AnimatedItem } from './AnimatedSection.jsx';
import AnimatedHeading from './AnimatedHeading.jsx';

const LeadCaptureSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await pb.collection('leads').create(formData, { $autoCancel: false });
      setIsSuccess(true);
      toast.success('Successfully joined the waitlist!');
      setTimeout(() => {
        setFormData({ name: '', email: '', company: '', message: '' });
        setIsSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to join waitlist. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="early-access" className="py-32 relative z-10 bg-background noise-bg">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <AnimatedItem>
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="glass-effect rounded-3xl p-8 md:p-12 border border-border/50 relative overflow-hidden shadow-2xl"
            >
              {/* Subtle background glow inside card */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-md bg-primary/10 blur-[120px] pointer-events-none" />

              <div className="text-center mb-12 relative z-10">
                <AnimatedHeading as="h2" className="text-3xl md:text-4xl mb-4">
                  Get Early Access
                </AnimatedHeading>
                <p className="text-muted-foreground tracking-wide">
                  We'll only reach out when something truly worth your attention is ready.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label htmlFor="name" className="text-foreground/80 tracking-wide">Name <span className="text-primary">*</span></Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className={`bg-background/50 border-border/50 focus:border-primary/50 focus:bg-[hsl(0,0%,8%)] focus:shadow-[0_0_15px_rgba(168,85,247,0.5)] transition-all duration-300 placeholder:text-[hsl(270,50%,60%)]/50 h-12 ${errors.name ? 'border-destructive' : ''}`}
                    />
                    {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="email" className="text-foreground/80 tracking-wide">Email <span className="text-primary">*</span></Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      className={`bg-background/50 border-border/50 focus:border-primary/50 focus:bg-[hsl(0,0%,8%)] focus:shadow-[0_0_15px_rgba(168,85,247,0.5)] transition-all duration-300 placeholder:text-[hsl(270,50%,60%)]/50 h-12 ${errors.email ? 'border-destructive' : ''}`}
                    />
                    {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="company" className="text-foreground/80 tracking-wide">Company (Optional)</Label>
                  <Input
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="Your Brand Inc."
                    className="bg-background/50 border-border/50 focus:border-primary/50 focus:bg-[hsl(0,0%,8%)] focus:shadow-[0_0_15px_rgba(168,85,247,0.5)] transition-all duration-300 placeholder:text-[hsl(270,50%,60%)]/50 h-12"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="message" className="text-foreground/80 tracking-wide">Message (Optional)</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us about your vision..."
                    rows={4}
                    className="bg-background/50 border-border/50 focus:border-primary/50 focus:bg-[hsl(0,0%,8%)] focus:shadow-[0_0_15px_rgba(168,85,247,0.5)] transition-all duration-300 placeholder:text-[hsl(270,50%,60%)]/50 resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting || isSuccess}
                  className={`w-full py-7 text-lg rounded-xl transition-all duration-300 ${
                    isSuccess 
                      ? 'bg-green-600 hover:bg-green-600 text-white' 
                      : 'bg-primary text-primary-foreground hover:bg-primary/90 hover:glow-sm hover:scale-[1.02]'
                  } disabled:opacity-80`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Joining...
                    </span>
                  ) : isSuccess ? (
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      Joined Successfully
                    </span>
                  ) : (
                    'Join the Waitlist'
                  )}
                </Button>
              </form>
            </motion.div>
          </AnimatedItem>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default LeadCaptureSection;