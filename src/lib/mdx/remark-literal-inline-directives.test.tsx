import { evaluate } from '@mdx-js/mdx';
import { remarkDirectiveAdmonition } from 'fumadocs-core/mdx-plugins';
import type { PropsWithChildren } from 'react';
import * as runtime from 'react/jsx-runtime';
import { renderToStaticMarkup } from 'react-dom/server';
import remarkDirective from 'remark-directive';
import { describe, expect, it } from 'vitest';
import { directiveCalloutTypes } from './directive-callouts';
import { remarkLiteralDirectives } from './remark-literal-directives';

const Block = ({ children }: PropsWithChildren) => <aside>{children}</aside>;

async function renderMarkdown(source: string, format: 'md' | 'mdx') {
  const { default: Content } = await evaluate(source, {
    ...runtime,
    format,
    remarkPlugins: [
      remarkDirective,
      remarkLiteralDirectives,
      [remarkDirectiveAdmonition, { types: directiveCalloutTypes }],
    ],
  });
  return renderToStaticMarkup(
    <Content
      components={{ CalloutContainer: Block, CalloutDescription: Block }}
    />,
  );
}

describe.each(['md', 'mdx'] as const)(
  'literal inline directives in %s',
  (format) => {
    it('keeps clock times, API placeholders and directive-like prose as inline text', async () => {
      const prose =
        'Starts at 10:00 and ends at 11:00. Use :uid or :label[words]{key="value"}.';
      const html = await renderMarkdown(prose, format);
      const root = document.createElement('div');
      root.innerHTML = html;
      expect(root.textContent).toBe(prose);
      expect(root.querySelectorAll('p').length).toBe(1);
      expect(root.querySelector('div, aside')).toBeNull();
    });

    it('retains standard block admonitions and literal times inside them', async () => {
      const html = await renderMarkdown(
        ':::note\nStarts at 10:00.\n:::',
        format,
      );
      const root = document.createElement('div');
      root.innerHTML = html;
      expect(root.querySelector('aside p')?.textContent).toBe(
        'Starts at 10:00.',
      );
      expect(root.querySelector('p div')).toBeNull();
    });
  },
);
