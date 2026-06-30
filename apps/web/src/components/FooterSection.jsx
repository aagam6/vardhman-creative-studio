import React from 'react';
import { Instagram, Linkedin, Youtube, Facebook } from 'lucide-react';
import AnimatedSection, { AnimatedItem } from './AnimatedSection.jsx';

const FooterSection = () => {
	const currentYear = new Date().getFullYear();

	return (
		<footer className="py-20 bg-background relative z-10 noise-bg">

			{/* Top Gradient Divider */}
			<div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

				<AnimatedSection>

					{/* TOP AREA */}
					<AnimatedItem>
						<div className="flex flex-col md:flex-row justify-between items-center gap-12 mb-14">

							{/* Brand */}
							<div className="text-center md:text-left">
								<h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3 tracking-[0.1em]">
									Vardhman Creative Studio
								</h3>

								<p className="text-muted-foreground text-sm tracking-wide">
									Crafting cinematic experiences that elevate brands.
								</p>

								<p className="text-primary/80 text-sm mt-2 font-medium tracking-wide">
									Built for brands that want to stand out.
								</p>

								<p className="text-xs text-muted-foreground/60 mt-3">
									Follow our journey as we build something extraordinary.
								</p>
							</div>

							{/* Social Icons */}
							<div className="flex items-center gap-6">

								{/* Instagram */}
								<a
									href="https://www.instagram.com/vardhmancreativestudio/"
									target="_blank"
									rel="noopener noreferrer"
									className="group p-3 rounded-full bg-white/5 backdrop-blur-md border border-white/10 
                  hover:border-primary/40 transition-all duration-300 hover:scale-110"
								>
									<Instagram className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:drop-shadow-[0_0_10px_rgba(168,85,247,0.6)] transition duration-300" />
								</a>

								{/* LinkedIn */}
								<a
									href="https://www.linkedin.com/company/vardhmancreativestudio"
									target="_blank"
									rel="noopener noreferrer"
									className="group p-3 rounded-full bg-white/5 backdrop-blur-md border border-white/10 
                  hover:border-primary/40 transition-all duration-300 hover:scale-110"
								>
									<Linkedin className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:drop-shadow-[0_0_10px_rgba(168,85,247,0.6)] transition duration-300" />
								</a>

								{/* Facebook */}
								<a
									href="https://www.facebook.com/people/Vardhmancreativestudio"
									target="_blank"
									rel="noopener noreferrer"
									className="group p-3 rounded-full bg-white/5 backdrop-blur-md border border-white/10 
                  hover:border-primary/40 transition-all duration-300 hover:scale-110"
								>
									<Facebook className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:drop-shadow-[0_0_10px_rgba(168,85,247,0.6)] transition duration-300" />
								</a>

								{/* YouTube */}
								<a
									href="https://www.youtube.com/@vardhmancreativestudio"
									target="_blank"
									rel="noopener noreferrer"
									className="group p-3 rounded-full bg-white/5 backdrop-blur-md border border-white/10 
                  hover:border-primary/40 transition-all duration-300 hover:scale-110"
								>
									<Youtube className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:drop-shadow-[0_0_10px_rgba(168,85,247,0.6)] transition duration-300" />
								</a>

							</div>
						</div>
					</AnimatedItem>

					{/* BOTTOM AREA */}
					<AnimatedItem>
						<div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-border/30 text-sm text-muted-foreground tracking-wide">

							<p>
								&copy; {currentYear} Vardhman Creative Studio. All rights reserved.
							</p>

							<div className="flex gap-8">

								<a
									href="#"
									className="relative hover:text-primary transition-all duration-300 group"
								>
									Privacy Policy
									<span className="absolute left-0 -bottom-1 w-0 h-[1px] bg-primary transition-all duration-300 group-hover:w-full"></span>
								</a>

								<a
									href="#"
									className="relative hover:text-primary transition-all duration-300 group"
								>
									Terms of Service
									<span className="absolute left-0 -bottom-1 w-0 h-[1px] bg-primary transition-all duration-300 group-hover:w-full"></span>
								</a>

							</div>
						</div>
					</AnimatedItem>

				</AnimatedSection>
			</div>
		</footer>
	);
};

export default FooterSection;