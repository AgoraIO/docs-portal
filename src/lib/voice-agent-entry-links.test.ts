import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const docsRoot = path.join(process.cwd(), 'content', 'docs');

function readDoc(...segments: string[]) {
  return readFileSync(path.join(docsRoot, ...segments), 'utf8');
}

function extractHrefs(markdown: string) {
  const htmlHrefs = [...markdown.matchAll(/\bhref="([^"]+)"/g)].map(
    ([, href]) => href,
  );
  const markdownHrefs = [
    ...markdown.matchAll(/(?<!!)\[[^\]\n]*\]\(([^)\n]+)\)/g),
  ]
    .map(([, href]) => href.trim())
    .filter(Boolean);

  return [...htmlHrefs, ...markdownHrefs];
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

describe('Voice Agent entry links', () => {
  it('keeps visible app-path CTAs pointed at existing pages', () => {
    const entryMarkdown = [
      readDoc('en', 'ai', 'index.mdx'),
      readDoc('en', 'introduction', 'index.mdx'),
      readDoc('en', 'introduction', 'conversational-ai.mdx'),
    ].join('\n');
    const voiceAgentAppLinks = extractHrefs(entryMarkdown).filter(
      (href) =>
        href === '/en/ai/get-started/quickstart' ||
        href === '/en/ai/reference/openai-realtime-integration' ||
        href === '/en/ai/build/custom-model-integration/build-server-client' ||
        href.startsWith('/en/ai/apps/'),
    );

    expect(voiceAgentAppLinks).toEqual(
      expect.arrayContaining([
        '/en/ai/get-started/quickstart',
        '/en/ai/build/custom-model-integration/build-server-client',
        '/en/ai/reference/openai-realtime-integration',
      ]),
    );
    expect(
      voiceAgentAppLinks.some((href) => href.startsWith('/en/ai/apps/')),
    ).toBe(false);
    expect(voiceAgentAppLinks.filter((href) => !routeExists(href))).toEqual([]);
  });
});
