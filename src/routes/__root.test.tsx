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

  it('loads Securiti auto-blocking, the consent bridge and the SDK first in head', () => {
    const html = renderToStaticMarkup(
      <RootDocument>
        <main>Docs</main>
      </RootDocument>,
    );

    const head = html.match(/<head>(.*?)<\/head>/s)?.[1] ?? '';

    const scripts = head.match(/<script\b[^>]*><\/script>/g) ?? [];

    // React hoists metadata tags, so assert the script order rather than the
    // full head: no script may run before Securiti auto-blocking.
    expect(scripts).toEqual([
      '<script src="https://cdn-prod.securiti.ai/consent/auto_blocking/b373a629-85bf-440d-824a-a86fc32ae3e9/7ba04bfc-c10b-4f3a-80d5-bf9ed910b46f.js"></script>',
      '<script src="/js/consent-bridge.js" data-skip-blocking="true"></script>',
      '<script defer="" src="https://cdn-prod.securiti.ai/consent/cookie-consent-sdk-loader.js" data-tenant-uuid="b373a629-85bf-440d-824a-a86fc32ae3e9" data-domain-uuid="7ba04bfc-c10b-4f3a-80d5-bf9ed910b46f" data-backend-url="https://app.securiti.ai" data-skip-css="false"></script>',
    ]);
  });

  it('does not start Google Tag Manager or any tracker in server-rendered HTML', () => {
    const html = renderToStaticMarkup(
      <RootDocument>
        <main>Docs</main>
      </RootDocument>,
    );

    expect(html).not.toContain('googletagmanager.com');
    expect(html).not.toContain('posthog');
    expect(html).not.toContain('reo.dev');
    expect(html).not.toContain('<noscript>');
  });
});
