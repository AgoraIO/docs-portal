import { createRouter as createTanStackRouter } from '@tanstack/react-router';
import { NotFound } from '@/components/not-found';
import { DOCS_MAIN_SCROLL_RESTORATION_SELECTOR } from '@/lib/docs-scroll-restoration';
import { routeTree } from './routeTree.gen';

export function getRouter() {
  return createTanStackRouter({
    routeTree,
    defaultPreload: 'intent',
    scrollRestoration: true,
    scrollToTopSelectors: [DOCS_MAIN_SCROLL_RESTORATION_SELECTOR],
    defaultNotFoundComponent: NotFound,
  });
}
