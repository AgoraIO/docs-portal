import { createFileRoute } from '@tanstack/react-router';
import { flexsearchFromSource } from 'fumadocs-core/search/flexsearch';

export const Route = createFileRoute('/$lang/api/search')({
  server: {
    handlers: {
      GET: async () => {
        const { source } = await import('@/lib/source');
        const server = flexsearchFromSource(source, {
          localeMap: {
            'zh-CN': 'cjk',
          },
        });

        return server.staticGET();
      },
    },
  },
});
