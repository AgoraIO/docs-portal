import { existsSync } from 'node:fs';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import process from 'node:process';
import vm from 'node:vm';
import { parseCsv, stringifyCsv } from './migration-control-table.mjs';

const DEFAULT_LEGACY_ROOT =
  process.env.LEGACY_DOCS_ROOT ??
  '/Users/yangyixuan/Documents/GitHub/shengwang-doc-source';
const DEFAULT_PATH_MAP = 'docs/migration/path-map.csv';
const DEFAULT_CONTENT_ROOT = 'content/docs/zh-CN';
const LEGACY_HIDDEN_COLUMN = '旧文档已隐藏';
const LEGACY_HIDDEN_VALUE = '是';
const LEGACY_PUBLIC_HOSTS = new Set(['doc.shengwang.cn']);
const LEGACY_RENDERED_DATA_FILES = [
  'data/homepage.ts',
  'data/product.ts',
  'data/apiCenter.ts',
];

export function normalizeLegacyRoute(value) {
  if (!value || typeof value !== 'string') {
    return '';
  }

  let route = value.trim();
  if (!route) {
    return '';
  }

  const absoluteUrl = route.match(/^https?:\/\/([^/]+)(\/.*)$/);
  if (absoluteUrl) {
    const [, host, pathname] = absoluteUrl;
    if (!LEGACY_PUBLIC_HOSTS.has(host)) {
      return '';
    }
    route = pathname;
  }

  route = route
    .split('#')[0]
    .split('?')[0]
    .replace(/^https?:\/\/[^/]+/, '')
    .replace(/^\/+/, '')
    .replace(/^(?:zh-CN\/)?(?:doc|api-ref)\//, '')
    .replace(/\.html$/, '');

  return route;
}

export function createVisibleRouteMatcher(routes) {
  const exactRoutes = new Set(
    [...routes].filter((route) => route && !route.includes('{{platform}}')),
  );
  const routePatterns = [...routes]
    .filter((route) => route.includes('{{platform}}'))
    .map(createRoutePattern);

  return (value) => {
    const route = normalizeLegacyRoute(value);

    return (
      exactRoutes.has(route) ||
      routePatterns.some((pattern) => pattern.test(route))
    );
  };
}

export function resolveTargetMetaEntry(targetPath, contentRoot) {
  const absoluteTarget = path.resolve(targetPath);
  const absoluteContentRoot = path.resolve(contentRoot);
  const parsed = path.parse(absoluteTarget);
  const entryPath =
    parsed.name === 'index'
      ? path.dirname(absoluteTarget)
      : path.join(parsed.dir, parsed.name);
  let ownerDir = parsed.name === 'index' ? path.dirname(entryPath) : parsed.dir;
  const candidates = [];

  while (isPathInside(absoluteContentRoot, ownerDir)) {
    candidates.push({
      metaPath: path.join(ownerDir, 'meta.json'),
      page: path.relative(ownerDir, entryPath).split(path.sep).join('/'),
    });

    if (ownerDir === absoluteContentRoot) {
      break;
    }
    ownerDir = path.dirname(ownerDir);
  }

  for (const candidate of candidates) {
    if (
      existsSync(candidate.metaPath) &&
      metaDeclaresPage(readFileSyncSafe(candidate.metaPath), candidate.page)
    ) {
      return candidate;
    }
  }

  const nearestExistingCandidate = candidates.find((candidate) =>
    existsSync(candidate.metaPath),
  );
  if (nearestExistingCandidate) {
    return nearestExistingCandidate;
  }

  if (candidates.length > 0) {
    return candidates[0];
  }

  if (parsed.name === 'index') {
    const folderDir = path.dirname(absoluteTarget);
    return {
      metaPath: path.join(path.dirname(folderDir), 'meta.json'),
      page: path.basename(folderDir),
    };
  }

  return {
    metaPath: path.join(parsed.dir, 'meta.json'),
    page: parsed.name,
  };
}

export function hidePagesInMeta(raw, pagesToHide) {
  const meta = JSON.parse(raw);
  if (!Array.isArray(meta.pages)) {
    return { changed: false, nextRaw: raw };
  }

  const pagesToHideSet = new Set(pagesToHide);
  const foundPages = new Set();
  let changed = false;
  const pages = hidePageEntries(meta.pages, pagesToHideSet, foundPages, () => {
    changed = true;
  });

  for (const page of pagesToHide) {
    if (foundPages.has(page)) {
      continue;
    }

    pages.push(`!${page}`);
    changed = true;
  }

  if (!changed) {
    return { changed: false, nextRaw: raw };
  }

  meta.pages = pages;
  return {
    changed: true,
    nextRaw: `${JSON.stringify(meta, null, 2)}\n`,
  };
}

function hidePageEntries(pages, pagesToHide, foundPages, markChanged) {
  return pages.map((page) => {
    if (typeof page === 'string') {
      if (pagesToHide.has(page)) {
        foundPages.add(page);
        markChanged();
        return `!${page}`;
      }

      if (page.startsWith('!') && pagesToHide.has(page.slice(1))) {
        foundPages.add(page.slice(1));
      }

      return page;
    }

    if (page && typeof page === 'object' && Array.isArray(page.pages)) {
      return {
        ...page,
        pages: hidePageEntries(
          page.pages,
          pagesToHide,
          foundPages,
          markChanged,
        ),
      };
    }

    return page;
  });
}

function metaDeclaresPage(raw, page) {
  const meta = JSON.parse(raw);
  return pageEntriesInclude(meta.pages, page);
}

function pageEntriesInclude(pages, targetPage) {
  if (!Array.isArray(pages)) {
    return false;
  }

  return pages.some((page) => {
    if (typeof page === 'string') {
      return page === targetPage || page === `!${targetPage}`;
    }

    return pageEntriesInclude(page?.pages, targetPage);
  });
}

function isPathInside(root, candidate) {
  const relative = path.relative(root, candidate);
  return (
    relative === '' ||
    (!relative.startsWith(`..${path.sep}`) &&
      relative !== '..' &&
      !path.isAbsolute(relative))
  );
}

export function applyLegacyHiddenColumnToPathMap({
  contentRoot = DEFAULT_CONTENT_ROOT,
  isVisibleLegacyPathMapRow = undefined,
  isVisibleLegacyRoute,
  raw,
}) {
  const [headers = [], ...bodyRows] = parseCsv(raw);
  const nextHeaders = [...headers];
  let columnAdded = false;

  if (!nextHeaders.includes(LEGACY_HIDDEN_COLUMN)) {
    nextHeaders.push(LEGACY_HIDDEN_COLUMN);
    columnAdded = true;
  }

  const hiddenColumnIndex = nextHeaders.indexOf(LEGACY_HIDDEN_COLUMN);
  const columnIndexes = Object.fromEntries(
    nextHeaders.map((header, index) => [header, index]),
  );
  let changedRows = 0;
  let hiddenRows = 0;

  const nextBodyRows = bodyRows.map((row) => {
    if (row.every((field) => field === '')) {
      return row;
    }

    const nextRow = [...row];
    while (nextRow.length < nextHeaders.length) {
      nextRow.push('');
    }

    const targetPath = nextRow[columnIndexes.target_path] ?? '';
    const redirectStatus = nextRow[columnIndexes.redirect_status] ?? '';
    const oldUrl = nextRow[columnIndexes.old_url] ?? '';
    const rowObject = Object.fromEntries(
      nextHeaders.map((header, index) => [header, nextRow[index] ?? '']),
    );
    const shouldMarkHidden =
      redirectStatus === 'redirect' &&
      targetPath.startsWith(`${contentRoot}/`) &&
      oldUrl.length > 0 &&
      !(isVisibleLegacyPathMapRow?.(rowObject) ?? isVisibleLegacyRoute(oldUrl));
    const nextValue = shouldMarkHidden ? LEGACY_HIDDEN_VALUE : '';

    if (nextRow[hiddenColumnIndex] !== nextValue) {
      nextRow[hiddenColumnIndex] = nextValue;
      changedRows += 1;
    }

    if (shouldMarkHidden) {
      hiddenRows += 1;
    }

    return nextRow;
  });

  return {
    changed: columnAdded || changedRows > 0,
    changedRows,
    columnAdded,
    hiddenRows,
    nextRaw: stringifyCsv([nextHeaders, ...nextBodyRows]),
  };
}

export async function collectLegacyVisibleRoutes({ legacyRoot, repoRoot }) {
  const require = createRequire(
    path.join(repoRoot, 'scripts', 'legacy-nav.js'),
  );
  const renderedEntryRoutes = collectLegacyRenderedEntryRoutes({
    legacyRoot,
    require,
  });
  const routes = new Set();
  const sidebarFiles = [];
  const docsProductsToExpand = new Set(renderedEntryRoutes.docProducts);
  const apiProductsToExpand = new Set(renderedEntryRoutes.apiProducts);

  for (const route of renderedEntryRoutes.routes) {
    routes.add(route);
  }

  for (const product of [...docsProductsToExpand].sort()) {
    const result = collectProductSidebarRoutes({
      product,
      productRoot: path.join(legacyRoot, 'docs', product),
      require,
      routeBase: 'doc',
    });

    for (const route of result.routes) {
      routes.add(route.route);
      if (route.kind === 'api-ref') {
        apiProductsToExpand.add(route.product);
      }
    }
    sidebarFiles.push(...result.sidebarFiles);
  }

  for (const product of [
    ...new Set([...apiProductsToExpand, ...docsProductsToExpand]),
  ].sort()) {
    const result = collectProductSidebarRoutes({
      product,
      productRoot: path.join(legacyRoot, 'docs-api-reference', product),
      require,
      routeBase: 'api-ref',
    });

    for (const route of result.routes) {
      routes.add(route.route);
    }
    sidebarFiles.push(...result.sidebarFiles);
  }

  routes.delete('');

  return {
    routes,
    sidebarFiles,
  };
}

export function collectLegacyRenderedEntryRoutes({ legacyRoot, require }) {
  const routes = new Set();
  const docProducts = new Set();
  const apiProducts = new Set();

  for (const relativeFilePath of LEGACY_RENDERED_DATA_FILES) {
    const filePath = path.join(legacyRoot, relativeFilePath);
    if (!existsSync(filePath)) {
      continue;
    }

    const moduleValue = relativeFilePath.endsWith('.ts')
      ? loadLegacyTypeScriptDataModule(filePath)
      : require(filePath);

    for (const href of collectHrefs(moduleValue)) {
      const parsed = parseLegacyInternalRoute(href);
      if (!parsed) {
        continue;
      }

      routes.add(parsed.route);
      if (parsed.kind === 'doc') {
        docProducts.add(parsed.product);
      } else if (parsed.kind === 'api-ref') {
        apiProducts.add(parsed.product);
      }
    }
  }

  return {
    apiProducts,
    docProducts,
    routes,
  };
}

function collectProductSidebarRoutes({
  product,
  productRoot,
  require,
  routeBase,
}) {
  if (!existsSync(productRoot)) {
    return {
      routes: [],
      sidebarFiles: [],
    };
  }

  const platformsPath = path.join(productRoot, '_platforms_.meta.js');
  if (!existsSync(platformsPath)) {
    return {
      routes: [],
      sidebarFiles: [],
    };
  }

  const platforms = require(platformsPath);
  const sidebarFiles = readdirSyncSafe(productRoot)
    .filter((fileName) => /_sidebar.*\.meta.*\.js$/.test(fileName))
    .map((fileName) => path.join(productRoot, fileName))
    .sort();
  const routes = [];

  for (const platform of platforms) {
    const platformRoutes = platform.landingPage
      ? [parseLegacyInternalRoute(`/${routeBase}/${platform.landingPage}`)]
      : [];

    if (Array.isArray(platform.usecase)) {
      for (const usecase of platform.usecase) {
        if (usecase.landingPage) {
          platformRoutes.push(
            parseLegacyInternalRoute(`/${routeBase}/${usecase.landingPage}`),
          );
        }
      }
    }

    for (const route of platformRoutes.filter(Boolean)) {
      routes.push(route);
    }
  }

  if (existsSync(path.join(productRoot, '_homepage_.mdx'))) {
    const homepageRoute = parseLegacyInternalRoute(
      `/${routeBase}/${product}/homepage`,
    );
    if (homepageRoute) {
      routes.push(homepageRoute);
    }
  }

  for (const sidebarFile of sidebarFiles) {
    const [usecaseStr, platformStr = ''] = path
      .basename(sidebarFile)
      .split('_sidebar_.meta.');
    const platformSuffixes = platformStr.split('.').slice(0, -1);
    const matchedPlatforms =
      platformSuffixes.length === 0
        ? platforms
        : platforms.filter((platform) =>
            platformSuffixes.includes(platform.value),
          );

    for (const platform of matchedPlatforms) {
      const moduleValue = require(sidebarFile);
      const roots = Array.isArray(moduleValue)
        ? moduleValue
        : Object.values(moduleValue ?? {});
      const expandedItems = JSON.parse(
        JSON.stringify(roots).replaceAll('{{platform}}', platform.value),
      );
      const usecaseValues = usecaseStr.split('.').slice(0, -1);
      const activeUsecaseValues =
        usecaseValues.length > 0 ? usecaseValues : ['usecase'];

      for (const item of flattenSidebarItems(expandedItems)) {
        if (typeof item.id === 'string') {
          const parsed = parseLegacyInternalRoute(`/${routeBase}/${item.id}`);
          if (
            parsed &&
            routeMatchesUsecase(parsed.route, activeUsecaseValues)
          ) {
            routes.push(parsed);
          }
        }

        if (typeof item.href === 'string') {
          const parsed = parseLegacyInternalRoute(item.href);
          if (parsed) {
            routes.push(parsed);
          }
        }
      }
    }
  }

  return {
    routes,
    sidebarFiles,
  };
}

function routeMatchesUsecase(route, activeUsecaseValues) {
  if (activeUsecaseValues.includes('usecase')) {
    return true;
  }

  return activeUsecaseValues.some((usecase) => route.includes(`/${usecase}/`));
}

function collectHrefs(value, output = []) {
  if (!value) {
    return output;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      collectHrefs(item, output);
    }
    return output;
  }

  if (typeof value !== 'object') {
    return output;
  }

  if (typeof value.href === 'string') {
    output.push(value.href);
  }

  for (const child of Object.values(value)) {
    collectHrefs(child, output);
  }

  return output;
}

function loadLegacyTypeScriptDataModule(filePath) {
  const raw = readFileSyncSafe(filePath);
  const exports = {};
  const source = raw
    .replace(/^import\s+[^;]+;\s*/gm, '')
    .replace(/export\s+interface\s+\w+\s*{[\s\S]*?}\s*/g, '')
    .replace(/\bnew\s+Set<[^>]+>\(/g, 'new Set(')
    .replace(
      /export\s+const\s+(\w+)(?:\s*:\s*[^=]+)?\s*=/g,
      'const $1 = exports.$1 =',
    );

  vm.runInNewContext(
    source,
    {
      ALL_PLATFORM: 'all',
      exports,
    },
    { filename: filePath },
  );
  return exports;
}

function parseLegacyInternalRoute(value) {
  if (!value || typeof value !== 'string') {
    return null;
  }

  let route = value.trim().split('#')[0].split('?')[0];
  const absoluteUrl = route.match(/^https?:\/\/([^/]+)(\/.*)$/);
  if (absoluteUrl) {
    const [, host, pathname] = absoluteUrl;
    if (!LEGACY_PUBLIC_HOSTS.has(host)) {
      return null;
    }
    route = pathname;
  }

  const match = route.match(/^\/?(doc|api-ref)\/([^/]+)(?:\/(.*))?$/);
  if (!match) {
    return null;
  }

  const [, kind, product] = match;
  const normalizedRoute = normalizeLegacyRoute(route);
  if (!normalizedRoute) {
    return null;
  }

  return {
    kind,
    product,
    route: normalizedRoute,
  };
}

function readFileSyncSafe(filePath) {
  return createRequire(import.meta.url)('node:fs').readFileSync(
    filePath,
    'utf8',
  );
}

function readdirSyncSafe(dirPath) {
  try {
    return createRequire(import.meta.url)('node:fs').readdirSync(dirPath);
  } catch {
    return [];
  }
}

export async function syncLegacySidebarHiddenPages({
  check = false,
  contentRoot = DEFAULT_CONTENT_ROOT,
  legacyRoot = DEFAULT_LEGACY_ROOT,
  pathMapPath = DEFAULT_PATH_MAP,
  repoRoot = process.cwd(),
  write = false,
} = {}) {
  const absoluteContentRoot = path.resolve(repoRoot, contentRoot);
  const absolutePathMapPath = path.resolve(repoRoot, pathMapPath);
  const { routes, sidebarFiles } = await collectLegacyVisibleRoutes({
    legacyRoot,
    repoRoot,
  });
  const isVisibleLegacyRoute = createVisibleRouteMatcher(routes);
  const isVisibleLegacyPathMapRow = createLegacyRenderedVisibilityMatcher({
    legacyRoot,
    require: createRequire(
      path.join(repoRoot, 'scripts', 'legacy-rendered.js'),
    ),
    routes,
  });
  const rawPathMap = await readFile(absolutePathMapPath, 'utf8');
  const pathMap = parsePathMap(rawPathMap);
  const targetVisibility = collectTargetVisibility({
    contentRoot,
    isVisibleLegacyPathMapRow,
    pathMap,
    repoRoot,
  });
  const hiddenTargets = [...targetVisibility.entries()]
    .filter(([, visibility]) => !visibility.visible)
    .map(([targetPath]) => targetPath)
    .sort();
  const pagesByMetaPath = new Map();
  const metaRawUpdates = new Map();
  const missingMetaEntries = [];

  for (const targetPath of hiddenTargets) {
    const { metaPath, page } = resolveTargetMetaEntry(
      path.resolve(repoRoot, targetPath),
      absoluteContentRoot,
    );

    if (!existsSync(metaPath)) {
      missingMetaEntries.push({
        metaPath: toPosixRelative(repoRoot, metaPath),
        page,
        targetPath,
      });
      continue;
    }

    const pages = pagesByMetaPath.get(metaPath) ?? new Set();
    pages.add(page);
    pagesByMetaPath.set(metaPath, pages);
  }

  const changedMetaFiles = [];
  const pathMapUpdate = applyLegacyHiddenColumnToPathMap({
    contentRoot,
    isVisibleLegacyPathMapRow,
    isVisibleLegacyRoute,
    raw: rawPathMap,
  });

  for (const [metaPath, pages] of [...pagesByMetaPath.entries()].sort(
    ([left], [right]) => left.localeCompare(right),
  )) {
    const raw = await readFile(metaPath, 'utf8');
    const { changed, nextRaw } = hidePagesInMeta(raw, [...pages].sort());

    if (!changed) {
      continue;
    }

    metaRawUpdates.set(metaPath, nextRaw);
    changedMetaFiles.push({
      metaPath: toPosixRelative(repoRoot, metaPath),
      pages: [...pages].sort(),
    });
  }

  const emptyFolderUpdate = await hideFullyHiddenMetaFolders({
    contentRoot: absoluteContentRoot,
    metaRawUpdates,
    repoRoot,
  });
  changedMetaFiles.push(...emptyFolderUpdate.changedMetaFiles);

  if (write) {
    for (const [metaPath, nextRaw] of [...metaRawUpdates.entries()].sort(
      ([left], [right]) => left.localeCompare(right),
    )) {
      await writeFile(metaPath, nextRaw, 'utf8');
    }
  }

  if (write && pathMapUpdate.changed) {
    await writeFile(absolutePathMapPath, pathMapUpdate.nextRaw, 'utf8');
  }

  const result = {
    changedMetaFiles,
    hiddenTargets,
    missingMetaEntries,
    pathMapChanged: pathMapUpdate.changed,
    pathMapColumnAdded: pathMapUpdate.columnAdded,
    pathMapHiddenRows: pathMapUpdate.hiddenRows,
    pathMapRowsChanged: pathMapUpdate.changedRows,
    redirectTargetPaths: targetVisibility.size,
    sidebarFiles: sidebarFiles.map((filePath) =>
      toPosixRelative(legacyRoot, filePath),
    ),
    visibleLegacyRoutes: routes.size,
    visibleTargetPaths: [...targetVisibility.values()].filter(
      (visibility) => visibility.visible,
    ).length,
  };

  if (check && (changedMetaFiles.length > 0 || pathMapUpdate.changed)) {
    process.exitCode = 1;
  }

  return result;
}

function collectTargetVisibility({
  contentRoot,
  isVisibleLegacyPathMapRow,
  pathMap,
  repoRoot,
}) {
  const visibilityByTargetPath = new Map();

  for (const row of pathMap) {
    if (
      row.redirect_status !== 'redirect' ||
      !row.target_path?.startsWith(`${contentRoot}/`) ||
      !existsSync(path.resolve(repoRoot, row.target_path))
    ) {
      continue;
    }

    const visibility = visibilityByTargetPath.get(row.target_path) ?? {
      visible: false,
    };

    if (isVisibleLegacyPathMapRow(row)) {
      visibility.visible = true;
    }

    visibilityByTargetPath.set(row.target_path, visibility);
  }

  return visibilityByTargetPath;
}

export function createLegacyRenderedVisibilityMatcher({
  legacyRoot,
  require,
  routes,
}) {
  const isRouteVisible = createVisibleRouteMatcher(routes);
  const sourceRouteCache = new Map();

  return (row) => {
    if (isRouteVisible(row.old_url)) {
      return true;
    }

    if (!row.source_path) {
      return false;
    }

    const cachedRoutes =
      sourceRouteCache.get(row.source_path) ??
      resolveLegacySourceRenderedRoutes({
        legacyRoot,
        require,
        sourcePath: row.source_path,
      });
    sourceRouteCache.set(row.source_path, cachedRoutes);

    return cachedRoutes.some((route) =>
      isRouteVisible(`/${route.kind}/${route.route}`),
    );
  };
}

export function resolveLegacySourceRenderedRoutes({
  legacyRoot,
  require,
  sourcePath,
}) {
  const normalizedSourcePath = sourcePath.split(path.sep).join('/');
  const match = normalizedSourcePath.match(
    /^(docs|docs-api-reference)\/([^/]+)\/(.+)\.mdx$/,
  );
  if (!match) {
    return [];
  }

  const [, sourceKind, product, productRelativePath] = match;
  const routeBase = sourceKind === 'docs' ? 'doc' : 'api-ref';
  const productRoot = path.join(legacyRoot, sourceKind, product);
  const platformsPath = path.join(productRoot, '_platforms_.meta.js');

  if (!existsSync(platformsPath)) {
    return [];
  }

  const platforms = require(platformsPath);
  const parsedRelativePath = path.parse(productRelativePath);
  const nameItems = parsedRelativePath.name.split('.');
  const pageName = nameItems[0];
  const platformSuffixes = nameItems.slice(1);
  const matchedPlatforms =
    platformSuffixes.length > 0
      ? platforms.filter((platform) =>
          platformSuffixes.includes(platform.value),
        )
      : platforms;
  const renderedRoutes = [];

  for (const platform of matchedPlatforms) {
    const routeParts = [
      product,
      platform.value,
      ...parsedRelativePath.dir.split('/').filter(Boolean),
      pageName,
    ];
    const parsedRoute = parseLegacyInternalRoute(
      `/${routeBase}/${routeParts.join('/')}`,
    );

    if (parsedRoute) {
      renderedRoutes.push(parsedRoute);
    }
  }

  return renderedRoutes;
}

function parsePathMap(raw) {
  const [headers = [], ...rows] = parseCsv(raw);

  return rows
    .filter((row) => row.some((field) => field !== ''))
    .map((row) =>
      Object.fromEntries(
        headers.map((header, index) => [header, row[index] ?? '']),
      ),
    );
}

async function hideFullyHiddenMetaFolders({
  contentRoot,
  metaRawUpdates,
  repoRoot,
}) {
  const metaFiles = await listFiles(
    contentRoot,
    (filePath) => path.basename(filePath) === 'meta.json',
  );
  const changedMetaFiles = [];
  let changed = true;

  while (changed) {
    changed = false;

    for (const metaPath of metaFiles) {
      if (!isFullyHiddenMeta(await readMetaRaw(metaPath, metaRawUpdates))) {
        continue;
      }

      const folderPath = path.dirname(metaPath);
      if (folderPath === contentRoot) {
        continue;
      }

      const parentMetaPath = path.join(path.dirname(folderPath), 'meta.json');
      if (!existsSync(parentMetaPath)) {
        continue;
      }

      const page = path.basename(folderPath);
      const parentRaw = await readMetaRaw(parentMetaPath, metaRawUpdates);
      const { changed: parentChanged, nextRaw } = hidePagesInMeta(parentRaw, [
        page,
      ]);

      if (!parentChanged) {
        continue;
      }

      metaRawUpdates.set(parentMetaPath, nextRaw);
      changedMetaFiles.push({
        metaPath: toPosixRelative(repoRoot, parentMetaPath),
        pages: [page],
      });
      changed = true;
    }
  }

  return {
    changedMetaFiles,
  };
}

async function readMetaRaw(metaPath, metaRawUpdates) {
  return metaRawUpdates.get(metaPath) ?? (await readFile(metaPath, 'utf8'));
}

function isFullyHiddenMeta(raw) {
  const meta = JSON.parse(raw);
  if (!Array.isArray(meta.pages) || meta.pages.length === 0) {
    return false;
  }

  return meta.pages.every(
    (page) => typeof page === 'string' && page.startsWith('!'),
  );
}

async function listFiles(root, predicate) {
  if (!existsSync(root)) {
    return [];
  }

  const files = [];

  async function visit(currentDir) {
    const entries = await readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const entryPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        await visit(entryPath);
        continue;
      }

      if (entry.isFile() && predicate(entryPath)) {
        files.push(entryPath);
      }
    }
  }

  await visit(root);
  return files.sort();
}

function flattenSidebarItems(value, output = []) {
  if (!value) {
    return output;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      flattenSidebarItems(item, output);
    }
    return output;
  }

  if (typeof value !== 'object') {
    return output;
  }

  output.push(value);

  if (Array.isArray(value.items)) {
    flattenSidebarItems(value.items, output);
  }

  if (Array.isArray(value.children)) {
    flattenSidebarItems(value.children, output);
  }

  return output;
}

function createRoutePattern(route) {
  const segments = route.split('/').filter(Boolean);
  let pattern = '^';

  for (const segment of segments) {
    if (segment === '{{platform}}') {
      pattern += '(?:/[^/]+)?';
    } else {
      pattern += `/${escapeRegex(segment)}`;
    }
  }

  return new RegExp(`${pattern.replace(/^\^\//, '^')}$`);
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function toPosixRelative(root, filePath) {
  return path.relative(root, filePath).split(path.sep).join('/');
}

function parseArgs(argv) {
  const options = {
    check: false,
    contentRoot: DEFAULT_CONTENT_ROOT,
    legacyRoot: DEFAULT_LEGACY_ROOT,
    pathMapPath: DEFAULT_PATH_MAP,
    write: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--check') {
      options.check = true;
      continue;
    }

    if (arg === '--write') {
      options.write = true;
      continue;
    }

    if (arg === '--legacy-root') {
      options.legacyRoot = argv[++index];
      continue;
    }

    if (arg === '--path-map') {
      options.pathMapPath = argv[++index];
      continue;
    }

    if (arg === '--content-root') {
      options.contentRoot = argv[++index];
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = await syncLegacySidebarHiddenPages(
    parseArgs(process.argv.slice(2)),
  );
  console.log(
    JSON.stringify(
      {
        changedMetaFiles: result.changedMetaFiles.length,
        hiddenTargets: result.hiddenTargets.length,
        missingMetaEntries: result.missingMetaEntries.length,
        pathMapChanged: result.pathMapChanged,
        pathMapColumnAdded: result.pathMapColumnAdded,
        pathMapHiddenRows: result.pathMapHiddenRows,
        pathMapRowsChanged: result.pathMapRowsChanged,
        redirectTargetPaths: result.redirectTargetPaths,
        sidebarFiles: result.sidebarFiles.length,
        visibleLegacyRoutes: result.visibleLegacyRoutes,
        visibleTargetPaths: result.visibleTargetPaths,
      },
      null,
      2,
    ),
  );

  if (result.changedMetaFiles.length > 0) {
    console.log('\nMeta files requiring hidden entries:');
    for (const entry of result.changedMetaFiles) {
      console.log(`- ${entry.metaPath}: ${entry.pages.join(', ')}`);
    }
  }
}
