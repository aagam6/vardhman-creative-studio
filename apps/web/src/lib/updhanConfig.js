// Add the official links here when they are ready. Empty strings keep the
// page in its honest preview state without loading or submitting anything.
export const updhanConfig = {
  // Existing website GA4 property verified from the current production source.
  // Local/staging never sends hits. Release/account review must enable this.
  analyticsEnabled: import.meta.env?.VITE_UPDHAN_ANALYTICS_ENABLED==='true',
  measurementId: 'G-2P4BBDPN6J',
  youtubeUrl: '',
  // Historical tirth documentary supplied by the user, separate from the event trailer.
  tirthVideoUrl: 'https://www.youtube.com/watch?v=oDDk3B1sink',
  registrationFormUrl: '',
};

export function getYoutubeEmbedUrl(value) {
  if (!value) return '';
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    let id = '';
    if (host === 'youtu.be') id = url.pathname.split('/')[1];
    else if (['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com'].includes(host)) {
      id = url.searchParams.get('v') || (['embed', 'shorts', 'live'].includes(url.pathname.split('/')[1]) ? url.pathname.split('/')[2] : '');
    }
    return /^[a-zA-Z0-9_-]{11}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : '';
  } catch { return ''; }
}

export function getRegistrationUrl(value) {
  if (!value) return '';
  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.href : '';
  } catch { return ''; }
}
