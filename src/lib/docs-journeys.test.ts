import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { normalizeDocsHref } from './docs-link-normalize';
import { source } from './source.server';

const contentRoot = path.join(process.cwd(), 'content', 'docs');

function readDoc(relativePath: string) {
  return readFileSync(path.join(contentRoot, relativePath), 'utf8');
}

function docExists(relativePath: string) {
  return existsSync(path.join(contentRoot, relativePath));
}

function listMarkdownFiles(root: string): string[] {
  const files: string[] = [];

  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const entryPath = path.join(root, entry.name);

    if (entry.isDirectory()) {
      files.push(...listMarkdownFiles(entryPath));
      continue;
    }

    if (entry.isFile() && /\.(?:md|mdx)$/.test(entry.name)) {
      files.push(entryPath);
    }
  }

  return files;
}

function extractDocHrefs(markdown: string) {
  const patterns = [
    /(?<!!)\[[^\]\n]*\]\(([^)\n]+)\)/g,
    /\bhref="([^"]+)"/g,
    /\bto="([^"]+)"/g,
  ];

  return patterns.flatMap((pattern) => {
    pattern.lastIndex = 0;

    return [...markdown.matchAll(pattern)]
      .map((match) => match[1]?.trim() ?? '')
      .filter(Boolean);
  });
}

describe('docs journeys', () => {
  it('keeps internal links under /en/ai pointed at existing docs routes', () => {
    const validRoutes = new Set(source.getPages('en').map((page) => page.url));
    const aiDocsRoot = path.join(contentRoot, 'en', 'ai');
    const markdownFiles = listMarkdownFiles(aiDocsRoot);
    const failures: Array<{
      file: string;
      raw: string;
      normalized: string;
      kind: string;
    }> = [];

    for (const file of markdownFiles) {
      const relativePath = path.relative(contentRoot, file).replace(/\\/g, '/');
      const markdown = readFileSync(file, 'utf8');

      for (const rawHref of extractDocHrefs(markdown)) {
        const normalized = normalizeDocsHref(rawHref, {
          contentPath: relativePath,
        });

        if (normalized.kind !== 'internal-doc' && normalized.kind !== 'root') {
          continue;
        }

        const route = normalized.href.split(/[?#]/, 1)[0];

        if (!validRoutes.has(route)) {
          failures.push({
            file: relativePath,
            raw: rawHref,
            normalized: normalized.href,
            kind: normalized.kind,
          });
        }
      }
    }

    expect(failures).toEqual([]);
  }, 15_000);

  it('connects the Voice Agent home, quickstart, recipes, and reference path', () => {
    const intro = readDoc('en/introduction/index.mdx');
    expect(intro).toContain('/en/ai/get-started/quickstart');

    const quickstart = readDoc('en/ai/get-started/quickstart.mdx');
    expect(quickstart).toMatch(
      /(\.\.\/build\/start-stop-agent(?:\.md)?|\/en\/ai\/build\/start-stop-agent)/,
    );
    expect(quickstart).toMatch(
      /(\.\.\/build\/custom-model-integration\/managed-mode|\/en\/ai\/build\/custom-model-integration\/managed-mode)/,
    );
    expect(quickstart).toMatch(
      /(\.\.\/best-practices\/optimize-latency(?:\.md)?|\/en\/ai\/best-practices\/optimize-latency)/,
    );
    expect(quickstart).toMatch(
      /(\.\.\/best-practices\/audio-setup(?:\.md)?|\/en\/ai\/best-practices\/audio-setup)/,
    );
    expect(quickstart).toContain('/en/api-reference/api-ref/conversational-ai');
  });

  it('connects the Realtime Media home, Voice and Video starts, and RTC API reference path', () => {
    const realtime = readDoc('en/realtime-media/index.md');
    expect(realtime).toContain('/en/realtime-media/rtc');

    const realtimeMeta = JSON.parse(readDoc('en/realtime-media/meta.json'));
    expect(realtimeMeta.pages).toEqual(
      expect.arrayContaining(['voice', 'video']),
    );

    const voice = readDoc('en/realtime-media/voice/index.mdx');
    expect(voice).toContain(
      '<Card title="SDK quickstart" href="quickstart.mdx"',
    );
    expect(voice).toContain('/en/api-reference/api-ref/rtc');

    const video = readDoc('en/realtime-media/video/index.mdx');
    expect(video).toContain(
      '<Card title="SDK quickstart" href="/en/realtime-media/video/get-started-sdk"',
    );
    expect(video).toContain('/en/api-reference/api-ref/rtc');

    expect(docExists('en/realtime-media/voice/quickstart.mdx')).toBe(true);
    expect(docExists('en/realtime-media/video/get-started-sdk.mdx')).toBe(true);

    const rtcApiMeta = JSON.parse(
      readDoc('en/api-reference/api-ref/rtc/meta.json'),
    );
    expect(rtcApiMeta.pages).toEqual(
      expect.arrayContaining(['index', 'authentication', 'api-sunset']),
    );
  });

  it('keeps zh-CN RTC API navigation versioned while English uses canonical Voice and Video reference docs', () => {
    const realtimeRtcMeta = JSON.parse(
      readDoc('zh-CN/realtime-media/rtc/meta.json'),
    );
    expect(realtimeRtcMeta.pages).toEqual(['android', 'macOS']);

    const androidReferenceMeta = JSON.parse(
      readDoc('zh-CN/realtime-media/rtc/android/reference/meta.json'),
    );
    expect(androidReferenceMeta.pages).toEqual(
      expect.arrayContaining(['api-reference', 'release-notes']),
    );

    const englishVoiceReferenceMeta = JSON.parse(
      readDoc('en/realtime-media/voice/reference/meta.json'),
    );
    const englishVideoReferenceMeta = JSON.parse(
      readDoc('en/realtime-media/video/reference/meta.json'),
    );
    expect(englishVoiceReferenceMeta.pages).toContain('supported-platforms');
    expect(englishVideoReferenceMeta.pages).toContain('supported-platforms');

    const androidApiMeta = JSON.parse(
      readDoc('zh-CN/api-reference/rtc/android/meta.json'),
    );
    expect(androidApiMeta.navScope.versions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'current', path: '(current)' }),
        expect.objectContaining({ id: '4.6.0', path: '4.6.0' }),
      ]),
    );
  });

  it('defines build subfolder metadata for english voice agent docs', () => {
    const shapeMeta = JSON.parse(
      readDoc('en/ai/build/shape-the-conversation/meta.json'),
    );
    expect(shapeMeta).toEqual({
      title: 'Shape the conversation',
      pages: [
        'interrupt-agent',
        'short-term-memory',
        'custom-information',
        'filler-words',
      ],
    });

    const customModelMeta = JSON.parse(
      readDoc('en/ai/build/custom-model-integration/meta.json'),
    );
    expect(customModelMeta).toEqual({
      title: 'Custom model integration',
      pages: [
        'custom-llm',
        'custom-tts',
        'audio-output',
        'build-server-client',
        'managed-mode',
      ],
    });

    const runtimeMeta = JSON.parse(
      readDoc('en/ai/build/handle-runtime-events/meta.json'),
    );
    expect(runtimeMeta).toEqual({
      title: 'Handle runtime events',
      pages: [
        'get-runtime-events',
        'monitor-agent-runtime',
        'webhooks',
        'event-notifications',
        'debug-agent-failures',
        'retrieve-session-history',
      ],
    });
  });
});
