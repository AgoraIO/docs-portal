import { createFileRoute } from '@tanstack/react-router';
import { handleDocsAuthRequest } from '@/lib/auth/auth-api.server';

export const Route = createFileRoute('/api/auth/login')({
  server: {
    handlers: { GET: ({ request }) => handleDocsAuthRequest(request) },
  },
});
