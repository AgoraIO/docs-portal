import { readdirSync } from 'node:fs';
import {
  rehypeCodeDefaultOptions,
  remarkDirectiveAdmonition,
} from 'fumadocs-core/mdx-plugins';
import { applyMdxPreset, defineConfig, defineDocs } from 'fumadocs-mdx/config';
import remarkDirective from 'remark-directive';
import { z } from 'zod';
import { codePresentationTransformer } from './src/lib/code/presentation';
import { codeThemes, codeTokenVariable } from './src/lib/code/theme';
import { createScopedDocsFiles } from './src/lib/docs-dev-scope';
import { docsMetaSchema } from './src/lib/docs-meta-schema';
import { directiveCalloutTypes } from './src/lib/mdx/directive-callouts';
import { remarkNormalizeLegacyHeadingAnchors } from './src/lib/mdx/remark-normalize-legacy-heading-anchors';
import { remarkOmitMdxComments } from './src/lib/mdx/remark-omit-mdx-comments';
import { remarkTableSlots } from './src/lib/mdx/remark-table-slots';
import { remarkPlatformContent } from './src/lib/platforms/remark-platform-content';
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
    files: publishedCollectionFiles(scopedPath ?? '', 'docs'),
    schema: rawDocSchema,
    mdxOptions: applyMdxPreset({
      rehypeCodeOptions: {
        ...rehypeCodeDefaultOptions,
        themes: codeThemes,
        transformers: [
          codePresentationTransformer(),
          ...(rehypeCodeDefaultOptions.transformers ?? []),
          {
            name: 'docs-code-language',
            span(node) {
              const style = node.properties.style;
              if (typeof style === 'string')
                node.properties.style = style.replace(
                  /--shiki-(light|dark):([^;]+)/g,
                  (_match, mode: 'light' | 'dark', color: string) =>
                    `--shiki-${mode}:${codeTokenVariable(color.trim(), mode)}`,
                );
            },
            pre(node) {
              node.properties['data-language'] = this.options.lang;
              if (
                /(?:^|\s)noLineNumbers(?:\s|$)/.test(
                  String(this.options.meta?.__raw ?? ''),
                )
              )
                node.properties['data-no-line-numbers'] = 'true';
            },
          },
        ],
        addLanguageClass: true,
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
        remarkOmitMdxComments,
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
    files: [
      ...(scopedDocsFiles?.meta.slice(0, -1) ?? []),
      ...publishedCollectionFiles(scopedPath ?? '', 'meta'),
    ],
    schema: docsMetaSchema,
  },
});

export default defineConfig();
