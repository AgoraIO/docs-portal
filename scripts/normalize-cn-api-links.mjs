#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  findLegacyBodyLinks,
  reconcileMappedBodyLink,
} from './lib/api-center/legacy-links.mjs';
import {
  buildLocalFragmentIndex,
  findBestFragmentAnchor,
  insertFragmentAliases,
  rewriteLocalFragmentLinks,
  targetPathToRoute,
} from './lib/api-center/local-fragment-index.mjs';
import {
  buildLegacyRouteMap,
  loadFaqMappingRows,
  rewriteLegacyHref,
} from './lib/api-center/migration-framework.mjs';
import { parseCsv } from './lib/api-center/source-resolver.mjs';

const REPORT_PATH = 'docs/agents/reports/2026-07-23-cn-api-unresolved-links.md';

const EXACT_LINK_OVERRIDES = new Map([
  [
    'https://docportal.shengwang.cn/cn/Real-time-Messaging/landing-page?platform=Android',
    '/zh-CN/realtime-media/rtm',
  ],
  [
    'https://docportal.shengwang.cn/cn/Real-time-Messaging/messaging_android?platform=Android',
    '/zh-CN/realtime-media/rtm/get-started/quick-start',
  ],
  [
    'https://docportal.shengwang.cn/cn/Real-time-Messaging/api-ref?platform=All%20Platforms',
    '/zh-CN/api-reference/rtm/android',
  ],
  [
    'https://docportal.shengwang.cn/cn/Real-time-Messaging/product_rtm?platform=All%20Platforms',
    '/zh-CN/realtime-media/rtm',
  ],
  [
    'https://docportal.shengwang.cn/cn/media-push/streaming_restful?platform=All%20Platforms',
    '/zh-CN/api-reference/media-push/restful/overview/product-overview',
  ],
  [
    'https://docportal.shengwang.cn/cn/smart_doorbell/landing-page?platform=Android',
    '/zh-CN/solutions/smart-doorbell',
  ],
  [
    'https://docportal.shengwang.cn/cn/live-streaming-premium-4.x/API%20Reference/java_ng/API/toc_core_method.html#api_irtcengine_joinchannel2',
    '/zh-CN/api-reference/rtc/android/channel#api_irtcengine_joinchannel2',
  ],
  [
    'https://docportal.shengwang.cn/cn/live-streaming-premium-4.x/API%20Reference/java_ng/API/toc_core_method.html#api_irtcengine_create',
    '/zh-CN/api-reference/rtc/android/initialize#api_irtcengine_create',
  ],
  [
    'https://docportal.shengwang.cn/cn/live-streaming-premium-4.x/API%20Reference/ios_ng/API/rtc_api_overview_ng.html',
    '/zh-CN/api-reference/rtc/ios/rtc-api-overview',
  ],
  [
    'https://docportal.shengwang.cn/cn/live-streaming-premium-4.x/API%20Reference/ios_ng/API/toc_core_method.html#api_irtcengine_joinchannel',
    '/zh-CN/api-reference/rtc/ios/channel#api_irtcengine_joinchannel1',
  ],
  [
    'https://docportal.shengwang.cn/cn/live-streaming-premium-4.x/API%20Reference/ios_ng/API/toc_core_method.html#api_irtcengine_initialize',
    '/zh-CN/api-reference/rtc/ios/initialize#api_irtcengine_initialize',
  ],
  [
    'https://docs.agora.io/cn/Agora%20Platform/console_overview?platform=All%20Platforms',
    '/zh-CN/introduction/quickstart',
  ],
  [
    'https://docs.agora.io/cn/Agora%20Platform/agora_console_restapi?platform=All%20Platforms',
    '/zh-CN/api-reference/api-ref/console',
  ],
  [
    'https://docs.agora.io/cn/Agora%20Platform/firewall?platform=All%20Platforms#web-sdk',
    '/zh-CN/realtime-media/rtc/build/setup-and-access/firewall',
  ],
  [
    'https://docs.agora.io/cn/Interactive%20Broadcast/cloud_proxy_web?platform=Web',
    '/zh-CN/realtime-media/rtc/build/setup-and-access/firewall#云代理方案',
  ],
  [
    'https://docs.agora.io/cn/Agora%20Platform/security',
    '/zh-CN/introduction/security/best-practice',
  ],
  [
    'https://docs.agora.io/cn/Agora%20Platform/term_agora_rtc_sdk',
    '/zh-CN/realtime-media/rtc/reference/key-concept',
  ],
  [
    'https://docs.agora.io/cn/Agora%20Platform/token#get-an-app-id',
    '/zh-CN/introduction/quickstart#获取开发参数',
  ],
  [
    'https://docs.agora.io/cn/AgoraPlatform/sign_in_and_sign_up',
    '/zh-CN/introduction/quickstart',
  ],
  [
    'https://docs.agora.io/cn/Real-time-Messaging/product_rtm',
    '/zh-CN/realtime-media/rtm',
  ],
  [
    'https://docs.agora.io/cn/Real-time-Messaging/token2_server_rtm',
    '/zh-CN/realtime-media/rtm/build/security-and-auth/token-generation',
  ],
  [
    'https://docs.agora.io/cn/Real-time-Messaging/token2_server_rtm?platform=All%20Platforms',
    '/zh-CN/realtime-media/rtm/build/security-and-auth/token-generation',
  ],
  [
    'https://docs.agora.io/cn/cloud-recording/cloud_recording_layout?platform=Linux',
    '/zh-CN/realtime-media/cloud-recording/build/recording-modes/mix-mode/set-composite-layout',
  ],
  [
    'https://docs.agora.io/cn/cloud-recording/cloud_recording_webpage_mode',
    '/zh-CN/realtime-media/cloud-recording/build/recording-modes/web-mode/set-webpage-recording',
  ],
  [
    'https://docs.agora.io/cn/cloud-recording/cloud_recording_webpage_mode?platform=RESTful',
    '/zh-CN/realtime-media/cloud-recording/build/recording-modes/web-mode/set-webpage-recording',
  ],
  [
    'https://docs.agora.io/cn/cloud-transcoding/cloud_transcoder?platform=All%20Platforms#query：查询-cloud-transcoder-状态信息',
    '/zh-CN/api-reference/api-ref/cloud-transcoding/query',
  ],
  [
    'https://docs.agora.io/cn/live-streaming-premium-4.x/API%20Reference/ios_ng/API/rtc_api_data_type.html#class_externalvideoframe',
    '/zh-CN/api-reference/rtc/ios/class-externalvideoframe',
  ],
  [
    'https://docs.agora.io/cn/live-streaming-premium-4.x/API%20Reference/java_ng/API/rtc_api_data_type.html#class_externalvideoframe',
    '/zh-CN/api-reference/rtc/android/class-externalvideoframe',
  ],
  [
    'https://docs.agora.io/cn/live-streaming-premium-legacy/mediaplayer_win?platform=Windows',
    '/zh-CN/realtime-media/rtc/build/audio/media-player',
  ],
  [
    'https://docs.agora.io/cn/live-streaming-premium-legacy/web_sdk_compatibility?platform=Web#移动端',
    '/zh-CN/realtime-media/rtc/reference/browser-compatibility',
  ],
  [
    'https://docs.agora.io/cn/online-ktv/ktv_overview',
    '/zh-CN/solutions/online-ktv',
  ],
  [
    'https://docs.agora.io/cn/whiteboard/file_conversion_overview?platform=RESTful',
    '/zh-CN/realtime-media/whiteboard/fastboard-sdk/build/extend-whiteboard/convert-files',
  ],
  [
    'https://docs.agora.io/cn/whiteboard/whiteboard_file_conversion?platform=RESTful#查询转换任务的进度',
    '/zh-CN/api-reference/api-ref/whiteboard/restful/start-file-conversion',
  ],
  [
    '/doc/rtc/restful/channel-management/operations/get-dev-v1-channel-user-appid-channelName-hosts_only',
    '/zh-CN/api-reference/api-ref/rtc/query-host-list',
  ],
  [
    '/doc/recording/cpp/advanced-features/merge-files',
    '/zh-CN/realtime-media/local-server-recording/build/implement-core-features/legacy/merge-files',
  ],
  [
    '/doc/recording/java/advanced-features/merge-files',
    '/zh-CN/realtime-media/local-server-recording/build/implement-core-features/legacy/merge-files',
  ],
  [
    '/doc/danmaku/restful/danmaku/operations/get-cloud-game-list',
    '/zh-CN/api-reference/api-ref/danmaku/get-cloud-game-list',
  ],
  [
    '/doc/danmaku/restful/danmaku/operations/start-pc-game',
    '/zh-CN/api-reference/api-ref/danmaku/start-pc-game',
  ],
  [
    '/doc/danmaku/restful/danmaku/operations/push-message',
    '/zh-CN/api-reference/api-ref/danmaku/push-message',
  ],
  [
    '/doc/analytics/general/restful-aa/operations/get-beta-insight-quality-by_time',
    '/zh-CN/api-reference/api-ref/agora-analytics/insight-quality-time',
  ],
  [
    '/doc/analytics/general/restful-aa/operations/post-beta-insight-usage-aggregation',
    '/zh-CN/api-reference/api-ref/agora-analytics/insight-usage-aggregation',
  ],
  [
    '/doc/analytics/general/restful-aa/operations/post-beta-insight-quality-aggregation',
    '/zh-CN/api-reference/api-ref/agora-analytics/insight-quality-aggregation',
  ],
  [
    '/doc/analytics/general/restful-aa/operations/get-beta-realtime-usage-dimension-top20',
    '/zh-CN/api-reference/api-ref/agora-analytics/realtime-usage-top20',
  ],
  [
    '/doc/analytics/general/restful-aa/operations/get-beta-realtime-quality-dimension-top20',
    '/zh-CN/api-reference/api-ref/agora-analytics/realtime-quality-top20',
  ],
  [
    '/doc/speech-to-text/RESTful/v7/operations/get-task-list',
    '/zh-CN/api-reference/api-ref/speech-to-text/list',
  ],
  ['/doc/rtc/homepage', '/zh-CN/realtime-media/rtc'],
  [
    '/doc/rtc//basic-features/audio-quick-start',
    '/zh-CN/realtime-media/rtc/get-started/quick-start',
  ],
  [
    '/doc/rtc//basic-features/channel-connection',
    '/zh-CN/realtime-media/rtc/build/initialize-and-channel/channel-connection',
  ],
  [
    '/doc/rtc//basic-features/volume',
    '/zh-CN/realtime-media/rtc/build/audio/volume',
  ],
  [
    '/doc/rtc//advanced-features/in-call-quality',
    '/zh-CN/realtime-media/rtc/build/optimize-and-operate/in-call-quality',
  ],
  [
    '/doc/rtc//advanced-features/voice-changer',
    '/zh-CN/realtime-media/rtc/build/audio/voice-changer',
  ],
  [
    '/doc/rtc//advanced-features/spatial-audio',
    '/zh-CN/realtime-media/rtc/build/audio/spatial-audio',
  ],
  [
    '/doc/rtc//advanced-features/content-inspect',
    '/zh-CN/realtime-media/rtc/build/video/content-inspect',
  ],
  [
    '/doc/rtc//advanced-features/custom-video-source',
    '/zh-CN/realtime-media/rtc/build/video/custom-video-source',
  ],
  [
    '/doc/rtc//best-practice/prevent-stream-bombing',
    '/zh-CN/realtime-media/rtc/build/security-and-auth/prevent-stream-bombing',
  ],
  ['/doc/online-ktv//landing-page', '/zh-CN/solutions/online-ktv'],
  [
    '/doc/online-ktv/android/implementation/music-content-center',
    '/zh-CN/solutions/online-ktv/ktv-scenario/build/extend-karaoke/get-music',
  ],
  [
    '/doc/online-ktv/ios/implementation/music-content-center',
    '/zh-CN/solutions/online-ktv/ktv-scenario/build/extend-karaoke/get-music',
  ],
  [
    '/doc/online-ktv/android/overview/introduction#方案对比',
    '/zh-CN/solutions/online-ktv/ktv-scenario/reference/solution-compare',
  ],
  [
    '/doc/whiteboard//landing-page',
    '/zh-CN/realtime-media/whiteboard/fastboard-sdk',
  ],
  [
    '/doc/whiteboard//whiteboard-sdk/landing-page',
    '/zh-CN/realtime-media/whiteboard/whiteboard-sdk',
  ],
  [
    '/doc/whiteboard/android/overview/billing',
    '/zh-CN/realtime-media/whiteboard/fastboard-sdk/reference/billing',
  ],
]);

const RTC_GUIDE_OVERRIDES = [
  ['start_live_', '/zh-CN/realtime-media/rtc/get-started/quick-start'],
  [
    'multiple_channel_',
    '/zh-CN/realtime-media/rtc/build/advanced-channel/multiple-channel',
  ],
  ['screensharing_', '/zh-CN/realtime-media/rtc/build/video/screen-share'],
  [
    'custom_audio_',
    '/zh-CN/realtime-media/rtc/build/audio/custom-audio-source',
  ],
  [
    'custom_video_',
    '/zh-CN/realtime-media/rtc/build/video/custom-video-source',
  ],
];

const LEGACY_PLATFORM_ROUTES = new Map([
  ['javascript', 'web'],
  ['rn', 'react-native'],
  ['unreal-blueprint', 'blueprint'],
  ['windows', 'cpp-all-platforms'],
]);

const LEGACY_PRODUCT_ROUTES = new Map([
  ['flexible-classroom', 'flexible-classroom'],
  ['recording', 'local-server-recording'],
  ['rtc', 'rtc'],
  ['rtc-server-sdk', 'rtc-server-sdk'],
  ['rtm2', 'rtm'],
  ['rtsa', 'rtsa'],
  ['whiteboard', 'whiteboard/whiteboard-sdk'],
]);

function parseArgs(argv) {
  const options = { mode: 'write' };

  for (const argument of argv) {
    if (argument === '--check') options.mode = 'check';
    else if (argument === '--help' || argument === '-h') {
      console.log('Usage: node scripts/normalize-cn-api-links.mjs [--check]');
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }

  return options;
}

async function listMarkdownFiles(root) {
  const files = [];

  async function visit(directory) {
    for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name);

      if (entry.isDirectory()) await visit(absolute);
      else if (/\.mdx?$/i.test(entry.name)) files.push(absolute);
    }
  }

  await visit(root);
  return files.sort();
}

function posix(value) {
  return value.split(path.sep).join('/');
}

function countOccurrences(line, href) {
  let count = 0;
  let offset = 0;
  let index = line.indexOf(href, offset);

  while (index !== -1) {
    count += 1;
    offset = index + href.length;
    index = line.indexOf(href, offset);
  }

  return count;
}

function decode(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function comparisonKey(value) {
  return decode(String(value ?? ''))
    .toLowerCase()
    .replace(/\.html?$/i, '')
    .replace(/[^a-z0-9]+/g, '');
}

function candidatePages(fragmentIndex, targetRoot) {
  const candidates = [];

  for (const [route, page] of fragmentIndex.routes) {
    if (route === targetRoot || route.startsWith(`${targetRoot}/`)) {
      candidates.push({ ...page, route });
    }
  }

  const current = candidates.filter((candidate) =>
    candidate.targetPath.includes('/(current)/'),
  );
  return current.length > 0 ? current : candidates;
}

async function fragmentMatches(candidates, fragment, fragmentIndex) {
  const exactMatches = [];
  const fuzzyMatches = [];
  const requested = decode(fragment);
  const requestedLower = requested.toLowerCase();

  for (const candidate of candidates) {
    const anchors = await fragmentIndex.anchorsFor(candidate.route);
    if (!anchors) continue;
    const exact = [...anchors].find(
      (anchor) => anchor.toLowerCase() === requestedLower,
    );
    if (exact) {
      exactMatches.push({ anchor: exact, route: candidate.route });
      continue;
    }
    const fuzzy = findBestFragmentAnchor(anchors, requested);
    if (fuzzy) fuzzyMatches.push({ anchor: fuzzy, route: candidate.route });
  }

  return exactMatches.length > 0 ? exactMatches : fuzzyMatches;
}

export async function resolveLegacyApiReferenceHref(href, { fragmentIndex }) {
  let url;
  try {
    url = new URL(href, 'https://doc.shengwang.cn');
  } catch {
    return null;
  }

  const match = url.pathname.match(
    /^\/api-ref\/([^/]+)\/([^/]*)\/(?:API\/)?(.+)$/i,
  );
  if (!match) return null;

  const product = match[1].toLowerCase();
  const legacyPlatform = match[2].toLowerCase();
  const productRoute = LEGACY_PRODUCT_ROUTES.get(product);
  if (!productRoute || !legacyPlatform) return null;

  const platform = LEGACY_PLATFORM_ROUTES.get(legacyPlatform) ?? legacyPlatform;
  const targetRoot = `/zh-CN/api-reference/${productRoute}/${platform}`;
  const candidates = candidatePages(fragmentIndex, targetRoot);
  if (candidates.length === 0) return null;

  const legacyPage = match[3].split('/').at(-1);
  const pageKey = comparisonKey(legacyPage);
  const fileMatches = candidates.filter(
    (candidate) =>
      comparisonKey(
        path.posix.basename(
          candidate.targetPath,
          path.extname(candidate.targetPath),
        ),
      ) === pageKey,
  );
  const requestedFragment = url.hash ? decode(url.hash.slice(1)) : null;

  if (!requestedFragment && fileMatches.length === 1) {
    return fileMatches[0].route;
  }

  const requestedAnchor = requestedFragment ?? legacyPage;
  const preferredMatches = await fragmentMatches(
    fileMatches,
    requestedAnchor,
    fragmentIndex,
  );
  const matches =
    preferredMatches.length > 0
      ? preferredMatches
      : await fragmentMatches(candidates, requestedAnchor, fragmentIndex);

  return matches.length === 1
    ? `${matches[0].route}#${matches[0].anchor}`
    : null;
}

function exactOverrideForHref(href) {
  const exact = EXACT_LINK_OVERRIDES.get(href);
  if (exact) return exact;

  let url;
  try {
    url = new URL(href);
  } catch {
    return null;
  }
  if (
    url.hostname !== 'docs.agora.io' ||
    !url.pathname.startsWith('/cn/live-streaming-premium-legacy/')
  ) {
    return null;
  }

  const slug = url.pathname.split('/').at(-1)?.toLowerCase() ?? '';
  return (
    RTC_GUIDE_OVERRIDES.find(([prefix]) => slug.startsWith(prefix))?.[1] ?? null
  );
}

async function validateLocalFragment(href, fragmentIndex) {
  if (!href.startsWith('/zh-CN/') || !href.includes('#')) return href;
  const hashIndex = href.indexOf('#');
  const route = href.slice(0, hashIndex).replace(/\/$/, '');
  const requested = decode(href.slice(hashIndex + 1));
  const anchors = await fragmentIndex.anchorsFor(route);
  if (!anchors) return null;
  const mapped = findBestFragmentAnchor(anchors, requested);
  return mapped ? `${route}#${mapped}` : null;
}

async function resolveLegacyHref(href, { fragmentIndex, routeMap }) {
  let targetHref = exactOverrideForHref(href);

  if (!targetHref) {
    targetHref = await resolveLegacyApiReferenceHref(href, { fragmentIndex });
  }

  if (!targetHref) {
    const mapped = rewriteLegacyHref(href, {
      routeMap,
      sourceUrl: 'https://doc.shengwang.cn',
    });
    if (mapped.warning) return null;
    targetHref = mapped.href;
  }

  return targetHref ? validateLocalFragment(targetHref, fragmentIndex) : null;
}

async function rewriteResolvableLinks(
  source,
  { cache, fragmentIndex, routeMap, sourcePath },
) {
  const changes = [];
  let pending = source;
  const hrefs = new Set(
    findLegacyBodyLinks(source, { sourcePath }).map((link) => link.href),
  );

  for (const href of hrefs) {
    if (!cache.has(href)) {
      cache.set(href, resolveLegacyHref(href, { fragmentIndex, routeMap }));
    }
    const targetHref = await cache.get(href);
    if (!targetHref) continue;

    const rewritten = reconcileMappedBodyLink(pending, {
      fromHref: href,
      sourcePath,
      toHref: targetHref,
    });
    pending = rewritten.source;
    changes.push(...rewritten.changes);
  }

  return { changes, source: pending };
}

function unresolvedLocations(source, sourcePath, links) {
  const remainingByHref = new Map();

  for (const link of links) {
    remainingByHref.set(link.href, (remainingByHref.get(link.href) ?? 0) + 1);
  }

  const locations = [];
  const lines = source.split(/\r?\n/);

  for (const [index, line] of lines.entries()) {
    for (const [href, remaining] of remainingByHref) {
      if (remaining === 0 || !line.includes(href)) continue;
      const found = Math.min(remaining, countOccurrences(line, href));

      for (let occurrence = 0; occurrence < found; occurrence += 1) {
        locations.push({ href, line: index + 1, sourcePath });
      }

      remainingByHref.set(href, remaining - found);
    }
  }

  return locations;
}

function escapeTableCell(value) {
  return String(value).replaceAll('|', '\\|');
}

function renderReport(entries) {
  const legacyHostLinks = entries.filter((entry) =>
    /^https?:\/\/(?:doc|docportal)\.shengwang\.cn/i.test(entry.href),
  ).length;
  const lines = [
    '# CN API unresolved links',
    '',
    '> Generated by `bun run docs:links:cn-api:normalize`. Do not edit by hand.',
    '',
    `- Unresolved link occurrences: ${entries.length}`,
    `- Remaining Shengwang legacy doc-host links: ${legacyHostLinks}`,
    `- Missing local anchor occurrences: ${entries.filter((entry) => entry.reason === 'missing-local-anchor').length}`,
    '',
    'These links have no exact migrated target or local anchor. They are preserved for content-owner review instead of being deleted or redirected to an approximate page.',
    '',
    '## Locations',
    '',
  ];

  if (entries.length === 0) {
    lines.push('- None.', '');
    return `${lines.join('\n')}\n`;
  }

  lines.push('| Location | Link | Reason |', '| --- | --- | --- |');
  for (const entry of entries) {
    lines.push(
      `| \`${escapeTableCell(entry.sourcePath)}:${entry.line}\` | \`${escapeTableCell(entry.href)}\` | ${entry.reason} |`,
    );
  }
  lines.push('');
  return `${lines.join('\n')}\n`;
}

async function buildRouteMap(repoRoot) {
  const manifest = JSON.parse(
    await fs.readFile(
      path.join(repoRoot, 'docs/migration/api-center-html-manifest.json'),
      'utf8',
    ),
  );
  const pathMapRows = parseCsv(
    await fs.readFile(
      path.join(repoRoot, 'docs/migration/path-map.csv'),
      'utf8',
    ),
  );

  return buildLegacyRouteMap(
    manifest,
    pathMapRows,
    await loadFaqMappingRows(repoRoot),
  );
}

async function collectUnresolved(files, repoRoot) {
  const entries = [];

  for (const absolute of files) {
    const source = await fs.readFile(absolute, 'utf8');
    const sourcePath = posix(path.relative(repoRoot, absolute));
    const links = findLegacyBodyLinks(source, { sourcePath });
    entries.push(...unresolvedLocations(source, sourcePath, links));
  }

  return entries.sort(
    (left, right) =>
      left.sourcePath.localeCompare(right.sourcePath) ||
      left.line - right.line ||
      left.href.localeCompare(right.href),
  );
}

function addAliasRequest(aliasRequests, href, sourceRoute, fragmentIndex) {
  const hashIndex = href.indexOf('#');
  if (hashIndex < 0) return;
  const route = href.startsWith('#')
    ? sourceRoute
    : href.slice(0, hashIndex).replace(/\/$/, '');
  const page = fragmentIndex.routes.get(route);
  if (!page) return;
  const requested = decode(href.slice(hashIndex + 1));
  if (!requested) return;
  const requests = aliasRequests.get(page.targetPath) ?? new Set();
  requests.add(requested);
  aliasRequests.set(page.targetPath, requests);
}

async function collectUnresolvedFragments(files, repoRoot, fragmentIndex) {
  const entries = [];

  for (const absolute of files) {
    const sourcePath = posix(path.relative(repoRoot, absolute));
    const source = await fs.readFile(absolute, 'utf8');
    const fragments = await rewriteLocalFragmentLinks(source, {
      fragmentIndex,
      preserveUnresolved: true,
      sourceRoute: targetPathToRoute(sourcePath),
    });
    entries.push(
      ...unresolvedLocations(
        source,
        sourcePath,
        fragments.warnings
          .filter((warning) => warning.unresolved)
          .map((warning) => ({ href: warning.from })),
      ).map((entry) => ({ ...entry, reason: 'missing-local-anchor' })),
    );
  }

  return entries;
}

export async function normalizeCnApiLinks({
  mode = 'write',
  repoRoot = process.cwd(),
  reportPath = REPORT_PATH,
} = {}) {
  const root = path.resolve(repoRoot);
  const files = await listMarkdownFiles(path.join(root, 'content/docs/zh-CN'));
  const routeMap = await buildRouteMap(root);
  const fragmentIndex = await buildLocalFragmentIndex({ repoRoot: root });
  const fallbackCache = new Map();
  const aliasRequests = new Map();
  const changedFiles = new Set();
  let rewrittenLinks = 0;
  let normalizedFragments = 0;
  let insertedAliases = 0;

  for (const absolute of files) {
    const sourcePath = posix(path.relative(root, absolute));
    const current = await fs.readFile(absolute, 'utf8');
    const rewritten = await rewriteResolvableLinks(current, {
      cache: fallbackCache,
      fragmentIndex,
      routeMap,
      sourcePath,
    });
    const fragments = await rewriteLocalFragmentLinks(rewritten.source, {
      fragmentIndex,
      preserveUnresolved: true,
      sourceRoute: targetPathToRoute(sourcePath),
    });
    const pending = fragments.body;
    normalizedFragments += fragments.warnings.filter(
      (warning) => !warning.unresolved,
    ).length;
    for (const warning of fragments.warnings.filter(
      (warning) => warning.unresolved,
    )) {
      addAliasRequest(
        aliasRequests,
        warning.from,
        targetPathToRoute(sourcePath),
        fragmentIndex,
      );
    }

    if (pending === current) continue;
    changedFiles.add(sourcePath);
    rewrittenLinks += rewritten.changes.length;

    if (mode === 'write') await fs.writeFile(absolute, pending);
  }

  for (const [targetPath, requests] of aliasRequests) {
    const absolute = path.join(root, targetPath);
    const current = await fs.readFile(absolute, 'utf8');
    const aliases = insertFragmentAliases(current, requests);
    if (aliases.body === current) continue;
    changedFiles.add(targetPath);
    insertedAliases += aliases.inserted.length;
    if (mode === 'write') await fs.writeFile(absolute, aliases.body);
  }

  if (mode === 'check' && changedFiles.size > 0) {
    throw new Error(
      `${changedFiles.size} Chinese docs files still contain resolvable API or anchor links.`,
    );
  }

  const finalFragmentIndex = await buildLocalFragmentIndex({ repoRoot: root });
  const unresolvedFragments = await collectUnresolvedFragments(
    files,
    root,
    finalFragmentIndex,
  );
  const unresolved = [
    ...(await collectUnresolved(files, root)).map((entry) => ({
      ...entry,
      reason: 'no-exact-migrated-target',
    })),
    ...unresolvedFragments,
  ].sort(
    (left, right) =>
      left.sourcePath.localeCompare(right.sourcePath) ||
      left.line - right.line ||
      left.href.localeCompare(right.href),
  );
  const report = renderReport(unresolved);
  const reportAbsolute = path.join(root, reportPath);

  if (mode === 'check') {
    const currentReport = await fs.readFile(reportAbsolute, 'utf8');
    if (currentReport !== report) {
      throw new Error(
        `Generated unresolved-link report is stale: ${reportPath}`,
      );
    }
  } else {
    await fs.mkdir(path.dirname(reportAbsolute), { recursive: true });
    await fs.writeFile(reportAbsolute, report);
  }

  return {
    changedFiles: [...changedFiles],
    insertedAliases,
    normalizedFragments,
    rewrittenLinks,
    unresolved,
  };
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) ===
    path.resolve(fileURLToPath(import.meta.url));

if (isMain) {
  try {
    const result = await normalizeCnApiLinks(parseArgs(process.argv.slice(2)));
    console.log(
      `CN API links: ${result.rewrittenLinks} legacy links, ${result.normalizedFragments} fragments, and ${result.insertedAliases} aliases rewritten in ${result.changedFiles.length} files; ${result.unresolved.length} unresolved links remain.`,
    );
  } catch (error) {
    console.error(`normalize-cn-api-links: ${error.message}`);
    process.exitCode = 1;
  }
}
