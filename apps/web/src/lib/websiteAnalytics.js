export const MEASUREMENT_ID = 'G-2P4BBDPN6J';

const pages = {
  '/': 'Vardhman Creative Studio',
  '/about': 'About | Vardhman Creative Studio',
  '/services': 'Services | Vardhman Creative Studio',
  '/param-vir-chakra': 'Param Vir Chakra',
  '/pvclive': 'PVC Live',
  '/500-akhand-ayambil-vijayollas': '500 Akhand Ayambil Vijayollas',
  '/500-akhand-ayambil-vijayollas/manan-sanghvi': 'Manan Sanghvi | 2 November 2026',
  '/500-akhand-ayambil-vijayollas/sairam-dave': 'Sairam Dave | 3 November 2026',
  '/privacy': 'Privacy | Vardhman Creative Studio',
  '/privacy-policy': 'Privacy policy | Vardhman Creative Studio',
  '/terms': 'Terms | Vardhman Creative Studio',
};

export function publicAnalyticsPage(href) {
  try {
    const url = new URL(href);
    const path = url.pathname.replace(/\/+$/, '') || '/';
    if (url.protocol !== 'https:' || !['vardhmancreativestudio.com', 'www.vardhmancreativestudio.com'].includes(url.host) || !Object.hasOwn(pages, path)) return null;
    // Only our public campaign vocabulary may reach GA. Never forward arbitrary
    // query strings (names, phone numbers, booking IDs or pass capabilities).
    const campaign = new URLSearchParams();
    const allowed = {
      utm_source: ['instagram', 'whatsapp'],
      utm_medium: ['social', 'messaging'],
      utm_campaign: ['ayambil_2026'],
      utm_content: ['bio', 'manan_reel', 'sairam_reel', 'manan_booking', 'sairam_booking', 'event_info'],
    };
    if (path.startsWith('/500-akhand-ayambil-vijayollas')) {
      for (const [key, values] of Object.entries(allowed)) {
        const value = url.searchParams.get(key);
        if (url.searchParams.getAll(key).length === 1 && values.includes(value)) campaign.set(key, value);
      }
    }
    const query = campaign.toString();
    return { page_location: `${url.origin}${path}${query ? `?${query}` : ''}`, page_title: pages[path] };
  } catch {
    return null;
  }
}

// A single controller survives React StrictMode effect replay. Private routes
// disable collection before any queued Google tag commands can run.
export function createWebsiteAnalytics(win, doc) {
  let initialized = false;
  let previousLocation = '';
  let lastLocation = '';
  return function track(href) {
    const page = publicAnalyticsPage(href);
    win[`ga-disable-${MEASUREMENT_ID}`] = !page;
    if (!page) {
      lastLocation = '';
      if (initialized) win.gtag('set', { page_location: 'https://vardhmancreativestudio.com/', page_referrer: '', page_title: 'Private page' });
      return;
    }
    if (lastLocation === page.page_location) return;
    const referrer = previousLocation || publicAnalyticsPage(doc.referrer)?.page_location || '';
    win.dataLayer = win.dataLayer || [];
    win.gtag = win.gtag || function () { win.dataLayer.push(arguments); };
    win.gtag('set', { ...page, page_referrer: referrer });
    if (!initialized) {
      initialized = true;
      win.gtag('js', new Date());
      win.gtag('config', MEASUREMENT_ID, {
        send_page_view: false,
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
        ...page,
        page_referrer: referrer,
      });
      const script = doc.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
      doc.head.appendChild(script);
    }
    win.gtag('event', 'page_view', { ...page, page_referrer: referrer });
    previousLocation = lastLocation = page.page_location;
  };
}
