import {
  rehypeCodeDefaultOptions,
  remarkDirectiveAdmonition,
} from 'fumadocs-core/mdx-plugins';
import { applyMdxPreset, defineConfig, defineDocs } from 'fumadocs-mdx/config';
import remarkDirective from 'remark-directive';
import { z } from 'zod';
import { DOCS_PAGE_TYPES } from './src/lib/analytics/docs-page-type';
import { getCodeLanguageLabel } from './src/lib/code/label';
import {
  codeHighlightOptions,
  codeLanguageAliases,
} from './src/lib/code/options';
import { createScopedDocsFiles } from './src/lib/docs-dev-scope';
import { docsMetaSchema } from './src/lib/docs-meta-schema';
import { directiveCalloutTypes } from './src/lib/mdx/directive-callouts';
import { remarkLiteralInlineDirectives } from './src/lib/mdx/remark-literal-inline-directives';
import { remarkMergedTables } from './src/lib/mdx/remark-merged-tables';
import { remarkNormalizeLegacyHeadingAnchors } from './src/lib/mdx/remark-normalize-legacy-heading-anchors';
import { remarkOmitMdxComments } from './src/lib/mdx/remark-omit-mdx-comments';
import { remarkTableSlots } from './src/lib/mdx/remark-table-slots';
import { remarkPlatformContent } from './src/lib/platforms/remark-platform-content';

const useDynamicDocsRuntime =
  process.env.FUMADOCS_STATIC_PAYLOAD_DYNAMIC === 'true';
const scopedDocsFiles = createScopedDocsFiles(process.env.DOCS_DEV_SCOPE ?? '');

const rawDocSchema = z.object({
  analyticsPageType: z.enum(DOCS_PAGE_TYPES).optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  hidePlatformTabs: z.boolean().optional(),
  hideToc: z.boolean().optional(),
  tocMaxDepth: z.number().int().min(1).max(6).optional(),
  layout: z.enum(['platform-group']).optional(),
  platforms: z.array(z.string()).optional(),
  defaultPlatform: z.string().optional(),
  _openapi: z.looseObject({}).optional(),
  _migration: z.object({ generator: z.string().optional() }).optional(),
});

export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    async: true,
    dynamic: useDynamicDocsRuntime,
    files: scopedDocsFiles?.docs ?? ['**/*.{md,mdx}'],
    schema: rawDocSchema,
    mdxOptions: applyMdxPreset({
      rehypeCodeOptions: {
        ...rehypeCodeDefaultOptions,
        ...codeHighlightOptions,
        icon: false,
        parseMetaString(meta, node, tree) {
          const parsed = rehypeCodeDefaultOptions.parseMetaString?.(
            meta,
            node,
            tree,
          );
          const code = node.children[0];
          const classes =
            code?.type === 'element' ? code.properties.className : undefined;
          const languageClass = Array.isArray(classes)
            ? classes.find(
                (value) =>
                  typeof value === 'string' && value.startsWith('language-'),
              )
            : undefined;
          // Read the authored language before an unsupported grammar falls back to text.
          const language =
            typeof languageClass === 'string'
              ? languageClass.slice(9)
              : undefined;
          return {
            ...parsed,
            'data-code-language': language,
            title: parsed?.title ?? getCodeLanguageLabel(language),
            'data-language-label': parsed?.title
              ? undefined
              : getCodeLanguageLabel(language),
          };
        },
        langs: [
          'bash',
          'cpp',
          'csharp',
          'css',
          'dart',
          'go',
          'html',
          'http',
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
        langAlias: codeLanguageAliases,
        fallbackLanguage: 'text',
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
        remarkOmitMdxComments,
        remarkDirective,
        remarkLiteralInlineDirectives,
        [
          remarkDirectiveAdmonition,
          {
            types: directiveCalloutTypes,
          },
        ],
        remarkPlatformContent,
        remarkMergedTables,
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
    files: scopedDocsFiles?.meta ?? ['**/meta.{json,yaml}'],
    schema: docsMetaSchema,
  },
});

export default defineConfig();
