#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const CONTENT_ROOT = 'content/docs/zh-CN';
const REPORT_PATH =
  'docs/migration/generated/zh-cn-faq-migration/link-rewrite.json';
const MAPPING_PATH =
  'docs/migration/generated/zh-cn-faq-migration/mapping.json';

const CATEGORY_TO_FOLDER = {
  'account-and-billing': 'account',
  'general-product-inquiry': 'product',
  'integration-issues': 'integration',
  'other-issues': 'other',
  'quality-issues': 'quality',
};

const MANUAL_ALIASES = {
  browser_support: '/zh-CN/realtime-media/rtc/reference/browser-compatibility',
  empty_deviceId: '/zh-CN/realtime-media/rtc/reference/browser-compatibility',
  web_on_mobile:
    '/zh-CN/realtime-media/rtc/reference/browser-compatibility#mobile',
};

const LEGACY_LIST_PATTERNS = [
  /https?:\/\/doc\.shengwang\.cn\/faq\/list(?:\?[^)\]}> '"`]+)?/g,
  /(?<![A-Za-z0-9_-])\/faq\/list(?:\?[^)\]}> '"`]+)?/g,
];

const LEGACY_ARTICLE_PATTERNS = [
  /https?:\/\/doc\.shengwang\.cn\/faq\/(?!list\b)(?:([A-Za-z0-9_-]+)\/)?([^/?#)\]}> '"`]+)(#[^?)\]}> '"`]+)?(?:\?[^)\]}> '"`]+)?/g,
  /https?:\/\/docs\.agora\.io\/(?:cn|en)\/(?:[^/?#)\]}> '"`]+\/)*faq\/([^/?#)\]}> '"`]+)(#[^?)\]}> '"`]+)?(?:\?[^)\]}> '"`]+)?/g,
  /(?<![A-Za-z0-9_-])\/faq\/(?!list\b)(?:([A-Za-z0-9_-]+)\/)?([^/?#)\]}> '"`]+)(#[^?)\]}> '"`]+)?(?:\?[^)\]}> '"`]+)?/g,
];

const repoRoot = process.cwd();
const mapping = JSON.parse(
  await fs.readFile(path.join(repoRoot, MAPPING_PATH), 'utf8'),
);
const slugToHref = createSlugMap(mapping.rows);
const replacements = [];
const unresolved = [];

for await (const file of walkMarkdownFiles(path.join(repoRoot, CONTENT_ROOT))) {
  const relativeFile = toPosix(path.relative(repoRoot, file));
  const before = await fs.readFile(file, 'utf8');
  let after = before;

  for (const pattern of LEGACY_LIST_PATTERNS) {
    after = after.replace(pattern, (match) => {
      const href = listHrefFor(match);
      replacements.push({
        file: relativeFile,
        from: match,
        kind: 'legacy-list',
        to: href,
      });
      return href;
    });
  }

  for (const pattern of LEGACY_ARTICLE_PATTERNS) {
    after = after.replace(pattern, (match, first, second, third) => {
      const groups = articleGroups(pattern, first, second, third);
      const slug = decodeURIComponent(groups.slug);
      const href = resolveSlug(slug);

      if (!href) {
        unresolved.push({
          file: relativeFile,
          match,
          slug,
        });
        return match;
      }

      const target = `${href}${groups.hash ?? ''}`;
      replacements.push({
        file: relativeFile,
        from: match,
        kind: 'legacy-article',
        slug,
        to: target,
      });
      return target;
    });
  }

  if (after !== before) {
    await fs.writeFile(file, after, 'utf8');
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  replacements,
  summary: {
    filesChanged: new Set(replacements.map((entry) => entry.file)).size,
    legacyArticleLinks: replacements.filter(
      (entry) => entry.kind === 'legacy-article',
    ).length,
    legacyListLinks: replacements.filter(
      (entry) => entry.kind === 'legacy-list',
    ).length,
    replacements: replacements.length,
    unresolved: unresolved.length,
  },
  unresolved,
};

await fs.mkdir(path.dirname(path.join(repoRoot, REPORT_PATH)), {
  recursive: true,
});
await fs.writeFile(
  path.join(repoRoot, REPORT_PATH),
  `${JSON.stringify(report, null, 2)}\n`,
  'utf8',
);

if (unresolved.length > 0) {
  console.error(`Unresolved legacy FAQ links: ${unresolved.length}`);
  process.exitCode = 1;
} else {
  console.log(
    `Rewrote ${replacements.length} legacy FAQ links in ${report.summary.filesChanged} files.`,
  );
  console.log(`Report: ${REPORT_PATH}`);
}

function createSlugMap(rows) {
  const map = new Map();

  for (const row of rows) {
    const href = `/${row.targetPath
      .replace(/^content\/docs\//, '')
      .replace(/\.mdx$/, '')}`;
    const targetStem = path.posix.basename(row.targetPath, '.mdx');
    for (const alias of aliasesFor(row.sourceSlug, targetStem)) {
      addAlias(map, alias, href);
    }
  }

  for (const [alias, href] of Object.entries(MANUAL_ALIASES)) {
    addAlias(map, alias, href);
  }

  return map;
}

function aliasesFor(sourceSlug, targetStem) {
  return new Set([
    sourceSlug,
    sourceSlug.replaceAll('-', '_'),
    sourceSlug.replaceAll('_', '-'),
    targetStem,
    targetStem.replaceAll('-', '_'),
    targetStem.replaceAll('_', '-'),
  ]);
}

function addAlias(map, alias, href) {
  if (alias && !map.has(alias)) {
    map.set(alias, href);
  }
}

function resolveSlug(slug) {
  return (
    slugToHref.get(slug) ??
    slugToHref.get(slug.replaceAll('-', '_')) ??
    slugToHref.get(slug.replaceAll('_', '-')) ??
    null
  );
}

function listHrefFor(match) {
  const query = match.includes('?') ? match.slice(match.indexOf('?') + 1) : '';
  const params = new URLSearchParams(query);
  const folder = CATEGORY_TO_FOLDER[params.get('category') ?? ''];
  return folder
    ? `/zh-CN/api-reference/faq/${folder}`
    : '/zh-CN/api-reference/faq';
}

function articleGroups(pattern, first, second, third) {
  if (pattern === LEGACY_ARTICLE_PATTERNS[1]) {
    return {
      hash: second,
      slug: first,
    };
  }

  return {
    category: first,
    hash: third,
    slug: second,
  };
}

async function* walkMarkdownFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walkMarkdownFiles(entryPath);
    } else if (/\.(md|mdx)$/.test(entry.name)) {
      yield entryPath;
    }
  }
}

function toPosix(value) {
  return value.split(path.sep).join('/');
}
