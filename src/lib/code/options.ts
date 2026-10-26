import { rehypeCodeDefaultOptions } from 'fumadocs-core/mdx-plugins/rehype-code';
import type { ShikiTransformer } from 'shiki';

export const codeLanguageAliases: Record<string, string> = {
  curl: 'bash',
  shell: 'bash',
  js: 'javascript',
  node: 'javascript',
  md: 'markdown',
  objectivec: 'objc',
  txt: 'text',
};

/** Keep legacy emphasis at compilation/highlighting time, outside the UI. */
function legacyHighlightTransformer(): ShikiTransformer {
  const highlights = new WeakMap<object, Set<number>>();
  return {
    name: 'docs-legacy-highlight',
    preprocess(code) {
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
    legacyHighlightTransformer(),
    ...(rehypeCodeDefaultOptions.transformers ?? []),
  ],
};
