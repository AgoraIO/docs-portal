import fs from 'node:fs/promises';
import path from 'node:path';
import { OPENAPI_LANES } from '../../../src/lib/openapi/lanes.ts';
import { resolveExistingApiCenterTarget } from './existing-targets.mjs';
import {
  ApiCenterMigrationRun,
  buildLegacyRouteMap,
  renderGeneratedMdx,
} from './migration-framework.mjs';

const API_CENTER_URL = 'https://doc.shengwang.cn/api-center';
const API_REFERENCE_ROOT = 'content/docs/zh-CN/api-reference';
const MANIFEST_SOURCE = 'docs/migration/api-center-html-manifest.json';
const FOCUSED_LANE_ROOTS = [
  'api-ref',
  'conversational-ai',
  'rtc',
  'rtm',
  'local-server-recording',
  'flexible-classroom',
  'cloud-recording',
  'rtc-server-sdk',
];

const PRODUCT_ICONS = new Map([
  ['对话式 AI 引擎', 'ai'],
  ['实时互动 RTC', 'rtc'],
  ['实时消息 RTM', 'signaling'],
  ['即时通讯 IM', 'messaging'],
  ['融合 CDN 直播', 'live-streaming'],
  ['媒体流加速 RTSA', 'broadcast'],
  ['互动白板', 'whiteboard'],
  ['微呼叫', 'voice-calling'],
  ['水晶球', 'analytics'],
  ['实时转录翻译', 'transcription'],
  ['云端录制', 'cloud-recording'],
  ['本地服务端录制', 'on-premise-recording'],
  ['旁路推流', 'media-push'],
  ['输入在线媒体流', 'media-pull'],
  ['云端转码', 'transcoding'],
  ['RTMP 网关', 'rtmp-gateway'],
  ['RTC 服务端 SDK', 'server-sdk'],
  ['PPT 转码服务', 'transcoding'],
  ['控制台', 'tools'],
  ['灵动会议', 'meeting'],
  ['在线 K 歌房', 'voice-calling'],
  ['1v1 私密房', 'video-calling'],
  ['在线美术教学', 'classroom'],
  ['在线音乐教学', 'classroom'],
  ['平行操控', 'iot'],
]);

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function normalizeLegacyKey(value) {
  const url = new URL(value, API_CENTER_URL);
  url.hash = '';
  url.pathname = url.pathname.replace(/\.html$/i, '');
  return `${url.origin}${url.pathname}${url.search}`;
}

function evidenceIndex(manifest) {
  const byUrl = new Map();
  for (const page of manifest.pageEvidence ?? []) {
    byUrl.set(normalizeLegacyKey(page.requestedUrl), page);
  }
  return byUrl;
}

function resolveEvidence(page, byUrl) {
  if (!page?.aliasOf) return page;
  return byUrl.get(normalizeLegacyKey(page.aliasOf)) ?? page;
}

function targetRouteForUrl(url, routeMap) {
  if (!url) return null;
  const parsed = new URL(url, API_CENTER_URL);
  parsed.hash = '';
  return (
    resolveExistingApiCenterTarget(parsed)?.targetRoute ??
    routeMap.get(parsed.href) ??
    routeMap.get(`${parsed.pathname}${parsed.search}`) ??
    routeMap.get(parsed.pathname) ??
    (parsed.hostname === 'doc.shengwang.cn' ? null : parsed.href)
  );
}

function visibleNavigationLeaves(items, routeMap, trail = []) {
  const leaves = [];
  for (const item of items ?? []) {
    if (!item || item.excludedReason) continue;
    const nextTrail = [...trail, item.label];
    if (item.kind === 'category' && (item.items?.length ?? 0) > 0) {
      leaves.push(...visibleNavigationLeaves(item.items, routeMap, nextTrail));
      continue;
    }
    leaves.push({
      label: item.label,
      trail: nextTrail,
      sourceUrl: item.link?.url ?? null,
      targetRoute: targetRouteForUrl(item.link?.url, routeMap),
    });
  }
  return leaves;
}

function routeMetaLink(label, href, rootRoute) {
  const escapedLabel = String(label ?? href).replace(/([\]\\])/g, '\\$1');
  if (href.startsWith(`${rootRoute}/`)) {
    return `[${escapedLabel}](./${href.slice(rootRoute.length + 1)})`;
  }
  if (href === rootRoute) return `[${escapedLabel}](./index)`;
  return `[${escapedLabel}](${href})`;
}

function renderNavigationItems(
  items,
  { rootRoute, routeMap, plainLocalLeaves = false },
) {
  const pages = [];
  for (const item of items ?? []) {
    if (!item || item.excludedReason) continue;
    const href = targetRouteForUrl(item.link?.url, routeMap);
    if (item.kind === 'category' && (item.items?.length ?? 0) > 0) {
      const children = renderNavigationItems(item.items, {
        rootRoute,
        routeMap,
        plainLocalLeaves,
      });
      if (children.length > 0) {
        pages.push(`---${item.label}---`, ...children);
      } else if (href) {
        pages.push(routeMetaLink(item.label, href, rootRoute));
      }
      continue;
    }
    if (href) {
      pages.push(
        plainLocalLeaves && href.startsWith(`${rootRoute}/`)
          ? href.slice(rootRoute.length + 1)
          : routeMetaLink(item.label, href, rootRoute),
      );
    }
  }
  return pages;
}

function mergeMetaPages(target, incoming) {
  for (const page of incoming) {
    if (typeof page === 'string') {
      if (!target.includes(page)) target.push(page);
      continue;
    }
    const existing = target.find(
      (candidate) =>
        candidate &&
        typeof candidate === 'object' &&
        candidate.type === page.type &&
        candidate.title === page.title,
    );
    if (existing) mergeMetaPages(existing.pages, page.pages);
    else target.push(page);
  }
  return target;
}

function commonDirectory(filePaths) {
  if (filePaths.length === 0) return null;
  let parts = path.posix.dirname(filePaths[0]).split('/');
  for (const filePath of filePaths.slice(1)) {
    const candidate = path.posix.dirname(filePath).split('/');
    let index = 0;
    while (index < parts.length && parts[index] === candidate[index])
      index += 1;
    parts = parts.slice(0, index);
  }
  return parts.join('/');
}

function routeForDocsDirectory(directory) {
  return `/${directory
    .replace(/^content\/docs\//, '')
    .split('/')
    .filter((segment) => segment !== '(current)')
    .join('/')}`;
}

function landingLocalRoot(entry, pageEvidence) {
  const localPages = pageEvidence.filter(
    (page) =>
      page?.sourceResolution?.targetPath?.startsWith(
        `${API_REFERENCE_ROOT}/`,
      ) && page.sourceResolution.targetPath.endsWith('.mdx'),
  );
  if (localPages.length === 0) return null;
  const landing =
    localPages.find(
      (page) =>
        normalizeLegacyKey(page.requestedUrl) ===
        normalizeLegacyKey(entry.legacyUrl),
    ) ?? localPages[0];
  const landingPath = landing.sourceResolution.targetPath;
  const currentMarker = '/(current)/';
  if (landingPath.includes(currentMarker)) {
    return landingPath.slice(
      0,
      landingPath.indexOf(currentMarker) + '/(current)'.length,
    );
  }
  const common = commonDirectory(
    localPages.map((page) => page.sourceResolution.targetPath),
  );
  const relativeSegments = common
    ?.slice(`${API_REFERENCE_ROOT}/`.length)
    .split('/')
    .filter(Boolean);
  return relativeSegments?.length >= 2
    ? common
    : path.posix.dirname(landingPath);
}

function entryEvidence(entry, byUrl) {
  return unique(
    (entry.pageGraph?.pages ?? []).map((page) => normalizeLegacyKey(page.url)),
  )
    .map((key) => resolveEvidence(byUrl.get(key), byUrl))
    .filter(Boolean);
}

function createMetaAccumulator(
  metaByPath,
  { metaPath, rootRoute, title, pages, includeIndex = false },
) {
  const current = metaByPath.get(metaPath) ?? {
    metaPath,
    rootRoute,
    title,
    pages: [],
    includeIndex,
  };
  current.includeIndex ||= includeIndex;
  mergeMetaPages(current.pages, pages);
  metaByPath.set(metaPath, current);
}

function buildEntryMetaPlans(manifest, routeMap, lanes) {
  const byUrl = evidenceIndex(manifest);
  const laneById = new Map(lanes.map((lane) => [lane.id, lane]));
  const metaByPath = new Map();
  const openApiEntries = new Map();

  for (const entry of manifest.entries ?? []) {
    if (entry.urlFamily === 'external' || !entry.pageGraph?.navigation)
      continue;
    const evidence = entryEvidence(entry, byUrl);
    const roots = [];
    const localRoot = landingLocalRoot(entry, evidence);
    if (localRoot) {
      roots.push({
        metaPath: `${localRoot}/meta.json`,
        rootRoute: routeForDocsDirectory(localRoot),
      });
    }
    for (const laneId of unique(
      evidence.map((page) => page.sourceResolution?.laneId),
    )) {
      const lane = laneById.get(laneId);
      if (!lane) continue;
      const rootRoute = lane.parentUrl['zh-CN'];
      roots.push({
        metaPath: `content/docs${rootRoute}/meta.json`,
        rootRoute,
        includeIndex: true,
        plainLocalLeaves: true,
      });
      const values = openApiEntries.get(laneId) ?? [];
      values.push(entry);
      openApiEntries.set(laneId, values);
    }
    for (const root of roots) {
      const pages = renderNavigationItems(entry.pageGraph.navigation, {
        ...root,
        routeMap,
      });
      createMetaAccumulator(metaByPath, {
        ...root,
        title: `${entry.product} ${entry.label}`,
        pages,
      });
    }
  }

  return { metaByPath, openApiEntries };
}

function productGroups(entries) {
  const groups = [];
  const byProduct = new Map();
  for (const entry of entries) {
    let group = byProduct.get(entry.product);
    if (!group) {
      group = { product: entry.product, entries: [], first: entry };
      byProduct.set(entry.product, group);
      groups.push(group);
    }
    group.entries.push(entry);
  }
  return groups;
}

function actionLabel(entry, productEntries) {
  const qualifiers = [];
  if (entry.useCase) qualifiers.push(entry.useCase);
  const apiGroups = unique(productEntries.map((item) => item.apiGroup));
  if (apiGroups.length > 1) {
    qualifiers.push(entry.apiGroup === 'client' ? '客户端' : '服务端');
  }
  qualifiers.push(entry.label);
  return qualifiers.join(' · ');
}

function actionForEntry(entry, productEntries) {
  const href = entry.targetRoute ?? entry.legacyUrl;
  return { label: actionLabel(entry, productEntries), href };
}

function collapsedRootActions(entries) {
  const actions = [];
  const byHref = new Map();
  for (const entry of entries) {
    const action = actionForEntry(entry, entries);
    const existing = byHref.get(action.href);
    if (existing) {
      existing.labels.push(action.label);
      continue;
    }
    const collapsed = { href: action.href, labels: [action.label] };
    byHref.set(action.href, collapsed);
    actions.push(collapsed);
  }
  return actions;
}

function buildOverviewBody(entries, live) {
  if (!live?.heroTitle || !live?.heroDescription) {
    throw new Error(
      'The live API Center snapshot must include heroTitle and heroDescription; do not synthesize overview copy.',
    );
  }
  const lines = [live.heroDescription, ''];
  const categories = unique(entries.map((entry) => entry.category));
  for (const category of categories) {
    lines.push(`## ${category}`, '');
    const categoryEntries = entries.filter(
      (entry) => entry.category === category,
    );
    const subcategories = unique(
      categoryEntries.map(
        (entry) => entry.subcategories?.join(' / ') || '全部',
      ),
    );
    for (const subcategory of subcategories) {
      if (subcategory !== '全部') lines.push(`### ${subcategory}`, '');
      const scoped = categoryEntries.filter(
        (entry) => (entry.subcategories?.join(' / ') || '全部') === subcategory,
      );
      lines.push('<SolutionCardGrid size="small">', '');
      for (const group of productGroups(scoped)) {
        const useCases = unique(
          group.entries.map((entry) => entry.useCase || ''),
        );
        const cardGroups =
          useCases.length > 1 || useCases[0]
            ? useCases.map((useCase) => ({
                useCase,
                entries: group.entries.filter(
                  (entry) => (entry.useCase || '') === useCase,
                ),
              }))
            : [{ useCase: '', entries: group.entries }];
        for (const card of cardGroups) {
          const first = card.entries[0];
          const title = card.useCase
            ? `${group.product} · ${card.useCase}`
            : group.product;
          const description =
            first.useCaseDescription ?? first.productDescription ?? '';
          const actions = card.entries.map((entry) =>
            actionForEntry(entry, group.entries),
          );
          lines.push(
            `<SolutionCard title=${JSON.stringify(title)} description=${JSON.stringify(
              description,
            )} icon=${JSON.stringify(PRODUCT_ICONS.get(group.product) ?? 'tools')} actions={${JSON.stringify(
              actions,
            )}} size="small" />`,
            '',
          );
        }
      }
      lines.push('</SolutionCardGrid>', '');
    }
  }
  return lines.join('\n').trim();
}

function rootMetaPages(entries) {
  const pages = [
    'overview',
    'sdks',
    '---指南---',
    '[示例配方](/zh-CN/api-reference/recipes)',
    'faq',
    ...FOCUSED_LANE_ROOTS,
  ];
  let lastCategory = null;
  let lastSubcategory = null;
  for (const group of productGroups(entries)) {
    const first = group.first;
    if (first.category !== lastCategory) {
      pages.push(`---${first.category}---`);
      lastCategory = first.category;
      lastSubcategory = null;
    }
    const subcategory = first.subcategories?.join(' / ') || null;
    if (subcategory && subcategory !== lastSubcategory) {
      pages.push(`---${subcategory}---`);
      lastSubcategory = subcategory;
    }
    pages.push({
      type: 'group',
      title: group.product,
      icon: PRODUCT_ICONS.get(group.product) ?? 'tools',
      collapsible: true,
      pages: collapsedRootActions(group.entries).map((action) =>
        routeMetaLink(
          action.labels.join(' / '),
          action.href,
          '/zh-CN/api-reference',
        ),
      ),
    });
  }
  return pages;
}

async function readMeta(repoRoot, metaPath, fallbackTitle) {
  try {
    return JSON.parse(
      await fs.readFile(path.resolve(repoRoot, metaPath), 'utf8'),
    );
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    if (!fallbackTitle) {
      throw new Error(
        `Required existing navigation metadata is missing: ${metaPath}`,
      );
    }
    return { title: fallbackTitle };
  }
}

function serializeJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function countMetaLinks(pages) {
  return (pages ?? []).reduce(
    (count, page) =>
      count +
      (typeof page === 'string'
        ? page.startsWith('---')
          ? 0
          : 1
        : countMetaLinks(page.pages)),
    0,
  );
}

function navigationParityReport({
  entries,
  metaByPath,
  overviewBody,
  rootPages,
  routeMap,
}) {
  const internalEntries = entries.filter(
    (entry) => entry.urlFamily !== 'external',
  );
  const externalEntries = entries.filter(
    (entry) => entry.urlFamily === 'external',
  );
  const missingEntryTargets = internalEntries
    .filter((entry) => !entry.targetRoute)
    .map((entry) => ({ product: entry.product, label: entry.label }));
  const overviewActions = (overviewBody.match(/"href":/g) ?? []).length;
  const rootActions = rootPages
    .filter((page) => page && typeof page === 'object' && page.type === 'group')
    .reduce((count, page) => count + countMetaLinks(page.pages), 0);
  const collapsedRootDuplicates = entries.length - rootActions;
  const visibleLeaves = internalEntries.flatMap((entry) =>
    visibleNavigationLeaves(entry.pageGraph?.navigation, routeMap).map(
      (leaf) => ({
        ...leaf,
        product: entry.product,
        entryLabel: entry.label,
      }),
    ),
  );
  const missingNavigationTargets = visibleLeaves.filter(
    (leaf) => !leaf.targetRoute,
  );
  const issues = [];
  if (overviewActions !== entries.length) {
    issues.push({
      severity: 'error',
      code: 'overview-entry-count',
      message: `Overview exposes ${overviewActions} actions for ${entries.length} live entries.`,
    });
  }
  if (rootActions + collapsedRootDuplicates !== entries.length) {
    issues.push({
      severity: 'error',
      code: 'root-meta-entry-count',
      message: `Root meta represents ${rootActions + collapsedRootDuplicates} entries for ${entries.length} live entries.`,
    });
  }
  if (missingEntryTargets.length > 0) {
    issues.push({
      severity: 'error',
      code: 'missing-entry-target',
      message: `${missingEntryTargets.length} internal entries have no new-site target.`,
    });
  }
  if (missingNavigationTargets.length > 0) {
    issues.push({
      severity: 'error',
      code: 'missing-navigation-target',
      message: `${missingNavigationTargets.length} visible legacy navigation leaves have no new-site target.`,
    });
  }
  if (/https?:\/\/doc\.shengwang\.cn\/(?:doc|api-ref)\//.test(overviewBody)) {
    issues.push({
      severity: 'error',
      code: 'overview-old-site-link',
      message: 'Overview contains an old-site API Center body link.',
    });
  }
  return {
    schemaVersion: 1,
    counts: {
      categories: unique(entries.map((entry) => entry.category)).length,
      products: productGroups(entries).length,
      entries: entries.length,
      internalEntries: internalEntries.length,
      externalEntries: externalEntries.length,
      overviewActions,
      rootActions,
      collapsedRootDuplicates,
      entryMetaFiles: metaByPath.size,
      entryMetaLinks: [...metaByPath.values()].reduce(
        (count, plan) => count + countMetaLinks(plan.pages),
        0,
      ),
      visibleNavigationLeaves: visibleLeaves.length,
      missingNavigationTargets: missingNavigationTargets.length,
      warnings: issues.filter((issue) => issue.severity === 'warning').length,
      errors: issues.filter((issue) => issue.severity === 'error').length,
    },
    missingEntryTargets,
    missingNavigationTargets,
    issues,
  };
}

function navigationParityMarkdown(report) {
  const lines = [
    '# API Center Navigation Parity',
    '',
    '> Generated by `scripts/generate-api-center-navigation.mjs`. Do not edit by hand.',
    '',
    `- Categories: ${report.counts.categories}`,
    `- Products: ${report.counts.products}`,
    `- Live entries: ${report.counts.entries}`,
    `- Internal entries: ${report.counts.internalEntries}`,
    `- External entries: ${report.counts.externalEntries}`,
    `- Overview actions: ${report.counts.overviewActions}`,
    `- Root navigation actions: ${report.counts.rootActions}`,
    `- Root navigation entries collapsed into shared targets: ${report.counts.collapsedRootDuplicates}`,
    `- Entry meta files: ${report.counts.entryMetaFiles}`,
    `- Entry meta links: ${report.counts.entryMetaLinks}`,
    `- Visible legacy navigation leaves: ${report.counts.visibleNavigationLeaves}`,
    `- Missing navigation targets: ${report.counts.missingNavigationTargets}`,
    `- Warnings: ${report.counts.warnings}`,
    `- Errors: ${report.counts.errors}`,
    '',
    '## Migration types',
    '',
    `- \`overview-entry\`: ${report.counts.overviewActions}`,
    `- \`navigation-meta\`: ${report.counts.entryMetaFiles}`,
    '',
    '## Warning explanations',
    '',
    '- None.',
    '',
    '## Issues',
    '',
    ...(report.issues.length
      ? report.issues.map(
          (issue) =>
            `- **${issue.severity}** \`${issue.code}\`: ${issue.message}`,
        )
      : ['- None.']),
    '',
  ];
  return `${lines.join('\n')}\n`;
}

async function writeOrCheckGenerated({ repoRoot, mode, files }) {
  if (mode === 'dry-run') return;
  for (const [targetPath, contents] of files) {
    const absolute = path.resolve(repoRoot, targetPath);
    if (mode === 'check') {
      const actual = await fs.readFile(absolute, 'utf8');
      if (actual !== contents)
        throw new Error(`Generated file is stale: ${targetPath}`);
    } else {
      await fs.mkdir(path.dirname(absolute), { recursive: true });
      await fs.writeFile(absolute, contents, 'utf8');
    }
  }
}

/**
 * @param {object} [options]
 * @param {string} [options.repoRoot]
 * @param {string} [options.manifestPath]
 * @param {'write' | 'check' | 'dry-run'} [options.mode]
 * @param {boolean} [options.reconcile]
 * @param {readonly any[]} [options.lanes]
 */
export async function runApiCenterNavigation({
  repoRoot = process.cwd(),
  manifestPath = MANIFEST_SOURCE,
  mode = 'write',
  reconcile = true,
  lanes = OPENAPI_LANES,
} = {}) {
  const manifest = JSON.parse(
    await fs.readFile(path.resolve(repoRoot, manifestPath), 'utf8'),
  );
  const entries = manifest.entries ?? [];
  const routeMap = buildLegacyRouteMap(manifest);
  const run = await ApiCenterMigrationRun.create({
    repoRoot,
    manifest,
    mode,
    reconcile,
    ownershipPath: 'docs/migration/api-center-navigation-generated-files.json',
    reportJsonPath: 'docs/migration/api-center-navigation-report.json',
    reportMarkdownPath: 'docs/migration/api-center-navigation-report.md',
  });

  const overviewBody = buildOverviewBody(entries, manifest.live);
  const rootPages = rootMetaPages(entries);
  const overviewPath = `${API_REFERENCE_ROOT}/overview.mdx`;
  run.planFile({
    targetPath: overviewPath,
    contents: renderGeneratedMdx({
      title: manifest.live.heroTitle,
      description: manifest.live.heroDescription,
      body: overviewBody,
      extraFrontmatter: { hideToc: true },
      migration: {
        type: 'navigation',
        sourceUrl: API_CENTER_URL,
        sourcePath: manifestPath,
        generator: 'api-center-navigation',
        warnings: [],
      },
    }),
    sourcePath: manifestPath,
    sourceUrl: API_CENTER_URL,
    type: 'navigation',
    adoptExisting: true,
  });

  const rootMetaPath = `${API_REFERENCE_ROOT}/meta.json`;
  const rootMeta = await readMeta(repoRoot, rootMetaPath, null);
  run.planFile({
    targetPath: rootMetaPath,
    contents: serializeJson({ ...rootMeta, pages: rootPages }),
    sourcePath: manifestPath,
    sourceUrl: API_CENTER_URL,
    type: 'navigation-meta',
    adoptExisting: true,
  });

  const { metaByPath, openApiEntries } = buildEntryMetaPlans(
    manifest,
    routeMap,
    lanes,
  );
  const parity = navigationParityReport({
    entries,
    metaByPath,
    overviewBody,
    rootPages,
    routeMap,
  });
  if (parity.counts.errors > 0) {
    throw new Error(
      `API Center navigation parity found ${parity.counts.errors} errors.`,
    );
  }
  for (const plan of [...metaByPath.values()].sort((left, right) =>
    left.metaPath.localeCompare(right.metaPath),
  )) {
    const meta = await readMeta(repoRoot, plan.metaPath, plan.title);
    const indexPath = `${path.posix.dirname(plan.metaPath)}/index.mdx`;
    const hasIndex = await fs
      .access(path.resolve(repoRoot, indexPath))
      .then(() => true)
      .catch(() => false);
    const pages =
      hasIndex || plan.includeIndex
        ? mergeMetaPages(['index'], plan.pages)
        : plan.pages;
    if (pages.length === 0) continue;
    run.planFile({
      targetPath: plan.metaPath,
      contents: serializeJson({ ...meta, pages }),
      sourcePath: manifestPath,
      sourceUrl: API_CENTER_URL,
      type: 'navigation-meta',
      adoptExisting: true,
    });
  }

  for (const lane of lanes) {
    const laneEntries = openApiEntries.get(lane.id) ?? [];
    if (laneEntries.length === 0) continue;
    const rootRoute = lane.parentUrl['zh-CN'];
    const indexPath = `content/docs${rootRoute}/index.mdx`;
    const exists = await fs
      .access(path.resolve(repoRoot, indexPath))
      .then(() => true)
      .catch(() => false);
    if (exists && !run.ownsTarget(indexPath)) continue;
    const body = [];
    for (const entry of laneEntries) {
      for (const page of entry.pageGraph?.pages ?? []) {
        const href = targetRouteForUrl(page.url, routeMap);
        if (href?.startsWith(`${rootRoute}/`)) {
          body.push(`- [${page.label}](${href})`);
        }
      }
    }
    const first = laneEntries[0];
    const sourceUrls = unique([API_CENTER_URL, first.legacyUrl]);
    const sourcePaths = unique([manifestPath, lane.sourcePath['zh-CN']]);
    run.planFile({
      targetPath: indexPath,
      contents: renderGeneratedMdx({
        title: first.product,
        description: first.productDescription,
        body: [
          first.productDescription,
          first.productDescription ? '' : null,
          ...unique(body),
        ]
          .filter((line) => line !== null && line !== undefined)
          .join('\n'),
        migration: {
          type: 'navigation',
          sourceUrl: first.legacyUrl,
          sourcePath: manifestPath,
          sourceUrls,
          sourcePaths,
          generator: 'api-center-navigation',
          warnings: [],
        },
      }),
      sourcePath: manifestPath,
      sourceUrl: first.legacyUrl,
      type: 'navigation',
      adoptExisting: run.ownsTarget(indexPath),
    });
  }

  const report = await run.finish();
  await writeOrCheckGenerated({
    repoRoot,
    mode,
    files: [
      [
        'docs/migration/api-center-navigation-parity.json',
        serializeJson(parity),
      ],
      [
        'docs/migration/api-center-navigation-parity.md',
        navigationParityMarkdown(parity),
      ],
    ],
  });
  return {
    report,
    parity,
    entries: entries.length,
    metaFiles: [...run.planned.values()].filter(
      (file) => file.type === 'navigation-meta',
    ).length,
  };
}
