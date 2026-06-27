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
      (card) => card.href.startsWith('/en/api-reference/api-ref/'),
    );
    const analyticsCard = apiReferenceCards.find(
      (card) => card.title === 'Analytics',
    );
    const analyticsCatalogHref = getCatalogHrefForProduct(
      catalogMarkdown,
      'Analytics',
    );

    expect(analyticsCatalogHref).toBe(
      '/en/api-reference/api-ref/agora-analytics/analytics-rest-api',
    );
    expect(analyticsCard?.href).toBe(analyticsCatalogHref);
    expect(apiReferenceCards).not.toHaveLength(0);
    expect(apiReferenceCards.filter((card) => !routeExists(card.href))).toEqual(
      [],
    );
  });
});
