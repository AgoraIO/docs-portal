import { describe, expect, it } from 'vitest';
import {
  createStaticSeoHead,
  createStaticSeoManifest,
  getDocsOgImageUrl,
  injectStaticSeoHead,
} from './static-seo';

describe('static SEO metadata', () => {
  it('creates page-specific crawler metadata from docs pages', () => {
    expect(
      createStaticSeoManifest({
        baseUrl: 'https://docs.example.com',
        pages: [
          {
            description: ' Build with Agora. ',
            title: 'Introduction',
            url: '/en/introduction',
          },
          {
            description: 'Readable only.',
            title: 'Markdown',
            url: '/en/introduction.md',
          },
        ],
      }),
    ).toEqual([
      {
        canonicalUrl: 'https://docs.example.com/en/introduction',
        description: 'Build with Agora.',
        imageUrl:
          'https://assets-docs.agora.io/og/agora-docs-og-introduction.png',
        title: 'Introduction | Agora Docs',
        url: '/en/introduction',
      },
    ]);
  });

  it('injects route metadata into the static SPA shell', () => {
    const html = [
      '<html>',
      '<head>',
      '<title>Agora Docs</title>',
      '<meta name="description" content="Global description">',
      '<meta property="og:title" content="Global">',
      '</head>',
      '<body></body>',
      '</html>',
    ].join('');

    const result = injectStaticSeoHead(html, {
      description: 'Use <video> safely & quickly.',
      title: 'Video "Quickstart"',
      url: '/en/realtime-media/video',
    });

    expect(result).toContain(
      '<title>Video &quot;Quickstart&quot; | Agora Docs</title>',
    );
    expect(result).toContain(
      '<meta name="description" content="Use &lt;video&gt; safely &amp; quickly.">',
    );
    expect(result).toContain(
      '<link rel="canonical" href="https://docs.agora.io/en/realtime-media/video">',
    );
    expect(result).toContain(
      '<meta property="og:url" content="https://docs.agora.io/en/realtime-media/video">',
    );
    expect(result).toContain(
      '<meta name="twitter:card" content="summary_large_image">',
    );
    expect(result).toContain(
      '<meta property="og:image" content="https://assets-docs.agora.io/og/agora-docs-og-realtime-media.png">',
    );
    expect(result).not.toContain('Global description');
  });

  it('selects OG images by docs category with a fallback', () => {
    expect(getDocsOgImageUrl('/en/ai/get-started/quickstart')).toBe(
      'https://assets-docs.agora.io/og/agora-docs-og-voice-agent.png',
    );
    expect(getDocsOgImageUrl('/zh-CN/realtime-media/rtc/android')).toBe(
      'https://assets-docs.agora.io/og/agora-docs-og-realtime-media.png',
    );
    expect(
      getDocsOgImageUrl('/en/api-reference/api-ref/server-sdk/python'),
    ).toBe('https://assets-docs.agora.io/og/agora-docs-og-reference.png');
    expect(getDocsOgImageUrl('/en/unknown-section/page')).toBe(
      'https://assets-docs.agora.io/og/agora-docs-og-overview.png',
    );
  });

  it('uses the same category image for Open Graph and Twitter cards', () => {
    const head = createStaticSeoHead({
      title: 'Video calling',
      url: '/en/realtime-media/video',
    });
    const ogImage = head.meta.find(
      (entry) => 'property' in entry && entry.property === 'og:image',
    );
    const twitterImage = head.meta.find(
      (entry) => 'name' in entry && entry.name === 'twitter:image',
    );

    expect(ogImage).toEqual({
      property: 'og:image',
      content:
        'https://assets-docs.agora.io/og/agora-docs-og-realtime-media.png',
    });
    expect(twitterImage).toEqual({
      name: 'twitter:image',
      content:
        'https://assets-docs.agora.io/og/agora-docs-og-realtime-media.png',
    });
  });

  it('injects public docs URLs when no site URL env is configured', () => {
    const previousSiteUrl = process.env.SITE_URL;
    const previousViteSiteUrl = process.env.VITE_SITE_URL;
    const previousPublicSiteUrl = process.env.PUBLIC_SITE_URL;

    delete process.env.SITE_URL;
    delete process.env.VITE_SITE_URL;
    delete process.env.PUBLIC_SITE_URL;

    try {
      const result = injectStaticSeoHead(
        '<html><head></head><body></body></html>',
        {
          title: 'Introduction',
          url: '/en/introduction',
        },
      );

      expect(result).toContain(
        '<link rel="canonical" href="https://docs.agora.io/en/introduction">',
      );
      expect(result).toContain(
        '<meta property="og:url" content="https://docs.agora.io/en/introduction">',
      );
      expect(result).not.toContain('agora-docs-portal.vercel.app');
      expect(result).not.toContain('docs-legacy.agora.io');
    } finally {
      restoreEnvValue('SITE_URL', previousSiteUrl);
      restoreEnvValue('VITE_SITE_URL', previousViteSiteUrl);
      restoreEnvValue('PUBLIC_SITE_URL', previousPublicSiteUrl);
    }
  });

  it('injects manifest metadata without normalizing titles twice', () => {
    const result = injectStaticSeoHead(
      '<html><head></head><body></body></html>',
      {
        canonicalUrl: 'https://docs.example.com/en/introduction',
        description: 'Intro docs.',
        imageUrl: 'https://docs.example.com/og/docs.png',
        title: 'Introduction | Agora Docs',
        url: '/en/introduction',
      },
    );

    expect(result).toContain('<title>Introduction | Agora Docs</title>');
    expect(result).not.toContain('Introduction | Agora Docs | Agora Docs');
  });
});

function restoreEnvValue(key: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[key];
    return;
  }

  process.env[key] = value;
}
