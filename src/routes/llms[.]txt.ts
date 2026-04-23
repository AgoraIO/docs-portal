import { createFileRoute } from '@tanstack/react-router';
import { llms } from 'fumadocs-core/source';

export const Route = createFileRoute('/llms.txt')({
  server: {
    handlers: {
      async GET() {
        const { source } = await import('@/lib/source');
        return new Response(llms(source).index());
      },
    },
  },
});
