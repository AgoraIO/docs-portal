import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
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
  it('renders the CookieYes loader first in head', () => {
    const html = renderToStaticMarkup(
      <RootDocument>
        <main>Docs</main>
      </RootDocument>,
    );

    const head = html.match(/<head>(.*?)<\/head>/s)?.[1] ?? '';

    expect(head).toMatch(
      /<script id="cookieyes" type="text\/javascript" src="https:\/\/cdn-cookieyes\.com\/client_data\/f377600a6d571245c87039fc3a24a5f1\/script\.js"/,
    );
    const cookieyesScriptIndex = head.indexOf('<script id="cookieyes"');
    expect(head.slice(0, cookieyesScriptIndex)).not.toContain('<script');
  });

  it('does not load the Securiti.ai loader', () => {
    const html = renderToStaticMarkup(
      <RootDocument>
        <main>Docs</main>
      </RootDocument>,
    );

    expect(html).not.toContain('securiti.ai');
  });

  it('loads Google Tag Manager when VITE_GTM_ID is set', () => {
    vi.stubEnv('VITE_GTM_ID', 'GTM-WV38JLKB');

    const html = renderToStaticMarkup(
      <RootDocument>
        <main>Docs</main>
      </RootDocument>,
    );

    expect(html).toContain("'script','dataLayer','GTM-WV38JLKB'");
    expect(html).toContain(
      'https://www.googletagmanager.com/ns.html?id=GTM-WV38JLKB',
    );
    expect(html).toContain('<noscript>');

    vi.unstubAllEnvs();
  });

  it('does not load Google Tag Manager when VITE_GTM_ID is unset', () => {
    vi.stubEnv('VITE_GTM_ID', undefined);

    const html = renderToStaticMarkup(
      <RootDocument>
        <main>Docs</main>
      </RootDocument>,
    );

    expect(html).not.toContain('googletagmanager.com');
    expect(html).not.toContain('<noscript>');

    vi.unstubAllEnvs();
  });
});
