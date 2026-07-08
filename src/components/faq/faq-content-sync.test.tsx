import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { faqItems } from './faq-data';
import { zhCnFaqItems } from './faq-data.zh-cn';
import { FAQ_CATEGORY_FOLDER } from './faq-filter';

const faqRoot = path.join(process.cwd(), 'content/docs/en/api-reference/faq');
const zhCnFaqRoot = path.join(
  process.cwd(),
  'content/docs/zh-CN/api-reference/faq',
);
const zhCnDocsRoot = path.join(process.cwd(), 'content/docs/zh-CN');

// Every category folder's landing page, e.g. /en/api-reference/faq/integration/index
const categoryIndexPages = Object.values(FAQ_CATEGORY_FOLDER).map(
  (folder) => `/en/api-reference/faq/${folder}/index`,
);
const zhCnCategoryIndexPages = Object.values(FAQ_CATEGORY_FOLDER).map(
  (folder) => `/zh-CN/api-reference/faq/${folder}/index`,
);

function listFaqPages({
  contentRoot,
  dir,
  locale,
}: {
  contentRoot: string;
  dir: string;
  locale: 'en' | 'zh-CN';
}): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return listFaqPages({ contentRoot, dir: entryPath, locale });
    }
    if (!entry.name.endsWith('.mdx')) {
      return [];
    }
    return [
      `/${locale}/${path
        .relative(contentRoot, entryPath)
        .replace(/\.mdx$/, '')
        .split(path.sep)
        .join('/')}`,
    ];
  });
}

function listFaqMetaFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return listFaqMetaFiles(entryPath);
    }
    return entry.name === 'meta.json' ? [entryPath] : [];
  });
}

function listMarkdownFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return listMarkdownFiles(entryPath);
    }
    return /\.(md|mdx)$/.test(entry.name) ? [entryPath] : [];
  });
}

function readMeta(file: string): { defaultOpen?: boolean; pages?: string[] } {
  return JSON.parse(readFileSync(file, 'utf8')) as {
    defaultOpen?: boolean;
    pages?: string[];
  };
}

function resolvePageEntry(dir: string, page: string): boolean {
  return (
    existsSync(path.join(dir, `${page}.mdx`)) ||
    existsSync(path.join(dir, page))
  );
}

function listFaqImageTargets(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return listFaqImageTargets(entryPath);
    }
    if (!entry.name.endsWith('.mdx')) {
      return [];
    }
    const content = readFileSync(entryPath, 'utf8');
    return Array.from(content.matchAll(/!\[[^\]]*\]\(([^)\s]+)[^)]*\)/g))
      .map((match) => match[1])
      .filter((target): target is string => Boolean(target));
  });
}

function listLegacyZhCnFaqLinks(): string[] {
  const legacyPatterns = [
    /https?:\/\/doc\.shengwang\.cn\/faq\b/g,
    /https?:\/\/docs\.agora\.io\/(?:cn|en)\/(?:[^\s)\]}>'"`]+\/)*faq\//g,
    /(?<!zh-CN\/api-reference)(?<!en\/api-reference)\/faq\//g,
  ];
  const offenders: string[] = [];

  for (const file of listMarkdownFiles(zhCnDocsRoot)) {
    const content = readFileSync(file, 'utf8');
    for (const pattern of legacyPatterns) {
      for (const match of content.matchAll(pattern)) {
        const line = content.slice(0, match.index).split('\n').length;
        offenders.push(`${path.relative(process.cwd(), file)}:${line}`);
      }
    }
  }

  return offenders;
}

function listBrokenZhCnFaqLinks(): string[] {
  const brokenLinks: string[] = [];
  const faqLinkPattern =
    /\/zh-CN\/api-reference\/faq(?:\/[A-Za-z0-9_/-]+)?(?:#[^\s)\]}>'"`]+)?/g;

  for (const file of listMarkdownFiles(zhCnDocsRoot)) {
    const content = readFileSync(file, 'utf8');
    for (const match of content.matchAll(faqLinkPattern)) {
      const href = match[0].split('#')[0];
      const target = path.join(
        process.cwd(),
        'content/docs/zh-CN',
        href.replace('/zh-CN/', ''),
      );

      if (
        !existsSync(`${target}.mdx`) &&
        !existsSync(path.join(target, 'index.mdx'))
      ) {
        const line = content.slice(0, match.index).split('\n').length;
        brokenLinks.push(
          `${path.relative(process.cwd(), file)}:${line}: ${match[0]}`,
        );
      }
    }
  }

  return brokenLinks;
}

describe('faq content integrity', () => {
  it('keeps faqItems 1:1 with article pages (excluding landing pages)', () => {
    const landingPages = new Set([
      '/en/api-reference/faq/index',
      ...categoryIndexPages,
    ]);
    const articlePages = listFaqPages({
      contentRoot: path.join(process.cwd(), 'content/docs/en'),
      dir: faqRoot,
      locale: 'en',
    }).filter((page) => !landingPages.has(page));
    const faqHrefs = faqItems.map((item) => item.href);

    expect(new Set(faqHrefs)).toHaveLength(faqHrefs.length);
    expect([...faqHrefs].sort()).toEqual([...articlePages].sort());
  });

  it('keeps zhCnFaqItems 1:1 with Chinese article pages', () => {
    const landingPages = new Set([
      '/zh-CN/api-reference/faq/index',
      ...zhCnCategoryIndexPages,
    ]);
    const articlePages = listFaqPages({
      contentRoot: path.join(process.cwd(), 'content/docs/zh-CN'),
      dir: zhCnFaqRoot,
      locale: 'zh-CN',
    }).filter((page) => !landingPages.has(page));
    const faqHrefs = zhCnFaqItems.map((item) => item.href);

    expect(new Set(faqHrefs)).toHaveLength(faqHrefs.length);
    expect([...faqHrefs].sort()).toEqual([...articlePages].sort());
  });

  it('only lists meta pages that resolve to a real entry', () => {
    for (const metaFile of [
      ...listFaqMetaFiles(faqRoot),
      ...listFaqMetaFiles(zhCnFaqRoot),
    ]) {
      const meta = readMeta(metaFile);
      const dir = path.dirname(metaFile);
      for (const page of meta.pages ?? []) {
        expect(resolvePageEntry(dir, page), `${metaFile}: ${page}`).toBe(true);
      }
    }
  });

  it('keeps Chinese FAQ navigation schema aligned with English FAQ', () => {
    const enRootMeta = readMeta(path.join(faqRoot, 'meta.json'));
    const zhCnRootMeta = readMeta(path.join(zhCnFaqRoot, 'meta.json'));

    expect(zhCnRootMeta.pages).toEqual(enRootMeta.pages);
    expect(zhCnRootMeta.defaultOpen).toBe(enRootMeta.defaultOpen);

    for (const folder of Object.values(FAQ_CATEGORY_FOLDER)) {
      const enCategoryMeta = readMeta(path.join(faqRoot, folder, 'meta.json'));
      const zhCnCategoryMeta = readMeta(
        path.join(zhCnFaqRoot, folder, 'meta.json'),
      );

      expect(zhCnCategoryMeta.pages, folder).toEqual(enCategoryMeta.pages);
    }
  });

  it('does not leave zh-CN docs pointing at legacy FAQ routes', () => {
    expect(listLegacyZhCnFaqLinks()).toEqual([]);
  });

  it('keeps zh-CN FAQ links pointing at real docs pages', () => {
    expect(listBrokenZhCnFaqLinks()).toEqual([]);
  });

  it('does not leave FAQ image references pointing at local public assets', () => {
    expect(
      listFaqImageTargets(faqRoot).filter((target) =>
        target.startsWith('/images/faq/'),
      ),
    ).toEqual([]);
  });

  it('keeps Chinese FAQ local image references backed by copied public assets', () => {
    const imageRefs = listFaqImageTargets(zhCnFaqRoot).filter((target) =>
      target.startsWith('/img/'),
    );

    expect(imageRefs.length).toBeGreaterThan(0);
    for (const imageRef of imageRefs) {
      expect(
        existsSync(path.join(process.cwd(), 'public', imageRef.slice(1))),
        imageRef,
      ).toBe(true);
    }
  });
});
