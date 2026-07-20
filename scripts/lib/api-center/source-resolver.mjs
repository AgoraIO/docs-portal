import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import * as cheerio from 'cheerio';
import yaml from 'js-yaml';
import { resolveExistingApiCenterTarget } from './existing-targets.mjs';

const require = createRequire(import.meta.url);
const HTTP_METHODS = new Set([
  'delete',
  'get',
  'head',
  'options',
  'patch',
  'post',
  'put',
  'trace',
]);

const TARGET_PRODUCT_ROOTS = {
  analytics: 'analytics',
  'art-class': 'online-art-teaching',
  'cloud-recording': 'cloud-recording',
  'cloud-transcoder': 'cloud-transcoding',
  console: 'console',
  'conversion-ppt': 'ppt-conversion-service',
  convoai: 'conversational-ai',
  fastboard: 'whiteboard/fastboard',
  'fusion-cdn': 'fusion-cdn',
  'media-pull': 'media-pull',
  'media-push': 'media-push',
  meeting: 'meeting',
  'one-to-one-live': 'private-room',
  'online-ktv': 'online-ktv',
  'online-music-class': 'online-music-teaching',
  recording: 'local-server-recording',
  rtc: 'rtc',
  'rtc-server-sdk': 'rtc-server-sdk',
  rtm2: 'rtm',
  'rtmp-gateway': 'rtmp-gateway',
  rtsa: 'rtsa',
  'speech-to-text': 'speech-to-text',
  teleoperation: 'teleoperation',
  'voip-callkit': 'micro-calling',
  whiteboard: 'whiteboard/whiteboard-sdk',
};

const TARGET_PLATFORM_NAMES = {
  javascript: 'web',
  rn: 'react-native',
  windows: 'cpp-all-platforms',
  csharp: 'csharp-windows',
};

const NON_VERSIONED_GENERATED_SCOPES = new Set([
  'api-ref/rtc/javascript',
  'api-ref/rtc/mini-program',
  'api-ref/rtc/react',
]);

const EDU_STORE_TYPEDOC_SOURCES = [
  {
    legacyPlatform: 'javascript',
    sourceFolder: 'Web',
    targetPlatform: 'web',
  },
  {
    legacyPlatform: 'electron',
    sourceFolder: 'Electron',
    targetPlatform: 'electron',
  },
];

function posix(value) {
  return value.split(path.sep).join('/');
}

function normalizeLegacyPath(value) {
  let pathname;
  try {
    pathname = new URL(value, 'https://doc.shengwang.cn').pathname;
  } catch {
    pathname = String(value ?? '');
  }
  pathname = decodeURIComponent(pathname).replace(/\/+$/, '');
  return pathname.endsWith('.html')
    ? pathname.slice(0, -'.html'.length)
    : pathname;
}

function parseLegacyRoute(urlValue) {
  const pathname = normalizeLegacyPath(urlValue);
  const segments = pathname.split('/').filter(Boolean);
  if (
    segments.length < 4 ||
    (segments[0] !== 'api-ref' && segments[0] !== 'doc')
  ) {
    return null;
  }
  return {
    pathname,
    family: segments[0],
    product: segments[1],
    platform: segments[2],
    relative: segments.slice(3).join('/'),
    segments,
    scopeKey: segments.slice(0, 3).join('/'),
  };
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function walkFiles(root, predicate, prefix = '') {
  const result = [];
  if (!(await fileExists(root))) return result;
  const entries = await fs.readdir(root, { withFileTypes: true });
  entries.sort((left, right) => left.name.localeCompare(right.name));
  for (const entry of entries) {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    const absolute = path.join(root, entry.name);
    if (entry.isDirectory()) {
      result.push(...(await walkFiles(absolute, predicate, relative)));
    } else if (entry.isFile() && predicate(entry.name, relative)) {
      result.push({ absolute, relative });
    }
  }
  return result;
}

async function supplementalEduStoreResolution(page, newRoot) {
  const source = page.supplementalGeneratedSource;
  const targetPath = source.targetPath;
  const targetExists = await fileExists(path.resolve(newRoot, targetPath));
  return {
    status: 'resolved',
    type: 'generated-html',
    generator: 'typedoc',
    sourcePath: source.sourcePath,
    sourceRelativePath: source.sourceRelativePath,
    targetPath,
    targetRoute: source.targetRoute,
    targetExists,
    route: {
      platform: source.legacyPlatform,
      scopeKey: `api-ref/flexible-classroom/${source.legacyPlatform}`,
    },
    migrationAction: targetExists ? 'audit-existing-target' : 'generate-mdx',
  };
}

export function parseTypeDocNavigationHtml(html) {
  const $ = cheerio.load(html);
  return $('nav.tsd-navigation > ul > li > a')
    .toArray()
    .map((node) => {
      const anchor = $(node);
      const href = anchor.attr('href')?.split(/[?#]/, 1)[0];
      const label = anchor.text().replace(/\s+/g, ' ').trim();
      if (!href || !label) return null;
      return {
        label,
        sourceRelativePath: decodeURIComponent(href).replace(/^\.\//, ''),
      };
    })
    .filter(Boolean);
}

async function addSupplementalEduStoreEvidence(manifest, oldRoot) {
  const retained = (manifest.pageEvidence ?? []).filter(
    (page) => page.supplementalGeneratedSource?.kind !== 'edu-store-typedoc',
  );
  const supplemental = [];
  for (const source of EDU_STORE_TYPEDOC_SOURCES) {
    const sourceRoot = path.resolve(
      oldRoot,
      'html-docs/flexible-classroom',
      source.sourceFolder,
    );
    const files = await walkFiles(sourceRoot, (name) =>
      name.toLowerCase().endsWith('.html'),
    );
    const overviewFile = files.find((file) => file.relative === 'index.html');
    const sourceNavigation = overviewFile
      ? parseTypeDocNavigationHtml(
          await fs.readFile(overviewFile.absolute, 'utf8'),
        )
      : [];
    for (const file of files) {
      const isOverview = file.relative === 'index.html';
      const sourceStem = file.relative.replace(/\.html$/i, '');
      const normalizedSourceStem = sourceStem
        .split('/')
        .map(kebabSegment)
        .filter(Boolean)
        .join('/');
      const routeStem = isOverview
        ? 'edu-store'
        : `edu-store/${normalizedSourceStem}`;
      const targetStem = isOverview
        ? 'edu-store/index'
        : sourceStem === 'modules'
          ? 'edu-store/modules/index'
          : routeStem;
      const legacySuffix = isOverview ? 'overview' : file.relative;
      const requestedUrl = `https://doc.shengwang.cn/api-ref/flexible-classroom/${source.legacyPlatform}/${legacySuffix}`;
      const targetRoute = `/zh-CN/api-reference/flexible-classroom/${source.targetPlatform}/api-reference/${routeStem}`;
      supplemental.push({
        requestedUrl,
        finalUrl: requestedUrl,
        status: 'resolved',
        adoptExisting: isOverview,
        supplementalGeneratedSource: {
          kind: 'edu-store-typedoc',
          legacyPlatform: source.legacyPlatform,
          targetPlatform: source.targetPlatform,
          sourcePath: posix(path.relative(oldRoot, file.absolute)),
          sourceRelativePath: file.relative,
          targetPath: `content/docs/zh-CN/api-reference/flexible-classroom/${source.targetPlatform}/api-reference/${targetStem}.mdx`,
          targetRoute,
          ...(isOverview ? { sourceNavigation } : {}),
        },
      });
    }
  }
  manifest.pageEvidence = [...retained, ...supplemental];
}

function tocSlug(sourceName) {
  return path
    .basename(sourceName, path.extname(sourceName))
    .replace(/^toc_/, '')
    .replace(/_/g, '-')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^A-Za-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

function parseOxygenTocList($, list) {
  return list
    .children('li')
    .toArray()
    .map((node) => {
      const item = $(node);
      const anchor = item.children('a').first();
      const href = anchor.attr('href');
      if (!href) return null;
      const children = parseOxygenTocList($, item.children('ul').first());
      return { sourceRelativePath: href.split(/[?#]/, 1)[0], children };
    })
    .filter(Boolean);
}

function normalizeSourceNavigationLink(href, legacyUrl) {
  if (!href) return null;
  const url = new URL(href, legacyUrl);
  url.pathname = url.pathname.replace(/\.html$/i, '');
  return {
    url: url.href,
    origin: url.origin,
    path: url.pathname,
    search: url.search,
    fragment: url.hash
      ? decodeSourceNavigationFragment(url.hash.slice(1))
      : null,
  };
}

function decodeSourceNavigationFragment(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function parseOxygenNavigationList($, list, legacyUrl) {
  return list
    .children('li')
    .toArray()
    .map((node) => {
      const item = $(node);
      const anchor = item.children('a').first();
      const labelNode =
        anchor.length > 0 ? anchor : item.children('span').first();
      const label = labelNode.text().replace(/\s+/g, ' ').trim();
      const link = normalizeSourceNavigationLink(
        anchor.attr('href'),
        legacyUrl,
      );
      const children = parseOxygenNavigationList(
        $,
        item.children('ul').first(),
        legacyUrl,
      );
      if (!label || (!link && children.length === 0)) return null;
      return children.length > 0
        ? { kind: 'category', label, link, items: children }
        : { kind: 'link', label, link, excludedReason: null };
    })
    .filter(Boolean);
}

export function parseOxygenNavigationHtml({ html, legacyUrl }) {
  const $ = cheerio.load(html);
  const root = $('nav.toc > ul > li > ul').first().length
    ? $('nav.toc > ul > li > ul').first()
    : $('nav > ul > li > ul').first();
  return root.length > 0 ? parseOxygenNavigationList($, root, legacyUrl) : [];
}

async function resolveSourceNavigationTargets(items, context) {
  const resolved = [];
  for (const item of items) {
    let link = item.link;
    if (link?.url) {
      const resolution = await resolveLegacyPage({
        page: { requestedUrl: link.url, status: 'resolved' },
        ...context,
      });
      link = {
        ...link,
        targetPath: resolution.targetPath ?? null,
        targetRoute: resolution.targetRoute ?? null,
      };
    }
    resolved.push({
      ...item,
      link,
      ...(item.items
        ? {
            items: await resolveSourceNavigationTargets(item.items, context),
          }
        : {}),
    });
  }
  return resolved;
}

function assignOxygenTocRoutes(nodes, parentSegments, targetIndex) {
  for (const node of nodes) {
    const slug = tocSlug(node.sourceRelativePath);
    const isFolder = node.children.length > 0;
    const routeSegments = isFolder
      ? [...parentSegments, slug, 'index']
      : [...parentSegments, slug];
    targetIndex.set(
      node.sourceRelativePath.toLowerCase(),
      routeSegments.join('/'),
    );
    if (isFolder) {
      assignOxygenTocRoutes(
        node.children,
        [...parentSegments, slug],
        targetIndex,
      );
    }
  }
}

export async function oxygenTocTargetIndex(sourceRoot) {
  const indexPath = path.join(sourceRoot, 'index.html');
  if (!(await fileExists(indexPath))) return new Map();
  const $ = cheerio.load(await fs.readFile(indexPath, 'utf8'));
  const root = $('nav.toc > ul > li > ul').first().length
    ? $('nav.toc > ul > li > ul').first()
    : $('nav > ul > li > ul').first();
  if (root.length === 0) return new Map();
  const result = new Map();
  assignOxygenTocRoutes(parseOxygenTocList($, root), [], result);
  return result;
}

function activeProductMetadata(familyRoot) {
  const productsPath = path.join(familyRoot, '_products_.meta.js');
  const products = require(productsPath);
  return new Map(products.map((product) => [product.value, product]));
}

function addCandidate(index, key, value) {
  const values = index.get(key) ?? [];
  values.push(value);
  index.set(key, values);
}

function manualRouteKey(family, product, platform, relative) {
  return `${family}/${product}/${platform}/${relative}`.toLowerCase();
}

export async function buildLegacySourceIndex(oldRoot) {
  const manualSpecific = new Map();
  const manualGeneric = new Map();
  const platforms = new Map();
  const generatedFiles = new Map();
  const generatedTocTargets = new Map();
  const yamlFiles = new Map();

  for (const [family, folder] of [
    ['api-ref', 'docs-api-reference'],
    ['doc', 'docs'],
  ]) {
    const familyRoot = path.join(oldRoot, folder);
    const products = activeProductMetadata(familyRoot);
    for (const [product, productMeta] of products) {
      const productFolder = path.resolve(
        familyRoot,
        productMeta.source ?? product,
      );
      const platformMetaPath = path.join(productFolder, '_platforms_.meta.js');
      if (!(await fileExists(platformMetaPath))) continue;
      const productPlatforms = require(platformMetaPath);
      const platformValues = new Set(
        productPlatforms.map((item) => item.value),
      );
      for (const platformMeta of productPlatforms) {
        const key = `${family}/${product}/${platformMeta.value}`.toLowerCase();
        const sourceRoot = platformMeta.source
          ? family === 'api-ref'
            ? path.resolve(
                oldRoot,
                'html-docs',
                productMeta.source ?? product,
                platformMeta.source,
              )
            : path.resolve(oldRoot, 'html-docs', product, platformMeta.source)
          : null;
        platforms.set(key, {
          family,
          folder,
          product,
          productMeta,
          platform: platformMeta.value,
          platformMeta,
          sourceRoot,
        });
        if (sourceRoot && (await fileExists(sourceRoot))) {
          if (platformMeta.docType === 'restful') {
            const yamls = await walkFiles(sourceRoot, (name) =>
              /\.ya?ml$/i.test(name),
            );
            yamlFiles.set(key, yamls);
          } else if (
            ['appledoc', 'doxygen', 'oxygen', 'typedoc'].includes(
              platformMeta.docType,
            )
          ) {
            const htmlFiles = await walkFiles(sourceRoot, (name) =>
              name.toLowerCase().endsWith('.html'),
            );
            generatedFiles.set(
              key,
              new Map(
                htmlFiles.map((file) => [file.relative.toLowerCase(), file]),
              ),
            );
            if (platformMeta.docType === 'oxygen') {
              generatedTocTargets.set(
                key,
                await oxygenTocTargetIndex(sourceRoot),
              );
            }
          }
        }
      }

      const manualFiles = await walkFiles(
        productFolder,
        (name, relative) =>
          name.endsWith('.mdx') &&
          !relative.split('/').some((segment) => segment.startsWith('_')),
      );
      for (const file of manualFiles) {
        const dirname = posix(path.dirname(file.relative));
        const parts = path.basename(file.relative).split('.');
        const leaf = parts[0];
        const suffixes = parts.slice(1, -1);
        const relative = dirname === '.' ? leaf : `${dirname}/${leaf}`;
        const matched = [...platformValues].filter((platform) =>
          suffixes.includes(platform),
        );
        if (matched.length > 0) {
          for (const platform of matched) {
            addCandidate(
              manualSpecific,
              manualRouteKey(family, product, platform, relative),
              {
                sourcePath: posix(path.relative(oldRoot, file.absolute)),
                sourceAbsolutePath: file.absolute,
                override: 'platform-specific',
              },
            );
          }
        } else if (suffixes.length === 0) {
          for (const platform of platformValues) {
            addCandidate(
              manualGeneric,
              manualRouteKey(family, product, platform, relative),
              {
                sourcePath: posix(path.relative(oldRoot, file.absolute)),
                sourceAbsolutePath: file.absolute,
                override: 'generic-fallback',
              },
            );
          }
        }
      }
    }
  }

  return {
    oldRoot,
    manualSpecific,
    manualGeneric,
    platforms,
    generatedFiles,
    generatedTocTargets,
    yamlFiles,
  };
}

export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let index = 0; index < text.length; index++) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
    } else if (character === '"') {
      quoted = true;
    } else if (character === ',') {
      row.push(field);
      field = '';
    } else if (character === '\n') {
      row.push(field.replace(/\r$/, ''));
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += character;
    }
  }
  if (field || row.length > 0) {
    row.push(field.replace(/\r$/, ''));
    rows.push(row);
  }
  const [headers = [], ...values] = rows;
  return values
    .filter((value) => value.some(Boolean))
    .map((value) =>
      Object.fromEntries(
        headers.map((header, index) => [header, value[index] ?? '']),
      ),
    );
}

export function buildPathMapIndex(rows) {
  const byLegacyPath = new Map();
  const bySourcePath = new Map();
  for (const row of rows) {
    if (row.old_url) {
      addCandidate(byLegacyPath, normalizeLegacyPath(row.old_url), row);
    }
    if (row.source_path) addCandidate(bySourcePath, row.source_path, row);
  }
  return { byLegacyPath, bySourcePath };
}

function normalizeApiPath(value) {
  return value
    .toLowerCase()
    .replace(/\{[^}]+\}/g, '{}')
    .replace(/\/+$/, '');
}

async function operationIndex(yamlPath) {
  const api = yaml.load(await fs.readFile(yamlPath, 'utf8'));
  const byId = new Map();
  const bySignature = new Map();
  for (const [apiPath, pathItem] of Object.entries(api.paths ?? {})) {
    for (const [method, operation] of Object.entries(pathItem ?? {})) {
      if (!HTTP_METHODS.has(method.toLowerCase()) || !operation?.operationId) {
        continue;
      }
      const record = {
        operationId: operation.operationId,
        method: method.toLowerCase(),
        apiPath,
      };
      byId.set(operation.operationId, record);
      addCandidate(
        bySignature,
        `${record.method} ${normalizeApiPath(apiPath)}`,
        record,
      );
    }
  }
  return { byId, bySignature };
}

function laneForLegacyYaml(route, lanes) {
  const candidates = lanes.filter(
    (lane) =>
      (!lane.locales || lane.locales.includes('zh-CN')) &&
      lane.sourcePath?.['zh-CN'] &&
      (lane.id === 'convoai'
        ? route.product === 'convoai'
        : lane.id === 'agora-analytics-rest'
          ? route.product === 'analytics'
          : lane.id === 'ppt-conversion-rest'
            ? route.product === 'conversion-ppt'
            : lane.id === 'cloud-transcoding-rest-zh-cn'
              ? route.product === 'cloud-transcoder'
              : lane.id === 'media-gateway-rest-zh-cn'
                ? route.product === 'rtmp-gateway'
                : lane.id === 'rtc-rest-zh-cn'
                  ? route.product === 'rtc'
                  : lane.id.startsWith(`${route.product}-`) ||
                    lane.id === `${route.product}-rest`),
  );
  if (route.product === 'whiteboard') {
    return lanes.find((lane) => lane.id === 'whiteboard-rest') ?? null;
  }
  if (route.product === 'voip-callkit') {
    return lanes.find((lane) => lane.id === 'voip-callkit-rest') ?? null;
  }
  if (route.product === 'cloud-recording') {
    return lanes.find((lane) => lane.id === 'cloud-recording-rest') ?? null;
  }
  if (route.product === 'speech-to-text') {
    return lanes.find((lane) => lane.id === 'speech-to-text-rest') ?? null;
  }
  if (route.product === 'fusion-cdn') {
    return lanes.find((lane) => lane.id === 'fusion-cdn-rest') ?? null;
  }
  if (route.product === 'media-pull') {
    return lanes.find((lane) => lane.id === 'media-pull-rest') ?? null;
  }
  if (route.product === 'media-push') {
    return lanes.find((lane) => lane.id === 'media-push-rest') ?? null;
  }
  return candidates.length === 1 ? candidates[0] : null;
}

async function resolveOpenApi(route, metadata, sourceIndex, lanes, newRoot) {
  if (metadata?.platformMeta.docType !== 'restful') return null;
  const operationMarker = route.segments.lastIndexOf('operations');
  if (operationMarker < 0 || operationMarker === route.segments.length - 1) {
    return null;
  }
  const operationId = route.segments[operationMarker + 1];
  const yamlStem = route.segments[operationMarker - 1]?.toLowerCase();
  const yamlCandidates = (
    sourceIndex.yamlFiles.get(route.scopeKey) ?? []
  ).filter(
    (file) =>
      path
        .basename(file.relative, path.extname(file.relative))
        .toLowerCase() === yamlStem,
  );
  if (yamlCandidates.length !== 1) {
    return {
      status: yamlCandidates.length === 0 ? 'unresolved' : 'ambiguous',
      reason: `Expected one legacy OpenAPI YAML named ${yamlStem}; found ${yamlCandidates.length}.`,
      candidates: yamlCandidates.map((file) => file.relative),
    };
  }
  const legacyYaml = yamlCandidates[0];
  const lane = laneForLegacyYaml(route, lanes);
  if (!lane) {
    return {
      status: 'unresolved',
      reason: `No zh-CN OpenAPI lane is registered for ${route.product}.`,
      candidates: [],
    };
  }
  const newYamlPath = path.resolve(newRoot, lane.sourcePath['zh-CN']);
  if (!(await fileExists(newYamlPath))) {
    return {
      status: 'unresolved',
      reason: `Registered OpenAPI YAML is missing: ${lane.sourcePath['zh-CN']}.`,
      candidates: [],
    };
  }
  const [legacyOperations, newOperations] = await Promise.all([
    operationIndex(legacyYaml.absolute),
    operationIndex(newYamlPath),
  ]);
  const legacyOperation = legacyOperations.byId.get(operationId);
  if (!legacyOperation) {
    return {
      status: 'unresolved',
      reason: `Legacy operationId ${operationId} is absent from ${legacyYaml.relative}.`,
      candidates: [],
    };
  }
  let targetOperationId = lane.operations[operationId] ? operationId : null;
  if (!targetOperationId) {
    const signature = `${legacyOperation.method} ${normalizeApiPath(legacyOperation.apiPath)}`;
    const matches = (newOperations.bySignature.get(signature) ?? []).filter(
      (operation) => lane.operations[operation.operationId],
    );
    if (matches.length === 1) targetOperationId = matches[0].operationId;
  }
  if (!targetOperationId) {
    return {
      status: 'unresolved',
      reason: `No registered target operation matches ${operationId} (${legacyOperation.method.toUpperCase()} ${legacyOperation.apiPath}).`,
      candidates: [],
    };
  }
  const operation = lane.operations[targetOperationId];
  return {
    status: 'resolved',
    type: 'openapi',
    generator: 'openapi',
    sourcePath: posix(path.relative(sourceIndex.oldRoot, legacyYaml.absolute)),
    legacyOperationId: operationId,
    targetOperationId,
    targetPath: lane.sourcePath['zh-CN'],
    targetRoute: `${lane.parentUrl['zh-CN']}/${operation.routeLeaf}`,
    targetExists: true,
    laneId: lane.id,
    migrationAction: 'preserve-openapi-lane',
  };
}

function generatedHtmlCandidate(route, metadata, sourceIndex) {
  if (!metadata) return null;
  const docType = metadata.platformMeta.docType;
  if (!['appledoc', 'doxygen', 'oxygen', 'typedoc'].includes(docType)) {
    return null;
  }
  const files = sourceIndex.generatedFiles.get(route.scopeKey);
  if (!files) return null;
  const candidates = [`${route.relative}.html`.toLowerCase()];
  if (['overview', 'api-overview'].includes(route.relative.toLowerCase())) {
    candidates.push('index.html');
  }
  const file = candidates
    .map((candidate) => files.get(candidate))
    .find(Boolean);
  return file
    ? {
        status: 'resolved',
        type: 'generated-html',
        generator: docType,
        sourcePath: posix(path.relative(sourceIndex.oldRoot, file.absolute)),
        sourceRelativePath: file.relative,
      }
    : null;
}

function kebabSegment(value) {
  return value
    .replace(/\.html$/i, '')
    .replace(/_/g, '-')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9.-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

function generatedTarget(route, resolution, sourceIndex) {
  const productRoot = TARGET_PRODUCT_ROOTS[route.product] ?? route.product;
  let platform = TARGET_PLATFORM_NAMES[route.platform] ?? route.platform;
  let relative =
    sourceIndex.generatedTocTargets
      ?.get(route.scopeKey)
      ?.get(resolution.sourceRelativePath?.toLowerCase()) ?? route.relative;
  if (route.product === 'convoai' && ['go', 'java'].includes(route.platform)) {
    platform = `restclient-${route.platform}`;
  }
  if (route.product === 'recording') platform = `${platform}/legacy`;
  if (route.product === 'rtc' && route.platform === 'react') {
    platform = 'react-sdk/web-sdk';
  }
  if (relative.startsWith('API/')) relative = relative.slice('API/'.length);
  const normalized = relative
    .split('/')
    .map(kebabSegment)
    .filter(Boolean)
    .join('/');
  const current = NON_VERSIONED_GENERATED_SCOPES.has(route.scopeKey)
    ? ''
    : '/(current)';
  const folder = `${productRoot}/${platform}${current}`.replace(/\/+/, '/');
  const targetPath = `content/docs/zh-CN/api-reference/${folder}/${normalized}.mdx`;
  const publicRelative = normalized.replace(/\/index$/, '');
  const targetRoute =
    `/zh-CN/api-reference/${productRoot}/${platform}/${publicRelative}`.replace(
      /\/+/g,
      '/',
    );
  return { targetPath, targetRoute };
}

function inferredManualTarget(route, sourcePath) {
  const productRoot = TARGET_PRODUCT_ROOTS[route.product] ?? route.product;
  let platform = TARGET_PLATFORM_NAMES[route.platform] ?? route.platform;
  if (route.product === 'convoai' && ['go', 'java'].includes(route.platform)) {
    platform = `restclient-${route.platform}`;
  }
  if (route.product === 'fastboard') platform = '';
  if (route.family === 'doc' && route.product === 'convoai')
    platform = 'rest-api';
  const normalized = route.relative
    .split('/')
    .map(kebabSegment)
    .filter(Boolean)
    .join('/');
  const folder = [productRoot, platform].filter(Boolean).join('/');
  const targetPath = `content/docs/zh-CN/api-reference/${folder}/${normalized}.mdx`;
  return {
    targetPath,
    targetRoute: `/${targetPath}`
      .replace('/content/docs/zh-CN/', '/zh-CN/')
      .replace(/\.mdx$/, ''),
    targetDecision: `inferred-from-${sourcePath}`,
  };
}

function selectPathMapTarget(route, sourcePath, pathMap) {
  const rows = [
    ...(pathMap.byLegacyPath.get(route.pathname) ?? []),
    ...(pathMap.bySourcePath.get(sourcePath) ?? []),
  ];
  const usable = rows.filter((row) => row.target_path || row.new_url);
  const unique = new Map(
    usable.map((row) => [
      `${row.target_path}\u001f${row.new_url}`,
      {
        targetPath: row.target_path || null,
        targetRoute: row.new_url || null,
        targetDecision: 'path-map',
      },
    ]),
  );
  return unique.size === 1 ? [...unique.values()][0] : null;
}

async function selectManualTarget(route, sourcePath, pathMap, newRoot) {
  const mapped = selectPathMapTarget(route, sourcePath, pathMap);
  const inferred = inferredManualTarget(route, sourcePath);
  const existingTarget = async (target) => {
    if (!target?.targetPath) return null;
    if (await fileExists(path.resolve(newRoot, target.targetPath)))
      return target;
    const alternatePath = target.targetPath.endsWith('.md')
      ? `${target.targetPath}x`
      : target.targetPath.endsWith('.mdx')
        ? target.targetPath.slice(0, -1)
        : null;
    if (
      !alternatePath ||
      !(await fileExists(path.resolve(newRoot, alternatePath)))
    ) {
      return null;
    }
    return {
      ...target,
      targetPath: alternatePath,
      targetDecision: `${target.targetDecision}-alternate-extension`,
    };
  };
  const existingMapped = await existingTarget(mapped);
  if (existingMapped) return existingMapped;
  const existingInferred = await existingTarget(inferred);
  if (existingInferred) {
    return {
      ...existingInferred,
      targetDecision: mapped
        ? 'existing-target-layout-over-stale-path-map'
        : existingInferred.targetDecision,
    };
  }
  if (mapped?.targetPath?.startsWith('content/docs/zh-CN/api-reference/')) {
    return mapped;
  }
  return {
    ...inferred,
    targetDecision: mapped
      ? 'api-reference-fallback-over-missing-external-path-map'
      : inferred.targetDecision,
  };
}

function resolutionFailure(status, route, reason, candidates = []) {
  return {
    status,
    type: status,
    sourcePath: null,
    targetPath: null,
    targetRoute: null,
    route,
    reason,
    candidates,
  };
}

export async function resolveLegacyPage({
  page,
  sourceIndex,
  pathMap,
  lanes,
  newRoot,
}) {
  if (page.aliasOf) {
    return {
      status: 'alias',
      type: 'alias',
      aliasOf: page.aliasOf,
      sourcePath: null,
      targetPath: null,
      targetRoute: null,
    };
  }
  if (
    page.status === 'warning' &&
    page.warnings?.some((warning) => warning.code === 'broken-live-body-link')
  ) {
    return {
      status: 'excluded',
      type: 'broken-live-link',
      reason:
        'The live source link is broken and has no visible body to migrate.',
      sourcePath: null,
      targetPath: null,
      targetRoute: null,
    };
  }
  const route = parseLegacyRoute(page.requestedUrl);
  if (!route) {
    return resolutionFailure(
      'unresolved',
      null,
      `Unsupported legacy route: ${page.requestedUrl}.`,
    );
  }
  const metadata = sourceIndex.platforms.get(route.scopeKey);
  if (!metadata) {
    return resolutionFailure(
      'unresolved',
      route,
      `No active old-site metadata exists for ${route.scopeKey}.`,
    );
  }
  const manualKey = manualRouteKey(
    route.family,
    route.product,
    route.platform,
    route.relative,
  );
  const specific = sourceIndex.manualSpecific.get(manualKey) ?? [];
  if (specific.length > 1) {
    return resolutionFailure(
      'ambiguous',
      route,
      'Multiple platform-specific MDX files override the same route.',
      specific.map((candidate) => candidate.sourcePath),
    );
  }
  let resolution;
  if (specific.length === 1) {
    resolution = {
      status: 'resolved',
      type: 'manual-mdx',
      generator: 'legacy-mdx',
      ...specific[0],
    };
  } else {
    const openapi = await resolveOpenApi(
      route,
      metadata,
      sourceIndex,
      lanes,
      newRoot,
    );
    if (openapi) {
      if (openapi.status !== 'resolved') return { ...openapi, route };
      return { ...openapi, route };
    }
    resolution = generatedHtmlCandidate(route, metadata, sourceIndex);
    if (!resolution) {
      const generic = sourceIndex.manualGeneric.get(manualKey) ?? [];
      if (generic.length > 1) {
        return resolutionFailure(
          'ambiguous',
          route,
          'Multiple generic MDX files fill the same route.',
          generic.map((candidate) => candidate.sourcePath),
        );
      }
      if (generic.length === 1) {
        resolution = {
          status: 'resolved',
          type: 'manual-mdx',
          generator: 'legacy-mdx',
          ...generic[0],
        };
      }
    }
  }
  if (!resolution) {
    return resolutionFailure(
      'unresolved',
      route,
      `No platform-specific MDX, generated source, or generic MDX produces ${route.pathname}.`,
    );
  }
  const target =
    resolveExistingApiCenterTarget(page.requestedUrl) ??
    (resolution.type === 'manual-mdx'
      ? await selectManualTarget(route, resolution.sourcePath, pathMap, newRoot)
      : generatedTarget(route, resolution, sourceIndex));
  const targetPath = target.targetPath;
  const targetExists = targetPath
    ? await fileExists(path.resolve(newRoot, targetPath))
    : false;
  const { sourceAbsolutePath: _sourceAbsolutePath, ...portableResolution } =
    resolution;
  return {
    ...portableResolution,
    ...target,
    route,
    targetExists,
    migrationAction: targetExists
      ? 'audit-existing-target'
      : resolution.type === 'manual-mdx'
        ? 'migrate-mdx'
        : 'generate-mdx',
  };
}

function summarizeResolutions(pages) {
  const logical = pages.filter((page) => !page.aliasOf);
  const classified = logical.filter(
    (page) =>
      !['excluded', 'unresolved', 'ambiguous'].includes(
        page.sourceResolution.status,
      ),
  );
  const byType = {};
  const byGenerator = {};
  for (const page of logical) {
    const resolution = page.sourceResolution;
    byType[resolution.type] = (byType[resolution.type] ?? 0) + 1;
    if (resolution.generator) {
      byGenerator[resolution.generator] =
        (byGenerator[resolution.generator] ?? 0) + 1;
    }
  }
  return {
    logicalPageCount: logical.length,
    classifiedPageCount: classified.length,
    excludedPageCount: logical.filter(
      (page) => page.sourceResolution.status === 'excluded',
    ).length,
    unresolvedPageCount: logical.filter(
      (page) => page.sourceResolution.status === 'unresolved',
    ).length,
    ambiguousPageCount: logical.filter(
      (page) => page.sourceResolution.status === 'ambiguous',
    ).length,
    existingTargetCount: logical.filter(
      (page) => page.sourceResolution.targetExists,
    ).length,
    byType,
    byGenerator,
  };
}

export async function resolveManifestSources(
  manifest,
  { oldRoot, newRoot, pathMapRows, lanes },
) {
  if (!Array.isArray(manifest.pageEvidence)) {
    throw new Error('Manifest has no pageEvidence; run the page graph first.');
  }
  await addSupplementalEduStoreEvidence(manifest, oldRoot);
  const sourceIndex = await buildLegacySourceIndex(oldRoot);
  const pathMap = buildPathMapIndex(pathMapRows);
  const pages = [];
  for (const page of manifest.pageEvidence) {
    const sourceResolution = page.supplementalGeneratedSource
      ? await supplementalEduStoreResolution(page, newRoot)
      : await resolveLegacyPage({
          page,
          sourceIndex,
          pathMap,
          lanes,
          newRoot,
        });
    pages.push({
      ...page,
      sourceResolution,
    });
  }
  manifest.pageEvidence = pages;
  manifest.sourceResolutionSummary = summarizeResolutions(pages);
  const entries = [];
  for (const entry of manifest.entries) {
    if (entry.scope !== 'current') {
      entries.push(entry);
      continue;
    }
    const route = parseLegacyRoute(entry.legacyUrl);
    const scopePages = pages.filter(
      (page) =>
        !page.aliasOf &&
        page.sourceResolution.route?.scopeKey === route?.scopeKey,
    );
    const types = [
      ...new Set(scopePages.map((page) => page.sourceResolution.type)),
    ];
    const entryPage = pages.find(
      (page) => normalizeLegacyPath(page.requestedUrl) === route?.pathname,
    );
    let pageGraph = entry.pageGraph;
    if (
      route?.product === 'rtc' &&
      entryPage?.sourceResolution.generator === 'oxygen' &&
      entryPage.sourceResolution.sourcePath
    ) {
      const sourceNavigation = await resolveSourceNavigationTargets(
        parseOxygenNavigationHtml({
          html: await fs.readFile(
            path.resolve(
              sourceIndex.oldRoot,
              entryPage.sourceResolution.sourcePath,
            ),
            'utf8',
          ),
          legacyUrl: entry.legacyUrl,
        }),
        { sourceIndex, pathMap, lanes, newRoot },
      );
      if (sourceNavigation.length > 0) {
        pageGraph = {
          ...pageGraph,
          sourceNavigation,
          sourceNavigationSource: entryPage.sourceResolution.sourcePath,
        };
      }
    }
    entries.push({
      ...entry,
      pageGraph,
      sourceType:
        types.filter((type) => type !== 'broken-live-link').length > 1
          ? 'mixed'
          : (types.find((type) => type !== 'broken-live-link') ?? 'unresolved'),
      sourceResolution: {
        status: scopePages.some(
          (page) => page.sourceResolution.status === 'ambiguous',
        )
          ? 'ambiguous'
          : scopePages.some(
                (page) => page.sourceResolution.status === 'unresolved',
              )
            ? 'unresolved'
            : 'resolved',
        pageCount: scopePages.length,
        sourceTypes: types,
      },
      targetPath: entryPage?.sourceResolution.targetPath ?? null,
      targetRoute: entryPage?.sourceResolution.targetRoute ?? null,
    });
  }
  manifest.entries = entries;
  return manifest;
}
