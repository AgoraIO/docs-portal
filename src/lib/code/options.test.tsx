import { compile, run } from '@mdx-js/mdx';
import { load } from 'cheerio';
import { rehypeCodeDefaultOptions } from 'fumadocs-core/mdx-plugins/rehype-code';
import { remarkLLMs } from 'fumadocs-core/mdx-plugins/remark-llms';
import { applyMdxPreset } from 'fumadocs-mdx/config';
import type { ComponentProps } from 'react';
import * as runtime from 'react/jsx-runtime';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { getMDXComponents } from '@/components/mdx';
import { createStaticRouteHtml } from '@/lib/static-route-html';
import { docs } from '../../../source.config';

async function renderMarkdown(markdown: string, defaults = false) {
  if (typeof docs.docs.mdxOptions !== 'function')
    throw new Error('Expected MDX configuration');
  const preset = defaults
    ? applyMdxPreset({ rehypeCodeOptions: rehypeCodeDefaultOptions })
    : await docs.docs.mdxOptions('bundler');
  const options =
    typeof preset === 'function' ? await preset('bundler') : preset;
  const compiled = await compile(markdown, {
    ...options,
    remarkPlugins: [
      ...(options.remarkPlugins ?? []),
      [remarkLLMs, { _data: true }],
    ],
    outputFormat: 'function-body',
    development: false,
  });
  const { default: Content } = await run(String(compiled), runtime);
  return {
    html: renderToStaticMarkup(
      <Content
        components={getMDXComponents({
          a: (props: ComponentProps<'a'>) => <a {...props} />,
        })}
      />,
    ),
    markdown: compiled.data.markdown,
  };
}

describe('shared code highlighting', () => {
  it('renders legacy emphasis and built-in diff notation in static HTML', async () => {
    const { html } = await renderMarkdown(
      '```ts title="client.ts"\n// highlight-start\nconst old = 1; // [!code --]\n// highlight-end\nconst next = 2; // [!code ++]\n```',
    );
    const $ = load(html);
    expect($('pre').text()).toBe('const old = 1; \nconst next = 2; ');
    expect($('.line.highlighted.diff.remove')).toHaveLength(1);
    expect($('.line.diff.add')).toHaveLength(1);
    expect($('figcaption').text()).toBe('client.ts');
    expect($('pre span[style*="--shiki-light"]')).not.toHaveLength(0);
  });

  it('keeps complete code, headings, links and SEO metadata without hydration', async () => {
    const source = Array.from(
      { length: 47 },
      (_, i) => `const line${i} = "<value>&";`,
    ).join('\n');
    const { html } = await renderMarkdown(
      `# Example\n\n[API reference](/en/api-reference)\n\n\`\`\`ts\n${source}\n\`\`\``,
    );
    const result = createStaticRouteHtml({
      page: {
        canonicalUrl: 'https://docs.agora.io/en/example',
        markdownUrl: 'https://docs.agora.io/en/example.md',
        title: 'Example | Agora Docs',
        description: 'Example code.',
        imageUrl: 'https://docs.agora.io/og.png',
        url: '/en/example',
      },
      routeHtml: `<html><head></head><body><article><div data-static-docs-body>${html}</div></article></body></html>`,
      spaHtml: '',
    });
    const $ = load(result);
    expect($('pre').text()).toBe(source);
    expect($('pre value')).toHaveLength(0);
    expect($('h1').text()).toContain('Example');
    expect($('a[href="/en/api-reference"]')).toHaveLength(1);
    expect($('link[rel="canonical"]').attr('href')).toBe(
      'https://docs.agora.io/en/example',
    );
    expect($('link[type="text/markdown"]').attr('href')).toBe(
      'https://docs.agora.io/en/example.md',
    );
    expect($('[data-collapsed]')).toHaveLength(0);
  });

  it('leaves processed Markdown for llms and .md exports identical to Fumadocs defaults', async () => {
    const markdown =
      '# Example\n\n[API reference](/en/api-reference)\n\n```ts title="client.ts"\n// highlight-start\nconst value = "<value>&"; // [!code highlight]\n// highlight-end\n```';
    const before = await renderMarkdown(markdown, true);
    const after = await renderMarkdown(markdown);
    expect(after.markdown).toBe(before.markdown);
    expect(after.markdown).toContain('const value = "<value>&";');
    expect(after.markdown).not.toMatch(/<figure|<button|shiki/);
  });
});
