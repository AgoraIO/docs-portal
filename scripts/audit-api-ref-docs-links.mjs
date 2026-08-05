import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const API_REF_HOST = 'api-ref.agora.io';
const API_REF_ORIGIN = `https://${API_REF_HOST}`;
const DOCS_HOST = 'docs.agora.io';
const DEFAULT_OUT_BASE = path.join(
  rootDir,
  'docs/agents/reports/2026-08-03-api-ref-docs-links',
);
const SKIP_EXTENSIONS = new Set([
  '.css',
  '.js',
  '.mjs',
  '.json',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.svg',
  '.webp',
  '.ico',
  '.pdf',
  '.zip',
]);

export function deriveApiRefScope(entryUrl) {
  const url = new URL(entryUrl);
  const pathSegments = url.pathname.split('/');
  pathSegments.pop();
  url.pathname = `${pathSegments.join('/')}/`;
  url.search = '';
  url.hash = '';
  return url.href;
}

function isDefaultApiRefOrigin(url) {
  return (
    url.protocol === 'https:' &&
    url.origin === API_REF_ORIGIN &&
    url.hostname === API_REF_HOST
  );
}

export function extractApiRefEntriesFromMeta(meta) {
  const entries = [];

  for (const page of meta.pages ?? []) {
    if (
      !page ||
      typeof page !== 'object' ||
      page.type !== 'group' ||
      !Array.isArray(page.pages)
    ) {
      continue;
    }

    for (const child of page.pages) {
      if (!child || typeof child !== 'object') {
        continue;
      }

      if (child.external !== true || typeof child.href !== 'string') {
        continue;
      }

      let url;
      try {
        url = new URL(child.href);
      } catch {
        continue;
      }

      if (!isDefaultApiRefOrigin(url)) {
        continue;
      }

      entries.push({
        groupTitle: page.title,
        entryTitle: child.title,
        entryUrl: url.href,
        scopeUrl: deriveApiRefScope(url.href),
      });
    }
  }

  return entries;
}

export async function readApiReferenceMeta({
  metaPath = path.join(rootDir, 'content/docs/en/api-reference/meta.json'),
} = {}) {
  return JSON.parse(await fs.readFile(metaPath, 'utf8'));
}

function decodeHtmlEntities(value) {
  const namedEntities = {
    amp: '&',
    apos: "'",
    gt: '>',
    lt: '<',
    nbsp: ' ',
    quot: '"',
  };

  return value.replace(
    /&(#x[0-9a-f]+|#\d+|[a-z][a-z0-9]+);/gi,
    (match, entity) => {
      const normalizedEntity = entity.toLowerCase();

      if (normalizedEntity.startsWith('#x')) {
        const codePoint = Number.parseInt(entity.slice(2), 16);
        return Number.isInteger(codePoint) &&
          codePoint >= 0 &&
          codePoint <= 0x10ffff
          ? String.fromCodePoint(codePoint)
          : match;
      }

      if (entity.startsWith('#')) {
        const codePoint = Number.parseInt(entity.slice(1), 10);
        return Number.isInteger(codePoint) &&
          codePoint >= 0 &&
          codePoint <= 0x10ffff
          ? String.fromCodePoint(codePoint)
          : match;
      }

      return namedEntities[normalizedEntity] ?? match;
    },
  );
}

function extractAnchorText(anchorHtml) {
  return decodeHtmlEntities(anchorHtml.replace(/<[^>]*>/g, ''))
    .replace(/\s+/g, ' ')
    .trim();
}

function extractHref(anchorTagHtml) {
  const startTagMatch = anchorTagHtml.match(/^<a\b([^>]*)>/i);
  if (!startTagMatch) {
    return undefined;
  }

  const hrefMatch = startTagMatch[1].match(
    /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/i,
  );
  if (!hrefMatch) {
    return undefined;
  }

  return decodeHtmlEntities(hrefMatch[1] ?? hrefMatch[2] ?? hrefMatch[3] ?? '');
}

export function extractLinksFromHtml({ html, sourceUrl }) {
  const links = [];
  const anchorPattern = /<a\b[^>]*>([\s\S]*?)<\/a>/gi;

  for (const anchorMatch of html.matchAll(anchorPattern)) {
    const href = extractHref(anchorMatch[0])?.trim();
    if (!href || href.startsWith('#') || /^mailto:/i.test(href)) {
      continue;
    }

    try {
      links.push({
        href,
        text: extractAnchorText(anchorMatch[1]),
        resolvedUrl: new URL(href, sourceUrl).href,
      });
    } catch {}
  }

  return links;
}

export function isCrawlableApiRefHtmlUrl({ url, scopeUrl }) {
  let parsedUrl;
  let parsedScopeUrl;
  try {
    parsedUrl = new URL(url);
    parsedScopeUrl = new URL(scopeUrl);
  } catch {
    return false;
  }

  if (
    !isDefaultApiRefOrigin(parsedUrl) ||
    !isDefaultApiRefOrigin(parsedScopeUrl)
  ) {
    return false;
  }

  if (
    parsedUrl.origin !== parsedScopeUrl.origin ||
    !parsedUrl.pathname.startsWith(parsedScopeUrl.pathname)
  ) {
    return false;
  }

  const extension = path.posix.extname(parsedUrl.pathname).toLowerCase();
  if (SKIP_EXTENSIONS.has(extension)) {
    return false;
  }

  return extension === '' || extension === '.html';
}

async function fetchTextWithTimeout({ url, fetchImpl, timeoutMs }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(url, { signal: controller.signal });
    const contentType = response.headers.get('content-type') ?? '';
    const text =
      response.ok && contentType.toLowerCase().includes('text/html')
        ? await response.text()
        : '';

    return { contentType, response, text };
  } finally {
    clearTimeout(timeout);
  }
}

function normalizeApiRefCrawlUrl(url) {
  const parsedUrl = new URL(url);
  parsedUrl.search = '';
  parsedUrl.hash = '';
  return parsedUrl.href;
}

function normalizeDocsStatusTargetUrl(url) {
  const parsedUrl = new URL(url);
  parsedUrl.hash = '';
  return parsedUrl.href;
}

function normalizeConcurrency(concurrency) {
  if (
    typeof concurrency !== 'number' ||
    !Number.isFinite(concurrency) ||
    concurrency <= 0
  ) {
    return 4;
  }

  return Math.max(1, Math.trunc(concurrency));
}

function normalizePositiveNumber(value, defaultValue) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    return defaultValue;
  }

  return value;
}

function toDocsLinkOccurrence({ entry, sourceUrl, link }) {
  const docsUrl = new URL(link.resolvedUrl);

  return {
    groupTitle: entry.groupTitle,
    entryTitle: entry.entryTitle,
    entryUrl: entry.entryUrl,
    sourceUrl,
    anchorText: link.text,
    rawHref: link.href,
    resolvedDocsUrl: docsUrl.href,
    docsPathname: docsUrl.pathname,
    docsSearch: docsUrl.search,
  };
}

export async function crawlApiRefEntry({
  entry,
  fetchImpl = globalThis.fetch,
  concurrency = 4,
  timeoutMs = 10000,
  maxPages = 10000,
}) {
  const docsLinkOccurrences = [];
  const pageErrors = [];
  let seedUrl;
  try {
    seedUrl = normalizeApiRefCrawlUrl(entry.entryUrl);
  } catch {
    seedUrl = entry.entryUrl;
  }

  if (
    !isCrawlableApiRefHtmlUrl({
      url: seedUrl,
      scopeUrl: entry.scopeUrl,
    })
  ) {
    return {
      entry,
      pagesVisited: 0,
      crawledPages: [],
      docsLinkOccurrences,
      pageErrors: [
        {
          sourceUrl: entry.entryUrl,
          message: 'Invalid API reference seed URL',
        },
      ],
    };
  }

  const pendingUrls = [seedUrl];
  const queuedUrls = new Set(pendingUrls);
  const visitedUrls = new Set();
  const batchSize = normalizeConcurrency(concurrency);

  while (pendingUrls.length > 0 && visitedUrls.size < maxPages) {
    const batch = pendingUrls
      .splice(0, batchSize)
      .filter((url) => !visitedUrls.has(url))
      .slice(0, maxPages - visitedUrls.size);

    await Promise.all(
      batch.map(async (sourceUrl) => {
        visitedUrls.add(sourceUrl);

        try {
          const { contentType, response, text } = await fetchTextWithTimeout({
            url: sourceUrl,
            fetchImpl,
            timeoutMs,
          });

          if (!response.ok) {
            pageErrors.push({
              sourceUrl,
              status: response.status,
              statusText: response.statusText,
              contentType,
              message: 'Non-2xx response',
            });
            return;
          }

          if (!contentType.toLowerCase().includes('text/html')) {
            pageErrors.push({
              sourceUrl,
              status: response.status,
              statusText: response.statusText,
              contentType,
              message: 'Non-HTML response',
            });
            return;
          }

          for (const link of extractLinksFromHtml({ html: text, sourceUrl })) {
            const resolvedUrl = new URL(link.resolvedUrl);

            if (resolvedUrl.hostname === DOCS_HOST) {
              docsLinkOccurrences.push(
                toDocsLinkOccurrence({ entry, sourceUrl, link }),
              );
            }

            const crawlUrl = normalizeApiRefCrawlUrl(resolvedUrl.href);
            if (
              queuedUrls.size < maxPages &&
              !queuedUrls.has(crawlUrl) &&
              !visitedUrls.has(crawlUrl) &&
              isCrawlableApiRefHtmlUrl({
                url: crawlUrl,
                scopeUrl: entry.scopeUrl,
              })
            ) {
              queuedUrls.add(crawlUrl);
              pendingUrls.push(crawlUrl);
            }
          }
        } catch (error) {
          pageErrors.push({
            sourceUrl,
            message: error instanceof Error ? error.message : String(error),
          });
        }
      }),
    );
  }

  return {
    entry,
    pagesVisited: visitedUrls.size,
    crawledPages: [...visitedUrls],
    docsLinkOccurrences,
    pageErrors,
  };
}

function safeDecodePath(pathname) {
  try {
    return decodeURI(pathname);
  } catch {
    return pathname;
  }
}

function canonicalizePercentEscapes(pathname) {
  return pathname.replace(/%[0-9a-f]{2}/giu, (escapeSequence) =>
    escapeSequence.toUpperCase(),
  );
}

function normalizePathname(pathname) {
  if (typeof pathname !== 'string' || pathname.length === 0) {
    return '/';
  }

  const normalizedPathname = pathname.startsWith('/')
    ? pathname
    : `/${pathname}`;
  const trimmedPathname =
    normalizedPathname.length > 1
      ? normalizedPathname.replace(/\/+$/u, '')
      : normalizedPathname;
  return canonicalizePercentEscapes(trimmedPathname);
}

function getRedirectSourcePath(redirect) {
  const source =
    typeof redirect === 'string' ? redirect : (redirect?.source ?? redirect?.p);
  if (typeof source !== 'string' || source.length === 0) {
    return undefined;
  }

  try {
    return new URL(source, 'https://docs.agora.io').pathname;
  } catch {
    return source.split(/[?#]/u)[0];
  }
}

function addPathVariants(paths, pathname) {
  const normalizedPathname = normalizePathname(pathname);
  const decodedPathname = normalizePathname(safeDecodePath(normalizedPathname));

  paths.add(normalizedPathname);
  paths.add(decodedPathname);
  paths.add(normalizePathname(encodeURI(decodedPathname)));
}

export function createLegacyRedirectCoverageChecker(staticRedirects = []) {
  const redirectPaths = new Set();

  for (const redirect of staticRedirects) {
    const sourcePath = getRedirectSourcePath(redirect);
    if (sourcePath) {
      addPathVariants(redirectPaths, sourcePath);
    }
  }

  return function isLegacyRedirectCovered(docsUrl) {
    let docsPathname;
    try {
      docsPathname = new URL(docsUrl, 'https://docs.agora.io').pathname;
    } catch {
      return false;
    }

    const docsPathVariants = new Set();
    addPathVariants(docsPathVariants, docsPathname);

    for (const docsPathVariant of docsPathVariants) {
      if (redirectPaths.has(docsPathVariant)) {
        return true;
      }
    }

    return false;
  };
}

function safeParseUrl(url) {
  try {
    return new URL(url);
  } catch {
    return undefined;
  }
}

function hasStatusResult(occurrence) {
  return occurrence.status != null || occurrence.error != null;
}

function isSuccessfulStatus(status) {
  return typeof status === 'number' && status >= 200 && status < 400;
}

function hasFinalUrl(result) {
  return typeof result?.finalUrl === 'string' && result.finalUrl.length > 0;
}

function pickPreferredStatusResult(currentResult, occurrence) {
  if (!hasStatusResult(occurrence)) {
    return currentResult;
  }

  if (!currentResult) {
    return occurrence;
  }

  if (
    !isSuccessfulStatus(currentResult.status) &&
    isSuccessfulStatus(occurrence.status)
  ) {
    return occurrence;
  }

  if (
    isSuccessfulStatus(currentResult.status) &&
    isSuccessfulStatus(occurrence.status) &&
    !hasFinalUrl(currentResult) &&
    hasFinalUrl(occurrence)
  ) {
    return occurrence;
  }

  return currentResult;
}

function applyStatusResult(groupedLink, statusResult) {
  for (const key of ['status', 'finalUrl', 'error']) {
    if (statusResult?.[key] !== undefined && statusResult?.[key] !== null) {
      groupedLink[key] = statusResult[key];
    } else {
      delete groupedLink[key];
    }
  }
}

/**
 * @typedef {object} ApiRefEntry
 * @property {string} [groupTitle]
 * @property {string} [entryTitle]
 * @property {string} [entryUrl]
 * @property {string} [scopeUrl]
 */

/**
 * @typedef {object} DocsLinkOccurrence
 * @property {string} groupTitle
 * @property {string} entryTitle
 * @property {string} entryUrl
 * @property {string} sourceUrl
 * @property {string} anchorText
 * @property {string} rawHref
 * @property {string} resolvedDocsUrl
 * @property {string} docsPathname
 * @property {string} docsSearch
 * @property {boolean} [legacyRedirectCovered]
 * @property {number} [status]
 * @property {string} [statusText]
 * @property {string} [contentType]
 * @property {string} [finalUrl]
 * @property {string} [error]
 */

/**
 * @typedef {object} ApiRefPageError
 * @property {string} sourceUrl
 * @property {number} [status]
 * @property {string} [statusText]
 * @property {string} [contentType]
 * @property {string} [message]
 */

/**
 * @typedef {object} ApiRefEntryReport
 * @property {ApiRefEntry} entry
 * @property {number} [pagesVisited]
 * @property {DocsLinkOccurrence[]} [docsLinkOccurrences]
 * @property {ApiRefPageError[]} [pageErrors]
 */

/**
 * @param {{
 *   generatedAt?: string,
 *   entries?: ApiRefEntryReport[],
 *   legacyRedirectCoverageChecker?: (docsUrl: string) => boolean,
 * }} [options]
 */
export function buildAuditReport({
  generatedAt = new Date().toISOString(),
  entries = [],
  legacyRedirectCoverageChecker = createLegacyRedirectCoverageChecker(),
} = {}) {
  const uniqueDocsLinksByUrl = new Map();
  const pageErrors = [];
  let apiReferencePagesVisited = 0;
  let docsLinkOccurrences = 0;

  for (const entryReport of entries) {
    const entry = entryReport.entry ?? {};
    apiReferencePagesVisited += entryReport.pagesVisited ?? 0;

    for (const pageError of entryReport.pageErrors ?? []) {
      pageErrors.push({
        groupTitle: entry.groupTitle,
        entryTitle: entry.entryTitle,
        entryUrl: entry.entryUrl,
        ...pageError,
      });
    }

    for (const occurrence of entryReport.docsLinkOccurrences ?? []) {
      docsLinkOccurrences += 1;

      const resolvedDocsUrl = occurrence.resolvedDocsUrl;
      const parsedDocsUrl = safeParseUrl(resolvedDocsUrl);
      const docsPathname =
        occurrence.docsPathname ?? parsedDocsUrl?.pathname ?? '';
      const docsSearch = occurrence.docsSearch ?? parsedDocsUrl?.search ?? '';
      const legacyRedirectCovered = Boolean(
        occurrence.legacyRedirectCovered ??
          legacyRedirectCoverageChecker(resolvedDocsUrl),
      );

      if (!uniqueDocsLinksByUrl.has(resolvedDocsUrl)) {
        uniqueDocsLinksByUrl.set(resolvedDocsUrl, {
          resolvedDocsUrl,
          docsPathname,
          docsSearch,
          legacyRedirectCovered,
          statusResult: undefined,
          occurrences: [],
        });
      }

      const groupedLink = uniqueDocsLinksByUrl.get(resolvedDocsUrl);
      groupedLink.legacyRedirectCovered =
        groupedLink.legacyRedirectCovered || legacyRedirectCovered;
      groupedLink.statusResult = pickPreferredStatusResult(
        groupedLink.statusResult,
        occurrence,
      );
      applyStatusResult(groupedLink, groupedLink.statusResult);
      groupedLink.occurrences.push({ ...occurrence });
    }
  }

  const uniqueDocsLinks = [...uniqueDocsLinksByUrl.values()];
  for (const uniqueDocsLink of uniqueDocsLinks) {
    delete uniqueDocsLink.statusResult;
  }

  return {
    generatedAt,
    summary: {
      apiReferenceEntries: entries.length,
      apiReferencePagesVisited,
      docsLinkOccurrences,
      uniqueDocsUrls: uniqueDocsLinks.length,
      pageErrors: pageErrors.length,
    },
    uniqueDocsLinks,
    pageErrors,
  };
}

function escapeTable(value) {
  if (value === undefined || value === null) {
    return '';
  }

  return String(value)
    .replace(/\|/gu, '\\|')
    .replace(/\r\n|\r|\n/gu, '<br>');
}

function renderSummaryTable(summary) {
  return [
    '| Metric | Count |',
    '| --- | ---: |',
    `| API reference entries | ${summary.apiReferenceEntries ?? 0} |`,
    `| API reference pages visited | ${summary.apiReferencePagesVisited ?? 0} |`,
    `| docs.agora.io link occurrences | ${summary.docsLinkOccurrences ?? 0} |`,
    `| Unique docs.agora.io URLs | ${summary.uniqueDocsUrls ?? 0} |`,
    `| Page errors | ${summary.pageErrors ?? 0} |`,
  ].join('\n');
}

function renderOccurrenceTable(occurrences) {
  const rows = [
    '| Group | Entry | Source API Reference page | Anchor text | Raw href |',
    '| --- | --- | --- | --- | --- |',
  ];

  for (const occurrence of occurrences) {
    rows.push(
      `| ${escapeTable(occurrence.groupTitle)} | ${escapeTable(
        occurrence.entryTitle,
      )} | ${escapeTable(occurrence.sourceUrl)} | ${escapeTable(
        occurrence.anchorText,
      )} | ${escapeTable(occurrence.rawHref)} |`,
    );
  }

  return rows.join('\n');
}

function renderPageErrors(pageErrors) {
  if (!pageErrors?.length) {
    return '';
  }

  const rows = [
    '## Page Errors',
    '',
    '| Group | Entry | Source API Reference page | Status | Message |',
    '| --- | --- | --- | --- | --- |',
  ];

  for (const pageError of pageErrors) {
    rows.push(
      `| ${escapeTable(pageError.groupTitle)} | ${escapeTable(
        pageError.entryTitle,
      )} | ${escapeTable(pageError.sourceUrl)} | ${escapeTable(
        pageError.status,
      )} | ${escapeTable(pageError.message)} |`,
    );
  }

  return rows.join('\n');
}

export function renderMarkdownReport(report) {
  const lines = [
    '# API Reference docs.agora.io Link Audit',
    '',
    `Generated at: ${report.generatedAt ?? ''}`,
    '',
    '## Summary',
    '',
    renderSummaryTable(report.summary ?? {}),
    '',
    '## Unique docs.agora.io URLs',
  ];

  const uniqueDocsLinks = report.uniqueDocsLinks ?? report.uniqueDocsUrls ?? [];
  if (uniqueDocsLinks.length === 0) {
    lines.push('', '_No docs.agora.io URLs found._');
  }

  uniqueDocsLinks.forEach((link, index) => {
    lines.push(
      '',
      `### ${index + 1}. ${link.resolvedDocsUrl}`,
      '',
      `- Path: ${link.docsPathname ?? ''}`,
      `- Query: ${link.docsSearch ?? ''}`,
      `- Legacy redirect: ${
        link.legacyRedirectCovered
          ? 'legacy redirect covered'
          : 'legacy redirect missing'
      }`,
      `- HTTP status: ${link.status ?? ''}`,
      `- Final URL: ${link.finalUrl ?? ''}`,
      `- Error: ${link.error ?? ''}`,
      '',
      renderOccurrenceTable(link.occurrences ?? []),
    );
  });

  const pageErrors = renderPageErrors(report.pageErrors ?? []);
  if (pageErrors) {
    lines.push('', pageErrors);
  }

  return `${lines.join('\n')}\n`;
}

function toErrorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}

export async function checkDocsUrl({
  url,
  fetchImpl = globalThis.fetch,
  timeoutMs = 10000,
}) {
  const normalizedTimeoutMs = normalizePositiveNumber(timeoutMs, 10000);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), normalizedTimeoutMs);

  try {
    const response = await fetchImpl(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: controller.signal,
    });

    return {
      status: response.status,
      finalUrl: response.url || url,
    };
  } catch (error) {
    return {
      status: 0,
      finalUrl: url,
      error: toErrorMessage(error),
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function mapWithConcurrency(items, concurrency, mapper) {
  const results = new Array(items.length);
  let nextIndex = 0;

  await Promise.all(
    Array.from(
      { length: Math.min(normalizeConcurrency(concurrency), items.length) },
      async () => {
        while (nextIndex < items.length) {
          const currentIndex = nextIndex;
          nextIndex += 1;
          results[currentIndex] = await mapper(
            items[currentIndex],
            currentIndex,
          );
        }
      },
    ),
  );

  return results;
}

function applyDocsStatusResult(occurrence, statusResult) {
  for (const key of ['status', 'finalUrl', 'error']) {
    if (statusResult?.[key] !== undefined && statusResult?.[key] !== null) {
      occurrence[key] = statusResult[key];
    } else {
      delete occurrence[key];
    }
  }
}

async function readStaticRedirects() {
  return JSON.parse(
    await fs.readFile(
      path.join(rootDir, 'src/lib/legacy-sitemap/static-redirects.json'),
      'utf8',
    ),
  );
}

export async function runApiRefDocsLinksAudit({
  metaPath = path.join(rootDir, 'content/docs/en/api-reference/meta.json'),
  outBase = DEFAULT_OUT_BASE,
  fetchImpl = globalThis.fetch,
  concurrency = 4,
  timeoutMs = 10000,
  checkDocsStatus = true,
} = {}) {
  const normalizedConcurrency = normalizeConcurrency(concurrency);
  const normalizedTimeoutMs = normalizePositiveNumber(timeoutMs, 10000);
  const meta = await readApiReferenceMeta({ metaPath });
  const entries = extractApiRefEntriesFromMeta(meta);
  const legacyRedirectCoverageChecker = createLegacyRedirectCoverageChecker(
    await readStaticRedirects(),
  );

  const entryReports = await mapWithConcurrency(
    entries,
    normalizedConcurrency,
    async (entry) => {
      const entryReport = await crawlApiRefEntry({
        entry,
        fetchImpl,
        concurrency: normalizedConcurrency,
        timeoutMs: normalizedTimeoutMs,
      });

      for (const occurrence of entryReport.docsLinkOccurrences) {
        occurrence.legacyRedirectCovered = legacyRedirectCoverageChecker(
          occurrence.resolvedDocsUrl,
        );
      }

      return entryReport;
    },
  );

  if (checkDocsStatus) {
    const docsStatusTargetUrls = [
      ...new Set(
        entryReports.flatMap((entryReport) =>
          entryReport.docsLinkOccurrences.map((occurrence) =>
            normalizeDocsStatusTargetUrl(occurrence.resolvedDocsUrl),
          ),
        ),
      ),
    ];
    const statusResults = await mapWithConcurrency(
      docsStatusTargetUrls,
      normalizedConcurrency,
      (url) => checkDocsUrl({ url, fetchImpl, timeoutMs: normalizedTimeoutMs }),
    );
    const statusResultsByTargetUrl = new Map(
      docsStatusTargetUrls.map((url, index) => [url, statusResults[index]]),
    );

    for (const entryReport of entryReports) {
      for (const occurrence of entryReport.docsLinkOccurrences) {
        applyDocsStatusResult(
          occurrence,
          statusResultsByTargetUrl.get(
            normalizeDocsStatusTargetUrl(occurrence.resolvedDocsUrl),
          ),
        );
      }
    }
  }

  const report = buildAuditReport({
    generatedAt: new Date().toISOString(),
    entries: entryReports,
    legacyRedirectCoverageChecker,
  });
  await fs.mkdir(path.dirname(outBase), { recursive: true });
  await Promise.all([
    fs.writeFile(`${outBase}.json`, `${JSON.stringify(report, null, 2)}\n`),
    fs.writeFile(`${outBase}.md`, renderMarkdownReport(report)),
  ]);

  return report;
}

function parsePositiveInteger(value) {
  const parsedValue = Number(value);
  if (
    !Number.isFinite(parsedValue) ||
    parsedValue <= 0 ||
    !Number.isInteger(parsedValue)
  ) {
    return undefined;
  }

  return parsedValue;
}

function parseCliArgs(argv) {
  const options = {};

  for (const arg of argv) {
    if (arg === '--no-status') {
      options.checkDocsStatus = false;
      continue;
    }

    const [name, value] = arg.split('=', 2);
    if (value === undefined || value.length === 0) {
      continue;
    }

    if (name === '--concurrency') {
      const concurrency = parsePositiveInteger(value);
      if (concurrency !== undefined) {
        options.concurrency = concurrency;
      }
      continue;
    }

    if (name === '--timeout') {
      const timeoutMs = parsePositiveInteger(value);
      if (timeoutMs !== undefined) {
        options.timeoutMs = timeoutMs;
      }
      continue;
    }

    if (name === '--out') {
      options.outBase = path.resolve(value);
    }
  }

  return options;
}

function isDirectExecution() {
  return (
    process.argv[1] &&
    path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
  );
}

if (isDirectExecution()) {
  try {
    const report = await runApiRefDocsLinksAudit(
      parseCliArgs(process.argv.slice(2)),
    );
    console.log(
      [
        'API reference docs link audit complete.',
        `Entries: ${report.summary.apiReferenceEntries}`,
        `Pages visited: ${report.summary.apiReferencePagesVisited}`,
        `Docs link occurrences: ${report.summary.docsLinkOccurrences}`,
        `Unique docs URLs: ${report.summary.uniqueDocsUrls}`,
        `Page errors: ${report.summary.pageErrors}`,
      ].join('\n'),
    );
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
