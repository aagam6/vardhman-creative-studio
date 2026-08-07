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
                <meta property="og:image" content="https://vardhmancreativestudio.com/assets/param-vir-chakra-live.png" />
                <meta property="og:image:secure_url" content="https://vardhmancreativestudio.com/assets/param-vir-chakra-live.png" />
                <meta property="og:image:width" content="1280" />
                <meta property="og:image:height" content="720" />
                <meta property="og:image:type" content="image/png" />
                <meta property="og:image:alt" content="Param Vir Chakra Shaurya Gatha Live Stream" />

                {/* Twitter */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Param Vir Chakra – Shaurya Gatha Live / परमवीर चक्र – शौर्यगाथा लाइव" />
                <meta name="twitter:description" content="Watch the official video stream of Param Vir Chakra – Shaurya Gatha. A Grand Patriotic Experience celebrating India's greatest heroes." />
                <meta name="twitter:image" content="https://vardhmancreativestudio.com/assets/param-vir-chakra-live.png" />

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
                          "thumbnailUrl": "https://vardhmancreativestudio.com/assets/param-vir-chakra-live.png",
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
                            "https://vardhmancreativestudio.com/assets/param-vir-chakra-live.png"
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

            <div className="flex flex-col items-center gap-4 text-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ff9933] border-t-transparent"></div>
                <h1 className="text-xl font-bold tracking-wide">Redirecting to YouTube / यूट्यूब पर रीडायरेक्ट किया जा रहा है...</h1>
                <p className="text-sm text-white/50">
                    If you are not redirected automatically,{' '}
                    <a href={contactConfig.liveRedirectUrl} className="text-[#ff9933] underline font-bold">
                        click here
                    </a>.
                </p>
            </div>
        </div>
    );
}
