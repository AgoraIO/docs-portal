// Content/build paths retain the locale. Only public result addresses lose it.
/** @param {string} value */
export function toCnPublicSearchUrl(value) {
  return value.replace(/^\/zh-CN(?=\/|[?#]|$)/, '') || '/';
}

/** @param {string} value */
export function toCnContentSearchUrl(value) {
  return `/zh-CN${toCnPublicSearchUrl(value)}`;
}

const publicRoots = new Set([
  'introduction',
  'realtime-media',
  'solutions',
  'api-reference',
  'reference',
  'ai',
]);

/** @param {string} value */
function hasUnsafeCharacters(value) {
  return (
    /[\s\\]/u.test(value) ||
    Array.from(value).some(
      (character) =>
        character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127,
    )
  );
}

/** @param {unknown} value */
export function isPublicCnSearchUrl(value) {
  if (
    typeof value !== 'string' ||
    !value.startsWith('/') ||
    hasUnsafeCharacters(value)
  )
    return false;
  try {
    const url = new URL(value, 'https://docs.local');
    const rawPath = value.split(/[?#]/, 1)[0];
    const decodedPath = decodeURIComponent(rawPath);
    if (
      url.origin !== 'https://docs.local' ||
      hasUnsafeCharacters(decodedPath) ||
      decodedPath.includes('//') ||
      /%2f|%5c/i.test(rawPath) ||
      decodedPath
        .split('/')
        .some((segment) => segment === '.' || segment === '..')
    )
      return false;
    // Accept the previous index during the staged site/API/index rollout.
    if (url.pathname.startsWith('/zh-CN/')) return true;
    return publicRoots.has(url.pathname.split('/')[1]);
  } catch {
    return false;
  }
}
