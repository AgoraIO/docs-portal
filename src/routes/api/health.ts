import { createFileRoute } from '@tanstack/react-router';
import { handleHealthRequest } from '@/lib/search/search-api.server';

export const Route = createFileRoute('/api/health')({
  server: {
    handlers: {
      GET: () => handleHealthRequest(),
    },
  },
});
