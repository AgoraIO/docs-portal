import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { getPublicDocsMarkdownResponse } from './docs-markdown.server';
import {
  isPermanentMovedDocsRedirect,
  resolveMovedDocsRedirect,
} from './docs-moved-redirects';
import { loadDocsPagePayload } from './docs-page.server';
import { isMachineReadableLocale } from './machine-readable-docs';

const oldPaths = [
  'ai/get-started/skills-integrate',
  'ai/device-kit/get-started/skills',
  'realtime-media/on-premise-recording/skills',
  'realtime-media/broadcast-streaming/skills',
  'realtime-media/transcoding/skills',
  'realtime-media/video/skills',
  'realtime-media/rtc/skills',
  'realtime-media/rtmp-gateway/build/skills',
  'realtime-media/cloud-recording/skills',
  'realtime-media/im/get-started/skills',
  'realtime-media/voice/skills',
  'realtime-media/media-pull/build/skills',
  'realtime-media/media-push/build/skills',
  'realtime-media/whiteboard/build/skills',
];
const target = '/en/introduction/agora-skills';

describe('English Skills documentation consolidation', () => {
  it.each(oldPaths)(
    'permanently redirects %s and its Markdown URL',
    async (path) => {
      const [tab, ...segments] = path.split('/');
      for (const suffix of ['', '.md']) {
        const slugSegments = [...segments];
        slugSegments[slugSegments.length - 1] += suffix;
        expect(resolveMovedDocsRedirect('en', tab, slugSegments)).toBe(
          target + suffix,
        );
        expect(isPermanentMovedDocsRedirect('en', tab, slugSegments)).toBe(
          true,
        );
        expect(resolveMovedDocsRedirect('zh-CN', tab, slugSegments)).toBeNull();
        expect(isPermanentMovedDocsRedirect('zh-CN', tab, slugSegments)).toBe(
          false,
        );
        for (const config of ['vercel.base.json', 'vercel.json']) {
          expect(
            JSON.parse(readFileSync(config, 'utf8')).redirects,
          ).toContainEqual({
            source: `/en/${path}${suffix}`,
            destination: target + suffix,
            statusCode: 301,
          });
        }
      }

      await expect(loadDocsPagePayload('en', tab, segments)).resolves.toEqual({
        redirectUrl: target,
        statusCode: 301,
      });

      const request = getPublicDocsMarkdownResponse({
        locale: 'en',
        tab,
        slugSegments: `${segments.join('/')}.md`.split('/'),
      });
      if (!isMachineReadableLocale('en')) {
        await expect(request).rejects.toMatchObject({ isNotFound: true });
        return;
      }
      const response = await request;
      expect(response?.status).toBe(301);
      expect(response?.headers.get('Location')).toBe(`${target}.md`);
    },
  );

  it('keeps only the shared Skills page and does not redirect it', () => {
    const pages = readdirSync('content/docs/en', { recursive: true })
      .map(String)
      .filter((path) =>
        /\/(?:skills|skills-integrate|agora-skills)\.mdx?$/.test(path),
      );
    expect(pages).toEqual(['introduction/agora-skills.mdx']);
    expect(
      resolveMovedDocsRedirect('en', 'introduction', ['agora-skills']),
    ).toBeNull();
    expect(
      isPermanentMovedDocsRedirect('en', 'introduction', ['agora-skills']),
    ).toBe(false);
    expect(
      resolveMovedDocsRedirect('en', 'ai', ['studio', 'build', 'integrations']),
    ).toBeNull();
  });

  it('sends historical Skills links directly to the existing shared page', () => {
    const { rules } = JSON.parse(
      readFileSync('src/lib/legacy-sitemap/redirects.json', 'utf8'),
    );
    const skillsRules = rules.filter(
      (rule: { legacyPath: string }) =>
        rule.legacyPath.startsWith('/en/') &&
        /\/(skills|skills-integrate)$/.test(rule.legacyPath),
    );
    expect(skillsRules.length).toBeGreaterThan(0);
    for (const rule of skillsRules) expect(rule.target).toBe(target);
    expect(existsSync(`content/docs${target}.mdx`)).toBe(true);
  });
});
