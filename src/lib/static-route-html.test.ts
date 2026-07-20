import { describe, expect, it } from 'vitest';
import { createStaticRouteHtml } from './static-route-html';

const QUICKSTART_PAGE = {
  canonicalUrl: 'https://docs.agora.io/en/ai/get-started/quickstart',
  description: 'Build a voice agent.',
  imageUrl: 'https://assets-docs.agora.io/og/voice-agent.png',
  title: 'Voice agent quickstart | Agora Docs',
  url: '/en/ai/get-started/quickstart',
};
const SPA_HTML =
  '<html><head><title>Agora Docs</title></head><body><div id="root"></div><script src="/assets/app.js"></script></body></html>';

describe('static route HTML', () => {
  it('keeps a prerendered article body while applying route metadata', () => {
    const result = createStaticRouteHtml({
      page: QUICKSTART_PAGE,
      routeHtml:
        '<html><head><title>Agora Docs</title></head><body><main><article><div data-static-docs-body>Install Agora skills</div></article></main></body></html>',
      spaHtml: SPA_HTML,
    });

    expect(result).toContain(
      '<div data-static-docs-body>Install Agora skills</div>',
    );
    expect(result).toContain(
      '<title>Voice agent quickstart | Agora Docs</title>',
    );
  });

  it('fails when a production canonical route has no prerendered HTML', () => {
    expect(() =>
      createStaticRouteHtml({
        page: QUICKSTART_PAGE,
        spaHtml: SPA_HTML,
      }),
    ).toThrow('Missing prerendered HTML for canonical route');
  });

  it('rejects an existing route file that still contains only the SPA shell', () => {
    expect(() =>
      createStaticRouteHtml({
        page: QUICKSTART_PAGE,
        routeHtml: SPA_HTML,
        spaHtml: SPA_HTML,
      }),
    ).toThrow('Missing prerendered HTML for canonical route');
  });

  it('rejects a canonical route whose marked docs body is empty', () => {
    expect(() =>
      createStaticRouteHtml({
        page: QUICKSTART_PAGE,
        routeHtml:
          '<html><head><title>Agora Docs</title></head><body><main><article><div data-static-docs-body></div></article></main></body></html>',
        spaHtml: SPA_HTML,
      }),
    ).toThrow('Missing prerendered HTML for canonical route');
  });

  it('rejects a canonical route that only rendered the content skeleton', () => {
    expect(() =>
      createStaticRouteHtml({
        page: QUICKSTART_PAGE,
        routeHtml:
          '<html><head><title>Agora Docs</title></head><body><main><article><div data-static-docs-body><div data-testid="docs-content-skeleton"><span></span></div></div></article></main></body></html>',
        spaHtml: SPA_HTML,
      }),
    ).toThrow('Missing prerendered HTML for canonical route');
  });

  it('allows the SPA shell for routes omitted by a focused build', () => {
    const result = createStaticRouteHtml({
      allowSpaFallback: true,
      page: {
        ...QUICKSTART_PAGE,
        canonicalUrl: 'https://docs.agora.io/en/ai/build/start-stop-agent',
        description: 'Control an agent.',
        title: 'Start and stop an agent | Agora Docs',
        url: '/en/ai/build/start-stop-agent',
      },
      spaHtml: SPA_HTML,
    });

    expect(result).toContain('<script src="/assets/app.js"></script>');
    expect(result).toContain(
      '<title>Start and stop an agent | Agora Docs</title>',
    );
  });
});
