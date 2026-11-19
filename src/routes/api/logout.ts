import { createFileRoute } from '@tanstack/react-router';
import { handleDocsAuthRequest } from '@/lib/auth/auth-api.server';

export const Route = createFileRoute('/api/logout')({
  server: {
    handlers: { POST: ({ request }) => handleDocsAuthRequest(request) },
  },
});
