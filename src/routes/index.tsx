import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { staticFunctionMiddleware } from '@tanstack/start-static-server-functions';
import {
  HOME_TABS,
  PlatformHomePage,
  type HomeTabKey,
} from '@/components/home/PlatformHomePage';

export const Route = createFileRoute('/')({
  validateSearch: (search: Record<string, unknown>) => ({
    domain: typeof search.domain === 'string' ? search.domain : undefined,
    page: typeof search.page === 'string' ? search.page : undefined,
    tab: typeof search.tab === 'string' ? search.tab : undefined,
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
  const { domain, page, tab } = Route.useSearch();
  const { portalData } = Route.useLoaderData();
  return (
    <PlatformHomePage
      domain={domain}
      page={page}
      portalData={portalData}
      tab={resolveHomeTab(tab, domain, page)}
    />
  );
}

function resolveHomeTab(
  tab?: string,
  domain?: string,
  page?: string,
) : HomeTabKey {
  if (tab && HOME_TABS.includes(tab as HomeTabKey)) {
    return tab as HomeTabKey;
  }

  if (
    domain === 'api' ||
    page?.startsWith('api/') ||
    page?.startsWith('operations/') ||
    page?.startsWith('webhook/')
  ) {
    return 'api-reference';
  }

  if (domain === 'sdks') {
    return 'get-started';
  }

  if (
    domain === 'docs' &&
    (
      page === 'landing-page' ||
      page?.startsWith('overview/') ||
      page?.startsWith('get-started/') ||
      page?.startsWith('user-guides/') ||
      page?.startsWith('best-practice/')
    )
  ) {
    if (page === 'landing-page') {
      return 'ai';
    }

    if (page.startsWith('get-started/')) {
      return 'get-started';
    }

    if (page.startsWith('best-practice/')) {
      return 'best-practices';
    }

    if (
      [
        'user-guides/audio-modality',
        'user-guides/realtime-sub',
        'user-guides/interrupt-agent',
        'user-guides/listen-agent-events',
      ].includes(page)
    ) {
      return 'realtime-media';
    }

    if (
      [
        'user-guides/custom-data',
        'user-guides/short-term-memory',
      ].includes(page)
    ) {
      return 'solutions';
    }

    return 'ai';
  }

  if (
    domain === 'skillmcp' ||
    page === 'skills-integrate' ||
    page === 'mcp-integrate'
  ) {
    return 'ai';
  }

  if (domain === 'recepies') {
    return 'best-practices';
  }

  return 'overview';
}
