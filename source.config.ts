import { readdirSync } from 'node:fs';
import { defineConfig, defineDocs } from 'fumadocs-mdx/config';
import { z } from 'zod';
import { DOCS_PAGE_TYPES } from './src/lib/analytics/docs-page-type';
import { createScopedDocsFiles } from './src/lib/docs-dev-scope';
import { docsMetaSchema } from './src/lib/docs-meta-schema';
import { createDocsMdxOptions } from './src/lib/mdx/docs-preset';
import {
  isRetiredCnDocsPath,
  retiredCnDocPaths,
} from './src/lib/retired-cn-docs.mjs';

const useDynamicDocsRuntime =
  process.env.FUMADOCS_STATIC_PAYLOAD_DYNAMIC === 'true';
const scopedDocsFiles = createScopedDocsFiles(process.env.DOCS_DEV_SCOPE ?? '');
const scopedPath = scopedDocsFiles?.docs[0].split('/**/')[0];
// This Fumadocs version prefixes negative globs with "./" and its collection
// matcher treats negatives as alternatives. Use positive paths for publication.
// Split only the directories that contain retired content. Unaffected subtrees
// keep glob imports so collection matching and fresh builds stay inexpensive.
function publishedCollectionFiles(
  directory: string,
  kind: 'docs' | 'meta',
): string[] {
  if (isRetiredCnDocsPath(directory)) return [];
  const prefix = directory ? `${directory}/` : '';
  const pattern = kind === 'docs' ? '*.{md,mdx}' : 'meta.{json,yaml}';
  if (!retiredCnDocPaths.some((path) => path.startsWith(prefix))) {
    return [`${prefix}**/${pattern}`];
  }

  return readdirSync(`content/docs/${directory}`, {
    withFileTypes: true,
  }).flatMap((entry) => {
    const file = `${prefix}${entry.name}`;
    if (entry.isDirectory()) return publishedCollectionFiles(file, kind);
    const matches =
      kind === 'docs'
        ? /\.(md|mdx)$/.test(entry.name)
        : /^meta\.(json|yaml)$/.test(entry.name);
    return matches && !isRetiredCnDocsPath(file) ? [file] : [];
  });
}

const rawDocSchema = z.object({
  analyticsPageType: z.enum(DOCS_PAGE_TYPES).optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  hidePlatformTabs: z.boolean().optional(),
  hideToc: z.boolean().optional(),
  layout: z.enum(['platform-group']).optional(),
  tocMaxDepth: z.number().int().min(1).max(6).optional(),
  platforms: z.array(z.string()).optional(),
  titlePlatforms: z.array(z.string()).optional(),
  defaultPlatform: z.string().optional(),
  _openapi: z.looseObject({}).optional(),
  _migration: z.object({ generator: z.string().optional() }).optional(),
});

export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    async: true,
    dynamic: useDynamicDocsRuntime,
    files: publishedCollectionFiles(scopedPath ?? '', 'docs'),
    schema: rawDocSchema,
    mdxOptions: createDocsMdxOptions(
      process.env.VITE_DOCS_REGION === 'cn' ? 'cn' : 'global',
    ),
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    files: [
      ...(scopedDocsFiles?.meta.slice(0, -1) ?? []),
      ...publishedCollectionFiles(scopedPath ?? '', 'meta'),
    ],
    schema: docsMetaSchema,
  },
});

export default defineConfig();
