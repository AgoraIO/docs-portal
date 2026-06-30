import { describe, expect, it } from 'vitest';
import {
  createStaticSeoManifest,
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
        imageUrl: 'https://assets-docs.agora.io/og/docs.png',
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
      '<meta property="og:image" content="https://assets-docs.agora.io/og/docs.png">',
    );
    expect(result).not.toContain('Global description');
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
