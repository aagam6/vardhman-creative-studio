import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import '@/index.css';
import { checkAndNormalizeUrl } from '@/lib/urlNormalizer';

// Perform client-side URL normalization before rendering the SPA
checkAndNormalizeUrl();

ReactDOM.createRoot(document.getElementById('root')).render(
	<App />
);