import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { staticFunctionMiddleware } from '@tanstack/start-static-server-functions';
import { HomePage } from '@/components/home/HomePage';

export const Route = createFileRoute('/')({
  validateSearch: (search: Record<string, unknown>) => ({
    domain: typeof search.domain === 'string' ? search.domain : undefined,
    page: typeof search.page === 'string' ? search.page : undefined,
  }),
  loader: async () => {
    const portalData = await getPortalData();
    return { portalData };
  },
  component: Home,
});

const getPortalData = createServerFn({ method: 'GET' })
  .middleware([staticFunctionMiddleware])
  .handler(async () => {
    const { loadConvoaiPortalData } = await import('@/lib/convoai-portal.server');
    return loadConvoaiPortalData();
  });

function Home() {
  const { domain, page } = Route.useSearch();
  const { portalData } = Route.useLoaderData();
  return <HomePage domain={domain as never} page={page} portalData={portalData} />;
}
