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
