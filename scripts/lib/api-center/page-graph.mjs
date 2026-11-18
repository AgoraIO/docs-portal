import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import * as cheerio from 'cheerio';
import { refreshManifestCounts } from './inventory.mjs';

const execFileAsync = promisify(execFile);
const CURL_META_MARKER = '\n__API_CENTER_CURL_META__\t';

function normalizeText(value) {
  return String(value ?? '')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function cleanLabel($, element) {
  const clone = $(element).clone();
  clone.find('svg').remove();
  return normalizeText(clone.text());
}

function normalizeLink(href, finalUrl) {
  if (!href) return null;
  try {
    const url = new URL(href, finalUrl);
    return {
      url: url.href,
      origin: url.origin,
      path: url.pathname,
      search: url.search,
      fragment: url.hash ? decodeFragment(url.hash.slice(1)) : null,
    };
  } catch {
    return null;
  }
}

function decodeFragment(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function parseSidebarItems($, list, finalUrl, trail = [], pages = []) {
  const items = [];
  $(list)
    .children('li')
    .each((_, listItem) => {
      const item = $(listItem);
      const classes = item.attr('class') ?? '';
      const collapsible = item.children('.menu__list-item-collapsible').first();
      const categoryLink = collapsible.find('> .menu__link').first();
      const directLink = item.children('a.menu__link').first();
      const childList = item.children('ul.menu__list').first();

      if (childList.length > 0 || classes.includes('item-category')) {
        const labelNode = categoryLink.length > 0 ? categoryLink : collapsible;
        const label = cleanLabel($, labelNode);
        const link = normalizeLink(categoryLink.attr('href'), finalUrl);
        const nextTrail = label ? [...trail, label] : trail;
        const category = {
          kind: 'category',
          label,
          link,
          items: parseSidebarItems($, childList, finalUrl, nextTrail, pages),
        };
        items.push(category);
        if (link && isCurrentDocLink(link)) {
          pages.push({
            kind: 'page',
            label,
            trail,
            ...link,
          });
        }
        return;
      }

      if (directLink.length === 0) return;
      const label = cleanLabel($, directLink);
      const link = normalizeLink(directLink.attr('href'), finalUrl);
      const excludedReason = classes.includes('custom-return-link')
        ? 'return-to-guide'
        : classes.includes('custom-external-link')
          ? 'cross-entry-link'
          : null;
      const linkItem = {
        kind: 'link',
        label,
        link,
        excludedReason,
      };
      items.push(linkItem);
      if (!excludedReason && link && isCurrentDocLink(link)) {
        pages.push({ kind: 'page', label, trail, ...link });
      }
    });
  return items;
}

function isCurrentDocLink(link) {
  return (
    link.origin === 'https://doc.shengwang.cn' &&
    (link.path.startsWith('/api-ref/') || link.path.startsWith('/doc/'))
  );
}

function uniquePages(pages) {
  const result = [];
  const seen = new Set();
  for (const page of pages) {
    const key = `${page.path}${page.search}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push({ ...page, order: result.length });
  }
  return result;
}

function extractArticleLinks($, article, finalUrl) {
  const internal = [];
  const external = [];
  const seen = new Set();
  $(article)
    .find('a[href]')
    .each((_, anchor) => {
      const link = normalizeLink($(anchor).attr('href'), finalUrl);
      if (!link || seen.has(link.url)) return;
      seen.add(link.url);
      const record = { label: cleanLabel($, anchor), ...link };
      if (isCurrentDocLink(link)) internal.push(record);
      else external.push(record);
    });
  return { internal, external };
}

export function parseLegacyPageHtml({ html, requestedUrl, finalUrl, status }) {
  const $ = cheerio.load(html);
  const warnings = [];
  const article = $('article').first();
  const sidebarRoot = $('nav.menu ul.theme-doc-sidebar-menu').first();
  const pages = [];
  const navigation =
    sidebarRoot.length > 0
      ? parseSidebarItems($, sidebarRoot, finalUrl, [], pages)
      : [];
  const bodyText = normalizeText(article.text());
  const title = normalizeText($('h1').first().text() || $('title').first().text());
  const final = new URL(finalUrl);
  const requested = new URL(requestedUrl);

  if (status >= 400) {
    warnings.push({
      code: 'http-error',
      severity: 'error',
      message: `HTTP ${status} for ${requestedUrl}.`,
    });
  }
  if (requested.pathname !== final.pathname) {
    warnings.push({
      code: 'entry-redirect',
      severity: 'warning',
      message: `${requested.pathname} redirected to ${final.pathname}.`,
    });
  }
  if (article.length === 0 || bodyText.length < 20) {
    warnings.push({
      code: 'empty-or-missing-article',
      severity: 'error',
      message: 'No substantive article body was found.',
    });
  }
  if (sidebarRoot.length === 0) {
    warnings.push({
      code: 'missing-sidebar',
      severity: 'warning',
      message: 'No legacy sidebar was found; treat this as a single-page entry.',
    });
  }

  const fragments = [];
  article.find('[id]').each((_, element) => {
    const id = $(element).attr('id');
    if (id && !fragments.includes(id)) fragments.push(id);
  });

  const links = extractArticleLinks($, article, finalUrl);
  const unique = uniquePages(pages);
  if (
    !unique.some((page) => page.path === final.pathname) &&
    article.length > 0
  ) {
    unique.unshift({
      kind: 'page',
      label: title,
      trail: [],
      url: final.href,
      origin: final.origin,
      path: final.pathname,
      search: final.search,
      fragment: null,
      order: 0,
      discoveredFrom: 'entry-page',
    });
    for (let index = 1; index < unique.length; index++) {
      unique[index].order = index;
    }
  }

  const errorWarnings = warnings.filter(
    (warning) => warning.severity === 'error',
  );
  return {
    status:
      errorWarnings.length > 0
        ? 'failed'
        : warnings.length > 0
          ? 'warning'
          : 'resolved',
    requestedUrl,
    finalUrl: final.href,
    httpStatus: status,
    title,
    bodyHash: sha256(bodyText),
    bodyLength: bodyText.length,
    fragments,
    navigation,
    navigationHash: sha256(JSON.stringify(navigation)),
    pages: unique,
    pageCount: unique.length,
    landingPageLinks: links,
    warnings,
  };
}

export async function mapWithConcurrency(values, concurrency, callback) {
  const results = new Array(values.length);
  let nextIndex = 0;
  async function worker() {
    while (nextIndex < values.length) {
      const index = nextIndex++;
      results[index] = await callback(values[index], index);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(concurrency, values.length) }, () => worker()),
  );
  return results;
}

export function routeScopeRoot(urlValue) {
  const url = new URL(urlValue);
  const segments = url.pathname.split('/').filter(Boolean);
  if (
    segments.length < 3 ||
    (segments[0] !== 'api-ref' && segments[0] !== 'doc')
  ) {
    return null;
  }
  return `/${segments.slice(0, 3).join('/')}/`;
}

export function parseBodyPageEvidence({ html, requestedUrl, finalUrl, status }) {
  const $ = cheerio.load(html);
  const article = $('article').first();
  const bodyText = normalizeText(article.text());
  const title = normalizeText($('h1').first().text() || $('title').first().text());
  const warnings = [];
  const requested = new URL(requestedUrl);
  const final = new URL(finalUrl);
  if (status >= 400) {
    warnings.push({
      code: 'http-error',
      severity: 'error',
      message: `HTTP ${status} for ${requestedUrl}.`,
    });
  }
  if (requested.pathname !== final.pathname) {
    warnings.push({
      code: 'page-redirect',
      severity: 'warning',
      message: `${requested.pathname} redirected to ${final.pathname}.`,
    });
  }
  if (article.length === 0 || bodyText.length < 20) {
    warnings.push({
      code: 'empty-or-missing-article',
      severity: 'error',
      message: 'No substantive article body was found.',
    });
  }
  const fragments = [];
  article.find('[id]').each((_, element) => {
    const id = $(element).attr('id');
    if (id && !fragments.includes(id)) fragments.push(id);
  });
  const links = extractArticleLinks($, article, finalUrl);
  return {
    requestedUrl,
    finalUrl: final.href,
    httpStatus: status,
    status: warnings.some((warning) => warning.severity === 'error')
      ? 'failed'
      : warnings.length > 0
        ? 'warning'
        : 'resolved',
    title,
    bodyHash: sha256(bodyText),
    bodyLength: bodyText.length,
    fragments,
    internalLinks: links.internal,
    externalLinkCount: links.external.length,
    warnings,
  };
}

function pageKey(urlValue) {
  const url = new URL(urlValue);
  url.hash = '';
  return url.href;
}

function withinScope(link, scopeRoot) {
  return (
    link.origin === 'https://doc.shengwang.cn' &&
    link.path.startsWith(scopeRoot)
  );
}

export async function crawlBodyLinkClosure(
  manifest,
  { concurrency = 4, fetchImpl = fetch, onProgress = () => {} } = {},
) {
  const scopes = new Map();
  for (const entry of manifest.entries) {
    if (entry.scope !== 'current') continue;
    const scopeRoot = routeScopeRoot(entry.legacyUrl);
    if (!scopeRoot) continue;
    if (!scopes.has(scopeRoot)) {
      scopes.set(scopeRoot, { entries: [], seeds: new Set() });
    }
    const scope = scopes.get(scopeRoot);
    scope.entries.push(entry);
    scope.seeds.add(pageKey(entry.legacyUrl));
    for (const page of entry.pageGraph.pages ?? []) {
      if (page.path?.startsWith(scopeRoot)) scope.seeds.add(pageKey(page.url));
    }
  }

  const evidence = new Map();
  const pageScope = new Map();
  let frontier = [];
  for (const [scopeRoot, scope] of scopes) {
    for (const seed of scope.seeds) {
      frontier.push(seed);
      pageScope.set(seed, scopeRoot);
    }
  }
  const queued = new Set(frontier);
  let processed = 0;

  while (frontier.length > 0) {
    const batch = frontier;
    frontier = [];
    const results = await mapWithConcurrency(
      batch,
      concurrency,
      async (requestedUrl) => {
        const scopeRoot = pageScope.get(requestedUrl);
        try {
          const response = await fetchImpl(requestedUrl, {
            headers: {
              'user-agent':
                'Agora-docs-portal-api-center-inventory/1.0 (+https://github.com/AgoraIO/docs-portal)',
            },
            redirect: 'follow',
          });
          const page = parseBodyPageEvidence({
            html: await response.text(),
            requestedUrl,
            finalUrl: response.url || requestedUrl,
            status: response.status,
          });
          return { page, scopeRoot };
        } catch (error) {
          return {
            scopeRoot,
            page: {
              requestedUrl,
              finalUrl: null,
              httpStatus: null,
              status: 'failed',
              title: null,
              bodyHash: null,
              bodyLength: 0,
              fragments: [],
              internalLinks: [],
              externalLinkCount: 0,
              warnings: [
                {
                  code: 'fetch-failed',
                  severity: 'error',
                  message: error.message,
                },
              ],
            },
          };
        }
      },
    );

    for (const { page, scopeRoot } of results) {
      const key = pageKey(page.requestedUrl);
      evidence.set(key, { ...page, scopeRoot });
      processed += 1;
      for (const link of page.internalLinks) {
        if (!withinScope(link, scopeRoot)) continue;
        const target = pageKey(link.url);
        if (queued.has(target)) continue;
        queued.add(target);
        pageScope.set(target, scopeRoot);
        frontier.push(target);
      }
      onProgress({ processed, queued: queued.size, page });
    }
  }

  const orderedEvidence = [...evidence.values()].sort((left, right) =>
    left.requestedUrl.localeCompare(right.requestedUrl),
  );
  manifest.pageEvidence = orderedEvidence;
  return finalizeBodyClosure(manifest);
}

function seedPageKeys(manifest) {
  const seeds = new Set();
  for (const entry of manifest.entries) {
    if (entry.scope !== 'current') continue;
    seeds.add(pageKey(entry.legacyUrl));
    for (const page of entry.pageGraph.pages ?? []) {
      if (page.url) seeds.add(pageKey(page.url));
    }
  }
  return seeds;
}

function identifyHtmlAliases(evidenceMap) {
  for (const [key, page] of evidenceMap) {
    if (page.aliasOf) continue;
    const url = new URL(key);
    if (!url.pathname.endsWith('.html')) continue;
    url.pathname = url.pathname.slice(0, -'.html'.length);
    const candidate = evidenceMap.get(url.href);
    if (candidate && candidate.bodyHash && candidate.bodyHash === page.bodyHash) {
      page.aliasOf = candidate.requestedUrl;
    }
  }
}

function canonicalEvidenceKey(key, evidenceMap) {
  return evidenceMap.get(key)?.aliasOf ?? key;
}

export function finalizeBodyClosure(manifest) {
  if (!Array.isArray(manifest.pageEvidence)) {
    throw new Error('Manifest has no pageEvidence to finalize.');
  }
  const seeds = seedPageKeys(manifest);
  const evidenceMap = new Map(
    manifest.pageEvidence.map((page) => [pageKey(page.requestedUrl), page]),
  );
  for (const [key, page] of evidenceMap) {
    page.discoveredFrom = seeds.has(key) ? 'sidebar-or-entry' : 'body-link';
    if (
      page.discoveredFrom === 'body-link' &&
      page.status === 'failed' &&
      Number.isInteger(page.httpStatus) &&
      page.httpStatus >= 400
    ) {
      page.status = 'warning';
      page.warnings = [
        {
          code: 'broken-live-body-link',
          severity: 'warning',
          message: `The live source links to ${page.requestedUrl}, which returns HTTP ${page.httpStatus}.`,
        },
      ];
    }
  }
  identifyHtmlAliases(evidenceMap);

  const fragmentWarnings = [];
  const seenFragmentWarnings = new Set();
  for (const [sourceKey, page] of evidenceMap) {
    if (page.aliasOf) continue;
    for (const linkValue of page.internalLinks ?? []) {
      const link =
        typeof linkValue === 'string'
          ? normalizeLink(linkValue, page.finalUrl ?? page.requestedUrl)
          : linkValue;
      if (!link) continue;
      if (!link.fragment || !withinScope(link, page.scopeRoot)) continue;
      const targetKey = canonicalEvidenceKey(pageKey(link.url), evidenceMap);
      const target = evidenceMap.get(targetKey);
      if (!target || target.fragments.includes(link.fragment)) continue;
      const warningKey = `${sourceKey}\u001f${targetKey}\u001f${link.fragment}`;
      if (seenFragmentWarnings.has(warningKey)) continue;
      seenFragmentWarnings.add(warningKey);
      fragmentWarnings.push({
        code: 'missing-live-fragment',
        severity: 'warning',
        sourceUrl: sourceKey,
        targetUrl: targetKey,
        fragment: link.fragment,
        message: `${link.fragment} was linked but not found on the live target page.`,
      });
    }
  }

  const orderedEvidence = [...evidenceMap.values()].sort((left, right) =>
    left.requestedUrl.localeCompare(right.requestedUrl),
  );
  manifest.pageEvidence = orderedEvidence;
  manifest.entries = manifest.entries.map((entry) => {
    if (entry.scope !== 'current') return entry;
    const scopeRoot = routeScopeRoot(entry.legacyUrl);
    const scopePages = orderedEvidence.filter(
      (page) => page.scopeRoot === scopeRoot,
    );
    const failed = scopePages.filter((page) => page.status === 'failed').length;
    const warning = scopePages.filter((page) => page.status === 'warning').length;
    const logicalPages = scopePages.filter((page) => !page.aliasOf);
    return {
      ...entry,
      pageGraph: {
        ...entry.pageGraph,
        closure: {
          status: failed > 0 ? 'failed' : warning > 0 ? 'warning' : 'resolved',
          scopeRoot,
          pageCount: scopePages.length,
          logicalPageCount: logicalPages.length,
          failedPageCount: failed,
          warningPageCount: warning,
        },
      },
    };
  });
  manifest.pageGraphSummary = {
    ...manifest.pageGraphSummary,
    closurePageCount: orderedEvidence.length,
    closureLogicalPageCount: orderedEvidence.filter((page) => !page.aliasOf)
      .length,
    closureResolvedCount: orderedEvidence.filter(
      (page) => page.status === 'resolved',
    ).length,
    closureWarningCount: orderedEvidence.filter(
      (page) => page.status === 'warning',
    ).length,
    closureFailedCount: orderedEvidence.filter(
      (page) => page.status === 'failed',
    ).length,
    fragmentWarningCount: fragmentWarnings.length,
    fragmentWarnings,
  };
  manifest.pageEvidence = orderedEvidence.map((page) => {
    if (page.aliasOf) {
      return {
        requestedUrl: page.requestedUrl,
        aliasOf: page.aliasOf,
        scopeRoot: page.scopeRoot,
        discoveredFrom: page.discoveredFrom,
        status: page.status,
      };
    }
    const compact = { ...page };
    if (compact.finalUrl === compact.requestedUrl) delete compact.finalUrl;
    compact.internalLinks = (compact.internalLinks ?? []).map((link) =>
      typeof link === 'string' ? link : link.url,
    );
    if (compact.externalLinkCount === 0) delete compact.externalLinkCount;
    if (compact.warnings?.length === 0) delete compact.warnings;
    return compact;
  });
  return manifest;
}

export async function crawlManifestEntries(
  manifest,
  { concurrency = 4, fetchImpl = fetch, onProgress = () => {} } = {},
) {
  const crawlEntries = manifest.entries.filter(
    (entry) => entry.scope === 'current',
  );
  const graphById = new Map();
  await mapWithConcurrency(crawlEntries, concurrency, async (entry, index) => {
    try {
      const response = await fetchImpl(entry.legacyUrl, {
        headers: {
          'user-agent':
            'Agora-docs-portal-api-center-inventory/1.0 (+https://github.com/AgoraIO/docs-portal)',
        },
        redirect: 'follow',
      });
      const graph = parseLegacyPageHtml({
        html: await response.text(),
        requestedUrl: entry.legacyUrl,
        finalUrl: response.url || entry.legacyUrl,
        status: response.status,
      });
      graphById.set(entry.id, graph);
      onProgress({ entry, graph, completed: index + 1, total: crawlEntries.length });
    } catch (error) {
      const graph = {
        status: 'failed',
        requestedUrl: entry.legacyUrl,
        finalUrl: null,
        httpStatus: null,
        title: null,
        bodyHash: null,
        bodyLength: 0,
        fragments: [],
        navigation: [],
        navigationHash: null,
        pages: [],
        pageCount: 0,
        landingPageLinks: { internal: [], external: [] },
        warnings: [
          {
            code: 'fetch-failed',
            severity: 'error',
            message: error.message,
          },
        ],
      };
      graphById.set(entry.id, graph);
      onProgress({ entry, graph, completed: index + 1, total: crawlEntries.length });
    }
  });

  manifest.entries = manifest.entries.map((entry) => ({
    ...entry,
    pageGraph: graphById.get(entry.id) ?? entry.pageGraph,
  }));
  refreshManifestCounts(manifest);
  manifest.pageGraphSummary = {
    entryCount: crawlEntries.length,
    uniquePageCount: new Set(
      manifest.entries.flatMap((entry) =>
        entry.pageGraph.pages.map((page) => `${page.path}${page.search}`),
      ),
    ).size,
    warningCounts: Object.fromEntries(
      Object.entries(
        manifest.entries
          .flatMap((entry) => entry.pageGraph.warnings)
          .reduce((counts, warning) => {
            counts[warning.code] = (counts[warning.code] ?? 0) + 1;
            return counts;
          }, {}),
      ).sort(([left], [right]) => left.localeCompare(right)),
    ),
  };
  return manifest;
}

export function parseCurlOutput(stdout, url) {
  const markerIndex = stdout.lastIndexOf(CURL_META_MARKER);
  if (markerIndex === -1) {
    throw new Error(`curl returned no response metadata for ${url}.`);
  }
  const html = stdout.slice(0, markerIndex);
  const [statusText, finalUrl] = stdout
    .slice(markerIndex + CURL_META_MARKER.length)
    .trim()
    .split('\t');
  const status = Number(statusText);
  if (!Number.isInteger(status) || !finalUrl) {
    throw new Error(`curl returned invalid response metadata for ${url}.`);
  }
  return {
    status,
    url: finalUrl,
    text: async () => html,
  };
}

export async function curlFetch(url) {
  const { stdout } = await execFileAsync(
    'curl',
    [
      '--location',
      '--silent',
      '--show-error',
      '--retry',
      '2',
      '--retry-all-errors',
      '--connect-timeout',
      '15',
      '--max-time',
      '90',
      '--user-agent',
      'Agora-docs-portal-api-center-inventory/1.0 (+https://github.com/AgoraIO/docs-portal)',
      '--write-out',
      `${CURL_META_MARKER}%{http_code}\t%{url_effective}`,
      url,
    ],
    { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
  );
  return parseCurlOutput(stdout, url);
}
