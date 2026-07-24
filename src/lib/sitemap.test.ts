import { describe, expect, it } from 'vitest';
import { createSitemapXml, getSitemapBaseUrl, getSitemapUrls } from './sitemap';

describe('sitemap', () => {
  it('falls back to the public docs host for canonical URLs', () => {
    const previousSiteUrl = process.env.SITE_URL;
    const previousViteSiteUrl = process.env.VITE_SITE_URL;
    const previousPublicSiteUrl = process.env.PUBLIC_SITE_URL;

    delete process.env.SITE_URL;
    delete process.env.VITE_SITE_URL;
    delete process.env.PUBLIC_SITE_URL;

    try {
      expect(getSitemapBaseUrl()).toBe('https://docs.agora.io');
    } finally {
      restoreEnvValue('SITE_URL', previousSiteUrl);
      restoreEnvValue('VITE_SITE_URL', previousViteSiteUrl);
      restoreEnvValue('PUBLIC_SITE_URL', previousPublicSiteUrl);
    }
  });

  it('uses the Vite-exposed site URL for cn deployments during hydration', () => {
    const previousSiteUrl = process.env.SITE_URL;
    const previousViteSiteUrl = process.env.VITE_SITE_URL;
    const previousPublicSiteUrl = process.env.PUBLIC_SITE_URL;

    delete process.env.SITE_URL;
    process.env.VITE_SITE_URL = 'https://vite-alias.example.com';
    process.env.PUBLIC_SITE_URL = 'https://public-alias.example.com';

    try {
      expect(getSitemapBaseUrl('cn')).toBe('https://vite-alias.example.com');
    } finally {
      restoreEnvValue('SITE_URL', previousSiteUrl);
      restoreEnvValue('VITE_SITE_URL', previousViteSiteUrl);
      restoreEnvValue('PUBLIC_SITE_URL', previousPublicSiteUrl);
    }
  });

  it('normalizes configured English docs hosts to the canonical root', () => {
    const previousSiteUrl = process.env.SITE_URL;

    process.env.SITE_URL = 'https://docs.agora.io/en/';

    try {
      expect(getSitemapBaseUrl()).toBe('https://docs.agora.io');
    } finally {
      restoreEnvValue('SITE_URL', previousSiteUrl);
    }
  });

  it('builds English-only canonical page URLs', () => {
    expect(
      getSitemapUrls({
        baseUrl: 'https://docs.example.com',
        openApiPages: [
          { url: '/en/api-reference/api-ref/conversational-ai/join' },
          { url: '/zh-CN/api-reference/api-ref/conversational-ai/join' },
        ],
        pages: [
          { url: '/en/introduction/about-agora' },
          { url: '/zh-CN/introduction/about-agora' },
          { url: '/en/introduction/about-agora.md' },
          { url: '/llms.mdx/docs/en/introduction/about-agora.md' },
        ],
      }),
    ).toEqual([
      'https://docs.example.com/en/api-reference/api-ref/conversational-ai/join',
      'https://docs.example.com/en/introduction/about-agora',
    ]);
  });

  it('escapes XML loc values', () => {
    expect(
      createSitemapXml([
        'https://docs.example.com/en/search?q=a&category="docs"',
      ]),
    ).toContain(
      '<loc>https://docs.example.com/en/search?q=a&amp;category=&quot;docs&quot;</loc>',
    );
  });
});

function restoreEnvValue(key: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[key];
    return;
  }

  process.env[key] = value;
}
