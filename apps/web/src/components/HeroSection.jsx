import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HeroSection = () => {
	const [particles, setParticles] = useState([]);

	useEffect(() => {
		const newParticles = Array.from({ length: 10 }).map((_, i) => ({
			id: i,
			left: `${Math.random() * 100}%`,
			top: `${Math.random() * 100}%`,
			size: Math.random() * 5 + 2,
			duration: Math.random() * 4 + 4,
			delay: Math.random() * 2,
		}));
		setParticles(newParticles);
	}, []);

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.2,
				delayChildren: 0.3,
			},
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 40 },
		visible: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] },
		},
	};

	const scrollToForm = () => {
		document.getElementById('early-access')?.scrollIntoView({
			behavior: 'smooth',
			block: 'start',
		});
	};

	return (
		<section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden pt-20 pb-16 noise-bg">

			{/* Animated Gradient Background */}
			<div className="absolute inset-0 z-0 bg-gradient-to-br from-black via-[hsl(270,30%,8%)] to-black animate-gradient-shift" />

			{/* Dark Overlay */}
			<div className="absolute inset-0 z-0 bg-black/75 backdrop-blur-[1px]" />

			{/* Radial Light Falloff */}
			<div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.85)_100%)]" />

			{/* Particles */}
			<div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
				{particles.map((p) => (
					<motion.div
						key={p.id}
						className="absolute rounded-full bg-purple-500/40 blur-[3px]"
						style={{
							left: p.left,
							top: p.top,
							width: p.size,
							height: p.size,
						}}
						animate={{
							y: [0, -120],
							x: [0, Math.random() * 40 - 20],
							opacity: [0, 0.6, 0],
							scale: [0.8, 1.2, 0.8],
						}}
						transition={{
							duration: p.duration,
							repeat: Infinity,
							delay: p.delay,
							ease: "easeInOut",
						}}
					/>
				))}
			</div>

			<div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
				<motion.div
					variants={containerVariants}
					initial="hidden"
					animate="visible"
					className="flex flex-col items-center"
				>

					{/* Brand Name */}
					<motion.p
						variants={itemVariants}
						className="text-sm tracking-[0.3em] uppercase text-purple-400/70 mb-3"
					>
						Vardhman Creative Studio
					</motion.p>

					{/* Badge */}
					<motion.div variants={itemVariants} className="mb-8">
						<span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect text-gray-300 text-sm font-medium tracking-wide uppercase hover:glow-sm transition-all duration-300">
							<Sparkles className="w-4 h-4" />
							Coming Soon
						</span>
					</motion.div>

					{/* Heading */}
					<motion.h1
						variants={itemVariants}
						className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-[1.3] tracking-[0.08em]"
					>
						Something{" "}
						<span className="text-gradient drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]">
							Extraordinary
						</span>{" "}
						<br />
						is Coming.
					</motion.h1>

					{/* Subheading */}
					<motion.p
						variants={itemVariants}
						className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-4 font-medium tracking-wide"
					>
						Cinematic storytelling that transforms brands into experiences.
					</motion.p>

					{/* Supporting Line */}
					<motion.p
						variants={itemVariants}
						className="text-lg text-gray-500 max-w-2xl mx-auto mb-12 tracking-wide"
					>
						Launching soon for brands that refuse to be ordinary.
					</motion.p>

					{/* CTA */}
					<motion.div variants={itemVariants} className="flex flex-col items-center gap-6">
						<Button
							size="lg"
							onClick={scrollToForm}
							className="bg-purple-600 text-white text-lg px-10 py-7 rounded-full transition-all duration-300 animate-pulse-glow hover:scale-105 hover:shadow-[0_0_40px_-5px_rgba(168,85,247,0.8)] active:scale-[0.98]"
						>
							Join the Creative Waitlist
						</Button>

						<span className="text-sm text-gray-400 tracking-wider uppercase">
							Limited early access for selected brands.
						</span>
					</motion.div>

				</motion.div>
			</div>

			{/* Bottom Glow Divider */}
			<div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
		</section>
	);
};

export default HeroSection;