import {
  rehypeCodeDefaultOptions,
  remarkDirectiveAdmonition,
} from 'fumadocs-core/mdx-plugins';
import { applyMdxPreset, defineConfig, defineDocs } from 'fumadocs-mdx/config';
import remarkDirective from 'remark-directive';
import { z } from 'zod';
import { docsMetaSchema } from './src/lib/docs-meta-schema';

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
    async: true,
    schema: rawDocSchema,
    mdxOptions: applyMdxPreset({
      rehypeCodeOptions: {
        ...rehypeCodeDefaultOptions,
        langs: [
          'bash',
          'c',
          'csharp',
          'go',
          'java',
          'javascript',
          'json',
          'kotlin',
          'markdown',
          'objc',
          'php',
          'powershell',
          'python',
          'shellscript',
          'swift',
          'toml',
          'tsx',
          'typescript',
        ],
        langAlias: {
          ...rehypeCodeDefaultOptions.langAlias,
          cs: 'csharp',
          curl: 'bash',
          js: 'javascript',
          md: 'markdown',
          objectivec: 'objc',
          ps1: 'powershell',
          sh: 'shellscript',
          shell: 'shellscript',
          text: 'bash',
          ts: 'typescript',
          txt: 'bash',
          zsh: 'shellscript',
          ini: 'toml',
        },
        fallbackLanguage: 'bash',
        lazy: false,
      },
      remarkImageOptions: {
        external: false,
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
        ...plugins,
      ],
    }),
  },
  meta: {
    schema: docsMetaSchema,
  },
});

export default defineConfig();
