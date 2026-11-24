import {
  rehypeCodeDefaultOptions,
  remarkDirectiveAdmonition,
} from 'fumadocs-core/mdx-plugins';
import { applyMdxPreset } from 'fumadocs-mdx/config';
import remarkDirective from 'remark-directive';
import { getCodeLanguageLabel } from '../code/label';
import { codeHighlightOptions, codeLanguageAliases } from '../code/options';
import { remarkPlatformContent } from '../platforms/remark-platform-content';
import { directiveCalloutTypes } from './directive-callouts';
import { remarkLiteralDirectives } from './remark-literal-directives';
import { remarkMergedTables } from './remark-merged-tables';
import { remarkNormalizeLegacyHeadingAnchors } from './remark-normalize-legacy-heading-anchors';
import { remarkOmitMdxComments } from './remark-omit-mdx-comments';
import { remarkTableSlots } from './remark-table-slots';

export function createDocsMdxOptions(region: 'cn' | 'global') {
  const chinese = region === 'cn';
  return applyMdxPreset({
    rehypeCodeOptions: {
      ...rehypeCodeDefaultOptions,
      ...(chinese
        ? {
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
                code?.type === 'element'
                  ? code.properties.className
                  : undefined;
              const languageClass = Array.isArray(classes)
                ? classes.find(
                    (value) =>
                      typeof value === 'string' &&
                      value.startsWith('language-'),
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
          }
        : {}),
      langs: [
        'bash',
        'cpp',
        'csharp',
        'css',
        'dart',
        ...(chinese ? ['dotenv' as const] : []),
        'go',
        'html',
        ...(chinese ? ['http' as const] : []),
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
      langAlias: chinese
        ? codeLanguageAliases
        : {
            ...rehypeCodeDefaultOptions.langAlias,
            curl: 'bash',
            js: 'javascript',
            md: 'markdown',
            objectivec: 'objc',
            text: 'bash',
            txt: 'bash',
          },
      fallbackLanguage: chinese ? 'text' : 'bash',
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
      [remarkOmitMdxComments, { chineseFilesOnly: !chinese }],
      remarkDirective,
      ...(chinese ? [remarkLiteralDirectives] : []),
      [
        remarkDirectiveAdmonition,
        {
          types: directiveCalloutTypes,
        },
      ],
      remarkPlatformContent,
      ...(chinese ? [remarkMergedTables] : []),
      [remarkTableSlots, { exportSlotAnchors: chinese }],
      ...plugins,
      ...(chinese ? [remarkNormalizeLegacyHeadingAnchors] : []),
    ],
  });
}
