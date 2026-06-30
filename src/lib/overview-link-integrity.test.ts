import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

type OverviewLink = {
  href: string;
  sourceFile: string;
};

const docsRoot = path.join(process.cwd(), 'content', 'docs');

const overviewFiles = [
  'en/introduction/index.mdx',
  'en/ai/index.mdx',
  'en/realtime-media/overview.mdx',
  'en/solutions/index.mdx',
  'en/api-reference/index.mdx',
] as const;

const expectedExternalLinks = [
  {
    href: 'https://agoraio.zendesk.com/hc/en-us',
    sourceFile: 'en/introduction/index.mdx',
  },
  {
    href: 'https://stackoverflow.com/search?q=agora.io',
    sourceFile: 'en/introduction/index.mdx',
  },
  {
    href: 'https://discord.gg/agoradocs',
    sourceFile: 'en/introduction/index.mdx',
  },
  {
    href: 'https://status.agora.io/',
    sourceFile: 'en/introduction/index.mdx',
  },
];

function readDoc(sourceFile: string) {
  return readFileSync(path.join(docsRoot, sourceFile), 'utf8');
}

function extractLinks(sourceFile: string): OverviewLink[] {
  const markdown = readDoc(sourceFile);
  const htmlHrefs = [...markdown.matchAll(/\bhref="([^"]+)"/g)].map(
    ([, href]) => href,
  );
  const objectHrefs = [...markdown.matchAll(/\bhref:\s*"([^"]+)"/g)].map(
    ([, href]) => href,
  );
  const markdownHrefs = [
    ...markdown.matchAll(/(?<!!)\[[^\]\n]*\]\(([^)\n]+)\)/g),
  ].map(([, href]) => href.trim());

  return [...htmlHrefs, ...objectHrefs, ...markdownHrefs]
    .filter(Boolean)
    .map((href) => ({ href, sourceFile }));
}

function isExternalHref(href: string) {
  return /^[a-z][a-z0-9+.-]*:/i.test(href);
}

function resolveInternalHref({ href, sourceFile }: OverviewLink) {
  if (href.startsWith('/')) {
    return href;
  }

  const sourceDir = path.dirname(sourceFile);
  const normalized = path.normalize(path.join(sourceDir, href));

  return `/${normalized.replace(/\.(mdx?|html?)$/i, '')}`;
}

function getRouteCandidates(href: string) {
  const cleanHref = href.split(/[?#]/, 1)[0];
  const segments = cleanHref.split('/').filter(Boolean);
  const contentPath = path.join(docsRoot, ...segments);

  return [
    `${contentPath}.mdx`,
    `${contentPath}.md`,
    path.join(contentPath, 'index.mdx'),
    path.join(contentPath, 'index.md'),
  ];
}

function findRouteFile(href: string) {
  return getRouteCandidates(href).find((candidate) => existsSync(candidate));
}

function slugifyHeading(heading: string) {
  return heading
    .trim()
    .replace(/<[^>]+>/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .toLowerCase()
    .replace(/&/g, '')
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-');
}

function getHeadingAnchors(markdown: string) {
  const explicitAnchors = [...markdown.matchAll(/\bid="([^"]+)"/g)].map(
    ([, id]) => id,
  );
  const headingAnchors = [...markdown.matchAll(/^#{1,6}\s+(.+)$/gm)].map(
    ([, heading]) => slugifyHeading(heading),
  );

  return new Set([...explicitAnchors, ...headingAnchors]);
}

describe('overview entry links', () => {
  const links = overviewFiles.flatMap((sourceFile) => extractLinks(sourceFile));

  it('keeps all internal overview links pointed at existing content and anchors', () => {
    const brokenLinks = links
      .filter((link) => !isExternalHref(link.href))
      .map((link) => {
        const resolvedHref = resolveInternalHref(link);
        const routeFile = findRouteFile(resolvedHref);
        const hash = resolvedHref.split('#', 2)[1];
        const hasHash =
          !hash ||
          (routeFile
            ? getHeadingAnchors(readFileSync(routeFile, 'utf8')).has(hash)
            : false);

        return {
          ...link,
          resolvedHref,
          routeFile,
          hasHash,
        };
      })
      .filter((link) => !link.routeFile || !link.hasHash);

    expect(brokenLinks).toEqual([]);
  });

  it('keeps the external overview link inventory explicit', () => {
    expect(links.filter((link) => isExternalHref(link.href))).toEqual(
      expectedExternalLinks,
    );
  });
});
