#!/usr/bin/env bun
import { execFileSync, spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import {
  createPlatformQueryIndex,
  getPlatformForUrl,
  resolvePlatformQueryUrl,
} from '../src/lib/platforms/query-route.ts';
import { normalizePlatformKey } from '../src/lib/platforms/registry.ts';
import {
  hasPlatformQueryScope,
  sameQuery,
} from './lib/cn-link-audit/browser.mjs';
import {
  declaredRedirectUrl,
  loadBuiltSite,
  validateLocalTarget,
} from './lib/cn-link-audit/built.mjs';
import {
  inventorySources,
  LOCAL_ORIGIN,
  listFiles,
  publicPath,
  resolveOccurrence,
} from './lib/cn-link-audit/inventory.mjs';
import { probeUrls } from './lib/cn-link-audit/network.mjs';
import { summarizeReport, writeReport } from './lib/cn-link-audit/report.mjs';

const docsRoots = new Set([
  'ai',
  'api-reference',
  'introduction',
  'realtime-media',
  'reference',
  'solutions',
]);
const trimSlash = (value) => value.replace(/\/+$/, '') || '/';
const routeKey = (value) =>
  trimSlash(publicPath(new URL(value, LOCAL_ORIGIN).pathname));
const sourceFingerprintPaths = [
  'content/docs',
  'content/openapi',
  'src',
  'source.config.ts',
  'vite.config.ts',
  'package.json',
  'bun.lock',
  'patches',
  'scripts',
];
export function fingerprintSources(repoRoot) {
  const hash = createHash('sha256');
  for (const name of sourceFingerprintPaths) {
    const absolute = path.join(repoRoot, name);
    if (!fs.existsSync(absolute)) continue;
    const files = fs.statSync(absolute).isFile()
      ? [absolute]
      : listFiles(absolute);
    for (const file of files)
      hash
        .update(path.relative(repoRoot, file))
        .update('\0')
        .update(fs.readFileSync(file))
        .update('\0');
  }
  let assets;
  try {
    assets = execFileSync(
      'git',
      [
        'ls-files',
        '-z',
        '--cached',
        '--others',
        '--exclude-standard',
        '--',
        'public',
      ],
      { cwd: repoRoot, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
    )
      .split('\0')
      .filter(Boolean)
      .map((file) => path.join(repoRoot, file));
  } catch {
    assets = listFiles(path.join(repoRoot, 'public')).filter(
      (file) => !/\/(?:__static|zh-CN|en|openapi)\//.test(file),
    );
  }
  for (const file of assets.sort())
    if (fs.existsSync(file))
      hash
        .update(path.relative(repoRoot, file))
        .update('\0')
        .update(fs.readFileSync(file))
        .update('\0');
  return hash.digest('hex');
}

export function fingerprintArtifacts(
  repoRoot,
  htmlRoot = 'dist/client',
  manifestPath = 'public/__static/docs-routes.json',
) {
  const hash = createHash('sha256');
  const files = [
    path.resolve(repoRoot, manifestPath),
    ...listFiles(path.resolve(repoRoot, htmlRoot)).filter(
      (file) => path.basename(file) !== 'cn-link-build.json',
    ),
  ];
  for (const file of files)
    hash
      .update(path.relative(repoRoot, file))
      .update('\0')
      .update(fs.readFileSync(file))
      .update('\0');
  return hash.digest('hex');
}

function networkUrlFor(row, origin) {
  if (
    !row.target ||
    row.status === 'not-applicable' ||
    ['malformed-url', 'unsupported-protocol', 'unexpanded-template'].includes(
      row.reason,
    )
  )
    return undefined;
  try {
    const url = new URL(row.target, origin);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
}

function staticResult(link, resolved, inventory, repoRoot) {
  if (resolved.status) return resolved;
  if (resolved.external)
    return { status: 'unverified', reason: 'network-not-checked' };
  const page = inventory.routes.get(trimSlash(resolved.pathname));
  if (page)
    return {
      status: resolved.hash ? 'unverified' : 'valid',
      reason: resolved.hash
        ? 'anchor-needs-rendered-content'
        : 'source-route-exists',
      sourceTarget: page.sourcePath,
      verificationLevel: 'source-only',
    };
  const root = path.resolve(repoRoot, 'public');
  const file = path.resolve(root, `.${resolved.pathname}`);
  if (!file.startsWith(`${root}${path.sep}`))
    return { status: 'broken', reason: 'unsafe-resource-path' };
  if (fs.existsSync(file) && fs.statSync(file).isFile())
    return { status: 'unverified', reason: 'resource-needs-published-check' };
  if (link.kind === 'resource' || path.extname(resolved.pathname))
    return { status: 'unverified', reason: 'resource-not-found-in-public' };
  return {
    status: 'unverified',
    reason: docsRoots.has(resolved.pathname.split('/')[1])
      ? 'route-not-in-source-index'
      : 'application-route-needs-http',
  };
}

function normalizedLink(link, origin) {
  const resolved = resolveOccurrence(link);
  if (resolved.external && origin) {
    try {
      const url = new URL(resolved.target);
      if (url.origin === origin)
        return {
          ...resolved,
          external: false,
          target: `${url.pathname}${url.search}${url.hash}`,
          pathname: decodeURIComponent(url.pathname),
          hash: url.hash,
        };
    } catch (error) {
      return {
        ...resolved,
        status: 'broken',
        reason: 'malformed-url',
        detail: error.message,
      };
    }
  }
  return resolved;
}

function evidenceKey(link, origin, site) {
  const resolved = normalizedLink(link, origin);
  if (!resolved.target) return undefined;
  // Public locale rewriting is compared only for source reconciliation; the
  // rendered href itself is still checked exactly over HTTP.
  const target = resolved.external
    ? resolved.target
    : publicPath(resolved.target);
  const entry = site?.routes?.get(routeKey(link.pageUrl));
  return `${routeKey(entry?.canonicalPath ?? link.pageUrl)}\0${link.kind}\0${target}`;
}

function bindSourcePlatformContexts(links, site, gaps) {
  const platformsByPage = new Map();
  for (const [pageUrl, entry] of site?.routes ?? []) {
    if (!entry.platform || !entry.canonicalPath) continue;
    const key = `${routeKey(entry.canonicalPath)}\0${normalizePlatformKey(entry.platform)}`;
    if (!platformsByPage.has(key)) platformsByPage.set(key, []);
    platformsByPage.get(key).push(pageUrl);
  }
  return links.flatMap((link) => {
    if (link.platform === undefined) return [link];
    const sourcePageUrl = link.pageUrl;
    const sourceRoute = site?.routes.get(routeKey(sourcePageUrl));
    const canonical = routeKey(sourceRoute?.canonicalPath ?? sourcePageUrl);
    const rawPlatforms = Array.isArray(link.platform)
      ? link.platform
      : [link.platform];
    const platforms = [
      ...new Set(
        rawPlatforms.map((platform) =>
          typeof platform === 'string'
            ? normalizePlatformKey(platform)
            : 'unknown',
        ),
      ),
    ];
    // Static inventory has no published-route evidence and retains one source row.
    const contexts = site
      ? platforms.length
        ? platforms
        : ['unknown']
      : [
          typeof link.platform === 'string'
            ? normalizePlatformKey(link.platform)
            : link.platform,
        ];
    return contexts.map((platformContext) => {
      const candidates =
        platformsByPage.get(`${canonical}\0${platformContext}`) ?? [];
      const platformContextStatus = !site
        ? 'not-checked'
        : candidates.length === 1
          ? 'published-route'
          : candidates.length > 1
            ? 'ambiguous-platform-route'
            : 'unpublished-platform';
      if (platformContextStatus !== 'published-route')
        gaps.push({
          sourcePath: link.sourcePath,
          line: link.line,
          pageUrl: sourcePageUrl,
          platformContext,
          reason: 'source-platform-context-unresolved',
          detail: platformContextStatus,
        });
      return {
        ...link,
        sourcePageUrl,
        pageUrl:
          platformContextStatus === 'published-route'
            ? candidates[0]
            : sourcePageUrl,
        platformContext,
        platformContextSource: 'source-platform',
        platformContextStatus,
      };
    });
  });
}

/**
 * @param {{repoRoot?: string, mode?: string, match?: string, origin?: string, output?: string,
 * htmlRoot?: string, manifestPath?: string, browser?: boolean, maxStates?: number,
 * concurrency?: number, timeoutMs?: number, retries?: number,
 * onProgress?: (progress: any) => void, inventory?: any, site?: any,
 * networkProbe?: (targets: string[], options?: any) => Promise<Map<string, any>>,
 * requireProvenance?: boolean}} [options]
 */
export async function runAudit({
  repoRoot = process.cwd(),
  mode = 'static',
  match = 'artifact',
  origin,
  output = '.agent/artifacts/cn-links',
  htmlRoot = 'dist/client',
  manifestPath = 'public/__static/docs-routes.json',
  browser = true,
  maxStates = 128,
  concurrency = 8,
  timeoutMs = 10000,
  retries = 1,
  onProgress = () => {},
  inventory: suppliedInventory,
  site: suppliedSite,
  networkProbe = probeUrls,
  requireProvenance = true,
} = {}) {
  if (!['static', 'built', 'full'].includes(mode))
    throw new Error('mode must be static, built, or full');
  if (!['artifact', 'content'].includes(match))
    throw new Error('match must be artifact or content');
  if (origin) {
    const url = new URL(origin);
    if (
      !['http:', 'https:'].includes(url.protocol) ||
      url.username ||
      url.password ||
      url.pathname !== '/' ||
      url.search ||
      url.hash
    )
      throw new Error(
        'origin must be an HTTP(S) origin without path, credentials, query, or hash',
      );
    origin = url.origin;
  }
  if (mode === 'full' && !origin)
    throw new Error('full mode requires --origin for this build');
  const checkedAt = new Date().toISOString();
  let commit = 'unknown';
  try {
    commit = execFileSync('git', ['rev-parse', 'HEAD'], {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {}
  const inventory =
    suppliedInventory ?? inventorySources({ repoRoot, onProgress });
  const gaps = [...inventory.gaps];
  const site =
    mode === 'static'
      ? undefined
      : (suppliedSite ??
        loadBuiltSite({
          repoRoot,
          htmlRoot,
          manifestPath,
          expectedRoutes: inventory.routes,
          onProgress,
        }));
  const platformIndex = createPlatformQueryIndex(site?.routes?.values() ?? []);
  const sourceLinks = bindSourcePlatformContexts(inventory.links, site, gaps);
  const coverage = {
    ...inventory.counts,
    expectedPages: site?.routes?.size ?? inventory.routes.size,
    checkedPages: 0,
    physicalSourceLinks: inventory.links.length,
    sourceContextLinks: sourceLinks.length,
    sourceLinks: sourceLinks.length,
    renderedLinks: site?.links.length ?? 0,
    sourceLinksObserved: 0,
    browserPages: 0,
    networkTargets: 0,
  };
  if (site) gaps.push(...site.gaps);
  if (mode !== 'full')
    gaps.push({
      reason: 'network-not-checked',
      detail: 'Run full mode against this build to verify public reachability.',
    });
  if (!site)
    gaps.push({
      reason: 'rendered-content-not-checked',
      detail: 'Run built or full mode using a complete CN build.',
    });
  if (site && requireProvenance) {
    try {
      const proof = JSON.parse(
        fs.readFileSync(
          path.resolve(repoRoot, htmlRoot, 'cn-link-build.json'),
          'utf8',
        ),
      );
      if (
        proof.region !== 'cn' ||
        proof.fingerprint !== fingerprintSources(repoRoot) ||
        proof.artifacts !==
          fingerprintArtifacts(repoRoot, htmlRoot, manifestPath)
      )
        gaps.push({
          reason: 'stale-or-non-cn-build',
          detail: 'Run with --build to produce matching CN artifacts.',
        });
    } catch {
      gaps.push({
        reason: 'build-provenance-missing',
        detail:
          'Run with --build; existing output alone does not prove it belongs to this source revision.',
      });
    }
  }
  const rendered = [...(site?.links ?? [])];
  if (site && mode === 'full') {
    const pagesToInspect = new Set(
      [...site.pages.values()]
        .filter((page) => page.interactive)
        .map((page) => page.pageUrl),
    );
    for (const doc of inventory.documents)
      if (doc.states?.length) pagesToInspect.add(doc.pageUrl);
    for (const gap of inventory.gaps)
      if (gap.pageUrl && /dynamic|module|spread/.test(gap.reason))
        pagesToInspect.add(gap.pageUrl);
    for (const scope of new Set(
      inventory.links
        .filter((link) => link.metadataScope)
        .map((link) => link.metadataScope),
    )) {
      const page = [...site.pages.keys()].find(
        (url) => url === scope || url.startsWith(`${scope}/`),
      );
      if (page) pagesToInspect.add(page);
    }
    if (pagesToInspect.size && browser) {
      const { inspectBrowserPages } = await import(
        './lib/cn-link-audit/browser.mjs'
      );
      const evidence = await inspectBrowserPages([...pagesToInspect], {
        origin,
        maxStates,
        timeoutMs,
        onProgress,
      });
      rendered.push(...evidence.links);
      gaps.push(...evidence.gaps);
      coverage.browserPages = evidence.pages.size;
      fs.mkdirSync(path.resolve(repoRoot, output), { recursive: true });
      fs.writeFileSync(
        path.resolve(repoRoot, output, 'browser-evidence.json'),
        JSON.stringify(
          {
            commit,
            checkedAt,
            origin,
            pages: [...evidence.pages],
            gaps: evidence.gaps,
          },
          null,
          2,
        ),
      );
      // Dynamic expressions still require source attribution; browser enumeration
      // cannot prove a data-dependent expression has exhausted its data domain.
    } else if (pagesToInspect.size)
      gaps.push({
        reason: 'interactive-states-not-checked',
        detail: `${pagesToInspect.size} pages require --browser (default in full mode).`,
      });
  } else if (site) {
    const interactive = [...site.pages.values()].filter(
      (page) => page.interactive,
    ).length;
    if (interactive)
      gaps.push({
        reason: 'interactive-states-not-checked',
        detail: `${interactive} pages require full mode with browser.`,
      });
  }
  coverage.renderedLinks = rendered.length;
  const observed = new Set(
    rendered.map((link) => evidenceKey(link, origin, site)).filter(Boolean),
  );
  const observedContexts = new Set(
    rendered
      .filter((link) => link.visible !== false)
      .map(
        (link) =>
          `${routeKey(link.pageUrl)}\0${evidenceKey(link, origin, site)}`,
      ),
  );
  const observedByPage = new Map();
  for (const link of rendered) {
    if (!observedByPage.has(link.pageUrl))
      observedByPage.set(link.pageUrl, new Set());
    observedByPage
      .get(link.pageUrl)
      .add(publicPath(normalizedLink(link, origin).target ?? ''));
  }
  const records = [];
  for (const link of [...sourceLinks, ...rendered]) {
    const resolved = normalizedLink(link, origin);
    const platformTarget =
      site &&
      !resolved.external &&
      !resolved.status &&
      link.kind !== 'resource' &&
      resolved.target
        ? resolvePlatformQueryUrl(
            new URL(resolved.target, origin ?? LOCAL_ORIGIN),
            platformIndex,
          )
        : null;
    const localResolved = platformTarget
      ? {
          ...resolved,
          pathname: decodeURIComponent(platformTarget.pathname),
          hash: platformTarget.hash,
        }
      : resolved;
    const local = resolved.status
      ? resolved
      : resolved.external
        ? { status: 'unverified', reason: 'network-not-checked' }
        : site
          ? validateLocalTarget(link, localResolved, site, {
              repoRoot,
              htmlRoot,
            })
          : staticResult(link, resolved, inventory, repoRoot);
    const record = {
      ...link,
      ...resolved,
      ...local,
      checkedAt,
      resourceTarget:
        link.kind === 'resource' ||
        Boolean(
          local.filePath &&
            !site?.pages.has(trimSlash(localResolved.pathname ?? '')),
        ),
    };
    if (site && link.source !== 'rendered') {
      record.observedInRenderedContent =
        link.source === 'metadata'
          ? [...observedByPage].some(
              ([pageUrl, targets]) =>
                (pageUrl === link.metadataScope ||
                  pageUrl.startsWith(`${link.metadataScope}/`)) &&
                targets.has(publicPath(resolved.target ?? '')),
            )
          : link.platformContextStatus
            ? link.platformContextStatus === 'published-route' &&
              observedContexts.has(
                `${routeKey(link.pageUrl)}\0${evidenceKey(link, origin, site)}`,
              )
            : observed.has(evidenceKey(link, origin, site));
      if (record.observedInRenderedContent) coverage.sourceLinksObserved++;
      else
        gaps.push({
          sourcePath: link.sourcePath,
          line: link.line,
          pageUrl: link.pageUrl,
          reason: 'source-link-not-observed',
          detail: link.href,
        });
    }
    records.push(record);
  }
  if (site) {
    for (const [pageUrl, page] of site.pages)
      records.push({
        source: 'page',
        sourcePath: page.filePath,
        pageUrl,
        href: pageUrl,
        kind: 'page',
        target: pageUrl,
        pathname: pageUrl,
        external: false,
        status: page.hasDocsBody ? 'valid' : 'unverified',
        reason: page.hasDocsBody ? 'built-page' : page.reason,
        checkedAt,
      });
    coverage.checkedPages = [...site.pages.values()].filter(
      (page) => page.hasDocsBody,
    ).length;
  }
  const distinctNetworkUrls = new Set();
  if (mode === 'full') {
    for (const row of records) {
      const url = networkUrlFor(row, origin);
      if (url) distinctNetworkUrls.add(url);
    }
    coverage.networkTargets = distinctNetworkUrls.size;
    const network = await networkProbe([...distinctNetworkUrls], {
      concurrency,
      timeoutMs,
      retries,
      onProgress: (progress) => onProgress({ phase: 'network', ...progress }),
    });
    // Save deduplicated evidence once, rather than repeating large anchor lists
    // and redirect bodies in each of the tens of thousands of occurrences.
    fs.mkdirSync(path.resolve(repoRoot, output), { recursive: true });
    fs.writeFileSync(
      path.resolve(repoRoot, output, 'network-evidence.json'),
      JSON.stringify(
        { commit, checkedAt, origin, match, results: [...network] },
        null,
        2,
      ),
    );
    const browserTargets = new Set();
    const browserExpectedUrls = new Map();
    for (const row of records) {
      if (!row.target || row.status === 'not-applicable') continue;
      const url = networkUrlFor(row, origin);
      if (!url) continue;
      const localFailure =
        row.status === 'broken' ||
        (row.resourceTarget &&
          ['empty-local-resource', 'html-in-local-resource'].includes(
            row.reason,
          ));
      const evidence = network.get(url);
      if (!evidence) {
        row.networkStatus = 'unverified';
        row.networkReason = 'network-evidence-missing';
        if (!localFailure) {
          row.status = 'unverified';
          row.reason = 'network-evidence-missing';
        }
        row.networkEvidenceUrl = url;
        continue;
      }
      row.networkEvidenceUrl = url;
      row.networkStatus = evidence.status;
      row.networkReason = evidence.reason;
      row.httpStatus = evidence.httpStatus;
      row.finalUrl = evidence.finalUrl;
      row.checkedAt = evidence.checkedAt;
      // A preview may retain resources absent from this build. HTTP evidence
      // supplements, but cannot erase, deterministic source/build failures.
      if (localFailure) continue;
      const original = new URL(url);
      const declared =
        !row.external && !row.resourceTarget
          ? declaredRedirectUrl(row.target)
          : undefined;
      const destination = declared ? new URL(declared, origin) : original;
      const canonical =
        !row.external && !row.resourceTarget
          ? (resolvePlatformQueryUrl(destination, platformIndex) ?? destination)
          : destination;
      const requestedPlatform =
        !row.external && !row.resourceTarget
          ? getPlatformForUrl(destination, platformIndex)
          : undefined;
      const expected = !row.external
        ? site?.pages.get(routeKey(canonical.href))
        : undefined;
      let pageMatches = false;
      if (expected) {
        const final = new URL(evidence.finalUrl ?? url);
        const finalIdentity = !row.resourceTarget
          ? (resolvePlatformQueryUrl(final, platformIndex) ?? final)
          : final;
        // Static query entries can serve the canonical base HTML before the
        // client selects a variant. Verify the actual HTTP route's artifact;
        // browser verification below must still prove the requested variant.
        const responsePage = site.pages.get(routeKey(final.href)) ?? expected;
        row.artifactMatches = Boolean(
          responsePage.digest && evidence.digest === responsePage.digest,
        );
        row.contentMatches = Boolean(
          responsePage.hasDocsBody &&
            evidence.hasDocsBody &&
            responsePage.contentDigest &&
            evidence.contentDigest === responsePage.contentDigest &&
            responsePage.contentTitle &&
            evidence.contentTitle === responsePage.contentTitle &&
            (!responsePage.canonicalPath ||
              (evidence.canonicalPath &&
                routeKey(evidence.canonicalPath) ===
                  routeKey(responsePage.canonicalPath))),
        );
        row.pathMatches =
          final.origin === origin &&
          routeKey(finalIdentity.href) === routeKey(expected.pageUrl) &&
          sameQuery(finalIdentity, canonical);
        row.expectedDigest = responsePage.digest;
        row.expectedContentDigest = responsePage.contentDigest;
        row.expectedContentTitle = responsePage.contentTitle;
        pageMatches = Boolean(
          row.pathMatches &&
            evidence.hasDocsBody &&
            (match === 'content' ? row.contentMatches : row.artifactMatches),
        );
      }
      if (evidence.status !== 'valid') {
        row.status = evidence.status;
        row.reason = evidence.reason;
      } else if (row.external) {
        row.status = evidence.status;
        row.reason = evidence.reason;
      } else {
        if (expected) {
          if (!row.pathMatches) {
            row.status = 'unverified';
            row.reason = 'unexpected-redirect-target';
          } else if (!pageMatches) {
            row.status = 'unverified';
            row.reason =
              match === 'content'
                ? 'public-content-differs-from-build'
                : 'public-html-differs-from-build';
          } else {
            row.status = 'valid';
            row.reason =
              match === 'content'
                ? 'public-content-matches-build'
                : 'public-html-matches-build';
          }
        } else if (
          row.resourceTarget &&
          !/html/i.test(evidence.contentType ?? '')
        ) {
          row.status = 'valid';
          row.reason = 'resource-http-success';
        } else {
          row.status = 'unverified';
          row.reason = 'unregistered-target-needs-review';
        }
      }
      if (
        row.resourceTarget &&
        (evidence.detectedHtml || /html/i.test(evidence.contentType ?? '')) &&
        !/\.html?(?:[?#]|$)/i.test(row.target)
      ) {
        row.status = 'unverified';
        row.reason = 'html-returned-for-resource';
      }
      if (
        !row.external &&
        !row.resourceTarget &&
        expected &&
        destination.searchParams.has('platform') &&
        hasPlatformQueryScope(destination, platformIndex) &&
        !requestedPlatform &&
        row.status === 'valid'
      ) {
        row.status = 'unverified';
        row.reason = 'unsupported-platform-query';
      }
      if (
        (requestedPlatform &&
          pageMatches &&
          (row.status === 'valid' || /fragment|anchor/.test(row.reason))) ||
        (new URL(url).hash &&
          expected?.interactive &&
          (row.status === 'valid' ||
            (pageMatches && /fragment|anchor/.test(row.reason)))) ||
        (row.external &&
          row.status === 'unverified' &&
          /fragment|anchor|javascript-shell|authentication-required|access-challenge/.test(
            row.reason,
          ))
      ) {
        row.status = 'unverified';
        row.reason = requestedPlatform
          ? 'platform-link-needs-browser'
          : 'deep-link-needs-browser';
        row.browserVerificationUrl = url;
        browserTargets.add(url);
        browserExpectedUrls.set(url, canonical.href);
      }
    }
    if (browserTargets.size && browser) {
      const { verifyBrowserTargets } = await import(
        './lib/cn-link-audit/browser.mjs'
      );
      const results = await verifyBrowserTargets([...browserTargets], {
        origin,
        timeoutMs,
        onProgress,
        platformIndex,
        expectedUrls: browserExpectedUrls,
      });
      for (const row of records) {
        if (
          !['deep-link-needs-browser', 'platform-link-needs-browser'].includes(
            row.reason,
          )
        )
          continue;
        const result = results.get(
          row.browserVerificationUrl ?? new URL(row.target, origin).href,
        );
        if (result) Object.assign(row, result);
      }
      fs.writeFileSync(
        path.resolve(repoRoot, output, 'browser-targets.json'),
        JSON.stringify({ commit, checkedAt, results: [...results] }, null, 2),
      );
    }
    coverage.checkedPages = records.filter(
      (row) => row.source === 'page' && row.status === 'valid',
    ).length;
  }
  // HTTP/body success cannot establish a source state with no published route.
  for (const record of records) {
    if (
      record.sourcePageUrl === undefined ||
      record.platformContextStatus === 'published-route' ||
      record.status === 'not-applicable' ||
      record.reason === 'network-evidence-missing'
    )
      continue;
    const dependsOnContext = !/^(?:[a-z][a-z0-9+.-]*:|\/)/i.test(
      String(record.href ?? '').trim(),
    );
    if (
      record.status !== 'broken' ||
      (dependsOnContext && !/^malformed-/.test(record.reason))
    ) {
      record.contextTargetStatus = record.status;
      record.contextTargetReason = record.reason;
      record.status = 'unverified';
      record.reason = 'source-platform-context-unresolved';
    }
  }
  const report = {
    schemaVersion: 1,
    mode,
    match,
    commit,
    origin,
    checkedAt,
    coverage,
    summary: summarizeReport(records, gaps, coverage),
    excluded: inventory.excluded,
    gaps,
    records,
  };
  writeReport(report, path.resolve(repoRoot, output));
  return report;
}

export async function buildForAudit(repoRoot, htmlRoot = 'dist/client') {
  if (htmlRoot !== 'dist/client')
    throw new Error(
      '--build only supports --html dist/client; custom output cannot be certified by the standard build',
    );
  if (process.env.DOCS_DEV_SCOPE || process.env.TSS_PRERENDER_PATHS)
    throw new Error(
      'Unset DOCS_DEV_SCOPE and TSS_PRERENDER_PATHS: partial builds cannot certify all CN links',
    );
  const before = fingerprintSources(repoRoot);
  await new Promise((resolve, reject) => {
    const child = spawn('bun', ['run', 'build'], {
      cwd: repoRoot,
      stdio: 'inherit',
      env: { ...process.env, VITE_DOCS_REGION: 'cn' },
    });
    child.on('error', reject);
    child.on('exit', (code) =>
      code === 0 ? resolve() : reject(new Error(`CN build failed (${code})`)),
    );
  });
  const after = fingerprintSources(repoRoot);
  if (before !== after)
    throw new Error(
      'Source changed during build; rerun to bind artifacts to a stable source',
    );
  fs.writeFileSync(
    path.resolve(repoRoot, htmlRoot, 'cn-link-build.json'),
    JSON.stringify(
      {
        region: 'cn',
        fingerprint: after,
        artifacts: fingerprintArtifacts(repoRoot, htmlRoot),
        builtAt: new Date().toISOString(),
      },
      null,
      2,
    ),
  );
}

async function main() {
  const { values } = parseArgs({
    options: {
      mode: { type: 'string', default: 'static' },
      match: { type: 'string', default: 'artifact' },
      origin: { type: 'string' },
      out: { type: 'string', default: '.agent/artifacts/cn-links' },
      html: { type: 'string', default: 'dist/client' },
      manifest: { type: 'string', default: 'public/__static/docs-routes.json' },
      build: { type: 'boolean', default: false },
      'no-browser': { type: 'boolean', default: false },
      concurrency: { type: 'string', default: '8' },
      timeout: { type: 'string', default: '10000' },
      retries: { type: 'string', default: '1' },
      'max-states': { type: 'string', default: '128' },
      help: { type: 'boolean', short: 'h' },
    },
  });
  if (values.help) {
    console.log(
      'bun scripts/audit-cn-doc-links.mjs --mode static|built|full [--build] [--match artifact|content] [--origin https://preview.example] [--out .agent/artifacts/cn-links] [--no-browser] [--concurrency 8] [--timeout 10000] [--retries 1] [--max-states 128]\nExit codes: 0 PASS, 1 confirmed broken links, 2 incomplete/error. Full mode requires an origin; browser coverage is enabled unless --no-browser.',
    );
    return;
  }
  for (const key of ['concurrency', 'timeout', 'retries', 'max-states'])
    if (
      !Number.isInteger(Number(values[key])) ||
      Number(values[key]) < (key === 'retries' ? 0 : 1)
    )
      throw new Error(`Invalid --${key}`);
  if (values.mode === 'full' && !values.origin)
    throw new Error('full mode requires --origin');
  if (!['static', 'built', 'full'].includes(values.mode))
    throw new Error('mode must be static, built, or full');
  if (!['artifact', 'content'].includes(values.match))
    throw new Error('match must be artifact or content');
  if (values.origin) {
    const url = new URL(values.origin);
    if (
      !['http:', 'https:'].includes(url.protocol) ||
      url.username ||
      url.password ||
      url.pathname !== '/' ||
      url.search ||
      url.hash
    )
      throw new Error(
        'origin must be an HTTP(S) origin without path, credentials, query, or hash',
      );
  }
  if (values.build) {
    try {
      await buildForAudit(process.cwd(), values.html);
    } catch (error) {
      const coverage = { expectedPages: 0, checkedPages: 0 };
      const gaps = [{ reason: 'build-failed', detail: error.message }];
      writeReport(
        {
          mode: values.mode,
          match: values.match,
          commit: 'unknown',
          checkedAt: new Date().toISOString(),
          coverage,
          summary: summarizeReport([], gaps, coverage),
          gaps,
          records: [],
        },
        path.resolve(values.out),
      );
      throw error;
    }
  }
  let lastLog = 0;
  const report = await runAudit({
    mode: values.mode,
    match: values.match,
    origin: values.origin,
    output: values.out,
    htmlRoot: values.html,
    manifestPath: values.manifest,
    browser: !values['no-browser'],
    maxStates: Number(values['max-states']),
    concurrency: Number(values.concurrency),
    timeoutMs: Number(values.timeout),
    retries: Number(values.retries),
    onProgress(progress) {
      if (
        Date.now() - lastLog > 3000 ||
        progress.completed === progress.total
      ) {
        console.error(
          `[cn-links] ${progress.phase ?? 'browser'} ${progress.completed ?? ''}/${progress.total ?? ''}`,
        );
        lastLog = Date.now();
      }
    },
  });
  console.log(JSON.stringify(report.summary, null, 2));
  console.log(`Report: ${path.resolve(values.out, 'report.md')}`);
  process.exitCode =
    report.summary.status === 'PASS'
      ? 0
      : report.summary.status === 'FAIL'
        ? 1
        : 2;
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
)
  main().catch((error) => {
    console.error(`[cn-links] ${error.message}`);
    process.exitCode = 2;
  });
