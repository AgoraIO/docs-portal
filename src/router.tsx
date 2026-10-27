import { createRouter as createTanStackRouter } from '@tanstack/react-router';
import { NotFound } from '@/components/not-found';
import { getCnPublicRouteRewrite } from '@/lib/cn-public-routing';
import { DOCS_MAIN_SCROLL_RESTORATION_SELECTOR } from '@/lib/docs-scroll-restoration';
import { parseDocsSearch } from '@/lib/search/search-url-state';
import { DOCS_REGION } from '@/lib/site-region';
import { installVitePreloadErrorHandler } from '@/lib/vite-preload-error';
import { routeTree } from './routeTree.gen';

installVitePreloadErrorHandler();

export function getRouter() {
  return createTanStackRouter({
    routeTree,
    parseSearch: parseDocsSearch,
    rewrite: getCnPublicRouteRewrite(DOCS_REGION),
    defaultPreload: 'intent',
    scrollRestoration: true,
    scrollToTopSelectors: [DOCS_MAIN_SCROLL_RESTORATION_SELECTOR],
    defaultNotFoundComponent: NotFound,
  });
}
