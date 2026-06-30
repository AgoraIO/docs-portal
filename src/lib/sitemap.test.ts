import { describe, expect, it } from 'vitest';
import { createSitemapXml, getSitemapUrls } from './sitemap';

describe('sitemap', () => {
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
