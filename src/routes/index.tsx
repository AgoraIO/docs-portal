import { createFileRoute } from '@tanstack/react-router';
import { HomePage } from '@/components/home/HomePage';

export const Route = createFileRoute('/')({
  validateSearch: (search: Record<string, unknown>) => ({
    domain: typeof search.domain === 'string' ? search.domain : undefined,
    page: typeof search.page === 'string' ? search.page : undefined,
  }),
  component: Home,
});

function Home() {
  const { domain, page } = Route.useSearch();
  return <HomePage domain={domain as never} page={page} />;
}
