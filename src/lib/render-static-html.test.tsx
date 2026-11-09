import { Suspense, use } from 'react';
import { expect, it } from 'vitest';
import { renderStaticHtml } from './render-static-html';

function AsyncContent({ content }: { content: Promise<string> }) {
  return <p>{use(content)}</p>;
}

it('inlines large async documentation into its article without streaming fallback segments', async () => {
  const text = 'Resolved documentation content. '.repeat(2000);
  const content = Promise.resolve(text);
  const html = await renderStaticHtml(
    <html lang="en">
      <head>
        <title>Documentation</title>
      </head>
      <body>
        <article data-static-docs-body>
          <Suspense fallback={<div data-testid="docs-content-skeleton" />}>
            <AsyncContent content={content} />
          </Suspense>
        </article>
      </body>
    </html>,
  );

  expect(html).toContain(text);
  expect(html.indexOf(text)).toBeLessThan(html.indexOf('</article>'));
  expect(html).not.toContain('docs-content-skeleton');
  expect(html).not.toContain('<!DOCTYPE html>');
});
