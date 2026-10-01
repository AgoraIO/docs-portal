import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { normalizeDocsHref } from './docs-link-normalize';

const docsRoot = resolve(process.cwd(), 'content/docs');
const contentPath =
  'en/realtime-media/im/build/build-core-messaging/reaction.mdx';
const markdown = readFileSync(resolve(docsRoot, contentPath), 'utf8');
const limitationsRoute = '/en/api-reference/api-ref/im/limitations';

describe('Chat reaction prerequisite links', () => {
  it.each([
    'android',
    'ios',
    'flutter',
    'react-native',
    'windows',
    'unity',
    'web',
  ])('links %s prerequisites to the Chat Limitations page', (platform) => {
    const platformBody = markdown.match(
      new RegExp(
        `<PlatformStructured platform="${platform}">([\\s\\S]*?)</PlatformStructured>`,
      ),
    )?.[1];
    expect(platformBody).toBeDefined();

    const prerequisites = platformBody?.match(
      /## Prerequisites\n([\s\S]*?)(?=\n## )/,
    )?.[1];
    const links = [
      ...(prerequisites?.matchAll(/\[Limitations\]\(([^)]+)\)/g) ?? []),
    ];
    expect(links).toHaveLength(1);

    const normalized = normalizeDocsHref(links[0][1], { contentPath });
    expect(normalized.href).toBe(limitationsRoute);
    expect(
      existsSync(resolve(docsRoot, `${normalized.href.slice(1)}.md`)),
    ).toBe(true);
  });
});
