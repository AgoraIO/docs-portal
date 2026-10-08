import { createFileRoute } from '@tanstack/react-router';
import { handleSearchRequest } from '@/lib/search/search-api.server';

export const Route = createFileRoute('/api/search')({
  server: { handlers: { GET: ({ request }) => handleSearchRequest(request) } },
});
