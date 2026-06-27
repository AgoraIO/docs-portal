import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { faqItems } from './faq-data';
import { FAQ_CATEGORY_FOLDER } from './faq-filter';

const faqRoot = path.join(process.cwd(), 'content/docs/en/api-reference/faq');

// Every category folder's landing page, e.g. /en/api-reference/faq/integration/index
const categoryIndexPages = Object.values(FAQ_CATEGORY_FOLDER).map(
  (folder) => `/en/api-reference/faq/${folder}/index`,
);

function listFaqPages(dir = faqRoot): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return listFaqPages(entryPath);
    }
    if (!entry.name.endsWith('.mdx')) {
      return [];
    }
    return [
      `/en/${path
        .relative(path.join(process.cwd(), 'content/docs/en'), entryPath)
        .replace(/\.mdx$/, '')
        .split(path.sep)
        .join('/')}`,
    ];
  });
}

function listFaqMetaFiles(dir = faqRoot): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return listFaqMetaFiles(entryPath);
    }
    return entry.name === 'meta.json' ? [entryPath] : [];
  });
}

function resolvePageEntry(dir: string, page: string): boolean {
  return (
    existsSync(path.join(dir, `${page}.mdx`)) ||
    existsSync(path.join(dir, page))
  );
}

function listFaqLocalImageRefs(dir = faqRoot): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return listFaqLocalImageRefs(entryPath);
    }
    if (!entry.name.endsWith('.mdx')) {
      return [];
    }
    const content = readFileSync(entryPath, 'utf8');
    return Array.from(
      content.matchAll(/!\[[^\]]*\]\((\/images\/faq\/[^)]+)\)/g),
    ).map((match) => match[1]);
  });
}

describe('faq content integrity', () => {
  it('keeps faqItems 1:1 with article pages (excluding landing pages)', () => {
    const landingPages = new Set([
      '/en/api-reference/faq/index',
      ...categoryIndexPages,
    ]);
    const articlePages = listFaqPages().filter(
      (page) => !landingPages.has(page),
    );
    const faqHrefs = faqItems.map((item) => item.href);

    expect(new Set(faqHrefs)).toHaveLength(faqHrefs.length);
    expect([...faqHrefs].sort()).toEqual([...articlePages].sort());
  });

  it('only lists meta pages that resolve to a real entry', () => {
    for (const metaFile of listFaqMetaFiles()) {
      const meta = JSON.parse(readFileSync(metaFile, 'utf8')) as {
        pages?: string[];
      };
      const dir = path.dirname(metaFile);
      for (const page of meta.pages ?? []) {
        expect(resolvePageEntry(dir, page), `${metaFile}: ${page}`).toBe(true);
      }
    }
  });

  it('keeps local image references pointing at real assets', () => {
    for (const imageRef of listFaqLocalImageRefs()) {
      expect(
        existsSync(path.join(process.cwd(), 'public', imageRef)),
        imageRef,
      ).toBe(true);
    }
  });
});
