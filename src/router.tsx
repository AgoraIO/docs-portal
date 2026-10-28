import { createRouter as createTanStackRouter } from '@tanstack/react-router';
import { NotFound } from '@/components/not-found';
import { getCnPublicRouteRewrite } from '@/lib/cn-public-routing';
import { DOCS_MAIN_SCROLL_RESTORATION_SELECTOR } from '@/lib/docs-scroll-restoration';
import {
  normalizeInitialPlatformLocation,
  type PlatformQueryIndex,
} from '@/lib/platforms/query-route';
import {
  parseDocsSearch,
  stringifyDocsSearch,
} from '@/lib/search/search-url-state';
import { DOCS_REGION } from '@/lib/site-region';
import { installVitePreloadErrorHandler } from '@/lib/vite-preload-error';
import { routeTree } from './routeTree.gen';

installVitePreloadErrorHandler();
const platformQueryIndex: PlatformQueryIndex | undefined = import.meta.env
  .DOCS_PLATFORM_QUERY_INDEX;

export function getRouter() {
  if (platformQueryIndex) normalizeInitialPlatformLocation(platformQueryIndex);
  return createTanStackRouter({
    routeTree,
    parseSearch: parseDocsSearch,
    stringifySearch: stringifyDocsSearch,
    rewrite: getCnPublicRouteRewrite(DOCS_REGION, platformQueryIndex),
    defaultPreload: 'intent',
    scrollRestoration: true,
    scrollToTopSelectors: [DOCS_MAIN_SCROLL_RESTORATION_SELECTOR],
    defaultNotFoundComponent: NotFound,
  });
}
