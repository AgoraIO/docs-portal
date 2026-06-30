import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

type SolutionCard = {
  href: string;
  title: string;
};

const docsRoot = path.join(process.cwd(), 'content', 'docs');

function readDoc(...segments: string[]) {
  return readFileSync(path.join(docsRoot, ...segments), 'utf8');
}

function getFrontmatterTitle(markdown: string) {
  return markdown.match(/^title:\s*["']?(.+?)["']?\s*$/m)?.[1] ?? '';
}

function extractSolutionCards(markdown: string): SolutionCard[] {
  return [...markdown.matchAll(/<SolutionCard\b([\s\S]*?)\/>/g)].map(
    ([, attributes]) => ({
      href: getAttribute(attributes, 'href'),
      title: getAttribute(attributes, 'title'),
    }),
  );
}

function getAttribute(attributes: string, name: string) {
  return attributes.match(new RegExp(`\\b${name}="([^"]+)"`))?.[1] ?? '';
}

function getCatalogHrefForProduct(markdown: string, product: string) {
  const productIndex = markdown.indexOf(`product: "${product}"`);

  if (productIndex === -1) {
    return '';
  }

  return markdown.slice(productIndex).match(/\bhref:\s*"([^"]+)"/)?.[1] ?? '';
}

function routeExists(href: string) {
  const cleanHref = href.split(/[?#]/, 1)[0];
  const segments = cleanHref.split('/').filter(Boolean);

  if (segments.length < 2) {
    return false;
  }

  const contentPath = path.join(docsRoot, ...segments);
  const candidates = [
    `${contentPath}.mdx`,
    `${contentPath}.md`,
    path.join(contentPath, 'index.mdx'),
    path.join(contentPath, 'index.md'),
  ];

  return candidates.some((candidate) => existsSync(candidate));
}

describe('API reference overview links', () => {
  it('keeps in-portal API reference cards pointed at existing pages', () => {
    const overviewMarkdown = readDoc('en', 'api-reference', 'index.mdx');
    const catalogMarkdown = readDoc(
      'en',
      'api-reference',
      'api-ref',
      'index.mdx',
    );
    const apiReferenceCards = extractSolutionCards(overviewMarkdown).filter(
      (card) =>
        card.href === '/en/api-reference/api-ref' ||
        card.href.startsWith('/en/api-reference/api-ref/'),
    );
    const apiReferenceCard = apiReferenceCards.find(
      (card) => card.title === 'API Reference',
    );
    const analyticsCatalogHref = getCatalogHrefForProduct(
      catalogMarkdown,
      'Analytics',
    );

    expect(analyticsCatalogHref).toBe(
      '/en/api-reference/api-ref/agora-analytics/analytics-rest-api',
    );
    expect(apiReferenceCard?.href).toBe('/en/api-reference/api-ref');
    expect(apiReferenceCards).not.toHaveLength(0);
    expect(apiReferenceCards.filter((card) => !routeExists(card.href))).toEqual(
      [],
    );
  });

  it('uses product-specific overview titles for API reference product entry pages', () => {
    const expectedTitles = {
      'broadcast-streaming': 'Broadcast Streaming Overview',
      'cloud-recording': 'Cloud Recording Overview',
      'cloud-transcoding': 'Cloud Transcoding Overview',
      'conversational-ai': 'Conversational AI Overview',
      im: 'Chat Overview',
      'media-pull': 'Media Pull Overview',
      'media-push': 'Media Push Overview',
      'on-premise-recording': 'On-Premise Recording Overview',
      rtc: 'Voice & Video Calling Overview',
      'rtmp-gateway': 'Media Gateway Overview',
      signaling: 'Signaling Overview',
      'speech-to-text': 'Speech-to-Text Overview',
      video: 'Video Calling Overview',
      voice: 'Voice Calling Overview',
      whiteboard: 'Interactive Whiteboard Overview',
    } as const;

    const actualTitles = Object.fromEntries(
      Object.entries(expectedTitles).map(([product, _title]) => {
        const extension = ['im', 'media-pull', 'media-push', 'whiteboard'].includes(
          product,
        )
          ? 'md'
          : 'mdx';

        return [
          product,
          getFrontmatterTitle(
            readDoc('en', 'api-reference', 'api-ref', product, `index.${extension}`),
          ),
        ];
      }),
    );

    expect(actualTitles).toEqual(expectedTitles);
  });
});
