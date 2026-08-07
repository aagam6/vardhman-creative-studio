import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { contactConfig } from '@/lib/contactConfig';

export default function PVCLiveRedirect() {
    useEffect(() => {
        window.location.replace(contactConfig.liveRedirectUrl);
    }, []);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#040b14] text-white">
            <Helmet>
                {/* Standard Meta Tags */}
                <title>Param Vir Chakra – Shaurya Gatha Live / परमवीर चक्र – शौर्यगाथा लाइव</title>
                <meta name="description" content="Watch the official video stream of Param Vir Chakra – Shaurya Gatha. A Grand Patriotic Experience celebrating India's greatest heroes." />
                
                {/* Open Graph / Facebook */}
                <meta property="og:type" content="video.other" />
                <meta property="og:title" content="Param Vir Chakra – Shaurya Gatha Live / परमवीर चक्र – शौर्यगाथा लाइव" />
                <meta property="og:description" content="Watch the official video stream of Param Vir Chakra – Shaurya Gatha. A Grand Patriotic Experience celebrating India's greatest heroes." />
                <meta property="og:url" content="https://vardhmancreativestudio.com/pvclive" />
                <meta property="og:image" content="https://vardhmancreativestudio.com/assets/param-vir-chakra-live.jpg?v=4" />
                <meta property="og:image:secure_url" content="https://vardhmancreativestudio.com/assets/param-vir-chakra-live.jpg?v=4" />
                <meta property="og:image:width" content="1280" />
                <meta property="og:image:height" content="720" />
                <meta property="og:image:type" content="image/jpeg" />
                <meta property="og:image:alt" content="Param Vir Chakra Shaurya Gatha Live Stream" />

                {/* Twitter */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Param Vir Chakra – Shaurya Gatha Live / परमवीर चक्र – शौर्यगाथा लाइव" />
                <meta name="twitter:description" content="Watch the official video stream of Param Vir Chakra – Shaurya Gatha. A Grand Patriotic Experience celebrating India's greatest heroes." />
                <meta name="twitter:image" content="https://vardhmancreativestudio.com/assets/param-vir-chakra-live.jpg?v=4" />

                {/* Canonical & Robots SEO tags */}
                <link rel="canonical" href="https://vardhmancreativestudio.com/pvclive" />
                <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />

                {/* JSON-LD Structured Data Schema for Live Event & Video */}
                <script type="application/ld+json">
                    {JSON.stringify({
                      "@context": "https://schema.org",
                      "@graph": [
                        {
                          "@type": "WebPage",
                          "@id": "https://vardhmancreativestudio.com/pvclive#webpage",
                          "url": "https://vardhmancreativestudio.com/pvclive",
                          "name": "Param Vir Chakra – Shaurya Gatha Live / परमवीर चक्र – शौर्यगाथा लाइव",
                          "description": "Watch the official live video stream of Param Vir Chakra – Shaurya Gatha grand event.",
                          "isPartOf": {
                            "@type": "WebSite",
                            "@id": "https://vardhmancreativestudio.com/#website",
                            "name": "Vardhman Creative Studio",
                            "url": "https://vardhmancreativestudio.com"
                          },
                          "inLanguage": "en-US",
                          "datePublished": "2026-07-30T09:00:00+05:30",
                          "dateModified": "2026-08-07T15:30:00+05:30"
                        },
                        {
                          "@type": "VideoObject",
                          "name": "Param Vir Chakra – Shaurya Gatha Live / परमवीर चक्र – शौर्यगाथा लाइव",
                          "description": "Watch the official live video stream of Param Vir Chakra – Shaurya Gatha event on 9 August 2026.",
                          "thumbnailUrl": "https://vardhmancreativestudio.com/assets/param-vir-chakra-live.jpg?v=4",
                          "uploadDate": "2026-08-09T09:00:00+05:30",
                          "embedUrl": "https://www.youtube.com/embed/U2QBAxmlohw",
                          "contentUrl": "https://youtu.be/U2QBAxmlohw",
                          "duration": "PT4H0M0S",
                          "isFamilyFriendly": true
                        },
                        {
                          "@type": "Event",
                          "name": "Param Vir Chakra – Shaurya Gatha Live Stream / परमवीर चक्र – शौर्यगाथा लाइव",
                          "startDate": "2026-08-09T09:00:00+05:30",
                          "endDate": "2026-08-09T13:00:00+05:30",
                          "eventStatus": "https://schema.org/EventScheduled",
                          "eventAttendanceMode": "https://schema.org/OnlineEventAttendanceMode",
                          "location": {
                            "@type": "VirtualLocation",
                            "url": "https://vardhmancreativestudio.com/pvclive"
                          },
                          "image": [
                            "https://vardhmancreativestudio.com/assets/param-vir-chakra-live.jpg?v=4"
                          ],
                          "description": "Watch the live online streaming of Param Vir Chakra – Shaurya Gatha. Live from Dinesh Hall, Navrangpura, Ahmedabad.",
                          "organizer": {
                            "@type": "Organization",
                            "name": "Vardhman Creative Studio",
                            "url": "https://vardhmancreativestudio.com"
                          }
                        }
                      ]
                    })}
                </script>
            </Helmet>

            <Helmet>
                <style>{`
                    .loader-ring {
                        position: absolute;
                        inset: 0;
                        border: 3px solid transparent;
                        border-radius: 50%;
                        animation: spin 1.5s cubic-bezier(0.5, 0, 0.5, 1) infinite;
                    }
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </Helmet>

            <div 
                className="absolute inset-0 bg-cover bg-center filter blur-[40px] brightness-[0.25] scale-[1.1] -z-10"
                style={{ backgroundImage: "url('/assets/param-vir-chakra-live.jpg')" }}
            />

            <div className="flex flex-col items-center p-10 rounded-[24px] bg-[#040b14]/60 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl max-w-[420px] w-[85%] text-center animate-in fade-in slide-in-from-bottom-2 duration-700">
                <div className="relative w-16 h-16 mb-6">
                    <div className="loader-ring border-t-[#ff9933] -delay-300 shadow-[0_0_15px_rgba(255,153,51,0.2)]" />
                    <div className="loader-ring border-t-white -delay-150 inset-[6px]" />
                    <div className="loader-ring border-t-[#138808] inset-[12px] shadow-[0_0_15px_rgba(19,136,8,0.2)]" />
                </div>
                
                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent mb-1.5">
                    प्रवेश किया जा रहा है...
                </h1>
                <p className="text-xs text-white/50 tracking-wider uppercase font-semibold mb-6">
                    Entering Live Experience
                </p>
                
                <a 
                    href={contactConfig.liveRedirectUrl} 
                    className="text-[11px] text-white/45 no-underline px-5 py-2.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 hover:text-[#ff9933] hover:border-[#ff9933]/30 transition-all duration-300"
                >
                    Click here if not redirected / क्लिक करें
                </a>
            </div>
        </div>
    );
}
