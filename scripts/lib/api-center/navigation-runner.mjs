import fs from 'node:fs/promises';
import path from 'node:path';
import { OPENAPI_LANES } from '../../../src/lib/openapi/lanes.ts';
import { auditDocsLinks } from '../../audit-doc-links.mjs';
import {
  buildApiReferenceRehomePlan,
  reconcileApiReferenceRehome,
} from './api-reference-ownership.mjs';
import { resolveExistingApiCenterTarget } from './existing-targets.mjs';
import {
  ApiCenterMigrationRun,
  buildLegacyRouteMap,
  renderGeneratedMdx,
} from './migration-framework.mjs';

const API_CENTER_URL = 'https://doc.shengwang.cn/api-center';
const API_REFERENCE_ROOT = 'content/docs/zh-CN/api-reference';
const API_REFERENCE_CATALOG_DATA =
  'src/lib/api-reference-cards-data.zh-cn.json';
const MANIFEST_SOURCE = 'docs/migration/api-center-html-manifest.json';
const OUT_OF_SCOPE_SHARED_ROUTES = new Set([
  '/zh-CN/introduction/mcp-integrate',
  '/zh-CN/introduction/skills-integrate',
]);
const REFERENCE_ROOT_SIDEBAR_ROUTES = new Set([
  '/zh-CN/api-reference/whiteboard/fastboard',
]);
const API_CENTER_SCOPE_TITLES = new Map([
  ['/zh-CN/api-reference/cloud-recording/go-api', '云端录制'],
  ['/zh-CN/api-reference/cloud-recording/java-api', '云端录制'],
  ['/zh-CN/api-reference/local-server-recording/cpp', '本地服务端录制'],
  ['/zh-CN/api-reference/local-server-recording/java', '本地服务端录制'],
]);
const API_CENTER_SCOPED_LOCAL_ROOT_PREFIXES = [
  '/zh-CN/api-reference/online-ktv/',
];
const API_CENTER_SIDEBAR_LABELS = new Map([
  ['/zh-CN/api-reference/rtc-server-sdk/error-code', '通用错误码'],
]);
// These generated API pages remain directly reachable, but they are not
// catalog entries in the API Center.
const API_REFERENCE_CATALOG_HIDDEN_ROUTES = new Set([
  '/zh-CN/api-reference/conversational-ai/restclient-go/overview',
  '/zh-CN/api-reference/conversational-ai/restclient-java/overview',
  '/zh-CN/api-reference/rtm/react-native/configuration',
  '/zh-CN/api-reference/rtm/swift/configuration',
  '/zh-CN/api-reference/api-ref/danmaku',
]);

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
const ROOT_PRODUCT_TITLES = new Map([
  ['对话式 AI 引擎', '对话式 AI'],
  ['微呼叫', 'VoIP 呼叫服务'],
  ['灵动会议', '会议'],
  ['1v1 私密房', '私密房'],
]);
const ROOT_PRODUCT_ICONS = new Map([
  ['对话式 AI', 'Bot'],
  ['实时互动 RTC', 'AudioLines'],
  ['实时消息 RTM', 'Network'],
  ['融合 CDN 直播', 'RadioTower'],
  ['媒体流加速 RTSA', 'Radio'],
  ['互动白板', 'Presentation'],
  ['VoIP 呼叫服务', 'PhoneCall'],
  ['水晶球', 'ChartColumn'],
  ['实时转录翻译', 'Captions'],
  ['云端录制', 'HardDrive'],
  ['本地服务端录制', 'HardDrive'],
  ['旁路推流', 'ArrowUpFromLine'],
  ['输入在线媒体流', 'ArrowDownToLine'],
  ['云端转码', 'Film'],
  ['RTMP 网关', 'RadioTower'],
  ['RTC 服务端 SDK', 'ServerCog'],
  ['PPT 转码服务', 'FileVideo'],
  ['控制台', 'LayoutDashboard'],
  ['会议', 'Users'],
  ['在线 K 歌房', 'MicVocal'],
  ['私密房', 'Lock'],
  ['在线美术教学', 'Palette'],
  ['在线音乐教学', 'Music2'],
  ['平行操控', 'Gamepad2'],
]);
const API_REFERENCE_CATALOG_PRODUCT_IDS = new Map([
  ['对话式 AI', 'conversational-ai'],
  ['实时互动 RTC', 'rtc'],
  ['实时消息 RTM', 'rtm'],
  ['即时通讯 IM', 'im'],
  ['融合 CDN 直播', 'fusion-cdn'],
  ['媒体流加速 RTSA', 'rtsa'],
  ['互动白板', 'whiteboard'],
  ['VoIP 呼叫服务', 'voip-callkit'],
  ['水晶球', 'analytics'],
  ['实时转录翻译', 'speech-to-text'],
  ['云端录制', 'cloud-recording'],
  ['本地服务端录制', 'local-server-recording'],
  ['旁路推流', 'media-push'],
  ['输入在线媒体流', 'media-pull'],
  ['云端转码', 'cloud-transcoding'],
  ['RTMP 网关', 'rtmp-gateway'],
  ['RTC 服务端 SDK', 'rtc-server-sdk'],
  ['PPT 转码服务', 'ppt-conversion-service'],
  ['控制台', 'console'],
  ['会议', 'meeting'],
  ['在线 K 歌房', 'online-ktv'],
  ['私密房', 'private-room'],
  ['在线美术教学', 'online-art-teaching'],
  ['在线音乐教学', 'online-music-teaching'],
  ['平行操控', 'teleoperation'],
  ['灵动课堂', 'flexible-classroom'],
  ['弹幕玩法', 'danmaku'],
]);
const API_REFERENCE_CATALOG_SOLUTION_IDS = new Map([
  ['Fastboard SDK', 'fastboard-sdk'],
  ['Whiteboard SDK', 'whiteboard-sdk'],
  ['场景化 API 方案', 'scenario-api'],
  ['PaaS 方案', 'paas'],
  ['UIKit 开源方案', 'uikit'],
  ['场景化 API 默认 RTM 方案', 'scenario-api-rtm'],
  ['场景化 API 自定义信令方案', 'scenario-api-custom-signaling'],
]);
const API_REFERENCE_CATALOG_SERVER_PRODUCTS = new Set([
  'RTC 服务端 SDK',
  '云端录制',
  '本地服务端录制',
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

function isOutOfScopeSharedRoute(route) {
  return OUT_OF_SCOPE_SHARED_ROUTES.has(route);
}

function isOutsideLegacyScope(urlValue, scopeRoot) {
  if (!urlValue || !scopeRoot) return false;
  const url = new URL(urlValue, API_CENTER_URL);
  if (
    url.hostname !== 'doc.shengwang.cn' ||
    (!url.pathname.startsWith('/api-ref/') && !url.pathname.startsWith('/doc/'))
  ) {
    return false;
  }
  return !url.pathname.startsWith(scopeRoot);
}

function visibleNavigationLeaves(
  items,
  routeMap,
  trail = [],
  scopeRoot = null,
) {
  const leaves = [];
  for (const item of items ?? []) {
    if (
      !item ||
      item.excludedReason ||
      isOutsideLegacyScope(item.link?.url, scopeRoot)
    )
      continue;
    const targetRoute =
      item.link?.targetRoute ?? targetRouteForUrl(item.link?.url, routeMap);
    if (isOutOfScopeSharedRoute(targetRoute)) continue;
    const nextTrail = [...trail, item.label];
    if (item.kind === 'category' && (item.items?.length ?? 0) > 0) {
      leaves.push(
        ...visibleNavigationLeaves(item.items, routeMap, nextTrail, scopeRoot),
      );
      continue;
    }
    leaves.push({
      label: item.label,
      trail: nextTrail,
      sourceUrl: item.link?.url ?? null,
      targetRoute,
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

function renderNavigationLeaf(
  label,
  href,
  { plainLocalLeaves, rootRoute, sidebarLabels },
) {
  const sidebarLabel = API_CENTER_SIDEBAR_LABELS.get(href) ?? label;
  if (plainLocalLeaves && href.startsWith(`${rootRoute}/`)) {
    sidebarLabels[href] = sidebarLabel;
    return href.slice(rootRoute.length + 1);
  }
  return routeMetaLink(sidebarLabel, href, rootRoute);
}

function renderNavigationItems(
  items,
  {
    groupedCategories = false,
    plainLocalLeaves = false,
    rootRoute,
    routeMap,
    scopeRoot = null,
    sidebarLabels = {},
  },
) {
  const pages = [];
  for (const item of items ?? []) {
    if (
      !item ||
      item.excludedReason ||
      isOutsideLegacyScope(item.link?.url, scopeRoot)
    )
      continue;
    const href =
      item.link?.targetRoute ?? targetRouteForUrl(item.link?.url, routeMap);
    if (isOutOfScopeSharedRoute(href)) continue;
    if (item.kind === 'category' && (item.items?.length ?? 0) > 0) {
      if (groupedCategories) {
        const children = renderNavigationGroupLeaves(item.items, {
          plainLocalLeaves,
          rootRoute,
          routeMap,
          scopeRoot,
          sidebarLabels,
        });
        if (children.length > 0) {
          pages.push({
            type: 'group',
            title: item.label,
            pages: children,
          });
        } else if (href) {
          pages.push(
            renderNavigationLeaf(item.label, href, {
              plainLocalLeaves,
              rootRoute,
              sidebarLabels,
            }),
          );
        }
        continue;
      }
      const children = renderNavigationItems(item.items, {
        groupedCategories,
        rootRoute,
        routeMap,
        plainLocalLeaves,
        scopeRoot,
        sidebarLabels,
      });
      if (children.length > 0) {
        pages.push(`---${item.label}---`, ...children);
      } else if (href) {
        pages.push(
          renderNavigationLeaf(item.label, href, {
            plainLocalLeaves,
            rootRoute,
            sidebarLabels,
          }),
        );
      }
      continue;
    }
    if (href) {
      pages.push(
        renderNavigationLeaf(item.label, href, {
          plainLocalLeaves,
          rootRoute,
          sidebarLabels,
        }),
      );
    }
  }
  return pages;
}

function renderNavigationGroupLeaves(
  items,
  { plainLocalLeaves, rootRoute, routeMap, scopeRoot, sidebarLabels },
) {
  const pages = [];
  for (const item of items ?? []) {
    if (
      !item ||
      item.excludedReason ||
      isOutsideLegacyScope(item.link?.url, scopeRoot)
    )
      continue;
    const href =
      item.link?.targetRoute ?? targetRouteForUrl(item.link?.url, routeMap);
    if (isOutOfScopeSharedRoute(href)) continue;
    if (href) {
      pages.push(
        renderNavigationLeaf(item.label, href, {
          plainLocalLeaves,
          rootRoute,
          sidebarLabels,
        }),
      );
      continue;
    }
    if (item.kind === 'category' && (item.items?.length ?? 0) > 0) {
      pages.push(
        ...renderNavigationGroupLeaves(item.items, {
          plainLocalLeaves,
          rootRoute,
          routeMap,
          scopeRoot,
          sidebarLabels,
        }),
      );
    }
  }
  return pages;
}

function focusedOpenApiNavigation(items, options) {
  const focused = [];
  for (const item of items ?? []) {
    if (
      !item ||
      item.excludedReason ||
      isOutsideLegacyScope(item.link?.url, options.scopeRoot)
    ) {
      continue;
    }
    const children = focusedOpenApiNavigation(item.items, options);
    const href =
      item.link?.targetRoute ??
      targetRouteForUrl(item.link?.url, options.routeMap);
    const isReference =
      href === options.rootRoute || href?.startsWith(`${options.rootRoute}/`);
    if (isReference || (!href && children.length > 0)) {
      focused.push({ ...item, ...(item.items ? { items: children } : {}) });
    } else {
      focused.push(...children);
    }
  }
  return focused;
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
  const navigationPath = (targetPath) =>
    path.posix.basename(targetPath).toLowerCase() === 'index.mdx'
      ? `${path.posix.dirname(targetPath)}.mdx`
      : targetPath;
  const landingPath = navigationPath(landing.sourceResolution.targetPath);
  const currentMarker = '/(current)/';
  if (landingPath.includes(currentMarker)) {
    return landingPath.slice(
      0,
      landingPath.indexOf(currentMarker) + '/(current)'.length,
    );
  }
  const common = commonDirectory(
    localPages.map((page) => navigationPath(page.sourceResolution.targetPath)),
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
  {
    metaPath,
    rootRoute,
    title,
    pages,
    includeIndex = false,
    metaPatch = {},
    preserveExistingPages = false,
    preserveExistingMeta = false,
  },
) {
  const current = metaByPath.get(metaPath) ?? {
    metaPath,
    rootRoute,
    title,
    pages: [],
    includeIndex,
    metaPatch,
    preserveExistingPages,
    preserveExistingMeta,
  };
  current.includeIndex ||= includeIndex;
  current.preserveExistingPages ||= preserveExistingPages;
  current.preserveExistingMeta ||= preserveExistingMeta;
  const sidebarLabels = { ...current.metaPatch.sidebarLabels };
  for (const [route, label] of Object.entries(metaPatch.sidebarLabels ?? {})) {
    if (!(route in sidebarLabels)) sidebarLabels[route] = label;
  }
  current.metaPatch = {
    ...current.metaPatch,
    ...metaPatch,
    ...(Object.keys(sidebarLabels).length > 0 ? { sidebarLabels } : {}),
  };
  mergeMetaPages(current.pages, pages);
  metaByPath.set(metaPath, current);
}

function addWhiteboardScopeMetaPlans(metaByPath, entries) {
  const prefix = '/zh-CN/api-reference/whiteboard/whiteboard-sdk/';
  const platforms = unique(
    entries
      .filter((entry) => entry.targetRoute?.startsWith(prefix))
      .map((entry) => entry.targetRoute.slice(prefix.length).split('/')[0]),
  );
  if (platforms.length === 0) return;

  createMetaAccumulator(metaByPath, {
    metaPath: `${API_REFERENCE_ROOT}/whiteboard/meta.json`,
    rootRoute: '/zh-CN/api-reference/whiteboard',
    title: '互动白板',
    pages: ['whiteboard-sdk'],
    metaPatch: { sidebarHidden: true },
    preserveExistingPages: true,
  });
  createMetaAccumulator(metaByPath, {
    metaPath: `${API_REFERENCE_ROOT}/whiteboard/whiteboard-sdk/meta.json`,
    rootRoute: '/zh-CN/api-reference/whiteboard/whiteboard-sdk',
    title: 'Whiteboard SDK',
    pages: platforms,
  });
  for (const platform of platforms) {
    const entry = entries.find((candidate) =>
      candidate.targetRoute?.startsWith(`${prefix}${platform}/`),
    );
    createMetaAccumulator(metaByPath, {
      metaPath: `${API_REFERENCE_ROOT}/whiteboard/whiteboard-sdk/${platform}/meta.json`,
      rootRoute: `${prefix}${platform}`,
      title: `互动白板 ${entry?.label ?? platform}`,
      pages: ['(current)'],
      metaPatch: {
        navScope: {
          defaultVersion: 'current',
          versions: [{ id: 'current', label: 'Current', path: '(current)' }],
        },
      },
    });
  }
}

function addRtcServerSdkScopeMetaPlans(metaByPath, entries) {
  const platforms = [
    {
      id: 'cpp',
      prefix: '/zh-CN/api-reference/rtc-server-sdk/cpp/',
    },
    {
      id: 'java',
      prefix: '/zh-CN/api-reference/rtc-server-sdk/java/',
    },
  ].filter(({ prefix }) =>
    entries.some((entry) => entry.targetRoute?.startsWith(prefix)),
  );
  if (platforms.length === 0) return;

  createMetaAccumulator(metaByPath, {
    metaPath: `${API_REFERENCE_ROOT}/rtc-server-sdk/meta.json`,
    rootRoute: '/zh-CN/api-reference/rtc-server-sdk',
    title: 'RTC 服务端 SDK',
    pages: platforms.map(({ id }) => id),
    metaPatch: { sidebarHidden: true },
    preserveExistingPages: true,
  });
  for (const { id } of platforms) {
    createMetaAccumulator(metaByPath, {
      metaPath: `${API_REFERENCE_ROOT}/rtc-server-sdk/${id}/meta.json`,
      rootRoute: `/zh-CN/api-reference/rtc-server-sdk/${id}`,
      title: 'RTC 服务端 SDK',
      pages: ['(current)'],
      metaPatch: {
        navScope: {
          defaultVersion: 'current',
          versions: [{ id: 'current', label: 'Current', path: '(current)' }],
        },
      },
    });
  }
}

function addRtsaScopeMetaPlans(metaByPath, manifest) {
  const prefix = '/zh-CN/api-reference/rtsa/c/';
  const entry = (manifest.entries ?? []).find((candidate) =>
    candidate.targetRoute?.startsWith(prefix),
  );
  if (!entry) return;
  const currentDirectory = `${API_REFERENCE_ROOT}/rtsa/c/(current)`;
  const evidencePages = unique(
    (manifest.pageEvidence ?? [])
      .map((page) => page.sourceResolution?.targetPath)
      .filter(
        (targetPath) =>
          targetPath?.endsWith('.mdx') &&
          path.posix.dirname(targetPath) === currentDirectory,
      )
      .map((targetPath) => path.posix.basename(targetPath, '.mdx')),
  );
  const currentPages = unique([
    'overview',
    ...evidencePages.filter((page) => page !== 'overview'),
  ]);

  createMetaAccumulator(metaByPath, {
    metaPath: `${API_REFERENCE_ROOT}/rtsa/meta.json`,
    rootRoute: '/zh-CN/api-reference/rtsa',
    title: entry.product,
    pages: ['c'],
    preserveExistingPages: true,
  });
  createMetaAccumulator(metaByPath, {
    metaPath: `${API_REFERENCE_ROOT}/rtsa/c/meta.json`,
    rootRoute: '/zh-CN/api-reference/rtsa/c',
    title: `${entry.product} ${entry.label}`,
    pages: ['(current)'],
    metaPatch: {
      navScope: {
        defaultVersion: 'current',
        versions: [{ id: 'current', label: 'Current', path: '(current)' }],
      },
      sidebarIndexTitle: entry.label,
    },
  });
  createMetaAccumulator(metaByPath, {
    metaPath: `${currentDirectory}/meta.json`,
    rootRoute: '/zh-CN/api-reference/rtsa/c',
    title: `${entry.product} ${entry.label}`,
    pages: currentPages,
  });
}

function addOnlineKtvScopeMetaPlans(metaByPath, manifest) {
  const prefix = '/zh-CN/api-reference/online-ktv/';
  const platformSolutions = new Map();
  const evidence = evidenceIndex(manifest);
  for (const entry of manifest.entries ?? []) {
    if (entry.product !== '在线 K 歌房') continue;
    for (const page of entry.pageGraph?.pages ?? []) {
      const resolution = resolveEvidence(
        evidence.get(normalizeLegacyKey(page.url)),
        evidence,
      )?.sourceResolution;
      if (!resolution?.targetRoute?.startsWith(prefix)) continue;
      const [platform, solution, apiFolder, ...leafParts] =
        resolution.targetRoute.slice(prefix.length).split('/');
      if (
        !platform ||
        !solution ||
        apiFolder !== 'api' ||
        leafParts.length === 0
      ) {
        continue;
      }
      const solutions = platformSolutions.get(platform) ?? new Map();
      const pages = solutions.get(solution) ?? [];
      if (
        !pages.some((candidate) => candidate.route === resolution.targetRoute)
      ) {
        pages.push({ label: page.label, route: resolution.targetRoute });
      }
      solutions.set(solution, pages);
      platformSolutions.set(platform, solutions);
    }
  }
  if (platformSolutions.size === 0) return;

  const platforms = [...platformSolutions.keys()];
  createMetaAccumulator(metaByPath, {
    metaPath: `${API_REFERENCE_ROOT}/online-ktv/meta.json`,
    rootRoute: '/zh-CN/api-reference/online-ktv',
    title: '在线 K 歌',
    pages: platforms,
  });
  for (const [platform, solutionsById] of platformSolutions) {
    createMetaAccumulator(metaByPath, {
      metaPath: `${API_REFERENCE_ROOT}/online-ktv/${platform}/meta.json`,
      rootRoute: `/zh-CN/api-reference/online-ktv/${platform}`,
      title: platform === 'ios' ? 'iOS' : 'Android',
      pages: [...solutionsById.keys()],
    });
    for (const [solution, apiPages] of solutionsById) {
      const rootRoute = `/zh-CN/api-reference/online-ktv/${platform}/${solution}`;
      createMetaAccumulator(metaByPath, {
        metaPath: `${API_REFERENCE_ROOT}/online-ktv/${platform}/${solution}/meta.json`,
        rootRoute,
        title: `在线 K 歌房 ${platform === 'ios' ? 'iOS' : 'Android'}`,
        pages: apiPages.map(({ route }) => route.slice(rootRoute.length + 1)),
        metaPatch: {
          navScope: {},
          sidebarLabels: Object.fromEntries(
            apiPages.map(({ label, route }) => [route, label]),
          ),
        },
      });
    }
  }
}

function addOpenApiLaneRootMetaPlans(metaByPath, lanes) {
  for (const lane of lanes) {
    const rootRoute = lane.parentUrl?.['zh-CN'];
    if (!rootRoute?.startsWith('/zh-CN/api-reference/api-ref/')) continue;

    const metaPath = `content/docs${rootRoute}/meta.json`;

    createMetaAccumulator(metaByPath, {
      metaPath,
      rootRoute,
      title: 'RESTful API',
      pages: [],
      metaPatch: { navScope: undefined },
      preserveExistingPages: !metaByPath.has(metaPath),
      preserveExistingMeta: true,
    });
  }
}

function addApiReferenceSupplementMetaPlans(metaByPath, manifest) {
  const handledRoutes = new Set();
  for (const page of manifest.pageEvidence ?? []) {
    const resolution = page.sourceResolution;
    const supplement = resolution?.apiReferenceSupplement;
    if (
      !supplement?.parentRoute ||
      !resolution.targetRoute?.startsWith(`${supplement.parentRoute}/`) ||
      handledRoutes.has(resolution.targetRoute)
    ) {
      continue;
    }
    handledRoutes.add(resolution.targetRoute);
    const metaPath = `content/docs${supplement.parentRoute}/meta.json`;
    const relatedRoutes = new Set(
      (supplement.relatedPages ?? []).map((related) => related.route),
    );
    const targetLeaf = resolution.targetRoute.slice(
      supplement.parentRoute.length + 1,
    );
    const group = {
      type: 'group',
      title: supplement.groupTitle,
      pages: [
        ...(supplement.relatedPages ?? []).map((related) =>
          routeMetaLink(related.label, related.route, supplement.parentRoute),
        ),
        targetLeaf,
      ],
    };
    const applyPagePlacements = (pages) => {
      for (const placement of supplement.navigationPagePlacements ?? []) {
        const page = placement.page;
        const existingIndex = pages.indexOf(page);
        if (existingIndex >= 0) pages.splice(existingIndex, 1);
        const beforeIndex = placement.before
          ? pages.indexOf(placement.before)
          : -1;
        const afterIndex = placement.after
          ? pages.indexOf(placement.after)
          : -1;
        if (beforeIndex >= 0) {
          pages.splice(beforeIndex, 0, page);
        } else if (afterIndex >= 0) {
          pages.splice(afterIndex + 1, 0, page);
        } else {
          pages.push(page);
        }
      }
      return pages;
    };
    const current = metaByPath.get(metaPath);
    if (!current) {
      createMetaAccumulator(metaByPath, {
        metaPath,
        rootRoute: supplement.parentRoute,
        title: 'RESTful API',
        pages: [...applyPagePlacements([]), group],
        metaPatch: {
          openApiSidebarFromMeta: true,
          sidebarLabels: {
            [resolution.targetRoute]: supplement.label,
          },
        },
      });
      continue;
    }
    current.preserveExistingPages = false;
    current.pages = current.pages.filter((candidate) => {
      if (candidate === targetLeaf) return false;
      const parsed = parseMetaLink(candidate);
      return !relatedRoutes.has(parsed?.route);
    });
    applyPagePlacements(current.pages);
    mergeMetaPages(current.pages, [group]);
    current.metaPatch = {
      ...current.metaPatch,
      openApiSidebarFromMeta: true,
      sidebarLabels: {
        ...(current.metaPatch.sidebarLabels ?? {}),
        [resolution.targetRoute]: supplement.label,
      },
    };
  }
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
    const laneIds = unique(
      evidence.map((page) => page.sourceResolution?.laneId),
    );
    const localRoot = landingLocalRoot(entry, evidence);
    if (localRoot && entry.product !== '在线 K 歌房') {
      roots.push({
        metaPath: `${localRoot}/meta.json`,
        rootRoute: routeForDocsDirectory(localRoot),
        plainLocalLeaves: true,
        preserveExistingMeta: laneIds.length > 0,
      });
    }
    for (const laneId of laneIds) {
      const lane = laneById.get(laneId);
      if (!lane) continue;
      const rootRoute = lane.parentUrl['zh-CN'];
      roots.push({
        metaPath: `content/docs${rootRoute}/meta.json`,
        rootRoute,
        includeIndex: true,
        plainLocalLeaves: true,
        focusedOpenApiSidebar: true,
        preserveExistingMeta: true,
      });
      const values = openApiEntries.get(laneId) ?? [];
      values.push(entry);
      openApiEntries.set(laneId, values);
    }
    for (const root of roots) {
      const sidebarLabels = {};
      const sourceNavigation = entry.pageGraph.sourceNavigation;
      const navigation = sourceNavigation ?? entry.pageGraph.navigation;
      const pages = renderNavigationItems(
        root.focusedOpenApiSidebar
          ? focusedOpenApiNavigation(navigation, {
              rootRoute: root.rootRoute,
              routeMap,
              scopeRoot: entry.pageGraph.closure?.scopeRoot,
            })
          : navigation,
        {
          ...root,
          groupedCategories: Boolean(sourceNavigation),
          routeMap,
          scopeRoot: entry.pageGraph.closure?.scopeRoot,
          sidebarLabels,
        },
      );
      const scopeTitle = API_CENTER_SCOPE_TITLES.get(root.rootRoute);
      const scopesLocalRoot = API_CENTER_SCOPED_LOCAL_ROOT_PREFIXES.some(
        (prefix) => root.rootRoute.startsWith(prefix),
      );
      const useReferenceRootSidebar =
        REFERENCE_ROOT_SIDEBAR_ROUTES.has(root.rootRoute) ||
        root.focusedOpenApiSidebar;
      createMetaAccumulator(metaByPath, {
        ...root,
        title: `${entry.product} ${entry.label}`,
        pages,
        metaPatch: {
          ...(Object.keys(sidebarLabels).length > 0 ? { sidebarLabels } : {}),
          ...(scopeTitle ? { title: scopeTitle } : {}),
          ...(scopesLocalRoot ? { navScope: {} } : {}),
          ...(useReferenceRootSidebar ? { navScope: undefined } : {}),
        },
      });
    }
  }

  addWhiteboardScopeMetaPlans(metaByPath, manifest.entries ?? []);
  addRtcServerSdkScopeMetaPlans(metaByPath, manifest.entries ?? []);
  addRtsaScopeMetaPlans(metaByPath, manifest);
  addOnlineKtvScopeMetaPlans(metaByPath, manifest);
  addOpenApiLaneRootMetaPlans(metaByPath, lanes);
  addApiReferenceSupplementMetaPlans(metaByPath, manifest);

  return { metaByPath, openApiEntries };
}

function parseMetaLink(value) {
  if (typeof value !== 'string') return null;
  const match = value.match(/^\[((?:\\.|[^\]])+)]\(([^)]+)\)$/);
  return match ? { label: match[1], route: match[2] } : null;
}

function keepMetaRouteAsFolder(pages, route, folder, fallbackLabel) {
  const existingLink = (pages ?? [])
    .map(parseMetaLink)
    .find((link) => link?.route === route);
  const label = existingLink?.label ?? fallbackLabel;
  if (!label) return null;
  let found = false;
  const folderPages = (pages ?? []).map((page) => {
    const link = parseMetaLink(page);
    if (page !== folder && link?.route !== route) return page;
    found = true;
    return folder;
  });
  if (!found) folderPages.push(folder);
  return { label, pages: folderPages };
}

async function addEduStoreTypeDocMetaPlans({ manifest, metaByPath, repoRoot }) {
  const supplemental = (manifest.pageEvidence ?? []).filter(
    (page) =>
      page.supplementalGeneratedSource?.kind === 'edu-store-typedoc' &&
      page.sourceResolution?.status === 'resolved',
  );
  const pagesByPlatform = new Map();
  for (const page of supplemental) {
    const platform = page.supplementalGeneratedSource.targetPlatform;
    const pages = pagesByPlatform.get(platform) ?? [];
    pages.push(page);
    pagesByPlatform.set(platform, pages);
  }

  const stats = {
    hiddenReachableTargets: 0,
    invalidSupplementalTargetLinks: [],
    missingHiddenTargets: [],
    missingVisibleChildTargets: [],
    promotedNavigationLeaves: 0,
    visibleChildPages: 0,
    visibleEntryPages: 0,
  };
  for (const [platform, pages] of pagesByPlatform) {
    const visibleEntries = pages.filter(
      (page) =>
        page.supplementalGeneratedSource.navigationRole === 'visible-entry',
    );
    if (visibleEntries.length !== 1) {
      throw new Error(
        `Expected one ${platform} Edu Store TypeDoc visible entry; found ${visibleEntries.length}.`,
      );
    }
    const overview = visibleEntries[0];
    if (
      overview.supplementalGeneratedSource.sourceRelativePath !== 'index.html'
    ) {
      throw new Error(
        `${platform} Edu Store TypeDoc visible entry is not index.html.`,
      );
    }
    const hiddenPages = pages.filter(
      (page) =>
        page.supplementalGeneratedSource.navigationRole === 'hidden-reachable',
    );
    const visibleChildPages = pages.filter(
      (page) =>
        page.supplementalGeneratedSource.navigationRole === 'visible-child',
    );
    if (
      visibleEntries.length + visibleChildPages.length + hiddenPages.length !==
      pages.length
    ) {
      throw new Error(
        `${platform} Edu Store TypeDoc pages contain an unknown navigation role.`,
      );
    }
    stats.visibleEntryPages += 1;
    stats.visibleChildPages += visibleChildPages.length;
    stats.hiddenReachableTargets += hiddenPages.length;

    const sourceToc = overview.supplementalGeneratedSource.sourceToc ?? [];
    if (sourceToc.length !== 10) {
      throw new Error(
        `Expected 10 ${platform} Edu Store TypeDoc index headings; found ${sourceToc.length}.`,
      );
    }
    const sourceSidebar =
      overview.supplementalGeneratedSource.sourceSidebar ?? [];
    if (
      sourceSidebar.length < 2 ||
      sourceSidebar[0].sourceRelativePath !== 'index.html'
    ) {
      throw new Error(
        `${platform} Edu Store source sidebar is missing its overview and child pages.`,
      );
    }
    const pagesBySourcePath = new Map(
      pages.map((page) => [
        page.supplementalGeneratedSource.sourceRelativePath,
        page,
      ]),
    );
    const visibleSidebarPages = sourceSidebar.map((item) => ({
      ...item,
      page: pagesBySourcePath.get(item.sourceRelativePath),
    }));
    const missingSidebarPages = visibleSidebarPages.filter(
      (item) => !item.page,
    );
    if (missingSidebarPages.length > 0) {
      throw new Error(
        `${platform} Edu Store source sidebar has ${missingSidebarPages.length} missing targets.`,
      );
    }
    const sourceVisibleChildPaths = new Set(
      sourceSidebar.slice(1).map((item) => item.sourceRelativePath),
    );
    if (
      visibleChildPages.length !== sourceVisibleChildPaths.size ||
      visibleChildPages.some(
        (page) =>
          !sourceVisibleChildPaths.has(
            page.supplementalGeneratedSource.sourceRelativePath,
          ),
      )
    ) {
      throw new Error(
        `${platform} Edu Store visible child roles do not match the old sidebar.`,
      );
    }
    for (const page of visibleChildPages) {
      try {
        await fs.access(
          path.resolve(repoRoot, page.sourceResolution.targetPath),
        );
      } catch {
        stats.missingVisibleChildTargets.push({
          platform,
          sourcePath: page.sourceResolution.sourcePath,
          targetPath: page.sourceResolution.targetPath,
        });
      }
    }
    for (const page of hiddenPages) {
      try {
        await fs.access(
          path.resolve(repoRoot, page.sourceResolution.targetPath),
        );
      } catch {
        stats.missingHiddenTargets.push({
          platform,
          sourcePath: page.sourceResolution.sourcePath,
          targetPath: page.sourceResolution.targetPath,
        });
      }
    }
    const supplementalLinkAudit = auditDocsLinks({
      docsRoot: path.resolve(repoRoot, 'content/docs'),
      sourcePaths: [overview, ...visibleChildPages, ...hiddenPages].map(
        (page) =>
          page.sourceResolution.targetPath.replace(/^content\/docs\//, ''),
      ),
    });
    stats.invalidSupplementalTargetLinks.push(
      ...supplementalLinkAudit.invalidLinks.map((link) => ({
        platform,
        ...link,
      })),
    );

    const eduStoreDirectory = path.posix.dirname(
      overview.sourceResolution.targetPath,
    );
    const apiReferenceDirectory = path.posix.dirname(eduStoreDirectory);
    const parentMetaPath = `${apiReferenceDirectory}/meta.json`;
    const parentRoute = path.posix.dirname(
      overview.sourceResolution.targetRoute,
    );
    const currentParentPlan = metaByPath.get(parentMetaPath);
    const parentMeta = await readMeta(repoRoot, parentMetaPath, null);
    const parentPages = currentParentPlan?.pages ?? parentMeta.pages;
    const existingLink = parentPages
      .map(parseMetaLink)
      .find((link) => link?.route === overview.sourceResolution.targetRoute);
    const fallbackLabel = existingLink
      ? existingLink.label
      : (await readMeta(repoRoot, `${eduStoreDirectory}/meta.json`, null))
          .title;
    const replacement = keepMetaRouteAsFolder(
      parentPages,
      overview.sourceResolution.targetRoute,
      'edu-store',
      fallbackLabel,
    );
    if (!replacement) {
      throw new Error(
        `Missing ${platform} Edu Store API link in ${parentMetaPath}.`,
      );
    }
    const eduStoreLabel = replacement.label;
    metaByPath.set(parentMetaPath, {
      ...(currentParentPlan ?? {}),
      metaPath: parentMetaPath,
      rootRoute: parentRoute,
      title: parentMeta.title,
      pages: replacement.pages,
      metaPatch: currentParentPlan?.metaPatch ?? {},
      preserveExistingPages: false,
    });

    const platformDirectory = path.posix.dirname(apiReferenceDirectory);
    const platformMetaPath = `${platformDirectory}/meta.json`;
    const currentPlatformPlan = metaByPath.get(platformMetaPath);
    const platformMeta = await readMeta(repoRoot, platformMetaPath, null);
    const eduStoreRoutePrefix = `${overview.sourceResolution.targetRoute}/`;
    const sidebarLabels = {
      ...Object.fromEntries(
        Object.entries({
          ...(platformMeta.sidebarLabels ?? {}),
          ...(currentPlatformPlan?.metaPatch?.sidebarLabels ?? {}),
        }).filter(
          ([route]) =>
            route !== overview.sourceResolution.targetRoute &&
            !route.startsWith(eduStoreRoutePrefix),
        ),
      ),
      ...Object.fromEntries(
        visibleSidebarPages.map(({ label, page }) => [
          page.sourceResolution.targetRoute,
          label,
        ]),
      ),
    };
    metaByPath.set(platformMetaPath, {
      ...(currentPlatformPlan ?? {}),
      metaPath: platformMetaPath,
      rootRoute: routeForDocsDirectory(platformDirectory),
      title: platformMeta.title,
      pages: currentPlatformPlan?.pages ?? platformMeta.pages,
      metaPatch: {
        ...(currentPlatformPlan?.metaPatch ?? {}),
        sidebarLabels:
          Object.keys(sidebarLabels).length > 0 ? sidebarLabels : undefined,
      },
      preserveExistingPages: false,
    });
    createMetaAccumulator(metaByPath, {
      metaPath: `${eduStoreDirectory}/meta.json`,
      rootRoute: overview.sourceResolution.targetRoute,
      title: eduStoreLabel,
      pages: visibleSidebarPages.map(({ page }) => {
        const relativeTarget = path.posix.relative(
          eduStoreDirectory,
          page.sourceResolution.targetPath,
        );
        return relativeTarget.replace(/\.mdx$/i, '');
      }),
      metaPatch: { sidebarLabels: undefined },
    });
  }
  return stats;
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

function actionLabel(entry) {
  return entry.label === 'RESTful' ? 'RESTful API' : entry.label;
}

function actionForEntry(entry) {
  const href = entry.targetRoute ?? entry.legacyUrl;
  return { label: actionLabel(entry), href };
}

function rootActionLabel(entry, productEntries) {
  const useCases = unique(productEntries.map((item) => item.useCase));
  return [
    useCases.length > 1 ? entry.useCase : null,
    entry.label === 'RESTful' ? 'RESTful API' : entry.label,
  ]
    .filter(Boolean)
    .join(' · ');
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
          const actions = card.entries.map((entry) => actionForEntry(entry));
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

function rootMetaRoutes(pages) {
  return (pages ?? []).flatMap((page) => {
    if (page && typeof page === 'object') return rootMetaRoutes(page.pages);
    const parsed = parseMetaLink(page);
    return parsed?.route ? [parsed.route] : [];
  });
}

function apiReferenceRootSegment(route) {
  const prefix = '/zh-CN/api-reference/';
  if (!route?.startsWith(prefix)) return null;
  return route.slice(prefix.length).split('/')[0] || null;
}

function rootProductTitle(product) {
  return ROOT_PRODUCT_TITLES.get(product) ?? product;
}

function rootMetaLink(label, route) {
  return `[${String(label).replace(/([\\\]])/g, '\\$1')}](${route})`;
}

function parseRootMetaLink(page) {
  const parsed = parseMetaLink(page);
  if (!parsed?.label || !parsed.route) return null;
  return { label: parsed.label, route: parsed.route };
}

function catalogGroupsFromData(data) {
  const groups = [];
  const byProduct = new Map();
  for (const entry of data?.all ?? [
    ...(data?.client ?? []),
    ...(data?.server ?? []),
  ]) {
    if (!entry?.product || !entry?.sourceLabel || !entry?.href) continue;
    let group = byProduct.get(entry.product);
    if (!group) {
      group = {
        type: 'group',
        title: entry.product,
        pages: [],
      };
      byProduct.set(entry.product, group);
      groups.push(group);
    }
    const page = rootMetaLink(entry.sourceLabel, entry.href);
    if (!group.pages.includes(page)) group.pages.push(page);
  }
  return groups;
}

async function readExistingCatalogGroups(repoRoot) {
  try {
    const data = JSON.parse(
      await fs.readFile(
        path.resolve(repoRoot, API_REFERENCE_CATALOG_DATA),
        'utf8',
      ),
    );
    return catalogGroupsFromData(data);
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

function productGroupsFromRootMeta(pages) {
  const productReferenceIndex = (pages ?? []).findIndex(
    (page) =>
      page === '---产品参考---' ||
      (page &&
        typeof page === 'object' &&
        page.type === 'group' &&
        page.title === '产品参考' &&
        page.sidebarHidden === true),
  );
  if (productReferenceIndex < 0) return [];
  return pages.slice(productReferenceIndex + 1).filter(visibleRootProductGroup);
}

export function buildApiReferenceCatalogGroups(
  rootPages,
  existingCatalogGroups,
  entries,
  apiReferenceRehome,
) {
  const currentProductGroups = productGroupsFromRootMeta(rootPages);
  const preservedGroups =
    currentProductGroups.length > 0
      ? currentProductGroups
      : existingCatalogGroups;
  return reconcileRootProductGroups(
    preservedGroups,
    entries,
    apiReferenceRehome,
  ).filter(visibleRootProductGroup);
}

function platformIdForCatalogLabel(platform) {
  const normalized = platform.toLowerCase();
  if (platform === '设备端') return 'device';
  if (platform === '操控端') return 'operator';
  if (normalized.includes('restful')) return 'restful-api';
  if (normalized === 'javascript' || normalized === 'react') return 'web';
  if (normalized.startsWith('agent-')) return normalized.slice(6);
  if (normalized.includes('react native')) return 'react-native';
  if (normalized.includes('harmony')) return 'harmonyos';
  if (normalized.includes('unreal') && normalized.includes('blueprint'))
    return 'unreal-blueprint';
  if (normalized.includes('unreal')) return 'unreal-cpp';
  if (normalized.includes('electron')) return 'electron';
  if (normalized.includes('objective-c')) return 'ios';
  if (normalized.includes('c#')) return 'csharp';
  if (normalized.includes('c++')) return 'cpp';
  if (normalized.includes('小程序')) return 'mini-program';
  return normalized
    .replace(/\([^)]*\)/g, '')
    .trim()
    .replace(/[^a-z0-9]+/g, '-');
}

function catalogLabelParts(sourceLabel) {
  const parts = sourceLabel.split(' · ').map((part) => part.trim());
  const knownSolution = API_REFERENCE_CATALOG_SOLUTION_IDS.has(parts[0]);
  if (parts.length >= 3) {
    const solutionTitle = parts[0];
    const platform = parts.at(-2);
    const label = parts.at(-1);
    return {
      label,
      platform,
      solutionId: API_REFERENCE_CATALOG_SOLUTION_IDS.get(solutionTitle),
      solutionTitle,
    };
  }
  if (parts.length === 2 && knownSolution) {
    return {
      label: parts[1],
      platform: parts[1],
      solutionId: API_REFERENCE_CATALOG_SOLUTION_IDS.get(parts[0]),
      solutionTitle: parts[0],
    };
  }
  if (parts.length === 2 && (parts[0] === '客户端' || parts[0] === '服务端')) {
    return { label: parts[1], platform: parts[1] };
  }
  if (parts.length === 2) {
    return { label: parts[1], platform: parts[0] };
  }
  return { label: sourceLabel, platform: sourceLabel };
}

function catalogEntryLabelParts(product, action) {
  const projection = catalogLabelParts(action.label);
  if (product === '对话式 AI' && action.label.startsWith('agent-')) {
    const language = action.label.slice('agent-'.length);
    const platform =
      { go: 'Go', python: 'Python', typescript: 'TypeScript' }[language] ??
      language;
    return { label: 'Agent SDK', platform };
  }
  if (product === '对话式 AI' && action.route.includes('/restclient-')) {
    return { label: 'REST Client', platform: projection.platform };
  }
  if (projection.label === 'API 参考') {
    return { ...projection, label: projection.platform };
  }
  return projection;
}

function catalogApiType(product, sourceLabel, route, platform) {
  if (
    sourceLabel.includes('RESTful API') ||
    platform.includes('RESTful') ||
    route.includes('/api-ref/')
  ) {
    return 'restful-api';
  }
  if (
    API_REFERENCE_CATALOG_SERVER_PRODUCTS.has(product) ||
    sourceLabel.includes('服务端 API') ||
    (product === '对话式 AI' && !['Android', 'iOS', 'Web'].includes(platform))
  ) {
    return 'server-sdk';
  }
  return 'client-api';
}

export function buildApiReferenceCatalogData(
  groups,
  { lanes = OPENAPI_LANES } = {},
) {
  const data = { all: [], client: [], server: [] };
  const platformLandingRoutes = new Set(
    lanes
      .filter((lane) => !lane.locales || lane.locales.includes('zh-CN'))
      .map((lane) => lane.parentUrl['zh-CN']),
  );
  for (const group of groups) {
    const product = group.title;
    const productId = API_REFERENCE_CATALOG_PRODUCT_IDS.get(product);
    if (!productId) {
      throw new Error(`Missing API catalog product id rule for ${product}.`);
    }
    for (const page of group.pages ?? []) {
      const action = parseRootMetaLink(page);
      if (!action) continue;
      if (API_REFERENCE_CATALOG_HIDDEN_ROUTES.has(action.route)) continue;
      const projection = catalogEntryLabelParts(product, action);
      if (!projection.platform) continue;
      const apiType = catalogApiType(
        product,
        action.label,
        action.route,
        projection.platform,
      );
      const entry = {
        apiType,
        breadcrumbRole: platformLandingRoutes.has(action.route)
          ? 'platform-landing'
          : 'document',
        href: action.route,
        label: projection.label,
        platform: projection.platform,
        platformId: platformIdForCatalogLabel(projection.platform),
        product,
        productId,
        sourceLabel: action.label,
        ...(projection.solutionId
          ? {
              solutionId: projection.solutionId,
              solutionTitle: projection.solutionTitle,
            }
          : {}),
      };
      data.all.push(entry);
      data[apiType === 'client-api' ? 'client' : 'server'].push(entry);
    }
  }
  return data;
}

function visibleRootProductGroup(page) {
  return (
    page &&
    typeof page === 'object' &&
    page.type === 'group' &&
    page.sidebarHidden !== true
  );
}

function preferredExistingRootLink(
  existingPages,
  targetRoute,
  label,
  consumed,
) {
  if (!targetRoute) return null;
  const candidates = (existingPages ?? []).map((page, index) => ({
    index,
    page,
    parsed: parseMetaLink(page),
  }));
  const matches = candidates
    .filter(
      ({ parsed }) =>
        parsed?.route === targetRoute ||
        targetRoute.startsWith(`${parsed?.route}/`),
    )
    .sort(
      (left, right) =>
        (right.parsed?.route.length ?? 0) - (left.parsed?.route.length ?? 0),
    );
  const routeMatch =
    matches.find(({ index }) => !consumed.has(index)) ?? matches[0];
  if (routeMatch) return { ...routeMatch, useExistingRoute: true };
  const labelMatch = candidates.find(
    ({ index, parsed }) => !consumed.has(index) && parsed?.label === label,
  );
  return labelMatch ? { ...labelMatch, useExistingRoute: false } : null;
}

function sourceEntryRootPages(existingPages, entries, promotedLinks = []) {
  const canonicalRoutes = new Set(
    entries.map((entry) => entry.targetRoute).filter(Boolean),
  );
  const promotedDetailRoutes = new Set(
    promotedLinks
      .map((link) => link.route)
      .filter((route) => route && !canonicalRoutes.has(route)),
  );
  const entryScopedPages = (existingPages ?? []).filter(
    (page) => !promotedDetailRoutes.has(parseMetaLink(page)?.route),
  );
  const consumed = new Set();
  const generated = [];
  for (const entry of entries) {
    if (API_REFERENCE_CATALOG_HIDDEN_ROUTES.has(entry.targetRoute)) continue;
    const label = rootActionLabel(entry, entries);
    const existing = preferredExistingRootLink(
      entryScopedPages,
      entry.targetRoute,
      label,
      consumed,
    );
    if (existing) consumed.add(existing.index);
    const route = existing?.useExistingRoute
      ? existing.parsed?.route
      : entry.targetRoute;
    if (!route) continue;
    generated.push(rootMetaLink(label, route));
  }
  const generatedLabels = new Set(
    generated.map((page) => parseMetaLink(page)?.label).filter(Boolean),
  );
  for (const [index, page] of entryScopedPages.entries()) {
    const parsed = parseMetaLink(page);
    if (API_REFERENCE_CATALOG_HIDDEN_ROUTES.has(parsed?.route)) continue;
    const existingLabel = parsed?.label;
    if (
      !consumed.has(index) &&
      !generated.includes(page) &&
      !generatedLabels.has(existingLabel)
    ) {
      generated.push(page);
    }
  }
  return generated;
}

function reconcileRootProductGroups(pages, entries, apiReferenceRehome) {
  const existingGroups = pages.filter(visibleRootProductGroup);
  const existingByTitle = new Map(
    existingGroups.map((page) => [page.title, page]),
  );
  const consumed = new Set();
  const projected = [];
  const internalEntries = entries.filter(
    (entry) => entry.urlFamily !== 'external',
  );

  for (const group of productGroups(internalEntries)) {
    const title = rootProductTitle(group.product);
    const existing = existingByTitle.get(title);
    const landing = (apiReferenceRehome?.landingPages ?? []).find(
      (candidate) => candidate.title === group.product,
    );
    const groupPages = sourceEntryRootPages(
      existing?.pages ?? [],
      group.entries,
      landing?.links,
    );
    if (groupPages.length === 0 && landing) {
      groupPages.push(
        ...landing.links.map((link) => rootMetaLink(link.label, link.route)),
      );
    }
    if (groupPages.length === 0) continue;
    if (existing) consumed.add(existing);
    projected.push({
      ...(existing ?? {
        type: 'group',
        icon: ROOT_PRODUCT_ICONS.get(title),
        collapsible: true,
      }),
      title,
      pages: groupPages,
    });
  }

  const reconciled = [
    ...projected,
    ...pages.filter(
      (page) => !visibleRootProductGroup(page) || !consumed.has(page),
    ),
  ];
  const productOrder = new Map();
  for (const entry of entries) {
    const title = rootProductTitle(entry.product);
    if (!productOrder.has(title)) productOrder.set(title, productOrder.size);
  }
  return reconciled.sort(
    (left, right) =>
      (productOrder.get(left?.title) ?? Number.POSITIVE_INFINITY) -
      (productOrder.get(right?.title) ?? Number.POSITIVE_INFINITY),
  );
}

/**
 * @param {any[]} pages
 * @param {any[]} entries
 * @param {{landingPages?: any[]} | null} [_apiReferenceRehome]
 * @returns {any[]}
 */
export function scopedRootMetaPages(
  pages,
  entries,
  _apiReferenceRehome = null,
) {
  const preserved = [...(pages ?? [])].filter((page) => page !== 'overview');
  const apiReferenceIndex = preserved.indexOf('api');
  if (apiReferenceIndex > 0) {
    preserved.splice(apiReferenceIndex, 1);
    preserved.unshift('api');
  }
  const productReferenceIndex = preserved.findIndex(
    (page) =>
      page === '---产品参考---' ||
      (page &&
        typeof page === 'object' &&
        page.type === 'group' &&
        page.title === '产品参考' &&
        page.sidebarHidden === true),
  );
  if (productReferenceIndex < 0) return preserved;

  const productReferenceEntry = preserved[productReferenceIndex];
  const productReferencePages =
    productReferenceEntry &&
    typeof productReferenceEntry === 'object' &&
    Array.isArray(productReferenceEntry.pages)
      ? productReferenceEntry.pages
      : [];
  const tail = preserved.slice(productReferenceIndex + 1);
  const structuralRoots = unique([
    ...(entries.some((entry) =>
      entry.targetRoute?.startsWith('/zh-CN/api-reference/api-ref/'),
    )
      ? ['api-ref']
      : []),
    ...(entries.some((entry) =>
      entry.targetRoute?.startsWith(
        '/zh-CN/api-reference/whiteboard/whiteboard-sdk/',
      ),
    )
      ? ['whiteboard']
      : []),
    ...productReferencePages,
    ...entries
      .map((entry) => apiReferenceRootSegment(entry.targetRoute))
      .filter(Boolean),
    ...rootMetaRoutes(tail).map(apiReferenceRootSegment).filter(Boolean),
    ...tail.filter(
      (page) =>
        typeof page === 'string' &&
        !page.startsWith('---') &&
        !page.startsWith('['),
    ),
  ]);
  return [
    ...preserved.slice(0, productReferenceIndex),
    ...(structuralRoots.length > 0
      ? [
          {
            type: 'group',
            title: '产品参考',
            sidebarHidden: true,
            pages: structuralRoots,
          },
        ]
      : []),
  ];
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
  apiReferenceRehome,
  catalogData,
  catalogGroups,
  entries,
  metaByPath,
  overviewBody,
  rootPages,
  routeMap,
  supplementalNavigation,
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
    .filter(
      (page) =>
        page &&
        typeof page === 'object' &&
        page.type === 'group' &&
        page.sidebarHidden !== true,
    )
    .reduce((count, page) => count + countMetaLinks(page.pages), 0);
  const visibleRootGroups = rootPages.filter(visibleRootProductGroup);
  const manifestProductGroups = productGroups(internalEntries);
  const manifestProductTitles = manifestProductGroups.map((group) =>
    rootProductTitle(group.product),
  );
  const visibleRootProductTitles = visibleRootGroups.map((page) => page.title);
  const catalogEntries = catalogData.all ?? [
    ...(catalogData.client ?? []),
    ...(catalogData.server ?? []),
  ];
  const catalogProductTitles = unique(
    catalogEntries.map((entry) => entry.product),
  );
  const catalogSourceActions = catalogGroups.flatMap((group) =>
    (group.pages ?? [])
      .map(parseRootMetaLink)
      .filter(Boolean)
      .map((action) => ({ ...action, product: group.title })),
  );
  const missingCatalogActions = catalogSourceActions.filter(
    (action) =>
      !catalogEntries.some(
        (entry) =>
          entry.product === action.product &&
          entry.sourceLabel === action.label &&
          entry.href === action.route,
      ),
  );
  const catalogProductOrderMatches =
    JSON.stringify(catalogProductTitles) ===
    JSON.stringify(catalogGroups.map((group) => group.title));
  const expectedManifestCatalogActions = manifestProductGroups.flatMap(
    (group) =>
      group.entries
        .filter(
          (entry) =>
            entry.targetRoute &&
            !API_REFERENCE_CATALOG_HIDDEN_ROUTES.has(entry.targetRoute),
        )
        .map((entry) => ({
          product: group.product,
          label: rootActionLabel(entry, group.entries),
          route: entry.targetRoute,
        })),
  );
  const missingManifestCatalogActions = expectedManifestCatalogActions.filter(
    (action) =>
      !catalogEntries.some(
        (entry) =>
          entry.product === rootProductTitle(action.product) &&
          (entry.href === action.route ||
            action.route.startsWith(`${entry.href}/`)),
      ),
  );
  const catalogLandingGroups = apiReferenceRehome.landingPages.filter(
    (landing) =>
      catalogEntries.some(
        (entry) =>
          entry.href === landing.route ||
          entry.href.startsWith(`${landing.route}/`),
      ),
  );
  const catalogLandingLinks = catalogLandingGroups.flatMap(
    (landing) => landing.links,
  );
  const manifestCatalogRoutes = new Set(
    expectedManifestCatalogActions.map((action) => action.route),
  );
  const promotedCatalogLandingLinks = catalogLandingLinks.filter(
    (link) =>
      !manifestCatalogRoutes.has(link.route) &&
      catalogEntries.some((entry) => entry.href === link.route),
  );
  const visibleLeaves = internalEntries.flatMap((entry) => {
    const navigation =
      entry.pageGraph?.sourceNavigation ?? entry.pageGraph?.navigation;
    return visibleNavigationLeaves(
      navigation,
      routeMap,
      [],
      entry.pageGraph?.closure?.scopeRoot,
    ).map((leaf) => ({
      ...leaf,
      product: entry.product,
      entryLabel: entry.label,
    }));
  });
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
  if (visibleRootGroups.length > 0) {
    issues.push({
      severity: 'error',
      code: 'reference-root-product-navigation-present',
      message: `${visibleRootGroups.length} product groups remain in the Reference Center root sidebar.`,
    });
  }
  if (missingCatalogActions.length > 0) {
    issues.push({
      severity: 'error',
      code: 'missing-api-reference-catalog-action',
      message: `${missingCatalogActions.length} source catalog actions are missing from the API reference directory.`,
    });
  }
  if (missingManifestCatalogActions.length > 0) {
    issues.push({
      severity: 'error',
      code: 'missing-manifest-api-reference-catalog-action',
      message: `${missingManifestCatalogActions.length} internal API Center actions are missing from the API reference directory.`,
    });
  }
  if (promotedCatalogLandingLinks.length > 0) {
    issues.push({
      severity: 'error',
      code: 'promoted-reference-detail-catalog-link',
      message: `${promotedCatalogLandingLinks.length} platform-internal detail links were promoted into the API reference directory.`,
    });
  }
  if (!catalogProductOrderMatches) {
    issues.push({
      severity: 'error',
      code: 'api-reference-catalog-product-order',
      message: 'The API reference directory does not preserve product order.',
    });
  }
  if (/https?:\/\/doc\.shengwang\.cn\/(?:doc|api-ref)\//.test(overviewBody)) {
    issues.push({
      severity: 'error',
      code: 'overview-old-site-link',
      message: 'Overview contains an old-site API Center body link.',
    });
  }
  if (supplementalNavigation.missingHiddenTargets.length > 0) {
    issues.push({
      severity: 'error',
      code: 'missing-hidden-typedoc-target',
      message: `${supplementalNavigation.missingHiddenTargets.length} hidden Edu Store TypeDoc targets are missing.`,
    });
  }
  if (supplementalNavigation.missingVisibleChildTargets.length > 0) {
    issues.push({
      severity: 'error',
      code: 'missing-visible-typedoc-target',
      message: `${supplementalNavigation.missingVisibleChildTargets.length} visible Edu Store TypeDoc child targets are missing.`,
    });
  }
  if (supplementalNavigation.invalidSupplementalTargetLinks.length > 0) {
    issues.push({
      severity: 'error',
      code: 'invalid-supplemental-typedoc-link',
      message: `${supplementalNavigation.invalidSupplementalTargetLinks.length} links from Edu Store TypeDoc targets are invalid.`,
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
      visibleRootProductGroups: visibleRootProductTitles.length,
      catalogProductGroups: catalogProductTitles.length,
      catalogActions: catalogEntries.length,
      expectedCatalogActions: catalogSourceActions.length,
      missingCatalogActions: missingCatalogActions.length,
      expectedManifestCatalogProducts: manifestProductTitles.length,
      expectedManifestCatalogActions: expectedManifestCatalogActions.length,
      missingManifestCatalogActions: missingManifestCatalogActions.length,
      catalogProductOrderMatches,
      catalogReferenceLandingGroups: catalogLandingGroups.length,
      catalogReferenceLandingLinks: catalogLandingLinks.length,
      promotedCatalogReferenceLandingLinks: promotedCatalogLandingLinks.length,
      entryMetaFiles: metaByPath.size,
      entryMetaLinks: [...metaByPath.values()].reduce(
        (count, plan) => count + countMetaLinks(plan.pages),
        0,
      ),
      visibleNavigationLeaves: visibleLeaves.length,
      visibleSupplementalEntryPages: supplementalNavigation.visibleEntryPages,
      visibleSupplementalChildPages: supplementalNavigation.visibleChildPages,
      hiddenReachableTypeDocTargets:
        supplementalNavigation.hiddenReachableTargets,
      promotedSupplementalNavigationLeaves:
        supplementalNavigation.promotedNavigationLeaves,
      missingHiddenTargets: supplementalNavigation.missingHiddenTargets.length,
      missingVisibleChildTargets:
        supplementalNavigation.missingVisibleChildTargets.length,
      invalidSupplementalTargetLinks:
        supplementalNavigation.invalidSupplementalTargetLinks.length,
      rehomedApiSourcePages: apiReferenceRehome.sourcePages.length,
      rehomedApiPages: apiReferenceRehome.records.length,
      referenceCenterLandingPages: apiReferenceRehome.landingPages.length,
      sectionNavigationLinkFiles: apiReferenceRehome.metaPlans.length,
      missingNavigationTargets: missingNavigationTargets.length,
      warnings: issues.filter((issue) => issue.severity === 'warning').length,
      errors: issues.filter((issue) => issue.severity === 'error').length,
    },
    missingEntryTargets,
    missingNavigationTargets,
    missingCatalogActions,
    missingManifestCatalogActions,
    promotedCatalogLandingLinks,
    missingHiddenTargets: supplementalNavigation.missingHiddenTargets,
    missingVisibleChildTargets:
      supplementalNavigation.missingVisibleChildTargets,
    invalidSupplementalTargetLinks:
      supplementalNavigation.invalidSupplementalTargetLinks,
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
    `- Visible root product groups: ${report.counts.visibleRootProductGroups}`,
    `- API reference catalog product groups: ${report.counts.catalogProductGroups}`,
    `- API reference catalog actions: ${report.counts.catalogActions}`,
    `- Expected catalog actions: ${report.counts.expectedCatalogActions}`,
    `- Missing catalog actions: ${report.counts.missingCatalogActions}`,
    `- Expected manifest catalog products: ${report.counts.expectedManifestCatalogProducts}`,
    `- Expected manifest catalog actions: ${report.counts.expectedManifestCatalogActions}`,
    `- Missing manifest catalog actions: ${report.counts.missingManifestCatalogActions}`,
    `- Catalog product order matches source: ${report.counts.catalogProductOrderMatches ? 'yes' : 'no'}`,
    `- Catalog Reference Center landing groups: ${report.counts.catalogReferenceLandingGroups}`,
    `- Catalog Reference Center landing links: ${report.counts.catalogReferenceLandingLinks}`,
    `- Promoted platform-internal catalog links: ${report.counts.promotedCatalogReferenceLandingLinks}`,
    `- Entry meta files: ${report.counts.entryMetaFiles}`,
    `- Entry meta links: ${report.counts.entryMetaLinks}`,
    `- Visible legacy navigation leaves: ${report.counts.visibleNavigationLeaves}`,
    `- Visible supplemental entry pages: ${report.counts.visibleSupplementalEntryPages}`,
    `- Visible supplemental child pages: ${report.counts.visibleSupplementalChildPages}`,
    `- Hidden reachable TypeDoc targets: ${report.counts.hiddenReachableTypeDocTargets}`,
    `- Promoted supplemental navigation leaves: ${report.counts.promotedSupplementalNavigationLeaves}`,
    `- Missing hidden targets: ${report.counts.missingHiddenTargets}`,
    `- Missing visible child targets: ${report.counts.missingVisibleChildTargets}`,
    `- Invalid supplemental target links: ${report.counts.invalidSupplementalTargetLinks}`,
    `- Legacy API source pages rehomed from product sections: ${report.counts.rehomedApiSourcePages}`,
    `- Superseded non-reference API targets: ${report.counts.rehomedApiPages}`,
    `- Reference Center landing pages: ${report.counts.referenceCenterLandingPages}`,
    `- Section navigation files converted to links: ${report.counts.sectionNavigationLinkFiles}`,
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
  const apiReferenceRehome = buildApiReferenceRehomePlan(manifest);
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
  const rootMetaSource = await fs.readFile(
    path.resolve(repoRoot, rootMetaPath),
    'utf8',
  );
  const rootMeta = await readMeta(repoRoot, rootMetaPath, null);
  const existingCatalogGroups = await readExistingCatalogGroups(repoRoot);
  const catalogGroups = buildApiReferenceCatalogGroups(
    rootMeta.pages,
    existingCatalogGroups,
    entries,
    apiReferenceRehome,
  );
  const catalogData = buildApiReferenceCatalogData(catalogGroups, { lanes });
  const rootPages = scopedRootMetaPages(
    rootMeta.pages,
    entries,
    apiReferenceRehome,
  );
  const rootMetaContents =
    JSON.stringify(rootPages) === JSON.stringify(rootMeta.pages)
      ? rootMetaSource.endsWith('\n')
        ? rootMetaSource
        : `${rootMetaSource}\n`
      : serializeJson({ ...rootMeta, pages: rootPages });
  run.planFile({
    targetPath: rootMetaPath,
    contents: rootMetaContents,
    sourcePath: manifestPath,
    sourceUrl: API_CENTER_URL,
    type: 'navigation-meta',
    adoptExisting: true,
  });
  run.planFile({
    targetPath: API_REFERENCE_CATALOG_DATA,
    contents: serializeJson({ all: catalogData.all }),
    sourcePath: manifestPath,
    sourceUrl: API_CENTER_URL,
    type: 'navigation-data',
    adoptExisting: true,
  });

  const { metaByPath, openApiEntries } = buildEntryMetaPlans(
    manifest,
    routeMap,
    lanes,
  );
  const supplementalNavigation = await addEduStoreTypeDocMetaPlans({
    manifest,
    metaByPath,
    repoRoot,
  });
  for (const landing of apiReferenceRehome.landingPages) {
    run.planFile({
      targetPath: landing.targetPath,
      contents: renderGeneratedMdx({
        title: landing.title,
        description: landing.description,
        body: [
          landing.description,
          landing.description ? '' : null,
          ...landing.links.map((link) => `- [${link.label}](${link.route})`),
        ]
          .filter((line) => line !== null)
          .join('\n'),
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
      adoptExisting: run.ownsTarget(landing.targetPath),
    });
    const landingMetaPath = `${path.posix.dirname(landing.targetPath)}/meta.json`;
    const existingMetaPlan = metaByPath.get(landingMetaPath);
    if (existingMetaPlan) {
      existingMetaPlan.includeIndex = true;
      continue;
    }
    createMetaAccumulator(metaByPath, {
      metaPath: landingMetaPath,
      rootRoute: landing.route,
      title: landing.title,
      pages: [],
      includeIndex: true,
      preserveExistingPages: true,
    });
  }
  const parity = navigationParityReport({
    apiReferenceRehome,
    catalogData,
    catalogGroups,
    entries,
    metaByPath,
    overviewBody,
    rootPages,
    routeMap,
    supplementalNavigation,
  });
  if (parity.counts.errors > 0) {
    throw new Error(
      `API Center navigation parity found ${parity.counts.errors} errors: ${parity.issues
        .filter((issue) => issue.severity === 'error')
        .map((issue) => `${issue.code}: ${issue.message}`)
        .join('; ')}`,
    );
  }
  for (const plan of [...metaByPath.values()].sort((left, right) =>
    left.metaPath.localeCompare(right.metaPath),
  )) {
    const existingMetaSource = plan.preserveExistingMeta
      ? await fs
          .readFile(path.resolve(repoRoot, plan.metaPath), 'utf8')
          .catch((error) => {
            if (error.code === 'ENOENT') return null;
            throw error;
          })
      : null;
    if (existingMetaSource !== null) {
      // Existing OpenAPI meta is outside this run; keep its prior ledger entry.
      run.retainPreviousOwnershipRecord(plan.metaPath);
      continue;
    }
    const meta = await readMeta(repoRoot, plan.metaPath, plan.title);
    const indexPath = `${path.posix.dirname(plan.metaPath)}/index.mdx`;
    const hasIndex = await fs
      .access(path.resolve(repoRoot, indexPath))
      .then(() => true)
      .catch(() => false);
    const plannedPages = plan.preserveExistingPages
      ? mergeMetaPages([...(meta.pages ?? [])], plan.pages)
      : plan.pages;
    const pages =
      hasIndex || plan.includeIndex
        ? mergeMetaPages(['index'], plannedPages)
        : plannedPages;
    if (pages.length === 0) continue;
    run.planFile({
      targetPath: plan.metaPath,
      contents: serializeJson({ ...meta, ...plan.metaPatch, pages }),
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
  const rehome = await reconcileApiReferenceRehome({
    repoRoot,
    mode,
    plan: apiReferenceRehome,
  });
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
    rehome,
    parity,
    entries: entries.length,
    metaFiles: [...run.planned.values(), ...run.retainedOwned.values()].filter(
      (file) => file.type === 'navigation-meta',
    ).length,
  };
}
