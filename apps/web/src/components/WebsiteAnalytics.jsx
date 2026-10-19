import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { createWebsiteAnalytics } from '@/lib/websiteAnalytics.js';

const trackPage = createWebsiteAnalytics(window, document);

export default function WebsiteAnalytics() {
  const { pathname, search } = useLocation();
  useLayoutEffect(() => { trackPage(window.location.href); }, [pathname, search]);
  return null;
}
