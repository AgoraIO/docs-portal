import type { LocationRewrite } from '@tanstack/react-router';
import {
  isPublicCnSearchUrl,
  toCnPublicSearchUrl,
} from './search/cn-search-urls.mjs';
import type { DocsRegion } from './site-region';

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
          isPublicCnSearchUrl(url.pathname))
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
