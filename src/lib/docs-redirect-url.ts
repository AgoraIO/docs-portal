/** Preserve incoming URL components on root-relative or absolute docs redirects. */
export function preserveRedirectSearch(
  href: string,
  location: { hash?: string; searchStr?: string },
  preserveSearch = true,
) {
  const url = new URL(href, 'https://docs.invalid');
  // An explicit destination component wins, including an empty `?` or `#`.
  const hashIndex = href.indexOf('#');
  const pathAndSearch = hashIndex < 0 ? href : href.slice(0, hashIndex);
  if (!pathAndSearch.includes('?') && preserveSearch && location.searchStr) {
    url.search = location.searchStr;
  }
  // TanStack supplies decoded hashes without '#'; URL adds the separator and
  // encodes Unicode without double-encoding existing percent escapes.
  if (hashIndex < 0 && location.hash) {
    url.hash = location.hash;
  }

  if (href.startsWith('//')) {
    return url.href.slice(url.protocol.length);
  }
  return href.startsWith('/') ? url.href.slice(url.origin.length) : url.href;
}
