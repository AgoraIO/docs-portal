import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { loadDocsPagePayload } from './docs-page.server';
import { resolveStaticLegacySitemapRedirect } from './legacy-sitemap/static-redirects';

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

type VercelRedirectRule = {
  destination: string;
  source: string;
  statusCode: number;
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
const vercelRedirectsPath = resolve(
  process.cwd(),
  'vercel-legacy-redirects.json',
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

const oldRtsaBuildRedirects = [
  {
    legacyPath:
      '/zh-CN/realtime-media/rtsa/build/setup-and-access/enable-service',
    target:
      '/zh-CN/realtime-media/rtsa/build/project-preparation/enable-service',
  },
  {
    legacyPath: '/zh-CN/realtime-media/rtsa/build/setup-and-access/license',
    target: '/zh-CN/realtime-media/rtsa/build/project-preparation/license',
  },
  {
    legacyPath:
      '/zh-CN/realtime-media/rtsa/build/implement-core-features/implement-transmission',
    target: '/zh-CN/realtime-media/rtsa/build/implement-transmission',
  },
  {
    legacyPath:
      '/zh-CN/realtime-media/rtsa/build/implement-core-features/string-uid',
    target: '/zh-CN/realtime-media/rtsa/build/string-uid',
  },
  {
    legacyPath:
      '/zh-CN/realtime-media/rtsa/build/implement-core-features/audio-codec',
    target: '/zh-CN/realtime-media/rtsa/build/media-transmission/audio-codec',
  },
  {
    legacyPath:
      '/zh-CN/realtime-media/rtsa/build/implement-core-features/stream-state',
    target: '/zh-CN/realtime-media/rtsa/build/media-transmission/stream-state',
  },
  {
    legacyPath:
      '/zh-CN/realtime-media/rtsa/build/implement-core-features/bitrate-adaption',
    target:
      '/zh-CN/realtime-media/rtsa/build/media-transmission/bitrate-adaption',
  },
  {
    legacyPath:
      '/zh-CN/realtime-media/rtsa/build/implement-core-features/key-frame',
    target: '/zh-CN/realtime-media/rtsa/build/media-transmission/key-frame',
  },
  {
    legacyPath:
      '/zh-CN/realtime-media/rtsa/build/implement-core-features/multi-channel',
    target: '/zh-CN/realtime-media/rtsa/build/media-transmission/multi-channel',
  },
  {
    legacyPath:
      '/zh-CN/realtime-media/rtsa/build/implement-core-features/encryption',
    target: '/zh-CN/realtime-media/rtsa/build/media-transmission/encryption',
  },
  {
    legacyPath:
      '/zh-CN/realtime-media/rtsa/build/implement-core-features/data-stream',
    target: '/zh-CN/realtime-media/rtsa/build/data-communication/data-stream',
  },
  {
    legacyPath:
      '/zh-CN/realtime-media/rtsa/build/implement-core-features/send-message-through-rdt-channel',
    target:
      '/zh-CN/realtime-media/rtsa/build/data-communication/send-message-through-rdt-channel',
  },
  {
    legacyPath:
      '/zh-CN/realtime-media/rtsa/build/optimize-and-operate/interoperate-rtc',
    target: '/zh-CN/realtime-media/rtsa/build/interoperate-rtc',
  },
  {
    legacyPath: '/zh-CN/realtime-media/rtsa/build/setup-and-access/cloud-proxy',
    target:
      '/zh-CN/realtime-media/rtsa/build/production-environment/cloud-proxy',
  },
  {
    legacyPath:
      '/zh-CN/realtime-media/rtsa/build/setup-and-access/region-limit',
    target:
      '/zh-CN/realtime-media/rtsa/build/production-environment/region-limit',
  },
] as const;

const oldRtsaBuildUrls = oldRtsaBuildRedirects.map(
  ({ legacyPath }) => legacyPath,
);

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

  it('has a unique canonical URL for every approved Build page', () => {
    const rootPages = readMeta(resolve(buildRoot, 'meta.json')).pages ?? [];
    const canonicalUrls = rootPages.flatMap((page) => {
      const category =
        approvedCategoryMetadata[page as keyof typeof approvedCategoryMetadata];

      if (category) {
        return category.pages.map(
          (child) => `/zh-CN/realtime-media/rtsa/build/${page}/${child}`,
        );
      }

      return [`/zh-CN/realtime-media/rtsa/build/${page}`];
    });

    expect(canonicalUrls).toHaveLength(approvedNewMdxPaths.length);
    expect(new Set(canonicalUrls).size).toBe(canonicalUrls.length);
  });

  it('keeps the product overview Build card on the canonical implementation guide', () => {
    const overview = readFileSync(resolve(contentRoot, 'index.mdx'), 'utf8');

    expect(overview).toContain(
      '<Card title="构建功能" href="/zh-CN/realtime-media/rtsa/build/implement-transmission"',
    );
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

  it('keeps all old RTSA Build paths on 301 redirect sources and artifacts', () => {
    const redirects = JSON.parse(readFileSync(legacyRedirectsPath, 'utf8')) as {
      rules: LegacyRedirectRule[];
    };
    const vercelRedirects = JSON.parse(
      readFileSync(vercelRedirectsPath, 'utf8'),
    ) as VercelRedirectRule[];

    for (const { legacyPath, target } of oldRtsaBuildRedirects) {
      expect(redirects.rules).toContainEqual(
        expect.objectContaining({ legacyPath, target }),
      );
      expect(resolveStaticLegacySitemapRedirect(legacyPath)).toEqual({
        preserveSearch: true,
        redirectUrl: target,
        statusCode: 301,
      });
      expect(vercelRedirects).toContainEqual(
        expect.objectContaining({
          destination: target,
          source: legacyPath,
          statusCode: 301,
        }),
      );
    }

    expect(oldRtsaBuildUrls).toHaveLength(15);
    expect(
      redirects.rules.filter((rule) => hasOldBuildPrefix(rule.target)),
    ).toEqual([]);
  });
});
