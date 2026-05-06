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
  dir: 'content/portal-docs',
  docs: {
    // docs-cortex currently stores raw markdown without Fumadocs frontmatter.
    // Allow missing title here so MDX postprocessing can derive it from the first H1.
    schema: rawDocSchema,
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: z.object({
      title: z.string().optional(),
      pages: z.array(z.string()).optional(),
      description: z.string().optional(),
      root: z.boolean().optional(),
      defaultOpen: z.boolean().optional(),
      collapsible: z.boolean().optional(),
      icon: z.string().optional(),
    }),
  },
});

export default defineConfig();
