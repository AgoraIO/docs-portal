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
  it('renders the Securiti.ai test loader first in head', () => {
    const html = renderToStaticMarkup(
      <RootDocument>
        <main>Docs</main>
      </RootDocument>,
    );

    const head = html.match(/<head>(.*?)<\/head>/s)?.[1] ?? '';

    expect(head).toMatch(
      /<script src="https:\/\/cdn-prod\.securiti\.ai\/consent\/cookie-consent-sdk-loader\.js"/,
    );
    const securitiScriptIndex = head.indexOf(
      '<script src="https://cdn-prod.securiti.ai',
    );
    expect(head.slice(0, securitiScriptIndex)).not.toContain('<script');
    expect(head).toContain(
      'data-tenant-uuid="b373a629-85bf-440d-824a-a86fc32ae3e9"',
    );
    expect(head).toContain(
      'data-domain-uuid="7ba04bfc-c10b-4f3a-80d5-bf9ed910b46f"',
    );
    expect(head).toContain('data-backend-url="https://app.securiti.ai"');
    expect(head).toContain('data-securiti-staging-mode="true"');
  });

  it('does not load Google Tag Manager directly', () => {
    const html = renderToStaticMarkup(
      <RootDocument>
        <main>Docs</main>
      </RootDocument>,
    );

    expect(html).not.toContain('googletagmanager.com');
    expect(html).not.toContain('<noscript>');
  });
});
