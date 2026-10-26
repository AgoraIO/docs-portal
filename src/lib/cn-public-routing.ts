import type { LocationRewrite } from '@tanstack/react-router';
import { toCnPublicSearchUrl } from './search/cn-search-urls.mjs';
import type { DocsRegion } from './site-region';

// Route eligibility includes pages intentionally omitted from search discovery.
// Actual publication checks remain in the document loader and static server.
export function isCnPublicDocsPath(pathname: string) {
  return /^\/(?:introduction|realtime-media|solutions|api-reference|reference|ai)(?:\/|$)/.test(
    pathname,
  );
}

export function getCnPublicRouteRewrite(
  region: DocsRegion,
): LocationRewrite | undefined {
  if (region !== 'cn') return undefined;

  return {
    input: ({ url }) => {
      // Content payloads and route parameters keep their existing locale.
      if (
        !url.pathname.startsWith('/zh-CN/') &&
        (url.pathname === '/search' ||
          url.pathname === '/search/' ||
          isCnPublicDocsPath(url.pathname))
      ) {
        url.pathname = `/zh-CN${url.pathname}`;
      }
      return url;
    },
    output: ({ url }) => {
      // Change only the path. Search state and heading fragments stay intact.
      url.pathname = toCnPublicSearchUrl(url.pathname);
      return url;
    },
  };
}
