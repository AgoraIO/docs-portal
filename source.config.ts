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
import { remarkTableSlots } from './src/lib/mdx/remark-table-slots';
import { remarkPlatformContent } from './src/lib/platforms/remark-platform-content';

const useDynamicDocsRuntime =
  process.env.FUMADOCS_STATIC_PAYLOAD_DYNAMIC === 'true';
const scopedDocsFiles = createScopedDocsFiles(process.env.DOCS_DEV_SCOPE ?? '');

const rawDocSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  hidePlatformTabs: z.boolean().optional(),
  hideToc: z.boolean().optional(),
  layout: z.enum(['platform-group']).optional(),
  platforms: z.array(z.string()).optional(),
  defaultPlatform: z.string().optional(),
  _openapi: z.looseObject({}).optional(),
});

export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    async: true,
    dynamic: useDynamicDocsRuntime,
    files: scopedDocsFiles?.docs,
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
      ],
    }),
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    files: scopedDocsFiles?.meta ?? ['**/meta.{json,yaml}'],
    schema: docsMetaSchema,
  },
});

export default defineConfig();
