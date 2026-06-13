import {
  rehypeCodeDefaultOptions,
  remarkDirectiveAdmonition,
} from 'fumadocs-core/mdx-plugins';
import { applyMdxPreset, defineConfig, defineDocs } from 'fumadocs-mdx/config';
import remarkDirective from 'remark-directive';
import { z } from 'zod';
import { docsMetaSchema } from './src/lib/docs-meta-schema';
import { remarkPlatformContent } from './src/lib/platforms/remark-platform-content';

const rawDocSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  full: z.boolean().optional(),
  hidePlatformTabs: z.boolean().optional(),
  _openapi: z.looseObject({}).optional(),
});

export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
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
            types: {
              danger: 'error',
              info: 'info',
              note: 'info',
              success: 'ok',
              tip: 'ok',
              warn: 'warning',
              warning: 'warning',
            },
          },
        ],
        remarkPlatformContent,
        ...plugins,
      ],
    }),
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: docsMetaSchema,
  },
});

export default defineConfig();
