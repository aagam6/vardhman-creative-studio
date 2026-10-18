// Public document aliases only. API, administrator and private pass routes
// deliberately do not pass through this canonicalization middleware.
export function publicSeo(req, res, next) {
  if (!['GET', 'HEAD'].includes(req.method)) return next();
  const paths = new Set(['/', '/about', '/services', '/param-vir-chakra', '/privacy', '/privacy-policy', '/terms', '/500-akhand-ayambil-vijayollas', '/500-akhand-ayambil-vijayollas/manan-sanghvi', '/500-akhand-ayambil-vijayollas/sairam-dave']);
  const url = new URL(req.originalUrl, 'https://vardhmancreativestudio.com');
  const legacySearch = url.pathname === '/search' || (url.pathname === '/' && url.searchParams.has('s'));
  const path = legacySearch ? '/' : url.pathname.replace(/\/+$/, '') || '/';
  if (!paths.has(path)) return next();
  const www = req.headers.host?.toLowerCase() === 'www.vardhmancreativestudio.com';
  const target = `https://vardhmancreativestudio.com${path}${legacySearch ? '' : url.search}`;
  res.set('Link', `<https://vardhmancreativestudio.com${path}>; rel="canonical"`);
  if (www || legacySearch || path !== url.pathname) return res.redirect(301, target);
  next();
}
