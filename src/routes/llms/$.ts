import { createFileRoute, notFound } from '@tanstack/react-router';
import { getRuntimeMachineReadableDocsIndexes } from '@/lib/llms-index.server';

export const Route = createFileRoute('/llms/$')({
  server: {
    handlers: {
      async GET({ params }) {
        const section = params._splat;

        if (!section?.endsWith('.txt')) {
          throw notFound();
        }

        const indexes = await getRuntimeMachineReadableDocsIndexes();
        const index = indexes.find((file) => file.path === `/llms/${section}`);

        if (!index && section.endsWith('-full.txt')) {
          const { getDocVersionBulkExports } = await import(
            '@/lib/doc-version-exports.server'
          );
          const file = (await getDocVersionBulkExports()).find(
            (item) => item.path === `/llms/${section}`,
          );
          if (file) return new Response(file.content);
        }

        if (!index) {
          throw notFound();
        }

        return new Response(index.content);
      },
    },
  },
});
