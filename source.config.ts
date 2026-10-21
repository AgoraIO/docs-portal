import { readdirSync } from 'node:fs';
import {
  rehypeCodeDefaultOptions,
  remarkDirectiveAdmonition,
} from 'fumadocs-core/mdx-plugins';
import { applyMdxPreset, defineConfig, defineDocs } from 'fumadocs-mdx/config';
import remarkDirective from 'remark-directive';
import { z } from 'zod';
import { createScopedDocsFiles } from './src/lib/docs-dev-scope';
import { docsMetaSchema } from './src/lib/docs-meta-schema';
import { directiveCalloutTypes } from './src/lib/mdx/directive-callouts';
import { remarkNormalizeLegacyHeadingAnchors } from './src/lib/mdx/remark-normalize-legacy-heading-anchors';
import { remarkTableSlots } from './src/lib/mdx/remark-table-slots';
import { remarkPlatformContent } from './src/lib/platforms/remark-platform-content';
import { isRetiredCnDocsPath } from './src/lib/retired-cn-docs.mjs';

const useDynamicDocsRuntime =
  process.env.FUMADOCS_STATIC_PAYLOAD_DYNAMIC === 'true';
const scopedDocsFiles = createScopedDocsFiles(process.env.DOCS_DEV_SCOPE ?? '');
const scopedPath = scopedDocsFiles?.docs[0].split('/**/')[0];
// This Fumadocs version prefixes negative globs with "./" and its collection
// matcher treats negatives as alternatives. Use positive paths for publication.
const publicFiles = readdirSync('content/docs', { recursive: true })
  .map(String)
  .filter((file) => !isRetiredCnDocsPath(file));

const rawDocSchema = z.object({
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
});

export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    async: true,
    dynamic: useDynamicDocsRuntime,
    files: scopedPath
      ? publicFiles.filter(
          (file) =>
            file.startsWith(`${scopedPath}/`) && /\.(md|mdx)$/.test(file),
        )
      : publicFiles.filter((file) => /\.(md|mdx)$/.test(file)),
    schema: rawDocSchema,
    mdxOptions: applyMdxPreset({
      rehypeCodeOptions: {
        ...rehypeCodeDefaultOptions,
        langs: [
          'bash',
          'cpp',
          'csharp',
          'css',
          'dart',
          'go',
          'html',
          'java',
          'javascript',
          'json',
          'kotlin',
          'markdown',
          'objc',
          'php',
          'python',
          'ruby',
          'sh',
          'swift',
          'ts',
          'tsx',
          'typescript',
          'xml',
          'yaml',
        ],
        langAlias: {
          ...rehypeCodeDefaultOptions.langAlias,
          curl: 'bash',
          js: 'javascript',
          md: 'markdown',
          objectivec: 'objc',
          text: 'bash',
          txt: 'bash',
        },
        fallbackLanguage: 'bash',
        lazy: false,
      },
      remarkImageOptions: {
        external: false,
        onError: 'ignore',
        useImport: false,
      },
      remarkCodeTabOptions: {
        Tabs: 'CodeBlockTabs',
        parseMdx: true,
      },
      remarkPlugins: (plugins) => [
        remarkDirective,
        [
          remarkDirectiveAdmonition,
          {
            types: directiveCalloutTypes,
          },
        ],
        remarkPlatformContent,
        remarkTableSlots,
        ...plugins,
        remarkNormalizeLegacyHeadingAnchors,
      ],
    }),
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    files: publicFiles.filter(
      (file) =>
        /(?:^|\/)meta\.(json|yaml)$/.test(file) &&
        (!scopedPath ||
          file.startsWith(`${scopedPath}/`) ||
          scopedPath.startsWith(file.slice(0, file.lastIndexOf('/') + 1))),
    ),
    schema: docsMetaSchema,
  },
});

export default defineConfig();
