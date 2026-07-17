/**
 * Universal URL Normalization Utility
 * Sanitizes pathnames, query parameters, and hashes to prevent broken routing
 * caused by unwanted trailing punctuation, spaces, or invisible Unicode characters.
 */

export function normalizeUrl(location) {
  const { pathname, search, hash } = location;

  let normalizedPath = pathname || '/';
  
  // 1. Decode URI pathname multiple times in case of nested encoding
  try {
    let prevPath = "";
    while (normalizedPath !== prevPath) {
      prevPath = normalizedPath;
      normalizedPath = decodeURIComponent(normalizedPath);
    }
  } catch (e) {
    // Keep raw path if decoding fails
  }

  // 2. Trim leading/trailing spaces
  normalizedPath = normalizedPath.trim();

  // 3. Remove invisible Unicode characters (U+2060, U+200B, U+200C, U+200D, U+FEFF, U+00A0)
  normalizedPath = normalizedPath.replace(/[\u2060\u200B\u200C\u200D\uFEFF\u00A0]/g, '');

  // 4. Remove literal/encoded forms of invisible characters just in case
  normalizedPath = normalizedPath.replace(/(%E2%81%A0|%E2%80%8B|%E2%80%8C|%E2%80%8D|%EF%BB%BF)/gi, '');

  // 5. Collapse duplicate slashes (e.g. //param-vir-chakra -> /param-vir-chakra)
  normalizedPath = normalizedPath.replace(/\/+/g, '/');
  if (!normalizedPath.startsWith('/')) {
    normalizedPath = '/' + normalizedPath;
  }

  // 6. Convert URL pathname to lowercase
  normalizedPath = normalizedPath.toLowerCase();

  // 7. Remove accidental trailing punctuation and trailing slashes iteratively
  let prev = "";
  while (normalizedPath !== prev) {
    prev = normalizedPath;
    normalizedPath = normalizedPath.trim();
    // Accidental trailing punctuation: . , ; : ! ? ) ] } " '
    normalizedPath = normalizedPath.replace(/[.,;:!?)}\]"']+$/, '');
    
    // Remove trailing slash except for root route "/"
    if (normalizedPath.length > 1 && normalizedPath.endsWith('/')) {
      normalizedPath = normalizedPath.slice(0, -1);
    }
  }

  // 8. Normalize search query parameters (trim, remove invisible characters)
  let normalizedSearch = search || '';
  if (normalizedSearch) {
    try {
      let prevSearch = "";
      while (normalizedSearch !== prevSearch) {
        prevSearch = normalizedSearch;
        normalizedSearch = decodeURIComponent(normalizedSearch);
      }
    } catch (e) {}

    normalizedSearch = normalizedSearch.replace(/[\u2060\u200B\u200C\u200D\uFEFF\u00A0]/g, '');
    normalizedSearch = normalizedSearch.replace(/(%E2%81%A0|%E2%80%8B|%E2%80%8C|%E2%80%8D|%EF%BB%BF)/gi, '');
    
    // Re-verify it starts with '?'
    if (normalizedSearch && !normalizedSearch.startsWith('?')) {
      normalizedSearch = '?' + normalizedSearch;
    }
  }

  // 9. Normalize hash fragments (trim, remove invisible characters)
  let normalizedHash = hash || '';
  if (normalizedHash) {
    try {
      let prevHash = "";
      while (normalizedHash !== prevHash) {
        prevHash = normalizedHash;
        normalizedHash = decodeURIComponent(normalizedHash);
      }
    } catch (e) {}

    normalizedHash = normalizedHash.replace(/[\u2060\u200B\u200C\u200D\uFEFF\u00A0]/g, '');
    normalizedHash = normalizedHash.replace(/(%E2%81%A0|%E2%80%8B|%E2%80%8C|%E2%80%8D|%EF%BB%BF)/gi, '');

    // Re-verify it starts with '#'
    if (normalizedHash && !normalizedHash.startsWith('#')) {
      normalizedHash = '#' + normalizedHash;
    }
  }

  const targetUrl = normalizedPath + normalizedSearch + normalizedHash;

  // Fair comparison: Decode current path to check for discrepancies
  let originalFull = (pathname || '') + (search || '') + (hash || '');
  try {
    originalFull = decodeURIComponent(originalFull);
  } catch (e) {}

  const isChanged = (originalFull !== targetUrl);

  return {
    targetUrl,
    isChanged
  };
}

export function checkAndNormalizeUrl() {
  if (typeof window === 'undefined') return;

  const result = normalizeUrl(window.location);
  if (result.isChanged) {
    window.location.replace(result.targetUrl);
  }
}
