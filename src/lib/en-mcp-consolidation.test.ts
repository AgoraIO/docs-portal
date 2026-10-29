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
  'ai/get-started/mcp-integrate',
  'ai/device-kit/get-started/mcp',
  'realtime-media/on-premise-recording/mcp',
  'realtime-media/broadcast-streaming/mcp',
  'realtime-media/transcoding/mcp',
  'realtime-media/video/mcp',
  'realtime-media/rtc/mcp',
  'realtime-media/rtmp-gateway/build/mcp',
  'realtime-media/cloud-recording/mcp',
  'realtime-media/im/get-started/mcp',
  'realtime-media/voice/mcp',
  'realtime-media/media-pull/build/mcp',
  'realtime-media/media-push/build/mcp',
  'realtime-media/whiteboard/build/mcp',
];
const target = '/en/introduction/agora-mcp';

describe('English MCP documentation consolidation', () => {
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

  it('keeps only the shared MCP page and does not redirect it', () => {
    const pages = readdirSync('content/docs/en', { recursive: true })
      .map(String)
      .filter((path) => /\/(?:mcp|mcp-integrate|agora-mcp)\.mdx?$/.test(path));
    expect(pages).toEqual(['introduction/agora-mcp.mdx']);
    expect(
      resolveMovedDocsRedirect('en', 'introduction', ['agora-mcp']),
    ).toBeNull();
    expect(
      isPermanentMovedDocsRedirect('en', 'introduction', ['agora-mcp']),
    ).toBe(false);
    expect(
      resolveMovedDocsRedirect('en', 'ai', ['studio', 'build', 'integrations']),
    ).toBeNull();
  });

  it('sends historical MCP links directly to the existing shared page', () => {
    const { rules } = JSON.parse(
      readFileSync('src/lib/legacy-sitemap/redirects.json', 'utf8'),
    );
    const mcpRules = rules.filter(
      (rule: { legacyPath: string }) =>
        rule.legacyPath.startsWith('/en/') &&
        /\/(mcp|mcp-integrate)$/.test(rule.legacyPath),
    );
    expect(mcpRules.length).toBeGreaterThan(0);
    for (const rule of mcpRules) expect(rule.target).toBe(target);
    expect(existsSync(`content/docs${target}.mdx`)).toBe(true);
  });
});
