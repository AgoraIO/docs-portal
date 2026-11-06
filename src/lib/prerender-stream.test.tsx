// @vitest-environment node

import { createRequire } from 'node:module';
import { createRootRoute, createRouter } from '@tanstack/react-router';
import {
  attachRouterServerSsrUtils,
  renderRouterToStream,
} from '@tanstack/react-router/ssr/server';
import { lazy, Suspense } from 'react';
import { describe, expect, it } from 'vitest';
import { createStaticRouteHtml } from './static-route-html';

const page = {
  canonicalUrl: 'https://docs.agora.io/en/api-reference/example',
  title: 'Example',
  description: 'Reference documentation.',
  imageUrl: 'https://docs.agora.io/og.png',
  url: '/en/api-reference/example',
};

const renderers: [string, typeof renderRouterToStream][] = [
  ['ESM', renderRouterToStream],
  [
    'CommonJS',
    createRequire(import.meta.url)('@tanstack/react-router/ssr/server')
      .renderRouterToStream,
  ],
];

function renderSuspendedArticle(
  userAgent: string,
  signal?: AbortSignal,
  render = renderRouterToStream,
) {
  const router = createRouter({ routeTree: createRootRoute(), isServer: true });
  attachRouterServerSsrUtils({ router, manifest: undefined });
  router.serverSsr?.disableHydration();
  let resolveBody!: () => void;
  const ready = new Promise<void>((resolve) => {
    resolveBody = resolve;
  });
  const Body = lazy(async () => {
    await ready;
    return { default: () => <p>Complete reference body</p> };
  });
  const rendered = render({
    router,
    request: new Request('https://docs.agora.io/en/api-reference/example', {
      headers: { 'User-Agent': userAgent },
      signal,
    }),
    responseHeaders: new Headers({ 'Content-Type': 'text/html' }),
    children: (
      <html lang="en">
        <head>
          <title>Example</title>
        </head>
        <body>
          <article>
            <div data-static-docs-body>
              <Suspense fallback={<div data-testid="docs-content-skeleton" />}>
                <Body />
              </Suspense>
            </div>
          </article>
        </body>
      </html>
    ),
  });
  return { rendered, resolveBody, router };
}

describe('static prerender streaming compatibility', () => {
  it.each(renderers)(
    '%s writes resolved Suspense content inside the article for crawlers',
    async (_format, render) => {
      const { rendered, resolveBody } = renderSuspendedArticle(
        'DocsPortal Prerender',
        undefined,
        render,
      );
      // Let the renderer emit a shell before the asynchronous MDX body is ready.
      await new Promise((resolve) => setTimeout(resolve, 10));
      resolveBody();
      const { response } = await rendered;
      const html = await response.text();

      expect(() =>
        createStaticRouteHtml({ page, routeHtml: html, spaHtml: '' }),
      ).not.toThrow();
      expect(html).toContain('Complete reference body');
      expect(html).not.toContain('docs-content-skeleton');
    },
  );

  it('keeps progressive rendering for normal browsers', async () => {
    const { rendered, resolveBody } = renderSuspendedArticle(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
    );
    const { response } = await rendered;
    const html = response.text();
    resolveBody();
    expect(await html).toContain('docs-content-skeleton');
  });

  it('releases the router when a crawler request is aborted while waiting', async () => {
    const controller = new AbortController();
    const { rendered, resolveBody, router } = renderSuspendedArticle(
      'DocsPortal Prerender',
      controller.signal,
    );
    const rejection = expect(rendered).rejects.toBeDefined();
    await new Promise((resolve) => setTimeout(resolve, 10));
    controller.abort();
    resolveBody();
    await rejection;
    expect(router.serverSsr).toBeUndefined();
  });
});
