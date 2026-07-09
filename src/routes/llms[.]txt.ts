import { createFileRoute } from '@tanstack/react-router';
import { getRuntimeMachineReadableDocsIndexes } from '@/lib/llms-index.server';

export const Route = createFileRoute('/llms.txt')({
  server: {
    handlers: {
      async GET() {
        const [rootIndex] = await getRuntimeMachineReadableDocsIndexes();

        return new Response(rootIndex?.content ?? '');
      },
    },
  },
});
