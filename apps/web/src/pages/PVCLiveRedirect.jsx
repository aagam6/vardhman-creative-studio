import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';

const videoUrl = 'https://www.youtube.com/watch?v=NjthLLyx964';
const videoId = 'NjthLLyx964';

export default function PVCLiveRedirect() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': 'https://vardhmancreativestudio.com/pvclive#webpage',
        url: 'https://vardhmancreativestudio.com/pvclive',
        name: 'Param Vir Chakra – Shaurya Gatha recording',
        description: 'Watch the recorded Param Vir Chakra – Shaurya Gatha programme.',
        inLanguage: ['en', 'hi'],
      },
      {
        '@type': 'VideoObject',
        name: 'Param Vir Chakra – Shaurya Gatha',
        description: 'Recorded programme from 9 August 2026.',
        thumbnailUrl: 'https://vardhmancreativestudio.com/assets/param-vir-chakra-live.jpg?v=4',
        uploadDate: '2026-08-09T09:00:00+05:30',
        embedUrl: `https://www.youtube.com/embed/${videoId}`,
        contentUrl: videoUrl,
        duration: 'PT4H0M0S',
        isFamilyFriendly: true,
      },
      {
        '@type': 'Event',
        name: 'Param Vir Chakra – Shaurya Gatha',
        startDate: '2026-08-09T09:00:00+05:30',
        endDate: '2026-08-09T13:00:00+05:30',
        eventStatus: 'https://schema.org/EventCompleted',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        location: { '@type': 'Place', name: 'Dinesh Hall, Ahmedabad' },
      },
    ],
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#040b14] px-5 py-16 text-white">
      <Helmet>
        <title>Param Vir Chakra – Shaurya Gatha | Event Recording</title>
        <meta name="description" content="The Param Vir Chakra – Shaurya Gatha event has concluded. Open its programme recording on YouTube." />
        <link rel="canonical" href="https://vardhmancreativestudio.com/pvclive" />
        <meta property="og:type" content="video.other" />
        <meta property="og:title" content="Param Vir Chakra – Shaurya Gatha | Event Recording" />
        <meta property="og:description" content="The event has concluded. Watch the programme recording on YouTube." />
        <meta property="og:url" content="https://vardhmancreativestudio.com/pvclive" />
        <meta property="og:image" content="https://vardhmancreativestudio.com/assets/param-vir-chakra-live.jpg?v=4" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,rgba(255,153,51,0.14),transparent_55%),radial-gradient(ellipse_at_50%_100%,rgba(19,136,8,0.12),transparent_45%)]" />
      <section className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-[#07111f]/90 p-7 text-center shadow-2xl sm:p-12" aria-labelledby="pvclive-title">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#ffb66b]">Param Vir Chakra · Shaurya Gatha</p>
        <h1 id="pvclive-title" className="text-3xl font-bold leading-tight sm:text-5xl">कार्यक्रम संपन्न हुआ</h1>
        <p className="mt-3 text-xl text-white/75 sm:text-2xl">The event has concluded</p>
        <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-white/65">
          Watch the programme recording on YouTube. The video opens only when you choose the button below.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#ff9933] px-6 py-3 font-bold text-[#10131a] transition hover:bg-[#ffad55] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
            YouTube पर रिकॉर्डिंग देखें · Watch recording
          </a>
          <Link to="/param-vir-chakra" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/20 px-6 py-3 font-semibold text-white transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
            कार्यक्रम की जानकारी · Event details
          </Link>
        </div>
        <p className="mt-6 text-sm text-white/45">9 August 2026 · Ahmedabad</p>
      </section>
    </main>
  );
}
