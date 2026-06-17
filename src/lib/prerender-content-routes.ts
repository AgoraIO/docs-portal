import { existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const DOCS_ROOT = 'content/docs';
const DOC_FILE_EXTENSION = /\.(md|mdx)$/;
const INDEX_FILE_NAME = /^index\.(md|mdx)$/;
const ROUTE_GROUP_SEGMENT = /^\(.+\)$/;

export function getContentDocsPrerenderPaths(
  root = DOCS_ROOT,
  options: { extraPrerenderPrefixes?: string[] } = {},
) {
  if (!existsSync(root)) {
    return [];
  }

  const extraPrerenderPrefixes =
    options.extraPrerenderPrefixes ??
    getExtraPrerenderPrefixes(process.env.DOCS_EXTRA_PRERENDER_PREFIXES);

  return walkDocFiles(root)
    .map((filePath) => getContentDocRoute(root, filePath))
    .filter((path): path is string => path !== null)
    .filter((route) =>
      shouldIncludeDocRouteInPrerender(route, extraPrerenderPrefixes),
    )
    .sort();
}

function walkDocFiles(root: string) {
  const files: string[] = [];
  const entries = readdirSync(root).sort();

  for (const entry of entries) {
    const entryPath = join(root, entry);
    const stats = statSync(entryPath);

    if (stats.isDirectory()) {
      files.push(...walkDocFiles(entryPath));
      continue;
    }

    if (stats.isFile() && DOC_FILE_EXTENSION.test(entry)) {
      files.push(entryPath);
    }
  }

  return files;
}

function getContentDocRoute(root: string, filePath: string) {
  const segments = relative(root, filePath).split(sep);
  const fileName = segments.at(-1);

  if (!fileName) {
    return null;
  }

  if (INDEX_FILE_NAME.test(fileName)) {
    segments.pop();
  } else {
    segments[segments.length - 1] = fileName.replace(DOC_FILE_EXTENSION, '');
  }

  return `/${segments.filter((segment) => segment && !ROUTE_GROUP_SEGMENT.test(segment)).join('/')}`;
}

function shouldIncludeDocRouteInPrerender(
  route: string,
  extraPrerenderPrefixes: string[],
) {
  if (matchesExtraPrerenderPrefix(route, extraPrerenderPrefixes)) {
    return true;
  }

  if (isRedirectOnlyAliasRoute(route)) {
    return false;
  }

  if (isLegacyBestPracticesRedirectRoute(route)) {
    return false;
  }

  if (isRtcAndroidApiReferenceRoute(route)) {
    return /^\/(en|zh-CN)\/api-reference\/rtc\/android$/.test(route);
  }

  if (isConversationalAiApiReferenceRoute(route)) {
    return isConversationalAiApiReferenceLandingRoute(route);
  }

  if (isAiModelsRoute(route)) {
    return isAiModelsLandingRoute(route);
  }

  if (isAiBuildRoute(route)) {
    return isAiBuildLandingRoute(route);
  }

  if (isAiStudioRoute(route)) {
    return isAiStudioLandingRoute(route);
  }

  if (isAiDeviceKitRoute(route)) {
    return isAiDeviceKitLandingRoute(route);
  }

  if (isRtmApiReferenceRoute(route)) {
    return isRtmApiReferenceLandingRoute(route);
  }

  if (isMeetingApiReferenceRoute(route)) {
    return isMeetingApiReferenceLandingRoute(route);
  }

  if (isWhiteboardApiReferenceRoute(route)) {
    return isWhiteboardApiReferenceLandingRoute(route);
  }

  if (isRecipesApiReferenceRoute(route)) {
    return isRecipesApiReferenceLandingRoute(route);
  }

  if (isMultiPlatformApiReferenceRoute(route)) {
    return isMultiPlatformApiReferenceLandingRoute(route);
  }

  if (isRealtimeMediaRtcRoute(route)) {
    return isRealtimeMediaRtcLandingRoute(route);
  }

  return true;
}

function matchesExtraPrerenderPrefix(
  route: string,
  extraPrerenderPrefixes: string[],
) {
  return extraPrerenderPrefixes.some((prefix) => {
    return route === prefix || route.startsWith(`${prefix}/`);
  });
}

function getExtraPrerenderPrefixes(value: string | undefined) {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map((prefix) => prefix.trim())
    .filter(Boolean)
    .map((prefix) => (prefix.startsWith('/') ? prefix : `/${prefix}`))
    .sort();
}

function isRedirectOnlyAliasRoute(route: string) {
  return (
    route === '/en/ai/conversational-ai' ||
    route === '/en/ai/choose-your-path/quickstart-coding' ||
    route === '/en/ai/device-kit' ||
    route === '/en/ai/choose-your-path/quickstart-device-kit' ||
    route === '/zh-CN/ai/device-kit' ||
    route === '/en/api-reference/voice-ai-recipes' ||
    route === '/zh-CN/api-reference/voice-ai-recipes' ||
    route === '/en/best-practices/audio-settings' ||
    route === '/zh-CN/best-practices/audio-settings' ||
    route === '/en/best-practices/opt-latency' ||
    route === '/zh-CN/best-practices/opt-latency' ||
    route === '/en/best-practices/http-basic-auth' ||
    route === '/zh-CN/best-practices/http-basic-auth'
  );
}

function isLegacyBestPracticesRedirectRoute(route: string) {
  return (
    route === '/en/best-practices/geofencing' ||
    route === '/zh-CN/best-practices/geofencing' ||
    route === '/zh-CN/best-practices/release-notes'
  );
}

function isRtcAndroidApiReferenceRoute(route: string) {
  if (!route.includes('/api-reference/rtc/android/')) {
    return false;
  }

  return true;
}

function isConversationalAiApiReferenceRoute(route: string) {
  return /^\/(en|zh-CN)\/api-reference\/conversational-ai(?:\/|$)/.test(route);
}

function isConversationalAiApiReferenceLandingRoute(route: string) {
  return /^\/(en|zh-CN)\/api-reference\/conversational-ai(?:\/(client-toolkit|rest-api(?:\/agent)?|server-sdk))?$/.test(
    route,
  );
}

function isAiModelsRoute(route: string) {
  return /^\/(en|zh-CN)\/ai\/models(?:\/|$)/.test(route);
}

function isAiModelsLandingRoute(route: string) {
  return /^\/(en|zh-CN)\/ai\/models(?:\/(asr|avatar|llm|mllm|tts))?$/.test(
    route,
  );
}

function isAiBuildRoute(route: string) {
  return /^\/(en|zh-CN)\/ai\/build(?:\/|$)/.test(route);
}

function isAiBuildLandingRoute(route: string) {
  return /^\/(en|zh-CN)\/ai\/build$/.test(route);
}

function isAiStudioRoute(route: string) {
  return /^\/en\/ai\/studio(?:\/|$)/.test(route);
}

function isAiStudioLandingRoute(route: string) {
  return /^\/en\/ai\/studio$/.test(route);
}

function isAiDeviceKitRoute(route: string) {
  return /^\/(en|zh-CN)\/ai\/device-kit(?:\/|$)/.test(route);
}

function isAiDeviceKitLandingRoute(route: string) {
  return /^\/(en|zh-CN)\/ai\/device-kit$/.test(route);
}

function isRtmApiReferenceRoute(route: string) {
  return /^\/(en|zh-CN)\/api-reference\/rtm(?:\/|$)/.test(route);
}

function isRtmApiReferenceLandingRoute(route: string) {
  return /^\/(en|zh-CN)\/api-reference\/rtm$/.test(route);
}

function isMeetingApiReferenceRoute(route: string) {
  return /^\/en\/api-reference\/meeting(?:\/|$)/.test(route);
}

function isMeetingApiReferenceLandingRoute(route: string) {
  return /^\/en\/api-reference\/meeting$/.test(route);
}

function isWhiteboardApiReferenceRoute(route: string) {
  return /^\/(en|zh-CN)\/api-reference\/whiteboard(?:\/|$)/.test(route);
}

function isWhiteboardApiReferenceLandingRoute(route: string) {
  return /^\/(en|zh-CN)\/api-reference\/whiteboard$/.test(route);
}

function isRecipesApiReferenceRoute(route: string) {
  return /^\/(en|zh-CN)\/api-reference\/recipes(?:\/|$)/.test(route);
}

function isRecipesApiReferenceLandingRoute(route: string) {
  return /^\/(en|zh-CN)\/api-reference\/recipes$/.test(route);
}

function isMultiPlatformApiReferenceRoute(route: string) {
  return /^\/en\/api-reference\/(im|micro-calling|online-art-teaching|online-ktv|online-music-teaching|private-room|rtc-server-sdk|rtsa)(?:\/|$)/.test(
    route,
  );
}

function isMultiPlatformApiReferenceLandingRoute(route: string) {
  return /^\/en\/api-reference\/(im|micro-calling|online-art-teaching|online-ktv|online-music-teaching|private-room|rtc-server-sdk|rtsa)$/.test(
    route,
  );
}

function isRealtimeMediaRtcRoute(route: string) {
  return /^\/(en|zh-CN)\/realtime-media\/rtc(?:\/|$)/.test(route);
}

function isRealtimeMediaRtcLandingRoute(route: string) {
  return /^\/(en|zh-CN)\/realtime-media\/rtc(?:\/(android|macOS))?$/.test(
    route,
  );
}
