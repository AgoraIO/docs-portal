import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RootDocument } from './__root';

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const router =
    await importOriginal<typeof import('@tanstack/react-router')>();

  return {
    ...router,
    HeadContent: () => <meta data-testid="head-content" />,
    Scripts: () => <script data-testid="app-scripts" />,
  };
});

describe('RootDocument', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_GTM_ID', 'GTM-TKTWGML');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('renders the Google Tag Manager loader in head', () => {
    const html = renderToStaticMarkup(
      <RootDocument>
        <main>Docs</main>
      </RootDocument>,
    );

    const head = html.match(/<head>(.*?)<\/head>/s)?.[1] ?? '';

    expect(head).toMatch(
      /<script>.*googletagmanager\.com\/gtm\.js\?id=.*GTM-TKTWGML.*<\/script>/s,
    );
  });

  it('places the Google Tag Manager fallback first in body', () => {
    const html = renderToStaticMarkup(
      <RootDocument>
        <main>Docs</main>
      </RootDocument>,
    );

    const body = html.match(/<body[^>]*>(.*?)<\/body>/s)?.[1] ?? '';

    expect(body).toMatch(
      /^<noscript><iframe src="https:\/\/www\.googletagmanager\.com\/ns\.html\?id=GTM-TKTWGML" title="Google Tag Manager" height="0" width="0" style="display:none;visibility:hidden"><\/iframe><\/noscript><main>Docs<\/main><script data-testid="app-scripts"><\/script>$/,
    );
  });

  it('does not load Google Tag Manager when no container is configured', () => {
    vi.stubEnv('VITE_GTM_ID', '');

    const html = renderToStaticMarkup(
      <RootDocument>
        <main>Docs</main>
      </RootDocument>,
    );

    expect(html).not.toContain('googletagmanager.com');
    expect(html).not.toContain('<noscript>');
  });
});
