import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { staticFunctionMiddleware } from '@tanstack/start-static-server-functions';
import { HomePage } from '@/components/home/HomePage';
import type { HomeMarkdownPages } from '@/lib/home-markdown.server';

export const Route = createFileRoute('/')({
  validateSearch: (search: Record<string, unknown>) => ({
    domain: typeof search.domain === 'string' ? search.domain : undefined,
    page: typeof search.page === 'string' ? search.page : undefined,
  }),
  loader: async ({ deps }) => {
    const markdownPages = await getHomeMarkdownPages();
    return {
      markdownPages,
      ...deps,
    };
  },
  component: Home,
});

const getHomeMarkdownPages = createServerFn({ method: 'GET' })
  .middleware([staticFunctionMiddleware])
  .handler(async (): Promise<HomeMarkdownPages> => {
    const { loadHomeMarkdownPages } = await import('@/lib/home-markdown.server');
    return loadHomeMarkdownPages();
  });

function Home() {
  const { domain, page } = Route.useSearch();
  const { markdownPages } = Route.useLoaderData();
  return <HomePage domain={domain as never} page={page} markdownPages={markdownPages} />;
}
