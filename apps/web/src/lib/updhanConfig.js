// Add the official links here when they are ready. Empty strings keep the
// page in its honest preview state without loading or submitting anything.
export const updhanConfig = {
  youtubeUrl: '',
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
