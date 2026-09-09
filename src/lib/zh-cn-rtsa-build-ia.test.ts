import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { loadDocsPagePayload } from './docs-page.server';

type DocsMeta = {
  collapsible?: boolean;
  defaultOpen?: boolean;
  pages?: string[];
  title?: string;
};

type LegacyRedirectRule = {
  legacyPath: string;
  target: string;
};

const contentRoot = resolve(
  process.cwd(),
  'content/docs/zh-CN/realtime-media/rtsa',
);
const buildRoot = resolve(contentRoot, 'build');
const legacyRedirectsPath = resolve(
  process.cwd(),
  'src/lib/legacy-sitemap/redirects.json',
);

const approvedNewMdxPaths = [
  'project-preparation/enable-service',
  'project-preparation/license',
  'implement-transmission',
  'string-uid',
  'media-transmission/audio-codec',
  'media-transmission/stream-state',
  'media-transmission/bitrate-adaption',
  'media-transmission/key-frame',
  'media-transmission/multi-channel',
  'media-transmission/encryption',
  'data-communication/data-stream',
  'data-communication/send-message-through-rdt-channel',
  'interoperate-rtc',
  'production-environment/cloud-proxy',
  'production-environment/region-limit',
] as const;

const oldMdxAndMetaPaths = [
  'setup-and-access/enable-service.mdx',
  'setup-and-access/license.mdx',
  'setup-and-access/cloud-proxy.mdx',
  'setup-and-access/region-limit.mdx',
  'setup-and-access/meta.json',
  'implement-core-features/implement-transmission.mdx',
  'implement-core-features/string-uid.mdx',
  'implement-core-features/audio-codec.mdx',
  'implement-core-features/stream-state.mdx',
  'implement-core-features/bitrate-adaption.mdx',
  'implement-core-features/key-frame.mdx',
  'implement-core-features/multi-channel.mdx',
  'implement-core-features/encryption.mdx',
  'implement-core-features/data-stream.mdx',
  'implement-core-features/send-message-through-rdt-channel.mdx',
  'implement-core-features/meta.json',
  'optimize-and-operate/interoperate-rtc.mdx',
  'optimize-and-operate/meta.json',
] as const;

const approvedRootPages = [
  'project-preparation',
  'implement-transmission',
  'string-uid',
  'media-transmission',
  'data-communication',
  'interoperate-rtc',
  'production-environment',
] as const;

const approvedCategoryMetadata = {
  'project-preparation': {
    title: '项目准备',
    collapsible: false,
    defaultOpen: true,
    pages: ['enable-service', 'license'],
  },
  'media-transmission': {
    title: '媒体传输',
    collapsible: true,
    defaultOpen: false,
    pages: [
      'audio-codec',
      'stream-state',
      'bitrate-adaption',
      'key-frame',
      'multi-channel',
      'encryption',
    ],
  },
  'data-communication': {
    title: '数据通信',
    collapsible: true,
    defaultOpen: false,
    pages: ['data-stream', 'send-message-through-rdt-channel'],
  },
  'production-environment': {
    title: '生产环境配置',
    collapsible: true,
    defaultOpen: false,
    pages: ['cloud-proxy', 'region-limit'],
  },
} as const;

const directPages = [
  'implement-transmission',
  'string-uid',
  'interoperate-rtc',
] as const;

const oldRtsaBuildPrefixes = [
  '/zh-CN/realtime-media/rtsa/build/setup-and-access/',
  '/zh-CN/realtime-media/rtsa/build/implement-core-features/',
  '/zh-CN/realtime-media/rtsa/build/optimize-and-operate/',
] as const;

const oldRtsaBuildUrls = [
  '/zh-CN/realtime-media/rtsa/build/setup-and-access/enable-service',
  '/zh-CN/realtime-media/rtsa/build/setup-and-access/license',
  '/zh-CN/realtime-media/rtsa/build/implement-core-features/implement-transmission',
  '/zh-CN/realtime-media/rtsa/build/implement-core-features/string-uid',
  '/zh-CN/realtime-media/rtsa/build/implement-core-features/audio-codec',
  '/zh-CN/realtime-media/rtsa/build/implement-core-features/stream-state',
  '/zh-CN/realtime-media/rtsa/build/implement-core-features/bitrate-adaption',
  '/zh-CN/realtime-media/rtsa/build/implement-core-features/key-frame',
  '/zh-CN/realtime-media/rtsa/build/implement-core-features/multi-channel',
  '/zh-CN/realtime-media/rtsa/build/implement-core-features/encryption',
  '/zh-CN/realtime-media/rtsa/build/implement-core-features/data-stream',
  '/zh-CN/realtime-media/rtsa/build/implement-core-features/send-message-through-rdt-channel',
  '/zh-CN/realtime-media/rtsa/build/optimize-and-operate/interoperate-rtc',
  '/zh-CN/realtime-media/rtsa/build/setup-and-access/cloud-proxy',
  '/zh-CN/realtime-media/rtsa/build/setup-and-access/region-limit',
] as const;

function readMeta(path: string): DocsMeta {
  return JSON.parse(readFileSync(path, 'utf8')) as DocsMeta;
}

function collectMdxFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = resolve(directory, entry.name);

    if (entry.isDirectory()) {
      return collectMdxFiles(entryPath);
    }

    return entry.isFile() && entry.name.endsWith('.mdx') ? [entryPath] : [];
  });
}

function hasOldBuildPrefix(value: string) {
  return oldRtsaBuildPrefixes.some((prefix) => value.includes(prefix));
}

describe('zh-CN RTSA Build IA migration invariants', () => {
  it('routes the RTSA Build root to the canonical implementation guide', async () => {
    await expect(
      loadDocsPagePayload('zh-CN', 'realtime-media', ['rtsa', 'build']),
    ).resolves.toEqual({
      redirectUrl: '/zh-CN/realtime-media/rtsa/build/implement-transmission',
    });
  });

  it.each(approvedNewMdxPaths)('keeps the new MDX path %s', (pagePath) => {
    expect(existsSync(resolve(buildRoot, `${pagePath}.mdx`))).toBe(true);
  });

  it.each(oldMdxAndMetaPaths)('removes the old path %s', (pagePath) => {
    expect(existsSync(resolve(buildRoot, pagePath))).toBe(false);
  });

  it('uses the exact approved root navigation order', () => {
    const meta = readMeta(resolve(buildRoot, 'meta.json'));

    expect(meta.title).toBe('开发与集成');
    expect(meta.pages).toEqual(approvedRootPages);
  });

  it.each(Object.entries(approvedCategoryMetadata))(
    'uses the approved metadata for %s',
    (category, metadata) => {
      const metaPath = resolve(buildRoot, category, 'meta.json');

      expect(existsSync(metaPath)).toBe(true);

      if (existsSync(metaPath)) {
        expect(readMeta(metaPath)).toEqual(metadata);
      }
    },
  );

  it('lists each direct page exactly once at the Build root', () => {
    const pages = readMeta(resolve(buildRoot, 'meta.json')).pages ?? [];

    for (const directPage of directPages) {
      expect(pages.filter((page) => page === directPage)).toHaveLength(1);
    }
  });

  it('has no old RTSA Build path in RTSA MDX content', () => {
    const residualPaths = collectMdxFiles(contentRoot).flatMap((filePath) => {
      const source = readFileSync(filePath, 'utf8');
      const relativePath = relative(process.cwd(), filePath);

      return oldRtsaBuildPrefixes
        .filter((prefix) => source.includes(prefix))
        .map((prefix) => `${relativePath}: ${prefix}`);
    });

    expect(residualPaths).toEqual([]);
  });

  it('keeps old RTSA Build paths on redirect sources but never on targets', () => {
    const redirects = JSON.parse(readFileSync(legacyRedirectsPath, 'utf8')) as {
      rules: LegacyRedirectRule[];
    };
    const legacyPaths = new Set(redirects.rules.map((rule) => rule.legacyPath));
    const missingLegacyPaths = oldRtsaBuildUrls.filter(
      (legacyPath) => !legacyPaths.has(legacyPath),
    );
    const staleTargets = redirects.rules
      .filter((rule) => hasOldBuildPrefix(rule.target))
      .map((rule) => `${rule.legacyPath} -> ${rule.target}`);

    expect(missingLegacyPaths).toEqual([]);
    expect(staleTargets).toEqual([]);
  });
});
