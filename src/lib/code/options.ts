import { rehypeCodeDefaultOptions } from 'fumadocs-core/mdx-plugins/rehype-code';
import type { ShikiTransformer } from 'shiki';
import { normalizeShellOptions } from './shell-options';

function isShellLanguage(language: string) {
  return /^(bash|sh|shell|shellscript|curl)$/.test(language);
}

export const codeLanguageAliases: Record<string, string> = {
  curl: 'bash',
  shell: 'bash',
  js: 'javascript',
  node: 'javascript',
  md: 'markdown',
  objectivec: 'objc',
  txt: 'text',
};

/** Keep legacy emphasis and Shell grammar fixes in the highlighting pipeline. */
function docsCodeTransformer(): ShikiTransformer {
  const highlights = new WeakMap<object, Set<number>>();
  return {
    name: 'docs-code-compatibility',
    preprocess(code, options) {
      if (isShellLanguage(options.lang))
        options.includeExplanation = 'scopeName';
      const marked = new Set<number>();
      const lines: string[] = [];
      let active = false;
      let next = false;
      for (const line of code.split('\n')) {
        const marker = /^\s*\/\/\s*highlight-(start|end|next-line)\s*$/.exec(
          line,
        );
        if (marker) {
          if (marker[1] === 'next-line') next = true;
          else active = marker[1] === 'start';
          continue;
        }
        lines.push(line);
        if (active || next) marked.add(lines.length);
        next = false;
      }
      highlights.set(this.meta, marked);
      return lines.join('\n');
    },
    tokens(tokens) {
      if (!isShellLanguage(this.options.lang)) return;
      // Ask Shiki for the active themes' option style; do not maintain a palette.
      const reference = this.codeToTokens(
        'curl --option',
        this.options,
      ).tokens.flat();
      return normalizeShellOptions(
        tokens,
        reference.find((token) => token.content.trim() === '--option')
          ?.htmlStyle,
      );
    },
    line(node, number) {
      if (highlights.get(this.meta)?.has(number))
        this.addClassToHast(node, 'highlighted');
    },
  };
}

/** Shared by compiled MDX and runtime OpenAPI examples; keep Fumadocs defaults. */
export const codeHighlightOptions = {
  themes: { light: 'github-light', dark: 'github-dark' },
  transformers: [
    docsCodeTransformer(),
    ...(rehypeCodeDefaultOptions.transformers ?? []),
  ],
};
