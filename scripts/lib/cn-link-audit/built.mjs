import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { load } from 'cheerio';
import { resolveLegacyApiHashRedirect } from '../../../src/lib/docs-api-hash-redirects.ts';
import { resolveMovedDocsRedirect } from '../../../src/lib/docs-moved-redirects.ts';
import { preserveRedirectSearch } from '../../../src/lib/docs-redirect-url.ts';
import { resolveStaticLegacySitemapRedirect } from '../../../src/lib/legacy-sitemap/static-redirects.ts';
import {
  DOCS_PRERENDER_PATHS_MANIFEST_PATH,
  readDocsPrerenderPaths,
} from '../../../src/lib/published-docs-routes.server.ts';
import { isRetiredCnDocsPath } from '../../../src/lib/retired-cn-docs.mjs';
import { resolveZhCnProductIaRedirect } from '../../../src/lib/zh-cn-product-ia-redirects.ts';
import { docsContentEvidence } from './content-evidence.mjs';
import { parseSrcset, publicPath } from './inventory.mjs';

const trimSlash = (value) => value.replace(/\/+$/, '') || '/';
const rootOf = (value) => value.split('/').filter(Boolean)[0];
const unsafePath = (value) =>
  !value.startsWith('/') ||
  value.includes('\\') ||
  value.includes('\0') ||
  value.split('/').some((part) => part === '.' || part === '..');
const isFile = (file) => {
  try {
    return fs.statSync(file).isFile();
  } catch {
    return false;
  }
};
function containedPath(root, pathname) {
  if (unsafePath(pathname)) return undefined;
  const base = path.resolve(root);
  const file = path.resolve(base, `.${pathname}`);
  if (file !== base && !file.startsWith(`${base}${path.sep}`)) return undefined;
  // A symlink must not turn a public path into a read outside the build.
  if (fs.existsSync(file)) {
    const realRoot = fs.realpathSync(base),
      realFile = fs.realpathSync(file);
    if (realFile !== realRoot && !realFile.startsWith(`${realRoot}${path.sep}`))
      return undefined;
  }
  return file;
}

function parsePage(html, pageUrl, filePath, route, platformRoutes) {
  const $ = load(html);
  const body = $('[data-static-docs-body]');
  const content = body.clone();
  content.find('script, style, template').remove();
  const skeleton =
    body
      .find(
        '[data-testid="docs-content-skeleton"], [data-slot="skeleton"], [data-skeleton-line]',
      )
      .add(
        body.filter(
          '[data-testid="docs-content-skeleton"], [data-slot="skeleton"], [data-skeleton-line]',
        ),
      ).length > 0;
  const nonempty =
    content.text().replace(/\s+/g, '').length > 0 ||
    content.find('img, video, audio, table, pre, code').length > 0;
  const reason = !body.length
    ? 'missing-docs-body'
    : skeleton
      ? 'docs-body-skeleton'
      : !nonempty
        ? 'empty-docs-body'
        : undefined;
  // Page-level platform groups use header placement and published route state.
  // Ordinary tabs and inline/nested platform groups remain states of that page.
  const pagePanels = new Map();
  body.find('[data-platform-group="structured"]').each((_index, group) => {
    if (
      $(group).parents('[data-platform-group], [data-platform-panel]').length ||
      !$(group).parents(
        '[data-static-docs-body][data-platform-header-tabs="true"]',
      ).length
    )
      return;
    const inlineControls = $(group).children().not('[data-platform-panel]');
    if (
      inlineControls
        .find('[role="tablist"]')
        .add(inlineControls.filter('[role="tablist"]')).length
    )
      return;
    $(group)
      .children('[data-platform-panel]')
      .each((_panelIndex, panel) => {
        const platform = $(panel).attr('data-platform-panel');
        if (platform) pagePanels.set(panel, platform);
      });
  });
  const enclosingPlatform = (element) => {
    const panel = $(element)
      .parents()
      .addBack()
      .toArray()
      .find((node) => pagePanels.has(node));
    return pagePanels.get(panel);
  };
  const anchorPlatforms = new Map();
  const anchors = new Set();
  $('[id], [name]').each((_index, element) => {
    for (const attribute of ['id', 'name']) {
      const value = $(element).attr(attribute);
      if (value !== undefined) {
        anchors.add(value);
        if (!anchorPlatforms.has(value)) anchorPlatforms.set(value, new Set());
        anchorPlatforms.get(value).add(enclosingPlatform(element));
      }
    }
  });
  const scope = $('article, [data-static-docs-body]');
  const links = [];
  const platformContextGaps = new Map();
  const routesForPage = platformRoutes.get(
    trimSlash(publicPath(route.canonicalPath)),
  );
  const add = (href, attribute, kind, element) => {
    let platformContext = enclosingPlatform(element);
    let platformContextSource = platformContext ? 'enclosing-panel' : undefined;
    if (
      !platformContext &&
      attribute === 'href' &&
      href.startsWith('#') &&
      href.length > 1
    ) {
      let fragment;
      try {
        fragment = decodeURIComponent(href.slice(1));
      } catch {
        fragment = href.slice(1);
      }
      const owners = anchorPlatforms.get(fragment);
      if (owners?.size === 1 && !owners.has(undefined)) {
        platformContext = [...owners][0];
        platformContextSource = 'fragment-target';
      }
    }
    const platformTargets = platformContext
      ? routesForPage?.get(platformContext)
      : undefined;
    const platformContextStatus =
      platformTargets?.length === 1
        ? 'published-route'
        : platformTargets?.length > 1
          ? 'ambiguous-platform-route'
          : 'unpublished-platform';
    if (platformContext && platformContextStatus !== 'published-route')
      platformContextGaps.set(platformContext, {
        pageUrl,
        sourcePath: filePath,
        platformContext,
        reason: 'platform-context-route-unresolved',
        detail: platformContextStatus,
      });
    links.push({
      pageUrl:
        platformContext && platformContextStatus === 'published-route'
          ? platformTargets[0]
          : pageUrl,
      sourcePath: filePath,
      source: 'rendered',
      href,
      kind,
      attribute,
      ...(platformContext
        ? {
            renderedAt: pageUrl,
            platformContext,
            platformContextSource,
            platformContextStatus,
          }
        : {}),
    });
  };
  const navigation = $(
    '[data-testid="docs-sidebar"] a[href], [data-sidebar="sidebar"] a[href], nav a[href], a[rel="prev"], a[rel="next"]',
  ).filter((_index, element) => !$(element).parents('header').length);
  scope
    .find('[href], [src], [srcset], [poster], [style]')
    .add(scope.filter('[href], [src], [srcset], [poster], [style]'))
    .add(navigation)
    .each((_index, element) => {
      if (
        ['script', 'style', 'link', 'base'].includes(element.tagName) ||
        $(element).parents('script, style, template').length
      )
        return;
      for (const attribute of ['href', 'src', 'srcset', 'poster']) {
        const value = $(element).attr(attribute);
        if (value === undefined) continue;
        // Data URLs can contain commas. Each srcset candidate ends at its descriptor.
        const values = attribute === 'srcset' ? parseSrcset(value) : [value];
        for (const href of values)
          add(
            href,
            attribute,
            attribute === 'href' && ['a', 'area'].includes(element.tagName)
              ? 'link'
              : 'resource',
            element,
          );
      }
      for (const match of ($(element).attr('style') ?? '').matchAll(
        /url\(\s*(?:"([^"]*)"|'([^']*)'|([^)]*?))\s*\)/gi,
      ))
        add(match[1] ?? match[2] ?? match[3], 'style', 'resource', element);
    });
  const controls =
    'details, [role="tab"], [role="tabpanel"], [aria-expanded], [data-state="closed"], [data-platform], [data-platform-panel], [data-platform-group], [data-platform-header-tabs], [data-slot*="collapsible"], [data-slot*="accordion"]';
  const hiddenAnchors = new Set();
  $('[id], a[name]').each((_index, element) => {
    const chain = $(element).parents().addBack();
    const hidden = chain.toArray().some((ancestor) => {
      const style = $(ancestor).attr('style') ?? '';
      return (
        $(ancestor).is('[hidden], [aria-hidden="true"]') ||
        /(?:display\s*:\s*none|visibility\s*:\s*(?:hidden|collapse)|content-visibility\s*:\s*hidden)/i.test(
          style,
        )
      );
    });
    if (hidden)
      for (const value of [$(element).attr('id'), $(element).attr('name')])
        if (value) hiddenAnchors.add(value);
  });
  const interactiveScope = $(
    '[data-static-docs-body], [data-platform-header-tabs]',
  );
  const interactive =
    hiddenAnchors.size > 0 ||
    interactiveScope.find(controls).add(interactiveScope.filter(controls))
      .length > 0;
  return {
    pageUrl,
    filePath,
    digest: createHash('sha256').update(html).digest('hex'),
    anchors,
    hiddenAnchors,
    links,
    platformContextGaps: [...platformContextGaps.values()],
    ...docsContentEvidence(html),
    interactive,
    ...(reason ? { reason } : {}),
  };
}

export function loadBuiltSite({
  repoRoot = process.cwd(),
  htmlRoot = 'dist/client',
  manifestPath = 'public/__static/docs-routes.json',
  expectedRoutes = new Map(),
  onProgress = () => {},
} = {}) {
  const pages = new Map(),
    links = [],
    gaps = [],
    routes = new Map();
  const buildRoot = path.resolve(repoRoot, htmlRoot);
  const manifestFile = path.resolve(repoRoot, manifestPath);
  const docsRoots = new Set([
    'ai',
    'api-reference',
    'introduction',
    'realtime-media',
    'reference',
    'solutions',
  ]);
  for (const route of expectedRoutes.keys())
    docsRoots.add(rootOf(publicPath(route)));
  let manifest = [];
  try {
    manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
    if (!Array.isArray(manifest)) {
      gaps.push({ sourcePath: manifestFile, reason: 'invalid-route-manifest' });
      manifest = [];
    } else if (!manifest.length)
      gaps.push({ sourcePath: manifestFile, reason: 'empty-route-manifest' });
  } catch (error) {
    gaps.push({
      sourcePath: manifestFile,
      reason:
        error.code === 'ENOENT'
          ? 'missing-route-manifest'
          : 'invalid-route-manifest',
      detail: error.message,
    });
  }
  // Readable Markdown routes exclude redirects; navigation still needs every
  // prerendered entry. Older build artifacts may not have the separate manifest.
  const prerenderFile = path.join(
    path.dirname(manifestFile),
    path.basename(DOCS_PRERENDER_PATHS_MANIFEST_PATH),
  );
  if (fs.existsSync(prerenderFile)) {
    try {
      const knownUrls = new Set(manifest.map((entry) => entry?.url));
      for (const url of readDocsPrerenderPaths(prerenderFile)) {
        if (unsafePath(url) || /[?#]/.test(url)) {
          gaps.push({
            sourcePath: prerenderFile,
            reason: 'invalid-prerender-route',
            detail: url,
          });
          continue;
        }
        if (!knownUrls.has(url)) {
          manifest.push({ url, canonicalPath: url });
          knownUrls.add(url);
        }
      }
    } catch (error) {
      gaps.push({
        sourcePath: prerenderFile,
        reason: 'invalid-prerender-manifest',
        detail: error.message,
      });
    }
  }
  for (const entry of manifest) {
    if (
      typeof entry?.url !== 'string' ||
      typeof entry?.canonicalPath !== 'string' ||
      unsafePath(entry.url) ||
      /[?#]/.test(entry.url)
    ) {
      gaps.push({
        sourcePath: manifestFile,
        reason: 'invalid-manifest-route',
        detail: JSON.stringify(entry),
      });
      continue;
    }
    if (/^\/zh-CN(?:\/|$)/.test(entry.url))
      docsRoots.add(rootOf(publicPath(entry.url)));
  }
  for (const entry of manifest) {
    if (
      typeof entry?.url !== 'string' ||
      typeof entry?.canonicalPath !== 'string' ||
      unsafePath(entry.url) ||
      /[?#]/.test(entry.url)
    )
      continue;
    const pageUrl = trimSlash(publicPath(entry.url));
    if (
      !/^\/zh-CN(?:\/|$)/.test(entry.url) &&
      !docsRoots.has(rootOf(entry.url))
    )
      continue;
    const current = routes.get(pageUrl);
    if (current) current.sourceUrls.add(entry.url);
    else
      routes.set(pageUrl, {
        ...entry,
        pageUrl,
        sourceUrls: new Set([entry.url]),
      });
  }
  if (manifest.length && !routes.size)
    gaps.push({ sourcePath: manifestFile, reason: 'no-cn-manifest-routes' });
  for (const [expected, detail] of expectedRoutes) {
    const pageUrl = trimSlash(publicPath(expected));
    if (!routes.has(pageUrl))
      gaps.push({
        pageUrl,
        sourcePath: detail?.sourcePath,
        reason: 'expected-route-not-in-manifest',
      });
  }
  const platformRoutes = new Map();
  for (const [pageUrl, entry] of routes) {
    if (!entry.platform) continue;
    const canonical = trimSlash(publicPath(entry.canonicalPath));
    if (!platformRoutes.has(canonical))
      platformRoutes.set(canonical, new Map());
    const platforms = platformRoutes.get(canonical);
    if (!platforms.has(entry.platform)) platforms.set(entry.platform, []);
    platforms.get(entry.platform).push(pageUrl);
  }
  let completed = 0;
  for (const [pageUrl, entry] of routes) {
    const candidates = [
      ...new Set([pageUrl, ...entry.sourceUrls, `/zh-CN${pageUrl}`]),
    ].flatMap((url) => {
      const routePath = trimSlash(url);
      return [
        `${routePath === '/' ? '' : routePath}/index.html`,
        `${routePath}.html`,
      ]
        .map((name) => containedPath(buildRoot, name))
        .filter(Boolean);
    });
    const filePath = candidates.find(isFile);
    if (!filePath)
      gaps.push({ pageUrl, reason: 'missing-built-html', candidates });
    else {
      try {
        const page = parsePage(
          fs.readFileSync(filePath, 'utf8'),
          pageUrl,
          filePath,
          entry,
          platformRoutes,
        );
        gaps.push(...page.platformContextGaps);
        pages.set(pageUrl, page);
        links.push(...page.links);
        if (!page.hasDocsBody)
          gaps.push({ pageUrl, sourcePath: filePath, reason: page.reason });
      } catch (error) {
        gaps.push({
          pageUrl,
          sourcePath: filePath,
          reason: 'unreadable-built-html',
          detail: error.message,
        });
      }
    }
    completed++;
    if (completed % 100 === 0 || completed === routes.size)
      onProgress({ phase: 'built-html', completed, total: routes.size });
  }
  return {
    pages,
    links,
    gaps,
    routes,
    expectedRoutes: new Set(
      [...expectedRoutes.keys()].map((value) => trimSlash(publicPath(value))),
    ),
    docsRoots,
    buildRoot,
    counts: {
      manifestRoutes: manifest.length,
      cnRoutes: routes.size,
      builtPages: pages.size,
      validBodies: [...pages.values()].filter((page) => page.hasDocsBody)
        .length,
      renderedLinks: links.length,
      gaps: gaps.length,
    },
  };
}

export function validateLocalTarget(
  occurrence,
  resolved,
  site,
  { repoRoot = process.cwd(), htmlRoot = 'dist/client' } = {},
) {
  if (resolved.status) return resolved;
  if (resolved.external)
    return {
      status: 'not-applicable',
      reason: 'external-target',
      target: resolved.target,
    };
  const pathname = resolved.pathname;
  const result = (status, reason, evidence = {}) => ({
    status,
    reason,
    target: resolved.target,
    ...evidence,
  });
  if (typeof pathname !== 'string' || unsafePath(pathname))
    return result('broken', 'unsafe-local-path');
  // HTML is emitted under /zh-CN, but the public router rewrites those paths.
  // File existence alone cannot prove that a literal rendered /zh-CN URL works.
  if (/^\/zh-CN(?:\/|$)/.test(pathname) && occurrence.kind !== 'resource')
    return result('unverified', 'locale-route-needs-http', {
      expectedPath: declaredRedirectTarget(resolved.target),
    });
  const route = trimSlash(pathname),
    page = site.pages.get(route);
  if (page) {
    const evidence = {
      filePath: page.filePath,
      digest: page.digest,
      hasDocsBody: page.hasDocsBody,
    };
    if (!page.hasDocsBody)
      return result('unverified', page.reason ?? 'missing-docs-body', evidence);
    if (resolved.hash && resolved.hash !== '#') {
      let anchor;
      try {
        anchor = decodeURIComponent(resolved.hash.slice(1));
      } catch {
        return result('broken', 'malformed-anchor', evidence);
      }
      if (page.interactive)
        return result('unverified', 'interactive-anchor-needs-browser', {
          ...evidence,
          anchor,
        });
      if (!page.anchors.has(anchor))
        return result('broken', 'missing-anchor', { ...evidence, anchor });
    }
    return result('valid', 'built-page-target', evidence);
  }
  const expectedPath = declaredRedirectTarget(resolved.target);
  if (expectedPath && site.pages.has(trimSlash(expectedPath)))
    return result('unverified', 'declared-redirect-needs-http', {
      expectedPath,
    });
  if (site.routes?.has(route) || site.expectedRoutes?.has(route))
    return result('unverified', 'missing-built-html');
  const buildRoot = site.buildRoot ?? path.resolve(repoRoot, htmlRoot);
  const resource =
    occurrence.kind === 'resource' || Boolean(path.posix.extname(pathname));
  if (resource) {
    const filePath = containedPath(buildRoot, pathname);
    if (!filePath) return result('broken', 'unsafe-local-path');
    if (!fs.existsSync(buildRoot))
      return result('unverified', 'missing-build-output');
    if (!isFile(filePath))
      return result('broken', 'missing-local-resource', { filePath });
    if (!fs.statSync(filePath).size)
      return result('unverified', 'empty-local-resource', { filePath });
    // Inspect only a prefix: checking a large archive must not read the download.
    if (occurrence.kind === 'resource' || !/\.html?$/i.test(pathname)) {
      const descriptor = fs.openSync(filePath, 'r');
      try {
        const prefix = Buffer.alloc(2048);
        const length = fs.readSync(descriptor, prefix, 0, prefix.length, 0);
        if (
          /^\s*(?:<!doctype\s+html|<html\b)/i.test(
            prefix.toString('utf8', 0, length),
          )
        )
          return result('unverified', 'html-in-local-resource', { filePath });
      } finally {
        fs.closeSync(descriptor);
      }
    }
    return result('valid', 'built-resource-target', {
      filePath,
      bytes: fs.statSync(filePath).size,
    });
  }
  return site.docsRoots?.has(rootOf(pathname))
    ? result('broken', 'missing-docs-route')
    : result('unverified', 'route-needs-http');
}

const redirectCache = new Map();
export function declaredRedirectTarget(target) {
  const destination = declaredRedirectUrl(target);
  return destination
    ? new URL(destination, 'https://cn-link-audit.invalid').pathname
    : undefined;
}

export function declaredRedirectUrl(target) {
  if (redirectCache.has(target)) return redirectCache.get(target);
  let current = new URL(target, 'https://cn-link-audit.invalid');
  const seen = new Set();
  let changed = false;
  for (let hop = 0; hop < 8; hop++) {
    const pathname = publicPath(current.pathname);
    if (seen.has(pathname) || isRetiredCnDocsPath(`/zh-CN${pathname}`))
      return undefined;
    seen.add(pathname);
    const [tab, ...segments] = pathname.split('/').filter(Boolean);
    const moved =
      resolveLegacyApiHashRedirect('zh-CN', tab, segments, current.hash) ??
      resolveMovedDocsRedirect('zh-CN', tab, segments);
    const legacy = moved
      ? undefined
      : (resolveStaticLegacySitemapRedirect(
          `/zh-CN${pathname}`,
          current.search,
        ) ?? resolveStaticLegacySitemapRedirect(pathname, current.search));
    const destination =
      moved ??
      legacy?.redirectUrl ??
      resolveZhCnProductIaRedirect('zh-CN', tab, segments);
    if (!destination) {
      const result = changed
        ? `${publicPath(current.pathname)}${current.search}${current.hash}`
        : undefined;
      redirectCache.set(target, result);
      return result;
    }
    changed = true;
    current = new URL(
      preserveRedirectSearch(
        destination,
        { searchStr: current.search, hash: current.hash },
        legacy?.preserveSearch ?? true,
      ),
      current,
    );
  }
  return undefined;
}
