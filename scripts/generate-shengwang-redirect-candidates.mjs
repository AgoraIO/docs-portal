import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getOpenApiLanes } from '../src/lib/openapi/lanes.ts';
import {
  resolveLegacyDocSourcePath,
  resolveLegacyHtmlSourcePath,
  resolveOpenApiLegacyPath,
  resolveApiReferenceRoute,
  resolveProductIaRedirect,
  resolveProductLeafRoute,
} from './shengwang-redirect-resolvers.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const inputRoot = path.join(repoRoot, 'docs/migration/redirect-inputs');
const targetCommit = '32883e92e9';
const legacyCollectedAt = '2026-10-14';
const generatedAt = '2026-10-15';
const legacyInventoryPath = path.join(
  inputRoot,
  `legacy-url-inventory-${legacyCollectedAt}.json`,
);
const targetRoutesPath = path.join(
  inputRoot,
  `target-routes-${targetCommit}.json`,
);
const historicalPathMapPath = path.join(repoRoot, 'docs/migration/path-map.csv');
const faqMigrationMappingPath = path.join(
  repoRoot,
  'docs/migration/generated/zh-cn-faq-migration/mapping.json',
);
const productIaRedirectsPath = path.join(
  repoRoot,
  'src/lib/zh-cn-product-ia-redirects.ts',
);
const movedSolutionRedirectsPath = path.join(
  repoRoot,
  'src/lib/zh-cn-moved-solution-product-redirects.ts',
);
const manualOverridesPath = path.join(
  inputRoot,
  `legacy-url-map-overrides-${targetCommit}.csv`,
);
const PRODUCT_ROOTS = {
  aigc: '/zh-CN/ai/aigc',
  analytics: '/zh-CN/realtime-media/usage-analytics',
  'art-class': '/zh-CN/solutions/art-class',
  'breakout-classroom': '/zh-CN/solutions/breakout-classroom',
  chatroom: '/zh-CN/solutions/chatroom',
  'cloud-recording': '/zh-CN/realtime-media/cloud-recording',
  'cloud-transcoder': '/zh-CN/realtime-media/transcoding',
  'content-moderation': '/zh-CN/realtime-media/content-moderation',
  convoai: '/zh-CN/ai',
  'conversion-ppt': '/zh-CN/realtime-media/ppt-transcoding',
  'digital-learning': '/zh-CN/solutions/digital-learning',
  'flexible-classroom': '/zh-CN/solutions/flexible-classroom',
  'fusion-cdn': '/zh-CN/realtime-media/fusion-cdn',
  'game-voice': '/zh-CN/solutions/game-voice',
  'iot-apaas': '/zh-CN/solutions/iot-apaas',
  marketplace: '/zh-CN/realtime-media/marketplace',
  'media-pull': '/zh-CN/realtime-media/media-pull',
  'media-push': '/zh-CN/realtime-media/media-push',
  meeting: '/zh-CN/realtime-media/meeting',
  'online-ktv': '/zh-CN/solutions/online-ktv',
  'online-music-class': '/zh-CN/solutions/online-music-class',
  'one-to-one-classroom': '/zh-CN/solutions/one-to-one-classroom',
  'one-to-one-live': '/zh-CN/solutions/one-to-one-live',
  recording: '/zh-CN/realtime-media/local-server-recording',
  rtc: '/zh-CN/realtime-media/rtc',
  rtm2: '/zh-CN/realtime-media/rtm',
  'rtmp-gateway': '/zh-CN/realtime-media/rtmp-gateway',
  rtsa: '/zh-CN/realtime-media/rtsa',
  'rtc-server-sdk': '/zh-CN/realtime-media/rtc-server-sdk',
  'sdk-extension': '/zh-CN/realtime-media/sdk-extensions',
  showroom: '/zh-CN/solutions/showroom',
  'small-classroom': '/zh-CN/solutions/small-classroom',
  'smart-camera': '/zh-CN/solutions/smart-camera',
  'smart-doorbell': '/zh-CN/solutions/smart-doorbell',
  'smart-watch': '/zh-CN/solutions/smart-watch',
  'speech-to-text': '/zh-CN/realtime-media/speech-to-text',
  'status-page': '/zh-CN/realtime-media/status-page',
  teleoperation: '/zh-CN/solutions/teleoperation',
  toybox: '/zh-CN/ai/device-kit',
  'voip-callkit': '/zh-CN/solutions/voip-call',
  whiteboard: '/zh-CN/realtime-media/whiteboard',
};
const PRODUCT_IA_ROOTS = Object.assign(
  {
    analytics: 'realtime-media/usage-analytics',
    'art-class': 'solutions/art-class',
    'breakout-classroom': 'solutions/breakout-classroom',
    chatroom: 'solutions/chatroom',
    'cloud-recording': 'realtime-media/recording/cloud-recording',
    'cloud-transcoder': 'realtime-media/transcoding',
    'content-moderation': 'realtime-media/content-moderation',
    'conversion-ppt': 'solutions/ppt-transcoding',
    'digital-learning': 'solutions/digital-learning',
    'flexible-classroom': 'solutions/flexible-classroom',
    'fusion-cdn': 'realtime-media/fusion-cdn',
    'game-voice': 'solutions/game-voice',
    meeting: 'solutions/meeting',
    marketplace: 'realtime-media/marketplace',
    'media-pull': 'realtime-media/media-pull',
    'media-push': 'realtime-media/media-push',
    'online-ktv': 'realtime-media/online-ktv',
    'online-music-class': 'solutions/online-music-class',
    'one-to-one-classroom': 'solutions/one-to-one-classroom',
    'one-to-one-live': 'solutions/one-to-one-live',
    recording: 'realtime-media/recording/local-server-recording',
    rtc: 'realtime-media/rtc',
    rtm2: 'realtime-media/rtm',
    'rtmp-gateway': 'realtime-media/rtmp-gateway',
    rtsa: 'realtime-media/rtsa',
    'rtc-server-sdk': 'realtime-media/rtc-server-sdk',
    'sdk-extension': 'realtime-media/sdk-extensions',
    showroom: 'solutions/showroom',
    'small-classroom': 'solutions/small-classroom',
    'smart-camera': 'solutions/smart-camera',
    'smart-doorbell': 'solutions/smart-doorbell',
    'smart-watch': 'solutions/smart-watch',
    'speech-to-text': 'realtime-media/speech-to-text',
    'status-page': 'solutions/status-page',
    teleoperation: 'solutions/teleoperation',
    'voip-callkit': 'solutions/voip-call',
    whiteboard: 'realtime-media/whiteboard',
  },
  {
    platforms: new Set([
      'android',
      'cpp',
      'csharp',
      'electron',
      'flutter',
      'go',
      'harmonyos',
      'ios',
      'javascript',
      'macos',
      'mini-program',
      'python',
      'react',
      'restful',
      'rn',
      'swift',
      'typescript',
      'unity',
      'unreal-blueprint',
      'unreal-cpp',
      'web',
      'windows',
      'iot',
      'general',
      'c',
    ]),
  },
);
const outputJsonPath = path.join(
  inputRoot,
  `legacy-url-map-candidate-${targetCommit}-${generatedAt}.json`,
);
const outputCsvPath = path.join(
  inputRoot,
  `legacy-url-map-candidate-${targetCommit}-${generatedAt}.csv`,
);
const outputGroupsJsonPath = path.join(
  inputRoot,
  `legacy-url-review-groups-${targetCommit}-${generatedAt}.json`,
);
const outputGroupsCsvPath = path.join(
  inputRoot,
  `legacy-url-review-groups-${targetCommit}-${generatedAt}.csv`,
);

const legacyInventory = JSON.parse(await readFile(legacyInventoryPath, 'utf8'));
const targetRoutes = JSON.parse(await readFile(targetRoutesPath, 'utf8'));
const targetRouteSet = new Set(targetRoutes.map((route) => route.url));
const applicationRoutes = new Set(['/zh-CN/search']);
const historicalRows = parseCsv(await readFile(historicalPathMapPath, 'utf8'));
const currentSourceCandidates = await readCurrentSourceCandidates();
const openApiLegacyLanes = createOpenApiLegacyLanes();
const faqSourceTargets = await readFaqSourceTargets();
const productIaRedirectMap = await readProductIaRedirectMap();
const manualOverrides = parseCsv(await readFile(manualOverridesPath, 'utf8'));
const manualOverridesByPath = new Map(
  manualOverrides.map((row) => [normalizePath(row.legacyPath), row]),
);

const historicalCandidates = new Map();
for (const row of historicalRows) {
  if (row.redirect_status !== 'redirect' || !row.old_url || !row.new_url) {
    continue;
  }

  const key = normalizePath(row.old_url);
  const candidates = historicalCandidates.get(key) ?? [];
  candidates.push({
    target: normalizePath(row.new_url),
    source: 'historical-path-map',
    notes: row.redirect_notes || row.next_step || '',
  });
  historicalCandidates.set(key, candidates);
}

const records = legacyInventory.urls.map((legacyUrl) => {
  const legacyPath = normalizePath(legacyUrl);
  const manualOverride = manualOverridesByPath.get(legacyPath);
  if (manualOverride) {
    return makeRecord({
      legacyUrl,
      legacyPath,
      target: manualOverride.target,
      status: manualOverride.status,
      confidence: manualOverride.confidence,
      mappingType: manualOverride.mappingType,
      source: 'manual-override-table',
      notes: manualOverride.notes,
    });
  }

  const special = resolveSpecialRoute(legacyPath);
  if (special) {
    return makeRecord({
      legacyUrl,
      legacyPath,
      ...special,
    });
  }

  const currentSource = uniqueTargets(currentSourceCandidates.get(legacyPath) ?? []);
  if (currentSource.length === 1) {
    const [candidate] = currentSource;
    return makeRecord({
      legacyUrl,
      legacyPath,
      target: candidate.target,
      status: 'candidate',
      confidence: 'high',
      mappingType: 'current-sourceUrl-validated',
      source: candidate.source,
      notes: '当前目标 MDX 的 _migration.sourceUrl 指向该旧 URL',
    });
  }

  if (currentSource.length > 1) {
    return makeRecord({
      legacyUrl,
      legacyPath,
      status: 'manual-review',
      confidence: 'low',
      mappingType: 'ambiguous-current-sourceUrl',
      source: 'current-content-frontmatter',
      notes: `当前目标内容声明了多个目标：${currentSource
        .map((item) => item.target)
        .join(' | ')}`,
    });
  }

  const apiReferenceTarget = resolveApiReferenceRoute(legacyPath, targetRouteSet);
  if (apiReferenceTarget && hasTarget(apiReferenceTarget)) {
    return makeRecord({
      legacyUrl,
      legacyPath,
      target: apiReferenceTarget,
      status: 'candidate',
      confidence: 'high',
      mappingType: 'api-reference-route-normalized',
      source: 'current-target-route-inventory',
      notes: '旧 API 产品、平台或生成页面命名经过规范化后唯一匹配当前 API 路由',
    });
  }

  const openApiTarget = resolveOpenApiLegacyPath(legacyPath, openApiLegacyLanes);
  if (openApiTarget && hasTarget(openApiTarget)) {
    return makeRecord({
      legacyUrl,
      legacyPath,
      target: openApiTarget,
      status: 'candidate',
      confidence: 'high',
      mappingType: 'openapi-operationId-validated',
      source: 'current-openapi-registry',
      notes: '旧 operations 路径通过当前 OpenAPI lane 和 operationId 解析',
    });
  }

  const productIaTarget = resolveProductIaRedirect(
    legacyPath,
    targetRouteSet,
    productIaRedirectMap,
    PRODUCT_IA_ROOTS,
  );
  if (productIaTarget && hasTarget(productIaTarget)) {
    return makeRecord({
      legacyUrl,
      legacyPath,
      target: productIaTarget,
      status: 'candidate',
      confidence: 'high',
      mappingType: 'product-ia-redirect-validated',
      source: 'current-product-ia-redirects',
      notes: '旧产品 IA 路径通过现有产品重定向表解析到当前目标路由',
    });
  }

  const productLeafTarget = resolveProductLeafRoute(
    legacyPath,
    targetRouteSet,
    PRODUCT_ROOTS,
  );
  if (productLeafTarget) {
    return makeRecord({
      legacyUrl,
      legacyPath,
      target: productLeafTarget,
      status: 'candidate',
      confidence: 'medium',
      mappingType: 'product-root-leaf-validated',
      source: 'current-target-route-inventory',
      notes: '旧产品根路径和页面叶子 slug 在当前目标路由中唯一匹配',
    });
  }

  const historical = uniqueTargets(historicalCandidates.get(legacyPath) ?? []);
  if (historical.length === 1) {
    const [candidate] = historical;
    const targetExists = hasTarget(candidate.target);
    return makeRecord({
      legacyUrl,
      legacyPath,
      target: targetExists ? candidate.target : '',
      status: targetExists ? 'candidate' : 'manual-review',
      confidence: targetExists ? 'medium' : 'low',
      mappingType: targetExists
        ? 'historical-seed-validated'
        : 'historical-target-missing',
      source: candidate.source,
      notes: targetExists
        ? candidate.notes
        : `历史候选目标 ${candidate.target} 不存在于当前 commit 的目标路由清单`,
    });
  }

  if (historical.length > 1) {
    return makeRecord({
      legacyUrl,
      legacyPath,
      status: 'manual-review',
      confidence: 'low',
      mappingType: 'ambiguous-historical-seed',
      source: 'historical-path-map',
      notes: `历史候选目标存在冲突：${historical.map((item) => item.target).join(' | ')}`,
    });
  }

  return makeRecord({
    legacyUrl,
    legacyPath,
    status: 'manual-review',
    confidence: 'low',
    mappingType: 'no-candidate',
    source: 'none',
    notes: '当前目标路由清单和历史候选映射均未找到目标',
  });
});

const summary = summarize(records);
const reviewGroups = createReviewGroups(records);
const output = {
  generatedAt,
  targetCommit,
  legacySitemap: legacyInventory.sitemapUrl,
  legacyCollectedAt: legacyInventory.collectedAt,
  targetRouteSnapshot: path.relative(repoRoot, targetRoutesPath),
  historicalSeed: path.relative(repoRoot, historicalPathMapPath),
  summary,
  reviewGroupCount: reviewGroups.length,
  records,
  reviewGroups,
};

await writeFile(outputJsonPath, `${JSON.stringify(output, null, 2)}\n`);
await writeFile(outputCsvPath, toCsv(records));
await writeFile(
  outputGroupsJsonPath,
  `${JSON.stringify({ generatedAt, targetCommit, groups: reviewGroups }, null, 2)}\n`,
);
await writeFile(outputGroupsCsvPath, toGroupsCsv(reviewGroups));

console.log(
  JSON.stringify(
    {
      outputJsonPath,
      outputCsvPath,
      outputGroupsJsonPath,
      outputGroupsCsvPath,
      summary,
      reviewGroupCount: reviewGroups.length,
    },
    null,
    2,
  ),
);

function makeRecord({
  legacyUrl,
  legacyPath,
  target = '',
  status,
  confidence,
  mappingType,
  source,
  notes = '',
}) {
  return {
    legacyUrl,
    legacyPath,
    legacyFamily: legacyPath.split('/')[1] || '/',
    target,
    status,
    confidence,
    mappingType,
    source,
    targetExists: target ? hasTarget(target) : false,
    preserveQuery: false,
    notes,
  };
}

function resolveSpecialRoute(legacyPath) {
  const exact = new Map([
    ['/', ['/zh-CN/introduction', 'root-to-introduction']],
    ['/search', ['/zh-CN/search', 'search-to-cn-search']],
    ['/api-center', ['/zh-CN/api-reference/api', 'api-center-to-api-reference']],
    ['/codebox', ['/zh-CN/reference/demo', 'codebox-to-demo']],
    ['/codebox/detail', ['/zh-CN/reference/demo', 'codebox-detail-to-demo']],
    ['/faq/list', ['/zh-CN/reference/faq', 'faq-list-to-faq-hub']],
    ['/basics/glossary', ['/zh-CN/introduction/glossary', 'basics-glossary']],
    ['/doc/marketplace/homepage', ['/zh-CN/realtime-media/marketplace', 'marketplace-homepage']],
    ['/doc/rtc/homepage', ['/zh-CN/realtime-media/rtc', 'rtc-homepage']],
    ['/doc/rtm2/homepage', ['/zh-CN/realtime-media/rtm', 'rtm-homepage']],
    [
      '/doc/rtc-server-sdk/java/resources',
      ['/zh-CN/realtime-media/rtc-server-sdk/reference/downloads', 'rtc-server-sdk-resources'],
    ],
    [
      '/doc/recording/java/resources',
      ['/zh-CN/realtime-media/local-server-recording/reference/downloads', 'recording-resources'],
    ],
    [
      '/doc/cloud-recording/restful/get-started/quick-start-java',
      ['/zh-CN/realtime-media/cloud-recording/get-started/quick-start', 'cloud-recording-java-quickstart'],
    ],
    [
      '/doc/cloud-recording/restful/user-guides/individual-mode/legacy-set-individual',
      ['/zh-CN/realtime-media/cloud-recording/build/recording-modes/individual-mode/set-individual', 'cloud-recording-legacy-individual'],
    ],
    [
      '/doc/cloud-recording/restful/user-guides/manage-file/legacy-introduce-recorded-files',
      ['/zh-CN/realtime-media/cloud-recording/build/manage-recorded-files/introduce-recorded-files', 'cloud-recording-legacy-files'],
    ],
    [
      '/doc/smart-doorbell/iot/apaas/apaas-overview',
      ['/zh-CN/solutions/smart-doorbell/build/paas-overview', 'smart-doorbell-paas-overview'],
    ],
    ['/doc/toybox/iot/get-started/enable-service', ['/zh-CN/ai/device-kit/reference/enable-services', 'toybox-enable-service']],
    ['/doc/toybox/iot/get-started/run-r1', ['/zh-CN/ai/device-kit/build/run-r1-demo', 'toybox-run-r1']],
    ['/doc/speech-to-text/restful/v7/operations/get', ['/zh-CN/api-reference/api-ref/speech-to-text/query', 'speech-to-text-query']],
    ['/doc/speech-to-text/restful/v7/operations/get-task-list', ['/zh-CN/api-reference/api-ref/speech-to-text/list', 'speech-to-text-list']],
  ]);

  const exactTarget = exact.get(legacyPath);
  if (exactTarget) {
    return specialResult(exactTarget[0], exactTarget[1]);
  }

  const convoAiRules = new Map([
    ['best-practice/geofencing', '/zh-CN/ai/build/harden-and-optimize/regional-restrictions'],
    ['best-practice/get-agent-state-through-rtm-message', '/zh-CN/ai/build/handle-runtime-events/get-agent-state'],
    ['best-practice/opt-latency', '/zh-CN/ai/build/harden-and-optimize/optimize-latency'],
    ['get-started/enable-service', '/zh-CN/ai/get-started/enable-service'],
    ['get-started/quick-start', '/zh-CN/ai/get-started/quick-start'],
    ['user-guides/audio-modality', '/zh-CN/ai/build/harden-and-optimize/audio-setup'],
    ['user-guides/custom-data', '/zh-CN/ai/build/shape-the-conversation/custom-information'],
    ['user-guides/manual-turn-control-through-rtm', '/zh-CN/ai/build/shape-the-conversation/manual-turn-control'],
  ]);
  if (legacyPath.startsWith('/doc/convoai/restful/')) {
    const suffix = legacyPath.slice('/doc/convoai/restful/'.length);
    const target = convoAiRules.get(suffix);
    if (target && hasTarget(target)) {
      return specialResult(target, 'convoai-ia-validated');
    }
  }

  if (legacyPath.startsWith('/doc/recording/java/')) {
    const suffix = legacyPath.slice('/doc/recording/java/'.length);
    const recordingTargets = {
      'best-practice/restore-files': '/zh-CN/realtime-media/local-server-recording/build/best-practices/restore-files',
      'legacy/restore-files': '/zh-CN/realtime-media/local-server-recording/build/legacy/restore-files',
      'legacy/set-layout': '/zh-CN/realtime-media/local-server-recording/build/legacy/set-layout',
      'legacy/watermark': '/zh-CN/realtime-media/local-server-recording/build/legacy/watermark',
      'user-guides/set-layout': '/zh-CN/realtime-media/local-server-recording/build/configure-recording-output/set-layout',
      'user-guides/watermark': '/zh-CN/realtime-media/local-server-recording/build/configure-recording-output/watermark',
    };
    const target = recordingTargets[suffix];
    if (target && hasTarget(target)) {
      return specialResult(target, 'recording-java-ia-validated');
    }
  }

  if (legacyPath.startsWith('/faq/')) {
    const faqSourceTarget = faqSourceTargets.get(legacyPath);
    if (faqSourceTarget && hasTarget(faqSourceTarget)) {
      return specialResult(faqSourceTarget, 'faq-source-mapping-validated');
    }

    const [, , category, ...slug] = legacyPath.split('/');
    const categoryMap = {
      'account-and-billing': 'account',
      'general-product-inquiry': 'product',
      'integration-issues': 'integration',
      'other-issues': 'other',
      'quality-issues': 'quality',
    };
    const targetCategory = categoryMap[category];
    if (targetCategory && slug.length > 0) {
      const target = `/zh-CN/reference/faq/${targetCategory}/${slug
        .join('/')
        .replaceAll('-', '_')}`;
      if (hasTarget(target)) {
        return specialResult(target, 'faq-category-slug-validated');
      }
    }
  }

  for (const slug of ['mcp-integrate', 'skills-integrate']) {
    if (legacyPath.endsWith(`/${slug}`)) {
      const target = `/zh-CN/introduction/${slug}`;
      if (hasTarget(target)) {
        return specialResult(target, `${slug}-to-introduction`);
      }
    }
  }

  if (legacyPath.startsWith('/basics/security/')) {
    const suffix = legacyPath.slice('/basics/security/'.length);
    const targets = [
      `/zh-CN/introduction/security/${suffix}`,
      `/zh-CN/introduction/security/sdk-compliance/${suffix}`,
    ];
    for (const target of targets) {
      if (hasTarget(target)) {
        return specialResult(target, 'basics-security-validated');
      }
    }
  }

  return null;
}

function specialResult(target, mappingType) {
  if (!hasTarget(target) && !applicationRoutes.has(target)) {
    return {
      target: '',
      status: 'manual-review',
      confidence: 'low',
      mappingType: `${mappingType}-target-missing`,
      source: 'deterministic-special-rule',
      notes: `特殊规则目标 ${target} 不存在于当前目标清单`,
    };
  }

  return {
    target,
    status: 'candidate',
    confidence: 'high',
    mappingType,
    source: 'deterministic-special-rule',
    notes: '目标存在于当前 commit 的目标路由或应用路由清单',
  };
}

function hasTarget(target) {
  const pathname = target.split('#', 1)[0];
  return targetRouteSet.has(pathname) || applicationRoutes.has(pathname);
}

async function readCurrentSourceCandidates() {
  const root = path.join(repoRoot, 'content/docs/zh-CN');
  const candidates = new Map();

  async function walk(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const filePath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        await walk(filePath);
        continue;
      }
      if (!entry.isFile() || !/\.(md|mdx)$/.test(entry.name)) continue;

      const content = await readFile(filePath, 'utf8');
      const target = sourceFileToRoute(filePath, root);
      if (!target || !hasTarget(target)) continue;

      for (const sourceUrl of extractSourceUrls(content)) {
        const legacyPath = normalizePath(sourceUrl);
        const values = candidates.get(legacyPath) ?? [];
        values.push({ target, source: 'current-content-frontmatter' });
        candidates.set(legacyPath, values);
      }

      for (const sourcePath of extractSourcePaths(content)) {
        const legacyPaths = [
          resolveLegacyHtmlSourcePath(sourcePath),
          resolveLegacyDocSourcePath(sourcePath),
        ].filter(Boolean);
        for (const legacyPath of legacyPaths) {
          const values = candidates.get(legacyPath) ?? [];
          values.push({ target, source: 'current-content-sourcePath' });
          candidates.set(legacyPath, values);
        }
      }
    }
  }

  await walk(root);
  return candidates;
}

async function readFaqSourceTargets() {
  const mapping = JSON.parse(await readFile(faqMigrationMappingPath, 'utf8'));
  const targets = new Map();
  for (const row of mapping.rows ?? []) {
    const category = row.categories?.[0];
    const sourceSlug = row.sourceSlug;
    if (!category || !sourceSlug || !row.targetPath) continue;

    const target = row.targetPath
      .replace(/^content\/docs\/zh-CN\//, '/zh-CN/')
      .replace('/api-reference/faq/', '/reference/faq/')
      .replace(/\.(?:md|mdx)$/, '')
      .replace(/\/index$/, '');
    targets.set(`/faq/${category}/${sourceSlug}`, target);
  }
  return targets;
}

async function readProductIaRedirectMap() {
  const map = new Map();
  const files = [productIaRedirectsPath, movedSolutionRedirectsPath];
  for (const filePath of files) {
    const content = await readFile(filePath, 'utf8');
    for (const match of content.matchAll(/'([^']+)'\s*:\s*'([^']+)'/g)) {
      const target = match[2].split('?')[0];
      map.set(match[1], target);
    }
  }
  return map;
}

function sourceFileToRoute(filePath, root) {
  const relative = path.relative(root, filePath).split(path.sep).join('/');
  const withoutExtension = relative.replace(/\.(?:md|mdx)$/, '');
  const normalized = withoutExtension
    .replaceAll('/(current)', '')
    .replace(/\/index$/, '');
  return `/zh-CN/${normalized}`;
}

function extractSourceUrls(content) {
  const urls = [];
  const pattern = /^\s*sourceUrl:\s*(?:(?:>[-+]?\s*)\n\s*)?["']?(https?:\/\/[^\s"']+)/gm;
  for (const match of content.matchAll(pattern)) {
    urls.push(match[1]);
  }
  const listPattern = /^\s*sourceUrls:\s*\n((?:\s+-\s+.*\n?)*)/gm;
  for (const match of content.matchAll(listPattern)) {
    for (const item of match[1].matchAll(/^\s+-\s+["']?(https?:\/\/[^\s"']+)/gm)) {
      urls.push(item[1]);
    }
  }
  return urls;
}

function extractSourcePaths(content) {
  const paths = [];
  const pattern = /^\s*sourcePath:\s*(?:(?:>[-+]?\s*)\n\s*)?["']?([^\s"']+)/gm;
  for (const match of content.matchAll(pattern)) paths.push(match[1]);
  return paths;
}

function createOpenApiLegacyLanes() {
  const aliases = {
    'agora-analytics-rest': 'analytics',
    'cloud-recording-rest': 'cloud-recording',
    'cloud-transcoding-rest': 'cloud-transcoder',
    'cloud-transcoding-rest-zh-cn': 'cloud-transcoder',
    'conversion-ppt': 'conversion-ppt',
    'fusion-cdn-rest': 'fusion-cdn',
    'media-gateway-rest': 'rtmp-gateway',
    'media-gateway-rest-zh-cn': 'rtmp-gateway',
    'ppt-conversion-rest': 'conversion-ppt',
    'rtc-rest': 'rtc',
    'rtc-rest-zh-cn': 'rtc',
    'speech-to-text-rest': 'speech-to-text',
  };

  const operationAliases = {
    'cloud-recording': {
      'post-v1-apps-appid-cloud_recording-acquire': 'acquire',
      'post-v1-apps-appid-cloud_recording-resourceid-resourceid-mode-mode-start':
        'start',
      'post-v1-apps-appid-cloud_recording-resourceid-resourceid-sid-sid-mode-mode-update':
        'update',
      'post-v1-apps-appid-cloud_recording-resourceid-resourceid-sid-sid-mode-mode-updateLayout':
        'update-layout',
      'get-v1-apps-appid-cloud_recording-resourceid-resourceid-sid-sid-mode-mode-query':
        'query',
      'post-v1-apps-appid-cloud_recording-resourceid-resourceid-sid-sid-mode-mode-stop':
        'stop',
      'get-v2-ncs-ip': 'get-ncs-ip',
    },
    rtc: {
      'post-dev-v1-kicking-rule': 'create-ban-rule',
      'delete-dev-v1-kicking-rule': 'delete-ban-rule',
      'get-dev-v1-kicking-rule': 'get-ban-rule-list',
      'put-dev-v1-kicking-rule': 'update-ban-expiration',
      'get-dev-v1-channel-user-appid-channelName': 'query-user-list',
      'get-dev-v1-channel-user-appid-channelName-hosts_only': 'query-host-list',
      'get-dev-v1-channel-appid': 'query-channel-list',
      'get-v2-ncs-ip': 'query-ip-address',
    },
  };

  return getOpenApiLanes().map((lane) => ({
    id: lane.id,
    legacyProduct: aliases[lane.id] ?? lane.id.replace(/-rest(?:-zh-cn)?$/, ''),
    routePrefix: lane.routePrefix,
    operations: lane.operations,
    operationAliases:
      operationAliases[
        aliases[lane.id] ?? lane.id.replace(/-rest(?:-zh-cn)?$/, '')
      ] ?? {},
  }));
}

function uniqueTargets(candidates) {
  const byTarget = new Map();
  for (const candidate of candidates) {
    const existing = byTarget.get(candidate.target);
    if (existing) {
      existing.notes = [existing.notes, candidate.notes].filter(Boolean).join('; ');
    } else {
      byTarget.set(candidate.target, { ...candidate });
    }
  }
  return Array.from(byTarget.values());
}

function normalizePath(value) {
  const parsed = new URL(value, 'https://legacy.invalid');
  let pathname = decodeURIComponent(parsed.pathname).replace(/\/+/g, '/');
  pathname = pathname.replace(/\.html$/, '');
  return pathname.replace(/\/$/, '') || '/';
}

function summarize(items) {
  const countBy = (key) =>
    Object.fromEntries(
      Object.entries(
        items.reduce((counts, item) => {
          counts[item[key]] = (counts[item[key]] ?? 0) + 1;
          return counts;
        }, {}),
      ).sort(([a], [b]) => a.localeCompare(b)),
    );

  return {
    total: items.length,
    targetExists: items.filter((item) => item.targetExists).length,
    candidate: items.filter((item) => item.status === 'candidate').length,
    manualReview: items.filter((item) => item.status === 'manual-review').length,
    byStatus: countBy('status'),
    byMappingType: countBy('mappingType'),
    byLegacyFamily: countBy('legacyFamily'),
  };
}

function createReviewGroups(items) {
  const groups = new Map();
  for (const item of items) {
    if (item.status !== 'manual-review') continue;

    const segments = item.legacyPath.split('/').filter(Boolean);
    const family = segments[0] ?? '/';
    const product = family === 'doc' || family === 'api-ref' ? segments[1] ?? '' : '';
    const platform = family === 'doc' || family === 'api-ref' ? segments[2] ?? '' : '';
    const key = [family, product, platform].join('|');
    const group = groups.get(key) ?? {
      groupKey: key,
      legacyFamily: family,
      oldProduct: product,
      oldPlatform: platform,
      rowCount: 0,
      mappingTypes: new Set(),
      samplePaths: [],
      suggestedAction: suggestGroupAction(item, family),
    };
    group.rowCount += 1;
    group.mappingTypes.add(item.mappingType);
    if (group.samplePaths.length < 5) group.samplePaths.push(item.legacyPath);
    groups.set(key, group);
  }

  return Array.from(groups.values())
    .map((group) => ({
      ...group,
      mappingTypes: Array.from(group.mappingTypes).sort(),
    }))
    .sort((a, b) => b.rowCount - a.rowCount || a.groupKey.localeCompare(b.groupKey));
}

function suggestGroupAction(item, family) {
  if (family === 'api-ref') {
    const path = item.legacyPath;
    if (/\/(?:API|classes|interfaces|modules|enums)\//.test(path)) {
      return 'decide-generated-sdk-api-policy';
    }
    return 'add-api-product-platform-rule';
  }
  if (family === 'doc') return 'add-product-ia-rule';
  if (family === 'faq') return 'review-faq-coverage';
  if (family === 'basics') return 'review-basics-merge';
  return 'manual-content-decision';
}

function toCsv(items) {
  const columns = [
    'legacyUrl',
    'legacyPath',
    'legacyFamily',
    'target',
    'status',
    'confidence',
    'mappingType',
    'source',
    'targetExists',
    'preserveQuery',
    'notes',
  ];
  return `${columns.join(',')}\n${items
    .map((item) => columns.map((column) => csvEscape(item[column])).join(','))
    .join('\n')}\n`;
}

function toGroupsCsv(groups) {
  const columns = [
    'groupKey',
    'legacyFamily',
    'oldProduct',
    'oldPlatform',
    'rowCount',
    'mappingTypes',
    'suggestedAction',
    'samplePaths',
  ];
  const rows = groups.map((group) =>
    columns
      .map((column) => {
        const value = Array.isArray(group[column])
          ? group[column].join(' | ')
          : group[column];
        return csvEscape(value);
      })
      .join(','),
  );
  return `${[columns.join(','), ...rows].join('\n')}\n`;
}

function csvEscape(value) {
  const text = String(value ?? '');
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function parseCsv(text) {
  const lines = [];
  let row = [];
  let cell = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (quoted) {
      if (char === '"' && next === '"') {
        cell += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ',') {
      row.push(cell);
      cell = '';
    } else if (char === '\n') {
      row.push(cell.replace(/\r$/, ''));
      lines.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    lines.push(row);
  }

  const [header, ...data] = lines;
  return data.map((values) =>
    Object.fromEntries(header.map((column, index) => [column, values[index] ?? ''])),
  );
}
