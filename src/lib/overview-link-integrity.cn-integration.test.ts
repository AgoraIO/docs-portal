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
    href: 'https://discord.gg/QfgBCvuX4d',
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

function getFrontmatterTitle(sourceFile: string) {
  return readDoc(sourceFile).match(/^title:\s*["']?(.+?)["']?\s*$/m)?.[1] ?? '';
}

function getMarkdownHeadings(sourceFile: string) {
  return [...readDoc(sourceFile).matchAll(/^#{1,6}\s+(.+)$/gm)].map(
    ([, heading]) => heading.trim(),
  );
}

function getProductNameFromOverviewTitle(title: string) {
  return title.replace(/\s+overview$/i, '').trim();
}

function getSidebarIndexTitle(metaFile: string) {
  return JSON.parse(readDoc(metaFile)).sidebarIndexTitle ?? '';
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

  it.each([
    ['zh-CN', 'https://ticket.shengwang.cn/'],
    ['en', 'https://agoraio.zendesk.com/hc/en-us'],
  ])(
    'uses the regional ticket portal for the %s introduction',
    (locale, href) => {
      const ticketCard = readDoc(`${locale}/introduction/index.mdx`).match(
        /\{[^{}]*\bicon:\s*"ticket"[^{}]*\}/,
      )?.[0];

      expect(ticketCard).toBeDefined();
      expect(ticketCard).toContain(`href: "${href}"`);
    },
  );

  it('uses product-specific titles for product overview pages', () => {
    const expectedTitles = {
      'en/realtime-media/overview.mdx': 'RTC overview',
      'en/realtime-media/broadcast-streaming/index.mdx':
        'Broadcast Streaming overview',
      'en/realtime-media/broadcast-streaming/product-overview.mdx':
        'Broadcast Streaming overview',
      'en/realtime-media/cloud-recording/index.mdx': 'Cloud Recording overview',
      'en/realtime-media/im/index.mdx': 'Chat overview',
      'en/realtime-media/marketplace/index.mdx':
        'Extensions Marketplace overview',
      'en/realtime-media/media-pull/index.mdx': 'Media Pull overview',
      'en/realtime-media/media-push/index.mdx': 'Media Push overview',
      'en/realtime-media/on-premise-recording/index.mdx':
        'On-Premise Recording overview',
      'en/realtime-media/rtc-server-sdk/index.mdx': 'Server Gateway overview',
      'en/realtime-media/rtm/index.mdx': 'Signaling overview',
      'en/realtime-media/rtmp-gateway/index.mdx': 'Media Gateway overview',
      'en/realtime-media/speech-to-text/index.mdx': 'Speech-to-Text overview',
      'en/realtime-media/transcoding/index.mdx': 'Cloud Transcoding overview',
      'en/realtime-media/video/index.mdx': 'Video Calling overview',
      'en/realtime-media/voice/index.mdx': 'Voice Calling overview',
      'en/realtime-media/whiteboard/index.mdx':
        'Interactive Whiteboard overview',
      'en/realtime-media/agora-analytics/product-overview.mdx':
        'Agora Analytics overview',
      'en/realtime-media/flexible-classroom/product-overview.mdx':
        'Flexible Classroom overview',
      'en/realtime-media/interactive-live-streaming/product-overview.mdx':
        'Interactive Live Streaming overview',
      'en/realtime-media/iot/product-overview.mdx': 'IoT SDK overview',
    } as const;

    const actualTitles = Object.fromEntries(
      Object.keys(expectedTitles).map((sourceFile) => [
        sourceFile,
        getFrontmatterTitle(sourceFile),
      ]),
    );

    expect(actualTitles).toEqual(expectedTitles);
  });

});
