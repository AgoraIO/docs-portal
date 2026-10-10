import { createRootRoute, createRouter } from '@tanstack/react-router';
import { Route as healthRoute } from './routes/api/health';
import { Route as searchRoute } from './routes/api/search';

// Select the same API route modules without bundling the documentation UI or MDX.
// The static site and development server continue to use router.tsx.
const rootRoute = createRootRoute();
const routeTree = rootRoute.addChildren([
  searchRoute.update({
    id: '/api/search',
    path: '/api/search',
    getParentRoute: () => rootRoute,
  } as never),
  healthRoute.update({
    id: '/api/health',
    path: '/api/health',
    getParentRoute: () => rootRoute,
  } as never),
]);

export function getRouter() {
  return createRouter({ routeTree });
}
