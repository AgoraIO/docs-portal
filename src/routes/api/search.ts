import { createFileRoute } from '@tanstack/react-router';
import { createFromSource } from 'fumadocs-core/search/server';

export const Route = createFileRoute('/api/search')({
  server: {
    handlers: {
      GET: async () => {
        const { source } = await import('@/lib/source');
        const server = createFromSource(source, {
          // https://docs.orama.com/docs/orama-js/supported-languages
          language: 'english',
          localeMap: {
            en: 'english',
            'zh-CN': 'english',
          },
        });

        return server.staticGET();
      },
    },
  },
});
