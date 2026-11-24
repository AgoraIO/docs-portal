import { createRootRoute, createRouter } from '@tanstack/react-router';
import { Route as loginRoute } from './routes/api/auth/login';
import { Route as healthRoute } from './routes/api/health';
import { Route as logoutRoute } from './routes/api/logout';
import { Route as oauthRoute } from './routes/api/oauth';
import { Route as searchRoute } from './routes/api/search';
import { Route as userinfoRoute } from './routes/api/userinfo';

// Select the same API route modules without bundling the documentation UI or MDX.
// The static site and development server continue to use router.tsx.
const rootRoute = createRootRoute();
const routeTree = rootRoute.addChildren([
  loginRoute.update({
    id: '/api/auth/login',
    path: '/api/auth/login',
    getParentRoute: () => rootRoute,
  } as never),
  oauthRoute.update({
    id: '/api/oauth',
    path: '/api/oauth',
    getParentRoute: () => rootRoute,
  } as never),
  userinfoRoute.update({
    id: '/api/userinfo',
    path: '/api/userinfo',
    getParentRoute: () => rootRoute,
  } as never),
  logoutRoute.update({
    id: '/api/logout',
    path: '/api/logout',
    getParentRoute: () => rootRoute,
  } as never),
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
