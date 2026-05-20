import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const docsRoot = path.join(repoRoot, 'content', 'docs');
const failOnMissing = process.argv.includes('--fail-on-missing');
const maxSamples = Number.parseInt(
  process.argv.find((arg) => arg.startsWith('--max-samples='))?.split('=')[1] ??
    '30',
  10,
);

const stats = {
  assetLinks: 0,
  docsFiles: 0,
  externalLinks: 0,
  hashLinks: 0,
  legacyRootDocLinks: [],
  missingRelativeMarkdownLinks: [],
  relativeAssetLinks: 0,
  relativeMarkdownLinks: [],
  rootLinks: 0,
  totalLinks: 0,
};

const docsFiles = listMarkdownFiles(docsRoot);
const existingContentPaths = new Set(
  docsFiles.map((file) => toContentPath(file)),
);

for (const filePath of docsFiles) {
  const sourcePath = toContentPath(filePath);
  const markdown = fs.readFileSync(filePath, 'utf8');
  const links = extractLinks(markdown);

  stats.docsFiles += 1;
  stats.totalLinks += links.length;

  for (const link of links) {
    classifyLink(sourcePath, link);
  }
}

printReport();

if (failOnMissing && stats.missingRelativeMarkdownLinks.length > 0) {
  process.exitCode = 1;
}

function listMarkdownFiles(root) {
  const results = [];

  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const fullPath = path.join(root, entry.name);

    if (entry.isDirectory()) {
      results.push(...listMarkdownFiles(fullPath));
      continue;
    }

    if (/\.(md|mdx)$/i.test(entry.name)) {
      results.push(fullPath);
    }
  }

  return results.sort();
}

function extractLinks(markdown) {
  const links = [];
  const markdownLinkPattern = /(!?)\[[^\]\n]*\]\(([^)\n]+)\)/g;
  const referenceLinkPattern = /^\s{0,3}\[[^\]\n]+\]:\s*(\S+)/gm;
  const htmlHrefPattern = /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;

  for (const match of markdown.matchAll(markdownLinkPattern)) {
    const href = cleanMarkdownHref(match[2]);

    if (!href) {
      continue;
    }

    links.push({ href, isImage: match[1] === '!', source: 'markdown' });
  }

  for (const match of markdown.matchAll(referenceLinkPattern)) {
    const href = cleanMarkdownHref(match[1]);

    if (href) {
      links.push({ href, isImage: false, source: 'reference' });
    }
  }

  for (const match of markdown.matchAll(htmlHrefPattern)) {
    const href = match[1] ?? match[2] ?? '';

    if (href) {
      links.push({ href, isImage: false, source: 'html' });
    }
  }

  return links;
}

function classifyLink(sourcePath, link) {
  const href = link.href.trim();

  if (link.isImage) {
    stats.assetLinks += 1;
  }

  if (href.startsWith('#')) {
    stats.hashLinks += 1;
    return;
  }

  if (href.startsWith('//')) {
    stats.externalLinks += 1;
    return;
  }

  if (href.startsWith('/doc/')) {
    stats.legacyRootDocLinks.push({ sourcePath, href, source: link.source });
    return;
  }

  if (href.startsWith('/')) {
    stats.rootLinks += 1;
    return;
  }

  if (/^[a-z][a-z0-9+.-]*:/i.test(href)) {
    stats.externalLinks += 1;
    return;
  }

  const parsed = splitHref(href);

  if (!/\.mdx?$/i.test(parsed.path)) {
    stats.relativeAssetLinks += 1;
    return;
  }

  const targetPath = path.posix.normalize(
    path.posix.join(path.posix.dirname(sourcePath), parsed.path),
  );
  const normalizedHref = toCleanRoute(targetPath, parsed);
  const entry = {
    sourcePath,
    href,
    targetPath,
    normalizedHref,
    source: link.source,
  };

  if (existingContentPaths.has(targetPath)) {
    stats.relativeMarkdownLinks.push(entry);
    return;
  }

  stats.missingRelativeMarkdownLinks.push(entry);
}

function cleanMarkdownHref(rawHref) {
  const trimmed = rawHref.trim();

  if (trimmed.startsWith('<') && trimmed.endsWith('>')) {
    return trimmed.slice(1, -1);
  }

  return trimmed.split(/\s+/)[0] ?? '';
}

function splitHref(href) {
  const hashIndex = href.indexOf('#');
  const beforeHash = hashIndex === -1 ? href : href.slice(0, hashIndex);
  const hash = hashIndex === -1 ? '' : href.slice(hashIndex);
  const searchIndex = beforeHash.indexOf('?');

  if (searchIndex === -1) {
    return { path: beforeHash, search: '', hash };
  }

  return {
    path: beforeHash.slice(0, searchIndex),
    search: beforeHash.slice(searchIndex),
    hash,
  };
}

function toCleanRoute(contentPath, parsed) {
  const segments = contentPath.split('/').filter(Boolean);
  const [locale, tab, ...rest] = segments;
  const fileName = rest.at(-1);

  if (!locale || !tab || !fileName) {
    return '';
  }

  const slugSegments =
    fileName === 'index.md' || fileName === 'index.mdx'
      ? rest.slice(0, -1)
      : [...rest.slice(0, -1), fileName.replace(/\.mdx?$/i, '')];
  const slugPath = [tab, ...slugSegments].filter(Boolean).join('/');

  return `/${locale}/${slugPath}${parsed.search}${parsed.hash}`;
}

function toContentPath(filePath) {
  return path
    .relative(docsRoot, filePath)
    .split(path.sep)
    .join(path.posix.sep);
}

function printReport() {
  console.log('# Docs Link Audit');
  console.log('');
  console.log(`docsFiles: ${stats.docsFiles}`);
  console.log(`totalLinks: ${stats.totalLinks}`);
  console.log(`relativeMarkdownLinks: ${stats.relativeMarkdownLinks.length}`);
  console.log(
    `missingRelativeMarkdownLinks: ${stats.missingRelativeMarkdownLinks.length}`,
  );
  console.log(`legacyRootDocLinks: ${stats.legacyRootDocLinks.length}`);
  console.log(`rootLinks: ${stats.rootLinks}`);
  console.log(`externalLinks: ${stats.externalLinks}`);
  console.log(`hashLinks: ${stats.hashLinks}`);
  console.log(`assetLinks: ${stats.assetLinks}`);
  console.log(`relativeAssetLinks: ${stats.relativeAssetLinks}`);

  printSection(
    'Sample valid relative Markdown links',
    stats.relativeMarkdownLinks,
  );
  printSection(
    'Sample missing relative Markdown links',
    stats.missingRelativeMarkdownLinks,
  );
  printSection('Sample legacy /doc/* links', stats.legacyRootDocLinks);
}

function printSection(title, entries) {
  console.log('');
  console.log(`## ${title}`);

  if (entries.length === 0) {
    console.log('none');
    return;
  }

  for (const entry of entries.slice(0, maxSamples)) {
    if ('targetPath' in entry) {
      console.log(
        `- ${entry.sourcePath}: ${entry.href} => ${entry.normalizedHref} (${entry.targetPath})`,
      );
      continue;
    }

    console.log(`- ${entry.sourcePath}: ${entry.href}`);
  }

  if (entries.length > maxSamples) {
    console.log(`- ... ${entries.length - maxSamples} more`);
  }
}
