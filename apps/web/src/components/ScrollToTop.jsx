import { useLocation } from 'react-router-dom';
import { useLayoutEffect } from 'react';

const ScrollToTop = () => {
    const { pathname } = useLocation();

    useLayoutEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        
        // Track page view in Meta Pixel on route change
        if (typeof window.fbq === 'function') {
            window.fbq('track', 'PageView');
        }
    }, [pathname]);

    return null;
}

export default ScrollToTop;