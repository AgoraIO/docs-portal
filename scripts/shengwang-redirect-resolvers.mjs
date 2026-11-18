const LEGACY_PLATFORMS = new Set([
  'android',
  'cpp',
  'csharp',
  'electron',
  'flutter',
  'go',
  'harmonyos',
  'ios',
  'java',
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
]);

export function resolveProductLeafRoute(legacyPath, targetRoutes, productRoots) {
  const segments = legacyPath.split('/').filter(Boolean);
  if (segments[0] !== 'doc' || segments.length < 3) return null;

  const root = productRoots[segments[1]];
  if (!root) return null;

  const rest = segments.slice(2);
  if (LEGACY_PLATFORMS.has(rest[0]) || ['general', 'iot'].includes(rest[0])) {
    rest.shift();
  }
  const leaf = rest.at(-1);
  if (['landing-page', 'product-overview', 'product', 'introduction'].includes(leaf)) {
    const nestedParts = rest[0] === 'overview' ? rest.slice(0, -2) : rest.slice(0, -1);
    const nestedRoot = [root, ...nestedParts].join('/');
    if (targetRoutes.has(nestedRoot)) return nestedRoot;
  }

  const exactRootLeaf = `${root}/${leaf}`;
  if (targetRoutes.has(exactRootLeaf)) return exactRootLeaf;

  const matches = Array.from(targetRoutes).filter(
    (route) => route.startsWith(`${root}/`) && route.endsWith(`/${leaf}`),
  );
  return matches.length === 1 ? matches[0] : null;
}

export function resolveLegacyDocSourcePath(sourcePath) {
  const normalized = sourcePath.replaceAll('\\', '/');
  const match = normalized.match(/^docs\/([^/]+)\/(.+)$/i);
  if (!match) return null;

  const [, product, rest] = match;
  const parts = rest.split('/');
  let file = parts.pop() ?? '';
  file = file.replace(/\.(?:md|mdx)$/i, '');

  const platforms = [];
  const fileParts = file.split('.');
  while (fileParts.length > 1 && LEGACY_PLATFORMS.has(fileParts.at(-1))) {
    platforms.unshift(fileParts.pop());
  }
  file = fileParts.join('.');

  if (platforms.length === 0) return null;

  return `/doc/${[product, ...platforms, ...parts, file]
    .filter(Boolean)
    .join('/')}`;
}

export function resolveLegacyHtmlSourcePath(sourcePath) {
  const normalized = sourcePath.replaceAll('\\', '/');
  const match = normalized.match(
    /^html-docs\/([^/]+)\/([^/]+)\/(.+?)(?:\.html)?$/i,
  );
  if (!match) return null;

  const [, product, platform, rest] = match;
  return `/api-ref/${product}/${platform.toLowerCase()}/${rest.replace(/\.html$/i, '')}`;
}

export function resolveOpenApiLegacyPath(legacyPath, lanes) {
  const segments = legacyPath.split('/').filter(Boolean);
  if (segments.length < 4 || segments[0] !== 'doc') return null;

  const product = segments[1];
  const operationIndex = segments.indexOf('operations');
  if (operationIndex === -1 || operationIndex === segments.length - 1) {
    return null;
  }

  const operationPath = segments.slice(operationIndex + 1).join('/');
  const matchingLanes = lanes.filter(
    (candidate) =>
      candidate.id === product || candidate.legacyProduct === product,
  );
  const lane = matchingLanes.find(
    (candidate) =>
      candidate.operations[operationPath] ||
      candidate.operationAliases?.[operationPath],
  );
  if (!lane) return null;

  const operation = lane.operations[operationPath] ??
    (lane.operationAliases?.[operationPath]
      ? { routeLeaf: lane.operationAliases[operationPath] }
      : null);
  if (!operation) return null;

  return `/zh-CN/${lane.routePrefix}/${operation.routeLeaf}`;
}

const API_PRODUCT_ALIASES = {
  convoai: 'conversational-ai',
  recording: 'local-server-recording',
  rtm2: 'rtm',
};

const API_PLATFORM_ALIASES = {
  cpp: 'cpp-all-platforms',
  csharp: 'csharp-windows',
  javascript: 'web',
  rn: 'react-native',
};

const RTC_TOC_TARGETS = {
  toc_audio: 'audio/audio-basic',
  toc_audio_prenpost: 'audio/audio-prenpost/audio-effect',
  toc_cloud_media_relay: 'cloud-media-relay/channel-media-relay',
  toc_device_management: 'device-management/audio-device',
  toc_mediaplayer: 'play/mediaplayer/mediaplayer-initialize',
  toc_metadata: 'metadata/metadata-observer',
  toc_mobile_camera: 'video/camera-capture',
  toc_pc_audio_device_management: 'device-management/audio-device',
  toc_play: 'play/audio-effect-file',
  toc_video: 'video/video-basic',
  toc_video_codec: 'video/video-encoded',
  toc_video_prenpro: 'video/video-prenpro/virtualbackground',
};

const GENERATED_API_SUFFIXES =
  /\.(?:android|ios|cpp|go|java|python|typescript|javascript|csharp|swift|harmonyos)$/;

export function resolveApiReferenceRoute(legacyPath, targetRoutes) {
  const segments = legacyPath.split('/').filter(Boolean);
  if (segments[0] !== 'api-ref' || segments.length < 4) return null;

  const product = API_PRODUCT_ALIASES[segments[1]] ?? segments[1];
  const platform = resolveApiPlatform(segments[1], segments[2]);
  const legacyLeaf = normalizeApiLeaf(segments.at(-1));

  if (segments[1] === 'rtc' && segments.at(-1)?.startsWith('toc_')) {
    const tocTarget = RTC_TOC_TARGETS[segments.at(-1)];
    const targetPlatform = resolveApiPlatform(segments[1], segments[2]);
    if (tocTarget && targetPlatform !== 'windows') {
      const target = `/zh-CN/api-reference/rtc/${targetPlatform}/${tocTarget}`;
      if (targetRoutes.has(target)) return target;
    }
  }
  const matches = Array.from(targetRoutes).filter((route) => {
    const targetSegments = route.split('/').filter(Boolean);
    if (targetSegments[1] !== 'api-reference' || targetSegments[2] !== product) {
      return false;
    }
    if (platform && !targetSegments.includes(platform)) return false;
    return normalizeApiLeaf(targetSegments.at(-1)) === legacyLeaf;
  });

  if (matches.length === 1) return matches[0];
  if (matches.length > 1) {
    const unversioned = matches.filter(
      (route) => !route.split('/').some((segment) => /^\d+\.\d+/.test(segment)),
    );
    if (unversioned.length === 1) return unversioned[0];
    if (unversioned.length > 1) {
      return [...unversioned].sort((left, right) => left.length - right.length)[0];
    }
  }

  if (segments[1] === 'convoai' && segments[2].startsWith('agent-')) {
    const target = `/zh-CN/api-reference/conversational-ai/${segments[2]}`;
    return targetRoutes.has(target) ? target : null;
  }

  if (
    segments[1] === 'rtc-server-sdk' &&
    ['go', 'java', 'python'].includes(segments[2]) &&
    segments.at(-1) === 'error-code'
  ) {
    const target = '/zh-CN/api-reference/rtc-server-sdk/error-code';
    return targetRoutes.has(target) ? target : null;
  }

  if (
    segments[1] === 'rtc' &&
    ['csharp', 'javascript', 'mini-program', 'react'].includes(segments[2]) &&
    segments.at(-1) === 'error-code'
  ) {
    const target = '/zh-CN/api-reference/rtc/error-code';
    return targetRoutes.has(target) ? target : null;
  }

  if (
    segments[1] === 'flexible-classroom' &&
    segments[2] === 'electron' &&
    segments.at(-1) === 'fcr-ui-scene'
  ) {
    const target =
      '/zh-CN/api-reference/flexible-classroom/web/api-reference/fcr-ui-scene';
    return targetRoutes.has(target) ? target : null;
  }

  return null;
}

function resolveApiPlatform(product, platform) {
  if (product === 'recording') return platform;
  if (product === 'rtm2') {
    return { javascript: 'web', rn: 'react-native' }[platform] ?? platform;
  }
  if (product === 'convoai') {
    return {
      go: 'restclient-go',
      java: 'restclient-java',
      typescript: 'web',
    }[platform] ?? API_PLATFORM_ALIASES[platform] ?? platform;
  }
  return API_PLATFORM_ALIASES[platform] ?? platform;
}

function normalizeApiLeaf(value) {
  return value
    .toLowerCase()
    .replace(GENERATED_API_SUFFIXES, '')
    .replaceAll('_', '')
    .replaceAll('-', '')
    .replace(/[^a-z0-9]/g, '');
}

export function resolveProductIaRedirect(
  legacyPath,
  targetRoutes,
  redirectMap,
  productIaRoots,
) {
  const segments = legacyPath.split('/').filter(Boolean);
  if (segments[0] !== 'doc' || segments.length < 3) return null;

  const root = productIaRoots[segments[1]];
  if (!root) return null;

  const rest = [...segments.slice(2)];
  if (productIaRoots.platforms.has(rest[0])) rest.shift();
  const keys = [`${root}/${rest.join('/')}`];
  const suffix = rest.join('/');
  if (suffix === 'landing-page') {
    keys.push(`${root}/overview/product-overview`, `${root}/product-overview`);
  }
  if (suffix === 'overview/product' || suffix === 'overview') {
    keys.push(`${root}/overview/product-overview`, `${root}/product-overview`);
  }

  const matches = [];
  for (const key of keys) {
    const target = redirectMap.get(key);
    if (target && targetRoutes.has(target)) matches.push(target);
  }
  return [...new Set(matches)].length === 1 ? [...new Set(matches)][0] : null;
}
