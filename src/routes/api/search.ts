import { createFileRoute } from '@tanstack/react-router';
import { getAlgoliaDocsRecords } from '@/lib/search/algolia-records.server';

export const Route = createFileRoute('/api/search')({
  server: {
    handlers: {
      GET: async () =>
        Response.json({
          records: await getAlgoliaDocsRecords(),
        }),
    },
  },
});
