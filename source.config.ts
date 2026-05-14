import { defineConfig, defineDocs } from 'fumadocs-mdx/config';
import { z } from 'zod';

const rawDocSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  full: z.boolean().optional(),
  _openapi: z.looseObject({}).optional(),
});

export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    schema: rawDocSchema,
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
});

export default defineConfig();
