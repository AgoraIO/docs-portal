import type { LocationRewrite } from '@tanstack/react-router';
import {
  type PlatformQueryIndex,
  resolvePlatformQueryUrl,
} from './platforms/query-route';
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
  platformIndex?: PlatformQueryIndex,
): LocationRewrite | undefined {
  if (region !== 'cn' && !platformIndex) return undefined;

  return {
    input: ({ url }) => {
      // Content payloads and route parameters keep their existing locale.
      if (
        region === 'cn' &&
        !url.pathname.startsWith('/zh-CN/') &&
        (url.pathname === '/search' ||
          url.pathname === '/search/' ||
          isCnPublicDocsPath(url.pathname))
      ) {
        url.pathname = `/zh-CN${url.pathname}`;
      }
      return platformIndex
        ? (resolvePlatformQueryUrl(url, platformIndex) ?? url)
        : url;
    },
    output: ({ url }) => {
      const result = platformIndex
        ? (resolvePlatformQueryUrl(url, platformIndex) ?? url)
        : url;
      // Change only the path. Search state and heading fragments stay intact.
      if (region === 'cn')
        result.pathname = toCnPublicSearchUrl(result.pathname);
      return result;
    },
  };
}
