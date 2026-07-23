import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

type DocsPage = string | { pages?: DocsPage[] };

type DocsMeta = {
  navScope?: unknown;
  pages?: DocsPage[];
  title?: string;
};

const zhDocsRoot = resolve(process.cwd(), 'content/docs/zh-CN');
const sharedConceptPageEntries = new Set([
  'mcp-integrate',
  'skills-integrate',
  '!mcp-integrate',
  '!skills-integrate',
]);
const sharedConceptRoutes = new Set([
  '/zh-CN/introduction/mcp-integrate',
  '/zh-CN/introduction/skills-integrate',
]);

function navigationTarget(entry: string) {
  const match = entry.match(/^\[[^\]]+\]\(([^)]+)\)$/);
  return match?.[1] ?? entry.replace(/^!/, '');
}

function hasSharedConceptEntry(pages: DocsPage[] = []): boolean {
  return pages.some((entry) => {
    if (typeof entry !== 'string') {
      return hasSharedConceptEntry(entry.pages);
    }
    const target = navigationTarget(entry);
    return (
      sharedConceptPageEntries.has(entry) || sharedConceptRoutes.has(target)
    );
  });
}

function readMeta(path: string): DocsMeta {
  return JSON.parse(readFileSync(path, 'utf8')) as DocsMeta;
}

function getDirectProductMetaPaths(section: 'realtime-media' | 'solutions') {
  const sectionRoot = resolve(zhDocsRoot, section);

  return readdirSync(sectionRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => resolve(sectionRoot, entry.name, 'meta.json'))
    .filter((metaPath) => existsSync(metaPath));
}

function listFiles(root: string): string[] {
  const files: string[] = [];

  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const entryPath = resolve(root, entry.name);

    if (entry.isDirectory()) {
      files.push(...listFiles(entryPath));
      continue;
    }

    if (entry.isFile()) {
      files.push(entryPath);
    }
  }

  return files;
}

describe('zh-CN product nav scope content', () => {
  it.each([
    'realtime-media',
    'solutions',
  ] as const)('marks %s product folders as nav scopes', (section) => {
    const missingNavScope = getDirectProductMetaPaths(section).flatMap(
      (metaPath) => {
        const meta = readMeta(metaPath);

        return Object.hasOwn(meta, 'navScope') ? [] : [metaPath];
      },
    );

    expect(missingNavScope).toEqual([]);
  });

  it('keeps RTC overview as the Voice and Video product entry target', () => {
    const rtcMeta = readMeta(
      resolve(zhDocsRoot, 'realtime-media/rtc/meta.json'),
    );
    const rtcIndex = readFileSync(
      resolve(zhDocsRoot, 'realtime-media/rtc/index.mdx'),
      'utf8',
    );

    expect(rtcMeta.title).toBe('语音与视频 RTC');
    expect(rtcMeta.navScope).toEqual({});
    expect(rtcMeta.pages).toContain('index');
    expect(rtcIndex).toMatch(/^title:\s*"?语音与视频 RTC 概览"?$/m);
  });

  it('keeps fully shared MCP and Skills docs only under introduction', () => {
    const sharedConceptFiles = listFiles(zhDocsRoot)
      .map((file) => relative(zhDocsRoot, file).replace(/\\/g, '/'))
      .filter((file) =>
        /(?:^|\/)(?:mcp-integrate|skills-integrate)\.mdx$/.test(file),
      )
      .sort();

    expect(sharedConceptFiles).toEqual([
      'introduction/mcp-integrate.mdx',
      'introduction/skills-integrate.mdx',
    ]);
  });

  it('keeps shared MCP and Skills entries out of product navigation', () => {
    const productMetaFiles = listFiles(zhDocsRoot).filter((file) => {
      return (
        file.endsWith('/meta.json') &&
        file !== resolve(zhDocsRoot, 'introduction/meta.json')
      );
    });
    const metaWithSharedConceptEntries = productMetaFiles.flatMap(
      (metaPath) => {
        const meta = readMeta(metaPath);
        const hasSharedConceptNavigationEntry = hasSharedConceptEntry(
          meta.pages,
        );

        return hasSharedConceptNavigationEntry
          ? [relative(zhDocsRoot, metaPath).replace(/\\/g, '/')]
          : [];
      },
    );

    expect(metaWithSharedConceptEntries).toEqual([]);
  });
});
