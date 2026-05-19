import {
  rehypeCodeDefaultOptions,
  remarkDirectiveAdmonition,
} from 'fumadocs-core/mdx-plugins';
import { applyMdxPreset, defineConfig, defineDocs } from 'fumadocs-mdx/config';
import remarkDirective from 'remark-directive';
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
          objectivec: 'objc',
        },
        fallbackLanguage: 'plaintext',
        lazy: false,
      },
      remarkImageOptions: {
        useImport: false,
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
        ...plugins,
      ],
    }),
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
});

export default defineConfig();
