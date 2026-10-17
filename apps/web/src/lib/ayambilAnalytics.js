import { MEASUREMENT_ID, publicAnalyticsPage } from './websiteAnalytics.js';

const programmes = { '2026-11-02': 'manan_sanghvi', '2026-11-03': 'sairam_dave' };
const events = new Set(['registration_view', 'registration_start', 'registration_review', 'registration_submit', 'booking_success', 'help_whatsapp_click']);

export function createAyambilAnalytics(win) {
  const completed = new Set();
  return (name, { eventDate, passCount, bookingKey, placement } = {}) => {
    // Analytics is optional: blocked scripts/storage must never break booking.
    try {
      const page = publicAnalyticsPage(win.location.href);
      if (!page || !events.has(name) || win[`ga-disable-${MEASUREMENT_ID}`] || typeof win.gtag !== 'function') return false;
      const params = { ...page, form_id: 'ayambil_registration' };
      if (programmes[eventDate]) {
        params.programme_date = eventDate;
        params.programme_name = programmes[eventDate];
      } else if (name !== 'help_whatsapp_click') return false;
      if (Number.isInteger(passCount) && passCount >= 1 && passCount <= 6) params.pass_count = passCount;
      if (name === 'help_whatsapp_click') params.link_placement = ['registration', 'pass_download'].includes(placement) ? placement : 'public_page';
      let storageKey;
      if (name === 'booking_success') {
        if (typeof bookingKey !== 'string' || !bookingKey) return false;
        // Kept locally for retry deduplication; never included in GA parameters.
        storageKey = `vcs-ga-booking:${bookingKey}`;
        if (completed.has(storageKey)) return false;
        try { if (win.sessionStorage.getItem(storageKey)) return false; } catch { /* storage optional */ }
      }
      win.gtag('event', name, params);
      if (storageKey) {
        completed.add(storageKey);
        try { win.sessionStorage.setItem(storageKey, '1'); } catch { /* storage optional */ }
      }
      return true;
    } catch {
      return false;
    }
  };
}

const send = typeof window === 'undefined' ? () => false : createAyambilAnalytics(window);
export const trackAyambilEvent = (name, details) => send(name, details);

// Scoped to one form attempt; rerenders, edits and retry recovery do not create
// duplicate funnel steps. A genuinely new registration gets a new instance.
export function createRegistrationFunnel(emit, eventDate) {
  const seen = new Set();
  return (name, details = {}) => {
    if (seen.has(name)) return;
    if (emit(name, { ...details, eventDate })) seen.add(name);
  };
}
